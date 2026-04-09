import asyncio
from google.adk.runners import InMemoryRunner
from google.adk import types
from app.agents.orchestrator_agent import AthenaTeam

async def main():
    runner = InMemoryRunner(agent=AthenaTeam)
    session = await runner.session_service.create_session(
        app_name=runner.app_name, user_id="user", session_id="123"
    )
    async for event in runner.run_async(
        user_id="user",
        session_id=session.id,
        new_message=types.UserContent(parts=[types.Part(text="test")])
    ):
        print(event)

if __name__ == "__main__":
    asyncio.run(main())
