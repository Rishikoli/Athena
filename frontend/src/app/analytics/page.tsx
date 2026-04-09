"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  Thermometer, 
  Clock, 
  Target, 
  Cpu, 
  Coins, 
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  ZapOff
} from "lucide-react";
import { api } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface PerformanceMetrics {
  total_tasks: number;
  success_rate: number;
  avg_completion_time_sec: number;
}

interface UsageMetrics {
  tokens_used: number;
  estimated_cost_usd: number;
  quota_remaining: number;
}

interface TemperatureMetrics {
  temperature: number;
  status: string;
  unit: string;
  failures_24h: number;
  pressure_index: number;
}

export default function AnalyticsDashboard() {
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [usage, setUsage] = useState<UsageMetrics | null>(null);
  const [temp, setTemp] = useState<TemperatureMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
       try {
         const [perfRes, usageRes, tempRes] = await Promise.all([
           fetch(`${API_BASE}/metrics/performance`),
           fetch(`${API_BASE}/metrics/usage`),
           fetch(`${API_BASE}/metrics/temperature`)
         ]);
         
         const [perfData, usageData, tempData] = await Promise.all([
           perfRes.json(),
           usageRes.json(),
           tempRes.json()
         ]);

         setPerformance(perfData);
         setUsage(usageData);
         setTemp(tempData);
       } catch (err) {
         console.error("Failed to fetch analytics", err);
       } finally {
         setLoading(false);
       }
    }
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="flex flex-col items-center gap-4"
        >
          <Cpu className="w-12 h-12 text-accent-blue" />
          <span className="text-sm font-mono text-slate-400">SYNCING REACTOR CORE...</span>
        </motion.div>
      </div>
    );
  }

  // Calculate "Human Time Saved" (Metric: 1 task = 15 mins human work)
  const humanHoursSaved = performance ? (performance.total_tasks * 15) / 60 : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-8 lg:p-12 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">Reactor Core</h1>
            <p className="text-slate-500 font-medium flex items-center gap-2">
               <ShieldCheck className="w-4 h-4 text-accent-green" /> Real-time System Efficiency & Reasoning Analytics
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border shadow-sm">
             <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Status</span>
                <span className="text-sm font-bold text-accent-green leading-none">ACTIVE POWER</span>
             </div>
             <div className="w-10 h-10 rounded-full bg-accent-blue/10 flex items-center justify-center text-accent-blue animate-pulse">
                <Zap className="fill-current" size={20} />
             </div>
          </div>
        </header>

        {/* Global Warning - "Black Hole Detection" mocked here for now */}
        <AnimatePresence>
          {temp?.failures_24h && temp.failures_24h > 2 && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-start gap-4"
            >
              <div className="bg-red-500 p-2 rounded-xl text-white">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-900">CAUSAL BLACK HOLE DETECTED</h4>
                <p className="text-xs text-red-700 mt-1 opacity-80">
                  Multiple workflow failures detected in the last 24h. The project temperature is rising. 
                  Check the Agent Graph for cyclical delegation loops.
                </p>
              </div>
              <button className="ml-auto text-xs font-bold text-red-600 hover:underline">
                RUN DIAGNOSTIC
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Temperature Gauge */}
          <section className="col-span-1 glass-panel bg-white p-8 rounded-[2.5rem] border border-slate-200/50 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Thermometer size={120} />
             </div>
             
             <div className="relative space-y-8">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${temp?.status === 'Overheated' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                    <Thermometer size={18} />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Project Temperature</h3>
                </div>

                <div className="space-y-2">
                   <div className="text-6xl font-black text-slate-900 tracking-tighter">
                      {temp?.temperature}<span className="text-2xl text-slate-400 font-medium ml-1">°F</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${temp?.status === 'Nominal' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                      <span className="text-sm font-bold text-slate-700 capitalize">{temp?.status} Operating Mood</span>
                   </div>
                </div>

                {/* Gauge Slider Visualization */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${(temp?.pressure_index || 0) * 100}%` }}
                     className={`h-full ${temp?.status === 'Nominal' ? 'bg-accent-blue' : 'bg-red-500'}`}
                   />
                </div>
                
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                   System mood is calculated based on reasoning verification rejections, 
                   workflow failures, and tool execution latency over a 24-hour window.
                </p>
             </div>
          </section>

          {/* Efficiency & Savings */}
          <section className="col-span-1 glass-panel bg-white p-8 rounded-[2.5rem] border border-slate-200/50 shadow-sm flex flex-col justify-between">
             <div className="space-y-8">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <Target size={18} />
                   </div>
                   <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Human Capacity Growth</h3>
                </div>

                <div className="space-y-4">
                   <div>
                      <span className="text-5xl font-black text-slate-900 tracking-tighter">
                         {humanHoursSaved.toFixed(1)}
                         <span className="text-xl text-slate-400 font-medium ml-2 underline decoration-accent-blue decoration-4 underline-offset-4">Hrs</span>
                      </span>
                      <p className="text-xs font-bold text-slate-400 mt-2">Saved across {performance?.total_tasks} workflows</p>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                         <span className="block text-[9px] font-black text-slate-400 uppercase tracking-tighter">Reliability</span>
                         <span className="text-lg font-bold text-slate-800">{(performance?.success_rate || 0) * 100}%</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                         <span className="block text-[9px] font-black text-slate-400 uppercase tracking-tighter">Reasoning</span>
                         <span className="text-lg font-bold text-slate-800">{performance?.avg_completion_time_sec}s</span>
                      </div>
                   </div>
                </div>
             </div>

             <div className="text-[10px] text-slate-400 mt-6 border-t pt-4 border-slate-100 flex items-center justify-between">
                <span>Director Efficiency Score</span>
                <span className="font-bold text-accent-blue">A+ (Tier 1)</span>
             </div>
          </section>

          {/* Token Economy */}
          <section className="col-span-1 glass-panel bg-white p-8 rounded-[2.5rem] border border-slate-200/50 shadow-sm overflow-hidden relative">
             <div className="absolute top-0 right-0 -mr-6 -mt-6">
                <div className="w-32 h-32 rounded-full border-[20px] border-slate-50 opacity-50" />
             </div>

             <div className="relative h-full flex flex-col justify-between">
                <div className="space-y-8">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                         <Coins size={18} />
                      </div>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Token Engine Usage</h3>
                   </div>

                   <div>
                      <span className="text-4xl font-black text-slate-900 tracking-tighter">
                         {usage?.tokens_used.toLocaleString()}
                         <span className="text-sm text-slate-400 font-semibold ml-2">Tokens</span>
                      </span>
                      <div className="flex items-center gap-2 mt-4">
                         <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">Estimated Cost</span>
                         <span className="text-sm font-bold text-slate-800">${usage?.estimated_cost_usd}</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-3 mt-8">
                   <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>Daily Quota</span>
                      <span>{((usage?.tokens_used || 0) / (usage?.quota_remaining || 1 + (usage?.tokens_used || 0)) * 100).toFixed(1)}%</span>
                   </div>
                   <div className="h-1 w-full bg-slate-50 rounded-full">
                      <div 
                         className="h-full bg-purple-500 rounded-full" 
                         style={{ width: `${((usage?.tokens_used || 0) / (usage?.quota_remaining || 1) * 100)}%` }}
                      />
                   </div>
                   <p className="text-[9px] text-slate-400 italic">Athena runs Gemini 2.5 Flash on Vertex AI context optimization.</p>
                </div>
             </div>
          </section>

        </div>

        {/* Intelligence Activity Feed - Mock for aesthetics */}
        <section className="glass-panel bg-white p-10 rounded-[3rem] border border-slate-200/50 shadow-sm space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Causal Activity Graph</h3>
              <button className="text-xs font-bold text-accent-blue px-4 py-2 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors">
                 Full Reasoning Path
              </button>
           </div>
           
           <div className="space-y-4">
              {[
                { time: "2 min ago", agent: "Planner", msg: "Decomposed 'Schedule Acme Sync' into 3 verified tool calls.", status: "success" },
                { time: "15 min ago", agent: "Verification", msg: "Blocked sensitive action: 'Clear all linear tickets'.", status: "blocked" },
                { time: "1h ago", agent: "Execution", msg: "Successfully sent email briefing to finance@acme.com", status: "success" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-6 p-4 rounded-3xl border border-slate-50 hover:bg-slate-50 transition-colors cursor-default group">
                   <div className="text-[10px] font-bold text-slate-400 w-20 flex-shrink-0 uppercase">{item.time}</div>
                   <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                      {item.status === 'blocked' ? <ShieldCheck size={14} /> : <Zap size={14} />}
                   </div>
                   <div className="flex-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter mr-2">{item.agent}</span>
                      <p className="text-sm font-medium text-slate-700">{item.msg}</p>
                   </div>
                   <ChevronRight className="text-slate-200 group-hover:text-accent-blue transition-colors" size={16} />
                </div>
              ))}
           </div>
        </section>

      </div>
    </div>
  );
}
