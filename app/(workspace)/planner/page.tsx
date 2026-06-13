"use client";

import Link from "next/link";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { DraggableNumberInput } from "@/components/ui/DraggableNumberInput";
import { toast } from "sonner";
import { calculateRequiredGPA, getDifficultyLevel, sgpaToPercentage as calcSgpaToPercentage } from "@/lib/presets";
import { useUniversity } from "@/components/providers/UniversityProvider";
import AnimatedCounter from "@/components/AnimatedCounter";
import { Plus, Target, ShieldAlert, ArrowRight, X, ChevronUp, ChevronDown } from "lucide-react";

import CareerHubModule from "@/components/planner/CareerHubModule";
import AcademicOptimizerModule from "@/components/planner/AcademicOptimizerModule";
import AttendanceIntelligenceModule from "@/components/planner/AttendanceIntelligenceModule";
import BacklogRecoveryModule from "@/components/planner/BacklogRecoveryModule";
import ProfileOptimizerModule from "@/components/planner/ProfileOptimizerModule";
import EmotionalIntelligenceBoard from "@/components/planner/EmotionalIntelligenceBoard";
import ScenarioSimulator from "@/components/planner/ScenarioSimulator";

// Apple-style fade-in text component
function FadeText({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.span>
  );
}

const MODULES = [
  {
    id: "optimizer",
    name: "Academic Optimizer",
    shortName: "Optimizer",
    desc: "Predictive path generation & risk assessment.",
    component: AcademicOptimizerModule,
  },
  {
    id: "attendance",
    name: "Attendance Predictor",
    shortName: "Attendance",
    desc: "Calculate safe bunks & recovery thresholds.",
    component: AttendanceIntelligenceModule,
  },
  {
    id: "backlog",
    name: "Backlog Recovery Engine",
    shortName: "Backlog",
    desc: "Clearance roadmaps and re-registration limits.",
    component: BacklogRecoveryModule,
  },
  {
    id: "brand",
    name: "Brand Optimizer",
    shortName: "Brand",
    desc: "LinkedIn & GitHub profile generators.",
    component: ProfileOptimizerModule,
  },
  {
    id: "career",
    name: "Career Intelligence",
    shortName: "Career",
    desc: "Placement eligibility & structured skill roadmaps.",
    component: CareerHubModule,
  },
  {
    id: "emotional",
    name: "Emotional Board",
    shortName: "EQ Board",
    desc: "Mental health tracking and burnout prevention.",
    component: EmotionalIntelligenceBoard,
  },
  {
    id: "scenario",
    name: "Scenario Simulator",
    shortName: "Scenarios",
    desc: "Test what-if grades and future predictions.",
    component: ScenarioSimulator,
  }
];

const FetchedDisplay = ({ label, value, decimals = 1, showFetched = true }: { label: string; value: number; decimals?: number, showFetched?: boolean }) => (
  <div className="flex flex-col relative p-5 bg-[#1D1D1F] border border-white/5 rounded-[1.5rem] shadow-none cursor-not-allowed">
    <span className="font-bold tracking-[0.2em] text-[10px] uppercase mb-2 text-white/40 flex items-center justify-between">
      {label}
      {showFetched && <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full tracking-wider border border-blue-500/20">FETCHED</span>}
    </span>
    <div className="text-4xl md:text-5xl font-black text-white/60 tracking-tighter">
      {value.toFixed(decimals)}
    </div>
  </div>
);

const ManualNumberInput = ({ label, value, onChange, min, max, step, decimals = 2 }: any) => {
  return (
    <div className="flex flex-col relative p-5 bg-[#1D1D1F] border border-white/10 hover:border-white/20 transition-colors rounded-[1.5rem] shadow-none focus-within:border-blue-500/50">
      <span className="font-bold tracking-[0.2em] text-[10px] uppercase mb-2 text-blue-400 flex items-center justify-between">
        {label}
        <span className="material-symbols-outlined text-[14px]">edit</span>
      </span>
      <input 
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min} max={max} step={step}
        className="text-4xl md:text-5xl font-black text-white tracking-tighter bg-transparent outline-none w-full focus:ring-0 p-0 m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </div>
  );
};

export default function PlannerPage() {
  const { activePreset, maxGradePoint } = useUniversity();
  
  // -- Sandbox State --
  const [currentCGPA, setCurrentCGPA] = useState<number>(7.00);
  const [completedSemesters, setCompletedSemesters] = useState<number>(3);
  const [totalCredits, setTotalCredits] = useState<number>(60);
  const [targetCGPA, setTargetCGPA] = useState<number>(8.50);
  const [remainingSemesters, setRemainingSemesters] = useState<number>(5);
  const [creditsPerSemester, setCreditsPerSemester] = useState<number>(20);

  // -- Pill Explorer State --
  const [activeModule, setActiveModule] = useState<string | null>(null);

  const handlePrevModule = () => {
    if (!activeModule) {
      setActiveModule(MODULES[MODULES.length - 1].id);
      return;
    }
    const currentIndex = MODULES.findIndex(m => m.id === activeModule);
    if (currentIndex > 0) {
      setActiveModule(MODULES[currentIndex - 1].id);
    }
  };

  const handleNextModule = () => {
    if (!activeModule) {
      setActiveModule(MODULES[0].id);
      return;
    }
    const currentIndex = MODULES.findIndex(m => m.id === activeModule);
    if (currentIndex < MODULES.length - 1) {
      setActiveModule(MODULES[currentIndex + 1].id);
    }
  };

  // -- Keyboard Navigation --
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrevModule();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNextModule();
      } else if (e.key === 'Escape') {
        setActiveModule(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModule]);

  const currentIndex = activeModule ? MODULES.findIndex(m => m.id === activeModule) : -1;
  const isFirstModule = currentIndex === 0;
  const isLastModule = currentIndex === MODULES.length - 1;

  const result = useMemo(() => {
    if (!activePreset) return null;
    const completedCredits = completedSemesters * creditsPerSemester;
    const remainingCredits = remainingSemesters * creditsPerSemester;
    
    const reqGPA = calculateRequiredGPA(
      targetCGPA,
      currentCGPA,
      completedCredits,
      remainingCredits
    );
    
    return {
      requiredGPA: reqGPA,
      gap: targetCGPA - currentCGPA,
      isImpossible: reqGPA > maxGradePoint,
      difficulty: getDifficultyLevel(reqGPA, activePreset),
      totalCredits: completedCredits,
      remainingSems: remainingSemesters,
      creditsPerSem: creditsPerSemester
    };
  }, [currentCGPA, completedSemesters, targetCGPA, remainingSemesters, creditsPerSemester, activePreset, maxGradePoint]);

  const isValidTarget = targetCGPA > 0;

  return (
    <div className="w-full relative min-h-screen bg-black overflow-x-hidden selection:bg-white/20 selection:text-white pb-32 pt-24 px-6 md:px-12 lg:px-24">
      
      {/* PHASE 1: CORE SANDBOX (Calculator Split Layout) */}
      <div className="max-w-[1400px] mx-auto w-full flex flex-wrap gap-12 lg:gap-24 items-start relative z-10">
        
        {/* LEFT COLUMN: Inputs */}
        <div className="flex-[2] min-w-[320px] max-w-4xl flex flex-col gap-16">
          <motion.div 
            className="flex flex-col"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-[4rem] font-semibold tracking-tight leading-[1.05] mb-4 text-transparent bg-clip-text bg-gradient-to-br from-[#E0F2FE] to-[#7DD3FC]">
              Safe. Balanced. Aggressive.<br/>
              Pick your strategy.
            </h1>
            <p className="text-lg md:text-xl text-[#A1A1AA] font-medium max-w-2xl leading-[1.4] tracking-tight">
              Our most advanced simulation engine. Adjust your trajectory and we instantly map out the exact path to your academic goals.
            </p>
          </motion.div>

          <div className="flex flex-col gap-10 border-t border-white/20 pt-10">
            {/* Context */}
            <motion.div 
              className="flex flex-col gap-6"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
            >
              <span className="text-white/40 font-bold tracking-[0.2em] text-[10px] uppercase">Academic Context</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FetchedDisplay
                  label="Current CGPA"
                  value={currentCGPA}
                  decimals={2}
                />
                <FetchedDisplay
                  label="Completed Semesters"
                  value={completedSemesters}
                  decimals={1}
                />
              </div>
            </motion.div>

            <div className="w-full h-px bg-white/10" />

            {/* Target */}
            <motion.div 
              className="flex flex-col gap-6"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
            >
              <span className="text-white/40 font-bold tracking-[0.2em] text-[10px] uppercase">The Goal</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ManualNumberInput
                  label="Target CGPA"
                  value={targetCGPA}
                  onChange={setTargetCGPA}
                  min={0}
                  max={maxGradePoint}
                  step={0.01}
                />
                <FetchedDisplay
                  label="Remaining Semesters"
                  value={remainingSemesters}
                  decimals={1}
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* RIGHT COLUMN: Results Sticky */}
        <div className="flex-1 min-w-[320px] flex flex-col gap-12 lg:sticky lg:top-32 h-fit relative z-10 w-full pt-10 border-t border-t border-white/20 lg:border-t-0 lg:border-l lg:border-white/20 lg:pl-16 lg:pt-0">
          <AnimatePresence mode="wait">
            {!isValidTarget || !result ? (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col opacity-30"
              >
                <span className="text-white/50 font-black tracking-[0.3em] text-[10px] mb-6 uppercase">Required Each Sem</span>
                <div className="text-[6rem] lg:text-[7rem] xl:text-[9rem] font-semibold tracking-tighter text-white leading-[0.8]">—</div>
                <span className="text-white/40 font-medium text-lg mt-6 tracking-tight">Set a target CGPA above your current to see results.</span>
              </motion.div>
            ) : (
              <motion.div 
                key="results"
                initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className="flex flex-col"
              >
                <span className="text-white/50 font-black tracking-[0.3em] text-[10px] mb-6 uppercase">Required Each Sem</span>
                <AnimatedCounter target={result.requiredGPA} decimals={2} className={`text-[6rem] lg:text-[7rem] xl:text-[9rem] font-semibold tracking-tighter leading-[0.8] ${result.isImpossible ? 'text-red-500' : 'text-white'}`} />
                <span className="text-white/40 font-medium text-lg mt-6 tracking-tight">out of {maxGradePoint}.0 maximum scale.</span>
              
              <div className="flex flex-col w-full border-t border-white/20 pt-8 gap-8 mt-12">
                <div className="flex flex-col">
                  <span className="text-white/40 font-bold tracking-[0.2em] text-[10px] mb-3 uppercase">CGPA Gap</span>
                  <AnimatedCounter target={result.gap} decimals={2} className="text-4xl font-semibold tracking-tighter text-white" />
                </div>
                
                <div className="w-full h-px bg-white/20" />

                <div className="flex flex-col">
                  <span className="text-white/40 font-bold tracking-[0.2em] text-[10px] mb-3 uppercase">Difficulty</span>
                  <span className="text-4xl font-semibold tracking-tighter text-white">{result.difficulty.label}</span>
                </div>
              </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* PHASE 2: APPLE PILL EXPLORER */}
      <motion.div 
        className="max-w-[1400px] mx-auto w-full mt-40 border-t border-white/20 pt-32 mb-32"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
      >
        <div className="relative w-full flex flex-col lg:flex-row gap-10 min-h-[600px]">
          
          {/* SCROLL ARROWS & LEFT COLUMN WRAPPER */}
          <div className="w-full lg:w-fit flex gap-6 relative z-10 items-start">
            
            {/* NAVIGATION ARROWS (Left of pills) */}
            <div className="hidden lg:flex flex-col gap-3 pt-6 sticky top-0">
              <button 
                onClick={handlePrevModule}
                disabled={isFirstModule}
                className={`w-[38px] h-[38px] rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 group ${isFirstModule ? 'bg-[#1d1d1f]/50 text-white/20 cursor-not-allowed' : 'bg-[#1d1d1f] hover:bg-[#2d2d2f] text-white/50 hover:text-white'}`}
              >
                <ChevronUp size={20} className={!isFirstModule ? "group-hover:-translate-y-0.5 transition-transform" : ""} />
              </button>
              <button 
                onClick={handleNextModule}
                disabled={isLastModule}
                className={`w-[38px] h-[38px] rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 group ${isLastModule ? 'bg-[#1d1d1f]/50 text-white/20 cursor-not-allowed' : 'bg-[#1d1d1f] hover:bg-[#2d2d2f] text-white/50 hover:text-white'}`}
              >
                <ChevronDown size={20} className={!isLastModule ? "group-hover:translate-y-0.5 transition-transform" : ""} />
              </button>
            </div>

            {/* PILLS LIST */}
            <div className="overflow-y-visible w-full lg:w-auto pb-32">
              <motion.div layout className="flex flex-col gap-3 min-w-[200px] w-full">
                {MODULES.map((mod) => {
                  const isActive = activeModule === mod.id;
                  return (
                    <motion.button
                      layout
                      key={mod.id}
                      onClick={() => setActiveModule(isActive ? null : mod.id)}
                      transition={{ type: "spring", stiffness: 400, damping: 40, mass: 1 }}
                      className={`group flex overflow-hidden relative ${
                        isActive 
                          ? 'bg-[#1d1d1f] rounded-[1.5rem] w-full lg:w-[380px] p-6 text-left cursor-default flex-col items-start shadow-2xl z-20' 
                          : 'bg-[#1d1d1f] hover:bg-[#2d2d2f] rounded-full py-3.5 px-5 flex-row items-center w-fit min-w-[160px] transition-colors duration-300 z-10'
                      }`}
                    >
                      <motion.div layout className="flex items-center w-full">
                        
                        {/* ICON - Never unmounts, animates width/scale seamlessly */}
                        <motion.div 
                          layout
                          initial={false}
                          animate={{ 
                            opacity: isActive ? 0 : 1, 
                            width: isActive ? 0 : 28,
                            marginRight: isActive ? 0 : 12,
                            scale: isActive ? 0.5 : 1
                          }}
                          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                          className="flex items-center justify-center rounded-full flex-shrink-0 transition-colors duration-300 border border-white/30 text-white h-7 bg-transparent group-hover:border-white/70 overflow-hidden"
                        >
                          <Plus size={14} strokeWidth={1.5} className="min-w-[14px]" />
                        </motion.div>

                        {/* TEXT CONTENT - Inline rendering for Apple feel */}
                        <motion.div layout className="w-full text-left leading-relaxed">
                          <motion.span 
                            layout 
                            className={`tracking-tight transition-colors duration-300 ${isActive ? 'font-bold text-white text-[16px]' : 'font-bold text-[15px] text-white/90 group-hover:text-white'}`}
                          >
                            {isActive ? `${mod.name}. ` : mod.shortName}
                          </motion.span>

                          {isActive && (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.4, delay: 0.1 }}
                              className="text-[16px] text-white/80 font-medium inline"
                            >
                              {mod.desc}
                            </motion.span>
                          )}
                        </motion.div>
                        
                      </motion.div>
                    </motion.button>
                  );
                })}
              </motion.div>
            </div>
          </div>

          {/* RIGHT COLUMN: CANVAS (70%) */}
          <div className="flex-1 w-full relative z-20 flex flex-col items-center justify-center min-h-[600px] lg:border-l lg:border-white/20 lg:pl-12">
            {/* BACKGROUND TYPOGRAPHY (STATE A) */}
            <AnimatePresence>
              {!activeModule && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                  className="absolute inset-0 flex flex-col justify-center pointer-events-none lg:pl-12"
                >
                  <h2 className="text-[3.5rem] xl:text-[5rem] font-semibold tracking-tight text-white leading-[1.05] mb-6">
                    Plan with Confidence.<br/>
                    <span className="text-white/30">Explore the ecosystem.</span>
                  </h2>
                  <p className="text-xl text-white/50 max-w-lg leading-relaxed font-medium">
                    Select a module from the left to dive into attendance planning, career eligibility, or emotional analytics.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* INTERACTIVE MODULE CANVAS */}
            <AnimatePresence mode="wait">
              {activeModule && (
                <motion.div
                  key={activeModule}
                  initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                  transition={{ 
                    duration: 0.45, 
                    ease: [0.32, 0.72, 0, 1],
                    filter: { duration: 0.3 }
                  }}
                  className="w-full h-full absolute inset-0 bg-[#0a0a0a] border border-white/20 rounded-[2rem] p-8 overflow-hidden flex flex-col shadow-2xl"
                >
                  {MODULES.map((mod) => (
                    activeModule === mod.id && (
                      <motion.div 
                        key={mod.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.15, ease: [0.32, 0.72, 0, 1] }}
                        className="w-full h-full flex flex-col"
                      >
                        <mod.component 
                          currentCgpa={currentCGPA}
                          targetCgpa={targetCGPA}
                          completedSemesters={completedSemesters}
                          remainingSemesters={remainingSemesters}
                          result={result}
                          preset={activePreset}
                        />
                      </motion.div>
                    )
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

    </div>
  );
}
