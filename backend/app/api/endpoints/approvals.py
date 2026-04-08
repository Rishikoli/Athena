from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from app.db.session import get_db

router = APIRouter()

class ApprovalAction(BaseModel):
    reason: Optional[str] = None

@router.get("/pending")
def pending_approvals(db: Session = Depends(get_db)):
    """Fetch a list of actions waiting for manual 'Go/No-Go'."""
    from app.db.models import Approval
    approvals = db.query(Approval).filter(Approval.status == "pending").all()
    return {"pending_actions": [{"id": a.id, "job_id": a.job_id, "proposed_action": a.proposed_action, "risk_level": a.risk_level} for a in approvals]}

@router.post("/{approval_id}/approve")
def approve_action(approval_id: str, action: ApprovalAction = None, db: Session = Depends(get_db)):
    """Give the agent the green light to continue."""
    from app.db.models import Approval, WorkflowJob
    approval = db.query(Approval).filter(Approval.id == int(approval_id)).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
        
    approval.status = "approved"
    
    # Optionally trigger orchestrator logic to resume job here
    if approval.job_id:
        job = db.query(WorkflowJob).filter(WorkflowJob.id == approval.job_id).first()
        if job:
            job.status = "running"
            
    db.commit()
    return {"status": "approved", "approval_id": approval_id}

@router.post("/{approval_id}/reject")
def reject_action(approval_id: str, action: ApprovalAction = None, db: Session = Depends(get_db)):
    """Deny the agent's proposed action."""
    from app.db.models import Approval, WorkflowJob
    approval = db.query(Approval).filter(Approval.id == int(approval_id)).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
        
    approval.status = "rejected"
    
    if approval.job_id:
        job = db.query(WorkflowJob).filter(WorkflowJob.id == approval.job_id).first()
        if job:
            job.status = "failed"
            job.current_state = {"reason": "Rejected by user"}
            
    db.commit()
    return {"status": "rejected", "approval_id": approval_id}
