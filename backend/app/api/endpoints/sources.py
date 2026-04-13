import re
import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.context_engine import save_memory
from youtube_transcript_api import YouTubeTranscriptApi
import trafilatura
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)
router = APIRouter()

class UrlPayload(BaseModel):
    url: str

class MeetingPayload(BaseModel):
    title: str
    transcript: str
    date: str | None = None

def chunk_text(text: str, chunk_size: int = 1500) -> list[str]:
    """Simple chunking to ensure embeddings stay within token limits."""
    return [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]

def extract_video_id(url: str):
    pattern = r'(?:v=|\/)([0-9A-Za-z_-]{11}).*'
    match = re.search(pattern, url)
    return match.group(1) if match else None

@router.get("/search")
def search_sources(q: str, db: Session = Depends(get_db)):
    """Semantic search across all institutional memory."""
    from app.services.context_engine import search_memory
    results = search_memory(db, q, limit=5)
    return {
        "status": "success",
        "results": [
            {
                "content": r.content,
                "score": r.score,
                "source": r.source,
                "meta": r.meta_data
            } for r in results
        ]
    }

@router.post("/calendar/sync")
def sync_calendar(db: Session = Depends(get_db)):
    """Actively pull Google Calendar events and ingest them into semantic memory."""
    from app.integrations.google_workspace import GoogleWorkspaceManager
    google_manager = GoogleWorkspaceManager()
    
    events = google_manager.list_calendar_events()
    source_label = "calendar"
    
    # High-Fidelity Mock Fallback for non-authenticated environments
    if not events:
        source_label = "calendar_sim"
        events = [
            {
                "summary": "Project Athena: Strategic Rebrand Sync",
                "start": {"dateTime": "2026-04-13T13:00:00Z"},
                "description": "Discussing Hyper-Blue transition and Director's Cut branding.",
                "attendees": [{"email": "aditya@example.com"}, {"email": "rishikoli@example.com"}]
            },
            {
                "summary": "Executive Q2 Vision Review",
                "start": {"dateTime": "2026-04-14T10:00:00Z"},
                "description": "Quarterly goals for autonomous agent scaling and AlloyDB integration.",
                "attendees": [{"email": "board@athena.ai"}]
            }
        ]
        logger.info("Calendar API offline/unauthorized. Injecting high-fidelity mock events for system alignment.")

    count = 0
    for event in events:
        summary = event.get('summary', 'Untitled Event')
        start_time = event.get('start', {}).get('dateTime', 'All Day')
        desc = event.get('description', 'No description provided.')
        
        # Combine into a semantic string
        semantic_text = f"Calendar Event: {summary} at {start_time}. Details: {desc}"
        
        save_memory(
            db, 
            semantic_text, 
            source=source_label, 
            meta_data={"event_id": event.get('id'), "type": "schedule"}
        )
        count += 1
        
    return {
        "status": "success", 
        "message": f"Successfully aligned {count} schedule items into Vector Memory.",
        "mode": "live" if source_label == "calendar" else "simulated"
    }

@router.post("/notion/ingest")
def ingest_notion(payload: MeetingPayload, db: Session = Depends(get_db)):
    """Ingest Notion pages via direct text/markdown paste (Zero-Key Bridge)."""
    try:
        # Reusing MeetingPayload for simplicity (title + transcript/content)
        if not payload.transcript:
            raise HTTPException(status_code=400, detail="Content is empty.")
            
        chunks = chunk_text(payload.transcript)
        for i, chunk in enumerate(chunks):
            save_memory(
                db, 
                chunk, 
                source="notion", 
                meta_data={
                    "title": payload.title, 
                    "date": payload.date,
                    "chunk": i
                }
            )
            
        return {
            "status": "success", 
            "title": payload.title, 
            "message": f"Institutional wiki indexed into {len(chunks)} semantic vectors."
        }
    except Exception as e:
        logger.error(f"Notion Ingestion failed: {e}")
        raise HTTPException(status_code=500, detail=f"Notion Ingestion failed: {str(e)}")

@router.post("/notebook/sync")
def sync_notebook():
    """Support for NotebookLM-style 'workspaces' or Jupyter notebook ingestion."""
    return {"status": "success", "message": "Notebook synced (Stubbed)"}

@router.post("/meetings/ingest")
def ingest_meeting(payload: MeetingPayload, db: Session = Depends(get_db)):
    """Ingest a meeting transcript from services like Zoom, Otter, or Fireflies."""
    try:
        if not payload.transcript:
            raise HTTPException(status_code=400, detail="Transcript content is empty.")
            
        chunks = chunk_text(payload.transcript)
        for i, chunk in enumerate(chunks):
            save_memory(
                db, 
                chunk, 
                source="meeting", 
                meta_data={
                    "title": payload.title, 
                    "date": payload.date,
                    "chunk": i
                }
            )
            
        return {
            "status": "success", 
            "title": payload.title, 
            "message": f"Meeting indexed into {len(chunks)} semantic vectors."
        }
    except Exception as e:
        logger.error(f"Meeting Ingestion failed: {e}")
        raise HTTPException(status_code=500, detail=f"Meeting Ingestion failed: {str(e)}")
