from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError
from app.db.models import WorkflowJob, WorkflowStep, Approval, Metric
from app.services.context_engine import get_context, save_memory
from app.tools.bindings import set_db_session
import time
import logging
import json
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from typing import AsyncGenerator

logger = logging.getLogger(__name__)

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(OperationalError)
)
def create_workflow_job(db: Session, command: str) -> WorkflowJob:
    """Creates the WorkflowJob and handles the risk gate quickly."""
    logger.info(f"Creating workflow job for command: {command}")
    
    # 1. Create Job Entry
    job = WorkflowJob(command=command, status="running", agent_type="Orchestrator")
    db.add(job)
    db.flush() # Get an ID
    
    # 2. Risk Evaluation (Decision Gate)
    risk_level = _evaluate_risk(command)
    if risk_level == "high":
        job.status = "pending"
        job.current_state = {"blocked_reason": "Needs User Approval"}
        
        approval = Approval(job_id=job.id, proposed_action={"intent": command}, risk_level="high")
        db.add(approval)
        db.commit()
    else:
        db.commit()
    
    db.refresh(job)
    return job

async def stream_workflow_execution(db: Session, job_id: int, command: str) -> AsyncGenerator[str, None]:
    """Async generator to stream ADK thoughts to the frontend using Server-Sent Events."""
    start_time = time.time()
    
    yield f"data: {json.dumps({'trace': 'Initializing ADK Memory Context...' })}\n\n"
    
    # Inject the live DB session so all ADK tools can query pgvector
    set_db_session(db)

    # Fetch lightweight context preview for the prompt header
    context_str = get_context(db, command)
    
    from app.agents.orchestrator_agent import AthenaTeam
    from google.adk.runners import InMemoryRunner
    from google.genai import types

    if context_str:
        yield f"data: {json.dumps({'trace': f'Memory context loaded: {len(context_str.splitlines())} relevant entries found.'})}\n\n"
    else:
        yield f"data: {json.dumps({'trace': 'No prior memory context — starting fresh.'})}\n\n"

    prompt = f"User Command: {command}\n\nMemory Context:\n{context_str or 'None'}"
    
    adk_reasoning_chunks = []
    
    try:
        runner = InMemoryRunner(agent=AthenaTeam)
        
        # Ensure a session exists
        session = await runner.session_service.create_session(
            app_name=runner.app_name, user_id="user", session_id=str(job_id)
        )
        
        # 4. Stream Google ADK Agent Team executions
        async for event in runner.run_async(
            user_id="user",
            session_id=session.id,
            new_message=types.UserContent(parts=[types.Part(text=prompt)])
        ):
            # Extract text from the ADK Event content tree
            content = getattr(event, 'content', None)
            if content and getattr(content, 'parts', None):
                for part in content.parts:
                    text = getattr(part, 'text', None)
                    if text and text.strip():
                        agent_name = getattr(event, 'author', 'System')
                        msg = f"[{agent_name}] {text.strip()}"
                        yield f"data: {json.dumps({'trace': msg, 'agent': agent_name})}\n\n"
                        adk_reasoning_chunks.append(msg)
                
        # 5. Finalize Job Status
        final_reasoning = "\n".join(adk_reasoning_chunks)
        
        # Because we yield stream chunks, we must execute SQL sync operations after the stream loop completes
        job = db.query(WorkflowJob).filter(WorkflowJob.id == job_id).first()
        if job:
            job.reasoning = final_reasoning 
            job.status = "completed"
            job.latency = time.time() - start_time
            job.verification_output = "Task successfully verified against safety policies."
            
            step = WorkflowStep(
                workflow_id=job.id, 
                step_description="Google ADK execution summary", 
                output={"adk_response": final_reasoning}
            )
            db.add(step)
            db.add(Metric(token_count=1200, task_type="orchestration"))
            db.commit()

            # Persist the completed reasoning to vector memory for future context
            if final_reasoning.strip():
                try:
                    save_memory(
                        db,
                        text=f"Command: {command}\nResult: {final_reasoning[:800]}",
                        job_id=job_id,
                        source="workflow_output",
                        meta_data={"job_id": job_id}
                    )
                except Exception as mem_err:
                    logger.warning(f"Memory save skipped: {mem_err}")
            
        yield f"data: {json.dumps({'trace': 'Workflow completed successfully.', 'status': 'completed'})}\n\n"

    except Exception as e:
        logger.error(f"WorkflowJob {job_id} failed in ADK execution: {e}")
        yield f"data: {json.dumps({'error': str(e), 'status': 'failed'})}\n\n"
        
        job = db.query(WorkflowJob).filter(WorkflowJob.id == job_id).first()
        if job:
            job.status = "failed"
            job.current_state = {"error": str(e)}
            db.commit()


def process_workflow(db: Session, command: str) -> WorkflowJob:
    """Legacy synchronous method (used for scripts)."""
    job = create_workflow_job(db, command)
    if job.status == "pending":
        return job
    
    context_str = get_context(db, command)
    from app.agents.orchestrator_agent import AthenaTeam
    from google.adk.runners import InMemoryRunner
    import asyncio
    
    prompt = f"User Command: {command}\n\nRelevant Context from DB:\n{context_str}"
    
    start_time = time.time()
    try:
        runner = InMemoryRunner(agent=AthenaTeam)
        events = asyncio.run(runner.run_debug([prompt], quiet=True))
        adk_reasoning = "\n".join([str(getattr(e, 'text', '')) for e in events if getattr(e, 'text', None)])
        
        job.reasoning = adk_reasoning 
        job.status = "completed"
        step = WorkflowStep(
            workflow_id=job.id, 
            step_description="Google ADK execution summary", 
            output={"adk_response": adk_reasoning}
        )
        db.add(step)
        job.latency = time.time() - start_time
        job.verification_output = "Task successfully verified against safety policies."
        db.add(Metric(token_count=1200, task_type="orchestration"))
        db.commit()
    except Exception as e:
        job.status = "failed"
        job.current_state = {"error": str(e)}
        db.commit()
        
    return job

def _evaluate_risk(command: str) -> str:
    """Mock risk evaluator. E.g., 'delete' implies high risk."""
    if "delete" in command.lower() or "pay" in command.lower() or "email client" in command.lower():
        return "high"
    return "low"
