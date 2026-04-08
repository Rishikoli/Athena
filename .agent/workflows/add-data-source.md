---
description: How to add a new external data source to the AI Chief of Staff Knowledge Agent
---

# Skill: Add a New Data Source

Use this skill to wire in a new external data source (e.g. Figma, GitHub, YouTube) that feeds context into the Knowledge Agent's memory system.

## Supported Data Sources
- Web Search (Serper / Tavily API)
- Figma (Design status)
- Google Drive (Documents)
- Gmail (Emails)
- GitHub (PRs / commits)
- YouTube Transcripts (Meeting recordings)

## Step 1: Create the Connector

Create `backend/app/data_sources/{source_name}_connector.py`.

Each connector must implement a single `fetch(query: str) -> list[dict]` function:

```python
def fetch(query: str) -> list[dict]:
    """
    Fetches relevant data from [Source Name].
    Returns a list of records, each with 'content' and 'metadata' keys.
    """
    results = []
    # API call to the data source
    results.append({
        "content": "...",  # the actual text/transcript/document content
        "metadata": {
            "source": "{source_name}",
            "url": "...",
            "timestamp": "...",
        }
    })
    return results
```

## Step 2: Register in the Knowledge Agent

Open `backend/app/agents/knowledge.py`.

Import and add to the `DATA_SOURCES` registry:

```python
from app.data_sources.{source_name}_connector import fetch as fetch_{source_name}

DATA_SOURCES = {
    ...,
    "{source_name}": fetch_{source_name},
}
```

## Step 3: Feed Into Memory

The Knowledge Agent automatically passes fetched content through `memory_ops.save_memory()` to embed and store it in AlloyDB.

Ensure the connector's `content` field is clean plain text (strip HTML/markdown if needed) before it reaches the embedding step.

## Step 4: Add ENV Variables

Add required API keys to `backend/.env` and `backend/app/core/config.py`:

```python
SOURCE_NAME_API_KEY: str = ""
```

For YouTube Transcripts, use the `youtube-transcript-api` library (no API key required for public videos).

## Step 5: Test

Validate the connector's `fetch()` function returns a non-empty list of properly structured records for a known test query.

Run: `pytest backend/tests/data_sources/test_{source_name}_connector.py`
