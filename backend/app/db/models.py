from sqlalchemy import Column, Integer, String, Text, JSON, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import declarative_base, relationship
from pgvector.sqlalchemy import Vector
from datetime import datetime, timezone

Base = declarative_base()

class WorkflowJob(Base):
    __tablename__ = "workflow_jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    command = Column(String, nullable=False)
    status = Column(String, default="pending") # pending, running, completed, failed
    current_state = Column(JSON, default={})
    
    # Observability & Explainability
    latency = Column(Float, default=0.0)
    agent_type = Column(String, nullable=True)
    error_flag = Column(Boolean, default=False)
    reasoning = Column(Text, nullable=True)
    verification_output = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    steps = relationship("WorkflowStep", back_populates="job")


class WorkflowStep(Base):
    """Task decomposition for a single WorkflowJob"""
    __tablename__ = "workflow_steps"
    
    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflow_jobs.id"), nullable=False)
    step_description = Column(String, nullable=False)
    status = Column(String, default="pending") # pending, running, completed, failed
    output = Column(JSON, default={})
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    job = relationship("WorkflowJob", back_populates="steps")


class WorkflowMemory(Base):
    """Context and semantic history with self-improving properties"""
    __tablename__ = "workflow_memory"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("workflow_jobs.id"), nullable=True)
    content = Column(Text, nullable=False)
    embedding = Column(Vector(768))
    
    # Context Engine Upgrades
    score = Column(Float, default=0.5)      # Usefulness rating
    source = Column(String, nullable=True)  # Where it came from (slack, web, doc)
    used_count = Column(Integer, default=0)
    meta_data = Column(JSON, default={})
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Approval(Base):
    """Decision Gate for high-stakes tasks"""
    __tablename__ = "approvals"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("workflow_jobs.id"), nullable=True)
    proposed_action = Column(JSON, nullable=False)
    status = Column(String, default="pending") # pending, approved, rejected
    risk_level = Column(String, default="low") # low, medium, high
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class Metric(Base):
    """Granular analytics usage"""
    __tablename__ = "metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    token_count = Column(Integer, default=0)
    task_type = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
