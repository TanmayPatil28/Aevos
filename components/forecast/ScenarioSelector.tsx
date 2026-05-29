"use client";

import React from "react";
import { ForecastScenario } from "@/lib/forecasting/types";
import { cn } from "@/lib/cn";
import { TrendingUp, Equal, TrendingDown, CheckCircle, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface ScenarioSelectorProps {
  scenarios: ForecastScenario[];
  activeScenarioId: string;
  setActiveScenarioId: (id: string) => void;
}

export default function ScenarioSelector({
  scenarios,
  activeScenarioId,
  setActiveScenarioId
}: ScenarioSelectorProps) {
  // Styles based on scenario id
  const configs = {
    improve: {
      color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
      activeBg: "bg-emerald-500/10 border-emerald-500/40 shadow-emerald-500/10",
      icon: TrendingUp,
      badgeText: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    maintain: {
      color: "text-blue-400 border-blue-500/20 bg-blue-500/5",
      activeBg: "bg-blue-500/10 border-blue-500/40 shadow-blue-500/10",
      icon: Equal,
      badgeText: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    decline: {
      color: "text-red-400 border-red-500/20 bg-red-500/5",
      activeBg: "bg-red-500/10 border-red-500/40 shadow-red-500/10",
      icon: TrendingDown,
      badgeText: "bg-red-500/10 text-red-400 border-red-500/20",
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {scenarios.map((scenario) => {
        const isActive = activeScenarioId === scenario.id;
        const config = configs[scenario.id as keyof typeof configs] || configs.maintain;
        const Icon = config.icon;

        return (
          <button
            key={scenario.id}
            onClick={() => setActiveScenarioId(scenario.id)}
            className={cn(
              "relative flex flex-col justify-between text-left p-5 rounded-2xl border transition-all duration-300 backdrop-blur-md",
              isActive 
                ? cn("border-white/20 bg-white/[0.06] shadow-xl", config.activeBg) 
                : "border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10"
            )}
          >
            {/* Active Indicator Pip */}
            {isActive && (
              <motion.div
                layoutId="activeScenarioIndicator"
                className={cn("absolute top-3 right-3 w-1.5 h-1.5 rounded-full", 
                  scenario.id === "improve" ? "bg-emerald-400" : scenario.id === "decline" ? "bg-red-400" : "bg-blue-400"
                )}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}

            <div>
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className={cn("p-2 rounded-xl bg-white/5", config.color)}>
                  <Icon size={16} />
                </div>
                <h4 className="text-sm font-bold text-white tracking-wide">{scenario.name}</h4>
              </div>

              {/* Description */}
              <p className="text-xs text-white/50 mb-4 min-h-[32px] leading-relaxed">
                {scenario.description}
              </p>
            </div>

            {/* Metrics */}
            <div className="pt-3 border-t border-white/20 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/40">Assumed SGPA:</span>
                <span className="font-bold text-white">{scenario.assumedSgpa.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/40">Projected CGPA:</span>
                <span className="font-bold text-white text-sm">{scenario.finalCgpa.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-white/40">Target Status:</span>
                {scenario.meetsTarget ? (
                  <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                    <CheckCircle size={10} /> Meets Goal
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-amber-400">
                    <AlertTriangle size={10} /> Shortfall
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
