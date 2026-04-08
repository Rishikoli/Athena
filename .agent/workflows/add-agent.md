---
description: How to add a new ADK sub-agent to the AI Chief of Staff multi-agent system
---

# Skill: Add a New ADK Agent

Use this skill whenever you need to add a new specialized sub-agent to the Chief of Staff Agent Team.

## Step 1: Define the Agent's Purpose

Before writing any code, clearly define:
- **Name**: e.g. `compliance_agent`
- **Purpose**: One sentence — what does this agent do?
- **Tools it needs**: Which functions from `bindings.py` does it need access to?
- **Which parent agent routes to it**: Orchestrator? Execution Agent?

## Step 2: Create the Agent in `sub_agents.py`

Open `backend/app/agents/sub_agents.py`.

Use the `google-adk` LLM Agent pattern:

```python
from google.adk.agents import LlmAgent
from app.tools.bindings import tool_a, tool_b
from app.core.config import settings

new_agent = LlmAgent(
    name="compliance_agent",
    model=settings.GEMINI_MODEL_VERSION,
    description="Validates all workflow outputs against compliance rules.",
    instruction="""
    You are a Compliance Agent. Your job is to review each workflow step and 
    ensure it adheres to organizational policies. Use the provided tools to 
    check constraints. Always return a structured JSON result with 
    'is_compliant' (bool) and 'violations' (list).
    """,
    tools=[tool_a, tool_b],
)
```

## Step 3: Register with the Orchestrator Agent Team

Open `backend/app/agents/orchestrator.py`.

Import and add the new agent to the ADK `Agent team`:

```python
from app.agents.sub_agents import new_agent

orchestrator = AgentTeam(
    agents=[
        ...,
        new_agent,
    ]
)
```

## Step 4: Update the Orchestrator's Routing Logic

In `orchestrator.py`, update the system prompt to instruct the Orchestrator when to delegate to this new agent:

```
- Delegate to `compliance_agent` when the plan contains legally sensitive actions or financial transactions.
```

## Step 5: Test

Write an isolated test for the new agent using mock tool responses. Verify it returns the expected structured output without calling external APIs.

Run: `pytest backend/tests/agents/test_{agent_name}.py`
