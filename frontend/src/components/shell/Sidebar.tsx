"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  GitBranch, 
  Network, 
  Map, 
  Activity, 
  Database,
  Cpu,
  Layers
} from "lucide-react";
import { motion } from "framer-motion";

const NAV = [
  { href: "/",           icon: LayoutDashboard, label: "Command Center" },
  { href: "/workflows",  icon: GitBranch,       label: "Workflows" },
  { href: "/graph",      icon: Network,         label: "Agent Graph" },
  { href: "/memory",     icon: Map,             label: "Memory Map" },
  { href: "/sources",    icon: Database,        label: "Knowledge Reservoir" },
  { href: "/analytics",  icon: Activity,        label: "Reactor Core" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 flex-shrink-0 relative hidden lg:block p-6 border-r border-white/5 bg-[#0A0C10]/50 backdrop-blur-3xl">
      <div className="w-full h-full flex flex-col py-8 px-4">
        
        {/* Brand */}
        <div className="px-4 mb-12">
          <div className="flex items-center gap-2 mb-1">
             <div className="p-1.5 bg-accent-blue/10 rounded-lg">
                <Cpu size={20} className="text-accent-blue" />
             </div>
             <div className="text-2xl font-black tracking-tighter text-white">
               ATHENA
             </div>
          </div>
          <p className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">
            Chief of Staff · AI-25
          </p>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-2">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all relative overflow-hidden group ${
                    active 
                    ? "text-white bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.02)]" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {active && (
                    <motion.div 
                      layoutId="active-indicator"
                      className="absolute left-0 w-1 h-1/2 bg-accent-blue rounded-r-full shadow-[0_0_10px_#489CC1]"
                    />
                  )}
                  <Icon size={18} className={active ? "text-accent-blue" : "text-slate-500 group-hover:text-white transition-colors"} />
                  <span className="tracking-tight">{label}</span>
                  {active && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-blue shadow-[0_0_10px_#489CC1]" />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Status Area */}
        <div className="mt-auto px-4 space-y-4">
           <div className="p-5 glass-card rounded-[2rem] border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mesh Status</p>
                 <Activity size={12} className="text-accent-green animate-pulse" />
              </div>
              <div className="space-y-2">
                 <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "65%" }}
                      className="h-full bg-accent-blue shadow-[0_0_10px_#489CC1]"
                    />
                 </div>
                 <p className="text-[10px] font-bold text-slate-400">Memory Pressure Low</p>
              </div>
           </div>

           <div className="flex items-center gap-3 px-2">
              <div className="w-2 h-2 rounded-full bg-accent-green shadow-[0_0_8px_#21A87D]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Connected</span>
           </div>
        </div>
      </div>
    </aside>
  );
}
