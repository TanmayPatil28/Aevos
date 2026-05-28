"use client";

import { useOSMode } from "@/contexts/OSModeContext";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Briefcase, LayoutDashboard, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { useState, useRef, useEffect } from "react";

export default function OSModeSwitcher() {
  const { mode, setMode } = useOSMode();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const modes = [
    { id: "academic", label: "Academic", icon: GraduationCap, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { id: "unified", label: "Unified", icon: LayoutDashboard, color: "text-white", bg: "bg-white/5", border: "border-white/10" },
    { id: "career", label: "Career", icon: Briefcase, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" }
  ];

  const active = modes.find(m => m.id === mode) || modes[1];
  const ActiveIcon = active.icon;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-10 px-3 md:px-4 rounded-full flex items-center gap-2 border transition-all duration-300 shadow-inner group",
          active.bg, active.border,
          isOpen ? "bg-white/10 border-white/20" : "hover:bg-white/10"
        )}
      >
        <ActiveIcon size={16} className={active.color} />
        <span className={cn("text-[13px] font-bold tracking-tight hidden md:block", active.color)}>
          {active.label} OS
        </span>
        <ChevronDown size={14} className={cn("text-white/40 transition-transform duration-300", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute top-full right-0 mt-2 w-[180px] bg-[#0A0A0A]/95 backdrop-blur-3xl border border-white/10 rounded-[20px] shadow-premium p-1.5 z-[99999]"
          >
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setMode(m.id as any);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-[14px] transition-all group",
                  mode === m.id ? "bg-white/5" : "hover:bg-white/5"
                )}
              >
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors", mode === m.id ? m.bg : "bg-white/5 group-hover:bg-white/10")}>
                  <m.icon size={16} className={mode === m.id ? m.color : "text-white/50 group-hover:text-white/80"} />
                </div>
                <span className={cn("text-[13px] font-bold tracking-tight", mode === m.id ? "text-white" : "text-white/60 group-hover:text-white/90")}>
                  {m.label}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
