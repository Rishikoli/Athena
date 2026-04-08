from fastapi import APIRouter

from app.api.endpoints import workflows, memory, webhooks, agents, sources, approvals, metrics, db

api_router = APIRouter()

api_router.include_router(workflows.router, prefix="/workflows", tags=["workflows"])
api_router.include_router(memory.router, prefix="/memory", tags=["memory"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
api_router.include_router(agents.router, prefix="/agents", tags=["agents"])
api_router.include_router(sources.router, prefix="/sources", tags=["sources"])
api_router.include_router(approvals.router, prefix="/approvals", tags=["approvals"])
api_router.include_router(metrics.router, prefix="/metrics", tags=["metrics"])
api_router.include_router(db.router, prefix="/db", tags=["db"])
