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

import { cn } from "@/lib/cn";

export default function StrategySelector({ currentStrategy, onStrategyChange }: StrategySelectorProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div 
        className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full"
        style={{ WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)', maskImage: 'linear-gradient(to right, black 85%, transparent 100%)' }}
      >
        {strategies.map((strategy) => {
          const Icon = strategy.icon;
          const isActive = currentStrategy === strategy.id;
          return (
            <motion.button
              key={strategy.id}
              onClick={() => onStrategyChange(strategy.id)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "relative px-4 py-2 rounded-full text-[12px] font-medium transition-colors duration-300 whitespace-nowrap border outline-none",
                isActive 
                  ? "text-black border-transparent bg-white shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
                  : "bg-[#111111] text-zinc-400 hover:text-white/90 hover:bg-[#1A1A1A] border-white/[0.04]"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeStrategyBg"
                  className="absolute inset-0 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                  transition={{ type: "spring", stiffness: 500, damping: 35, mass: 1 }}
                />
              )}
              <span className="relative z-10">
                {strategy.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
