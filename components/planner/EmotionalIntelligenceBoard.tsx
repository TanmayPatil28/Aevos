"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Target, Zap, ShieldAlert } from "lucide-react";
import Card from "@/components/ui/Card";

interface EmotionalIntelligenceBoardProps {
  currentCgpa: number;
  targetCgpa: number;
  remainingSemesters: number;
  isSimulating?: boolean;
  completedSemesters?: number;
  result?: any;
  preset?: any;
}

export default function EmotionalIntelligenceBoard({ currentCgpa, targetCgpa, remainingSemesters, isSimulating }: EmotionalIntelligenceBoardProps) {
  const [metrics, setMetrics] = useState({
    confidence: 0,
    stress: 0,
    momentum: 0,
    hope: 0
  });

  useEffect(() => {
    // Basic heuristics for emotional metrics
    const gap = targetCgpa - currentCgpa;
    const requiredGainPerSem = gap > 0 && remainingSemesters > 0 ? gap / remainingSemesters : 0;
    
    let confidenceVal = 95;
    let stressVal = 10;
    let momentumVal = 80;
    let hopeVal = 90;

    if (gap > 1.5) {
      confidenceVal = 30;
      stressVal = 85;
      momentumVal = 40;
    } else if (gap > 0.8) {
      confidenceVal = 60;
      stressVal = 65;
      momentumVal = 60;
    } else if (gap > 0) {
      confidenceVal = 85;
      stressVal = 30;
      momentumVal = 75;
    } else {
      confidenceVal = 99;
      stressVal = 5;
      momentumVal = 95;
    }

    if (remainingSemesters < 3 && gap > 1.0) {
      hopeVal = 40;
    } else if (remainingSemesters >= 4) {
      hopeVal = 95;
    }

    if (isSimulating) {
      // add some jitter during simulation
      confidenceVal += (Math.random() * 10 - 5);
      stressVal += (Math.random() * 10 - 5);
    }

    setMetrics({
      confidence: Math.max(0, Math.min(100, confidenceVal)),
      stress: Math.max(0, Math.min(100, stressVal)),
      momentum: Math.max(0, Math.min(100, momentumVal)),
      hope: Math.max(0, Math.min(100, hopeVal))
    });
  }, [currentCgpa, targetCgpa, remainingSemesters, isSimulating]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-12">
      {/* Confidence Meter */}
      <Card className="flex flex-col p-5 bg-[#1D1D1F] border border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-50" />
        <div className="flex items-center gap-2 mb-2">
          <Target size={16} className="text-emerald-400" />
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Confidence</span>
        </div>
        <div className="flex items-end gap-2 mt-auto">
          <span className="text-3xl font-black text-white">{metrics.confidence.toFixed(0)}</span>
          <span className="text-sm font-bold text-white/40 mb-1">%</span>
        </div>
        <div className="w-full bg-white/10 h-1.5 mt-3 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${metrics.confidence}%` }} 
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-emerald-500 rounded-full" 
          />
        </div>
      </Card>

      {/* Stress Indicator */}
      <Card className="flex flex-col p-5 bg-[#1D1D1F] border border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-rose-600 opacity-50" />
        <div className="flex items-center gap-2 mb-2">
          <Activity size={16} className="text-rose-400" />
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Academic Stress</span>
        </div>
        <div className="flex items-end gap-2 mt-auto">
          <span className="text-3xl font-black text-white">{metrics.stress.toFixed(0)}</span>
          <span className="text-sm font-bold text-white/40 mb-1">%</span>
        </div>
        <div className="w-full bg-white/10 h-1.5 mt-3 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${metrics.stress}%` }} 
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-rose-500 rounded-full" 
          />
        </div>
      </Card>

      {/* Momentum Score */}
      <Card className="flex flex-col p-5 bg-[#1D1D1F] border border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-cyan-600 opacity-50" />
        <div className="flex items-center gap-2 mb-2">
          <Zap size={16} className="text-cyan-400" />
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Momentum</span>
        </div>
        <div className="flex items-end gap-2 mt-auto">
          <span className="text-3xl font-black text-white">{metrics.momentum.toFixed(0)}</span>
          <span className="text-sm font-bold text-white/40 mb-1">/100</span>
        </div>
        <div className="w-full bg-white/10 h-1.5 mt-3 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${metrics.momentum}%` }} 
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-cyan-500 rounded-full" 
          />
        </div>
      </Card>

      {/* Recovery Hope Indicator */}
      <Card className="flex flex-col p-5 bg-[#1D1D1F] border border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-purple-600 opacity-50" />
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert size={16} className="text-purple-400" />
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Recovery Hope</span>
        </div>
        <div className="flex items-end gap-2 mt-auto">
          <span className="text-3xl font-black text-white">{metrics.hope.toFixed(0)}</span>
          <span className="text-sm font-bold text-white/40 mb-1">%</span>
        </div>
        <div className="w-full bg-white/10 h-1.5 mt-3 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${metrics.hope}%` }} 
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-purple-500 rounded-full" 
          />
        </div>
        {metrics.hope > 70 && targetCgpa > currentCgpa && (
           <p className="text-[9px] text-purple-300 mt-2 font-medium">Still mathematically recoverable.</p>
        )}
      </Card>
    </div>
  );
}
