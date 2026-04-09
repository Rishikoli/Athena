from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from pydantic import BaseModel
import logging

try:
    import google.cloud.logging
    client = google.cloud.logging.Client()
    client.setup_logging()
    logging.info("Athena Cloud Logging Initialized successfully!")
except Exception as e:
    logging.basicConfig(level=logging.INFO)
    logging.warning(f"Could not connect to Cloud Logging: {e}. Falling back to default.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="Athena: Autonomous AI Chief of Staff powered by Google ADK"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8000",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.api import api_router

@app.get("/health")
def health_check():
    return {"status": "ok", "framework": "Google ADK"}

app.include_router(api_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
