"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, Calculator, BrainCircuit,
  AlertTriangle, CheckCircle2, ChevronDown, Activity, FileSpreadsheet
} from 'lucide-react';
import clsx from 'clsx';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { useUSMStore } from '@/stores/usmStore';
import { resolveActiveAcademicContext } from '@/stores/selectors/academic';
import { getPresetById } from '@/lib/presets/presetRegistry';
import PageContainer from '@/components/layout/PageContainer';
import GlassCard from '@/components/GlassCard';

function getGradeColorClass(points: number, isPass: boolean = true) {
  if (!isPass || points === 0) return "text-rose-500";
  if (points >= 9) return "text-emerald-400";
  if (points >= 8) return "text-green-400";
  if (points >= 7) return "text-yellow-300";
  if (points >= 6) return "text-amber-400";
  if (points >= 5) return "text-orange-400";
  return "text-rose-400";
}

export default function PredictorPage() {
  const store = useUSMStore();
  const context = resolveActiveAcademicContext(store);
  const activePreset = getPresetById(context.presetId);
  const courses = context.activeCourses;
  
  const [mounted, setMounted] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [targetGrade, setTargetGrade] = useState<string>('O');

  // Input states for internal marks
  const [cieMarks, setCieMarks] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
      setCieMarks(courses[0].cieMarks?.toString() || "0");
    }
  }, [courses, selectedCourseId]);

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  useEffect(() => {
    if (activePreset?.gradeScale) {
      const validGrades = activePreset.gradeScale.filter(g => g.points > 0 && g.isPass !== false);
      const isValid = validGrades.some(g => g.grade === targetGrade);
      if (!isValid && validGrades.length > 0) {
        const sorted = [...validGrades].sort((a, b) => b.points - a.points);
        setTargetGrade(sorted[0].grade);
      }
    }
  }, [activePreset, targetGrade]);

  const stats = useMemo(() => {
    if (!selectedCourse || !activePreset) return null;

    const nCie = parseFloat(cieMarks) || 0;
    
    // In a real generic system, max bounds would be regulation specific.
    // For now we assume standard 100 mark split based on preset defaults or common norms
    const isLab = selectedCourse.credits <= 2; 
    const maxCie = isLab ? 50 : 30; // Approximation based on common university norms
    const maxSee = isLab ? 50 : 70;
    const totalMax = maxCie + maxSee;

    const scoredBase = Math.min(nCie, maxCie);

    // Get target minimum marks from the preset grade scale
    const target = activePreset.gradeScale.find(g => g.grade === targetGrade) || activePreset.gradeScale[0];
    const targetMinMarks = target.minMarks ?? 0;
    const requiredTotalMarks = (targetMinMarks / 100) * totalMax;
    const neededInEndSem = requiredTotalMarks - scoredBase;

    const achievable = neededInEndSem <= maxSee;
    const alreadyThere = scoredBase >= requiredTotalMarks;

    return {
      maxBase: maxCie,
      scoredBase,
      totalMax,
      neededInEndSem: Math.max(0, Math.ceil(neededInEndSem)),
      achievable,
      alreadyThere,
      maxExamMarks: maxSee,
      isLab,
      nCie
    };
  }, [cieMarks, targetGrade, activePreset, selectedCourse]);

  if (!mounted) return null;

  if (courses.length === 0) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <Activity className="w-16 h-16 text-indigo-400 opacity-50" />
          <h1 className="text-3xl font-bold text-white">Subject Intelligence</h1>
          <p className="text-slate-400 max-w-md">You need active registered courses to predict outcomes. Please sync your academic data.</p>
          <a href="/sync" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-full font-bold text-white transition-colors">
            Go to Data Hub
          </a>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="overflow-hidden">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-bold tracking-widest uppercase mb-2">
            <Target className="w-4 h-4" />
            Subject Intelligence
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Marks Predictor
          </h1>
          <p className="text-slate-400 font-medium text-lg max-w-xl leading-relaxed">
            Contextual grade boundary analysis for your active registered courses.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Course Selection & Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <GlassCard className="border border-white/5 p-6 relative overflow-visible z-20">
            <h3 className="text-xl font-bold flex items-center gap-2 text-white mb-6">
              <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
              Active Course Context
            </h3>
            
            <div className="space-y-4">
              <div className="relative">
                <select
                  value={selectedCourseId}
                  onChange={(e) => {
                    setSelectedCourseId(e.target.value);
                    const c = courses.find(x => x.id === e.target.value);
                    setCieMarks(c?.cieMarks?.toString() || "0");
                  }}
                  className="w-full bg-black/40 border border-white/10 text-white font-bold px-4 py-4 rounded-xl appearance-none outline-none focus:border-indigo-500/50 transition-all shadow-inner relative z-10"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.credits} Cr)</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-20" size={18} />
              </div>

              {stats && (
                <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                  <div className="flex justify-between items-center mb-2 px-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Internal Marks Achieved
                    </label>
                    <span className="text-[10px] font-mono text-slate-500">Max {stats.maxBase}</span>
                  </div>
                  <div className="relative flex items-center bg-black/40 border border-white/10 px-4 py-3 rounded-xl focus-within:border-indigo-500/50 transition-colors">
                    <span className="font-black text-slate-600 mr-2">CIE</span>
                    <input
                      type="number"
                      step="0.5"
                      value={cieMarks}
                      onChange={(e) => setCieMarks(e.target.value)}
                      className="bg-transparent border-none outline-none w-full text-xl font-bold text-white font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          {stats && (
            <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
              <div className="flex items-start gap-4">
                <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400 shrink-0">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Leverage Insight</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {stats.scoredBase < (stats.maxBase * 0.4)
                      ? `Your internal base is weak. Earning a ${targetGrade} grade will require a disproportionate push in the End Semester exam.`
                      : `You have secured a strong foundation. Achieving ${targetGrade} requires only ${Math.ceil((stats.neededInEndSem / stats.maxExamMarks) * 100)}% of the final paper.`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Prediction Logic */}
        <div className="lg:col-span-7 space-y-6">
          {stats && (
            <GlassCard className="border border-white/5 p-8 relative overflow-hidden h-full flex flex-col justify-center">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
                <div>
                  <h2 className="text-2xl font-black tracking-tight mb-1 flex items-center gap-2 text-white">
                    <Calculator className="w-6 h-6 text-indigo-400" />
                    Target Grade Analysis
                  </h2>
                </div>
                <div className="flex items-center gap-3 bg-black/40 p-2 rounded-2xl border border-white/5 backdrop-blur-md">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 px-2">Target Grade</span>
                  <select
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(e.target.value)}
                    className="bg-indigo-500/20 text-indigo-400 font-black text-xl w-16 text-center py-1 rounded-xl appearance-none outline-none border border-indigo-500/30 cursor-pointer"
                  >
                    {activePreset?.gradeScale
                      .filter(g => g.points > 0 && g.isPass !== false)
                      .map(g => (
                        <option key={g.grade} value={g.grade}>{g.grade}</option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="relative z-10 bg-black/20 rounded-3xl p-8 border border-white/5 text-center flex flex-col items-center justify-center min-h-[200px]">
                {stats.alreadyThere ? (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center text-emerald-400">
                    <CheckCircle2 className="w-16 h-16 mb-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                    <span className="font-extrabold tracking-tight text-2xl">Target Already Secured!</span>
                    <span className="text-emerald-500/70 text-sm mt-2 font-medium">Internal marks alone exceed the boundary.</span>
                  </motion.div>
                ) : stats.achievable ? (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 block">End Semester Requirement</span>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-7xl md:text-8xl font-black text-white tracking-tighter tabular-nums drop-shadow-2xl">
                        {stats.neededInEndSem}
                      </span>
                      <span className="text-2xl font-bold text-slate-600">/ {stats.maxExamMarks}</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center text-rose-400">
                    <AlertTriangle className="w-16 h-16 mb-4 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]" />
                    <span className="font-extrabold tracking-tight text-2xl">Mathematically Unachievable</span>
                    <span className="text-rose-400/70 text-sm mt-2 font-medium">Insufficient internal buffer to reach {targetGrade}.</span>
                  </motion.div>
                )}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
