"use client";

import { useEffect, useState } from "react";
import { Search, Database, HardDrive, Clock, Fingerprint, Network } from "lucide-react";
import { motion } from "framer-motion";

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
      setMemories(data.results);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-800">Memory Engine</h1>
              <p className="text-slate-500 mt-1 flex items-center gap-2">
                <Database className="w-4 h-4" /> pgvector Semantic Store
              </p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg border shadow-sm flex items-center gap-3">
              <Network className="w-5 h-5 text-accent-gold" />
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase">Vector Index</div>
                <div className="text-sm font-medium text-slate-700">Online & Replicated</div>
              </div>
            </div>
          </header>

          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Search className="w-5 h-5 text-slate-400 group-focus-within:text-accent-blue transition-colors" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search past context, decisions, limits using cosine similarity..."
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-accent-blue focus:border-accent-blue outline-none transition-all text-lg placeholder:text-slate-400"
            />
            {isSearching && (
              <div className="absolute right-4 top-4">
                <div className="w-5 h-5 border-2 border-accent-blue border-r-transparent rounded-full animate-spin" />
              </div>
            )}
          </form>

          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[1,2,3].map(i => (
                 <div key={i} className="glass-panel p-6 rounded-2xl h-48 animate-pulse bg-white/50" />
               ))}
             </div>
          ) : memories.length === 0 ? (
            <div className="text-center py-20 text-slate-500 flex flex-col items-center">
              <HardDrive className="w-12 h-12 mb-4 text-slate-300" />
              <p className="text-lg">No semantic memories found.</p>
              <p className="text-sm">Run workflows to ingest new memories.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {memories.map((mem, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={mem.id}
                  className="glass-panel bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-gold to-accent-blue opacity-50" />
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-md uppercase tracking-wider">
                      <Fingerprint className="w-3 h-3" />
                      MEM-{mem.id}
                    </div>
                    {isSearching && mem.score !== undefined && (
                      <div className="text-xs font-mono font-bold text-accent-green bg-green-50 px-2 py-1 rounded">
                        Score: {(mem.score).toFixed(3)}
                      </div>
                    )}
                  </div>

                  <p className="text-slate-700 text-sm leading-relaxed mb-6 whitespace-pre-wrap line-clamp-4 group-hover:line-clamp-none transition-all">
                    {mem.content}
                  </p>

                  <div className="mt-auto flex items-center justify-between text-xs text-slate-500 border-t pt-4 border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(mem.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                       Used {mem.used_count}x
                    </span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                      {mem.source}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
