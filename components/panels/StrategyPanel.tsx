"use client";

import React, { useMemo } from "react";
import { useUSMStore } from "@/stores/usmStore";
import { strategyAllocator } from "@/lib/strategy/strategyAllocator";
import StrategyCard from "@/components/strategy/StrategyCard";
import { Compass, AlertCircle, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function StrategyPanel() {
  const store = useUSMStore();
  const { presetId, academic, courses } = store;
  const { currentCgpa, earnedCredits, targetCgpa } = academic;

  // Compute strategies
  const strategies = useMemo(() => {
    if (courses.length === 0) return null;
    
    const engineInput = {
      currentCgpa,
      earnedCredits,
      targetCgpa,
      presetId,
      courses: courses.map(c => ({
        id: c.id,
        code: c.code,
        name: c.name,
        credits: c.credits,
        grade: c.grade,
        cieMarks: c.cieMarks || 0,
        attendanceTotal: c.attendanceTotal || 0,
        attendanceBunked: c.attendanceBunked || 0,
      }))
    };
    
    try {
      const safe = strategyAllocator.generate(engineInput, 'SAFE');
      const balanced = strategyAllocator.generate(engineInput, 'BALANCED');
      const aggressive = strategyAllocator.generate(engineInput, 'AGGRESSIVE');
      return { safe, balanced, aggressive };
    } catch (err) {
      console.error("Failed to generate strategies:", err);
      return null;
    }
  }, [presetId, currentCgpa, earnedCredits, targetCgpa, courses]);

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-white/50">
        <AlertCircle className="w-10 h-10 opacity-20 text-amber-500" />
        <p className="text-sm">No active courses available.<br/>Sync your data to generate strategies.</p>
      </div>
    );
  }

  if (!strategies) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-white/50">
        <Activity className="w-8 h-8 opacity-20 animate-pulse" />
        <p className="text-sm">Computing strategy topology...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6 pb-6">
      
      <div className="flex flex-col space-y-2">
        <h3 className="font-bold text-lg text-white flex items-center gap-2">
          <Compass className="text-[#4F8EF7] w-5 h-5" />
          Action Strategies
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          Paths optimized to hit your target <span className="text-[#4F8EF7] font-bold">{targetCgpa.toFixed(2)} CGPA</span> based on your current standing of <span className="text-white font-semibold">{currentCgpa.toFixed(2)}</span>.
        </p>
      </div>

      <div className="space-y-4 flex-1">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StrategyCard strategy={strategies.safe} />
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <StrategyCard strategy={strategies.balanced} isRecommended={true} />
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <StrategyCard strategy={strategies.aggressive} />
        </motion.div>
      </div>

    </div>
  );
}
