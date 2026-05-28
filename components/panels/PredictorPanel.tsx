"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Calculator, CheckCircle2, ChevronDown, Activity, ShieldAlert, Zap } from 'lucide-react';
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

const fadeInUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

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
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-white/50 bg-transparent">
        <Target className="w-10 h-10 opacity-20" />
        <p className="text-sm">No active courses available.<br/>Sync your data to use the Predictor.</p>
      </div>
    );
  }

  const handleScoreChange = (id: string, val: string) => {
    setScores(prev => ({ ...prev, [id]: val }));
  };

  const courseOptions = courses.map(c => ({ value: c.id, label: `${c.name} (${c.credits}Cr)` }));

  return (
    <div className="flex flex-col h-full bg-transparent text-[#F5F5F7] font-sans tracking-tight overflow-y-auto custom-scrollbar pb-16 px-2 space-y-8">
      
      {/* Target Subject Selector */}
      <motion.div 
        variants={fadeInUp} 
        initial="hidden" 
        whileInView="visible" 
        viewport={{ once: true }}
        className="space-y-3 pt-6 relative z-[60]"
      >
        <div className="flex justify-between items-center px-1">
          <label className="text-sm font-semibold tracking-tight text-[#86868B]">
            Intelligence Target
          </label>
          <span className="text-[10px] font-bold uppercase text-[#4F8EF7] bg-[#4F8EF7]/15 px-2.5 py-1 rounded-md border border-[#4F8EF7]/30 shadow-[0_0_10px_rgba(79,142,247,0.1)]">
            {scheme.uniName} Mode
          </span>
        </div>
        
        {/* Custom Dropdown replacing native <select> */}
        <CustomDropdown 
          options={courseOptions} 
          value={selectedCourseId || ""} 
          onChange={(val) => setSelectedCourseId(val)} 
        />
      </motion.div>

      {/* Internal Assessment Configuration - Simulator Card */}
      <motion.div 
        variants={fadeInUp} 
        initial="hidden" 
        whileInView="visible" 
        viewport={{ once: true, margin: "-20px" }}
        className="relative bg-black border border-white/[0.08] rounded-[2rem] p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] space-y-6 z-50 transition-all duration-500 hover:border-[#4F8EF7]/40 hover:bg-[#050505] hover:shadow-[0_20px_40px_-15px_rgba(79,142,247,0.15)] group/card"
      >
        {/* Removed subtle background glow that was causing clipping issues */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between relative z-10 gap-4">
          <div className="flex bg-black border border-white/10 p-1 rounded-xl shadow-inner shrink-0">
            {scheme.uniName === 'JSPM' ? (['theory100', 'theory50', 'lab'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={clsx(
                  "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 relative",
                  type === t ? "text-[#4F8EF7]" : "text-[#86868B] hover:text-[#F5F5F7]"
                )}
              >
                {type === t && (
                  <motion.div layoutId="segmented-active" className="absolute inset-0 bg-[#4F8EF7]/10 rounded-lg shadow-[0_0_15px_rgba(79,142,247,0.2)] border border-[#4F8EF7]/30" />
                )}
                <span className="relative z-10">{t === 'theory100' ? 'Th 100' : t === 'theory50' ? 'Th 50' : 'Lab'}</span>
              </button>
            )) : (
              <span className="px-4 py-1.5 text-xs font-semibold tracking-tight text-[#86868B]">
                Standard Assessment
              </span>
            )}
          </div>

          {scheme.hasBestOf && (
            <label className="flex items-center gap-2 cursor-pointer group shrink-0">
              <span className="text-xs font-semibold tracking-tight text-[#86868B] group-hover:text-[#F5F5F7] transition-colors">
                Best T1/T2
              </span>
              <div className={clsx(
                "w-10 h-6 rounded-full p-1 transition-colors duration-300 relative shadow-inner",
                useBestOf ? "bg-white" : "bg-[#000000] border border-white/10"
              )}>
                <motion.div
                  className={clsx("w-4 h-4 rounded-full shadow-md", useBestOf ? "bg-black" : "bg-[#86868B]")}
                  animate={{ x: useBestOf ? 16 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </div>
              <input type="checkbox" className="hidden" checked={useBestOf} onChange={() => setUseBestOf(!useBestOf)} />
            </label>
          )}
        </div>

        {/* Dynamic Inputs with Interactive Sliders */}
        <div className="grid grid-cols-2 gap-4 relative z-10">
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
        <div className="pt-4 flex items-center justify-between border-t border-white/5 relative z-10">
          <span className="text-sm font-semibold tracking-tight text-[#86868B] flex items-center gap-2">
            <Calculator className="w-4 h-4" /> Base Score
          </span>
          <div className="text-right">
            <span className="text-2xl font-semibold text-[#F5F5F7] tracking-tighter">
              {internals.scoredBase.toFixed(1)}
            </span>
            <span className="text-sm font-medium text-[#86868B] ml-1">
              / {internals.maxBase}
            </span>
          </div>
        </div>
      </motion.div>

      {/* DECISION SUPPORT COPILOT */}
      {safestPath && (
        <motion.div 
          variants={fadeInUp} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-20px" }}
          className="relative bg-black border border-white/[0.08] rounded-[2rem] p-8 flex flex-col gap-6 items-center text-center shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] transition-all duration-500 hover:border-[#4F8EF7]/40 hover:bg-[#050505] hover:shadow-[0_20px_40px_-15px_rgba(79,142,247,0.15)] group/card"
        >
          <div className="flex flex-col items-center gap-3">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#F5F5F7] opacity-80 flex items-center justify-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[#4F8EF7]" fill="currentColor" />
              Copilot Recommendation
            </h4>
            <SafetyGauge ratio={internals.scoredBase / internals.maxBase} />
          </div>
          
          <div className="max-w-xs">
            <p className="text-base font-medium text-[#A1A1A6] leading-relaxed">
              Targeting an <strong className="text-white text-xl">'{safestPath.grade}'</strong> ({safestPath.needed}/{safestPath.maxExamMarks}) is your safest path to maintain your <strong className="text-white">{(targetCgpa > 0 ? targetCgpa : currentCgpa).toFixed(2)} CGPA</strong>.
            </p>
          </div>
        </motion.div>
      )}

      {/* THE POSSIBILITY MATRIX */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-20px" }}
        className="flex-1 flex flex-col space-y-4 pb-4"
      >
        <div className="flex items-center justify-between px-2">
          <h3 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#F5F5F7] to-[#86868B]">
            Possibility Matrix
          </h3>
          <span className="text-xs font-semibold text-[#86868B]">Live Targets</span>
        </div>

        <div className="space-y-3">
          {matrix.map((row) => (
            <motion.div 
              variants={fadeInUp}
              key={row.grade}
              onClick={() => {
                if (row.status !== 'impossible' && selectedCourse) {
                  store.updateCourse(selectedCourse.id, { grade: row.grade });
                }
              }}
              className={clsx(
                "p-5 rounded-2xl border flex items-center justify-between transition-all duration-300 relative overflow-hidden",
                row.status === 'impossible' ? "bg-[#0a0a0a] border-white/5 opacity-40 cursor-not-allowed" :
                selectedCourse?.grade === row.grade ? "bg-[#1D1D1F] border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.05)] transform scale-[1.02]" :
                row.status === 'secured' ? "bg-white/5 border-white/10 cursor-pointer hover:bg-white/10" :
                "bg-[#0a0a0a] border-white/5 hover:border-white/10 cursor-pointer hover:bg-[#111111]"
              )}
            >
              {selectedCourse?.grade === row.grade && (
                <motion.div layoutId="active-target-glow" className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 pointer-events-none" />
              )}
              {/* Left Side: Grade & Impact */}
              <div className="flex items-center gap-4 relative z-10">
                <div className={clsx(
                  "w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold",
                  row.status === 'secured' ? "bg-white/10 text-white shadow-inner" :
                  row.status === 'impossible' ? "bg-black text-[#86868B] border border-white/5" :
                  "bg-[#1D1D1F] text-[#F5F5F7] border border-white/10 shadow-inner"
                )}>
                  {row.grade}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#86868B] mb-0.5">Projected SGPA</span>
                  <div className="flex items-baseline gap-2">
                    <span className={clsx("text-lg font-bold tracking-tight", row.status === 'impossible' ? "text-[#86868B]" : "text-[#F5F5F7]")}>
                      {row.projectedSgpa.toFixed(2)}
                    </span>
                    {row.delta !== 0 && row.status !== 'impossible' && (
                      <span className={clsx("text-xs font-semibold", row.delta > 0 ? "text-white" : "text-[#86868B]")}>
                        {row.delta > 0 ? "+" : ""}{row.delta.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: Requirement & Status */}
              <div className="flex flex-col items-end gap-1.5 relative z-10">
                {row.status === 'secured' ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-white opacity-80" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#86868B]">Guaranteed</span>
                  </>
                ) : row.status === 'impossible' ? (
                  <>
                    <ShieldAlert className="w-5 h-5 text-[#86868B] mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#86868B]">Out of Reach</span>
                  </>
                ) : (
                  <>
                    <div className="flex items-baseline gap-1">
                      <span className={clsx(
                        "text-xl font-bold tracking-tighter",
                        row.status === 'critical' ? "text-[#86868B]" :
                        "text-white"
                      )}>
                        {row.needed}
                      </span>
                      <span className="text-xs font-semibold text-[#86868B]">/{row.maxExamMarks}</span>
                    </div>
                    <span className={clsx(
                      "text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border",
                      row.status === 'critical' ? "bg-[#111111] border-white/10 text-[#86868B]" :
                      row.status === 'hard' ? "bg-white/5 border-white/10 text-white/70" :
                      row.status === 'moderate' ? "bg-white/10 border-white/20 text-white/90" :
                      "bg-white border-white text-black"
                    )}>
                      {row.status}
                    </span>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}

// ==========================================
// NEW FEATURE COMPONENTS (Phase 2)
// ==========================================

function CustomDropdown({ options, value, onChange }: { options: { value: string, label: string }[], value: string, onChange: (v: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative group z-50">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "w-full bg-black border border-white/[0.08] text-[#F5F5F7] text-base font-semibold px-5 py-4 rounded-[2rem] flex justify-between items-center transition-all duration-500 cursor-pointer shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] hover:border-[#4F8EF7]/40 hover:bg-[#050505] hover:shadow-[0_20px_40px_-15px_rgba(79,142,247,0.15)] group",
          isOpen && "border-[#4F8EF7]/40 shadow-[0_20px_40px_-15px_rgba(79,142,247,0.15)]"
        )}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : 'Select...'}</span>
        <ChevronDown className={clsx("text-[#86868B] transition-transform duration-300", isOpen && "rotate-180 text-[#F5F5F7]")} size={20} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 w-full mt-2 bg-black border border-[#4F8EF7]/30 rounded-2xl p-2 shadow-[0_20px_50px_rgba(79,142,247,0.2)] max-h-60 overflow-y-auto custom-scrollbar z-50 origin-top"
          >
            {options.map(o => (
              <div 
                key={o.value} 
                onClick={() => { onChange(o.value); setIsOpen(false); }}
                className={clsx(
                  "px-4 py-3 rounded-xl cursor-pointer text-sm font-semibold transition-all duration-200 truncate",
                  o.value === value ? "bg-white/10 text-white shadow-inner" : "text-[#86868B] hover:bg-white/5 hover:text-[#F5F5F7]"
                )}
              >
                {o.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InputField({ label, value, setValue, max }: { label: string, value: string, setValue: (v: string) => void, max: number }) {
  const numValue = parseFloat(value) || 0;
  const percentage = Math.min((numValue / max) * 100, 100);

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
    <div className="flex flex-col bg-[#000000] border border-white/5 focus-within:border-white/20 rounded-2xl transition-all shadow-inner relative group pb-1">
      <div className="flex flex-col px-5 pt-4 pb-5 z-10 gap-1">
        <span className="text-xs font-semibold text-[#A1A1A6]">{label}</span>
        <input
          type="number" inputMode="decimal" step="0.5"
          value={value} onChange={handleChange} placeholder="-"
          className="bg-transparent border-none outline-none w-full text-left text-2xl font-bold text-[#F5F5F7] tracking-tight placeholder:text-[#A1A1A6]/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none m-0"
        />
      </div>
      
      {/* Interactive Drag Slider */}
      <div className="absolute bottom-0 left-0 w-full h-1.5 opacity-40 group-hover:opacity-100 transition-opacity rounded-b-[2rem] overflow-hidden">
        <div className="absolute top-0 left-0 h-full bg-[#4F8EF7] pointer-events-none transition-all duration-75 ease-linear" style={{ width: `${percentage}%` }} />
        <input 
          type="range" min={0} max={max} step={0.5} 
          value={numValue} onChange={handleChange} 
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
        />
      </div>
    </div>
  );
}

function SafetyGauge({ ratio }: { ratio: number }) {
  const safeRatio = isNaN(ratio) ? 0 : Math.min(Math.max(ratio, 0), 1);
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - safeRatio * circumference;
  
  const color = '#4F8EF7';

  return (
    <div className="relative w-20 h-20 flex items-center justify-center shrink-0 bg-black/30 rounded-full border border-white/5 shadow-inner">
      <svg className="transform -rotate-90 w-20 h-20 absolute inset-0">
        <circle cx="40" cy="40" r={radius} stroke="currentColor" strokeWidth="5" fill="transparent" className="text-white/5" />
        <motion.circle 
          cx="40" cy="40" r={radius} 
          stroke={color} strokeWidth="5" fill="transparent" 
          strokeDasharray={circumference} 
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.1 }}
          strokeLinecap="round"
        />
      </svg>
      <div className="z-10 text-sm font-black text-white tracking-tighter">
        {Math.round(safeRatio * 100)}%
      </div>
    </div>
  );
}

