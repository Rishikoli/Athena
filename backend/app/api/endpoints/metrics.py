from fastapi import APIRouter

router = APIRouter()

@router.get("/usage")
def get_usage_metrics():
    """Token usage & billing estimates for Gemini 2.5 Flash."""
    return {"tokens_used": 120500, "estimated_cost_usd": 0.15}

@router.get("/performance")
def get_performance_metrics():
    """Task completion times, success/failure rate."""
    return {"total_tasks": 42, "success_rate": 0.95, "avg_completion_time_sec": 4.5}
