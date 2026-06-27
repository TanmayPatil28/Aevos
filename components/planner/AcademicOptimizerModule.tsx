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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full h-fit">
      
      {/* Controls & Overview (Left Column) */}
      <div className="col-span-1 lg:col-span-4 flex flex-col h-fit gap-6">
        <div className="relative z-10 flex flex-col gap-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/50">Predictive Generation</h3>

          <div className={`px-4 py-3 rounded-card-large border flex flex-col items-start ${risk.color} bg-white/5`}>
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-70">Risk Prediction</span>
              <span className="font-black text-xl">{risk.level}</span>
            </div>
          {/* Constraint Engine */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings2 size={16} className="text-white/50" />
              <span className="text-[12px] leading-[16px] font-bold uppercase tracking-[0.12em] text-foreground-muted">Strategic Constraints</span>
            </div>
            <div className="flex flex-col gap-2">
              {[
                { id: "none", label: "No Constraints" },
                { id: "focus_placements", label: "Focus on Placements (Less Time)" },
                { id: "low_stress", label: "Low Stress Priority" },
                { id: "max_attendance_buffer", label: "Maximize Attendance Buffer" }
              ].map(constraint => (
                <button
                  key={constraint.id}
                  onClick={() => setActiveConstraint(constraint.id)}
                  className={`px-4 py-3 text-left rounded-full text-sm font-bold transition-all ${
                    activeConstraint === constraint.id 
                    ? "bg-white/10 text-white" 
                    : "bg-transparent text-white/50 hover:bg-white/5"
                  }`}
                >
                  {constraint.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Generated Strategic Paths (Right Column) */}
      <div className="col-span-1 lg:col-span-8 flex flex-col h-fit gap-6">
        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/50">Generated Strategic Paths</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paths.map(path => (
              <div 
                key={path.id}
                onClick={() => setExpandedPath(expandedPath === path.id ? null : path.id)}
                className={`p-6 rounded-card-large transition-all cursor-pointer flex flex-col h-full ${
                  expandedPath === path.id ? "bg-white/10" : "bg-white/5 hover:bg-white/10"
                } ${path.isRecommended ? "ring-1 ring-white/20" : ""}`}
              >
                <div className={`w-10 h-10 rounded-full mb-4 flex items-center justify-center border ${path.color}`}>
                  {path.icon}
                </div>
                <div className="mt-auto">
                  <h4 className="font-bold text-white text-base mb-1 leading-tight">{path.name}</h4>
                  <div className="text-3xl font-black mb-1 font-mono">{path.targetGpa.toFixed(2)}</div>
                  <div className="text-[10px] text-white/50 font-bold uppercase tracking-[0.12em]">{path.effortLevel} Effort</div>
                </div>
                
                {path.isRecommended && (
                  <div className="absolute top-0 right-0 -mt-2 -mr-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-surface-raised z-10">
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
                <div className="p-6 mt-2 rounded-2xl bg-[#1D1D1F] border border-white/5">
                  <h4 className="text-lg font-bold text-white mb-2">{paths.find(p => p.id === expandedPath)?.name} Breakdown</h4>
                  <p className="text-sm text-white/70 mb-6">{paths.find(p => p.id === expandedPath)?.description}</p>
                  
                  {/* Tradeoff Visualization Map */}
                  <div className="mt-6 border-t border-white/10 pt-6">
                    <h5 className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-4">Tradeoff Analysis</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                        <div className="text-[10px] text-white/40 uppercase font-bold mb-2 tracking-wider flex items-center gap-1">
                          <Target size={12} /> The Choice
                        </div>
                        <div className="text-sm font-bold text-white">{paths.find(p => p.id === expandedPath)?.name}</div>
                        <div className="text-xs text-white/60 mt-1">Target: {paths.find(p => p.id === expandedPath)?.targetGpa.toFixed(2)}</div>
                      </div>
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/10">
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
                      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/10">
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
      </div>

      {/* Statutory Matrix Component (Full Width Bottom) */}
      <div className="col-span-1 lg:col-span-12 relative overflow-hidden h-fit">
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
  );
}
