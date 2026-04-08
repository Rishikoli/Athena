---
description: How to set up the full local development environment for the AI Chief of Staff system
---

# Skill: Local Dev Setup

Use this skill to get the complete Chief of Staff development environment running locally from scratch.

## Prerequisites
- Python 3.11+
- Docker & Docker Compose
- Google Cloud SDK (`gcloud`) installed
- A GCP project with Vertex AI API enabled

## Step 1: Clone and Navigate

```bash
cd "/home/aditya/AI Staff/backend"
```

## Step 2: Create Virtual Environment and Install Dependencies

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Step 3: Start Local PostgreSQL with pgvector

```bash
docker-compose up -d
```

This starts a local PostgreSQL container with the `pgvector` extension installed (simulating AlloyDB locally).

Verify it's running:
```bash
docker ps
```

## Step 4: Set Up Environment Variables

Copy the template and fill in your values:
```bash
cp .env.example .env
```

Required variables in `.env`:
```
GCP_PROJECT_ID=your-gcp-project-id
GCP_LOCATION=us-central1
GEMINI_MODEL_VERSION=gemini-2.5-flash-preview-0514
DATABASE_URL=postgresql://user:password@localhost:5432/aicos
SLACK_BOT_TOKEN=
GMAIL_CLIENT_ID=
LINEAR_API_KEY=
TODOIST_API_KEY=
NOTION_API_KEY=
GOOGLE_CALENDAR_CREDENTIALS_PATH=
FIGMA_API_KEY=
SERPER_API_KEY=
```

## Step 5: Set Up Google Application Default Credentials

```bash
gcloud auth application-default login
gcloud config set project YOUR_GCP_PROJECT_ID
```

## Step 6: Initialize the Database

```bash
cd backend
source venv/bin/activate
python -c "from app.db.models import Base; from sqlalchemy import create_engine; engine = create_engine('postgresql://user:password@localhost/aicos'); Base.metadata.create_all(engine)"
```

## Step 7: Run the Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Step 8: Verify

Open in browser:
- **Swagger UI**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **ReDoc**: http://localhost:8000/redoc
