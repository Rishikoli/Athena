---
description: How to build the AI Chief of Staff React/Next.js frontend dashboard
---

# Skill: Build the UI Dashboard

Use this skill to build or extend the frontend dashboard for the AI Chief of Staff system.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI primitives)
- **Animations**: Framer Motion (transitions, cards, physics) + ReactBits (specialized effects)
- **Graph**: React Flow (Living Project Graph — nodes, edges, custom components)
- **Data Viz**: D3.js (Reactor Core dials, ECG lines, thermometer SVGs)
- **3D Background**: Three.js / React Three Fiber (liquid mesh gradient shader)
- **State**: Zustand (global workflow + agent state)
- **Real-time**: SSE (Server-Sent Events) for agent trace streaming

- **Charts**: Recharts (for project health scores and velocity)

---

## Design System (Confirmed)

### Typography
```css
--font-primary: 'Gilroy', sans-serif;   /* All UI text, headers, labels */
--font-mono:    'JetBrains Mono';        /* Agent traces, code output only */
```
Import Gilroy via `@font-face` (self-hosted) or `fontsource`.

### Color Palette
```css
/* Surfaces */
--bg-base:    #E9EDF0;   /* Page background */
--bg-surface: #E6E9EF;   /* Card base color */

/* Accents */
--accent-red:    #FF7272; /* Danger, hot temp, errors */
--accent-blue:   #489CC1; /* Active agents, info, cool */
--accent-green:  #21A87D; /* Success, on-track, complete */
--accent-amber:  #F5A623; /* Warning, warm temp */
--accent-gold:   #E8B84B; /* Trophy, achievements */
--accent-purple: #8B6FD4; /* Memory / knowledge states */

/* Text */
--text-primary:   #2D3142;
--text-secondary: #6B7280;
--text-muted:     #9CA3AF;
```

### Neumorphic Shadow System (Exact Values)
```css
/* Raised card — default */
.neu-card {
  background: #E6E9EF;
  border-radius: 20px;
  box-shadow:
    -1px  -1px  1px  rgba(255,255,255,0.60),
    -20px -20px 40px rgba(255,255,255,1.00),
     20px  20px 40px rgba(211,219,230,1.00);
}

/* Inset / pressed state (command bar, inputs) */
.neu-inset {
  box-shadow:
    inset -4px -4px 8px rgba(255,255,255,0.80),
    inset  4px  4px 8px rgba(211,219,230,1.00);
}

/* Hover — lifted */
.neu-hover {
  box-shadow:
    -2px  -2px  4px  rgba(255,255,255,0.80),
    -28px -28px 56px rgba(255,255,255,1.00),
     28px  28px 56px rgba(211,219,230,1.00);
}
```

### Background Treatment
- Base: flat `#E9EDF0`
- Overlay: very subtle animated SVG noise texture (opacity: 0.03)
- Grain shifts slowly via CSS `@keyframes` to give depth
- No WebGL shader needed — keeps performance light

### Feature Color Mapping
| Feature | Color Used | Visual Effect |
|---|---|---|
| Thermometer fill (cool) | `#489CC1` | Rises from bottom |
| Thermometer fill (hot) | `#FF7272` | Rises + wave at top |
| Project card overheating | `#FF7272` | Shadow bleeds outward |
| Active agent card | `#489CC1` | BorderBeam traces edge |
| Workflow complete | `#21A87D` | Flood fills inward |
| Memory/knowledge state | `#8B6FD4` | Soft purple aura |
| Weekly trophy | `#E8B84B` | Gold particle forge |
| Reactor Core active ring | `#489CC1` | Embossed fill |
| Reactor Core warning | `#F5A623` | Color transition |
| Reactor Core overload | `#FF7272` | Bleeds to card edge |

---

## Dashboard Sections to Build

### 1. Workflow Command Center (Home)
- Large text input → "Give your Chief of Staff a command"
- Triggers `POST /api/v1/workflows/start`
- Shows live streaming agent reasoning trace as the workflow executes

### 2. Active Workflows Board
- Card-based view of all running/paused workflows
- Status badges (Pending, Running, Awaiting Approval, Complete, Failed)
- Quick "Approve" and "Cancel" actions for HITL workflows

### 3. Agent Reasoning Trace Viewer
- For each workflow, shows the step-by-step agent decisions
- Format: `Orchestrator → Planner → (Plan Generated) → Critic → (Validated) → Execution Agent → ...`
- Uses `GET /api/v1/workflows/{id}/trace`

### 4. Task Timeline (Gantt View)
- Visual Gantt chart of all tasks within a workflow
- Shows dependencies, deadlines, and completion status

### 5. Memory Explorer
- Semantic search bar: `GET /api/v1/memory/search?query=...`
- Results show past workflow summaries, decisions, and documents

### 6. Tool Integrations Panel
- List of all connected MCP tools (Slack, Gmail, Linear, etc.)
- Status indicators (Connected / Not Connected)
- Simple form to add API keys for new tools

## File Structure

```
frontend/
  app/
    layout.tsx              # Shell (sidebar + right panel + Three.js bg)
    page.tsx                # Home / Command Center
    portfolio/page.tsx      # Project cards grid
    workflows/[id]/page.tsx # Agent trace + heartbeat
    graph/page.tsx          # React Flow full-screen
    memory/page.tsx         # Semantic memory explorer
    analytics/page.tsx      # Efficiency trophy + heatmap
    integrations/page.tsx   # Tool connections panel
  components/
    ui/                     # shadcn base components
    shell/                  # Sidebar, RightPanel, Shell layout
    cards/                  # ProjectCard (temperature + ECG + glow)
    graph/                  # ReactFlowGraph, WorkflowNode, HealthEdge
    reactor/                # ReactorCore, SpeedometerGauge, BatteryBars
    temperature/            # Thermometer, CrackAnimation, FrostEffect
    trace/                  # AgentTrace, HeartbeatMonitor, StepNode
    background/             # LiquidCanvas (Three.js mesh shader)
    onboarding/             # SetupWizard (4-step stepper)
    input/                  # CommandBar, ContextDrawer, HITLModal
  lib/
    api.ts                  # FastAPI client (fetch + SSE)
    store.ts                # Zustand global state
    constants.ts            # Design tokens as JS
```

## Input Flow Architecture

### 1. Setup Wizard (First-Time Only)
A full-screen 4-step glassmorphic stepper rendered on first login:
1. **Connect Tools** — OAuth for Slack, Notion, Calendar, Gmail, Linear, Todoist, Figma
2. **Working Hours** — Schedule for Scheduling Agent
3. **Preferences** — Escalation thresholds, default owner, timezone
4. **Quick Test** — Run a demo onboarding workflow

### 2. Command Bar (Daily Use)
- Center-screen natural language input
- ReactBits `Ripple` on submit
- Framer Motion: bar animates away, trace feed expands below
- Reactor Core needle surges as agents activate

### 3. Context Drawer (AI-Triggered)
- Slides in from right via Framer Motion `x: '100%' → 0`
- Only shown when Critic Agent signals missing critical context
- Fields: Client Name, Deadline picker, Priority, Team, Tool selection
- Never a mandatory form — AI infers first, asks second

### 4. HITL Approval Modal
- Full-screen backdrop with Framer Motion `y: '100%' → 0` spring
- ReactBits `MagicCard` for the approval card
- Shows action description + agent reasoning + Reject/Edit/Approve
- Calls `POST /api/v1/workflows/{id}/approve`

## ReactBits Component Map

| ReactBits Component | Where Used |
|---|---|
| `TextShimmer` | Agent names activating in trace viewer |
| `SplitText` | Hero text entrance animation on home |
| `AnimatedList` | Task list in workflow detail |
| `GlowingCard` | Project cards with temperature aura |
| `Meteors` | Background particles on command center |
| `BorderBeam` | Active agent card animated gradient border |
| `MagicCard` | HITL approval modal |
| `SpinningText` | "Processing..." ring around Reactor Core |
| `NumberTicker` | Efficiency score + temperature live updates |
| `AnimatedCircularProgress` | Reactor Core outer ring dials |
| `Ripple` | Command bar submit click effect |

## SSE Streaming Integration

To stream agent reasoning live from FastAPI to the UI:

```typescript
const eventSource = new EventSource(`${API_BASE}/api/v1/workflows/${id}/stream`);
eventSource.onmessage = (event) => {
  const step = JSON.parse(event.data);
  setTrace(prev => [...prev, step]);
};
```
