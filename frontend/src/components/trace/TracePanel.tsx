"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Clock, Cpu, Brain, Zap, Bot, Database, ShieldCheck } from "lucide-react";

export interface TraceEvent {
  trace: string;
  agent?: string;
  status?: string;
  error?: string;
  timestamp?: number;
}

interface TracePanelProps {
  events: TraceEvent[];
  isExecuting: boolean;
}

// --- Agent Metadata ----------
const AGENT_META: Record<string, { label: string; color: string; icon: React.ElementType; emoji: string }> = {
  AthenaOrchestrator: { label: "Orchestrator",        color: "#489CC1", icon: Cpu,   emoji: "🧠" },
  PlannerAgent:       { label: "Planner",              color: "#8B6FD4", icon: Brain, emoji: "📋" },
  ExecutionAgent:     { label: "Executor",             color: "#21A87D", icon: Zap,   emoji: "⚡" },
  MemoryAgent:        { label: "Memory",               color: "#E8B84B", icon: Database, emoji: "🗄️" },
  VerificationAgent:  { label: "Verification",         color: "#FF7272", icon: ShieldCheck, emoji: "🛡️" },
  System:             { label: "System",               color: "#64748B", icon: Bot,   emoji: "🤖" },
};

function getAgentMeta(agent?: string) {
  if (!agent) return AGENT_META["System"];
  for (const key of Object.keys(AGENT_META)) {
    if (agent.includes(key)) return AGENT_META[key];
  }
  return AGENT_META["System"];
}

// --- Try to parse JSON plan steps from agent output ---
function parsePlanSteps(text: string): { step: string; tool?: string }[] | null {
  try {
    const match = text.match(/```json\s*([\s\S]*?)```/);
    if (match) {
      const arr = JSON.parse(match[1]);
      if (Array.isArray(arr) && arr[0]?.step) return arr;
    }
    const arr = JSON.parse(text);
    if (Array.isArray(arr) && arr[0]?.step) return arr;
  } catch {}
  return null;
}

// --- Step Card for structured plan items ---
function PlanStepCard({ step, tool, index }: { step: string; tool?: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className="flex items-start gap-4 p-4 rounded-2xl glass-card"
    >
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black font-mono flex-shrink-0 mt-0.5 shadow-[0_0_10px_rgba(72,156,193,0.3)]"
        style={{ background: "#489CC1", color: "#fff" }}
      >
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white/90 leading-relaxed">{step}</p>
        {tool && (
          <span
            className="inline-block mt-2 text-[10px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest"
            style={{ background: "rgba(139, 111, 212, 0.15)", color: "#8B6FD4" }}
          >
            {tool}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// --- Individual trace row ---
function TraceRow({ event, index }: { event: TraceEvent; index: number }) {
  const isSystem = !event.agent && !event.error;
  const isError  = !!event.error || event.status === "failed";
  const isDone   = event.status === "completed";

  const rawText = event.trace.replace(/^\[[\w]+\]\s*/, "");
  const meta     = getAgentMeta(event.agent);
  const Icon     = meta.icon;
  const planSteps = event.agent ? parsePlanSteps(rawText) : null;

  if (isSystem && !isError && !isDone) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.04 }}
        className="flex items-center gap-3 py-1.5 px-2"
      >
        <div className="w-1 h-1 rounded-full flex-shrink-0 bg-slate-500" />
        <span className="text-xs font-mono font-medium text-slate-500 tracking-tight">{event.trace}</span>
      </motion.div>
    );
  }

  if (isDone) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 py-4 px-6 rounded-3xl glass-panel border-accent-green/30"
      >
        <div className="p-2 bg-accent-green/20 rounded-xl">
           <CheckCircle size={18} className="text-accent-green" />
        </div>
        <span className="text-sm font-bold text-accent-green uppercase tracking-widest">{event.trace}</span>
      </motion.div>
    );
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-4 py-4 px-6 rounded-3xl glass-panel border-accent-red/30"
      >
        <div className="p-2 bg-accent-red/20 rounded-xl">
           <AlertCircle size={18} className="text-accent-red" />
        </div>
        <span className="text-sm font-mono font-medium text-accent-red tracking-tight">{event.error || event.trace}</span>
      </motion.div>
    );
  }

  // Agent card
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-panel rounded-[2rem] p-6 space-y-4"
      style={{ borderLeft: `2px solid ${meta.color}` }}
    >
      {/* Agent header */}
      <div className="flex items-center gap-3">
        <div
          className="p-2.5 rounded-xl flex items-center justify-center"
          style={{ background: `${meta.color}15` }}
        >
          <Icon size={16} style={{ color: meta.color }} />
        </div>
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: meta.color }}>
            {meta.label} PHASE
          </span>
          <p className="text-[10px] font-bold text-slate-500">Live Process · Instance {Math.floor(Math.random() * 999)}</p>
        </div>
        <div className="flex-1" />
        <div className="w-1.5 h-1.5 rounded-full heartbeat-dot" style={{ background: meta.color }} />
      </div>

      {/* Content */}
      {planSteps ? (
        <div className="space-y-3 pt-2">
          {planSteps.map((s, i) => (
            <PlanStepCard key={i} step={s.step} tool={s.tool} index={i} />
          ))}
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-white/80 font-medium pl-1">{rawText}</p>
      )}
    </motion.div>
  );
}

// --- Main TracePanel export ---
export function TracePanel({ events, isExecuting }: TracePanelProps) {
  if (events.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full mt-12 rounded-[2.5rem] glass-panel overflow-hidden border-white/5"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/2">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-accent-red opacity-40" />
              <div className="w-3 h-3 rounded-full bg-accent-amber opacity-40" />
              <div className="w-3 h-3 rounded-full bg-accent-green opacity-40" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
               Mission Activity Trace
            </span>
          </div>
          {isExecuting && (
            <div className="flex items-center gap-3 text-accent-blue font-bold">
               <div className="w-3 h-3 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
               <span className="text-[10px] uppercase tracking-widest font-black">Synthesizing</span>
            </div>
          )}
        </div>

        {/* Events */}
        <div className="p-8 space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar">
          {events.map((evt, i) => (
            <TraceRow key={i} event={evt} index={i} />
          ))}
          
          {isExecuting && (
            <div className="flex justify-center py-4">
               <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                      className="w-1.5 h-1.5 rounded-full bg-accent-blue"
                    />
                  ))}
               </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
