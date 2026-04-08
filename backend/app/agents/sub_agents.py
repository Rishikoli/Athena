from google.adk.agents import LlmAgent
from app.tools.bindings import check_calendar, search_recent_emails, create_approval_request, fetch_memory_context
import os

# We default to vertex_ai/gemini-2.5-flash to use Application Default Credentials via litellm
MODEL_NAME = "vertex_ai/gemini-2.5-flash"

PlannerAgent = LlmAgent(
    name="PlannerAgent",
    model=MODEL_NAME,
    description="Breaks down complex user commands into actionable step-by-step plans.",
    instruction="""
    You are the Planner Agent for a busy Chief of Staff. 
    Your objective is to analyze a user's command, identify if calendar or email checks are needed,
    and output a discrete JSON list of execution steps. 
    You do NOT execute tools. You just plan.
    """,
    tools=[],
)

ExecutionAgent = LlmAgent(
    name="ExecutionAgent",
    model=MODEL_NAME,
    description="Executes tools and gathers information to finalize a task.",
    instruction="""
    You are the Execution Agent for Athena, the AI Chief of Staff.
    You have access to the user's Calendar, Emails, and deep memory DB.
    If the user asks a question, run the tools to gather data and synthesize a comprehensive answer.
    If you spot back-to-back meetings, ALWAYS flag it.
    """,
    tools=[check_calendar, search_recent_emails, create_approval_request, fetch_memory_context],
)
