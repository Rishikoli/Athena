---
description: Template for writing a new feature specification for the AI Chief of Staff system
---

# Skill: Feature Specification Template

Use this skill when you need to formally spec out a new feature before implementing it. Fill in every section before writing any code.

---

## Feature Spec Template

```markdown
# Feature: [Feature Name]

## Problem
[1-2 sentences: What problem does this solve? Why does it exist?]

## Proposed Solution
[1-2 sentences: What does this feature do at a high level?]

## Agent Involved
- Primary Agent: [Orchestrator / Knowledge / Execution / Scheduling / Intelligence]
- Sub-Agents Modified: [list specific sub-agents]

## New Tools Required
- [ ] [Tool name] — [What action it performs]
- [ ] [Tool name] — [What action it performs]

## New Data Sources Required
- [ ] [Source name] — [What data it provides]

## Database Changes
- [ ] New table: `table_name` with columns: `col1 (type)`, `col2 (type)`
- [ ] New column on existing table: `table_name.column_name (type)`
- [ ] No database changes required

## New API Endpoints
- `METHOD /api/v1/path` — [What it does]
- `METHOD /api/v1/path` — [What it does]

## Workflow Trigger
[How is this feature triggered? API call? Cron job? Event from external tool?]

## Expected Output
[What does the user receive when this feature completes? A document URL? A structured JSON? A Slack message?]

## Prompt Changes Required
- [ ] [Agent name] — [What needs to change in its prompt]

## Verification Steps
1. [Step to verify the feature works end-to-end]
2. [Step to verify edge cases are handled]

## Estimated Complexity
[ ] Small (< 1 day)
[ ] Medium (1-3 days)
[ ] Large (3+ days)
```

---

## Example: Feature Spec for "Morning Brief"

```markdown
# Feature: Daily Morning Brief

## Problem
Users have to manually check their calendar, tasks, and emails every morning to plan their day.

## Proposed Solution
Every morning at 7 AM, the Chief of Staff autonomously scans Calendar, Todoist, and Gmail, then generates a formatted "Morning Briefing" Google Doc.

## Agent Involved
- Primary Agent: Scheduling Agent
- Sub-Agents Modified: Availability Analyzer, Knowledge Agent (Document Generator)

## New Tools Required
- [x] `get_todays_events` — Reads today's Google Calendar events
- [x] `get_overdue_tasks` — Fetches overdue Todoist tasks

## New Data Sources Required
- [x] Gmail — Fetches unread emails from the last 24 hours

## Database Changes
- [ ] No database changes required

## New API Endpoints
- `POST /api/v1/workflows/morning-brief` — Manually triggers the morning brief

## Workflow Trigger
Google Cloud Scheduler cron job at 7:00 AM daily

## Expected Output
A Google Doc link containing today's schedule, overdue tasks, and email action items

## Verification Steps
1. Manually trigger `POST /api/v1/workflows/morning-brief` and verify a Google Doc is created in Drive
2. Verify the doc contains calendar events, tasks, and email summaries
```
