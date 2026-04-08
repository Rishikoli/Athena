import vertexai
from vertexai.language_models import TextEmbeddingInput, TextEmbeddingModel
from sqlalchemy.orm import Session
from app.db.models import WorkflowMemory
from app.core.config import settings

def get_embedding(text: str) -> list[float]:
    # In production, ensure Vertex AI is globally initialized
    model = TextEmbeddingModel.from_pretrained("text-embedding-004")
    inputs = [TextEmbeddingInput(text=text, task_type="RETRIEVAL_DOCUMENT")]
    embeddings = model.get_embeddings(inputs)
    return embeddings[0].values

def save_memory(db: Session, text: str, job_id: int | None = None):
    embedding = get_embedding(text)
    mem_entry = WorkflowMemory(job_id=job_id, content=text, embedding=embedding)
    db.add(mem_entry)
    db.commit()
    db.refresh(mem_entry)
    return mem_entry

def search_memory(db: Session, query: str, limit: int = 5):
    query_embedding = get_embedding(query)
    # Cosine distance search natively in SQLAlchemy via pgvector
    results = db.query(WorkflowMemory).order_by(
        WorkflowMemory.embedding.cosine_distance(query_embedding)
    ).limit(limit).all()
    return results
