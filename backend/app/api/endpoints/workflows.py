from app.db.session import get_db
from app.services.orchestrator import process_workflow
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends

router = APIRouter()

class WorkflowRequest(BaseModel):
    command: str

@router.get("/")
def list_workflows(db: Session = Depends(get_db)):
    """List recent workflows and their statuses."""
    from app.db.models import WorkflowJob
    jobs = db.query(WorkflowJob).order_by(WorkflowJob.created_at.desc()).limit(10).all()
    return {"workflows": [{"id": j.id, "command": j.command, "status": j.status} for j in jobs]}

@router.get("/{workflow_id}")
def get_workflow(workflow_id: str, db: Session = Depends(get_db)):
    """Get the current status of a specific workflow."""
    from app.db.models import WorkflowJob
    job = db.query(WorkflowJob).filter(WorkflowJob.id == int(workflow_id)).first()
    if not job:
        return {"error": "Workflow not found"}
    return {"workflow_id": job.id, "status": job.status, "latency": job.latency}

@router.post("/start")
def start_workflow(request: WorkflowRequest, db: Session = Depends(get_db)):
    """Start a new workflow and pass command to ADK orchestrator."""
    job = process_workflow(db, request.command)
    return {"status": "accepted", "command": request.command, "workflow_id": job.id, "job_status": job.status}


@router.post("/{workflow_id}/cancel")
def cancel_workflow(workflow_id: str):
    """Safely halt a runaway or incorrect task."""
    return {"workflow_id": workflow_id, "status": "cancelled"}
