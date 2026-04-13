"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  Thermometer, 
  Clock, 
  Target, 
  Cpu, 
  AlertTriangle,
  ShieldCheck,
  ZapOff,
  Activity,
  ArrowRight
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface PerformanceMetrics {
  total_tasks: number;
  success_rate: number;
  avg_completion_time_sec: number;
}

interface TemperatureMetrics {
  temperature: number;
  status: string;
  unit: string;
  failures_24h: number;
  pressure_index: number;
  black_hole_detected?: boolean;
}

interface ActivityItem {
  time: string;
  agent: string;
  msg: string;
  status: string;
}

export default function AnalyticsDashboard() {
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [temp, setTemp] = useState<TemperatureMetrics | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
       try {
         const [perfRes, tempRes, activityRes] = await Promise.all([
           fetch(`${API_BASE}/metrics/performance`),
           fetch(`${API_BASE}/metrics/temperature`),
           fetch(`${API_BASE}/metrics/activity`)
         ]);
         
         const [perfData, tempData, activityData] = await Promise.all([
           perfRes.json(),
           tempRes.json(),
           activityRes.json()
         ]);

         setPerformance(perfData);
         setTemp(tempData);
         setActivities(activityData);
       } catch (err) {
         console.error("Failed to fetch analytics", err);
       } finally {
         setLoading(false);
       }
    }
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0A0C10]">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="p-4 bg-accent-blue/10 rounded-2xl border border-accent-blue/20">
             <Cpu className="w-12 h-12 text-accent-blue" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-blue">SYNCING REACTOR CORE...</span>
        </motion.div>
      </div>
    );
  }

  const humanHoursSaved = performance ? (performance.total_tasks * 15) / 60 : 0;

  return (
    <div className="relative w-full h-full p-6 lg:p-12 flex flex-col overflow-y-auto overflow-x-hidden">
      {/* Aurora Background Effect */}
      <div className="aurora top-[-20%] right-[-10%] opacity-20" />
      <div className="aurora bottom-[-20%] left-[-10%] opacity-10" style={{ background: "radial-gradient(circle, rgba(139, 111, 212, 0.1) 0%, transparent 70%)" }} />

      <div className="max-w-7xl mx-auto w-full space-y-10 z-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
           <div className="space-y-1">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-accent-purple/10 rounded-xl text-accent-purple border border-accent-purple/20">
                    <Activity size={20} />
                 </div>
                 <p className="text-[10px] font-black tracking-[0.3em] uppercase text-accent-purple opacity-80">Reactor Core Statistics</p>
              </div>
              <h1 className="text-5xl font-medium tracking-tight text-white/90">
                System <span className="font-extralight italic">Observability</span>
              </h1>
           </div>
        </header>

        {/* Global Warning - Real Causal Black Hole Detection */}
        <AnimatePresence>
          {temp?.black_hole_detected && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-8 rounded-[3rem] flex items-start gap-8 border-accent-red/40 bg-accent-red/5 relative group overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-accent-red" />
              <div className="bg-accent-red p-4 rounded-2xl text-white shadow-lg shadow-accent-red/30">
                <AlertTriangle size={28} />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-black text-accent-red tracking-tight uppercase">CAUSAL BLACK HOLE DETECTED</h4>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed max-w-3xl font-medium">
                  {temp.failures_24h} catastrophic workflow failures detected. 
                  The system is experiencing reasoning degradation. Immediate diagnostic interference required 
                  to prevent cyclical delegation collapses.
                </p>
              </div>
              <button 
                onClick={() => window.location.href = '/graph'}
                className="bg-white text-black px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent-red hover:text-white transition-all shadow-lg"
              >
                DEBUG GRAPH
              </button>
            </motion.div>
          )}
        </AnimatePresence>


        {/* Intelligence Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Temperature Gauge */}
          <section className="col-span-1 glass-panel p-8 rounded-[3rem] relative overflow-hidden group border-white/5">
             <div className="absolute -top-10 -right-10 p-8 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                <Thermometer size={160} />
             </div>
             
             <div className="relative space-y-10">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${temp?.status === 'Overheated' ? 'bg-accent-red/10 text-accent-red' : 'bg-accent-amber/10 text-accent-amber'} border border-white/5`}>
                    <Thermometer size={18} />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Project Temperature</h3>
                </div>

                <div className="space-y-3">
                   <div className="text-7xl font-medium text-white/90 tracking-tighter">
                      {temp?.temperature}<span className="text-2xl text-slate-600 font-extralight ml-1">°F</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${temp?.status === 'Nominal' ? 'bg-accent-green' : 'bg-accent-red animate-pulse'} shadow-[0_0_10px_currentColor]`} />
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">{temp?.status} Operating Mood</span>
                   </div>
                </div>

                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${(temp?.pressure_index || 0) * 100}%` }}
                     className={`h-full ${temp?.status === 'Nominal' ? 'bg-accent-blue' : 'bg-accent-red shadow-[0_0_15px_rgba(255,114,114,0.5)]'}`}
                   />
                </div>
                
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight leading-relaxed max-w-[80%]">
                   System mood derived from verification rejections and tool latency.
                </p>
             </div>
          </section>

          {/* Efficiency & Savings */}
          <section className="col-span-1 glass-panel p-8 rounded-[3rem] flex flex-col justify-between border-white/5 bg-accent-blue/2">
             <div className="space-y-10">
                <div className="flex items-center gap-3">
                   <div className="p-2.5 bg-accent-blue/10 text-accent-blue rounded-xl border border-white/5">
                      <Target size={18} />
                   </div>
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Human Capacity Growth</h3>
                </div>

                <div className="space-y-6">
                   <div>
                      <span className="text-6xl font-medium text-white/90 tracking-tighter">
                         {humanHoursSaved.toFixed(1)}
                         <span className="text-xl text-slate-600 font-extralight ml-3 italic">Hrs Saved</span>
                      </span>
                      <p className="text-[10px] font-black text-accent-blue mt-3 tracking-widest uppercase opacity-70">Processed across {performance?.total_tasks} strategic workflows</p>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="glass-card p-5 rounded-[2rem] border-white/5 bg-white/2">
                         <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Reliability</span>
                         <span className="text-xl font-medium text-accent-green">{(performance?.success_rate || 0) * 100}%</span>
                      </div>
                      <div className="glass-card p-5 rounded-[2rem] border-white/5 bg-white/2">
                         <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Reasoning</span>
                         <span className="text-xl font-medium text-white/80">{performance?.avg_completion_time_sec}s</span>
                      </div>
                   </div>
                </div>
             </div>

             <div className="text-[9px] font-black text-slate-500 mt-8 border-t pt-6 border-white/5 flex items-center justify-between tracking-[0.2em] uppercase">
                <span>Director Efficiency Score</span>
                <span className="text-accent-blue shadow-[0_0_10px_rgba(72,156,193,0.3)]">A+ (Optimal)</span>
             </div>
          </section>


        </div>

        {/* Intelligence Activity Feed */}
        <section className="glass-panel p-10 rounded-[3.5rem] border-white/5 space-y-8">
           <div className="flex items-center justify-between">
              <div className="space-y-1">
                 <h3 className="text-xl font-medium text-white/90">Causal Activity Graph</h3>
                 <p className="text-xs text-slate-500 font-medium tracking-tight">Real-time reasoning paths across all neural sub-agents.</p>
              </div>
              <button className="text-[10px] font-black text-accent-blue px-6 py-2.5 bg-accent-blue/10 border border-accent-blue/20 rounded-[1.25rem] hover:bg-accent-blue hover:text-white transition-all uppercase tracking-widest">
                 Full Reasoning Path
              </button>
           </div>
           
           <div className="space-y-4">
              {activities.length > 0 ? (
                activities.map((item, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={i} 
                    className="flex items-center gap-8 p-5 rounded-[2.5rem] border border-white/5 hover:bg-white/5 transition-all cursor-default group"
                  >
                    <div className="text-[10px] font-black text-slate-500 w-24 flex-shrink-0 uppercase tracking-widest">
                      {item.time}
                    </div>
                    <div className={`p-3 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${
                      item.status === 'blocked' ? 'bg-accent-amber/10 text-accent-amber' : 
                      item.status === 'failed' ? 'bg-accent-red/10 text-accent-red' : 'bg-accent-blue/10 text-accent-blue'
                    } border border-white/5`}>
                      {item.status === 'blocked' ? <ShieldCheck size={20} /> : 
                       item.status === 'failed' ? <ZapOff size={20} /> : <Zap size={20} />}
                    </div>
                    <div className="flex-1 flex items-center gap-6">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] min-w-[120px]">{item.agent}</span>
                      <p className="text-sm font-medium text-white/80 tracking-tight leading-relaxed">{item.msg}</p>
                    </div>
                    <div className="text-slate-700 group-hover:text-accent-blue transition-colors">
                       <ArrowRight size={18} />
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-24 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3.5rem] text-slate-500 space-y-4">
                   <div className="p-6 bg-white/2 rounded-full border border-white/5 ring-8 ring-white/1">
                      <Clock className="w-12 h-12 opacity-40 animate-pulse" />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Recent Reactor Activity</p>
                </div>
              )}
           </div>
        </section>

      </div>
    </div>
  );
}
