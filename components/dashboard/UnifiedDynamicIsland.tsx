"use client";

import React from "react";
import { LayoutGrid, GraduationCap, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface UnifiedDynamicIslandProps {
  mode: "DEFAULT" | "OPTIMIZATION" | "FOCUS";
  onModeChange: (mode: "DEFAULT" | "OPTIMIZATION" | "FOCUS") => void;
}

export default function UnifiedDynamicIsland({
  mode,
  onModeChange,
}: UnifiedDynamicIslandProps) {
  return (
    <div className="fixed top-28 right-8 z-[200] flex flex-col items-end gap-0">
      {/* ─── Main Dynamic Island Pill ─── */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 350, damping: 28, mass: 1 }}
        className={cn(
          "relative flex items-center bg-black rounded-full",
          "border border-white/[0.08]",
          "shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)]",
        )}
      >
        <div className="relative z-10 flex items-center bg-black border border-zinc-800 rounded-full p-1.5 shadow-xl">
          {/* ─── Tab Switcher ─── */}
          <button
            onClick={() => onModeChange("OPTIMIZATION")}
            className={cn(
              "relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300",
              mode !== "FOCUS" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {mode !== "FOCUS" && (
              <motion.div
                layoutId="activeTabDashboard"
                className="absolute inset-0 bg-[#0a84ff] rounded-full shadow-[0_0_15px_rgba(10,132,255,0.4)]"
                transition={{ type: "spring", stiffness: 350, damping: 28, mass: 1 }}
              />
            )}
            <GraduationCap size={15} className="relative z-10" />
            <span className="relative z-10 hidden sm:inline">Academic</span>
          </button>
          
          <button
            onClick={() => onModeChange("FOCUS")}
            className={cn(
              "relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300",
              mode === "FOCUS" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {mode === "FOCUS" && (
              <motion.div
                layoutId="activeTabDashboard"
                className="absolute inset-0 bg-[#0a84ff] rounded-full shadow-[0_0_15px_rgba(10,132,255,0.4)]"
                transition={{ type: "spring", stiffness: 350, damping: 28, mass: 1 }}
              />
            )}
            <Briefcase size={15} className="relative z-10" />
            <span className="relative z-10 hidden sm:inline">Career</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
