"use client";

import React from "react";
import { Shield, Scale, Activity, Briefcase } from "lucide-react";

export type BurnoutStrategy = "SAFE" | "BALANCED" | "SURVIVAL" | "PLACEMENT";

interface StrategySelectorProps {
  currentStrategy: BurnoutStrategy;
  onStrategyChange: (strategy: BurnoutStrategy) => void;
}

const strategies: { id: BurnoutStrategy; label: string; icon: React.ElementType; color: string; desc: string }[] = [
  {
    id: "SAFE",
    label: "Safe Mode",
    icon: Shield,
    color: "text-emerald-400 border-emerald-500/30 ring-emerald-500/20 shadow-none",
    desc: "Maintain 80%+ buffer for zero detention risk."
  },
  {
    id: "BALANCED",
    label: "Balanced",
    icon: Scale,
    color: "text-blue-400 border-blue-500/30 ring-blue-500/20 shadow-none",
    desc: "Target exactly the minimum requirement (e.g. 75%)."
  },
  {
    id: "SURVIVAL",
    label: "Survival Mode",
    icon: Activity,
    color: "text-amber-400 border-amber-500/30 ring-amber-500/20 shadow-none",
    desc: "Focus only on strict faculty. Low effort elsewhere."
  },
  {
    id: "PLACEMENT",
    label: "Placement Prep",
    icon: Briefcase,
    color: "text-indigo-400 border-indigo-500/30 ring-indigo-500/20 shadow-none",
    desc: "Sacrifice theory subjects to maximize prep time."
  }
];

export default function StrategySelector({ currentStrategy, onStrategyChange }: StrategySelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-white/50 tracking-widest uppercase font-mono">
          Burnout-Aware Strategy
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {strategies.map((strategy) => {
          const Icon = strategy.icon;
          const isActive = currentStrategy === strategy.id;
          return (
            <button
              key={strategy.id}
              onClick={() => onStrategyChange(strategy.id)}
              className={`p-4 rounded-2xl border text-left transition-all duration-500 flex flex-col gap-3 group relative overflow-hidden ${
                isActive 
                  ? `bg-[#1D1D1F] ${strategy.color} ring-1 scale-[1.02] border-white/20` 
                  : "bg-[#1D1D1F] border-white/5 text-white/50 hover:border-white/10"
              }`}
            >
              <div className="flex items-center gap-2 relative z-10">
                <Icon className={`w-4 h-4 ${isActive ? "" : "text-white/40 group-hover:text-white/60 transition-colors"}`} />
                <span className={`font-bold text-[13px] tracking-wide ${isActive ? "text-white" : "text-white/70 group-hover:text-white transition-colors"}`}>
                  {strategy.label}
                </span>
              </div>
              <p className={`text-[11px] leading-relaxed relative z-10 ${isActive ? "text-white/70" : "text-white/40"}`}>
                {strategy.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
