from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter()

class WebhookPayload(BaseModel):
    payload: Dict[str, Any]

@router.post("/slack")
def slack_webhook(data: WebhookPayload):
    """Receive mentions or messages from Slack and trigger an agent response."""
    return {"status": "received", "source": "slack"}

@router.post("/github")
def github_webhook(data: WebhookPayload):
    """Trigger workflows when code changes occur."""
    return {"status": "received", "source": "github"}
