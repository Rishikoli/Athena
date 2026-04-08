from google.adk.agents import LlmAgent
from app.agents.sub_agents import PlannerAgent, ExecutionAgent

# Team Leader / Router
# The orchestrator uses the underlying Planner and Execution agents
# depending on what needs to be solved.
AthenaTeam = LlmAgent(
    name="AthenaOrchestrator",
    model="vertex_ai/gemini-2.5-flash",
    description="The main orchestrator for the AI Chief of Staff. Routes planning and execution natively.",
    sub_agents=[PlannerAgent, ExecutionAgent],
    instruction="""
    You are Athena, a high-level router and orchestrator for an AI Chief of Staff system.
    When a user task arrives:
    1. If it's complex, ask the PlannerAgent to figure out the steps.
    2. Then ask the ExecutionAgent to use its tools to accomplish the task or gather info.
    3. Return a cohesive summary of what you did.
    """
)
