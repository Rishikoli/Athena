---
description: How to build and deploy the AI Chief of Staff FastAPI backend to Google Cloud Run
---

# Skill: Deploy to Google Cloud Run

Use this skill whenever you need to deploy or update the Chief of Staff backend on Google Cloud Run.

## Prerequisites
- Google Cloud SDK (`gcloud`) installed and authenticated
- Docker installed locally
- A GCP project with the following APIs enabled:
  - Cloud Run API
  - Artifact Registry API
  - Vertex AI API
  - Secret Manager API
  - AlloyDB API (or Cloud SQL with pgvector)

## Step 1: Write the Dockerfile

Ensure `backend/Dockerfile` exists with this structure:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/

EXPOSE 8080

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

## Step 2: Store Secrets in Secret Manager

For every API key in `.env`, create a secret in GCP:

```bash
echo -n "YOUR_API_KEY_VALUE" | gcloud secrets create SECRET_NAME --data-file=-
```

## Step 3: Build and Push Docker Image

```bash
# Configure Docker to use GCP Artifact Registry
gcloud auth configure-docker {REGION}-docker.pkg.dev

# Build the image
docker build -t {REGION}-docker.pkg.dev/{PROJECT_ID}/ai-chief-of-staff/backend:latest ./backend

# Push to Artifact Registry
docker push {REGION}-docker.pkg.dev/{PROJECT_ID}/ai-chief-of-staff/backend:latest
```

## Step 4: Deploy to Cloud Run

```bash
gcloud run deploy ai-chief-of-staff \
  --image {REGION}-docker.pkg.dev/{PROJECT_ID}/ai-chief-of-staff/backend:latest \
  --platform managed \
  --region {REGION} \
  --allow-unauthenticated \
  --set-env-vars GCP_PROJECT_ID={PROJECT_ID},GCP_LOCATION={REGION} \
  --set-secrets "OPENAI_API_KEY=OPENAI_API_KEY:latest" \
  --memory 2Gi \
  --cpu 2
```

## Step 5: Verify Deployment

```bash
# Get the service URL
gcloud run services describe ai-chief-of-staff --region {REGION} --format='value(status.url)'

# Test the health endpoint
curl https://{SERVICE_URL}/health
```

Expected response: `{"status": "ok", "framework": "Google ADK"}`

## Step 6: Connect to AlloyDB

Ensure the Cloud Run service has VPC connector configured to reach the AlloyDB private IP. Update the `DATABASE_URL` secret to point to the AlloyDB instance URL instead of localhost.
