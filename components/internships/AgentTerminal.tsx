"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { TerminalSquare } from "lucide-react";

export default function AgentTerminal() {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sequence = [
      "Initializing Autonomous Web Scraper Agent...",
      "Bypassing standard API limits...",
      "Targeting stealth startup boards and YC Hacker News...",
      "Crawling deep-tech career pages...",
      "Found 14 potential matches...",
      "Cross-referencing requirements with your profile...",
      "Filtering out low compensation roles...",
      "Extracting hidden salary and deadline metadata...",
      "Compiling VIP Hidden Gems...",
      "Agent Search Complete."
    ];

    let i = 0;
    const interval = setInterval(() => {
      setLogs((prev) => [...prev, sequence[i]]);
      i++;
      if (i === sequence.length) clearInterval(interval);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full bg-[#0d0d0d] rounded-xl border border-border shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] overflow-hidden font-mono text-[12px] h-[200px] flex flex-col">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.05] bg-[#111]">
        <TerminalSquare size={14} className="text-[#ffd60a]" />
        <span className="text-foreground-muted font-bold tracking-widest uppercase text-[10px]">Deep Dive Agent Terminal</span>
      </div>
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto flex flex-col gap-1.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth">
        {logs.map((log, i) => (
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            key={i}
            className="flex items-start gap-2"
          >
            <span className="text-[#ffd60a] opacity-50 shrink-0">{'>'}</span>
            <span className={i === logs.length - 1 ? "text-[#32d74b] font-bold" : "text-foreground/80"}>{log}</span>
          </motion.div>
        ))}
        {logs.length < 10 && (
          <motion.div animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-3 bg-[#ffd60a] mt-1 ml-4" />
        )}
      </div>
    </div>
  );
}
