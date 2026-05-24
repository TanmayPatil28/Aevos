"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Target, Calculator, AlertTriangle, CheckCircle2, ChevronDown, Activity, ShieldAlert, Zap } from 'lucide-react';
import { useUSMStore } from '@/stores/usmStore';
import { resolveActiveAcademicContext } from '@/stores/selectors/academic';
import { getPresetById, convertLetterGradeToGradePoint, calculateSGPA } from '@/lib/presets';
import clsx from 'clsx';

type SubjectType = 'theory100' | 'theory50' | 'lab';

interface SubjectMemory {
  type: SubjectType;
  scores: Record<string, string>;
  useBestOf: boolean;
}

export default function PredictorPanel() {
  const store = useUSMStore();
  const context = resolveActiveAcademicContext(store);
  const activePreset = getPresetById(context.presetId);
  const courses = context.activeCourses;
  
  const selectedCourseId = store.workspaceUi.selectedSubjectId;
  const setSelectedCourseId = (id: string) => store.setWorkspaceUi({ selectedSubjectId: id });

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  // --- Subject Memory Engine ---
  const memoryRef = useRef<Record<string, SubjectMemory>>({});
  
  const [type, setType] = useState<SubjectType>('theory100');
  const [scores, setScores] = useState<Record<string, string>>({});
  const [useBestOf, setUseBestOf] = useState(false);

  // --- Dynamic Assessment Scheme based on University Selection ---
  const scheme = useMemo(() => {
    const uni = activePreset?.canonicalInstitutionId || 'sppu';
    const isLab = type === 'lab';

    if (uni.includes('jspm')) {
      return {
        uniName: "JSPM",
        hasBestOf: true,
        fields: isLab 
          ? [{ id: 'assig', label: 'Journal / Assig', max: 40 }]
          : [
              { id: 't1', label: 'Test 1', max: 30 },
              { id: 't2', label: 'Test 2', max: 30 },
              { id: 'assig', label: 'Assignment', max: 40 }
            ],
        calcScored: (scores: Record<string, string>, bestOf: boolean) => {
          const t1 = parseFloat(scores.t1) || 0;
          const t2 = parseFloat(scores.t2) || 0;
          const assig = parseFloat(scores.assig) || 0;
          if (isLab) return Math.min(assig, 40);
          return bestOf 
            ? Math.max(t1, t2) + Math.min(assig, 40)
            : Math.min(t1, 30) + Math.min(t2, 30) + Math.min(assig, 40);
        },
        maxBase: isLab ? 40 : 100,
        examMax: isLab ? 50 : 100 // Dynamic later based on type
      };
    } else if (uni === 'sppu') {
      const is2024 = activePreset?.regulationYear === 2024;
      const maxInsem = is2024 ? 40 : 30;
      return {
        uniName: "SPPU",
        hasBestOf: false,
        fields: [{ id: 'insem', label: is2024 ? 'CIE' : 'In-Sem', max: maxInsem }],
        calcScored: (scores: Record<string, string>) => Math.min(parseFloat(scores.insem) || 0, maxInsem),
        maxBase: maxInsem,
        examMax: is2024 ? 60 : 70
      };
    } else if (uni === 'mu') {
      return {
        uniName: "Mumbai Uni",
        hasBestOf: false,
        fields: [{ id: 'ia', label: 'Internal Assessment', max: 20 }],
        calcScored: (scores: Record<string, string>) => Math.min(parseFloat(scores.ia) || 0, 20),
        maxBase: 20,
        examMax: 80
      };
    }
    
    // Default fallback
    return {
      uniName: "Generic",
      hasBestOf: false,
      fields: [{ id: 'cie', label: 'Internal Marks', max: 50 }],
      calcScored: (scores: Record<string, string>) => Math.min(parseFloat(scores.cie) || 0, 50),
      maxBase: 50,
      examMax: 50
    };
  }, [activePreset, type]);

  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId, setSelectedCourseId]);

  // Load state from memory when course changes
  useEffect(() => {
    if (!selectedCourse) return;
    
    const mem = memoryRef.current[selectedCourse.id];
    if (mem) {
      setType(mem.type);
      setScores(mem.scores);
      setUseBestOf(mem.useBestOf);
    } else {
      const defaultType = selectedCourse.credits <= 2 ? 'lab' : (selectedCourse.credits === 3 ? 'theory50' : 'theory100');
      setType(defaultType);
      
      const defaultScores: Record<string, string> = {};
      let remainingMarks = selectedCourse.cieMarks || 0;
      
      for (const field of scheme.fields) {
        if (remainingMarks <= 0) break;
        const toAssign = Math.min(remainingMarks, field.max);
        defaultScores[field.id] = toAssign.toString();
        remainingMarks -= toAssign;
      }
      
      setScores(defaultScores);
      setUseBestOf(false);
    }
  }, [selectedCourse?.id, scheme.fields.length]);

  // Save to memory on any change
  useEffect(() => {
    if (selectedCourse) {
      memoryRef.current[selectedCourse.id] = { type, scores, useBestOf };
    }
  }, [type, scores, useBestOf, selectedCourse?.id]);

  const internals = useMemo(() => {
    const scoredBase = scheme.calcScored(scores, useBestOf);
    let maxBase = scheme.maxBase;
    if (scheme.uniName === 'JSPM' && type !== 'lab' && useBestOf) {
       maxBase = 70; // 30 (Best of T1/T2) + 40 Assig = 70
    }
    return { maxBase, scoredBase };
  }, [scores, scheme, useBestOf, type]);

  // Sync calculated CIE back to course state automatically
  useEffect(() => {
    if (selectedCourse && selectedCourse.cieMarks !== internals.scoredBase) {
      store.updateCourse(selectedCourse.id, { cieMarks: internals.scoredBase });
    }
  }, [internals.scoredBase, selectedCourse?.id]);

  // THE POSSIBILITY MATRIX
  const matrix = useMemo(() => {
    if (!selectedCourse || !activePreset) return [];

    const isLab = type === 'lab';
    let maxExamMarks = scheme.examMax;
    if (scheme.uniName === 'JSPM' && !isLab) {
      maxExamMarks = type === 'theory100' ? 100 : 50;
    }

    const totalMax = internals.maxBase + maxExamMarks;

    const baseSubjects = courses.map(c => ({
      name: c.name,
      credits: c.credits,
      grade: c.grade || "F",
      gradePoint: convertLetterGradeToGradePoint(c.grade || "F", activePreset)
    }));
    const currentSGPA = calculateSGPA(baseSubjects);

    const validGrades = [...activePreset.gradeScale]
      .filter(g => g.points > 0 && g.isPass !== false)
      .sort((a, b) => b.points - a.points); // Highest to lowest

    return validGrades.map(g => {
      // Handle Relative grading edge case (we use absolute boundaries as fallback for simulation)
      const minPercentage = g.minMarks !== undefined ? g.minMarks : (g.points * 10 - 5); 
      const requiredTotalMarks = (minPercentage / 100) * totalMax;
      const neededInEndSem = Math.ceil(requiredTotalMarks - internals.scoredBase);
      
      // Calculate SGPA Impact
      const projectedSubjects = courses.map(c => {
        if (c.id === selectedCourse.id) {
          return { ...c, grade: g.grade, gradePoint: convertLetterGradeToGradePoint(g.grade, activePreset) };
        }
        return { ...c, grade: c.grade || "F", gradePoint: convertLetterGradeToGradePoint(c.grade || "F", activePreset) };
      });
      const projectedSgpa = calculateSGPA(projectedSubjects);
      const delta = projectedSgpa - currentSGPA;

      let status: 'secured' | 'easy' | 'moderate' | 'hard' | 'critical' | 'impossible';
      if (neededInEndSem <= 0) status = 'secured';
      else if (neededInEndSem > maxExamMarks) status = 'impossible';
      else {
        const ratio = neededInEndSem / maxExamMarks;
        if (ratio <= 0.4) status = 'easy';
        else if (ratio <= 0.7) status = 'moderate';
        else if (ratio <= 0.9) status = 'hard';
        else status = 'critical';
      }

      return {
        grade: g.grade,
        points: g.points,
        needed: Math.max(0, neededInEndSem),
        maxExamMarks,
        projectedSgpa,
        delta,
        status
      };
    });
  }, [internals, selectedCourse, activePreset, courses, type, scheme]);

  const currentCgpa = context.academic.currentCgpa || 0;
  const earnedCredits = context.academic.earnedCredits || 0;
  const simulatedCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const targetCgpa = context.academic.targetCgpa || currentCgpa;

  // Find the safest realistic path
  const safestPath = useMemo(() => {
    if (matrix.length === 0) return null;
    
    // Sort from easiest (lowest points/needed) to hardest
    const possiblePaths = matrix.filter(r => r.status !== 'impossible').sort((a, b) => a.needed - b.needed);
    
    if (possiblePaths.length === 0) return null; // All impossible

    // Find the easiest path that maintains target CGPA
    for (const path of possiblePaths) {
      const projectedCgpa = (currentCgpa * earnedCredits + path.projectedSgpa * simulatedCredits) / (earnedCredits + simulatedCredits);
      if (projectedCgpa >= targetCgpa) {
        return path;
      }
    }

    // If none reach targetCgpa, return the highest possible path (hardest effort)
    return possiblePaths[possiblePaths.length - 1];
  }, [matrix, currentCgpa, earnedCredits, simulatedCredits, targetCgpa]);

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-white/50">
        <Target className="w-10 h-10 opacity-20" />
        <p className="text-sm">No active courses available.<br/>Sync your data to use the Predictor.</p>
      </div>
    );
  }

  const handleScoreChange = (id: string, val: string) => {
    setScores(prev => ({ ...prev, [id]: val }));
  };

  return (
    <div className="flex flex-col h-full space-y-5 pb-6">
      
      {/* Target Subject Selector */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Intelligence Target
          </label>
          <span className="text-[9px] font-bold uppercase text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
            {scheme.uniName} Mode
          </span>
        </div>
        <div className="relative">
          <select
            value={selectedCourseId || ""}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full bg-[#1A2235] border border-white/5 hover:border-white/10 text-white text-sm font-semibold px-4 py-3 rounded-xl appearance-none outline-none transition-all cursor-pointer shadow-sm"
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.credits}Cr)</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Internal Assessment Configuration */}
      <div className="bg-[#1A2235] border border-white/5 rounded-2xl p-4 shadow-sm space-y-4">
        
        <div className="flex items-center justify-between">
          <div className="flex bg-[#0F172A] border border-white/5 p-1 rounded-lg">
            {scheme.uniName === 'JSPM' ? (['theory100', 'theory50', 'lab'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={clsx(
                  "px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded-md transition-all",
                  type === t ? "text-indigo-300 bg-[#25304B] shadow-sm" : "text-slate-500 hover:text-slate-300"
                )}
              >
                {t === 'theory100' ? 'Th 100' : t === 'theory50' ? 'Th 50' : 'Lab'}
              </button>
            )) : (
              <span className="px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Standard Assessment
              </span>
            )}
          </div>

          {scheme.hasBestOf && (
            <label className="flex items-center gap-1.5 cursor-pointer">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                Best T1/T2
              </span>
              <div className={clsx(
                "w-7 h-4 rounded-full p-0.5 transition-colors duration-300 relative",
                useBestOf ? "bg-indigo-500" : "bg-white/10"
              )}>
                <motion.div
                  className="w-3 h-3 bg-white rounded-full shadow-sm"
                  animate={{ x: useBestOf ? 12 : 0 }}
                />
              </div>
              <input type="checkbox" className="hidden" checked={useBestOf} onChange={() => setUseBestOf(!useBestOf)} />
            </label>
          )}
        </div>

        {/* Dynamic Inputs Based on University Preset */}
        <div className="grid grid-cols-2 gap-2">
          {scheme.fields.map(field => (
             <div key={field.id} className={clsx("transition-all", scheme.fields.length === 1 ? "col-span-2" : (field.id === 'assig' ? "col-span-2" : "col-span-1"))}>
               <InputField 
                 label={field.label} 
                 value={scores[field.id] || ''} 
                 setValue={(v) => handleScoreChange(field.id, v)} 
                 max={field.max} 
               />
             </div>
          ))}
        </div>

        {/* Current Internal Base */}
        <div className="pt-1 flex items-center justify-between border-t border-white/5 mt-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
            <Calculator className="w-3 h-3" /> Base Score
          </span>
          <div className="text-right">
            <span className="text-sm font-black text-white font-mono">{internals.scoredBase.toFixed(1)}</span>
            <span className="text-[10px] font-bold text-slate-500 font-mono"> / {internals.maxBase}</span>
          </div>
        </div>
      </div>

      {/* DECISION SUPPORT COPILOT */}
      {safestPath && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#4F8EF7]/10 to-indigo-500/5 border border-[#4F8EF7]/20 rounded-2xl p-4 flex gap-3 items-start shadow-[0_0_30px_rgba(79,142,247,0.08)] shrink-0"
        >
          <div className="w-8 h-8 rounded-full bg-[#4F8EF7]/20 flex items-center justify-center shrink-0 shadow-inner">
            <Zap className="w-4 h-4 text-[#4F8EF7]" fill="currentColor" />
          </div>
          <div className="flex-1 flex flex-col pt-0.5">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#4F8EF7] mb-1">Copilot Recommendation</h4>
            <p className="text-xs font-medium text-slate-300 leading-relaxed">
              Targeting an <strong className="text-white text-[13px]">'{safestPath.grade}'</strong> ({safestPath.needed}/{safestPath.maxExamMarks}) is your safest realistic path to maintain your <strong className="text-white">{(targetCgpa > 0 ? targetCgpa : currentCgpa).toFixed(2)} CGPA</strong> trajectory.
            </p>
          </div>
        </motion.div>
      )}

      {/* THE POSSIBILITY MATRIX */}
      <div className="flex-1 min-h-0 flex flex-col space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" /> The Possibility Matrix
          </h3>
          <span className="text-[9px] font-medium text-slate-500">Live Final Exam Targets</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {matrix.map((row) => (
            <div 
              key={row.grade}
              onClick={() => {
                if (row.status !== 'impossible' && selectedCourse) {
                  store.updateCourse(selectedCourse.id, { grade: row.grade });
                }
              }}
              className={clsx(
                "p-3 rounded-xl border flex items-center justify-between transition-all relative overflow-hidden",
                row.status === 'impossible' ? "bg-[#0F172A]/50 border-white/[0.02] opacity-50 grayscale cursor-not-allowed" :
                selectedCourse?.grade === row.grade ? "bg-[#4F8EF7]/10 border-[#4F8EF7]/40 shadow-[0_0_20px_rgba(79,142,247,0.15)] ring-1 ring-[#4F8EF7]/50" :
                row.status === 'secured' ? "bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)] cursor-pointer hover:bg-emerald-500/20" :
                "bg-[#1A2235] border-white/5 hover:border-white/20 cursor-pointer hover:bg-[#25304B]"
              )}
            >
              {selectedCourse?.grade === row.grade && (
                <motion.div layoutId="active-target-glow" className="absolute inset-0 bg-gradient-to-r from-[#4F8EF7]/0 via-[#4F8EF7]/10 to-[#4F8EF7]/0 pointer-events-none" />
              )}
              {/* Left Side: Grade & Impact */}
              <div className="flex items-center gap-3">
                <div className={clsx(
                  "w-10 h-10 rounded-lg flex items-center justify-center text-lg font-black",
                  row.status === 'secured' ? "bg-emerald-500/20 text-emerald-400" :
                  row.status === 'impossible' ? "bg-white/5 text-slate-500" :
                  "bg-[#25304B] text-white"
                )}>
                  {row.grade}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">SGPA</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className={clsx("text-sm font-bold", row.status === 'impossible' ? "text-slate-500" : "text-white")}>
                      {row.projectedSgpa.toFixed(2)}
                    </span>
                    {row.delta !== 0 && row.status !== 'impossible' && (
                      <span className={clsx("text-[9px] font-black", row.delta > 0 ? "text-emerald-400" : "text-rose-400")}>
                        {row.delta > 0 ? "+" : ""}{row.delta.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: Requirement & Status */}
              <div className="flex flex-col items-end gap-1">
                {row.status === 'secured' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/70">Guaranteed</span>
                  </>
                ) : row.status === 'impossible' ? (
                  <>
                    <ShieldAlert className="w-4 h-4 text-slate-600 mb-1" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Out of Reach</span>
                  </>
                ) : (
                  <>
                    <div className="flex items-baseline gap-1">
                      <span className={clsx(
                        "text-lg font-black tabular-nums font-mono",
                        row.status === 'critical' ? "text-rose-400" :
                        row.status === 'hard' ? "text-orange-400" :
                        "text-white"
                      )}>
                        {row.needed}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 font-mono">/{row.maxExamMarks}</span>
                    </div>
                    <span className={clsx(
                      "text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm",
                      row.status === 'critical' ? "bg-rose-500/10 text-rose-400" :
                      row.status === 'hard' ? "bg-orange-500/10 text-orange-400" :
                      row.status === 'moderate' ? "bg-indigo-500/10 text-indigo-400" :
                      "bg-emerald-500/10 text-emerald-400"
                    )}>
                      {row.status}
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

function InputField({ label, value, setValue, max }: { label: string, value: string, setValue: (v: string) => void, max: number }) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || val === '.') return setValue(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      if (num > max) setValue(max.toString());
      else setValue(val);
    }
  };
  return (
    <div className="flex items-center bg-[#0F172A] border border-white/5 focus-within:border-white/20 px-3 py-2 rounded-xl transition-colors">
      <span className="text-[9px] font-bold text-slate-500 w-12">{label}</span>
      <input
        type="number" inputMode="decimal" step="0.5"
        value={value} onChange={handleChange} placeholder="-"
        className="bg-transparent border-none outline-none w-full text-right text-sm font-semibold text-white font-mono placeholder:text-slate-700"
      />
    </div>
  );
}
