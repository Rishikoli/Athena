import vertexai
from vertexai.language_models import TextEmbeddingInput, TextEmbeddingModel
from sqlalchemy.orm import Session
from app.db.models import WorkflowMemory
from app.core.config import settings

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

def get_context(db: Session, query: str) -> str:
    """The main entrypoint for the Orchestrator to fetch active context."""
    raw_memories = search_memory(db, query, limit=5)
    verified_memories = verify_context(query, raw_memories)
    
    db.commit() # Save the used_count increments
    
    if not verified_memories:
        return ""
    
    context_str = "\n".join([f"- {m.content}" for m in verified_memories])
    return context_str
