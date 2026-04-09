"use client";

import { useState } from "react";
import { Send, Activity, Shield, Sparkles, Network } from "lucide-react";
import { motion } from "framer-motion";
import { TracePanel, type TraceEvent } from "@/components/trace/TracePanel";
import { startWorkflow, streamWorkflowTrace } from "@/lib/api";
import Link from "next/link";

export default function Home() {
  const [command, setCommand] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [events, setEvents] = useState<TraceEvent[]>([]);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    if (eventSource) { eventSource.close(); setEventSource(null); }

    setIsExecuting(true);
    setEvents([
      { trace: `Received: "${command}"` },
      { trace: "Routing to AthenaOrchestrator..." },
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
          setEvents(prev => [...prev, { trace: "[System] Connection to AI Core lost.", error: "Connection lost" }]);
          setIsExecuting(false);
          es.close();
        }
      );
      setEventSource(es);

    } catch {
      setEvents(prev => [...prev, { trace: "[System] Failed to start workflow.", error: "Start failed" }]);
      setIsExecuting(false);
    }
  };

  return (
    <div className="w-full h-full p-4 lg:p-8 flex flex-col">
      {/* Header */}
      <header className="w-full flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-normal tracking-tight" style={{ color: "var(--text-primary)" }}>Good Morning, Director</h1>
          <p className="mt-1" style={{ color: "var(--text-muted)" }}>
            System Health: <span style={{ color: "var(--accent-green)" }}>Nominal</span>
          </p>
        </div>
        <div className="flex space-x-3">
          <Link href="/graph">
            <div className="neu-card neu-hover h-12 px-5 flex items-center justify-center gap-2 cursor-pointer rounded-xl">
              <Network size={16} style={{ color: "var(--accent-purple)" }} />
              <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Graph</span>
            </div>
          </Link>
          <div className="neu-card h-12 px-5 flex items-center justify-center gap-2 rounded-xl">
            <Activity size={16} style={{ color: "var(--accent-blue)" }} />
            <span className="text-sm font-bold font-mono">1.2 v/s</span>
          </div>
          <div className="neu-card h-12 w-12 flex items-center justify-center rounded-xl">
            <Shield size={18} style={{ color: "var(--text-secondary)" }} />
          </div>
        </div>
      </header>

      {/* Command Input */}
      <div className="w-full flex flex-col items-center max-w-4xl mx-auto">
        <motion.div layout className="w-full relative">
          <div className="absolute -top-10 left-4 flex items-center gap-2 text-sm pointer-events-none" style={{ color: "var(--text-secondary)" }}>
            <Sparkles size={14} style={{ color: "var(--accent-gold)" }} />
            Ready for instructions
          </div>
          <form onSubmit={handleCommand}>
            <div className="w-full neu-inset rounded-2xl p-2 flex items-center gap-2">
              <input
                type="text"
                value={command}
                onChange={e => setCommand(e.target.value)}
                placeholder="What should we accomplish today?"
                disabled={isExecuting}
                className="flex-1 bg-transparent outline-none px-5 h-14 text-lg"
                style={{ color: "var(--text-primary)" }}
              />
              <button
                type="submit"
                disabled={isExecuting || !command.trim()}
                className="neu-card neu-hover h-14 w-14 flex items-center justify-center rounded-xl cursor-pointer transition-all disabled:opacity-40"
              >
                {isExecuting ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 1.5 }}>
                    <Activity size={18} style={{ color: "var(--accent-blue)" }} />
                  </motion.div>
                ) : (
                  <Send size={18} style={{ color: "var(--accent-blue)" }} className="translate-x-0.5" />
                )}
              </button>
            </div>
          </form>
        </motion.div>

        <TracePanel events={events} isExecuting={isExecuting} />
      </div>
    </div>
  );
}
