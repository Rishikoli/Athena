from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import logging
import re

logger = logging.getLogger(__name__)

# Engine setup with Connection Pooling
# Definitive override to 5435 for the Athena bastian tunnel
raw_url = settings.DATABASE_URL
# Robustly force 127.0.0.1:5435
# This regex replaces everything between '@' and the start of the database name
db_url = re.sub(r"(@[^/]+)", "@127.0.0.1:5435", raw_url)

logger.info(f"Database Engine Initialized. Target: {db_url.split('@')[-1]} (Masked)")

engine = create_engine(
    db_url, 
    pool_pre_ping=True, 
    pool_size=20, 
    max_overflow=10
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Dependency for yielding DB sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
