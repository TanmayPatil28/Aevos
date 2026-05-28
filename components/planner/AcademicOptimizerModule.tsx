"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, ShieldAlert, Zap, Target, Activity, CheckCircle, BrainCircuit, Settings2 } from "lucide-react";
import Card from "@/components/ui/Card";
import CalculationBreakdown from "@/components/CalculationBreakdown";

interface PathResult {
  id: string;
  name: string;
  description: string;
  targetGpa: number;
  effortLevel: string;
  icon: React.ReactNode;
  color: string;
  isRecommended: boolean;
}

import { UniversityPreset } from "@/lib/presets";

interface AcademicOptimizerProps {
  preset?: any;
  currentCgpa?: number;
  targetCgpa?: number;
  remainingSemesters?: number;
  completedSemesters?: number;
  result?: any;
}

export default function AcademicOptimizerModule({ preset, currentCgpa = 7.0, targetCgpa = 8.5, remainingSemesters = 5, completedSemesters = 3, result }: AcademicOptimizerProps) {
  const [activeConstraint, setActiveConstraint] = useState<string>("none");
  const [expandedPath, setExpandedPath] = useState<string | null>(null);

  // Generate 5 dynamic paths based on the base calculation result
  const generatePaths = (): PathResult[] => {
    if (!result) return [];
    
    const required = result.requiredGPA;
    const isImpossible = result.isImpossible;
    const maxAchievable = result.maxAchievable;

    let baseRequired = required;
    if (isImpossible) baseRequired = 10.0;

    return [
      {
        id: "safe",
        name: "Safe Path",
        description: "Low risk. Focus on consistent incremental improvement.",
        targetGpa: Math.min(10, baseRequired * 0.95),
        effortLevel: "Moderate",
        icon: <ShieldAlert size={18} />,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        isRecommended: !isImpossible && baseRequired < 8.5
      },
      {
        id: "balanced",
        name: "Balanced Strategy",
        description: "Optimal mix of effort and outcome. Meets exact mathematical requirements.",
        targetGpa: Math.min(10, baseRequired),
        effortLevel: "High",
        icon: <Target size={18} />,
        color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        isRecommended: !isImpossible && baseRequired >= 8.5 && baseRequired <= 9.5
      },
      {
        id: "aggressive",
        name: "Aggressive Gain",
        description: "High intensity. Pushes past targets for buffer creation.",
        targetGpa: Math.min(10, baseRequired * 1.05),
        effortLevel: "Maximum",
        icon: <TrendingUp size={18} />,
        color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        isRecommended: false
      },
      {
        id: "recovery",
        name: "Backlog Recovery",
        description: "Focus heavily on clearing dead credits while maintaining passing grades.",
        targetGpa: Math.max(5.0, baseRequired * 0.8),
        effortLevel: "Intense (Distributed)",
        icon: <Activity size={18} />,
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        isRecommended: false
      },
      {
        id: "max",
        name: "Maximum Performance",
        description: "Push for absolute perfection. Aiming for 10.0 SGPA.",
        targetGpa: 10.0,
        effortLevel: "Extreme",
        icon: <Zap size={18} />,
        color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
        isRecommended: isImpossible
      }
    ];
  };

  const paths = generatePaths();

  // Academic Risk Calculation
  const getRiskProfile = () => {
    const gap = targetCgpa - currentCgpa;
    if (gap > 2.0) return { level: "Critical Zone", color: "text-rose-400 border-rose-500/30", text: "Target gap is massive. Volatility is very high." };
    if (gap > 1.0) return { level: "At Risk", color: "text-amber-400 border-amber-500/30", text: "Significant effort required to bridge the gap." };
    if (gap > 0) return { level: "Volatile", color: "text-blue-400 border-blue-500/30", text: "Achievable but requires consistent performance." };
    return { level: "Stable", color: "text-emerald-400 border-emerald-500/30", text: "Currently exceeding or meeting target trajectory." };
  };

  const risk = getRiskProfile();

  if (!result) return null;

  return (
    <Card className="relative overflow-hidden border border-white/10" padding="xl">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-50" />
      
      <div className="relative z-10 space-y-12">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/20">
              <BrainCircuit className="text-blue-400" size={28} />
            </div>
            <div>
              <h3 className="font-headline text-3xl font-black text-white">Academic OS Engine</h3>
              <p className="text-on-surface-variant mt-1 text-sm">Predictive path generation & risk assessment.</p>
            </div>
          </div>

          <div className={`px-4 py-2 rounded-xl border flex flex-col items-end ${risk.color} bg-black/40`}>
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-70">Risk Prediction</span>
            <span className="font-black text-lg">{risk.level}</span>
          </div>
        </div>

        {/* Constraint Engine */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Settings2 size={16} className="text-white/50" />
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Strategic Constraints</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { id: "none", label: "No Constraints" },
              { id: "focus_placements", label: "Focus on Placements (Less Time)" },
              { id: "low_stress", label: "Low Stress Priority" },
              { id: "max_attendance_buffer", label: "Maximize Attendance Buffer" }
            ].map(constraint => (
              <button
                key={constraint.id}
                onClick={() => setActiveConstraint(constraint.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeConstraint === constraint.id 
                  ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] border-transparent" 
                  : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
                }`}
              >
                {constraint.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5 Optimized Paths */}
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Generated Strategic Paths</span>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {paths.map(path => (
              <div 
                key={path.id}
                onClick={() => setExpandedPath(expandedPath === path.id ? null : path.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col h-full ${
                  expandedPath === path.id ? "bg-white/10 border-white/30" : "bg-black/40 border-white/5 hover:bg-white/5 hover:border-white/20"
                } ${path.isRecommended ? "ring-1 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]" : ""}`}
              >
                <div className={`w-8 h-8 rounded-full mb-4 flex items-center justify-center border ${path.color}`}>
                  {path.icon}
                </div>
                <div className="mt-auto">
                  <h4 className="font-bold text-white text-sm mb-1 leading-tight">{path.name}</h4>
                  <div className="text-2xl font-black mb-1 font-mono">{path.targetGpa.toFixed(2)}</div>
                  <div className="text-[10px] text-white/50 font-medium uppercase tracking-wider">{path.effortLevel} Effort</div>
                </div>
                
                {path.isRecommended && (
                  <div className="absolute top-0 right-0 -mt-2 -mr-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-black z-10">
                    <CheckCircle size={12} className="text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <AnimatePresence>
            {expandedPath && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 mt-4 rounded-2xl bg-white/5 border border-white/10">
                  <h4 className="text-lg font-bold text-white mb-2">{paths.find(p => p.id === expandedPath)?.name} Breakdown</h4>
                  <p className="text-sm text-white/70 mb-6">{paths.find(p => p.id === expandedPath)?.description}</p>
                  
                  {/* Tradeoff Visualization Map */}
                  <div className="mt-6 border-t border-white/10 pt-4">
                    <h5 className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-4">Tradeoff Analysis</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-black/30 border border-white/5">
                        <div className="text-[10px] text-white/40 uppercase font-bold mb-2 tracking-wider flex items-center gap-1">
                          <Target size={12} /> The Choice
                        </div>
                        <div className="text-sm font-bold text-white">{paths.find(p => p.id === expandedPath)?.name}</div>
                        <div className="text-xs text-white/60 mt-1">Target: {paths.find(p => p.id === expandedPath)?.targetGpa.toFixed(2)}</div>
                      </div>
                      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                        <div className="text-[10px] text-emerald-400 uppercase font-bold mb-2 tracking-wider flex items-center gap-1">
                          <TrendingUp size={12} /> Primary Benefit
                        </div>
                        <div className="text-sm font-bold text-emerald-100">
                          {expandedPath === 'safe' ? 'Lowest mental pressure and risk' : 
                           expandedPath === 'balanced' ? 'Optimal effort-to-reward ratio' :
                           expandedPath === 'aggressive' ? 'Accelerated CGPA growth' :
                           expandedPath === 'recovery' ? 'Stabilizes academic standing' :
                           'Mathematical maximum achievable'}
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                        <div className="text-[10px] text-rose-400 uppercase font-bold mb-2 tracking-wider flex items-center gap-1">
                          <Activity size={12} /> Hidden Cost
                        </div>
                        <div className="text-sm font-bold text-rose-100">
                          {expandedPath === 'safe' ? 'Limits maximum placement options' : 
                           expandedPath === 'balanced' ? 'Less time for extreme side-hustles' :
                           expandedPath === 'aggressive' ? 'High burnout risk mid-semester' :
                           expandedPath === 'recovery' ? 'Requires sacrificing free time' :
                           'Unsustainable for long periods'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Statutory Matrix Component integrated seamlessly */}
        <div className="pt-8 border-t border-white/10">
          <CalculationBreakdown 
            preset={preset}
            type="cgpa"
            semesters={[
              {
                semesterName: "Completed Semesters (Cumulative)",
                credits: result.totalCredits || 0,
                sgpa: currentCgpa || 0
              },
              ...Array.from({ length: result.remainingSems || remainingSemesters }).map((_, i) => ({
                semesterName: `Semester ${completedSemesters + i + 1} (Planned)`,
                credits: result.creditsPerSem || 20,
                sgpa: result.requiredGPA
              }))
            ]}
          />
        </div>
      </div>
    </Card>
  );
}
