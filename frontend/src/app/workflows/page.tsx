"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  ThumbsUp, 
  Ban, 
  ChevronRight,
  Terminal,
  Activity,
  ArrowUpRight
} from "lucide-react";
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
      className="glass-panel p-8 flex flex-col gap-6 group hover:border-white/10 transition-all border-white/5"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">ID #{wf.id}</p>
          <p className="text-base font-medium leading-relaxed line-clamp-2 text-white/90">
            {wf.command}
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex-shrink-0 border border-white/5 shadow-lg"
          style={{ background: meta.bg, color: meta.color }}
        >
          <Icon size={12} className={wf.status === 'running' ? 'animate-spin' : ''} />
          {meta.label}
        </div>
      </div>

      {/* Latency / Footer Info */}
      <div className="flex items-center justify-between">
         {wf.latency != null ? (
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/2 px-3 py-1.5 rounded-lg border border-white/5">
                <Clock size={12} />
                {wf.latency.toFixed(2)}s Latency
            </div>
         ) : <div />}
         
         <div className="flex -space-x-2">
            {[1,2].map(i => (
               <div key={i} className="w-6 h-6 rounded-full border-2 border-[#0A0C10] bg-white/5 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?u=workflow-${i}`} alt="" className="w-full h-full grayscale opacity-40" />
               </div>
            ))}
         </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-auto pt-6 border-t border-white/5">
        {wf.status === "pending" && (
          <>
            <button
              onClick={() => onApprove(wf.id)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-accent-green text-white shadow-[0_0_15px_rgba(33,168,125,0.3)] hover:scale-105"
            >
              <ThumbsUp size={14} /> Approve
            </button>
            <button
              onClick={() => onCancel(wf.id)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all glass-card border border-accent-red/20 text-accent-red hover:bg-accent-red hover:text-white"
            >
              <Ban size={14} /> Reject
            </button>
          </>
        )}
        {wf.status === "running" && (
          <button
            onClick={() => onCancel(wf.id)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all glass-card border border-accent-red/20 text-accent-red hover:bg-accent-red hover:text-white"
          >
            <Ban size={14} /> Kill Job
          </button>
        )}
        <Link href={`/?workflow=${wf.id}`} className="ml-auto">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer text-slate-500 hover:text-white hover:bg-white/5 transition-all"
          >
            Trace <ChevronRight size={14} />
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
    <div className="relative w-full h-full p-6 lg:p-12 flex flex-col overflow-y-auto overflow-x-hidden">
      {/* Aurora Background Effect */}
      <div className="aurora top-[-20%] right-[-10%] opacity-20" />
      <div className="aurora bottom-[-20%] left-[-10%] opacity-15" style={{ background: "radial-gradient(circle, rgba(139, 111, 212, 0.12) 0%, transparent 70%)" }} />

      <div className="max-w-7xl mx-auto w-full space-y-12 z-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="space-y-3">
             <div className="flex items-center gap-3">
                <div className="p-2.5 bg-accent-blue/10 text-accent-blue rounded-xl border border-accent-blue/20">
                   <Terminal size={20} />
                </div>
                <p className="text-[10px] font-black tracking-[0.3em] uppercase text-accent-blue opacity-80">Strategic Pipeline</p>
             </div>
             <h1 className="text-5xl font-medium tracking-tight text-white/90">
               Neural <span className="font-extralight italic">Workflows</span>
             </h1>
             <p className="text-slate-500 font-medium text-sm tracking-tight">{workflows.length} total jobs in system orchestration</p>
          </div>
          <button
            onClick={fetchWorkflows}
            className="glass-panel h-14 w-14 flex items-center justify-center rounded-[1.25rem] cursor-pointer hover:bg-white/5 transition-all text-slate-400 hover:text-white border-white/5 active:scale-95"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </header>

        {/* Filter tabs */}
        <div className="flex gap-4 mb-4 flex-wrap">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                filter === f 
                ? "bg-accent-blue text-white border-accent-blue/50 shadow-[0_0_20px_rgba(72,156,193,0.3)]" 
                : "bg-white/2 text-slate-500 border-white/5 hover:text-white hover:bg-white/5"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid/List */}
        {loading && workflows.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-32 space-y-6">
            <div className="p-6 bg-accent-blue/5 rounded-full border border-accent-blue/10">
               <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 1.5 }}>
                 <RefreshCw size={32} className="text-accent-blue opacity-50" />
               </motion.div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Syncing Pipeline State...</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-32 space-y-6 border-2 border-dashed border-white/5 rounded-[4rem]">
            <div className="p-6 bg-white/2 rounded-full border border-white/5">
                <Activity size={40} className="text-slate-700" />
            </div>
            <div className="text-center space-y-2">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Pipeline Inactive</p>
               <p className="text-sm text-slate-600 font-medium">No workflows found — issue a command via the Command Center</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {displayed.map(wf => (
                <WorkflowCard key={wf.id} wf={wf} onApprove={handleApprove} onCancel={handleCancel} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
