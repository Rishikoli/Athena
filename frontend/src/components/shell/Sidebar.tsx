"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, GitBranch, Network, Map, Activity } from "lucide-react";

const NAV = [
  { href: "/",           icon: LayoutDashboard, label: "Command Center" },
  { href: "/workflows",  icon: GitBranch,       label: "Workflows" },
  { href: "/graph",      icon: Network,         label: "Agent Graph" },
  { href: "/memory",     icon: Map,             label: "Memory Map" },
  { href: "/analytics",  icon: Activity,        label: "Reactor Core" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 relative hidden lg:block p-6">
      <div
        className="w-full h-full rounded-3xl flex flex-col py-8 px-5"
        style={{
          background: "#E6E9EF",
          boxShadow: "-1px -1px 1px rgba(255,255,255,0.6), -20px -20px 40px rgba(255,255,255,1), 20px 20px 40px rgba(211,219,230,1)",
        }}
      >
        {/* Brand */}
        <div className="px-2 mb-10">
          <div className="text-2xl font-bold tracking-tighter" style={{ color: "var(--accent-blue)" }}>
            ATHENA
          </div>
          <div className="text-xs font-mono mt-1" style={{ color: "var(--text-muted)" }}>v2.0 / ADK · Gemini</div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1.5">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}>
                <div
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: active ? "var(--accent-blue)" : "transparent",
                    color: active ? "#fff" : "var(--text-secondary)",
                    boxShadow: active
                      ? "inset -2px -2px 4px rgba(255,255,255,0.15), inset 2px 2px 4px rgba(0,0,0,0.1)"
                      : "none",
                  }}
                >
                  <Icon size={16} />
                  {label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Status badge */}
        <div className="mt-auto px-2">
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs"
            style={{
              background: "rgba(33,168,125,0.12)",
              border: "1px solid rgba(33,168,125,0.2)",
              color: "var(--accent-green)",
            }}
          >
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--accent-green)" }} />
            <span className="font-medium">ADK Online · Vertex AI</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
