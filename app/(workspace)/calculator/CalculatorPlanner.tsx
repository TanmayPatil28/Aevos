"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateRequiredGPA, getDifficultyLevel } from "@/lib/presets";
import { useUniversity } from "@/components/providers/UniversityProvider";
import AnimatedCounter from "@/components/AnimatedCounter";
import { Plus, ChevronUp, ChevronDown } from "lucide-react";
import Card from "@/components/ui/card";
import { AppleFeatureExplorer } from "@/components/ui/apple-feature-explorer";

import CareerHubModule from "@/components/planner/CareerHubModule";
import AcademicOptimizerModule from "@/components/planner/AcademicOptimizerModule";
import AttendanceIntelligenceModule from "@/components/planner/AttendanceIntelligenceModule";
import BacklogRecoveryModule from "@/components/planner/BacklogRecoveryModule";
import ProfileOptimizerModule from "@/components/planner/ProfileOptimizerModule";
import EmotionalIntelligenceBoard from "@/components/planner/EmotionalIntelligenceBoard";
import ScenarioSimulator from "@/components/planner/ScenarioSimulator";

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
  <Card padding="md" className="flex flex-col relative shadow-none cursor-not-allowed">
    <span className="font-bold tracking-[0.2em] text-[10px] uppercase mb-2 text-white/40 flex items-center justify-between">
      {label}
      {showFetched && <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full tracking-wider border border-blue-500/20">FETCHED</span>}
    </span>
    <div className="text-4xl md:text-5xl font-black text-white/60 tracking-tighter">
      {value.toFixed(decimals)}
    </div>
  </Card>
);

const ManualNumberInput = ({ label, value, onChange, min, max, step }: any) => {
  return (
    <Card padding="md" className="flex flex-col relative transition-colors shadow-none focus-within:ring-2 focus-within:ring-brand/50">
      <span className="font-bold tracking-[0.2em] text-[10px] uppercase mb-2 text-brand flex items-center justify-between">
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
    </Card>
  );
};

export default function CalculatorPlanner() {
  const { activePreset, maxGradePoint } = useUniversity();
  
  // -- Sandbox State --
  const [currentCGPA, setCurrentCGPA] = useState<number>(7.00);
  const [completedSemesters, setCompletedSemesters] = useState<number>(3);
  const [totalCredits, setTotalCredits] = useState<number>(60);
  const [targetCGPA, setTargetCGPA] = useState<number>(8.50);
  const [remainingSemesters, setRemainingSemesters] = useState<number>(5);
  const [creditsPerSemester, setCreditsPerSemester] = useState<number>(20);



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
    <>
      {/* PHASE 1: CORE SANDBOX (Calculator Split Layout) */}
      <div className="max-w-[1400px] mx-auto w-full flex flex-wrap gap-12 lg:gap-24 items-start relative z-10 pt-16">
        
        {/* LEFT COLUMN: Inputs */}
        <div className="flex-[2] min-w-[320px] max-w-4xl flex flex-col gap-16">
          <div className="flex flex-col gap-10">
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
      <div className="mt-40 mb-32 relative z-10 w-full pt-32 border-t border-white/20">
        <AppleFeatureExplorer 
          className="w-[100vw] relative left-1/2 -translate-x-1/2 rounded-none"
          features={MODULES.map((mod) => ({
            id: mod.id,
            title: mod.name,
            description: mod.desc,
            rightPanelContent: (
              <div className="w-full h-full overflow-y-auto relative text-left">
                <mod.component 
                  currentCgpa={currentCGPA}
                  targetCgpa={targetCGPA}
                  completedSemesters={completedSemesters}
                  remainingSemesters={remainingSemesters}
                  result={result}
                  preset={activePreset}
                />
              </div>
            )
          }))}
          emptyStateContent={
            <div className="flex flex-col justify-center w-full h-full text-left max-w-2xl mr-auto lg:pl-12">
              <h2 className="text-[3.5rem] xl:text-[5rem] font-semibold tracking-tight text-white leading-[1.05] mb-6">
                Plan with Confidence.<br/>
                <span className="text-white/30">Explore the ecosystem.</span>
              </h2>
              <p className="text-xl text-white/50 leading-relaxed font-medium">
                Select a module from the left to dive into attendance planning, career eligibility, or emotional analytics.
              </p>
            </div>
          }
        />
      </div>
    </>
  );
}
