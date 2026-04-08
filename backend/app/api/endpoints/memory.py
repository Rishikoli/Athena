from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.context_engine import save_memory, search_memory

router = APIRouter()

class MemoryIngestRequest(BaseModel):
    content: str
    metadata: Dict[str, Any] = {}
    source: str = "api"

@router.post("/ingest")
def ingest_memory(request: MemoryIngestRequest, db: Session = Depends(get_db)):
    """Manually feed new context, rules, or documents into the pgvector database."""
    mem = save_memory(db, text=request.content, source=request.source, meta_data=request.metadata)
    return {"status": "success", "message": "Memory ingested successfully", "id": mem.id}

@router.get("/search")
def api_search_memory(query: str, limit: int = 5, db: Session = Depends(get_db)):
    """Test semantic search or allow the frontend to search past memories."""
    results = search_memory(db, query, limit=limit)
    return {"query": query, "results": [{"id": r.id, "content": r.content, "score": getattr(r, 'score', None)} for r in results]}
