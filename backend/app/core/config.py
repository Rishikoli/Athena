from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Athena"
    API_V1_STR: str = "/api/v1"
    
    # GCP Configuration
    GCP_PROJECT_ID: str = "phrasal-bivouac-489706-r8"
    GCP_LOCATION: str = "us-central1"
    
    # Athena: AlloyDB Setup
    DATABASE_URL: str = "postgresql://user:password@localhost/aicos"
    
    # Model Configuration
    GEMINI_MODEL_VERSION: str = "gemini-2.5-flash-preview-0514"
    
    class Config:
        env_file = ".env"

settings = Settings()

os.environ["GOOGLE_CLOUD_PROJECT"] = settings.GCP_PROJECT_ID
os.environ["GOOGLE_CLOUD_LOCATION"] = settings.GCP_LOCATION

def get_secret(secret_id: str, version_id: str = "latest"):
    try:
        from google.cloud import secretmanager
        client = secretmanager.SecretManagerServiceClient()
        name = f"projects/{settings.GCP_PROJECT_ID}/secrets/{secret_id}/versions/{version_id}"
        response = client.access_secret_version(name=name)
        return response.payload.data.decode("UTF-8")
    except Exception as e:
        return None

# Securely load database password and reconstruct DATABASE_URL
db_password = get_secret("athena-db-password")
if db_password:
    settings.DATABASE_URL = f"postgresql://aicos_admin:{db_password}@127.0.0.1:5434/aicos"

