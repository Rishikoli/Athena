from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.db.models import WorkflowJob, Metric, Approval
from datetime import datetime, timedelta, timezone

router = APIRouter()

@router.get("/usage")
def get_usage_metrics(db: Session = Depends(get_db)):
    """Token usage & billing estimates for Gemini 2.5 Flash."""
    total_tokens = db.query(func.sum(Metric.token_count)).scalar() or 0
    # Current Gemini 2.5 Flash prices (roughly $0.075 / 1M tokens combined)
    estimated_cost = (total_tokens / 1_000_000) * 0.075
    
    return {
        "tokens_used": total_tokens,
        "estimated_cost_usd": round(estimated_cost, 4),
        "quota_remaining": 10000000 - total_tokens
    }

@router.get("/performance")
def get_performance_metrics(db: Session = Depends(get_db)):
    """Task completion times, success/failure rate."""
    total_jobs = db.query(WorkflowJob).count()
    if total_jobs == 0:
        return {"total_tasks": 0, "success_rate": 0, "avg_completion_time_sec": 0}

    completed_jobs = db.query(WorkflowJob).filter(WorkflowJob.status == "completed").count()
    avg_latency = db.query(func.avg(WorkflowJob.latency)).scalar() or 0
    
    return {
        "total_tasks": total_jobs,
        "success_rate": round(completed_jobs / total_jobs, 2),
        "avg_completion_time_sec": round(avg_latency, 2)
    }

@router.get("/temperature")
def get_system_temperature(db: Session = Depends(get_db)):
    """
    Project Temperature System.
    Calculates system mood based on recent failures and risks.
    """
    # Look at last 24h
    since = datetime.now(timezone.utc) - timedelta(hours=24)
    recent_jobs = db.query(WorkflowJob).filter(WorkflowJob.created_at >= since).all()
    
    base_temp = 68.0 # Fahrenheit (Comfortable / Nominal)
    
    if not recent_jobs:
        return {"temperature": base_temp, "status": "Idle", "unit": "°F"}
    
    failures = sum(1 for j in recent_jobs if j.status == "failed")
    pending_approvals = db.query(Approval).filter(Approval.status == "pending").count()
    
    # Logic: +5 degrees per failure, +2 per pending high-risk approval
    current_temp = base_temp + (failures * 5.0) + (pending_approvals * 2.5)
    
    status = "Nominal"
    if current_temp > 85: status = "Overheated"
    elif current_temp > 75: status = "Warning"
    
    return {
        "temperature": round(current_temp, 1),
        "status": status,
        "unit": "°F",
        "failures_24h": failures,
        "pressure_index": round((current_temp - 68) / 32, 2) # 0 to 1 scale roughly
    }
