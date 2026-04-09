"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Clock, XCircle, AlertTriangle, RefreshCw, ThumbsUp, Ban, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Workflow {
  id: number;
  command: string;
  status: "running" | "completed" | "failed" | "pending" | "cancelled";
  latency?: number;
}

const STATUS_META = {
  running:   { icon: Clock,         color: "var(--accent-blue)",   label: "Running",          bg: "rgba(72,156,193,0.12)"   },
  completed: { icon: CheckCircle,   color: "var(--accent-green)",  label: "Completed",        bg: "rgba(33,168,125,0.12)"   },
  failed:    { icon: XCircle,       color: "var(--accent-red)",    label: "Failed",           bg: "rgba(255,114,114,0.12)"  },
  pending:   { icon: AlertTriangle, color: "var(--accent-amber)",  label: "Awaiting Approval",bg: "rgba(245,166,35,0.12)"   },
  cancelled: { icon: Ban,           color: "var(--text-muted)",    label: "Cancelled",        bg: "rgba(156,163,175,0.12)"  },
};

function WorkflowCard({ wf, onApprove, onCancel }: { wf: Workflow; onApprove: (id: number) => void; onCancel: (id: number) => void }) {
  const meta = STATUS_META[wf.status] ?? STATUS_META.running;
  const Icon = meta.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="neu-card p-6 flex flex-col gap-4"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-mono mb-1" style={{ color: "var(--text-muted)" }}>#{wf.id}</p>
          <p className="text-base font-medium leading-snug line-clamp-2" style={{ color: "var(--text-primary)" }}>
            {wf.command}
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0"
          style={{ background: meta.bg, color: meta.color }}
        >
          <Icon size={11} />
          {meta.label}
        </div>
      </div>

      {/* Latency */}
      {wf.latency != null && (
        <div className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
          ⏱ {wf.latency.toFixed(2)}s
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-1 border-t" style={{ borderColor: "rgba(211,219,230,0.6)" }}>
        {wf.status === "pending" && (
          <>
            <button
              onClick={() => onApprove(wf.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all hover:opacity-80"
              style={{ background: "rgba(33,168,125,0.15)", color: "var(--accent-green)" }}
            >
              <ThumbsUp size={12} /> Approve
            </button>
            <button
              onClick={() => onCancel(wf.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all hover:opacity-80"
              style={{ background: "rgba(255,114,114,0.12)", color: "var(--accent-red)" }}
            >
              <Ban size={12} /> Reject
            </button>
          </>
        )}
        {wf.status === "running" && (
          <button
            onClick={() => onCancel(wf.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all hover:opacity-80"
            style={{ background: "rgba(255,114,114,0.10)", color: "var(--accent-red)" }}
          >
            <Ban size={12} /> Cancel
          </button>
        )}
        <Link href={`/?workflow=${wf.id}`} className="ml-auto">
          <div
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer hover:opacity-70 transition-opacity"
            style={{ color: "var(--text-secondary)" }}
          >
            View trace <ChevronRight size={12} />
          </div>
        </Link>
      </div>
    </motion.div>
  );
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/workflows/");
      const data = await res.json();
      setWorkflows(data.workflows ?? []);
    } catch {
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWorkflows(); }, []);

  const handleApprove = async (id: number) => {
    await fetch(`http://localhost:8000/api/v1/approvals/${id}/approve`, { method: "POST" });
    fetchWorkflows();
  };

  const handleCancel = async (id: number) => {
    await fetch(`http://localhost:8000/api/v1/workflows/${id}/cancel`, { method: "POST" });
    fetchWorkflows();
  };

  const filters = ["all", "running", "pending", "completed", "failed"];
  const displayed = filter === "all" ? workflows : workflows.filter(w => w.status === filter);

  return (
    <div className="w-full h-full p-4 lg:p-8 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-normal tracking-tight" style={{ color: "var(--text-primary)" }}>Workflows</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>{workflows.length} total jobs</p>
        </div>
        <button
          onClick={fetchWorkflows}
          className="neu-card neu-hover h-10 w-10 flex items-center justify-center rounded-xl cursor-pointer"
        >
          <RefreshCw size={16} style={{ color: "var(--text-secondary)" }} />
        </button>
      </header>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all"
            style={{
              background: filter === f ? "var(--accent-blue)" : "var(--bg-surface)",
              color: filter === f ? "#fff" : "var(--text-secondary)",
              boxShadow: filter === f ? "none" : "-4px -4px 8px rgba(255,255,255,0.8), 4px 4px 8px rgba(211,219,230,1)",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 1.5 }}>
            <RefreshCw size={24} style={{ color: "var(--text-muted)" }} />
          </motion.div>
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 opacity-50">
          <CheckCircle size={40} style={{ color: "var(--text-muted)" }} />
          <p style={{ color: "var(--text-muted)" }}>No workflows yet — issue a command from the Command Center</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence>
            {displayed.map(wf => (
              <WorkflowCard key={wf.id} wf={wf} onApprove={handleApprove} onCancel={handleCancel} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
