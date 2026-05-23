"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { Plus, Save, ArrowRight, RotateCcw, Activity, Calculator, ChevronDown, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useUSMStore, CourseState } from "@/stores/usmStore";
import { resolveActiveAcademicContext } from "@/stores/selectors/academic";
import PageContainer from "@/components/layout/PageContainer";
import Grid from "@/components/layout/Grid";
import Input from "@/components/ui/Input";
import CalculationBreakdown from "@/components/CalculationBreakdown";
import AnimatedCounter from "@/components/AnimatedCounter";
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
        onClick={() => setIsOpen(!isOpen)}
        className={`w-20 h-9 bg-white/[0.04] border ${isOpen ? 'border-[#4F8EF7]' : 'border-white/10'} text-white font-bold px-3 rounded-xl outline-none transition-all cursor-pointer hover:bg-white/[0.08] flex items-center justify-between gap-1 shadow-inner`}
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
            className="absolute bottom-full mb-2 w-24 left-1/2 -translate-x-1/2 bg-[#0F172A]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-[100] overflow-y-auto overflow-x-hidden py-1 max-h-48 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            <button
              onClick={() => { onChange(""); setIsOpen(false); }}
              className={`w-full text-center px-4 py-2 text-sm font-bold transition-colors ${value === "" ? 'bg-[#4F8EF7]/20 text-[#4F8EF7]' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
            >
              -
            </button>
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setIsOpen(false); }}
                className={`w-full text-center px-4 py-2 text-sm font-bold transition-colors ${value === opt ? 'bg-[#4F8EF7]/20 text-[#4F8EF7]' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
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

export default function CalculatorPage() {
  const store = useUSMStore();
  const context = resolveActiveAcademicContext(store);
  const preset = getPresetById(context.presetId) || getPresetById("sppu");

  const [simulatedCourses, setSimulatedCourses] = useState<SimulatedCourse[]>(context.activeCourses);
  const [hasChanges, setHasChanges] = useState(false);
  
  useEffect(() => {
    if (!hasChanges) {
      setSimulatedCourses(context.activeCourses);
    }
  }, [context.activeCourses, hasChanges]);

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

  const derivationSubjects = simulatedCourses
    .filter(c => c.grade && c.grade !== "")
    .map(c => ({
      name: c.name,
      credits: c.credits,
      grade: c.grade!,
      gradePoint: convertLetterGradeToGradePoint(c.grade!, preset!)
    }));

  const calculatedSGPA = calculateSGPA(derivationSubjects);

  const currentEarnedPoints = (context.metrics.cgpa || 0) * (context.academic.earnedCredits || 0);
  const simulatedCredits = derivationSubjects.reduce((acc, c) => acc + c.credits, 0);
  const simulatedPoints = derivationSubjects.reduce((acc, c) => acc + (c.credits * c.gradePoint), 0);
  
  const projectedTotalCredits = (context.academic.earnedCredits || 0) + simulatedCredits;
  const projectedCGPA = projectedTotalCredits > 0 
    ? (currentEarnedPoints + simulatedPoints) / projectedTotalCredits 
    : 0;

  return (
    <div className="w-full relative pb-24 min-h-screen">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[80vw] h-[80vh] bg-[#4F8EF7]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[50vw] h-[50vh] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 flex flex-col xl:flex-row gap-8 relative z-10 pt-8">
        
        {/* =======================================
            LEFT PANE: The Sticky HUD / Command Center
            ======================================= */}
        <div className="xl:w-[35%] flex flex-col gap-6 xl:sticky xl:top-28 h-fit pb-8">
          
          {/* Main Title Card */}
          <div className="bg-[#0B0F19]/80 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity className="w-40 h-40 text-[#4F8EF7]" />
            </div>
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <span className="w-2 h-2 rounded-full bg-[#4F8EF7] animate-pulse shadow-[0_0_10px_#4F8EF7]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4F8EF7]">Active Workspace</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight relative z-10">Semester Simulator</h1>
            <p className="text-sm text-white/40 mt-2 font-medium leading-relaxed relative z-10">
              Manipulate individual course expectations below to project your final standing for <strong className="text-white/80">{(context.identity.studentIdentity as any)?.name || 'Student'}</strong>.
            </p>
          </div>

          {/* Glowing Radial SGPA Dial Card */}
          <div className="bg-gradient-to-b from-[#0B0F19] to-black border border-white/5 rounded-[2rem] p-8 flex flex-col items-center justify-center relative shadow-[0_20px_60px_-15px_rgba(79,142,247,0.1)]">
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* SVG Radial Progress */}
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                <motion.circle 
                  cx="50" cy="50" r="45" fill="none" stroke="#4F8EF7" strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="282.7" 
                  initial={{ strokeDashoffset: 282.7 }}
                  animate={{ strokeDashoffset: 282.7 - (282.7 * (calculatedSGPA / (preset?.gradeScale[0]?.points || 10))) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="drop-shadow-[0_0_15px_rgba(79,142,247,0.6)]"
                />
              </svg>
              
              {/* Inner Counter */}
              <div className="absolute flex flex-col items-center justify-center w-full h-full">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4F8EF7] mb-1">Simulated SGPA</span>
                <AnimatedCounter target={calculatedSGPA} decimals={2} className="text-6xl font-black text-white tracking-tighter" />
                <span className="text-[10px] font-bold text-white/30 mt-1 uppercase tracking-widest">out of {preset?.gradeScale[0]?.points || 10}.0</span>
              </div>
            </div>
          </div>

          {/* Secondary Stats Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0B0F19]/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 flex flex-col justify-center shadow-lg">
              <span className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-black mb-1">Projected CGPA</span>
              <AnimatedCounter target={projectedCGPA} decimals={2} className="text-3xl font-bold text-white tracking-tight" />
            </div>
            <div className="bg-[#0B0F19]/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 flex flex-col justify-center shadow-lg">
              <span className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-black mb-1">Attempted Credits</span>
              <div className="text-3xl font-mono font-bold text-white tracking-tight">{simulatedCredits}</div>
            </div>
          </div>

          {/* Actions Pane */}
          <div className="flex gap-4">
            {hasChanges && (
              <button 
                onClick={handleReset}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] text-white/70 hover:text-white transition-all flex items-center justify-center shadow-lg"
              >
                <RotateCcw size={20} />
              </button>
            )}
            <button 
              onClick={handleSaveSandbox}
              className="flex-1 py-4 bg-gradient-to-r from-[#4F8EF7] to-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-[0_0_30px_rgba(79,142,247,0.3)] hover:shadow-[0_0_40px_rgba(79,142,247,0.5)] transition-all flex items-center justify-center gap-2"
            >
              <Save size={16} /> Save Sandbox State
            </button>
          </div>
        </div>


        {/* =======================================
            RIGHT PANE: The Bento Grid Subject Ledger
            ======================================= */}
        <div className="xl:w-[65%] flex flex-col gap-6">
          
          <div className="flex justify-between items-center bg-[#0B0F19]/60 backdrop-blur-xl border border-white/5 px-6 py-4 rounded-2xl shadow-xl shrink-0 mt-2">
            <div className="flex items-center gap-3">
              <Calculator className="text-[#4F8EF7] w-5 h-5" />
              <span className="font-bold text-white tracking-tight">Course Ledger Overview</span>
            </div>
            <button 
              onClick={handleAddTemporary} 
              className="text-[10px] font-black uppercase tracking-widest text-[#4F8EF7] bg-[#4F8EF7]/10 px-4 py-2 rounded-xl hover:bg-[#4F8EF7]/20 border border-[#4F8EF7]/20 transition-all flex items-center gap-1"
            >
              <Plus size={12} /> Add Course
            </button>
          </div>

          {/* MASONRY BENTO GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {simulatedCourses.map((course, idx) => (
                <motion.div 
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ delay: idx * 0.05, type: "spring", stiffness: 300, damping: 25 }}
                  style={{ zIndex: simulatedCourses.length - idx }}
                  className="relative"
                >
                  <div className={`bg-[#0B0F19]/80 backdrop-blur-lg border-t border-t-white/10 rounded-2xl p-5 flex flex-col h-[180px] shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5)] transition-colors group ${course.isTemporary ? 'border-[#4F8EF7]/30 border-l border-r border-b' : 'border-white/5 hover:border-white/20 border-l border-r border-b'}`}>
                    
                    {/* Top Row: Code & Credits */}
                    <div className="flex justify-between items-start mb-3 gap-2">
                      {course.isTemporary ? (
                         <input 
                            value={course.code} 
                            onChange={(e) => handleUpdateTemp(course.id, 'code', e.target.value)}
                            className="bg-transparent border-b border-[#4F8EF7]/30 text-[10px] text-[#4F8EF7] font-mono h-6 px-1 shadow-none w-20 uppercase placeholder:text-[#4F8EF7]/50 outline-none focus:border-[#4F8EF7]"
                            placeholder="CODE"
                         />
                      ) : (
                         <span className="text-[10px] font-mono text-white/30 tracking-widest uppercase bg-white/[0.03] px-2 py-1 rounded-md border border-white/[0.05]">
                           {course.code}
                         </span>
                      )}

                      {course.isTemporary ? (
                         <input 
                           type="number"
                           value={course.credits}
                           onChange={(e) => handleUpdateTemp(course.id, 'credits', parseInt(e.target.value) || 0)}
                           className="w-12 text-center font-mono font-bold bg-[#4F8EF7]/10 text-[#4F8EF7] border border-[#4F8EF7]/30 text-[10px] h-6 px-1 rounded-md outline-none focus:border-[#4F8EF7] [&::-webkit-inner-spin-button]:appearance-none"
                         />
                      ) : (
                         <span className="bg-[#4F8EF7]/10 px-2 py-1 rounded-md text-[10px] font-bold text-[#4F8EF7] border border-[#4F8EF7]/20">
                           {course.credits} CR
                         </span>
                      )}
                    </div>

                    {/* Middle Row: Name */}
                    {course.isTemporary ? (
                       <textarea 
                          value={course.name} 
                          onChange={(e) => handleUpdateTemp(course.id, 'name', e.target.value)}
                          className="bg-transparent border-b border-transparent focus:border-[#4F8EF7]/30 text-white font-bold text-sm resize-none outline-none w-full shadow-none placeholder:text-white/30 flex-1 py-1 transition-colors"
                          placeholder="New Course Name..."
                       />
                    ) : (
                       <h3 className="text-sm font-bold text-white/90 leading-snug line-clamp-3 overflow-hidden pr-2">
                         {course.name}
                       </h3>
                    )}

                    {/* Bottom Row: Grade Selector */}
                    <div className="mt-auto flex items-center justify-between border-t border-white/[0.05] pt-3 relative">
                      <span className="text-[9px] font-black uppercase text-white/30 tracking-widest flex items-center gap-1">
                        <CheckCircle2 size={10} className="text-white/20" /> Expected
                      </span>
                      <GradeDropdown 
                        value={course.grade || ""} 
                        onChange={(val) => handleUpdateTemp(course.id, 'grade', val)}
                        options={gradeScale.filter(g => g.grade !== "F").map(g => g.grade)}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Statutory Breakdown Modal/Section at the bottom of the scroll view */}
          {calculatedSGPA > 0 && (
             <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 relative z-10"
             >
                <CalculationBreakdown 
                  preset={preset!}
                  subjects={derivationSubjects}
                  type="sgpa"
                />
             </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
