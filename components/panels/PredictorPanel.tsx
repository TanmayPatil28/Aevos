"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckCircle2, ChevronDown, ChevronUp, ShieldAlert, Pin, AlertTriangle } from 'lucide-react';
import { useUSMStore } from '@/stores/usmStore';
import { resolveActiveAcademicContext } from '@/stores/selectors/academic';
import { getPresetById, convertLetterGradeToGradePoint, calculateSGPA } from '@/lib/presets';
import clsx from 'clsx';
import * as Select from '@radix-ui/react-select';

type CourseFormat = 'theory' | 'practical';
type EndSemMarks = 0 | 50 | 100;
type InternalMaxMarks = 25 | 50 | 75 | 100 | 150;

interface SubjectMemory {
  format: CourseFormat;
  endSemMarks: EndSemMarks;
  internalMax: InternalMaxMarks;
  scores: Record<string, string>;
  useBestOf: boolean;
  lockedGrade: string | null;
  relativeMode: boolean;
  expectedAvg: number;
}

export default function PredictorPanel() {
  const store = useUSMStore();
  const context = resolveActiveAcademicContext(store);
  const activePreset = getPresetById(context.presetId);
  const courses = context.activeCourses;
  
  const selectedCourseId = store.workspaceUi.selectedSubjectId;
  const setSelectedCourseId = (id: string) => store.setWorkspaceUi({ selectedSubjectId: id });

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  // --- Local State ---
  const [format, setFormat] = useState<CourseFormat>('theory');
  const [endSemMarks, setEndSemMarks] = useState<EndSemMarks>(100);
  const [internalMax, setInternalMax] = useState<InternalMaxMarks>(100);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [useBestOf, setUseBestOf] = useState(false);
  const [lockedGrade, setLockedGrade] = useState<string | null>(null);
  
  // --- Relative Grading ---
  const [relativeMode, setRelativeMode] = useState(false);
  const [expectedAvg, setExpectedAvg] = useState(60);

  // Parse assessment scheme
  const schemeInfo = useMemo(() => {
    const isJSPM = activePreset?.canonicalInstitutionId === 'jspm' || activePreset?.shortName?.toLowerCase().includes('jspm');
    const isSPPU = activePreset?.canonicalInstitutionId === 'sppu' || activePreset?.shortName?.toLowerCase().includes('sppu');
    
    if (format === 'practical') {
      return {
        components: [
          { id: 'journal', label: 'Journal', max: 50 },
          { id: 'viva', label: 'Viva', max: 50 },
          { id: 'prac_exam', label: 'Prac Exam', max: 50 },
          { id: 'term_work', label: 'Term Work', max: 50 }
        ],
        hasBestOf: false,
        maxBase: internalMax,
        examMax: endSemMarks
      };
    }

    if (isJSPM) {
      return {
        components: [
          { id: 't1', label: 'T1', max: 30 },
          { id: 't2', label: 'T2', max: 30 },
          { id: 'assig', label: 'Assign', max: 40 }
        ],
        hasBestOf: true,
        maxBase: useBestOf ? 70 : 100,
        examMax: endSemMarks
      };
    } else if (isSPPU) {
      const is2024 = activePreset?.regulationYear === 2024;
      return {
        components: [{ id: 'insem', label: is2024 ? 'CIE' : 'InSem', max: is2024 ? 40 : 30 }],
        hasBestOf: false,
        maxBase: is2024 ? 40 : 30,
        examMax: endSemMarks
      };
    }

    // Default Generic
    return { 
      components: activePreset?.assessmentScheme?.components?.map((c, i) => ({ id: `comp_${i}`, label: c, max: internalMax })) || [{ id: 'comp_0', label: 'Internal', max: internalMax }], 
      hasBestOf: false,
      maxBase: internalMax, 
      examMax: endSemMarks 
    };
  }, [activePreset, endSemMarks, internalMax, format, useBestOf]);

  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId, setSelectedCourseId]);

  // Load state from Persistent Local Storage when course changes
  useEffect(() => {
    if (!selectedCourse) return;
    
    const saved = localStorage.getItem(`predictor_mem_${selectedCourse.id}`);
    if (saved) {
      try {
        const mem: SubjectMemory = JSON.parse(saved);
        setFormat(mem.format || 'theory');
        setEndSemMarks(mem.endSemMarks !== undefined ? mem.endSemMarks : 100);
        setInternalMax(mem.internalMax || 100);
        setScores(mem.scores || {});
        setUseBestOf(mem.useBestOf || false);
        setLockedGrade(mem.lockedGrade || null);
        setRelativeMode(mem.relativeMode || false);
        setExpectedAvg(mem.expectedAvg || 60);
        return;
      } catch (e) {
        console.error("Failed to parse persistent memory", e);
      }
    }
    
    // Defaults if no persistent memory found
    const defaultFormat = selectedCourse.credits <= 2 ? 'practical' : 'theory';
    setFormat(defaultFormat);
    const defaultEndSem = selectedCourse.credits <= 2 ? 50 : 100;
    setEndSemMarks(defaultEndSem as EndSemMarks);
    setInternalMax(defaultFormat === 'practical' ? 50 : 100);
    
    const defaultScores: Record<string, string> = {};
    let remainingMarks = selectedCourse.cieMarks || 0;

    schemeInfo.components.forEach((comp) => {
      if (remainingMarks <= 0) return;
      const toAssign = Math.min(remainingMarks, comp.max);
      defaultScores[comp.id] = toAssign.toString();
      remainingMarks -= toAssign;
    });
    
    setScores(defaultScores);
    setUseBestOf(false);
    setLockedGrade(null);
    setRelativeMode(false);
    setExpectedAvg(60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse?.id]);

  // Save to Persistent Local Storage on any change
  useEffect(() => {
    if (selectedCourse) {
      const mem: SubjectMemory = { format, endSemMarks, internalMax, scores, useBestOf, lockedGrade, relativeMode, expectedAvg };
      localStorage.setItem(`predictor_mem_${selectedCourse.id}`, JSON.stringify(mem));
    }
  }, [format, endSemMarks, internalMax, scores, useBestOf, lockedGrade, relativeMode, expectedAvg, selectedCourse?.id]);

  const internals = useMemo(() => {
    let scoredBase = 0;
    
    if (schemeInfo.hasBestOf && useBestOf && format !== 'practical') {
      const t1 = parseFloat(scores['t1']) || 0;
      const t2 = parseFloat(scores['t2']) || 0;
      const assig = parseFloat(scores['assig']) || 0;
      scoredBase = Math.max(t1, t2) + Math.min(assig, 40);
    } else {
      scoredBase = schemeInfo.components.reduce((acc, comp) => {
        const val = parseFloat(scores[comp.id]) || 0;
        return acc + Math.min(val, comp.max); 
      }, 0);
    }

    return { scoredBase: Math.min(scoredBase, schemeInfo.maxBase), maxBase: schemeInfo.maxBase };
  }, [scores, schemeInfo, useBestOf, format]);

  // THE POSSIBILITY MATRIX & RELATIVE CURVE CALCULATION
  const matrix = useMemo(() => {
    if (!selectedCourse || !activePreset) return [];

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

    const totalMax = internals.maxBase + schemeInfo.examMax;

    return validGrades.map(g => {
      let absoluteMinPercentage = g.minMarks !== undefined ? g.minMarks : (g.points * 10 - 5); 
      
      let minPercentage = absoluteMinPercentage;
      if (relativeMode) {
        const curveShift = (expectedAvg - 60) * 0.5;
        minPercentage = absoluteMinPercentage + curveShift;
      }
      
      const requiredTotalMarks = (minPercentage / 100) * totalMax;
      
      const neededInEndSemRaw = requiredTotalMarks - internals.scoredBase;
      const neededInEndSem = Math.ceil(Math.max(0, neededInEndSemRaw));
      const marginOfError = Math.floor(schemeInfo.examMax - neededInEndSem);
      
      const projectedSubjects = courses.map(c => {
        if (c.id === selectedCourse.id) {
          return { ...c, grade: g.grade, gradePoint: convertLetterGradeToGradePoint(g.grade, activePreset) };
        }
        return { ...c, grade: c.grade || "F", gradePoint: convertLetterGradeToGradePoint(c.grade || "F", activePreset) };
      });
      const projectedSgpa = calculateSGPA(projectedSubjects);
      const delta = projectedSgpa - currentSGPA;

      let status: 'secured' | 'easy' | 'moderate' | 'hard' | 'critical' | 'impossible';
      if (neededInEndSemRaw <= 0) status = 'secured';
      else if (neededInEndSem > schemeInfo.examMax) status = 'impossible';
      else {
        const ratio = neededInEndSem / schemeInfo.examMax;
        if (ratio <= 0.4) status = 'easy';
        else if (ratio <= 0.7) status = 'moderate';
        else if (ratio <= 0.9) status = 'hard';
        else status = 'critical';
      }

      return {
        grade: g.grade,
        points: g.points,
        needed: neededInEndSem,
        marginOfError: status !== 'impossible' && status !== 'secured' ? marginOfError : null,
        maxExamMarks: schemeInfo.examMax,
        projectedSgpa,
        delta,
        status,
        relativeBoundaryOffset: relativeMode ? (expectedAvg - 60) * 0.5 : 0
      };
    });
  }, [internals, selectedCourse, activePreset, courses, schemeInfo, relativeMode, expectedAvg]);

  const currentCgpa = context.academic.currentCgpa || 0;
  const earnedCredits = context.academic.earnedCredits || 0;
  const simulatedCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const targetCgpa = context.academic.targetCgpa || currentCgpa;

  const targetPath = useMemo(() => {
    if (matrix.length === 0) return null;
    if (lockedGrade) {
      const locked = matrix.find(r => r.grade === lockedGrade);
      if (locked) return locked;
    }

    const possiblePaths = matrix.filter(r => r.status !== 'impossible').sort((a, b) => a.needed - b.needed);
    if (possiblePaths.length === 0) return null; 

    for (const path of possiblePaths) {
      const projectedCgpa = (currentCgpa * earnedCredits + path.projectedSgpa * simulatedCredits) / (earnedCredits + simulatedCredits);
      if (projectedCgpa >= targetCgpa) {
        return path;
      }
    }
    return possiblePaths[possiblePaths.length - 1];
  }, [matrix, currentCgpa, earnedCredits, simulatedCredits, targetCgpa, lockedGrade]);

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-foreground-muted">
        <Target className="w-10 h-10 opacity-20" />
        <p className="text-sm font-semibold tracking-tight">No active courses available.<br/>Sync your data to use the Predictor.</p>
      </div>
    );
  }

  const handleScoreChange = (id: string, val: string) => {
    setScores(prev => ({ ...prev, [id]: val }));
  };

  const courseOptions = courses.map(c => ({ value: c.id, label: `${c.name} (${c.credits}Cr)` }));
  const totalPossibleOverall = internals.maxBase + schemeInfo.examMax;
  const internalPct = totalPossibleOverall > 0 ? (internals.scoredBase / totalPossibleOverall) * 100 : 0;
  const neededPct = targetPath && targetPath.status !== 'impossible' && targetPath.status !== 'secured'
    ? (targetPath.needed / totalPossibleOverall) * 100 : 0;

  const statusIcon = (s: string) => {
    if (s === 'secured') return <CheckCircle2 size={13} className="text-success" />;
    if (s === 'impossible') return <ShieldAlert size={13} className="text-destructive" />;
    if (s === 'critical') return <AlertTriangle size={13} className="text-warning" />;
    return null;
  };

  const statusBadgeClass = (s: string, pinned: boolean) => {
    if (pinned) return "text-brand bg-brand/10";
    if (s === 'secured') return "text-success bg-success/10";
    if (s === 'impossible') return "text-destructive bg-destructive/10";
    if (s === 'critical') return "text-warning bg-warning/10";
    if (s === 'hard') return "text-orange-400 bg-orange-400/10";
    return "text-foreground-muted bg-white/5";
  };

  return (
    <div className="flex flex-col h-full bg-transparent text-foreground font-sans overflow-y-auto overflow-x-hidden scrollbar-hide">
      <div className="flex flex-col gap-5">
        
        {/* ─── Redesigned Header: macOS-style Inspector Toolbar ─── */}
        <div className="flex flex-col gap-4 bg-white/[0.02] border border-white/[0.05] rounded-[20px] p-4 shadow-sm">
          
          {/* Section 1: Course Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/[0.04] border border-white/10 shrink-0">
              <Target size={14} className="text-brand/80" />
            </div>
            <h2 className="text-sm font-bold text-white line-clamp-1 flex-1 tracking-tight">
              {selectedCourse?.name || "No Course Selected"}
            </h2>
            {selectedCourse?.credits && (
              <span className="shrink-0 text-[10px] font-black uppercase tracking-wider bg-white/5 text-foreground-muted px-2.5 py-1 rounded-md">
                {selectedCourse.credits} CR
              </span>
            )}
          </div>

          <div className="h-[1px] w-full bg-white/[0.04]" />

          {/* Section 2: Config Row */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <PillSelect
                options={[{value: 'theory', label: 'Theory'}, {value: 'practical', label: 'Practical'}]}
                value={format}
                onChange={(val) => setFormat(val as CourseFormat)}
                compact
              />
              <PillSelect
                options={[{value: '0', label: 'No Exam'}, {value: '50', label: 'ESE 50'}, {value: '100', label: 'ESE 100'}]}
                value={endSemMarks.toString()}
                onChange={(val) => setEndSemMarks(parseInt(val) as EndSemMarks)}
                compact
              />
              {format === 'practical' && (
                <PillSelect
                  options={[
                    {value: '25', label: 'Int 25'}, {value: '50', label: 'Int 50'}, 
                    {value: '75', label: 'Int 75'}, {value: '100', label: 'Int 100'}, {value: '150', label: 'Int 150'}
                  ]}
                  value={internalMax.toString()}
                  onChange={(val) => setInternalMax(parseInt(val) as InternalMaxMarks)}
                  compact
                />
              )}
            </div>
            
            <div className="flex items-center gap-1 bg-[#1c1c1e]/50 border border-white/[0.04] p-0.5 rounded-lg">
              <DotToggle label="Curve" active={relativeMode} onToggle={() => setRelativeMode(!relativeMode)} variant="warning" />
            </div>
          </div>

          {/* ─── Curve Slider (conditional) ─── */}
          <AnimatePresence>
            {relativeMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 px-1 pt-1 pb-2">
                  <span className="text-[10px] font-bold text-warning shrink-0 uppercase tracking-widest">Target Avg {expectedAvg}%</span>
                  <input 
                    type="range" min={30} max={90} step={5} 
                    value={expectedAvg} onChange={(e) => setExpectedAvg(parseInt(e.target.value))} 
                    className="flex-1 accent-warning cursor-ew-resize h-1 rounded-full outline-none appearance-none bg-white/5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-warning [&::-webkit-slider-thumb]:rounded-full"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Section 3: Interactive Dashboard-Style Score Chips */}
          <div className="flex flex-col gap-2.5 mt-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-foreground-muted/40">Internal Assessment</span>
              <div className="text-[11px] font-bold text-foreground-muted tabular-nums bg-white/[0.03] px-2 py-0.5 rounded-md border border-white/[0.05]">
                {internals.scoredBase.toFixed(0)}<span className="text-white/20">/{internals.maxBase}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              {schemeInfo.components.map(comp => (
                <DashboardInputChip
                  key={comp.id}
                  label={comp.label}
                  value={scores[comp.id] || ''}
                  setValue={(v) => handleScoreChange(comp.id, v)}
                  max={comp.max}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ─── Progress Separator ─── */}
        <div className="relative h-[2px] w-full bg-white/[0.04] rounded-full overflow-hidden">
          <motion.div
            className="absolute left-0 top-0 h-full bg-success/60 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${internalPct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          {neededPct > 0 && (
            <motion.div
              className="absolute top-0 h-full bg-brand/50 rounded-full"
              style={{ left: `${internalPct}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${neededPct}%` }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            />
          )}
        </div>

        {/* ─── Section 4: Grade Target Table ─── */}
        <div className="flex flex-col">
          {/* Table Header */}
          <div className="grid grid-cols-[45px_1fr_65px_65px_24px] gap-1 px-2 pb-2 text-[10px] font-bold uppercase tracking-widest text-foreground-muted/60">
            <span>Grade</span>
            <span>SGPA</span>
            <span className="text-right">Need</span>
            <span className="text-right">Status</span>
            <span />
          </div>

          {/* Table Rows */}
          <div className="flex flex-col">
            {matrix.map(row => {
              const isPinned = lockedGrade === row.grade;
              return (
                <div
                  key={row.grade}
                  onClick={() => {
                    if (row.status !== 'impossible') {
                      setLockedGrade(row.grade === lockedGrade ? null : row.grade);
                      if (selectedCourse) store.updateCourse(selectedCourse.id, { grade: row.grade });
                    }
                  }}
                  className={clsx(
                    "group grid grid-cols-[45px_1fr_65px_65px_24px] gap-1 items-center px-2 h-10 rounded-lg cursor-pointer transition-colors duration-150",
                    isPinned ? "bg-brand/8 border border-brand/20" : "border border-transparent hover:bg-white/[0.03]",
                    row.status === 'impossible' && "opacity-35 cursor-not-allowed"
                  )}
                >
                  {/* Grade */}
                  <span className={clsx(
                    "text-sm font-bold tabular-nums",
                    isPinned ? "text-brand" :
                    row.status === 'secured' ? "text-success" :
                    row.status === 'impossible' ? "text-foreground-muted" :
                    "text-foreground"
                  )}>
                    {row.grade}
                  </span>

                  {/* SGPA + Delta */}
                  <div className="flex flex-col justify-center min-w-0">
                    <span className="text-xs font-semibold text-foreground tabular-nums leading-none">{row.projectedSgpa.toFixed(2)}</span>
                    {(row.delta !== 0 && row.status !== 'impossible') || (relativeMode && row.relativeBoundaryOffset !== 0) ? (
                      <div className="flex items-center gap-1 mt-0.5">
                        {row.delta !== 0 && row.status !== 'impossible' && (
                          <span className={clsx("text-[9px] font-semibold tabular-nums leading-none", row.delta > 0 ? "text-success/70" : "text-foreground-muted/50")}>
                            {row.delta > 0 ? "+" : ""}{row.delta.toFixed(2)}
                          </span>
                        )}
                        {relativeMode && row.relativeBoundaryOffset !== 0 && (
                          <span className="text-[8px] text-warning/60 font-semibold leading-none">
                            {row.relativeBoundaryOffset > 0 ? '↑' : '↓'}{Math.abs(row.relativeBoundaryOffset).toFixed(0)}
                          </span>
                        )}
                      </div>
                    ) : null}
                  </div>

                  {/* Needed */}
                  <span className="text-right text-xs font-bold tabular-nums text-foreground-muted">
                    {row.status === 'secured' ? '—' : row.status === 'impossible' ? '×' : (
                      <>{row.needed}<span className="text-white/20">/{row.maxExamMarks}</span></>
                    )}
                  </span>

                  {/* Status */}
                  <div className="flex justify-end">
                    <span className={clsx(
                      "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md leading-none",
                      statusBadgeClass(row.status, isPinned)
                    )}>
                      {row.status === 'secured' ? 'safe' : row.status === 'impossible' ? 'n/a' : row.status}
                    </span>
                  </div>

                  {/* Pin */}
                  <div className="flex justify-center">
                    {isPinned ? (
                      <Pin size={11} className="text-brand fill-brand" />
                    ) : (
                      <Pin size={11} className="text-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Pinned Summary (only when a grade is pinned) ─── */}
        <AnimatePresence>
          {targetPath && lockedGrade && targetPath.status !== 'impossible' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className={clsx(
                "rounded-xl border px-4 py-3 text-xs leading-relaxed",
                targetPath.status === 'secured'
                  ? "border-success/20 bg-success/5 text-success"
                  : "border-brand/20 bg-brand/5 text-foreground-muted"
              )}>
                {targetPath.status === 'secured' ? (
                  <p>
                    Grade <strong className="text-foreground">&apos;{targetPath.grade}&apos;</strong> is guaranteed from internals alone.
                  </p>
                ) : (
                  <p>
                    For <strong className="text-foreground">&apos;{targetPath.grade}&apos;</strong>: score{' '}
                    <strong className="text-foreground">{targetPath.needed}/{targetPath.maxExamMarks}</strong>{' '}
                    ({(targetPath.needed / targetPath.maxExamMarks * 100).toFixed(0)}%) in finals.
                    {targetPath.marginOfError !== null && targetPath.marginOfError > 0 && (
                      <span className="text-warning"> Margin: {targetPath.marginOfError} marks.</span>
                    )}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   HELPER COMPONENTS — Compact, professional, minimal
   ════════════════════════════════════════════════════════════ */

function PillSelect({ options, value, onChange, placeholder = "—", compact = false }: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  compact?: boolean;
}) {
  return (
    <Select.Root value={value || "none"} onValueChange={(v) => onChange(v === "none" ? "" : v)}>
      <Select.Trigger className={clsx(
        "inline-flex items-center gap-1.5 font-bold outline-none transition-colors cursor-pointer border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] data-[state=open]:bg-white/[0.1] data-[state=open]:border-white/10",
        compact ? "h-7 px-3 rounded-full text-[10px] text-foreground-muted uppercase tracking-wider" : "h-9 px-4 rounded-xl text-[13px] text-foreground w-full justify-between"
      )}>
        <Select.Value placeholder={placeholder} />
        <Select.Icon><ChevronDown size={compact ? 10 : 12} className="text-white/30" /></Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={4}
          className="bg-[#1c1c1e] border border-white/[0.08] rounded-lg shadow-2xl z-[9999] overflow-hidden min-w-[120px] font-sans"
        >
          <Select.ScrollUpButton className="flex items-center justify-center h-5 text-white/40">
            <ChevronUp size={12} />
          </Select.ScrollUpButton>
          <Select.Viewport className="py-1 max-h-[200px]">
            {options.map(opt => (
              <Select.Item
                key={opt.value}
                value={opt.value}
                className="px-3 py-1.5 text-[12px] font-semibold text-foreground-muted hover:bg-white/[0.05] hover:text-foreground focus:bg-white/[0.05] focus:text-foreground outline-none cursor-pointer data-[state=checked]:text-brand"
              >
                <Select.ItemText>{opt.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton className="flex items-center justify-center h-5 text-white/40">
            <ChevronDown size={12} />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

function DotToggle({ label, active, onToggle, variant = "brand" }: {
  label: string;
  active: boolean;
  onToggle: () => void;
  variant?: "brand" | "warning";
}) {
  const dotColor = variant === "warning"
    ? (active ? "bg-warning" : "bg-white/10")
    : (active ? "bg-brand" : "bg-white/10");
  const textColor = variant === "warning"
    ? (active ? "text-warning" : "text-foreground-muted/50")
    : (active ? "text-brand" : "text-foreground-muted/50");

  return (
    <button
      onClick={onToggle}
      className={clsx(
        "inline-flex items-center gap-1.5 h-7 px-3 rounded-full border transition-all text-[10px] font-bold uppercase tracking-wider",
        active ? "bg-white/[0.08] border-white/[0.12]" : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]"
      )}
    >
      <div className={clsx("w-2 h-2 rounded-full transition-colors", dotColor)} />
      <span className={clsx("transition-colors", textColor)}>{label}</span>
    </button>
  );
}

function DashboardInputChip({ label, value, setValue, max }: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  max: number;
}) {
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
    <div className="relative group flex flex-col gap-1.5 w-[82px]">
      <div className="flex items-center justify-between px-1">
        <span className="text-[9px] font-bold text-foreground-muted uppercase tracking-wider truncate">{label}</span>
      </div>
      <div className="flex items-center justify-center h-10 px-2.5 rounded-xl bg-[#0a0a0a]/50 border border-white/[0.08] group-focus-within:border-brand/40 group-focus-within:bg-brand/5 transition-all shadow-inner">
        <input
          type="number" inputMode="decimal" step="0.5"
          value={value} onChange={handleChange} placeholder="0"
          className="bg-transparent border-none outline-none w-7 text-right text-[13px] font-bold text-white tabular-nums placeholder:text-white/10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="text-[10px] text-white/20 font-bold shrink-0 ml-0.5">/{max}</span>
      </div>
    </div>
  );
}
