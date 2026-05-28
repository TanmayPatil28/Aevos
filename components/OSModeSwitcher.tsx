"use client";

import { useOSMode } from "@/contexts/OSModeContext";
import { motion } from "framer-motion";
import { GraduationCap, Briefcase, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/cn";

export default function OSModeSwitcher() {
  const { mode, setMode } = useOSMode();

  return (
    <div className="flex bg-[#000000]/40 border border-white/[0.05] rounded-full p-1 shadow-inner backdrop-blur-3xl relative overflow-hidden">
      {/* Animated Background Pill */}
      <motion.div
        className={cn(
          "absolute top-1 bottom-1 w-[32%] rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)] z-0",
          mode === "academic" && "bg-blue-500/20",
          mode === "unified" && "bg-white/10",
          mode === "career" && "bg-purple-500/20"
        )}
        initial={false}
        animate={{
          left: mode === "academic" ? "4px" : mode === "unified" ? "34%" : "65%",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      />

      <button
        onClick={() => setMode("academic")}
        className={cn(
          "relative z-10 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full transition-colors font-bold text-[13px] tracking-tight",
          mode === "academic" ? "text-blue-400" : "text-white/50 hover:text-white"
        )}
      >
        <GraduationCap size={16} />
        <span className="hidden lg:inline">Academic</span>
      </button>

      <button
        onClick={() => setMode("unified")}
        className={cn(
          "relative z-10 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full transition-colors font-bold text-[13px] tracking-tight",
          mode === "unified" ? "text-white" : "text-white/50 hover:text-white"
        )}
      >
        <LayoutDashboard size={16} />
        <span className="hidden lg:inline">Unified</span>
      </button>

      <button
        onClick={() => setMode("career")}
        className={cn(
          "relative z-10 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full transition-colors font-bold text-[13px] tracking-tight",
          mode === "career" ? "text-purple-400" : "text-white/50 hover:text-white"
        )}
      >
        <Briefcase size={16} />
        <span className="hidden lg:inline">Career</span>
      </button>
    </div>
  );
}
