import logging
import asyncio
from datetime import datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.db.session import SessionLocal
from app.services.orchestrator import create_workflow_job, process_workflow
from app.db.models import WorkflowJob

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()

async def morning_briefing_job():
    """
    Automated Proactive Task: Athena analyzes the day and prepares a briefing.
    """
    logger.info("Starting proactive Morning Briefing job...")
    
    db = SessionLocal()
    try:
        command = "Analyze my calendar for today and recent high-priority emails to provide a concise morning briefing with action items."
        
        # 1. Create the job in 'running' state
        job = create_workflow_job(db, command)
        
        if job.status == "pending":
            logger.info("Morning Briefing blocked by high-risk evaluator (unexpected).")
            return

        # 2. Execute the full ADK pipeline
        logger.info(f"Executing proactive workflow for Job ID: {job.id}")
        from app.services.orchestrator import async_process_workflow
        updated_job = await async_process_workflow(db, command)
        
        logger.info(f"Proactive Morning Briefing completed. Status: {updated_job.status}")
        
    except Exception as e:
        logger.error(f"Proactive job failed: {e}")
    finally:
        db.close()

def start_proactive_worker():
    """Starts the scheduler in the background."""
    # Schedule for 8:00 AM every day
    scheduler.add_job(morning_briefing_job, 'cron', hour=8, minute=0)
    
    # Also schedule a 'test' run 1 minute after startup for verification
    # scheduler.add_job(morning_briefing_job, 'date', run_date=datetime.now())
    
    scheduler.start()
    logger.info("Proactive Intelligence Worker started (Scheduled for 08:00 AM daily).")

def stop_proactive_worker():
    scheduler.shutdown()
    logger.info("Proactive Intelligence Worker stopped.")
