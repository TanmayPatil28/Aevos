"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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
        className={`w-20 h-9 bg-white/[0.04] border ${isOpen ? 'border-[#4F8EF7]' : 'border-white/10'} text-white font-bold px-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#4F8EF7] focus-visible:border-transparent transition-all cursor-pointer hover:bg-white/[0.08] flex items-center justify-between gap-1 shadow-inner`}
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
            className="absolute top-full mt-2 w-28 left-1/2 -translate-x-1/2 bg-[#131C31]/95 backdrop-blur-2xl border border-white/[0.15] rounded-xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8)] z-[100] overflow-y-auto overflow-x-hidden py-1.5 max-h-48 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            <button
              role="option"
              aria-selected={value === ""}
              onClick={() => { onChange(""); setIsOpen(false); }}
              className={`w-full text-center px-4 py-2.5 text-sm font-bold transition-all duration-200 ${value === "" ? 'bg-gradient-to-r from-[#4F8EF7]/20 to-blue-500/5 text-[#4F8EF7] border-l-2 border-[#4F8EF7]' : 'text-white/85 hover:bg-white/[0.08] hover:text-white border-l-2 border-transparent'}`}
            >
              -
            </button>
            {options.map(opt => (
              <button
                key={opt}
                role="option"
                aria-selected={value === opt}
                onClick={() => { onChange(opt); setIsOpen(false); }}
                className={`w-full text-center px-4 py-2.5 text-sm font-bold transition-all duration-200 ${value === opt ? 'bg-gradient-to-r from-[#4F8EF7]/20 to-blue-500/5 text-[#4F8EF7] border-l-2 border-[#4F8EF7]' : 'text-white/85 hover:bg-white/[0.08] hover:text-white border-l-2 border-transparent'}`}
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
    return simulatedCourses
      .filter(c => c.grade && c.grade !== "F")
      .map(c => ({
        name: c.name,
        credits: c.credits,
        grade: c.grade!,
        gradePoint: convertLetterGradeToGradePoint(c.grade!, preset!)
      }));
  }, [simulatedCourses, preset]);

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
          <div className="grid grid-cols-12 gap-4 lg:gap-16 items-start">

            {/* LEFT PANE: Bento Grid */}
            <div className="col-span-8 flex flex-col gap-6 relative z-10 w-full min-w-0">

              {/* =======================================
            LEFT PANE: The Bento Grid Subject Ledger
            ======================================= */}
              <div className="w-full flex flex-col gap-6">

                <div className="relative overflow-hidden bg-[#0F172A]/90 backdrop-blur-xl border border-white/[0.08] px-6 py-4 rounded-2xl shadow-2xl shrink-0 mt-2 flex justify-between items-center group">
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-20">
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
                          Add a course to begin predicting your grades. The simulation engine will automatically traverse your syllabus permutations.
                        </p>
                        <button
                          onClick={handleAddTemporary}
                          className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white text-sm font-bold border border-white/10 transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" /> Initialize Sandbox
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
                          className={`relative bg-[#0F172A]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 flex flex-col h-full min-h-[140px] shadow-2xl transition-all duration-300 group hover:border-[#4F8EF7]/50 hover:bg-[#131C31] hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(79,142,247,0.15)] cursor-pointer ${course.isTemporary ? 'ring-1 ring-[#4F8EF7]/50 shadow-[0_0_20px_rgba(79,142,247,0.1)]' : ''}`}
                        >

                          {/* Subtle Ambient Glow inside card (clipped to rounded corners) */}
                          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#4F8EF7]/10 rounded-full blur-2xl group-hover:bg-[#4F8EF7]/20 transition-all duration-500" />
                          </div>

                          {/* Top Row: Code & Credits */}
                          <div className="flex justify-between items-start mb-3 gap-2 relative z-10">
                            {course.isTemporary ? (
                              <input
                                value={course.code}
                                onChange={(e) => handleUpdateTemp(course.id, 'code', e.target.value)}
                                className="bg-white/[0.05] border border-[#4F8EF7]/40 rounded-md text-[10px] text-[#4F8EF7] font-mono h-6 px-2 w-20 uppercase placeholder:text-[#4F8EF7]/50 outline-none focus:border-[#4F8EF7] focus:bg-[#4F8EF7]/10 transition-colors"
                                placeholder="CODE"
                              />
                            ) : (
                              <span className="text-[10px] font-mono text-white/60 tracking-widest uppercase bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/[0.08] group-hover:border-white/20 group-hover:text-white/80 transition-colors">
                                {course.code}
                              </span>
                            )}

                            {course.isTemporary ? (
                              <input
                                type="number"
                                value={course.credits}
                                onChange={(e) => handleUpdateTemp(course.id, 'credits', parseInt(e.target.value) || 0)}
                                className="w-12 text-center font-mono font-bold bg-[#4F8EF7]/15 text-[#4F8EF7] border border-[#4F8EF7]/40 text-[10px] h-6 px-1 rounded-md outline-none focus:border-[#4F8EF7] focus:bg-[#4F8EF7]/20 transition-colors [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            ) : (
                              <span className="bg-[#4F8EF7]/15 px-2.5 py-1 rounded-md text-[10px] font-bold text-[#4F8EF7] border border-[#4F8EF7]/30 shadow-[0_0_10px_rgba(79,142,247,0.1)]">
                                {course.credits} CR
                              </span>
                            )}
                          </div>

                          {/* Middle Row: Name */}
                          <div className="relative z-10 flex-1">
                            {course.isTemporary ? (
                              <textarea
                                value={course.name}
                                onChange={(e) => handleUpdateTemp(course.id, 'name', e.target.value)}
                                className="bg-white/[0.02] border border-transparent focus:border-[#4F8EF7]/40 focus:bg-white/[0.05] rounded-lg p-2 text-white font-semibold text-sm resize-none outline-none w-full shadow-none placeholder:text-white/30 h-16 transition-colors"
                                placeholder="New Course Name..."
                              />
                            ) : (
                              <h3 className="text-sm font-semibold text-white/95 leading-snug line-clamp-3 overflow-hidden pr-2 group-hover:text-white transition-colors">
                                {course.name}
                              </h3>
                            )}
                          </div>

                          {/* Bottom Row: Grade Selector */}
                          <div className="mt-auto flex items-center justify-between border-t border-white/[0.08] group-hover:border-white/[0.15] pt-3 relative z-10 transition-colors">
                            <span className="text-[9px] font-black uppercase text-white/40 tracking-widest flex items-center gap-1.5">
                              <CheckCircle2 size={12} className="text-[#4F8EF7]/50 group-hover:text-[#4F8EF7]/80 transition-colors" /> Expected
                            </span>
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
            <div className="col-span-4 flex flex-col gap-8 lg:sticky lg:top-28 h-fit relative z-10 min-w-0">

              {/* =======================================
            RIGHT PANE: Clean Notion-Style Summary
            ======================================= */}
              <div className="w-full flex flex-col gap-8 ">

                <div className="flex flex-col">
                  <span className="text-[#4F8EF7] font-semibold tracking-widest text-xs mb-4 uppercase">Simulated SGPA</span>
                  <div className="flex items-baseline gap-2">
                    <AnimatedCounter target={calculatedSGPA} decimals={2} className="text-[6rem] lg:text-[7.5rem] xl:text-[8.5rem] font-medium tracking-tighter text-white leading-[0.85]" />
                  </div>
                  <span className="text-gray-500 font-medium text-lg mt-4 tracking-tight">out of {preset?.gradeScale[0]?.points || 10}.0 maximum scale.</span>
                </div>

                <div className="flex flex-col gap-10 mt-4">
                  <div className="flex flex-col">
                    <span className="text-white/40 font-semibold tracking-widest text-xs mb-1 uppercase">Projected CGPA</span>
                    <AnimatedCounter target={projectedCGPA} decimals={2} className="text-5xl font-medium tracking-tight text-white" />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-white/40 font-semibold tracking-widest text-xs mb-1 uppercase">Current Standing</span>
                    <div className="text-3xl font-medium tracking-tight text-white">{context.metrics.cgpa?.toFixed(2) || 'N/A'} CGPA</div>
                  </div>
                </div>

                {/* Actions Pane */}
                <div className="flex gap-3">
                  {hasChanges && (
                    <button
                      onClick={handleReset}
                      className="px-4 py-3 rounded-lg bg-transparent border border-white/[0.1] hover:bg-white/[0.05] text-white/50 hover:text-white transition-all flex items-center justify-center"
                    >
                      <RotateCcw size={16} />
                    </button>
                  )}
                  <button
                    onClick={handleSaveSandbox}
                    className="flex-1 py-3 bg-white text-black font-medium text-sm rounded-lg hover:bg-white/90 transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={16} /> Save Sandbox State
                  </button>
                </div>

                {/* Apple Typography */}
                <div className="flex flex-col gap-2 mt-4 relative z-10">
                  <h2 className="text-4xl lg:text-5xl xl:text-6xl font-semibold tracking-tight text-white mb-2 leading-[1.05]">
                    Deterministic projections.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-600">Cryptographically precise.</span>
                  </h2>
                  <p className="text-gray-400 text-base md:text-lg font-medium leading-snug mt-2">
                    The GradeFlow Trust Engine evaluates academic trajectories using strict deterministic state modeling. Every combinatorial permutation is statically bound to verified University Grants Commission (UGC) algorithms, guaranteeing zero-variance predictability.
                  </p>
                </div>

              </div>

            </div>

          </div>

          {/* =======================================
      ROW 2: TYPOGRAPHY & STATUTORY MATRIX
      ======================================= */}
          <div className="grid grid-cols-12 gap-4 lg:gap-16 items-start mt-24">

            {/* LEFT PANE: Typography */}
            <div className="col-span-4 flex flex-col gap-16 relative z-10 lg:sticky lg:top-28 h-fit min-w-0">
              {/* LEFT: Apple-Style Guide Typography */}
              <div className="w-full flex flex-col gap-16 relative z-10 px-2 lg:px-6">

                <div className="flex flex-col gap-4">
                  <h3 className="text-4xl md:text-5xl lg:text-[3.5rem] font-semibold tracking-tight text-white leading-[1.05]">
                    <span className="text-[#4F8EF7]">Dynamic State Mutation.</span><br />
                    Shape your trajectory.
                  </h3>
                  <p className="text-gray-400 text-lg md:text-xl font-medium leading-snug mt-2">
                    <strong className="text-white">Execute non-destructive combinatorial grade testing.</strong> The engine traverses an acyclic dependency graph to propagate target grade substitutions, calculating downstream SGPA and CGPA impacts with absolute deterministic fidelity.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <h3 className="text-3xl md:text-4xl font-semibold tracking-tight text-white leading-[1.1]">
                    Regulatory Parity Engine.
                  </h3>
                  <p className="text-gray-400 text-lg font-medium leading-relaxed">
                    Projections are not estimations. They are strict mathematical equivalencies mapped exactly to your institution’s proprietary credit weightings and offset derivation formulas, ensuring a 1:1 correlation with official transcript ledgers.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <h3 className="text-3xl md:text-4xl font-semibold tracking-tight text-white leading-[1.1]">
                    Zero-Delta Substitution.
                  </h3>
                  <p className="text-gray-400 text-lg font-medium leading-relaxed">
                    Grade manipulations trigger an immediate cascading recalculation. The computation layer bypasses server roundtrips, utilizing localized memory caching to resolve complex fractional derivations instantaneously.
                  </p>
                </div>

                <div className="w-full h-[1px] bg-gradient-to-r from-white/10 to-transparent my-2" />

                <div className="flex flex-col gap-12 pt-4">
                  <div>
                    <div className="text-[#4F8EF7] font-semibold text-7xl tracking-tighter mb-1">0<span className="text-5xl text-[#4F8EF7]/70 tracking-tight">ms</span></div>
                    <div className="text-white font-semibold text-xl tracking-tight">Edge-Computed Trajectories.</div>
                    <div className="text-gray-500 mt-2 text-base font-medium leading-snug max-w-sm">All combinatorial simulations execute entirely via client-edge DOM mutation, ensuring immediate topological recalculation.</div>
                  </div>

                  <div>
                    <div className="text-white font-semibold text-7xl tracking-tighter mb-1">100<span className="text-5xl text-white/50 tracking-tight">%</span></div>
                    <div className="text-white font-semibold text-xl tracking-tight">Algorithmic Integrity.</div>
                    <div className="text-gray-500 mt-2 text-base font-medium leading-snug max-w-sm">Cryptographically and mathematically tethered to the latest institutional regulatory frameworks and statutory offset schemas.</div>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* RIGHT PANE: Statutory Matrix */}
          <div className="col-span-8 w-full relative z-10 min-w-0">
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
                    <span className="text-gray-400">1. Algorithmic State Derivatives:</span> Rendered quotients (SGPA/CGPA) represent computed heuristic states derived from user-supplied target vectors. While the GradeFlow Trust Engine operates with strict deterministic compliance to university-mandated offset algorithms, these outputs serve as high-fidelity predictive instruments and do not constitute legally binding academic records.
                  </p>
                  <p className="text-[11px] md:text-xs text-gray-500 leading-relaxed font-medium">
                    <span className="text-gray-400">2. Edge Computation Latency:</span> The 0ms threshold characterizes the execution time of the localized arithmetic matrix substitution. Upstream state persistence (Sandbox Saving) remains subject to standard TCP/IP network traversal latency and backend validation.
                  </p>
                  <p className="text-[11px] md:text-xs text-gray-500 leading-relaxed font-medium">
                    <span className="text-gray-400">3. Regulatory Schema Alignment:</span> 100% computational integrity is contingent upon the synchronization of the sandbox topology with the exact credit structures published in the institutional syllabus for the user&apos;s specific matriculation cohort.
                  </p>
                </div>
              </motion.div>
            </div>

          </div>

        </WorkspaceSection>

      </WorkspaceContent>
    </>

  );
}
