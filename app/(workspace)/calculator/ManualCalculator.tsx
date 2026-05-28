"use client";

import React, { useState, useCallback, useEffect, useMemo, useRef, useDeferredValue } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Plus, RotateCcw, Save, CheckCircle2, X, Target, ArrowRight } from "lucide-react";
import { getPresetById, convertPercentageToGrade, calculateSGPA } from "@/lib/presets";
import { useUSMStore } from "@/stores/usmStore";
import AnimatedCounter from "@/components/AnimatedCounter";
import WorkspaceContent from "@/components/layout/WorkspaceContent";
import WorkspaceSection from "@/components/layout/WorkspaceSection";
import CalculationBreakdown from "@/components/CalculationBreakdown";
import { useNetworkState } from "@/lib/hooks/useNetworkState";
import { diagnostics } from "@/lib/diagnostics";

interface Subject {
  id: string;
  name: string;
  credits: string;
  score: string;
  error?: string;
}

export default function ManualCalculator() {
  const store = useUSMStore();
  const preset = getPresetById(store.presetId || "sppu") || getPresetById("sppu")!;
  const isOnline = useNetworkState();
  
  const [usePercentage, setUsePercentage] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: "initial-1", name: "", credits: "", score: "" },
  ]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const lastAddedId = useRef<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addSubject = useCallback(() => {
    const newId = Math.random().toString();
    setSubjects(prev => [...prev, { id: newId, name: "", credits: "", score: "" }]);
    lastAddedId.current = newId;
    
    // Auto-focus the new row's name input
    setTimeout(() => {
      document.getElementById(`name-${newId}`)?.focus();
    }, 50);
  }, []);

  const removeSubject = useCallback((id: string) => {
    setSubjects(prev => {
      if (prev.length > 1) return prev.filter((s) => s.id !== id);
      toast.error("You must have at least one subject");
      return prev;
    });
  }, []);

  const handleChange = useCallback((id: string, field: keyof Subject, value: string) => {
    setSubjects(prev => prev.map((s) => (s.id === id ? { ...s, [field]: value, error: undefined } : s)));
  }, []);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent, field: 'name' | 'credits' | 'score', index: number, courseId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (field === 'name') {
        document.getElementById(`credits-${courseId}`)?.focus();
      } else if (field === 'credits') {
        document.getElementById(`score-${courseId}`)?.focus();
      } else if (field === 'score') {
        if (index === subjects.length - 1) {
          addSubject();
        } else {
          document.getElementById(`name-${subjects[index + 1].id}`)?.focus();
        }
      }
    }
  }, [subjects.length, addSubject, subjects]);

  const handleReset = useCallback(() => {
    setSubjects([{ id: Math.random().toString(), name: "", credits: "", score: "" }]);
    toast("Sandbox Reset", { icon: "🔄" });
  }, []);

  const deferredSubjects = useDeferredValue(subjects);

  // Compute derived subjects exactly as simulator does
  const derivationSubjects = useMemo(() => {
    return deferredSubjects.map((sub, index) => {
      const credits = parseFloat(sub.credits) || 0;
      const score = parseFloat(sub.score) || 0;
      let gradePoint = 0;
      let gradeStr = "";
      
      if (usePercentage) {
        const result = convertPercentageToGrade(score, preset);
        gradePoint = result.points;
        gradeStr = result.grade;
      } else {
        gradePoint = score;
        const matchingScale = preset.gradeScale.find(g => gradePoint >= g.points);
        gradeStr = matchingScale ? matchingScale.grade : "F";
      }

      return {
        id: sub.id,
        name: sub.name || `Course ${index + 1}`,
        credits,
        grade: gradeStr,
        gradePoint,
        isPass: gradeStr !== "F"
      };
    }).filter(c => c.credits > 0);
  }, [deferredSubjects, preset, usePercentage]);

  const calculatedSGPA = useMemo(() => calculateSGPA(derivationSubjects), [derivationSubjects]);
  const totalCredits = useMemo(() => derivationSubjects.reduce((acc, c) => acc + c.credits, 0), [derivationSubjects]);

  const handleSave = async () => {
    if (derivationSubjects.length === 0 || totalCredits === 0) {
      toast.error("Please add valid subjects and credits first.");
      return;
    }
    
    if (!isOnline) {
      diagnostics.warn("ManualCalculator", "Save blocked: Device is offline");
      toast.error("Network disconnected. Results cannot be saved offline.");
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          semester: "Semester",
          subjects: derivationSubjects,
          presetId: store.presetId || "sppu",
          type: "semester",
          total_credits: totalCredits,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");
      setSaveSuccess(true);
      toast.success("Result saved to Dashboard!");
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err: any) {
      console.error(err);
      toast.error("Error saving calculation. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <WorkspaceContent className="relative z-10">
        <WorkspaceSection>
          
          {/* =======================================
              ROW 1: LEDGER & NUMBERS SUMMARY
              ======================================= */}
          <div className="flex flex-wrap gap-8 lg:gap-12 items-start mt-8">

            {/* LEFT PANE: Smart Glass Ledger */}
            <div className="flex-[2] min-w-[320px] flex flex-col gap-6 relative z-10 w-full">
              <div className="w-full flex flex-col gap-6">

                {/* Header Toolbar */}
                <div className="relative overflow-hidden bg-black/60 backdrop-blur-3xl border border-white/[0.05] px-6 py-5 rounded-[2rem] shadow-[0_20px_40px_-20px_rgba(0,0,0,0.8)] shrink-0 flex justify-between items-center group">
                  <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#4F8EF7]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#4F8EF7]/15 transition-colors duration-500" />
                  
                  <div className="flex items-center gap-3 relative z-10">
                    <Calculator className="text-[#4F8EF7] w-5 h-5 drop-shadow-[0_0_8px_rgba(79,142,247,0.5)]" />
                    <span className="font-bold text-white tracking-tight text-lg">Manual Sandbox</span>
                  </div>

                  <div className="flex items-center gap-3 relative z-10">
                    {/* Mode Toggle */}
                    <div className="flex bg-white/[0.03] p-1 rounded-full relative border border-white/[0.05]">
                      <div
                        className="absolute inset-y-1 bg-[#4F8EF7] rounded-full transition-all duration-300 ease-out z-0"
                        style={{ width: 'calc(50% - 4px)', left: usePercentage ? '4px' : 'calc(50%)' }}
                      />
                      <button
                        onClick={() => setUsePercentage(true)}
                        className={`relative z-10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors duration-300 w-24 ${usePercentage ? 'text-white' : 'text-white/40 hover:text-white'}`}
                      >
                        Percent
                      </button>
                      <button
                        onClick={() => setUsePercentage(false)}
                        className={`relative z-10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors duration-300 w-24 ${!usePercentage ? 'text-white' : 'text-white/40 hover:text-white'}`}
                      >
                        Grades
                      </button>
                    </div>

                    <button
                      onClick={handleReset}
                      title="Reset Sandbox"
                      className="text-white/50 bg-white/[0.03] p-2.5 rounded-full hover:bg-white/[0.08] hover:text-white border border-transparent hover:border-white/10 transition-all flex items-center justify-center shadow-sm"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
                </div>

                {/* Smart Glass Ledger */}
                <div className="flex flex-col gap-3 relative z-20">
                  {/* Ledger Header */}
                  <div className="flex items-center px-4 md:px-6 mb-1">
                     <span className="flex-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Course Name</span>
                     <span className="w-20 md:w-28 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Credits</span>
                     <span className="w-24 md:w-32 text-right text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Score</span>
                     <span className="w-10"></span>
                  </div>

                  <AnimatePresence mode="popLayout">
                    {subjects.map((course, idx) => {
                      const derived = derivationSubjects.find(d => d.id === course.id);
                      const hasValidScore = parseFloat(course.score) >= 0;
                      const isPassing = derived ? derived.isPass : true;
                      
                      // Dynamic Glow logic
                      const ringClass = hasValidScore 
                        ? (isPassing ? "focus-within:ring-green-500/30 border-green-500/20" : "focus-within:ring-red-500/30 border-red-500/20") 
                        : "focus-within:ring-[#4F8EF7]/30 hover:border-white/10";

                      return (
                        <motion.div
                          key={course.id}
                          initial={{ opacity: 0, x: -20, backgroundColor: "rgba(255,255,255,0)" }}
                          animate={{ opacity: 1, x: 0, backgroundColor: "rgba(255,255,255,0.02)" }}
                          exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          className={`relative flex items-center bg-black/40 border border-white/[0.05] rounded-[1.25rem] p-2 md:p-3 shadow-sm transition-all duration-300 group ring-1 ring-transparent ${ringClass}`}
                        >
                          {/* Course Name */}
                          <div className="flex-1 relative">
                            <input
                              id={`name-${course.id}`}
                              type="text"
                              value={course.name}
                              onChange={(e) => handleChange(course.id, 'name', e.target.value)}
                              onKeyDown={(e) => handleInputKeyDown(e, 'name', idx, course.id)}
                              className="w-full bg-transparent border-none text-white font-semibold text-sm md:text-base px-3 py-2 outline-none placeholder:text-white/20"
                              placeholder={`Course ${idx + 1}`}
                            />
                          </div>

                          {/* Divider */}
                          <div className="h-8 w-[1px] bg-white/[0.05]" />

                          {/* Credits */}
                          <div className="w-20 md:w-28 flex justify-center">
                            <input
                              id={`credits-${course.id}`}
                              type="number"
                              value={course.credits}
                              onChange={(e) => handleChange(course.id, 'credits', e.target.value)}
                              onKeyDown={(e) => handleInputKeyDown(e, 'credits', idx, course.id)}
                              className="w-12 md:w-16 text-center font-mono font-bold bg-white/[0.03] text-white border border-transparent text-sm md:text-base py-2 rounded-xl outline-none focus:bg-[#4F8EF7]/10 focus:text-[#4F8EF7] focus:border-[#4F8EF7]/30 transition-all [&::-webkit-inner-spin-button]:appearance-none"
                              placeholder="CR"
                              min="1" max="10"
                            />
                          </div>

                          {/* Divider */}
                          <div className="h-8 w-[1px] bg-white/[0.05]" />

                          {/* Score Input (Colossal) */}
                          <div className="w-24 md:w-32 flex justify-end px-2">
                            <input
                              id={`score-${course.id}`}
                              type="number"
                              value={course.score}
                              onChange={(e) => handleChange(course.id, 'score', e.target.value)}
                              onKeyDown={(e) => handleInputKeyDown(e, 'score', idx, course.id)}
                              className={`w-16 md:w-20 text-right font-mono font-black bg-transparent ${hasValidScore ? (isPassing ? 'text-green-400' : 'text-red-400') : 'text-white'} text-xl md:text-2xl py-1 outline-none placeholder:text-white/10 transition-colors [&::-webkit-inner-spin-button]:appearance-none`}
                              placeholder={usePercentage ? "85" : "9.0"}
                            />
                          </div>

                          {/* Remove Button */}
                          <div className="w-10 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => removeSubject(course.id)}
                              className="p-2 rounded-full bg-white/[0.05] text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {/* Add Course Floating Row */}
                  <motion.button
                    onClick={addSubject}
                    className="flex items-center justify-center gap-2 w-full py-4 mt-2 rounded-[1.25rem] border-2 border-dashed border-white/[0.05] text-white/30 hover:text-[#4F8EF7] hover:border-[#4F8EF7]/30 hover:bg-[#4F8EF7]/5 transition-all duration-300 font-bold tracking-widest text-[10px] uppercase group"
                  >
                    <Plus size={16} className="group-hover:scale-125 transition-transform" />
                    <span>Add Another Course</span>
                  </motion.button>

                </div>
              </div>
            </div>

            {/* RIGHT PANE: Numbers Summary */}
            <div className="flex-1 min-w-[320px] flex flex-col gap-12 lg:sticky lg:top-28 h-fit relative z-10 w-full">
              
              <div className="flex flex-col">
                <span className="text-white/50 font-black tracking-[0.3em] text-[10px] mb-6 uppercase">Calculated SGPA</span>
                <motion.div 
                  className="flex items-baseline gap-2"
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <AnimatedCounter target={calculatedSGPA} decimals={2} className="text-[6rem] lg:text-[7rem] xl:text-[9rem] font-semibold tracking-tighter text-white leading-[0.8]" />
                </motion.div>
                <span className="text-white/40 font-medium text-lg mt-6 tracking-tight">out of {preset.gradeScale[0]?.points || 10}.0 maximum scale.</span>
              </div>

              <div className="flex flex-col w-full border-t border-white/[0.08] pt-8 gap-8 mt-2">
                <div className="flex flex-col">
                  <span className="text-white/40 font-bold tracking-[0.2em] text-[10px] mb-3 uppercase">Total Credits</span>
                  <AnimatedCounter target={totalCredits} className="text-4xl font-semibold tracking-tighter text-white" />
                </div>
              </div>

              <div className="mt-6 pt-8 border-t border-white/[0.08]">
                <button onClick={handleSave} disabled={isSaving} className="group w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-5 rounded-full hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-95 transition-all duration-300 ease-out disabled:opacity-50 disabled:hover:scale-100">
                  {isSaving ? (
                     <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                     </svg>
                  ) : saveSuccess ? (
                    <><CheckCircle2 size={18} /> Saved!</>
                  ) : (
                    <><Save size={18} className="transition-transform duration-300 group-hover:scale-110" /> Save Result</>
                  )}
                </button>
              </div>

            </div>
          </div>

          {/* =======================================
              ROW 2: TYPOGRAPHY & STATUTORY MATRIX
              ======================================= */}
          <div className="flex flex-wrap gap-8 lg:gap-12 items-start mt-24">

            {/* LEFT PANE: Typography */}
            <div className="flex-1 min-w-[320px] max-w-2xl flex flex-col gap-12 relative z-10 lg:sticky lg:top-28 h-fit w-full">
              <div className="w-full flex flex-col gap-12 relative z-10 px-2 lg:px-6">

                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="flex flex-col gap-5"
                >
                  <h3 className="text-[2rem] md:text-[2.5rem] font-semibold tracking-[-0.04em] text-white leading-[1.1]">
                    <motion.span 
                      className="text-transparent bg-clip-text inline-block"
                      style={{ backgroundImage: "linear-gradient(to right, #3b82f6, #93c5fd, #e0f2fe, #93c5fd, #3b82f6)", backgroundSize: "200% auto" }}
                      animate={{ backgroundPosition: ["0% center", "200% center"] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    >Calculate your trajectory.</motion.span><br />
                    Complete Sandbox.
                  </h3>
                  <p className="text-[#86868b] text-xl md:text-[22px] font-medium leading-[1.4] tracking-tight">
                    <strong className="text-[#f5f5f7]">A completely isolated environment.</strong> Enter your subjects manually and observe how grade boundaries and credit weights impact your academic standing.
                  </p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
                  className="flex flex-col gap-5"
                >
                  <h3 className="text-[2rem] md:text-[2.5rem] font-semibold tracking-[-0.04em] leading-[1.1]">
                    <motion.span 
                      className="text-transparent bg-clip-text inline-block"
                      style={{ backgroundImage: "linear-gradient(to right, #3b82f6, #93c5fd, #e0f2fe, #93c5fd, #3b82f6)", backgroundSize: "200% auto" }}
                      animate={{ backgroundPosition: ["0% center", "200% center"] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    >Statutory Accuracy.</motion.span>
                  </h3>
                  <p className="text-[#86868b] text-xl md:text-[22px] font-medium leading-[1.4] tracking-tight">
                    GradeFlow silently translates percentage marks into valid statutory grade points automatically if you select the Percent mode, ensuring every calculation mirrors the exact university formula.
                  </p>
                </motion.div>
                
              </div>
            </div>

            {/* RIGHT PANE: Statutory Matrix */}
            <div className="flex-[2] min-w-[320px] relative z-10 w-full">
              <div className="w-full relative z-10">
                {derivationSubjects.length > 0 ? (
                  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                    <CalculationBreakdown
                      preset={preset}
                      subjects={derivationSubjects}
                      type="sgpa"
                    />
                  </motion.div>
                ) : (
                  <div className="h-64 flex items-center justify-center border border-white/5 bg-black/40 rounded-[32px] text-white/30 font-medium">
                    Add valid subjects to view the statutory breakdown.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* =======================================
              ROW 3: PREDICTOR SHORTCUT BANNER
              ======================================= */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12 relative overflow-hidden bg-gradient-to-r from-purple-500/10 to-[#4F8EF7]/10 border border-purple-500/20 hover:border-[#4F8EF7]/40 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 group transition-colors duration-500"
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-5 relative z-10">
              <div className="w-14 h-14 shrink-0 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                <Target className="text-purple-400 w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h4 className="text-white font-bold text-xl md:text-2xl tracking-tight">Need precise internal marks?</h4>
                <p className="text-white/60 text-sm md:text-base font-medium max-w-lg">
                  Use the intelligent <strong className="text-white/80">Contextual Predictor</strong> to calculate exactly what scores you need in Test 1, Test 2, and Assignments to secure your target grade.
                </p>
              </div>
            </div>

            <button 
              onClick={() => {
                const activeCourses = useUSMStore.getState().courses || [];
                useUSMStore.getState().openPanel("PREDICTOR", activeCourses[0]?.id || "");
              }}
              className="relative z-10 px-8 py-4 rounded-full bg-white text-black font-bold text-sm md:text-base hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] whitespace-nowrap flex items-center gap-2 group-hover:bg-[#4F8EF7] group-hover:text-white"
            >
              Open Predictor <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

        </WorkspaceSection>
      </WorkspaceContent>
    </>
  );
}
