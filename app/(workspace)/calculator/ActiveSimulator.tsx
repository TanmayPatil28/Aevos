"use client";

import { useState, useMemo, useEffect, useRef, useDeferredValue } from "react";
import Link from "next/link";
import { Plus, Save, ArrowRight, RotateCcw, Activity, Calculator, ChevronDown, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import { useUSMStore, CourseState } from "@/stores/usmStore";
import { resolveActiveAcademicContext } from "@/stores/selectors/academic";
import PageContainer from "@/components/layout/PageContainer";
import Grid from "@/components/layout/Grid";
import Input from "@/components/ui/Input";
import CalculationBreakdown from "@/components/CalculationBreakdown";
import AnimatedCounter from "@/components/AnimatedCounter";
import WorkspaceContent from "@/components/layout/WorkspaceContent";
import WorkspaceSection from "@/components/layout/WorkspaceSection";
import { getPresetById, getGradeScale, calculateSGPA, convertLetterGradeToGradePoint } from "@/lib/presets";
import { motion, AnimatePresence } from "framer-motion";

interface SimulatedCourse extends CourseState {
  isTemporary?: boolean;
}

function GradeDropdown({ value, onChange, options }: { value: string, onChange: (val: string) => void, options: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select grade"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-24 h-10 bg-[#2c2c2e] hover:bg-[#3a3a3c] text-[#F5F5F7] font-bold px-4 rounded-xl outline-none transition-colors cursor-pointer flex items-center justify-between gap-2`}
      >
        <span className="flex-1 text-center text-sm">{value || "-"}</span>
        <ChevronDown size={14} className={`text-white/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            className="absolute top-full mt-2 w-24 left-0 bg-[#2c2c2e] border border-white/[0.05] rounded-xl shadow-2xl z-[100] overflow-y-auto overflow-x-hidden py-1.5 max-h-48 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            <button
              role="option"
              aria-selected={value === ""}
              onClick={() => { onChange(""); setIsOpen(false); }}
              className={`w-full text-center px-4 py-2 text-sm font-bold transition-colors duration-200 ${value === "" ? 'text-[#4F8EF7] bg-white/[0.05]' : 'text-[#86868b] hover:bg-white/[0.05] hover:text-[#F5F5F7]'}`}
            >
              -
            </button>
            {options.map(opt => (
              <button
                key={opt}
                role="option"
                aria-selected={value === opt}
                onClick={() => { onChange(opt); setIsOpen(false); }}
                className={`w-full text-center px-4 py-2 text-sm font-bold transition-colors duration-200 ${value === opt ? 'text-[#4F8EF7] bg-white/[0.05]' : 'text-[#86868b] hover:bg-white/[0.05] hover:text-[#F5F5F7]'}`}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

let activeSimulatorRenderCount = 0;

export default function CalculatorPage() {
  const store = useUSMStore();
  const context = resolveActiveAcademicContext(store);
  const preset = getPresetById(context.presetId) || getPresetById("sppu");

  const [simulatedCourses, setSimulatedCourses] = useState<SimulatedCourse[]>(context.activeCourses);
  const [hasChanges, setHasChanges] = useState(false);
  const deferredSimulatedCourses = useDeferredValue(simulatedCourses);

  // Performance Tracking
  if (process.env.NODE_ENV === "development") {
    activeSimulatorRenderCount++;
    console.time(`[Perf] ActiveSimulator Render #${activeSimulatorRenderCount}`);
  }

  useEffect(() => {
    if (!hasChanges) {
      setSimulatedCourses(context.activeCourses);
    }
  }, [context.activeCourses, hasChanges]);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.timeEnd(`[Perf] ActiveSimulator Render #${activeSimulatorRenderCount}`);
    }
  });

  const gradeScale = getGradeScale(preset!);

  const handleUpdateTemp = (id: string, field: keyof SimulatedCourse, value: any) => {
    setSimulatedCourses(prev => prev.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ));
    setHasChanges(true);
  };

  const handleAddTemporary = () => {
    const newCourse: SimulatedCourse = {
      id: `temp-${Date.now()}`,
      code: "SIM-001",
      name: "New Simulation Course",
      credits: 3,
      cieMarks: 0,
      semester: 1,
      attendanceTotal: 0,
      attendanceBunked: 0,
      isTemporary: true
    };
    setSimulatedCourses(prev => [...prev, newCourse]);
    setHasChanges(true);
  };

  const handleSaveSandbox = () => {
    const overrides: Record<string, any> = {};
    simulatedCourses.forEach(c => {
      if (c.grade) overrides[c.id] = { grade: c.grade };
    });

    const scenarioId = `sandbox-${Date.now()}`;
    useUSMStore.setState((state) => ({
      ...state,
      simulation: {
        ...state.simulation,
        activeScenarios: [
          ...(state.simulation?.activeScenarios || []),
          {
            id: scenarioId,
            name: "Saved Simulation",
            overrides: { courses: overrides, semesters: {} }
          }
        ]
      }
    }));
    toast.success("Sandbox scenario saved");
    setHasChanges(false);
  };

  const handleReset = () => {
    setSimulatedCourses(context.activeCourses);
    setHasChanges(false);
    toast("Simulation Reset", { icon: "🔄" });
  };

  const derivationSubjects = useMemo(() => {
    return deferredSimulatedCourses
      .filter(c => c.grade && c.grade !== "F")
      .map(c => ({
        name: c.name,
        credits: c.credits,
        grade: c.grade!,
        gradePoint: convertLetterGradeToGradePoint(c.grade!, preset!)
      }));
  }, [deferredSimulatedCourses, preset]);

  const openPanel = useUSMStore(state => state.openPanel);
  
  const calculatedSGPA = useMemo(() => calculateSGPA(derivationSubjects), [derivationSubjects]);

  const { currentEarnedPoints, simulatedCredits, simulatedPoints } = useMemo(() => {
    return {
      currentEarnedPoints: (context.metrics.cgpa || 0) * (context.academic.earnedCredits || 0),
      simulatedCredits: derivationSubjects.reduce((acc, c) => acc + c.credits, 0),
      simulatedPoints: derivationSubjects.reduce((acc, c) => acc + (c.credits * c.gradePoint), 0)
    };
  }, [context.metrics.cgpa, context.academic.earnedCredits, derivationSubjects]);

  const projectedTotalCredits = (context.academic.earnedCredits || 0) + simulatedCredits;
  const projectedCGPA = useMemo(() => {
    return projectedTotalCredits > 0
      ? (currentEarnedPoints + simulatedPoints) / projectedTotalCredits
      : 0;
  }, [projectedTotalCredits, currentEarnedPoints, simulatedPoints]);

  return (
    <>
      <WorkspaceContent className="relative z-10">

        {/* =======================================
            TWO-COLUMN DYNAMIC FLOW LAYOUT
            ======================================= */}
        <WorkspaceSection>

          {/* =======================================
      ROW 1: BENTO GRID & NUMBERS SUMMARY
      ======================================= */}
          <div className="flex flex-wrap gap-8 lg:gap-12 items-start">

            {/* LEFT PANE: Bento Grid */}
            <div className="flex-[2] min-w-[320px] flex flex-col gap-6 relative z-10 w-full">

              {/* =======================================
            LEFT PANE: The Bento Grid Subject Ledger
            ======================================= */}
              <div className="w-full flex flex-col gap-6">

                <div className="relative overflow-hidden bg-black/60 backdrop-blur-3xl border border-white/[0.05] px-6 py-5 rounded-[2rem] shadow-[0_20px_40px_-20px_rgba(0,0,0,0.8)] shrink-0 mt-2 flex justify-between items-center group">
                  <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#4F8EF7]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#4F8EF7]/15 transition-colors duration-500" />

                  <div className="flex items-center gap-3 relative z-10">
                    <Calculator className="text-[#4F8EF7] w-5 h-5 drop-shadow-[0_0_8px_rgba(79,142,247,0.5)]" />
                    <span className="font-bold text-white tracking-tight text-lg">Course Ledger Overview</span>
                  </div>

                  <div className="flex items-center gap-3 relative z-10">
                    {hasChanges && (
                      <button
                        onClick={handleReset}
                        className="text-[10px] font-black uppercase tracking-widest text-white/50 bg-white/[0.03] px-4 py-2 rounded-xl hover:bg-white/[0.08] hover:text-white border border-transparent hover:border-white/10 transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <RotateCcw size={12} /> Reset
                      </button>
                    )}
                    <button
                      onClick={handleAddTemporary}
                      className="text-[10px] font-black uppercase tracking-widest text-[#4F8EF7] bg-[#4F8EF7]/10 px-4 py-2 rounded-xl hover:bg-[#4F8EF7]/20 border border-[#4F8EF7]/30 hover:border-[#4F8EF7]/50 hover:shadow-[0_0_15px_rgba(79,142,247,0.2)] transition-all flex items-center gap-1.5"
                    >
                      <Plus size={12} /> Add Course
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4 relative z-20">
                  <AnimatePresence mode="popLayout">
                    {simulatedCourses.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center p-12 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl"
                      >
                        <div className="w-16 h-16 rounded-full bg-[#4F8EF7]/10 flex items-center justify-center mb-4 border border-[#4F8EF7]/20">
                          <Calculator className="w-8 h-8 text-[#4F8EF7]/50" />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">Sandbox is Empty</h3>
                        <p className="text-white/40 text-sm max-w-sm text-center mb-6">
                          Add a course to see how different grades affect your overall CGPA. It's completely safe and won't affect your real records.
                        </p>
                        <button
                          onClick={handleAddTemporary}
                          className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white text-sm font-bold border border-white/10 transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" /> Add a Course
                        </button>
                      </motion.div>
                    ) : (
                      simulatedCourses.map((course, idx) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ delay: idx * 0.05, type: "spring", stiffness: 300, damping: 25 }}
                        style={{ zIndex: simulatedCourses.length - idx }}
                        className="relative"
                      >
                        <div 
                          onClick={() => {
                            if (!course.isTemporary) {
                              openPanel("PREDICTOR", course.id);
                            }
                          }}
                          className={`relative bg-[#1c1c1e] rounded-[1.5rem] p-5 flex flex-col h-full min-h-[140px] transition-all duration-300 group hover:bg-[#2c2c2e] hover:scale-[1.02] cursor-pointer ${course.isTemporary ? 'ring-2 ring-[#4F8EF7]' : ''}`}
                        >
                          {/* Top Row: Code & Credits Combined */}
                          <div className="flex justify-between items-center mb-3">
                            {course.isTemporary ? (
                              <div className="flex items-center gap-2">
                                <input
                                  value={course.code}
                                  onChange={(e) => handleUpdateTemp(course.id, 'code', e.target.value)}
                                  className="bg-[#2c2c2e] text-[#F5F5F7] font-bold text-xs h-7 px-2 w-20 rounded-md outline-none focus:ring-1 focus:ring-[#4F8EF7] transition-all placeholder:text-[#86868b] uppercase"
                                  placeholder="CODE"
                                />
                                <span className="text-[#86868b] text-xs font-bold">•</span>
                                <input
                                  type="number"
                                  value={course.credits}
                                  onChange={(e) => handleUpdateTemp(course.id, 'credits', parseInt(e.target.value) || 0)}
                                  className="bg-[#2c2c2e] text-[#F5F5F7] font-bold text-xs h-7 w-12 text-center rounded-md outline-none focus:ring-1 focus:ring-[#4F8EF7] transition-all [&::-webkit-inner-spin-button]:appearance-none placeholder:text-[#86868b]"
                                  placeholder="CR"
                                />
                              </div>
                            ) : (
                              <span className="text-xs font-bold text-[#86868b] tracking-wider uppercase">
                                {course.code} &bull; {course.credits} CR
                              </span>
                            )}
                          </div>

                          {/* Middle Row: Name */}
                          <div className="flex-1 mb-4">
                            {course.isTemporary ? (
                              <textarea
                                value={course.name}
                                onChange={(e) => handleUpdateTemp(course.id, 'name', e.target.value)}
                                className="bg-[#2c2c2e] text-[#F5F5F7] font-semibold text-lg leading-tight w-full rounded-md p-2 outline-none focus:ring-1 focus:ring-[#4F8EF7] resize-none h-16 placeholder:text-[#86868b] transition-all"
                                placeholder="New Course Name..."
                              />
                            ) : (
                              <h3 className="text-[17px] font-semibold text-[#F5F5F7] leading-snug line-clamp-2">
                                {course.name}
                              </h3>
                            )}
                          </div>

                          {/* Bottom Row: Grade Selector (Left Aligned for cleanliness) */}
                          <div className="mt-auto flex items-center justify-start">
                            <div onClick={e => e.stopPropagation()}>
                              <GradeDropdown
                                value={course.grade || ""}
                                onChange={(val) => handleUpdateTemp(course.id, 'grade', val)}
                                options={gradeScale.filter(g => g.grade !== "F").map(g => g.grade)}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )))}
                  </AnimatePresence>
                </div>



              </div>

            </div>

            {/* RIGHT PANE: Numbers Summary */}
            <div className="flex-1 min-w-[320px] flex flex-col gap-12 lg:sticky lg:top-28 h-fit relative z-10 w-full">
              {/* No backgrounds, borders, or padding on the main container */}
              
              <div className="flex flex-col">
                <span className="text-white/50 font-black tracking-[0.3em] text-[10px] mb-6 uppercase">Simulated SGPA</span>
                <motion.div 
                  className="flex items-baseline gap-2"
                  animate={{ 
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <AnimatedCounter target={calculatedSGPA} decimals={2} className="text-[6rem] lg:text-[7rem] xl:text-[9rem] font-semibold tracking-tighter text-white leading-[0.8]" />
                </motion.div>
                <span className="text-white/40 font-medium text-lg mt-6 tracking-tight">out of {preset?.gradeScale[0]?.points || 10}.0 maximum scale.</span>
              </div>

              <div className="flex flex-col w-full border-t border-white/[0.08] pt-8 gap-8 mt-2">
                <div className="flex flex-col">
                  <span className="text-white/40 font-bold tracking-[0.2em] text-[10px] mb-3 uppercase">Projected CGPA</span>
                  <AnimatedCounter target={projectedCGPA} decimals={2} className="text-4xl font-semibold tracking-tighter text-white" />
                </div>
                
                <div className="w-full h-px bg-white/[0.08]" />

                <div className="flex flex-col">
                  <span className="text-white/40 font-bold tracking-[0.2em] text-[10px] mb-3 uppercase">Current Standing</span>
                  <span className="text-4xl font-semibold tracking-tighter text-white">{context.metrics.cgpa?.toFixed(2) || 'N/A'} CGPA</span>
                </div>
              </div>

              <div className="mt-6 pt-8 border-t border-white/[0.08]">
                <div className="flex gap-3">
                  {hasChanges && (
                    <button
                      onClick={handleReset}
                      className="px-5 py-4 rounded-full bg-transparent border border-white/[0.1] hover:bg-white/[0.05] text-white/50 hover:text-white transition-all flex items-center justify-center hover:scale-105 active:scale-95"
                    >
                      <RotateCcw size={18} />
                    </button>
                  )}
                  <button onClick={handleSaveSandbox} className="group flex-1 flex items-center justify-center gap-3 bg-white text-black font-bold py-5 rounded-full hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-95 transition-all duration-300 ease-out">
                    <Save size={18} className="transition-transform duration-300 group-hover:scale-110" />
                    Save Scenario
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* =======================================
      ROW 2: TYPOGRAPHY & STATUTORY MATRIX
      ======================================= */}
          <div className="flex flex-wrap gap-8 lg:gap-12 items-start mt-24">

            {/* LEFT PANE: Typography */}
            <div className="flex-1 min-w-[320px] max-w-2xl flex flex-col gap-12 relative z-10 lg:sticky lg:top-28 h-fit w-full">
              {/* LEFT: Apple-Style Guide Typography */}
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
                    >Plan with Confidence.</motion.span><br />
                    Shape your trajectory.
                  </h3>
                  <p className="text-[#86868b] text-xl md:text-[22px] font-medium leading-[1.4] tracking-tight">
                    <strong className="text-[#f5f5f7]">Test different scenarios safely.</strong> Change a grade and see the impact immediately. The system instantly calculates how any target grade affects your overall SGPA and CGPA.
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
                    >Always Accurate.</motion.span>
                  </h3>
                  <p className="text-[#86868b] text-xl md:text-[22px] font-medium leading-[1.4] tracking-tight">
                    Projections are not estimations. They are calculated using your institution’s exact credit formulas, ensuring what you see here matches your official academic record.
                  </p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                  className="flex flex-col gap-5"
                >
                  <h3 className="text-[2rem] md:text-[2.5rem] font-semibold tracking-[-0.04em] leading-[1.1]">
                    <motion.span 
                      className="text-transparent bg-clip-text inline-block"
                      style={{ backgroundImage: "linear-gradient(to right, #3b82f6, #93c5fd, #e0f2fe, #93c5fd, #3b82f6)", backgroundSize: "200% auto" }}
                      animate={{ backgroundPosition: ["0% center", "200% center"] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    >Instant Scenarios.</motion.span>
                  </h3>
                  <p className="text-[#86868b] text-xl md:text-[22px] font-medium leading-[1.4] tracking-tight">
                    Every adjustment updates your projections immediately. The calculator runs directly on your device, allowing you to test complex "what-if" scenarios without waiting.
                  </p>
                </motion.div>

                <div className="w-full h-[1px] bg-gradient-to-r from-white/10 to-transparent my-6" />

                <div className="flex flex-col gap-16 pt-4">
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                  >
                    <div className="text-white font-semibold text-8xl md:text-[7rem] tracking-tighter leading-none mb-4">0<span className="text-5xl md:text-7xl text-white/40 tracking-tight">ms</span></div>
                    <motion.div 
                      className="text-transparent bg-clip-text font-semibold text-2xl tracking-tight mb-2" 
                      style={{ backgroundImage: "linear-gradient(to right, #3b82f6, #93c5fd, #e0f2fe, #93c5fd, #3b82f6)", backgroundSize: "200% auto" }}
                      animate={{ backgroundPosition: ["0% center", "200% center"] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    >Real-time Updates.</motion.div>
                    <div className="text-[#86868b] text-lg font-medium leading-snug max-w-sm">All calculations happen instantly on your device, giving you immediate feedback as you adjust your goals.</div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                  >
                    <div className="text-white font-semibold text-8xl md:text-[7rem] tracking-tighter leading-none mb-4">100<span className="text-5xl md:text-7xl text-white/40 tracking-tight">%</span></div>
                    <motion.div 
                      className="text-transparent bg-clip-text font-semibold text-2xl tracking-tight mb-2" 
                      style={{ backgroundImage: "linear-gradient(to right, #3b82f6, #93c5fd, #e0f2fe, #93c5fd, #3b82f6)", backgroundSize: "200% auto" }}
                      animate={{ backgroundPosition: ["0% center", "200% center"] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    >Predictive Accuracy.</motion.div>
                    <div className="text-[#86868b] text-lg font-medium leading-snug max-w-sm">Mathematically tied to the latest institutional grading frameworks so you can trust every calculation.</div>
                  </motion.div>
                </div>

              </div>

            </div>

            {/* RIGHT PANE: Statutory Matrix */}
            <div className="flex-[2] min-w-[320px] relative z-10 w-full">
            {/* RIGHT: Statutory Matrix */}
            <div className="w-full relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CalculationBreakdown
                  preset={preset!}
                  subjects={derivationSubjects}
                  type="sgpa"
                />

                {/* Apple-style statutory footnotes */}
                <div className="mt-10 pt-8 border-t border-white/5 flex flex-col gap-3">
                  <p className="text-[11px] md:text-xs text-gray-500 leading-relaxed font-medium">
                    <span className="text-gray-400">1. Projections vs Official Records:</span> These projections are highly accurate planning tools based on official formulas. However, they are for your personal guidance and do not serve as official or legally binding academic records.
                  </p>
                  <p className="text-[11px] md:text-xs text-gray-500 leading-relaxed font-medium">
                    <span className="text-gray-400">2. Localized Calculations:</span> The instant (0ms) calculations happen directly on your device. Saving your sandbox scenario will briefly use your network to store the plan securely.
                  </p>
                  <p className="text-[11px] md:text-xs text-gray-500 leading-relaxed font-medium">
                    <span className="text-gray-400">3. Curriculum Sync:</span> The accuracy of these calculations depends on ensuring your courses and credits match your institution's official syllabus for your academic year.
                  </p>
                </div>
              </motion.div>
            </div>
            </div>

          </div>

        </WorkspaceSection>

      </WorkspaceContent>
    </>

  );
}
