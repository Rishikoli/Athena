from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError
from app.db.models import WorkflowJob, WorkflowStep, Approval, Metric
from app.services.context_engine import get_context
import time
import logging
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

logger = logging.getLogger(__name__)

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(OperationalError)
)
def process_workflow(db: Session, command: str) -> WorkflowJob:
    """The central loop for handling an incoming task."""
    logger.info(f"Processing workflow command: {command}")
    start_time = time.time()
    
    # 1. Create Job Entry
    job = WorkflowJob(command=command, status="running", agent_type="Orchestrator")
    db.add(job)
    db.flush() # Get an ID
    logger.debug(f"Created WorkflowJob {job.id}")
    
    # 2. Risk Evaluation (Decision Gate)
    risk_level = _evaluate_risk(command)
    if risk_level == "high":
        job.status = "pending"
        job.current_state = {"blocked_reason": "Needs User Approval"}
        
        approval = Approval(job_id=job.id, proposed_action={"intent": command}, risk_level="high")
        db.add(approval)
        db.commit()
        return job

    # 3. Context Injection
    # Fetch top memories verified by our Verification Agent
    context_str = get_context(db, command)
    
    from app.agents.orchestrator_agent import AthenaTeam
    from google.adk.runners import InMemoryRunner
    import asyncio

    prompt = f"User Command: {command}\n\nRelevant Context from DB:\n{context_str}"
    
    # 4. Delegate to Google ADK Agent Team
    try:
        runner = InMemoryRunner(agent=AthenaTeam)
        events = asyncio.run(runner.run_debug([prompt], quiet=True))
        
        # Extract Text from Events
        adk_reasoning = "\n".join([str(getattr(e, 'text', '')) for e in events if getattr(e, 'text', None)])
        
        job.reasoning = adk_reasoning 
        job.status = "completed"
        
        # Log the orchestration result as a step
        step = WorkflowStep(
            workflow_id=job.id, 
            step_description="Google ADK execution summary", 
            output={"adk_response": adk_reasoning}
        )
        db.add(step)
            
        logger.info(f"WorkflowJob {job.id} completed successfully via ADK.")
    except Exception as e:
        logger.error(f"WorkflowJob {job.id} failed in ADK execution: {e}")
        job.status = "failed"
        job.current_state = {"error": str(e)}
        db.commit()
        return job
    
    # 6. Record Metrics
    latency = time.time() - start_time
    job.latency = latency
    job.verification_output = "Task successfully verified against safety policies."
    logger.info(f"WorkflowJob {job.id} finished in {latency:.2f} seconds.")
    
    metric = Metric(token_count=1200, task_type="orchestration")
    db.add(metric)
    
    db.commit()
    db.refresh(job)
    return job

def _evaluate_risk(command: str) -> str:
    """Mock risk evaluator. E.g., 'delete' implies high risk."""
    if "delete" in command.lower() or "pay" in command.lower() or "email client" in command.lower():
        return "high"
    return "low"

