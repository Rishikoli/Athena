import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/shell/Sidebar";

const inter = Inter({ variable: "--font-primary", subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Athena | AI Chief of Staff",
  description: "Autonomous Agent Workflow Command Center",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-base)" }}>
          <Sidebar />
          <main className="flex-1 relative overflow-auto p-4 lg:p-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
