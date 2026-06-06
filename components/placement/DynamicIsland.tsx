"use client";

import React, { useState } from "react";
import { Layers, Crosshair, Beaker, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";

interface DynamicIslandProps {
  mode: "matrix" | "radar";
  onModeChange: (mode: "matrix" | "radar") => void;
  sandboxActive: boolean;
  onSandboxToggle: () => void;
  cgpa: number;
  setCgpa: (val: number) => void;
  backlogs: number;
  setBacklogs: (val: number) => void;
}

export default function DynamicIsland({
  mode,
  onModeChange,
  sandboxActive,
  onSandboxToggle,
  cgpa,
  setCgpa,
  backlogs,
  setBacklogs,
}: DynamicIslandProps) {
  const [sandboxExpanded, setSandboxExpanded] = useState(false);

  const cgpaPercent = ((cgpa - 5) / 5) * 100;
  const backlogsPercent = (backlogs / 10) * 100;

  return (
    <div className="fixed top-28 right-8 z-[200] flex flex-col items-end gap-0">
      {/* ─── Main Dynamic Island Pill ─── */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={cn(
          "relative flex items-center bg-[#1a1a1a] rounded-full",
          "border border-white/[0.08]",
          "shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)]",
        )}
      >
        {/* Active Sandbox Glow */}
        {sandboxActive && (
          <motion.div
            className="absolute -inset-[2px] rounded-full pointer-events-none z-0"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(10,132,255,0.3) 70%, rgba(10,132,255,0.5) 100%)",
            }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        <div className="relative z-10 flex items-center bg-[#1a1a1a] rounded-full">
          {/* ─── Tab Switcher ─── */}
          <div className="flex items-center p-1.5">
            <button
              onClick={() => onModeChange("matrix")}
              className={cn(
                "relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300",
                mode === "matrix" ? "text-white" : "text-white/40 hover:text-white/70"
              )}
            >
              {mode === "matrix" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white/10 border border-white/10 rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <Layers size={15} className="relative z-10" />
              <span className="relative z-10">Placement</span>
            </button>

            <button
              onClick={() => onModeChange("radar")}
              className={cn(
                "relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300",
                mode === "radar" ? "text-white" : "text-white/40 hover:text-white/70"
              )}
            >
              {mode === "radar" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white/10 border border-white/10 rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <Crosshair size={15} className="relative z-10" />
              <span className="relative z-10">Skills</span>
            </button>
          </div>

          {/* ─── Divider ─── */}
          <div className="w-px h-6 bg-white/10" />

          {/* ─── Sandbox Toggle ─── */}
          <button
            onClick={() => setSandboxExpanded(!sandboxExpanded)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 mx-1.5 rounded-full transition-all duration-300",
              sandboxExpanded ? "bg-white/10" : "hover:bg-white/5",
            )}
          >
            <div className="relative">
              <Beaker size={15} className={sandboxActive ? "text-[#0a84ff]" : "text-white/40"} />
              {sandboxActive && (
                <motion.div
                  className="absolute -top-0.5 -right-0.5 w-[6px] h-[6px] bg-[#0a84ff] rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </div>
            {sandboxActive && (
              <span className="text-xs font-bold text-[#0a84ff] tabular-nums">{cgpa.toFixed(1)}</span>
            )}
          </button>
        </div>
      </motion.div>

      {/* ─── Sandbox Expanded Panel (grows downward) ─── */}
      <AnimatePresence>
        {sandboxExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scaleY: 0.8, height: 0 }}
            animate={{ opacity: 1, y: 0, scaleY: 1, height: "auto" }}
            exit={{ opacity: 0, y: -10, scaleY: 0.8, height: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{ originY: 0 }}
            className="overflow-hidden mt-3"
          >
            <div className="w-[400px] bg-[#1a1a1a] border border-white/[0.08] rounded-[24px] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)]">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "p-1.5 rounded-lg transition-all duration-300",
                    sandboxActive ? "bg-[#0a84ff] shadow-[0_0_15px_rgba(10,132,255,0.4)]" : "bg-white/10"
                  )}>
                    <Beaker size={14} className="text-white" />
                  </div>
                  <span className="text-xs font-bold text-white/80 uppercase tracking-[0.15em]">Sandbox Engine</span>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Toggle */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onSandboxToggle(); }}
                    className={cn(
                      "w-10 h-[22px] rounded-full transition-colors duration-300 relative flex items-center px-[2px] shrink-0",
                      sandboxActive ? "bg-[#34c759]" : "bg-white/15"
                    )}
                  >
                    <motion.div
                      layout
                      className="w-[18px] h-[18px] bg-white rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
                      animate={{ x: sandboxActive ? 18 : 0 }}
                      transition={{ type: "spring", stiffness: 600, damping: 35 }}
                    />
                  </button>

                  {/* Collapse */}
                  <button
                    onClick={() => setSandboxExpanded(false)}
                    className="p-1 rounded-full bg-white/5 hover:bg-white/15 text-white/40 hover:text-white/80 transition-colors"
                  >
                    <ChevronDown size={14} className="rotate-180" />
                  </button>
                </div>
              </div>

              {/* Controls */}
              <div className={cn(
                "space-y-4 transition-all duration-300",
                !sandboxActive && "opacity-25 pointer-events-none"
              )}>
                {/* CGPA */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">CGPA</label>
                    <input
                      type="number" min="5" max="10" step="0.1"
                      value={cgpa}
                      onChange={(e) => setCgpa(Math.min(10, Math.max(5, parseFloat(e.target.value) || 5)))}
                      disabled={!sandboxActive}
                      className="w-12 bg-transparent text-[#0a84ff] font-black text-base text-right outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="relative h-[5px] w-full rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      className="absolute top-0 left-0 h-full bg-[#0a84ff] rounded-full"
                      animate={{ width: `${cgpaPercent}%` }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                    <input
                      type="range" min="5" max="10" step="0.1"
                      value={cgpa}
                      onChange={(e) => setCgpa(parseFloat(e.target.value))}
                      disabled={!sandboxActive}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Backlogs */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Backlogs</label>
                    <input
                      type="number" min="0" max="10" step="1"
                      value={backlogs}
                      onChange={(e) => setBacklogs(Math.min(10, Math.max(0, parseInt(e.target.value) || 0)))}
                      disabled={!sandboxActive}
                      className="w-12 bg-transparent text-[#ff453a] font-black text-base text-right outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="relative h-[5px] w-full rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      className="absolute top-0 left-0 h-full bg-[#ff453a] rounded-full"
                      animate={{ width: `${backlogsPercent}%` }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                    <input
                      type="range" min="0" max="10" step="1"
                      value={backlogs}
                      onChange={(e) => setBacklogs(parseInt(e.target.value))}
                      disabled={!sandboxActive}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
