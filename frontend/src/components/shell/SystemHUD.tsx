"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Activity, Zap, Cpu, Bell } from "lucide-react";
import ShinyText from "../ui/react-bits/ShinyText";
import DecryptedText from "../ui/react-bits/DecryptedText";

export default function SystemHUD() {
  const [sessionTokens, setSessionTokens] = useState(0);
  const [meshStatus, setMeshStatus] = useState("INITIALIZING");
  const [guardrailStatus, setGuardrailStatus] = useState("ACTIVE");
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  useEffect(() => {
    async function fetchHUD() {
      try {
        const healthRes = await fetch(`${API_BASE.replace('/api/v1', '')}/health`);
        
        if (healthRes.ok) {
          const healthData = await healthRes.json();
          setMeshStatus(healthData.status === "ok" ? "SYNCHRONIZED" : "DEGRADED");
        }
      } catch (e) {
        console.error("HUD Pulse Error:", e);
        setMeshStatus("OFFLINE");
      }
    }

    fetchHUD();
    const interval = setInterval(fetchHUD, 10000);
    return () => clearInterval(interval);
  }, [API_BASE]);

  return (
    <div className="fixed top-0 left-0 w-full z-[100] h-10 glass-panel-heavy border-b border-white/5 flex items-center px-6">
      <div className="flex items-center gap-6 w-full max-w-[1600px] mx-auto">
        
        {/* Branding */}
        <div className="flex items-center gap-3 border-r border-white/10 pr-6">
          <div className="w-4 h-4 rounded-sm bg-accent-blue/20 flex items-center justify-center border border-accent-blue/40">
            <Cpu size={10} className="text-accent-blue" />
          </div>
          <ShinyText 
            text="ATHENA_OS // VER 2.5" 
            className="text-[10px] font-black tracking-[0.2em] opacity-80" 
          />
        </div>

        {/* Live Metrics */}
        <div className="flex items-center gap-8 text-[9px] font-bold uppercase tracking-widest text-slate-500">
          <div className="flex items-center gap-2">
            <Activity size={12} className="text-accent-green" />
            <span>Mesh:</span>
            <span className="text-accent-green min-w-[100px]">
              <DecryptedText 
                text={meshStatus}
                animateOn="view"
                className="text-accent-green"
              />
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Shield size={12} className="text-accent-blue" />
            <span>Guardrails:</span>
            <span className="text-accent-blue">
              <DecryptedText text={guardrailStatus} animateOn="view" />
            </span>
          </div>
        </div>

        {/* Right Side Info */}
        <div className="ml-auto flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Director Terminal Active</span>
          </div>
          <button className="text-slate-500 hover:text-white transition-colors">
            <Bell size={14} />
          </button>
        </div>

      </div>
    </div>
  );
}
