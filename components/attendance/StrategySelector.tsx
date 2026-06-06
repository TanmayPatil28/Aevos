"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Scale, Activity, Briefcase } from "lucide-react";

export type BurnoutStrategy = "SAFE" | "BALANCED" | "SURVIVAL" | "PLACEMENT";

interface StrategySelectorProps {
  currentStrategy: BurnoutStrategy;
  onStrategyChange: (strategy: BurnoutStrategy) => void;
}

const strategies: { 
  id: BurnoutStrategy; 
  label: string; 
  icon: React.ElementType; 
  color: string; 
  activeBg: string; 
  activeBorder: string; 
  glow: string; 
  desc: string; 
}[] = [
  {
    id: "SAFE",
    label: "Safe Mode",
    icon: Shield,
    color: "text-emerald-400",
    activeBg: "bg-emerald-500/10",
    activeBorder: "border-emerald-500/30",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.1)]",
    desc: "Maintain 80%+ buffer for zero detention risk."
  },
  {
    id: "BALANCED",
    label: "Balanced Mode",
    icon: Scale,
    color: "text-blue-400",
    activeBg: "bg-blue-500/10",
    activeBorder: "border-blue-500/30",
    glow: "shadow-[0_0_20px_rgba(59,130,246,0.1)]",
    desc: "Target exactly the minimum requirement (e.g. 75%)."
  },
  {
    id: "SURVIVAL",
    label: "Survival Mode",
    icon: Activity,
    color: "text-amber-400",
    activeBg: "bg-amber-500/10",
    activeBorder: "border-amber-500/30",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.1)]",
    desc: "Focus only on strict faculty. Low effort elsewhere."
  },
  {
    id: "PLACEMENT",
    label: "Placement Prep",
    icon: Briefcase,
    color: "text-indigo-400",
    activeBg: "bg-indigo-500/10",
    activeBorder: "border-indigo-500/30",
    glow: "shadow-[0_0_20px_rgba(99,102,241,0.1)]",
    desc: "Sacrifice theory subjects to maximize prep time."
  }
];

export default function StrategySelector({ currentStrategy, onStrategyChange }: StrategySelectorProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <h2 className="text-[10px] font-black text-white/40 tracking-[0.2em] uppercase mb-1 px-1">
        Burnout Strategy
      </h2>
      <div className="flex flex-col gap-3 w-full">
        {strategies.map((strategy) => {
          const Icon = strategy.icon;
          const isActive = currentStrategy === strategy.id;
          return (
            <motion.button
              layout
              key={strategy.id}
              onClick={() => onStrategyChange(strategy.id)}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className={`group flex overflow-hidden relative w-full text-left transition-all duration-300 ${
                isActive 
                  ? `bg-[#1c1c1e] ${strategy.activeBorder} ${strategy.glow} rounded-[20px] p-5 border scale-[1.02] z-20` 
                  : "bg-white/[0.03] border-white/5 text-white/50 hover:bg-white/[0.06] hover:border-white/10 hover:text-white/80 rounded-full py-3.5 px-5 border z-10"
              }`}
            >
              <motion.div layout className="flex items-start gap-4 w-full">
                {/* ICON CONTAINER */}
                <motion.div 
                  layout
                  className={`flex flex-shrink-0 items-center justify-center w-7 h-7 rounded-full border transition-colors mt-0.5 ${
                    isActive 
                      ? `${strategy.color} border-current bg-current/10` 
                      : "border-white/20 group-hover:border-white/40 text-white/60 group-hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </motion.div>

                {/* TEXT CONTENT */}
                <div className="flex flex-col flex-1 min-w-0 pr-2">
                  <motion.span 
                    layout 
                    className={`font-bold tracking-wide text-sm transition-colors duration-300 ${
                      isActive ? "text-white" : "text-white/70 group-hover:text-white"
                    }`}
                  >
                    {strategy.label}
                  </motion.span>
                  
                  {isActive && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-xs leading-relaxed text-white/50 mt-1.5 font-medium"
                    >
                      {strategy.desc}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
