"use client";

import { useState, useEffect } from "react";
import { 
  Send, 
  Activity, 
  Shield, 
  Sparkles, 
  Network, 
  AlertCircle, 
  ChevronRight, 
  Cpu, 
  Zap, 
  Globe, 
  Brain,
  ArrowUpRight,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TiltedCard from "@/components/ui/react-bits/TiltedCard";
import { TracePanel, type TraceEvent } from "@/components/trace/TracePanel";
import { startWorkflow, streamWorkflowTrace, listWorkflows } from "@/lib/api";
import Link from "next/link";

export default function Home() {
  const [command, setCommand] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [events, setEvents] = useState<TraceEvent[]>([]);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const [proactiveBriefing, setProactiveBriefing] = useState<any>(null);
  const [systemStats, setSystemStats] = useState({ cpu: 12, memory: 45, latency: 1.2 });

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const data = await listWorkflows();
        const brief = data.workflows.find((w: any) => 
          w.command.includes("morning briefing") && w.status === "completed"
        );
        if (brief) setProactiveBriefing(brief);
      } catch (e) {
        console.error("Failed to fetch proactive intelligence", e);
      }
    };
    fetchRecent();
    
    // Simulate minor stat fluctuations for 'live' feel
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        latency: parseFloat((1.1 + Math.random() * 0.2).toFixed(2))
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    if (eventSource) { eventSource.close(); setEventSource(null); }

    setIsExecuting(true);
    setEvents([
      { trace: `Conduit Opened: "${command}"` },
      { trace: "Connecting to Athena Neural Mesh..." },
    ]);

    try {
      const response = await startWorkflow(command);
      const jobId = response.workflow_id;

      const es = streamWorkflowTrace(
        jobId,
        (data: TraceEvent) => {
          setEvents(prev => [...prev, data]);
          if (data.status === "completed" || data.status === "failed") {
            setIsExecuting(false);
            setCommand("");
            es.close();
          }
        },
        () => {
          setEvents(prev => [...prev, { trace: "[System] Neural link severed.", error: "Connection lost" }]);
          setIsExecuting(false);
          es.close();
        }
      );
      setEventSource(es);
    } catch {
      setEvents(prev => [...prev, { trace: "[System] Protocol initialization failed.", error: "Start failed" }]);
      setIsExecuting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="relative w-full h-full p-6 lg:p-10 flex flex-col overflow-x-hidden">
      {/* Aurora Background Effect */}
      <div className="aurora top-[-20%] right-[-10%] opacity-20" />
      <div className="aurora bottom-[-20%] left-[-10%] opacity-10" style={{ background: "radial-gradient(circle, rgba(139, 111, 212, 0.1) 0%, transparent 70%)" }} />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto w-full space-y-12 z-10"
      >
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <motion.div variants={itemVariants} className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-accent-blue heartbeat-dot shadow-[0_0_10px_rgba(72,156,193,0.5)]" />
              <p className="text-xs font-black tracking-[0.3em] uppercase text-accent-blue opacity-80">Director Terminal Active</p>
            </div>
            <h1 className="text-5xl font-medium tracking-tight text-white/90">
              Good Morning, <span className="font-extralight italic">Director</span>
            </h1>
          </motion.div>

          <motion.div variants={itemVariants} className="flex gap-4">
            <div className="glass-card px-6 py-3 rounded-2xl flex items-center gap-4 border-white/5">
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Neural Latency</p>
                <p className="text-lg font-mono font-medium text-accent-blue">{systemStats.latency}ms</p>
              </div>
              <Activity size={18} className="text-accent-blue/40" />
            </div>
          </motion.div>
        </header>

        {/* Command Conduit Section */}

        {/* Command Conduit Section */}
        <div className="w-full flex flex-col items-center pt-8">
          <AnimatePresence mode="wait">
            {proactiveBriefing && (
              <motion.div 
                initial={{ height: 0, opacity: 0, y: -20 }}
                animate={{ height: "auto", opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -20 }}
                className="w-full mb-8 relative max-w-4xl"
              >
                <div className="glass-panel p-6 rounded-3xl flex items-center justify-between gap-6 border-accent-gold/30 overflow-hidden relative group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-accent-gold" />
                  <div className="flex gap-5 items-center">
                    <div className="p-3 bg-accent-gold/10 text-accent-gold rounded-2xl">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-accent-gold mb-1">Priority Briefing</h3>
                      <p className="text-sm text-white/60">
                         {proactiveBriefing.status === 'completed' ? 'Your tactical overview is ready for review.' : 'Synthesizing mission intelligence...'}
                      </p>
                    </div>
                  </div>
                  <Link href={`/workflows`}>
                     <motion.button 
                       whileHover={{ x: 5 }}
                       className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-accent-gold hover:text-white transition-colors"
                     >
                        OPEN REPORT <ChevronRight size={14} />
                     </motion.button>
                  </Link>
                </div>
                <button 
                  onClick={() => setProactiveBriefing(null)}
                  className="absolute -top-3 -right-3 w-8 h-8 rounded-full glass-panel flex items-center justify-center text-slate-400 hover:text-white transition-all text-sm border-white/10"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={itemVariants} className="w-full max-w-4xl space-y-6">
            <div className="relative group">
              <div className="absolute -top-12 left-4 flex items-center gap-3 text-xs font-bold pointer-events-none tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
                 <Cpu size={14} className="text-accent-blue opacity-50" />
                  neural conduit connection: <span className="text-accent-blue">STABLE</span>
              </div>
              
              <form onSubmit={handleCommand} className="relative">
                <div className={`w-full glass-panel rounded-[2rem] p-3 flex items-center gap-3 transition-all duration-500 ${isExecuting ? 'ring-2 ring-accent-blue/30 scale-[1.01]' : 'focus-within:ring-2 focus-within:ring-white/10'}`}>
                  <div className="pl-6 text-accent-blue/40">
                    <Globe size={20} />
                  </div>
                  <input
                    type="text"
                    value={command}
                    onChange={e => setCommand(e.target.value)}
                    placeholder="Enter strategic instruction..."
                    disabled={isExecuting}
                    className="flex-1 bg-transparent outline-none px-4 h-16 text-xl tracking-tight text-white placeholder:text-white/10"
                  />
                  <div className="flex items-center gap-2 pr-3">
                    <AnimatePresence>
                      {command.trim() && !isExecuting && (
                        <motion.div 
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="mr-2"
                        >
                           <p className="text-[10px] font-black uppercase text-accent-blue tracking-widest px-3 py-1.5 bg-accent-blue/10 rounded-lg border border-accent-blue/20">Ready</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <button
                      type="submit"
                      disabled={isExecuting || !command.trim()}
                      className={`h-14 w-14 flex items-center justify-center rounded-2xl cursor-pointer transition-all duration-300 ${isExecuting ? 'bg-transparent' : 'bg-white hover:bg-accent-blue group/btn shadow-[0_0_30px_rgba(255,255,255,0.1)]'}`}
                    >
                      {isExecuting ? (
                        <Loader2 className="animate-spin text-accent-blue" size={24} />
                      ) : (
                        <Send size={20} className="text-black group-hover/btn:text-white transition-colors" />
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <TracePanel events={events} isExecuting={isExecuting} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
