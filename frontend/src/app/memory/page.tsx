"use client";

import { useEffect, useState } from "react";
import { Search, Database, HardDrive, Clock, Fingerprint, Network, Brain, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface MemoryItem {
  id: number;
  content: string;
  source: string;
  score: number;
  used_count: number;
  created_at: string;
  job_id: number | null;
  meta_data: any;
}

export default function MemoryExplorer() {
  const [query, setQuery] = useState("");
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchRecentMemories();
  }, []);

  const fetchRecentMemories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/memory/`);
      const data = await res.json();
      setMemories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch memories", error);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      fetchRecentMemories();
      return;
    }
    
    try {
      setLoading(true);
      setIsSearching(true);
      const res = await fetch(`${API_BASE}/memory/search?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      setMemories(data.results || []);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full p-6 lg:p-12 flex flex-col overflow-y-auto overflow-x-hidden">
      {/* Aurora Background Effect */}
      <div className="aurora top-[-20%] right-[-10%] opacity-20" />
      <div className="aurora bottom-[-20%] left-[-10%] opacity-15" style={{ background: "radial-gradient(circle, rgba(232, 184, 75, 0.1) 0%, transparent 70%)" }} />

      <div className="max-w-7xl mx-auto w-full space-y-12 z-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="space-y-3">
             <div className="flex items-center gap-3">
                <div className="p-2.5 bg-accent-gold/10 text-accent-gold rounded-xl border border-accent-gold/20 shadow-[0_0_15px_rgba(232,184,75,0.1)]">
                   <Brain size={20} />
                </div>
                <p className="text-[10px] font-black tracking-[0.3em] uppercase text-accent-gold opacity-80">Semantic Retrieval</p>
             </div>
             <h1 className="text-5xl font-medium tracking-tight text-white/90">
               Memory <span className="font-extralight italic">Explorer</span>
             </h1>
             <p className="text-slate-500 font-medium text-sm tracking-tight flex items-center gap-2">
               <Database className="w-4 h-4" /> pgvector Unified Context Store
             </p>
          </div>
          
          <div className="glass-panel px-6 py-3 rounded-2xl border-white/5 flex items-center gap-4 bg-white/1">
            <div className="p-2 bg-accent-blue/10 rounded-lg text-accent-blue border border-accent-blue/10 shadow-[0_0_10px_rgba(72,156,193,0.1)]">
               <Network size={18} />
            </div>
            <div>
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Index State</div>
              <div className="text-xs font-bold text-accent-green flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-accent-green heartbeat-dot" />
                 REPLICATED
              </div>
            </div>
          </div>
        </header>

        {/* Semantic Search Bar */}
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Search className="w-6 h-6 text-slate-600 group-focus-within:text-accent-gold transition-colors" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search past context, decisions, or project constraints using cosine similarity..."
            className="w-full pl-16 pr-32 py-7 rounded-[2.5rem] border border-white/5 bg-white/2 shadow-2xl focus:ring-4 focus:ring-accent-gold/10 focus:border-accent-gold/30 outline-none transition-all text-xl font-medium text-white/90 placeholder:text-white/10"
          />
          <AnimatePresence>
            {isSearching && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-6 top-1/2 -translate-y-1/2"
              >
                <div className="w-6 h-6 border-2 border-accent-gold border-r-transparent rounded-full animate-spin" />
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Memory Grid */}
        {loading && memories.length === 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {[1,2,3].map(i => (
               <div key={i} className="glass-panel p-10 rounded-[3rem] h-64 animate-pulse bg-white/5 border-white/5" />
             ))}
           </div>
        ) : memories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-6 border-2 border-dashed border-white/5 rounded-[4rem]">
            <div className="p-8 bg-white/2 rounded-full border border-white/5 shadow-2xl">
               <HardDrive className="w-16 h-16 text-slate-800" />
            </div>
            <div className="text-center space-y-2">
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">AlloyDB Inactive</p>
               <p className="text-sm text-slate-500 font-medium">No semantic clusters mapped yet.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {memories.map((mem, index) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  key={mem.id}
                  className="glass-panel p-8 rounded-[3rem] flex flex-col group hover:border-accent-gold/20 transition-all border-white/5 bg-white/2 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-accent-gold/40 to-transparent" />
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3 text-[10px] font-black px-4 py-2 bg-white/5 text-accent-gold rounded-xl border border-accent-gold/10 uppercase tracking-[0.2em] shadow-lg">
                      <Fingerprint className="w-3 h-3" />
                      ID-{mem.id}
                    </div>
                    {isSearching && mem.score !== undefined && (
                      <div className="text-[10px] font-black text-accent-green bg-accent-green/10 px-3 py-1.5 rounded-lg border border-accent-green/10 uppercase tracking-widest">
                        {(mem.score * 100).toFixed(1)}% Match
                      </div>
                    )}
                  </div>

                  <p className="text-white/80 text-sm leading-relaxed mb-10 font-medium line-clamp-4 group-hover:line-clamp-none transition-all cursor-default">
                    {mem.content}
                  </p>

                  <div className="mt-auto flex items-center justify-between border-t pt-6 border-white/5">
                    <div className="flex flex-col gap-1">
                       <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Created At</span>
                       <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                         <Clock className="w-3.5 h-3.5" />
                         {new Date(mem.created_at).toLocaleDateString()}
                       </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                       <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Origin</span>
                       <span className="bg-accent-blue/5 px-3 py-1 rounded-lg text-[10px] font-black text-accent-blue border border-accent-blue/10 uppercase tracking-widest">
                         {mem.source}
                       </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
