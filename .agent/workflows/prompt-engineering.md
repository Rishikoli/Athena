---
description: Guidelines for writing and iterating on system prompts for all AI Chief of Staff ADK agents
---

# Skill: Prompt Engineering for ADK Agents

Use this skill whenever you are writing or updating the system prompt (instruction) for any of the 5 core agents or their sub-agents.

## Core Principles

1. **Be Role-Specific**: Each agent must have a single, sharp identity. The Critic agent is NOT a planner. The Scheduler is NOT a document generator.
2. **Define Output Format**: Always tell the agent exactly what format to return (JSON, bullet list, structured plan). Never leave the output format ambiguous.
3. **State Tool Usage Explicitly**: List which tools are available and when to use each one.
4. **Constrain Scope**: Tell the agent what it should NOT do. This prevents scope creep between agents.
5. **Provide Examples**: For complex agents, include 1-2 input/output examples directly in the prompt.

## Prompt Template for Each Agent

```
You are the [AGENT NAME] for an AI Chief of Staff system.

ROLE:
[One sentence description of this agent's job]

YOUR RESPONSIBILITIES:
- [Specific responsibility 1]
- [Specific responsibility 2]
- [Specific responsibility 3]

TOOLS AVAILABLE:
- `tool_name`: Use when [specific condition]
- `tool_name_2`: Use when [specific condition]

OUTPUT FORMAT:
Always return a JSON object with the following structure:
{
  "status": "success" | "failed" | "needs_approval",
  "result": {...},
  "next_agent": "agent_name" | null,
  "reasoning": "Brief explanation of your decision"
}

DO NOT:
- [What this agent must NOT attempt]
- Delegate tasks that belong to the [OTHER AGENT NAME]
```

## Agent-Specific Prompt Notes

### Orchestrator Agent
- Must always output a `next_agent` field to drive routing
- Should never execute tools directly — only route

### Planner Sub-Agent
- Output must always be a DAG (list of tasks with `depends_on` arrays)
- Never schedule — only plan

### Critic Sub-Agent
- Output must include a `confidence_score` (0.0 to 1.0)
- If below 0.7, set status to `needs_revision`

### Scheduling Agent
- Always check Calendar availability before proposing a time
- Must respect working hours (9 AM - 6 PM by default)

### Intelligence Agent
- Must always produce at least one `recommendation` entry
- Should compare against past similar workflows stored in memory

## Iteration Process

1. Write the prompt
2. Run a test workflow with a simple command
3. Check the agent's `reasoning` field in the trace
4. If the agent is doing the wrong thing → add a constraint to the prompt
5. If the output format is wrong → tighten the OUTPUT FORMAT section
6. Repeat until 3 consecutive test workflows pass
