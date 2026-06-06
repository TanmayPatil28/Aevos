"use client";

import React, { useState } from "react";
import { Beaker, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";

interface SandboxPanelProps {
  isActive: boolean;
  onToggle: () => void;
  cgpa: number;
  setCgpa: (val: number) => void;
  backlogs: number;
  setBacklogs: (val: number) => void;
}

export default function SandboxPanel({
  isActive,
  onToggle,
  cgpa,
  setCgpa,
  backlogs,
  setBacklogs
}: SandboxPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const cgpaPercent = ((cgpa - 5) / 5) * 100;
  const backlogsPercent = (backlogs / 10) * 100;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200]">
      <motion.div
        layout
        transition={{
          layout: { type: "spring", stiffness: 400, damping: 30 },
        }}
        className={cn(
          "relative overflow-hidden cursor-pointer",
          "bg-[#1a1a1a] border border-white/[0.08]",
          "shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)]",
          isExpanded ? "rounded-[28px]" : "rounded-full",
        )}
        onClick={() => !isExpanded && setIsExpanded(true)}
      >
        {/* Active Glow Ring */}
        {isActive && (
          <motion.div
            className="absolute -inset-[2px] rounded-[30px] pointer-events-none z-0"
            style={{
              background: "linear-gradient(135deg, rgba(10,132,255,0.4), rgba(94,92,230,0.2), rgba(10,132,255,0.4))",
            }}
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        {/* Inner background to mask the glow ring */}
        <div className={cn(
          "relative z-10",
          isExpanded ? "rounded-[28px]" : "rounded-full",
          "bg-[#1a1a1a]",
        )}>
          <AnimatePresence mode="wait">
            {!isExpanded ? (
              /* ─── COLLAPSED STATE ─── */
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-3 px-5 py-3 select-none"
              >
                {/* Beaker icon with activity dot */}
                <div className="relative">
                  <Beaker size={18} className={isActive ? "text-[#0a84ff]" : "text-white/60"} />
                  {isActive && (
                    <motion.div
                      className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#0a84ff] rounded-full"
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                </div>

                <span className="text-sm font-semibold text-white/90 tracking-wide">Sandbox</span>

                {/* Live CGPA Value */}
                <div className="h-5 w-px bg-white/10" />
                <span className={cn(
                  "text-sm font-bold tabular-nums",
                  isActive ? "text-[#0a84ff]" : "text-white/40"
                )}>
                  {cgpa.toFixed(2)}
                </span>
              </motion.div>
            ) : (
              /* ─── EXPANDED STATE ─── */
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="w-[420px] p-6"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-xl transition-all duration-300",
                      isActive ? "bg-[#0a84ff] shadow-[0_0_20px_rgba(10,132,255,0.4)]" : "bg-white/10"
                    )}>
                      <Beaker size={18} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-wide">Sandbox Engine</h3>
                      <p className="text-[11px] text-white/30 mt-0.5">Simulate different metrics</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* macOS Toggle */}
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggle(); }}
                      className={cn(
                        "w-[44px] h-[26px] rounded-full transition-colors duration-300 relative flex items-center px-[3px] shrink-0",
                        isActive ? "bg-[#34c759]" : "bg-white/15"
                      )}
                    >
                      <motion.div
                        layout
                        className="w-5 h-5 bg-white rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.4)]"
                        animate={{ x: isActive ? 18 : 0 }}
                        transition={{ type: "spring", stiffness: 600, damping: 35 }}
                      />
                    </button>

                    {/* Collapse Button */}
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-white/50 hover:text-white/80 transition-colors"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </div>

                {/* Controls */}
                <div className={cn(
                  "space-y-5 transition-all duration-300",
                  !isActive && "opacity-25 pointer-events-none"
                )}>
                  {/* CGPA Slider */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-baseline">
                      <label className="text-[11px] font-bold text-white/50 uppercase tracking-[0.15em]">CGPA</label>
                      <input
                        type="number"
                        min="5" max="10" step="0.1"
                        value={cgpa}
                        onChange={(e) => setCgpa(Math.min(10, Math.max(5, parseFloat(e.target.value) || 5)))}
                        disabled={!isActive}
                        className="w-14 bg-transparent text-[#0a84ff] font-black text-lg text-right outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>

                    <div className="relative h-[6px] w-full rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        className="absolute top-0 left-0 h-full bg-[#0a84ff] rounded-full"
                        animate={{ width: `${cgpaPercent}%` }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                      <input
                        type="range" min="5" max="10" step="0.1"
                        value={cgpa}
                        onChange={(e) => setCgpa(parseFloat(e.target.value))}
                        disabled={!isActive}
                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Backlogs Slider */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-baseline">
                      <label className="text-[11px] font-bold text-white/50 uppercase tracking-[0.15em]">Backlogs</label>
                      <input
                        type="number"
                        min="0" max="10" step="1"
                        value={backlogs}
                        onChange={(e) => setBacklogs(Math.min(10, Math.max(0, parseInt(e.target.value) || 0)))}
                        disabled={!isActive}
                        className="w-14 bg-transparent text-[#ff453a] font-black text-lg text-right outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>

                    <div className="relative h-[6px] w-full rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        className="absolute top-0 left-0 h-full bg-[#ff453a] rounded-full"
                        animate={{ width: `${backlogsPercent}%` }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                      <input
                        type="range" min="0" max="10" step="1"
                        value={backlogs}
                        onChange={(e) => setBacklogs(parseInt(e.target.value))}
                        disabled={!isActive}
                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
