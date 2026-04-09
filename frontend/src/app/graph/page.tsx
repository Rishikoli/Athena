"use client";

import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Cpu, Brain, Zap, Database, Wrench } from "lucide-react";

// -------- Custom node types ------------

const NODE_STYLES: Record<string, { color: string; icon: React.ElementType; gradient: string }> = {
  orchestrator: { color: "#489CC1", icon: Cpu,      gradient: "linear-gradient(135deg,#489CC130,#489CC108)" },
  planner:      { color: "#8B6FD4", icon: Brain,    gradient: "linear-gradient(135deg,#8B6FD430,#8B6FD408)" },
  executor:     { color: "#21A87D", icon: Zap,      gradient: "linear-gradient(135deg,#21A87D30,#21A87D08)" },
  memory:       { color: "#E8B84B", icon: Database,  gradient: "linear-gradient(135deg,#E8B84B30,#E8B84B08)" },
  tool:         { color: "#9CA3AF", icon: Wrench,   gradient: "linear-gradient(135deg,#9CA3AF30,#9CA3AF08)" },
};

function AgentNode({ data }: NodeProps) {
  const style = NODE_STYLES[data.type as string] ?? NODE_STYLES.tool;
  const Icon = style.icon;

  return (
    <div
      style={{
        background: "#E6E9EF",
        borderRadius: 20,
        padding: "16px 20px",
        minWidth: 180,
        boxShadow: "-8px -8px 20px rgba(255,255,255,1), 8px 8px 20px rgba(211,219,230,1)",
        border: `1.5px solid ${style.color}30`,
        position: "relative",
        fontFamily: "inherit",
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: style.color, border: "none", width: 8, height: 8 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: style.gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={16} color={style.color} />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: style.color }}>{data.label as string}</div>
          <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 1 }}>{data.subtitle as string}</div>
        </div>
        <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: data.active ? style.color : "#D1DBE6" }} />
      </div>
      {(data.tools as string[])?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {(data.tools as string[]).map((t: string) => (
            <span key={t} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: `${style.color}18`, color: style.color, fontFamily: "monospace" }}>
              {t}
            </span>
          ))}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} style={{ background: style.color, border: "none", width: 8, height: 8 }} />
    </div>
  );
}

const nodeTypes: NodeTypes = { agent: AgentNode };

// -------- Static graph definition --------

const initialNodes: Node[] = [
  // Orchestrator (top center)
  {
    id: "orchestrator",
    type: "agent",
    position: { x: 300, y: 20 },
    data: { label: "Athena Orchestrator", subtitle: "Router & Delegator", type: "orchestrator", active: true, tools: [] },
  },
  // Memory Agent (left)
  {
    id: "memory-agent",
    type: "agent",
    position: { x: -20, y: 200 },
    data: { label: "Memory Agent", subtitle: "pgvector → Context Briefing", type: "memory", active: true, tools: ["fetch_memory_context"] },
  },
  // Planner (center-left)
  {
    id: "planner",
    type: "agent",
    position: { x: 180, y: 380 },
    data: { label: "Planner Agent", subtitle: "Decompose → JSON Plan", type: "planner", active: true, tools: ["plan_steps"] },
  },
  // Verification (center-right)
  {
    id: "verification",
    type: "agent",
    position: { x: 420, y: 380 },
    data: { label: "Verification Agent", subtitle: "Safety & Compliance Gate", type: "orchestrator", active: true, tools: ["verdict"] },
  },
  // Executor (right)
  {
    id: "executor",
    type: "agent",
    position: { x: 600, y: 200 },
    data: { label: "Execution Agent", subtitle: "Action Runner", type: "executor", active: true, tools: ["calendar", "emails", "approvals", "memory"] },
  },
  // AlloyDB memory store
  {
    id: "alloydb",
    type: "agent",
    position: { x: -40, y: 420 },
    data: { label: "AlloyDB + pgvector", subtitle: "Semantic Memory Store", type: "memory", active: true, tools: ["vector_search", "embed"] },
  },
  // Tool nodes
  {
    id: "tool-calendar",
    type: "agent",
    position: { x: 500, y: 540 },
    data: { label: "Calendar Tool", subtitle: "Mock → Real GCal", type: "tool", active: false, tools: [] },
  },
  {
    id: "tool-email",
    type: "agent",
    position: { x: 720, y: 540 },
    data: { label: "Email Tool", subtitle: "Mock → Gmail", type: "tool", active: false, tools: [] },
  },
];

const initialEdges: Edge[] = [
  // Orchestrator → Memory Agent (step 1)
  {
    id: "orch-memory",
    source: "orchestrator", target: "memory-agent",
    animated: true, label: "① retrieve context",
    style: { stroke: "#E8B84B", strokeWidth: 2 },
    labelStyle: { fill: "#E8B84B", fontSize: 11, fontWeight: 600 },
    labelBgStyle: { fill: "#E6E9EF" },
  },
  // Orchestrator → Planner (step 2)
  {
    id: "orch-planner",
    source: "orchestrator", target: "planner",
    animated: true, label: "② plan task",
    style: { stroke: "#8B6FD4", strokeWidth: 2 },
    labelStyle: { fill: "#8B6FD4", fontSize: 11, fontWeight: 600 },
    labelBgStyle: { fill: "#E6E9EF" },
  },
  // Orchestrator → Verification (step 3)
  {
    id: "orch-verify",
    source: "orchestrator", target: "verification",
    animated: true, label: "③ verify plan",
    style: { stroke: "#489CC1", strokeWidth: 2 },
    labelStyle: { fill: "#489CC1", fontSize: 11, fontWeight: 600 },
    labelBgStyle: { fill: "#E6E9EF" },
  },
  // Orchestrator → Executor (step 4)
  {
    id: "orch-executor",
    source: "orchestrator", target: "executor",
    animated: true, label: "④ execute",
    style: { stroke: "#21A87D", strokeWidth: 2 },
    labelStyle: { fill: "#21A87D", fontSize: 11, fontWeight: 600 },
    labelBgStyle: { fill: "#E6E9EF" },
  },
  // Memory Agent ↔ AlloyDB
  {
    id: "memory-db",
    source: "memory-agent", target: "alloydb",
    animated: false,
    style: { stroke: "#E8B84B", strokeWidth: 1.5, strokeDasharray: "4 3" },
    label: "cosine search",
    labelStyle: { fill: "#E8B84B", fontSize: 10 },
    labelBgStyle: { fill: "#E6E9EF" },
  },
  // Executor tools
  {
    id: "exec-calendar",
    source: "executor", target: "tool-calendar",
    animated: false,
    style: { stroke: "#9CA3AF", strokeWidth: 1.5, strokeDasharray: "4 3" },
  },
  {
    id: "exec-email",
    source: "executor", target: "tool-email",
    animated: false,
    style: { stroke: "#9CA3AF", strokeWidth: 1.5, strokeDasharray: "4 3" },
  },
  // Executor also queries memory
  {
    id: "exec-memory",
    source: "executor", target: "alloydb",
    animated: false,
    style: { stroke: "#21A87D", strokeWidth: 1, strokeDasharray: "3 4", opacity: 0.5 },
  },
];

// -------- Page --------

export default function GraphPage() {
  const onInit = useCallback((instance: { fitView: () => void }) => {
    instance.fitView();
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-normal tracking-tight" style={{ color: "var(--text-primary)" }}>Agent Delegation Map</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Live topology of the Athena multi-agent system</p>
        </div>
        <div className="flex items-center gap-3">
          {[
            { label: "Orchestrator", color: "#489CC1" },
            { label: "Planner", color: "#8B6FD4" },
            { label: "Executor", color: "#21A87D" },
            { label: "Memory", color: "#E8B84B" },
            { label: "Tool", color: "#9CA3AF" },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* React Flow canvas */}
      <div className="flex-1 mx-6 mb-6 rounded-3xl overflow-hidden" style={{
        background: "#E6E9EF",
        boxShadow: "-20px -20px 40px rgba(255,255,255,1), 20px 20px 40px rgba(211,219,230,1)",
      }}>
        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
          nodeTypes={nodeTypes}
          onInit={onInit as any}
          fitView
          style={{ background: "transparent" }}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#C5CDD8" gap={24} size={1} style={{ opacity: 0.4 }} />
          <Controls style={{ background: "#E6E9EF", border: "none", boxShadow: "-4px -4px 8px rgba(255,255,255,0.8), 4px 4px 8px rgba(211,219,230,1)", borderRadius: 12 }} />
          <MiniMap
            nodeColor={(n) => {
              const t = n.data?.type as string;
              return NODE_STYLES[t]?.color ?? "#9CA3AF";
            }}
            style={{ background: "#DDE1E7", borderRadius: 12 }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
