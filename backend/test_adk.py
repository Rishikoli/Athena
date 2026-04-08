from app.services.orchestrator import process_workflow
from app.db.session import SessionLocal

def main():
    db = SessionLocal()
    try:
        command = "I have a meeting with Acme Corp at 3 PM today. Please draft a brief."
        print(f"Triggering Athena with command: {command}\n")
        job = process_workflow(db, command)
        print("\n\n--- RESULTS ---")
        print("Status:", job.status)
        print("Reasoning Output:\n", job.reasoning)
        for st in job.steps:
            print("Step:", st.step_description, "Output:", st.output)
            
    finally:
        db.close()

if __name__ == "__main__":
    main()
