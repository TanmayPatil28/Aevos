"use client";

import React from "react";
import { motion } from "framer-motion";
import { StudentState } from "@/lib/forecasting/decisionTypes";
import { cn } from "@/lib/cn";
import { Target, TrendingUp, Activity, BookOpen } from "lucide-react";

interface ForecastStatusBarProps {
  state: StudentState;
  targetCgpa: number;
}

export default function ForecastStatusBar({ state, targetCgpa }: ForecastStatusBarProps) {
  return (
    <div className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
          <Target size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">Neural Forecast</h2>
          <p className="text-[10px] text-white/50">Simulating outcomes</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* CGPA */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Projected CGPA</span>
          <div className="flex items-center gap-3">
            <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className={cn("h-full", state.currentCgpa >= targetCgpa ? "bg-emerald-500" : "bg-amber-500")}
                initial={{ width: 0 }}
                animate={{ width: `${(state.currentCgpa / 10) * 100}%` }}
                transition={{ type: "spring", stiffness: 100 }}
              />
            </div>
            <span className={cn(
              "text-lg font-black tracking-tight",
              state.currentCgpa >= targetCgpa ? "text-emerald-400" : "text-amber-400"
            )}>
              {state.currentCgpa.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="w-px h-8 bg-white/10" />

        {/* Skills */}
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-1.5 mb-1">
            <Activity size={10} className="text-blue-400" />
            <span className="text-[9px] text-white/50 uppercase tracking-wider font-bold">Skills</span>
          </div>
          <div className="text-sm font-bold text-white">{state.skillPoints} pts</div>
        </div>

        {/* Career */}
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={10} className="text-purple-400" />
            <span className="text-[9px] text-white/50 uppercase tracking-wider font-bold">Career</span>
          </div>
          <div className="text-sm font-bold text-white">{state.careerReadiness}%</div>
        </div>
      </div>
    </div>
  );
}
