---
description: How to create reusable UI components for the AI Chief of Staff dashboard
---

# Skill: Build a UI Component

Use this skill whenever you need to add a new reusable React component to the Chief of Staff frontend dashboard.

## Rules for Components

1. All components live in `frontend/components/`
2. Each component is a single `.tsx` file
3. Props must be typed using a TypeScript interface
4. Components must be self-contained — no direct API calls inside them (use props)
5. Styling uses Tailwind CSS classes only
6. Use shadcn/ui primitives (Card, Badge, Button) where possible

## Component Template

```tsx
// frontend/components/{ComponentName}.tsx

interface {ComponentName}Props {
  // define props here
}

export function {ComponentName}({ }: {ComponentName}Props) {
  return (
    <div className="...">
      {/* component content */}
    </div>
  );
}
```

## Core Components to Build (Priority Order)

### WorkflowCard
Displays a single workflow with status badge, command text, timestamp, and action buttons (Approve, Cancel).

### AgentTrace
Renders the step-by-step agent reasoning chain for a workflow. Each step shows the Agent Name, Action Taken, and Result.

### TaskTimeline
A simple Gantt-style horizontal timeline showing tasks and their dependency links.

### MemorySearch
A search input that fetches and displays semantic memory results from the API.

### ToolPanel
A card per integration tool showing connection status and a button to configure credentials.

### StatusBadge
A simple reusable badge with variants: `pending`, `running`, `awaiting_approval`, `complete`, `failed`.

## Storybook

When adding a new component, always add a story file at:
`frontend/stories/{ComponentName}.stories.tsx`

This allows you to preview the component in isolation.
