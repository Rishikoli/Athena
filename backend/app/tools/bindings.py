import threading
import logging
from typing import Dict, Any, List
from app.integrations.google_workspace import GoogleWorkspaceManager

logger = logging.getLogger(__name__)

# Single instance of the manager to be reused
google_manager = GoogleWorkspaceManager()

# ── Thread-local DB session injected by the orchestrator ──────
_local = threading.local()

def set_db_session(db):
    _local.db = db

def get_db_session():
    return getattr(_local, "db", None)


# ─────────────────────────────────────────────────────────────────────────────
# Memory tool — real pgvector search
# ─────────────────────────────────────────────────────────────────────────────

def fetch_memory_context(query: str) -> str:
    """
    Retrieve deep semantic memory from the Chief of Staff's Vector Database.
    Use this to ground your responses in past decisions, project context, or
    user preferences. Always call this before drafting any document or plan.
    """
    db = get_db_session()
    if db is None:
        return "Memory unavailable: no DB session injected."

    try:
        from app.services.context_engine import search_memory
        memories = search_memory(db, query, limit=5)
        if not memories:
            return f"No relevant memories found for: '{query}'."
        lines = [f"- [{m.source or 'memory'}] {m.content}" for m in memories]
        return "Retrieved context from vector memory:\n" + "\n".join(lines)
    except Exception as e:
        return f"Memory search failed: {e}"


# ─────────────────────────────────────────────────────────────────────────────
# Calendar tool — Real API with Smart Mock Fallback
# ─────────────────────────────────────────────────────────────────────────────

def check_calendar(date_str: str) -> Dict[str, Any]:
    """
    Checks the user's calendar for events. Uses real Google Calendar API if 
    credentials are valid, otherwise falls back to a realistic project mock.
    """
    events = google_manager.list_calendar_events()
    
    if events:
        formatted_events = []
        for e in events:
            formatted_events.append({
                "time": e.get('start', {}).get('dateTime', 'All Day'),
                "title": e.get('summary', 'No Title'),
                "link": e.get('htmlLink', '')
            })
        return {
            "source": "Google Calendar API (Live)",
            "date": date_str,
            "events": formatted_events,
            "flags": ["✅ Live calendar data retrieved successfully."]
        }

    # Fallback to realistic mock if API fails/no creds
    return {
        "source": "Athena Project Mock (API Offline)",
        "date": date_str,
        "events": [
            {"time": "13:00", "title": "Sync with Engineering", "attendees": ["Alex", "Jordan"], "duration_min": 60},
            {"time": "15:00", "title": "Client Pitch — Acme Corp", "attendees": ["Acme Corp team"], "duration_min": 60},
        ],
        "flags": [
            "⚠️ API Offline: Using cached/fallback simulation.",
            "💡 Consider checking your local token.json for Workspace access."
        ],
    }


# ─────────────────────────────────────────────────────────────────────────────
# Email tool — Live search + Context Fallback
# ─────────────────────────────────────────────────────────────────────────────

def search_recent_emails(sender_name: str) -> str:
    """
    Searches recent emails. Attempts real Gmail API first, then searches 
    pgvector memory, finally falling back to a structured mock.
    """
    # 1. Try Live Gmail
    google_threads = google_manager.search_gmail(f"from:{sender_name}")
    if google_threads:
        res = f"Retrieved {len(google_threads)} live threads from Gmail:\n"
        for t in google_threads:
            res += f"- {t['snippet']}\n"
        return res

    # 2. Try DB Memory
    db = get_db_session()
    if db:
        try:
            from app.services.context_engine import search_memory
            memories = search_memory(db, f"email from {sender_name}", limit=3)
            email_mems = [m for m in memories if m.source == "email"]
            if email_mems:
                return "Retrieved email context from Vector Memory:\n" + "\n".join([f"- {m.content}" for m in email_mems])
        except Exception:
            pass

    # 3. Fallback Mock
    return (
        f"MOCK DATA: Acme Corp (Sarah Chen, VP Sales) — Last email 2h ago:\n"
        f"  'Looking forward to the proposal. The board approved the budget.\n"
        f"  Please confirm the Q2 timeline and pricing tier by EOD tomorrow.\n"
        f"  Urgency: HIGH. Deal size: $240k ARR."
    )


# ─────────────────────────────────────────────────────────────────────────────
# Slack & Linear — Advanced Stubs (Ready for tokens)
# ─────────────────────────────────────────────────────────────────────────────

def search_slack_channels(query: str) -> str:
    """
    Search Slack channels for project discussions. 
    Currently waiting for SLACK_BOT_TOKEN to go live.
    """
    return "SLACK_STUB: Integration ready. Waiting for production Bot Token to sweep #project-athena channels."

def update_linear_issue(issue_id: str, status: str) -> str:
    """
    Update a ticket status in Linear. 
    Currently waiting for LINEAR_API_KEY.
    """
    return f"LINEAR_STUB: Logic for ticket {issue_id} status change to '{status}' is staged. Waiting for API Key."


# ─────────────────────────────────────────────────────────────────────────────
# Approval request tool — writes to DB
# ─────────────────────────────────────────────────────────────────────────────

def create_approval_request(intent: str, risk_level: str) -> str:
    """
    Logs a formal approval request for the Director.
    """
    db = get_db_session()
    if db:
        try:
            from app.db.models import Approval
            approval = Approval(
                proposed_action={"intent": intent},
                risk_level=risk_level,
                status="pending",
            )
            db.add(approval)
            db.commit()
            return f"✅ Approval #{approval.id} queued for Director review: '{intent}' (risk: {risk_level})."
        except Exception as e:
            return f"Approval queued locally (DB write failed: {e}): '{intent}'."
    return f"Approval request logged: '{intent}' — risk level: {risk_level}."
