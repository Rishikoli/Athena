---
description: Defines how the AI Chief of Staff stores, ranks, compresses, and retrieves long-term memory using AlloyDB and pgvector
---

# Skill: Memory Strategy

Use this skill when modifying how the Knowledge Agent stores or retrieves context from AlloyDB.

## Memory Architecture

The Chief of Staff has two tiers of memory:

### Tier 1: Short-Term (Workflow State)
- Stored in AlloyDB `workflow_jobs` table as structured JSON
- Cleared after the workflow reaches a terminal state (completed/failed)
- Used within a single workflow execution session

### Tier 2: Long-Term (Semantic Memory)
- Stored in AlloyDB `workflow_memory` table as text + vector embeddings
- Persists indefinitely (with importance-ranked pruning)
- Retrieved via Cosine Similarity search before every new workflow starts

## Embedding Model

Use **Google text-embedding-004** via the Vertex AI SDK:
- Dimension: 768
- Task type: `RETRIEVAL_DOCUMENT` for storing, `RETRIEVAL_QUERY` for searching

## What Gets Stored in Long-Term Memory

| Event | What is Stored |
|---|---|
| Workflow completed | Final plan + outcome summary + tool results |
| Critic rejection | Rejection reason + re-plan summary |
| HITL approval | User decision + context |
| Intelligence Agent insight | Optimization rule or pattern detected |
| Document created | Document title + summary + Drive URL |

## Memory Importance Ranking

Not all memories are equal. Score memories on insertion:

| Factor | Weight |
|---|---|
| Workflow was successful | +0.3 |
| Human explicitly approved | +0.2 |
| Novel pattern (not seen before) | +0.3 |
| High number of tasks completed | +0.2 |

Store the score in a `importance_score` float column. During retrieval, boost results with higher importance scores.

## Retrieval Strategy

Before every new workflow, the Knowledge Agent:
1. Embeds the incoming command using `RETRIEVAL_QUERY`
2. Queries `workflow_memory` for top-5 nearest neighbors by Cosine distance
3. Filters results where `importance_score > 0.4`
4. Injects the retrieved memories into the Orchestrator's context window

## Memory Compression

To avoid context window overflow:
- After a workflow session, use Gemini 2.5 Flash to summarize the full execution log into a 200-word memory entry
- Store this compressed version — NOT raw logs — in `workflow_memory`
- Raw logs are stored separately in `workflow_jobs.execution_log` for debugging

## Pruning Policy

Monthly maintenance job:
- Delete memories with `importance_score < 0.2` older than 90 days
- Keep all memories with `importance_score >= 0.5` indefinitely
