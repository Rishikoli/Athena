import vertexai
from vertexai.language_models import TextEmbeddingInput, TextEmbeddingModel
from sqlalchemy.orm import Session
from app.db.models import WorkflowMemory
from app.core.config import settings
from google.cloud import discoveryengine_v1 as discoveryengine

import logging
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def get_embedding(text: str) -> list[float]:
    """Generates an embedding for text, with exponential backoff retries."""
    try:
        model = TextEmbeddingModel.from_pretrained("text-embedding-004")
        inputs = [TextEmbeddingInput(text=text, task_type="RETRIEVAL_DOCUMENT")]
        embeddings = model.get_embeddings(inputs)
        return embeddings[0].values
    except Exception as e:
        logger.error(f"Vertex AI embedding failed: {e}. Retrying...")
        raise

def save_memory(db: Session, text: str, job_id: int | None = None, source: str = "user_input", meta_data: dict = None):
    """Saves memory to DB, preparing it for the context engine."""
    embedding = get_embedding(text)
    mem_entry = WorkflowMemory(
        job_id=job_id,
        content=text,
        embedding=embedding,
        source=source,
        meta_data=meta_data or {}
    )
    db.add(mem_entry)
    db.commit()
    db.refresh(mem_entry)
    return mem_entry

def search_memory(db: Session, query: str, limit: int = 5):
    """Retrieves top-K context natively in SQLAlchemy via pgvector."""
    query_embedding = get_embedding(query)
    results = db.query(WorkflowMemory).order_by(
        WorkflowMemory.embedding.cosine_distance(query_embedding)
    ).limit(limit).all()
    return results

def verify_context(query: str, memories: list[WorkflowMemory]) -> list[WorkflowMemory]:
    """
    Verification Agent logic:
    In a real scenario, this asks Gemini 2.5 Flash to filter the 'memories'
    based on their actual relevance to the 'query'.
    For now, we simulate this by returning the top 3 that have score > 0.3.
    """
    verified = []
    for m in memories:
        # Pseudo-verification logic
        if m.score >= 0.3:
            verified.append(m)
            # Increment usage count
            m.used_count += 1
    return verified

def rerank_memories(query: str, memories: list[WorkflowMemory], top_n: int = 5) -> list[WorkflowMemory]:
    """
    Refines initial vector search results using Vertex AI Semantic Ranking.
    This provides significantly higher precision for complex context.
    """
    if not memories:
        return []

    try:
        client = discoveryengine.RankServiceClient()
        # Extract project info - fallback tophrasal-bivouac-489706-r8 if settings missing
        project_id = getattr(settings, "PROJECT_ID", "phrasal-bivouac-489706-r8")
        ranking_config = f"projects/{project_id}/locations/global/rankingConfigs/default_ranking_config"

        # Map WorkflowMemory objects to Ranking Records
        records = [
            discoveryengine.RankingRecord(
                id=str(m.id),
                content=m.content,
                title=m.meta_data.get("title", "") if m.meta_data else ""
            ) for m in memories
        ]

        request = discoveryengine.RankRequest(
            ranking_config=ranking_config,
            model="semantic-ranker-512@latest",
            query=query,
            records=records,
            top_n=top_n
        )

        response = client.rank(request=request)
        
        # Re-order the original memory objects based on the ranker's output
        id_to_mem = {str(m.id): m for m in memories}
        reranked = []
        for record in response.records:
            if record.id in id_to_mem:
                mem = id_to_mem[record.id]
                # Attach the relevance score for the verification agent
                mem.score = record.score 
                reranked.append(mem)
        
        return reranked
    except Exception as e:
        logger.warning(f"Semantic Re-ranking failed (falling back to vector score): {e}")
        # Baseline fallback: Sort by vector score if reranking fails
        return memories[:top_n]

def get_context(db: Session, query: str) -> str:
    """The main entrypoint for the Orchestrator to fetch active context."""
    # Step 1: Broad Retrieval (Increased pool for re-ranking)
    raw_memories = search_memory(db, query, limit=15)
    
    # Step 2: Semantic Re-ranking
    reranked_memories = rerank_memories(query, raw_memories, top_n=5)
    
    # Step 3: High-Fidelity Verification
    verified_memories = verify_context(query, reranked_memories)
    
    db.commit() # Save the used_count increments
    
    if not verified_memories:
        return ""
    
    context_str = "\n".join([f"- {m.content}" for m in verified_memories])
    return context_str
