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
  type EdgeProps,
  getBezierPath,
  BaseEdge,
  type EdgeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Cpu, Brain, Zap, Database, Wrench, Network, Activity } from "lucide-react";
import { motion } from "framer-motion";

import ShinyText from "@/components/ui/react-bits/ShinyText";

// -------- Custom edge type (Operating Theater) ------------

function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Determine speed based on label or ID
  let duration = "3s";
  if (label === "EXECUTE") duration = "1.5s";
  if (label === "PRIMING") duration = "4s";

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, strokeDasharray: '5,5', animation: `flow ${duration === '1.5s' ? '10s' : '20s'} linear infinite` }} />
      <circle r="3" fill={style.stroke || "#489CC1"}>
        <animateMotion dur={duration} repeatCount="indefinite" path={edgePath} />
      </circle>
      <circle r="2" fill="white" opacity="0.6">
        <animateMotion dur={duration} repeatCount="indefinite" path={edgePath} begin="0.75s" />
      </circle>
    </>
  );
}

const edgeTypes: EdgeTypes = {
  animated: AnimatedEdge,
};

// -------- Custom node types ------------

const NODE_STYLES: Record<string, { color: string; icon: React.ElementType; gradient: string }> = {
  orchestrator: { color: "#489CC1", icon: Cpu,      gradient: "radial-gradient(circle at center, rgba(72,156,193,0.15), transparent)" },
  planner:      { color: "#8B6FD4", icon: Brain,    gradient: "radial-gradient(circle at center, rgba(139,111,212,0.15), transparent)" },
  executor:     { color: "#21A87D", icon: Zap,      gradient: "radial-gradient(circle at center, rgba(33,168,125,0.15), transparent)" },
  memory:       { color: "#E8B84B", icon: Database,  gradient: "radial-gradient(circle at center, rgba(232,184,75,0.15), transparent)" },
  tool:         { color: "#9CA3AF", icon: Wrench,   gradient: "radial-gradient(circle at center, rgba(156,163,175,0.15), transparent)" },
};

function AgentNode({ data }: NodeProps) {
  const style = NODE_STYLES[data.type as string] ?? NODE_STYLES.tool;
  const Icon = style.icon;

  return (
    <div
      className="glass-panel p-5 rounded-[2rem] border-white/5 bg-white/2 hover:border-white/10 transition-all group"
      style={{
        minWidth: 200,
        boxShadow: `0 0 30px ${style.color}05`,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: style.color, border: "none", width: 10, height: 10, boxShadow: `0 0 10px ${style.color}` }} />
      <div className="flex items-center gap-4 mb-4">
        <div 
          className="w-10 h-10 rounded-2xl flex items-center justify-center border border-white/5 transition-transform group-hover:scale-110"
          style={{ background: style.gradient }}
        >
          <Icon size={18} color={style.color} />
        </div>
        <div>
          <span style={{ color: style.color }}>
            <ShinyText 
              text={data.label as string} 
              className="text-[10px] font-black uppercase tracking-widest"
            />
          </span>
          <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">{data.subtitle as string}</div>
        </div>
        <div className={`ml-auto w-2 h-2 rounded-full ${data.active ? 'heartbeat-dot' : 'bg-slate-800'}`} style={{ color: style.color }} />
      </div>
      {(data.tools as string[])?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {(data.tools as string[]).map((t: string) => (
            <span key={t} className="text-[9px] font-black px-2 py-1 rounded-lg border border-white/5 bg-white/2 text-slate-500 uppercase tracking-tighter">
              {t}
            </span>
          ))}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} style={{ background: style.color, border: "none", width: 10, height: 10, boxShadow: `0 0 10px ${style.color}` }} />
    </div>
  );
}

const nodeTypes: NodeTypes = { agent: AgentNode };

// -------- Static graph definition --------

const initialNodes: Node[] = [
  {
    id: "orchestrator",
    type: "agent",
    position: { x: 300, y: 20 },
    data: { label: "Athena Orchestrator", subtitle: "Router & Delegator", type: "orchestrator", active: true, tools: [] },
  },
  {
    id: "memory-agent",
    type: "agent",
    position: { x: -20, y: 200 },
    data: { label: "Memory Agent", subtitle: "pgvector → Context", type: "memory", active: true, tools: ["fetch_context"] },
  },
  {
    id: "planner",
    type: "agent",
    position: { x: 180, y: 380 },
    data: { label: "Planner Agent", subtitle: "Strategic Decomposer", type: "planner", active: true, tools: ["plan_steps"] },
  },
  {
    id: "verification",
    type: "agent",
    position: { x: 420, y: 380 },
    data: { label: "Verification Agent", subtitle: "Safety Gate", type: "orchestrator", active: true, tools: ["verdict"] },
  },
  {
    id: "executor",
    type: "agent",
    position: { x: 600, y: 200 },
    data: { label: "Execution Agent", subtitle: "Action Engine", type: "executor", active: true, tools: ["tools", "memory"] },
  },
  {
    id: "alloydb",
    type: "agent",
    position: { x: -40, y: 420 },
    data: { label: "AlloyDB + pgvector", subtitle: "Semantic Store", type: "memory", active: true, tools: ["vector_search"] },
  },
  {
    id: "tool-calendar",
    type: "agent",
    position: { x: 500, y: 540 },
    data: { label: "Calendar Tool", subtitle: "Google Workspace", type: "tool", active: false, tools: [] },
  },
  {
    id: "tool-email",
    type: "agent",
    position: { x: 720, y: 540 },
    data: { label: "Email Tool", subtitle: "Gmail API", type: "tool", active: false, tools: [] },
  },
];

const initialEdges: Edge[] = [
  {
    id: "orch-memory",
    source: "orchestrator", target: "memory-agent",
    type: "animated", label: "PRIMING",
    style: { stroke: "#E8B84B", strokeWidth: 2, opacity: 0.6 },
    labelStyle: { fill: "#E8B84B", fontSize: 10, fontWeight: 900, letterSpacing: '0.1em' },
    labelBgStyle: { fill: "#0A0C10", fillOpacity: 0.8 },
  },
  {
    id: "orch-planner",
    source: "orchestrator", target: "planner",
    type: "animated", label: "STRATEGY",
    style: { stroke: "#8B6FD4", strokeWidth: 2, opacity: 0.6 },
    labelStyle: { fill: "#8B6FD4", fontSize: 10, fontWeight: 900, letterSpacing: '0.1em' },
    labelBgStyle: { fill: "#0A0C10", fillOpacity: 0.8 },
  },
  {
    id: "orch-verify",
    source: "orchestrator", target: "verification",
    type: "animated", label: "VALIDATE",
    style: { stroke: "#489CC1", strokeWidth: 2, opacity: 0.6 },
    labelStyle: { fill: "#489CC1", fontSize: 10, fontWeight: 900, letterSpacing: '0.1em' },
    labelBgStyle: { fill: "#0A0C10", fillOpacity: 0.8 },
  },
  {
    id: "orch-executor",
    source: "orchestrator", target: "executor",
    type: "animated", label: "EXECUTE",
    style: { stroke: "#21A87D", strokeWidth: 2, opacity: 0.6 },
    labelStyle: { fill: "#21A87D", fontSize: 10, fontWeight: 900, letterSpacing: '0.1em' },
    labelBgStyle: { fill: "#0A0C10", fillOpacity: 0.8 },
  },
  {
    id: "memory-db",
    source: "memory-agent", target: "alloydb",
    animated: false,
    style: { stroke: "#E8B84B", strokeWidth: 1.5, strokeDasharray: "4 3", opacity: 0.4 },
    label: "VECTOR SEARCH",
    labelStyle: { fill: "#E8B84B", fontSize: 8, fontWeight: 700 },
    labelBgStyle: { fill: "#0A0C10", fillOpacity: 0.8 },
  },
  {
    id: "exec-calendar",
    source: "executor", target: "tool-calendar",
    animated: false,
    style: { stroke: "#9CA3AF", strokeWidth: 1.5, strokeDasharray: "4 3", opacity: 0.3 },
  },
  {
    id: "exec-email",
    source: "executor", target: "tool-email",
    animated: false,
    style: { stroke: "#9CA3AF", strokeWidth: 1.5, strokeDasharray: "4 3", opacity: 0.3 },
  },
  {
    id: "exec-memory",
    source: "executor", target: "alloydb",
    animated: false,
    style: { stroke: "#21A87D", strokeWidth: 1, strokeDasharray: "3 4", opacity: 0.2 },
  },
];

// -------- Page --------

export default function GraphPage() {
  const onInit = useCallback((instance: { fitView: () => void }) => {
    instance.fitView();
  }, []);

  return (
    <div className="relative w-full h-full p-6 lg:p-12 flex flex-col overflow-hidden">
      {/* Aurora Background Effect */}
      <div className="aurora top-[-20%] right-[-10%] opacity-20" />
      <div className="aurora bottom-[-20%] left-[-10%] opacity-10" style={{ background: "radial-gradient(circle, rgba(139, 111, 212, 0.1) 0%, transparent 70%)" }} />

      <div className="max-w-7xl mx-auto w-full h-full flex flex-col space-y-10 z-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="space-y-3">
             <div className="flex items-center gap-3">
                <div className="p-2.5 bg-accent-blue/10 text-accent-blue rounded-xl border border-accent-blue/20">
                   <Network size={20} />
                </div>
                <p className="text-[10px] font-black tracking-[0.3em] uppercase text-accent-blue opacity-80">Logic Topology</p>
             </div>
             <h1 className="text-5xl font-medium tracking-tight text-white/90">
               Neural <span className="font-extralight italic">Architecture</span>
             </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-5 p-4 rounded-3xl glass-panel border-white/5 bg-white/1">
            {[
              { label: "ORCHESTRATOR", color: "#489CC1" },
              { label: "PLANNER", color: "#8B6FD4" },
              { label: "EXECUTOR", color: "#21A87D" },
              { label: "MEMORY", color: "#E8B84B" },
              { label: "TOOL", color: "#9CA3AF" },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ color }} />
                <span className="text-[9px] font-black tracking-widest text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </header>

        {/* React Flow canvas */}
        <div className="flex-1 glass-panel-heavy rounded-[3.5rem] border-white/5 overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.3)]">
          <ReactFlow
            nodes={initialNodes}
            edges={initialEdges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onInit={onInit as any}
            fitView
            style={{ background: "transparent" }}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#ffffff" gap={32} size={1} style={{ opacity: 0.05 }} />
            <Controls className="glass-panel !bg-black/40 !border-white/10 !rounded-2xl !p-2 !shadow-2xl" />
            <MiniMap
              className="!bg-black/40 !border-white/10 !rounded-3xl !overflow-hidden !shadow-2xl"
              nodeColor={(n) => {
                const t = n.data?.type as string;
                return NODE_STYLES[t]?.color ?? "#9CA3AF";
              }}
              maskColor="rgba(0, 0, 0, 0.4)"
            />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
