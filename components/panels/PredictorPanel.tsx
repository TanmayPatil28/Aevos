"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Calculator, CheckCircle2, ChevronDown, ChevronUp, ShieldAlert, Zap, Pin, BarChart2 } from 'lucide-react';
import { useUSMStore } from '@/stores/usmStore';
import { resolveActiveAcademicContext } from '@/stores/selectors/academic';
import { getPresetById, convertLetterGradeToGradePoint, calculateSGPA } from '@/lib/presets';
import { cn } from '@/lib/cn'; // Assuming you have a cn utility, if not I will use clsx
import clsx from 'clsx';

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

const fadeInUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
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
          { id: 't1', label: 'Test 1', max: 30 },
          { id: 't2', label: 'Test 2', max: 30 },
          { id: 'assig', label: 'Assignment', max: 40 }
        ],
        hasBestOf: true,
        maxBase: useBestOf ? 70 : 100,
        examMax: endSemMarks
      };
    } else if (isSPPU) {
      const is2024 = activePreset?.regulationYear === 2024;
      return {
        components: [{ id: 'insem', label: is2024 ? 'CIE' : 'In-Sem', max: is2024 ? 40 : 30 }],
        hasBestOf: false,
        maxBase: is2024 ? 40 : 30,
        examMax: endSemMarks
      };
    }

    // Default Generic
    return { 
      components: activePreset?.assessmentScheme?.components?.map((c, i) => ({ id: `comp_${i}`, label: c, max: internalMax })) || [{ id: 'comp_0', label: 'Internal Assessment', max: internalMax }], 
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
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-[#86868B] bg-transparent">
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

  return (
    <div className="flex flex-col h-full bg-black text-[#F5F5F7] font-sans tracking-tight overflow-y-auto overflow-x-hidden custom-scrollbar relative">
      
      {/* Ambient Glowing Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a84ff]/15 via-transparent to-transparent blur-[120px] mix-blend-screen" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-[#0a84ff]/10 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      <div className="relative z-10 flex flex-col space-y-8 pb-16 px-2">
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
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#0a84ff] bg-[#0a84ff]/10 px-2.5 py-1 rounded-md border border-[#0a84ff]/20">
              {activePreset?.shortName || "Generic"} Mode
            </span>
          </div>
          
          <CustomDropdown 
            options={courseOptions} 
            value={selectedCourseId || ""} 
            onChange={(val) => {
              setSelectedCourseId(val);
              setLockedGrade(null); // reset lock on course change
            }} 
          />
        </motion.div>

        {/* Internal Assessment Configuration - Bento Glass Card */}
        <motion.div 
          variants={fadeInUp} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-20px" }}
          className="relative bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 space-y-6 z-50 transition-all duration-500 shadow-2xl w-full"
        >
          <div className="flex flex-col gap-4 w-full">
            {/* Top Row: Dropdowns Grid */}
            <div className={clsx("grid gap-3 w-full", format === 'practical' ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2")}>
              {/* Format Dropdown */}
              <div className="relative w-full">
                <select 
                  value={format} 
                  onChange={(e) => setFormat(e.target.value as CourseFormat)}
                  className="appearance-none bg-[#1c1c1e] hover:bg-[#2c2c2e] text-[#F5F5F7] text-[13px] font-bold px-4 py-3 rounded-xl outline-none transition-colors cursor-pointer w-full shadow-inner border border-white/5"
                >
                  <option value="theory">Theory</option>
                  <option value="practical">Practical</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
              </div>

              {/* End Sem Marks Dropdown */}
              <div className="relative w-full">
                <select 
                  value={endSemMarks.toString()} 
                  onChange={(e) => setEndSemMarks(parseInt(e.target.value) as EndSemMarks)}
                  className="appearance-none bg-[#1c1c1e] hover:bg-[#2c2c2e] text-[#F5F5F7] text-[13px] font-bold px-4 py-3 rounded-xl outline-none transition-colors cursor-pointer w-full shadow-inner border border-white/5"
                >
                  <option value="0">EndSem: None</option>
                  <option value="50">EndSem: 50</option>
                  <option value="100">EndSem: 100</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
              </div>

              {/* Internal Max Dropdown (Mainly for Practicals) */}
              {format === 'practical' && (
                <div className="relative w-full">
                  <select 
                    value={internalMax.toString()} 
                    onChange={(e) => setInternalMax(parseInt(e.target.value) as InternalMaxMarks)}
                    className="appearance-none bg-[#0a84ff]/10 hover:bg-[#0a84ff]/20 border border-[#0a84ff]/30 text-[#0a84ff] text-[13px] font-bold px-4 py-3 rounded-xl outline-none transition-colors cursor-pointer w-full"
                  >
                    <option value="25">Max Internal: 25</option>
                    <option value="50">Max Internal: 50</option>
                    <option value="75">Max Internal: 75</option>
                    <option value="100">Max Internal: 100</option>
                    <option value="150">Max Internal: 150</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0a84ff]/60 pointer-events-none" />
                </div>
              )}
            </div>

            {/* Bottom Row: Toggles */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              {schemeInfo.hasBestOf && format !== 'practical' && (
                <label className="flex-1 flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl cursor-pointer hover:bg-black/60 transition-colors">
                  <span className="text-xs font-semibold tracking-tight text-[#F5F5F7]">
                    Best of T1/T2 Mode
                  </span>
                  <div className={clsx(
                    "w-10 h-6 rounded-full p-1 transition-colors duration-300 relative shadow-inner",
                    useBestOf ? "bg-[#0a84ff]" : "bg-[#1c1c1e] border border-white/5"
                  )}>
                    <motion.div
                      className={clsx("w-4 h-4 rounded-full shadow-md", useBestOf ? "bg-white" : "bg-[#86868B]")}
                      animate={{ x: useBestOf ? 16 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </div>
                  <input type="checkbox" className="hidden" checked={useBestOf} onChange={() => setUseBestOf(!useBestOf)} />
                </label>
              )}
              
              {/* Relative Grading Toggle */}
              <label className="flex-1 flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl cursor-pointer hover:bg-black/60 transition-colors">
                <div className="flex flex-col">
                  <span className="text-xs font-bold tracking-tight text-[#ff9f0a]">
                    Relative Curve Mode
                  </span>
                  <span className="text-[9px] text-[#86868B]">Shift grade boundaries</span>
                </div>
                <div className={clsx(
                  "w-10 h-6 rounded-full p-1 transition-colors duration-300 relative shadow-inner",
                  relativeMode ? "bg-[#ff9f0a]" : "bg-[#1c1c1e] border border-white/5"
                )}>
                  <motion.div
                    className={clsx("w-4 h-4 rounded-full shadow-md", relativeMode ? "bg-white" : "bg-[#86868B]")}
                    animate={{ x: relativeMode ? 16 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </div>
                <input type="checkbox" className="hidden" checked={relativeMode} onChange={() => setRelativeMode(!relativeMode)} />
              </label>
            </div>
          </div>

          {/* Expected Class Average Slider */}
          <AnimatePresence>
            {relativeMode && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden w-full"
              >
                <div className="bg-[#ff9f0a]/5 border border-[#ff9f0a]/20 rounded-xl p-4 flex flex-col gap-4 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-[#ff9f0a]">Expected Class Average</span>
                    <span className="text-lg font-bold text-[#ff9f0a]">{expectedAvg}%</span>
                  </div>
                  <input 
                    type="range" min={30} max={90} step={5} 
                    value={expectedAvg} onChange={(e) => setExpectedAvg(parseInt(e.target.value))} 
                    className="w-full accent-[#ff9f0a] cursor-ew-resize bg-black h-2 rounded-full outline-none appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#ff9f0a] [&::-webkit-slider-thumb]:rounded-full"
                  />
                  <p className="text-[10px] text-[#ff9f0a]/70 leading-tight bg-black/30 p-2 rounded-md">
                    {expectedAvg < 60 ? "Hard paper detected. Grade boundaries will shift downwards, making it mathematically easier to score high grades." : 
                     expectedAvg > 60 ? "Easy paper detected. Grade boundaries will shift upwards, meaning you need more marks to secure high grades." : 
                     "Standard distribution. Grade boundaries remain at their absolute baseline values."}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dynamic Inputs */}
          <div className={clsx("grid gap-3 relative z-10 w-full", format === 'practical' ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2")}>
            {schemeInfo.components.map((comp, idx) => (
               <div key={comp.id} className={clsx("transition-all w-full", format !== 'practical' && schemeInfo.components.length % 2 !== 0 && idx === schemeInfo.components.length - 1 ? "col-span-2" : "col-span-1")}>
                 <InputField 
                   label={comp.label} 
                   value={scores[comp.id] || ''} 
                   setValue={(v) => handleScoreChange(comp.id, v)} 
                   max={comp.max} 
                 />
               </div>
            ))}
          </div>

          {/* Micro-Analytics Progress Bar */}
          <div className="pt-6 relative z-10 space-y-3 border-t border-white/5 w-full">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#86868B] flex items-center gap-1.5"><BarChart2 className="w-3.5 h-3.5" /> Performance Breakdown</span>
              <span className="text-[#F5F5F7]">{internals.scoredBase.toFixed(1)} / {totalPossibleOverall} Total Possible</span>
            </div>
            
            <div className="h-3 w-full bg-black/50 rounded-full overflow-hidden flex relative shadow-inner">
              {/* Internal Secured */}
              <motion.div 
                className="h-full bg-[#34c759] relative" 
                initial={{ width: 0 }}
                animate={{ width: `${(internals.scoredBase / totalPossibleOverall) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
              </motion.div>
              
              {/* Needed for Locked Target */}
              {targetPath && targetPath.status !== 'impossible' && targetPath.status !== 'secured' && (
                <motion.div 
                  className="h-full bg-[#0a84ff] relative opacity-80" 
                  initial={{ width: 0 }}
                  animate={{ width: `${(targetPath.needed / totalPossibleOverall) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                >
                  <div className="absolute inset-0 flex items-center overflow-hidden">
                    <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(255,255,255,0.1)_4px,rgba(255,255,255,0.1)_8px)]" />
                  </div>
                </motion.div>
              )}
            </div>
            
            <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-[#86868B]">
              <span className="text-[#34c759]">Secured Internal</span>
              {targetPath && targetPath.status !== 'impossible' && targetPath.status !== 'secured' && (
                <span className="text-[#0a84ff]">Needed Final</span>
              )}
            </div>
          </div>
        </motion.div>

        {/* THE POSSIBILITY MATRIX - Unified List (Placement Page Style) */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-20px" }}
          className="flex-1 flex flex-col space-y-4 pb-4"
        >
          <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              Possibility Target Ledger
            </h3>
            <span className="text-xs font-semibold text-[#86868B]">Click to Pin Goal</span>
          </div>

          <div className="bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col">
            {matrix.map((row, i) => {
              const isPinned = lockedGrade === row.grade;
              const isLast = i === matrix.length - 1;
              const statusColor = 
                row.status === 'impossible' ? "text-[#ff453a]" :
                row.status === 'critical' ? "text-[#ff9f0a]" :
                row.status === 'secured' ? "text-[#34c759]" :
                "text-white";

              return (
                <div 
                  key={row.grade} 
                  className={clsx(
                    "group flex flex-col transition-all duration-300",
                    isPinned ? "bg-white/5" : "bg-transparent hover:bg-white/5",
                    !isLast && "border-b border-white/5",
                    row.status === 'impossible' && "opacity-50 cursor-not-allowed grayscale"
                  )}
                >
                  {/* Row Header */}
                  <div 
                    onClick={() => {
                      if (row.status !== 'impossible') {
                        setLockedGrade(row.grade === lockedGrade ? null : row.grade);
                        if (selectedCourse) store.updateCourse(selectedCourse.id, { grade: row.grade });
                      }
                    }}
                    className="flex items-center justify-between gap-4 py-5 px-6 cursor-pointer relative z-10 focus:outline-none"
                  >
                    {isPinned && (
                      <motion.div layoutId="matrix-lock" className="absolute inset-0 bg-gradient-to-r from-[#0a84ff]/0 via-[#0a84ff]/5 to-[#0a84ff]/0 pointer-events-none" />
                    )}
                    
                    {/* Left: Grade & Name */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className={clsx(
                        "flex flex-col items-center justify-center w-12 h-12 rounded-xl shrink-0 border transition-colors",
                        isPinned ? "bg-[#0a84ff]/10 border-[#0a84ff]/30 text-[#0a84ff]" :
                        row.status === 'secured' ? "bg-[#34c759]/10 border-[#34c759]/30 text-[#34c759]" :
                        "bg-[#1c1c1e] border-white/5 text-white"
                      )}>
                        <span className="text-xl font-bold leading-none">{row.grade}</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
                          Projected SGPA: {row.projectedSgpa.toFixed(2)}
                          {isPinned && <Pin size={14} className="text-[#0a84ff] fill-[#0a84ff]" />}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          {row.delta !== 0 && row.status !== 'impossible' && (
                            <span className={clsx("text-xs font-semibold", row.delta > 0 ? "text-[#34c759]" : "text-[#86868B]")}>
                              {row.delta > 0 ? "+" : ""}{row.delta.toFixed(2)} vs current
                            </span>
                          )}
                          {relativeMode && row.relativeBoundaryOffset !== 0 && (
                            <span className="text-[10px] text-[#ff9f0a] font-semibold bg-[#ff9f0a]/10 px-1.5 py-0.5 rounded">
                              Curve: {row.relativeBoundaryOffset > 0 ? '+' : ''}{row.relativeBoundaryOffset.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Needed & Status */}
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="flex flex-col items-end gap-1">
                        {row.status === 'secured' ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-[#34c759] mb-0.5" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#34c759]/80">Guaranteed</span>
                          </>
                        ) : row.status === 'impossible' ? (
                          <>
                            <ShieldAlert className="w-5 h-5 text-[#ff453a] mb-0.5" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff453a]">Out of Reach</span>
                          </>
                        ) : (
                          <>
                            <div className="flex items-baseline gap-1">
                              <span className={clsx(
                                "text-xl font-bold tracking-tight",
                                isPinned ? "text-[#0a84ff]" : statusColor
                              )}>
                                {row.needed}
                              </span>
                              {row.maxExamMarks > 0 && (
                                <span className="text-xs font-semibold text-[#86868B]">/{row.maxExamMarks}</span>
                              )}
                            </div>
                            {row.maxExamMarks > 0 && (
                              <span className={clsx(
                                "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded transition-colors",
                                isPinned ? "bg-[#0a84ff]/20 text-[#0a84ff]" :
                                row.status === 'critical' ? "bg-white/5 text-[#86868B]" :
                                "bg-white/10 text-white/70"
                              )}>
                                {row.status}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      
                      {/* Accordion Arrow / Pin Action */}
                      <button 
                        aria-label={isPinned ? "Unpin grade" : "Pin grade"}
                        className={clsx(
                          "p-2 rounded-full transition-all duration-300 border flex items-center justify-center shrink-0 w-8 h-8",
                          isPinned 
                            ? "bg-[#0a84ff]/20 text-[#0a84ff] border-[#0a84ff]/40 shadow-[0_0_15px_rgba(10,132,255,0.3)]" 
                            : "bg-white/5 text-white/40 border-white/10 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100"
                        )}
                      >
                        {isPinned ? <ChevronUp size={16} /> : <Pin size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Accordion Expanded Copilot State */}
                  <AnimatePresence>
                    {isPinned && row.status !== 'impossible' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden bg-black/20 border-t border-white/5"
                      >
                        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
                          <div className="flex flex-col items-center gap-2 shrink-0">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0a84ff] flex items-center gap-1 mb-2">
                              <Zap size={12} fill="currentColor" /> Copilot Strategy
                            </h4>
                            {row.status === 'secured' ? (
                              <div className="w-16 h-16 flex items-center justify-center shrink-0 bg-[#34c759]/10 text-[#34c759] rounded-full ring-1 ring-[#34c759]/30 shadow-[0_0_30px_rgba(52,199,89,0.15)]">
                                <CheckCircle2 className="w-8 h-8" />
                              </div>
                            ) : (
                              <SafetyGauge ratio={internals.scoredBase / internals.maxBase} color="#0a84ff" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            {row.status === 'secured' ? (
                              <p className="text-sm font-medium text-[#34c759] leading-relaxed">
                                Grade <strong className="text-white text-lg">&apos;{row.grade}&apos;</strong> is mathematically guaranteed from your internal marks alone. You do not need to score any marks in the end-semester exam.
                              </p>
                            ) : (
                              <div className="space-y-3">
                                <p className="text-sm font-medium text-white/80 leading-relaxed">
                                  To secure an <strong className="text-white text-lg">&apos;{row.grade}&apos;</strong>, you must score <strong className="text-white bg-white/10 px-2 py-0.5 rounded">{row.needed}/{row.maxExamMarks}</strong> in the final exam. That's about <strong className="text-[#0a84ff]">{(row.needed / row.maxExamMarks * 100).toFixed(0)}%</strong> of the paper.
                                </p>
                                {row.marginOfError !== null && row.marginOfError > 0 && (
                                  <div className="p-3 rounded-xl bg-[#ff453a]/10 border border-[#ff453a]/20 inline-block w-full">
                                    <p className="text-xs font-semibold text-[#ff453a]">
                                      Margin of Error: You can afford to lose exactly <strong>{row.marginOfError} marks</strong> and still secure this grade.
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>

      </div>
    </div>
  );
}

function CustomDropdown({ options, value, onChange }: { options: { value: string, label: string }[], value: string, onChange: (v: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative group z-50">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "w-full bg-[#1c1c1e]/60 backdrop-blur-md border border-white/10 text-white text-[15px] font-semibold px-5 py-4 rounded-[1.5rem] flex justify-between items-center transition-all duration-300 cursor-pointer hover:bg-white/5",
          isOpen && "bg-[#1c1c1e] border-white/20"
        )}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : 'Select...'}</span>
        <ChevronDown className={clsx("text-white/40 transition-transform duration-300", isOpen && "rotate-180 text-white")} size={20} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 w-full mt-2 bg-[#1c1c1e] border border-white/10 rounded-2xl p-2 shadow-2xl max-h-60 overflow-y-auto custom-scrollbar z-50 origin-top backdrop-blur-xl"
          >
            {options.map(o => (
              <div 
                key={o.value} 
                onClick={() => { onChange(o.value); setIsOpen(false); }}
                className={clsx(
                  "px-4 py-3 rounded-xl cursor-pointer text-sm font-semibold transition-all duration-200 truncate",
                  o.value === value ? "bg-[#0a84ff]/10 text-[#0a84ff]" : "text-white/60 hover:bg-white/5 hover:text-white"
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
    <div className="flex flex-col bg-black/40 border border-white/[0.03] focus-within:bg-black focus-within:border-white/10 rounded-2xl transition-all relative group pb-1 w-full">
      <div className="flex flex-col px-4 pt-3 pb-4 z-10 gap-1">
        <span className="text-xs font-semibold text-[#86868B] truncate">{label}</span>
        <input
          type="number" inputMode="decimal" step="0.5"
          value={value} onChange={handleChange} placeholder="0"
          className="bg-transparent border-none outline-none w-full text-left text-xl font-bold text-white tracking-tight placeholder:text-white/10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none m-0"
        />
      </div>
      
      {/* Interactive Drag Slider */}
      <div className="absolute bottom-0 left-0 w-full h-1.5 opacity-40 group-hover:opacity-100 transition-opacity rounded-b-2xl overflow-hidden">
        <div className="absolute top-0 left-0 h-full bg-[#0a84ff] pointer-events-none transition-all duration-75 ease-linear" style={{ width: `${percentage}%` }} />
        <input 
          type="range" min={0} max={max} step={0.5} 
          value={numValue} onChange={handleChange} 
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
        />
      </div>
    </div>
  );
}

function SafetyGauge({ ratio, color = '#0a84ff' }: { ratio: number, color?: string }) {
  const safeRatio = isNaN(ratio) ? 0 : Math.min(Math.max(ratio, 0), 1);
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - safeRatio * circumference;

  return (
    <div className="relative w-16 h-16 flex items-center justify-center shrink-0 bg-black/40 rounded-full shadow-inner border border-white/[0.03]">
      <svg className="transform -rotate-90 w-16 h-16 absolute inset-0">
        <circle cx="32" cy="32" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/[0.05]" />
        <motion.circle 
          cx="32" cy="32" r={radius} 
          stroke={color} strokeWidth="4" fill="transparent" 
          strokeDasharray={circumference} 
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.1 }}
          strokeLinecap="round"
        />
      </svg>
      <div className="z-10 text-xs font-black text-white tracking-tight">
        {Math.round(safeRatio * 100)}%
      </div>
    </div>
  );
}
