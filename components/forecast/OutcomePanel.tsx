"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StudentState } from "@/lib/forecasting/decisionTypes";
import { cn } from "@/lib/cn";
import { Target, TrendingUp, Zap, Activity, Minimize2, Maximize2 } from "lucide-react";

interface OutcomePanelProps {
  state: StudentState;
  targetCgpa: number;
}

export default function OutcomePanel({ state, targetCgpa }: OutcomePanelProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <motion.div 
      drag
      dragConstraints={{ left: -500, right: 50, top: -50, bottom: 500 }}
      dragMomentum={false}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute top-6 right-6 w-80 z-50 flex flex-col gap-4 cursor-grab active:cursor-grabbing"
    >
      <div className="flex justify-between items-center bg-black/40 backdrop-blur-xl p-2 rounded-full border border-white/10 shadow-2xl">
        <div className="flex items-center gap-2 px-2">
          <Target size={14} className="text-primary" />
          <span className="text-xs font-bold text-white uppercase tracking-widest">Simulation HUD</span>
        </div>
        <button 
          onClick={() => setIsMinimized(!isMinimized)}
          className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 transition-colors"
        >
          {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
        </button>
      </div>

      <AnimatePresence>
        {!isMinimized && (
          <motion.div 
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            className="flex flex-col gap-4 overflow-hidden"
          >
            {/* Premium Teaser Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/30 backdrop-blur-xl shadow-xl pointer-events-auto">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="text-amber-400" size={16} />
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Aevos Pro</h3>
              </div>
              <p className="text-[10px] text-amber-200/80 leading-relaxed">
                Unlock infinite time-travel and specific company targeting. 
                <span className="font-bold text-amber-400 cursor-pointer hover:underline ml-1">Upgrade</span>
              </p>
            </div>

            {/* Main Stats */}
            <div className="p-5 rounded-2xl bg-[#0a0a0c]/80 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-5 pointer-events-auto">
              
              {/* CGPA */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Projected CGPA</span>
                  <span className={cn(
                    "text-2xl font-black tracking-tight",
                    state.currentCgpa >= targetCgpa ? "text-emerald-400" : "text-amber-400"
                  )}>
                    {state.currentCgpa.toFixed(2)}
                  </span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className={cn("h-full", state.currentCgpa >= targetCgpa ? "bg-emerald-500" : "bg-amber-500")}
                    initial={{ width: 0 }}
                    animate={{ width: `${(state.currentCgpa / 10) * 100}%` }}
                    transition={{ type: "spring", stiffness: 100 }}
                  />
                </div>
              </div>

              {/* Skill & Career */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Activity size={12} className="text-blue-400" />
                    <span className="text-[9px] text-white/60 uppercase tracking-wider font-bold">Skills</span>
                  </div>
                  <div className="text-lg font-bold text-white">{state.skillPoints}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp size={12} className="text-purple-400" />
                    <span className="text-[9px] text-white/60 uppercase tracking-wider font-bold">Career</span>
                  </div>
                  <div className="text-lg font-bold text-white">{state.careerReadiness}%</div>
                </div>
              </div>

              {/* Narrative Logs */}
              <div className="pt-4 border-t border-white/10">
                <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3">Timeline Events</h4>
                <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                  {state.logs.map((log, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-2.5 text-xs"
                    >
                      <div className="flex flex-col items-center mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                        {index !== state.logs.length - 1 && <div className="w-px h-full bg-white/10 mt-1" />}
                      </div>
                      <p className="text-white/70 leading-snug pb-2">{log}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
