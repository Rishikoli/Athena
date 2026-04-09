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
  AthenaOrchestrator: { label: "Orchestrator",        color: "var(--accent-blue)",   icon: Cpu,   emoji: "🧠" },
  PlannerAgent:       { label: "Planner",              color: "var(--accent-purple)", icon: Brain, emoji: "📋" },
  ExecutionAgent:     { label: "Executor",             color: "var(--accent-green)",  icon: Zap,   emoji: "⚡" },
  MemoryAgent:        { label: "Memory",               color: "var(--accent-gold)",   icon: Database, emoji: "🗄️" },
  VerificationAgent:  { label: "Verification",         color: "var(--accent-red)",    icon: ShieldCheck, emoji: "🛡️" },
  System:             { label: "System",               color: "var(--text-muted)",    icon: Bot,   emoji: "🤖" },
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
    // Try raw JSON
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
      className="flex items-start gap-3 p-3 rounded-xl"
      style={{ background: "rgba(72, 156, 193, 0.06)", border: "1px solid rgba(72, 156, 193, 0.15)" }}
    >
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono flex-shrink-0 mt-0.5"
        style={{ background: "var(--accent-blue)", color: "#fff" }}
      >
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm" style={{ color: "var(--text-primary)" }}>{step}</p>
        {tool && (
          <span
            className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-mono"
            style={{ background: "rgba(139, 111, 212, 0.15)", color: "var(--accent-purple)" }}
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

  // Strip the [AgentName] prefix from text
  const rawText = event.trace.replace(/^\[[\w]+\]\s*/, "");
  const meta     = getAgentMeta(event.agent);
  const Icon     = meta.icon;
  const planSteps = event.agent ? parsePlanSteps(rawText) : null;

  if (isSystem && !isError && !isDone) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        className="flex items-center gap-3 py-1"
      >
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--text-muted)" }} />
        <span className="text-sm font-mono" style={{ color: "var(--text-muted)" }}>{event.trace}</span>
      </motion.div>
    );
  }

  if (isDone) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 py-2 px-4 rounded-xl"
        style={{ background: "rgba(33, 168, 125, 0.10)", border: "1px solid rgba(33, 168, 125, 0.25)" }}
      >
        <CheckCircle size={16} style={{ color: "var(--accent-green)" }} />
        <span className="text-sm font-medium" style={{ color: "var(--accent-green)" }}>{event.trace}</span>
      </motion.div>
    );
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-3 py-2 px-4 rounded-xl"
        style={{ background: "rgba(255, 114, 114, 0.10)", border: "1px solid rgba(255, 114, 114, 0.25)" }}
      >
        <AlertCircle size={16} style={{ color: "var(--accent-red)" }} />
        <span className="text-sm font-mono" style={{ color: "var(--accent-red)" }}>{event.error || event.trace}</span>
      </motion.div>
    );
  }

  // Agent card
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl p-4"
      style={{
        background: "rgba(255,255,255,0.5)",
        border: `1px solid ${meta.color}25`,
        boxShadow: `0 2px 12px ${meta.color}10`,
      }}
    >
      {/* Agent header */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${meta.color}18` }}
        >
          <Icon size={14} style={{ color: meta.color }} />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: meta.color }}>
          {meta.label}
        </span>
        <div className="flex-1" />
        <div className="w-2 h-2 rounded-full" style={{ background: meta.color, opacity: 0.7 }} />
      </div>

      {/* Content: either plan steps or plain text */}
      {planSteps ? (
        <div className="space-y-2">
          <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>EXECUTION PLAN</p>
          {planSteps.map((s, i) => (
            <PlanStepCard key={i} step={s.step} tool={s.tool} index={i} />
          ))}
        </div>
      ) : (
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>{rawText}</p>
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
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full mt-10 rounded-3xl overflow-hidden"
        style={{
          background: "#E6E9EF",
          boxShadow: "-20px -20px 40px rgba(255,255,255,1), 20px 20px 40px rgba(211,219,230,1)",
        }}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: "rgba(211,219,230,0.5)" }}>
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--accent-red)" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--accent-amber)" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--accent-green)" }} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Activity Trace
            </span>
          </div>
          {isExecuting && (
            <motion.div
              className="flex items-center gap-2"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
            >
              <Clock size={12} style={{ color: "var(--accent-blue)" }} />
              <span className="text-xs font-mono" style={{ color: "var(--accent-blue)" }}>Processing…</span>
            </motion.div>
          )}
        </div>

        {/* Events */}
        <div className="p-6 space-y-3 max-h-[480px] overflow-y-auto">
          {events.map((evt, i) => (
            <TraceRow key={i} event={evt} index={i} />
          ))}
          {isExecuting && (
            <motion.div
              className="flex items-center gap-2 py-1 pl-2"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent-blue)" }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent-blue)", animationDelay: "0.2s" }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent-blue)", animationDelay: "0.4s" }} />
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
