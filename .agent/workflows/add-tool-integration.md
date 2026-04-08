---
description: How to add a new MCP tool integration to the AI Chief of Staff Execution Agent
---

# Skill: Add Tool Integration

Use this skill whenever you need to add a new MCP tool (e.g. Trello, HubSpot, Asana) to the Chief of Staff Execution Agent.

## Step 1: Create the Tool Wrapper

Create a new file at `backend/app/tools/{tool_name}_client.py`.

The file must expose:
- A connection/auth setup function
- One Python function per action the tool can perform (e.g. `create_task`, `update_status`)

Each function must:
- Accept only primitive Python types (str, int, list, dict) as arguments
- Return a plain dict result
- Handle errors gracefully with try/except and return `{"error": "..."}` on failure

Example structure:
```python
def create_task(title: str, project_id: str, due_date: str) -> dict:
    """Creates a new task in [Tool Name]."""
    try:
        # tool SDK call here
        return {"task_id": "...", "url": "..."}
    except Exception as e:
        return {"error": str(e)}
```

## Step 2: Register the Tool in the ADK Binding Layer

Open `backend/app/tools/bindings.py`.

Import your new tool functions and add them to the `ALL_TOOLS` list that is passed to the Execution Agent.

```python
from app.tools.{tool_name}_client import create_task, update_status

ALL_TOOLS = [
    ...,
    create_task,
    update_status,
]
```

## Step 3: Update the Execution Agent's System Prompt

Open `backend/app/agents/sub_agents.py` and find the `execution_agent` system prompt.

Add a short description of the new tool so Gemini 2.5 Flash knows when to use it:

```
- Use `create_task` to create a new task in [Tool Name] when the workflow requires task tracking.
```

## Step 4: Add ENV Variables

Add the required API keys to:
- `backend/.env` (local development)
- Google Secret Manager (production on Cloud Run)

Update `backend/app/core/config.py` to load the new key:
```python
TOOL_NAME_API_KEY: str = ""
```

## Step 5: Test

Write a unit test in `backend/tests/tools/test_{tool_name}_client.py` that mocks the tool SDK and validates the function returns the expected dict structure.

Run: `pytest backend/tests/tools/test_{tool_name}_client.py`
