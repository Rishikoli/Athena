"use client";

import { useState } from "react";
import { 
  Video, 
  Globe, 
  Mail, 
  Calendar, 
  MessageSquare, 
  CheckCircle2, 
  Plus, 
  Link as LinkIcon, 
  Database,
  ArrowRight,
  Loader2,
  Shield,
  Layers,
  Search,
  ArrowUpRight,
  Mic,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const APPS = [
  { id: 'gmail', name: 'Gmail', icon: Mail, connected: true, status: 'Syncing', color: 'text-accent-red' },
  { id: 'calendar', name: 'Google Calendar', icon: Calendar, connected: true, status: 'Active', color: 'text-accent-blue' },
  { id: 'slack', name: 'Slack', icon: MessageSquare, connected: false, status: 'Connect', color: 'text-accent-purple' },
  { id: 'linear', name: 'Linear', icon: Layers, connected: false, status: 'Connect', color: 'text-slate-400' },
];

export default function SourcesPage() {
  const [url, setUrl] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [transcript, setTranscript] = useState("");
  const [type, setType] = useState<"youtube" | "web" | "meeting" | "notion">("web");
  const [ingesting, setIngesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<{ msg: string; type: 'success' | 'error' | null }>({ msg: '', type: null });

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url && type !== 'meeting' && type !== 'notion') return;

    setIngesting(true);
    setStatus({ msg: 'Initializing Deep Indexing...', type: null });

    try {
      let endpoint = '';
      let body = {};

      if (type === 'meeting' || type === 'notion') {
        endpoint = type === 'meeting' ? '/sources/meetings/ingest' : '/sources/notion/ingest';
        body = { title: meetingTitle, transcript, date: new Date().toISOString() };
      } else {
        endpoint = type === 'youtube' ? '/sources/youtube/ingest' : '/sources/scrape';
        body = { url };
      }

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (res.ok) {
        setStatus({ msg: `${type.toUpperCase()} indexed successfully: ${data.message}`, type: 'success' });
        setUrl("");
        setMeetingTitle("");
        setTranscript("");
      } else {
        setStatus({ msg: data.detail || 'Ingestion failed', type: 'error' });
      }
    } catch (err) {
      setStatus({ msg: 'Network error during ingestion.', type: 'error' });
    } finally {
      setIngesting(false);
    }
  };

  const syncCalendar = async () => {
    setSyncing(true);
    setStatus({ msg: 'Aligning Calendar Intelligence...', type: null });
    try {
      const res = await fetch(`${API_BASE}/sources/calendar/sync`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setStatus({ msg: data.message, type: 'success' });
      } else {
        setStatus({ msg: 'Calendar sync failed.', type: 'error' });
      }
    } catch (err) {
      setStatus({ msg: 'Sync error.', type: 'error' });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="relative w-full h-full p-6 lg:p-12 flex flex-col overflow-y-auto overflow-x-hidden">
       {/* Aurora Background Effect */}
      <div className="aurora top-[-20%] right-[-10%] opacity-20" />
      <div className="aurora bottom-[-20%] left-[-10%] opacity-10" style={{ background: "radial-gradient(circle, rgba(139, 111, 212, 0.1) 0%, transparent 70%)" }} />

      <div className="max-w-6xl mx-auto w-full space-y-12 z-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-accent-blue/10 text-accent-blue rounded-2xl border border-accent-blue/20 shadow-[0_0_15px_rgba(72,156,193,0.15)]">
                  <Database size={24} />
               </div>
               <h1 className="text-4xl font-medium tracking-tight text-white/90">Knowledge Reservoir</h1>
            </div>
            <p className="text-slate-400 font-medium max-w-xl leading-relaxed">
              Automated institutional alignment. Athena prioritizes these sources to 
              ground decisions in your specific project context.
            </p>
          </div>
          
          <button 
            onClick={syncCalendar}
            disabled={syncing}
            className="flex items-center gap-3 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent-blue hover:text-white transition-all shadow-[0_0_30px_rgba(72,156,193,0.1)] active:scale-95 disabled:opacity-50"
          >
            {syncing ? <Loader2 size={16} className="animate-spin" /> : <Layers size={16} />}
            Align System Intelligence
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Ingestor Card */}
          <section className="lg:col-span-2 space-y-8">
            <div className="glass-panel p-10 rounded-[3rem] space-y-10 relative overflow-hidden group border-white/5">
               <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent-blue/5 rounded-full blur-3xl group-hover:bg-accent-blue/10 transition-all duration-700" />
               
               <div className="relative space-y-8">
                  <div className="flex items-center justify-between">
                     <h3 className="text-xl font-medium text-white/80">Deep-Research Ingestor</h3>
                     <div className="flex p-1 bg-white/5 rounded-xl border border-white/5 overflow-x-auto no-scrollbar max-w-[280px] sm:max-w-none">
                        {(['web', 'youtube', 'meeting', 'notion'] as const).map((m) => (
                           <button 
                            key={m}
                            onClick={() => setType(m)}
                            className={`px-4 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all whitespace-nowrap ${type === m ? 'bg-accent-blue text-white shadow-[0_0_15px_rgba(72,156,193,0.3)]' : 'text-slate-500 hover:text-white'}`}
                           >
                             {m}
                           </button>
                        ))}
                      </div>
                  </div>

                  <form onSubmit={handleIngest} className="space-y-6">
                     {['meeting', 'notion'].includes(type) ? (
                       <div className="space-y-4">
                          <div className="relative group/input">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-accent-blue transition-colors">
                               <FileText size={20} />
                            </div>
                            <input 
                               type="text"
                               placeholder={type === 'meeting' ? "Meeting Title (e.g. Q3 Strategic Sync)" : "Notion Page Title (e.g. Hiring Policy)"}
                               className="w-full bg-white/2 border border-white/5 rounded-[2rem] py-6 pl-16 pr-6 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-accent-blue/10 focus:bg-white/5 focus:border-accent-blue/30 transition-all text-white placeholder:text-white/10"
                               value={meetingTitle}
                               onChange={(e) => setMeetingTitle(e.target.value)}
                               required
                            />
                          </div>
                          <div className="relative group/input">
                            <div className="absolute left-6 top-8 text-slate-500 group-focus-within/input:text-accent-blue transition-colors">
                               {type === 'meeting' ? <Mic size={20} /> : <Database size={20} />}
                            </div>
                            <textarea 
                               placeholder={type === 'meeting' ? "Paste meeting transcript..." : "Paste Notion page content or Markdown..."}
                               className="w-full bg-white/2 border border-white/5 rounded-[2.5rem] py-8 pl-16 pr-6 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-accent-blue/10 focus:bg-white/5 focus:border-accent-blue/30 transition-all text-white placeholder:text-white/10 min-h-[200px] resize-none"
                               value={transcript}
                               onChange={(e) => setTranscript(e.target.value)}
                               required
                            />
                          </div>
                       </div>
                     ) : (
                       <div className="relative group/input">
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-accent-blue transition-colors">
                             {type === 'youtube' ? <Video size={20} /> : <Globe size={20} />}
                          </div>
                          <input 
                             type="url"
                             placeholder={type === 'youtube' ? "Paste YouTube Video URL..." : "Paste Article or Documentation URL..."}
                             className="w-full bg-white/2 border border-white/5 rounded-[2rem] py-6 pl-16 pr-6 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-accent-blue/10 focus:bg-white/5 focus:border-accent-blue/30 transition-all text-white placeholder:text-white/10"
                             value={url}
                             onChange={(e) => setUrl(e.target.value)}
                             required
                          />
                       </div>
                     )}
                     
                     <div className="flex justify-end pt-2">
                        <button 
                           type="submit"
                           disabled={ingesting}
                           className="bg-white text-black px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent-blue hover:text-white transition-all disabled:opacity-50 flex items-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
                        >
                           {ingesting ? <Loader2 className="animate-spin" size={14} /> : <ArrowUpRight size={14} />}
                           PUSH TO MEMORY
                        </button>
                      </div>
                  </form>

                  <AnimatePresence>
                    {status.type && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`p-6 rounded-[2rem] border flex items-start gap-5 glass-panel ${status.type === 'success' ? 'border-accent-green/30 bg-accent-green/5' : 'border-accent-red/30 bg-accent-red/5'}`}
                      >
                         <div className={`p-2.5 rounded-xl text-white ${status.type === 'success' ? 'bg-accent-green' : 'bg-accent-red'} shadow-[0_0_15px_rgba(0,0,0,0.2)]`}>
                            {status.type === 'success' ? <CheckCircle2 size={18} /> : <Shield size={18} />}
                         </div>
                         <div>
                            <p className={`text-[10px] font-black uppercase tracking-widest ${status.type === 'success' ? 'text-accent-green' : 'text-accent-red'}`}>
                               {status.type === 'success' ? 'ALIGNMENT SUCCESSFUL' : 'ALIGNMENT FAILED'}
                            </p>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed font-medium">{status.msg}</p>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
            </div>

            {/* Apps Row - Simplified */}
            <div className="flex flex-wrap gap-4">
               {APPS.map((app) => (
                 <div key={app.id} className="glass-panel px-6 py-4 rounded-3xl border border-white/5 flex items-center gap-4 transition-all hover:border-white/10">
                    <div className={`p-2.5 rounded-xl bg-white/2 ${app.color}`}>
                       <app.icon size={18} />
                    </div>
                    <div className="pr-2">
                       <h4 className="text-[11px] font-bold text-white/80">{app.name}</h4>
                       <div className="flex items-center gap-2 mt-0.5">
                          <div className={`w-1 h-1 rounded-full ${app.connected ? 'bg-accent-green' : 'bg-slate-700'}`} />
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{app.status}</span>
                       </div>
                    </div>
                 </div>
               ))}
               <button className="px-6 py-4 rounded-3xl border border-white/5 flex items-center gap-3 text-slate-500 hover:text-white hover:bg-white/5 transition-all">
                  <Plus size={16} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Add Tool</span>
               </button>
            </div>
          </section>

          {/* Right Column: Mini Dashboard */}
          <section className="space-y-6">
             <div className="glass-panel p-8 rounded-[3rem] border border-white/5 flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 rounded-full border-4 border-accent-blue/20 flex items-center justify-center relative">
                   <div className="absolute inset-0 rounded-full border-t-4 border-accent-blue animate-spin" />
                   <Database size={32} className="text-accent-blue" />
                </div>
                <div className="space-y-2">
                   <h3 className="text-lg font-medium text-white/90 uppercase tracking-tight">Active Context</h3>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">42.1k Semantic Nodes</p>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                   <div className="w-3/4 h-full bg-accent-blue shadow-[0_0_10px_rgba(72,156,193,0.5)]" />
                </div>
             </div>

             <div className="glass-panel p-8 rounded-[3rem] border border-white/5 space-y-6">
                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.25em]">Intelligence Feed</h4>
                <div className="space-y-5">
                   {[
                     { label: 'Calendar', status: 'Aligned', color: 'text-accent-blue' },
                     { label: 'Notion', status: 'Ready', color: 'text-white' },
                     { label: 'Search Re-ranking', status: 'Active', color: 'text-accent-green' },
                     { label: 'Slack', status: 'Pending', color: 'text-slate-600' }
                   ].map(item => (
                     <div key={item.label} className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400">{item.label}</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.status}</span>
                     </div>
                   ))}
                </div>
             </div>
          </section>

        </div>

      </div>
    </div>
  );
}
