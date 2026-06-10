"use client";

import React, { useState, useEffect } from "react";
import FocusModeWrapper from "@/components/workspace/FocusModeWrapper";
import { useUSMStore } from "@/stores/usmStore";
import { BacklogEngine, BacklogAnalysis, RecoveryPlanResult } from "@/lib/backlog-intelligence/engine";

import ATKTRulesWidget from "@/components/backlog/ATKTRulesWidget";
import CGPACeilingChart from "@/components/backlog/CGPACeilingChart";
import RevaluationEngineWidget from "@/components/backlog/RevaluationEngineWidget";
import PlacementScannerWidget from "@/components/backlog/PlacementScannerWidget";
import UnifiedSimulator from "@/components/backlog/UnifiedSimulator";
import ResourceMatcherWidget from "@/components/backlog/ResourceMatcherWidget";
import RecoveryPathwaysWidget from "@/components/backlog/RecoveryPathwaysWidget";

import TimeTravelSimulatorWidget from "@/components/backlog/deep-dive/TimeTravelSimulatorWidget";
import ROIRankerWidget from "@/components/backlog/deep-dive/ROIRankerWidget";
import GraceMarksPredictorWidget from "@/components/backlog/deep-dive/GraceMarksPredictorWidget";
import SafetyNetWidget from "@/components/backlog/deep-dive/SafetyNetWidget";
import AIStudyTimelineWidget from "@/components/backlog/deep-dive/AIStudyTimelineWidget";
import StudySquadWidget from "@/components/backlog/deep-dive/StudySquadWidget";
import HistoricalAnalyticsWidget from "@/components/backlog/deep-dive/HistoricalAnalyticsWidget";
import { Zap, Edit2, Check, X, BarChart2, Compass, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BacklogCommandCenter() {
  const { courses, semesterHistory, career, presetId, academic } = useUSMStore();
  const currentSem = academic.completedSemesters + 1;
  const updateCourseRecoverySemester = useUSMStore((state) => state.updateCourseRecoverySemester);
  const updateCourse = useUSMStore((state) => state.updateCourse);

  const [analysis, setAnalysis] = useState<BacklogAnalysis | null>(null);
  const [pathways, setPathways] = useState<any>(null);
  const [selectedPathwayType, setSelectedPathwayType] = useState<"SAFE" | "BALANCED" | "AGGRESSIVE">("BALANCED");
  
  const [selectedDeepDiveCourseId, setSelectedDeepDiveCourseId] = useState<string | null>(null);
  const [timeTravelTargetGrade, setTimeTravelTargetGrade] = useState<string>("A");
  
  const [isEditingGrade, setIsEditingGrade] = useState(false);
  const [manualGrade, setManualGrade] = useState("O");
  const [activeTab, setActiveTab] = useState<"ANALYTICS" | "SIMULATIONS" | "ACTION_PLAN">("ANALYTICS");

  useEffect(() => {
    const timeTravel = selectedDeepDiveCourseId ? { courseId: selectedDeepDiveCourseId, targetGrade: timeTravelTargetGrade } : undefined;
    const res = BacklogEngine.analyzeBacklogs(courses, currentSem - 1, semesterHistory, career, presetId, timeTravel);
    setAnalysis(res);
    
    // Generate all 3 plans
    const safePlan = BacklogEngine.generateStrategy(courses, currentSem, "SAFE");
    const balancedPlan = BacklogEngine.generateStrategy(courses, currentSem, "BALANCED");
    const aggressivePlan = BacklogEngine.generateStrategy(courses, currentSem, "AGGRESSIVE");
    
    setPathways({ SAFE: safePlan, BALANCED: balancedPlan, AGGRESSIVE: aggressivePlan });
    
  }, [courses, currentSem, semesterHistory, career, presetId, selectedDeepDiveCourseId, timeTravelTargetGrade]);

  useEffect(() => {
    if (analysis && analysis.activeBacklogs.length > 0 && !selectedDeepDiveCourseId) {
      setSelectedDeepDiveCourseId(analysis.activeBacklogs[0].id);
    }
  }, [analysis, selectedDeepDiveCourseId]);

  const handleSavePlan = (finalPlan: { [courseId: string]: number }) => {
    const activeBacklogs = courses.filter(c => ["F", "FF", "FAIL", "ABSENT", "AB"].includes((c.grade || "").toUpperCase()));
    activeBacklogs.forEach(c => {
      if (finalPlan[c.id]) {
        updateCourseRecoverySemester(c.id, finalPlan[c.id]);
      } else {
        updateCourseRecoverySemester(c.id, null);
      }
    });
    // Can add a toast notification here
  };

  const currentPlan = pathways ? pathways[selectedPathwayType] : null;

  if (!analysis || !currentPlan) {
    return (
      <FocusModeWrapper title="Recovery Command Center">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </FocusModeWrapper>
    );
  }

  if (analysis.activeBacklogs.length === 0) {
    return (
      <FocusModeWrapper title="Recovery Command Center">
        <div className="flex flex-col h-[60vh] items-center justify-center text-center space-y-4">
          <div className="p-4 bg-[#34c759]/10 rounded-full">
            <svg className="w-16 h-16 text-[#34c759]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white">System Nominal</h2>
          <p className="text-white/60">No active backlogs detected. Academic trajectory is clean.</p>
        </div>
      </FocusModeWrapper>
    );
  }

  const selectedCourse = courses.find(c => c.id === selectedDeepDiveCourseId);
  const currentCgpa = semesterHistory.reduce((sum, s) => sum + (s.sgpa * s.credits), 0) / (semesterHistory.reduce((sum, s) => sum + s.credits, 0) || 1);

  return (
    <FocusModeWrapper title="Recovery Command Center">
      <div className="w-full max-w-[1600px] mx-auto min-h-screen pb-32 pt-6">
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Recovery Command Center</h1>
          <p className="text-white/50 text-lg">Unified intelligence dashboard for backlog recovery planning.</p>
        </div>

        {/* Dashboard Masonry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-min">
          
          {/* Top Row: ATKT & CGPA Graph (4 cols + 8 cols) */}
          <div className="col-span-1 md:col-span-4 min-h-[300px]">
            <ATKTRulesWidget status={analysis.atktStatus} />
          </div>
          <div className="col-span-1 md:col-span-8 min-h-[300px]">
            <CGPACeilingChart data={analysis.cgpaCeiling} />
          </div>

          {/* Pathways Row (Full width) */}
          <div className="col-span-1 md:col-span-12">
            <RecoveryPathwaysWidget 
              pathways={pathways} 
              selectedType={selectedPathwayType} 
              onSelect={setSelectedPathwayType} 
            />
          </div>

          {/* Middle Row: Simulator (8 cols) & Revaluation (4 cols) */}
          <div className="col-span-1 md:col-span-8 min-h-[400px]">
             <UnifiedSimulator 
              key={selectedPathwayType} // force remount when pathway changes so state refreshes
              initialPlan={currentPlan} 
              courses={courses} 
              currentSemester={currentSem} 
              onSave={handleSavePlan} 
            />
          </div>
          <div className="col-span-1 md:col-span-4 flex flex-col gap-6 min-h-[400px]">
            <div className="flex-1">
              <RevaluationEngineWidget analysisData={analysis.revaluation} coursesList={courses} />
            </div>
            <div className="flex-1">
              <ResourceMatcherWidget activeBacklogs={analysis.activeBacklogs} />
            </div>
          </div>

          {/* Bottom Row: Placement Scanner */}
          <div className="col-span-1 md:col-span-12 min-h-[300px]">
            <PlacementScannerWidget disqualifications={analysis.placementDisqualifications} />
          </div>

          {/* Extreme Deep Dive Intelligence Row */}
          <AnimatePresence mode="wait">
            {selectedCourse && (
              <motion.div 
                key="deep-dive-grid"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="col-span-1 md:col-span-12 mt-8 mb-12 relative"
              >
                <div className="absolute inset-0 bg-[#bf5af2]/5 blur-[100px] pointer-events-none rounded-[50px]" />
                
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                      <span className="p-2 bg-[#bf5af2]/20 rounded-xl text-[#bf5af2] border border-[#bf5af2]/30 shadow-[0_0_20px_rgba(191,90,242,0.3)]"><Zap size={24} /></span>
                      Deep Dive Intelligence
                    </h2>
                    <p className="text-white/50 text-sm mt-1">Extreme analytical vectors for specific backlogs.</p>
                  </div>
                <div className="flex items-center gap-3 bg-black/40 p-2 rounded-2xl border border-white/5">
                  <span className="text-xs text-white/40 font-bold uppercase tracking-widest pl-2">Select Target:</span>
                  <select 
                    className="bg-white/10 border border-white/10 text-white rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-[#bf5af2] cursor-pointer"
                    value={selectedDeepDiveCourseId || ""}
                    onChange={(e) => {
                      setSelectedDeepDiveCourseId(e.target.value);
                      setIsEditingGrade(false);
                    }}
                  >
                    {analysis.activeBacklogs.map(c => (
                      <option key={c.id} value={c.id} className="bg-[#1c1c1e]">{c.code} - {c.name}</option>
                    ))}
                  </select>
                  
                  {isEditingGrade ? (
                    <div className="flex items-center gap-2 ml-2">
                      <input 
                        type="text" 
                        value={manualGrade} 
                        onChange={(e) => setManualGrade(e.target.value.toUpperCase())}
                        className="w-16 bg-white/10 border border-[#bf5af2] text-white rounded-lg px-2 py-1 text-sm font-bold focus:outline-none text-center uppercase"
                        placeholder="Grade"
                      />
                      <button 
                        onClick={() => {
                          if (selectedDeepDiveCourseId && manualGrade) {
                            updateCourse(selectedDeepDiveCourseId, { grade: manualGrade });
                            setIsEditingGrade(false);
                          }
                        }}
                        className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                      >
                        <Check size={16} />
                      </button>
                      <button 
                        onClick={() => setIsEditingGrade(false)}
                        className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsEditingGrade(true)}
                      className="ml-2 flex items-center gap-2 px-3 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-colors text-sm font-bold"
                      title="Clear Backlog Manually"
                    >
                      <Edit2 size={16} />
                      Clear
                    </button>
                  )}
                </div>
              </div>

                <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
                  <button 
                    onClick={() => setActiveTab("ANALYTICS")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors ${activeTab === "ANALYTICS" ? "bg-[#bf5af2]/20 text-[#bf5af2]" : "text-white/50 hover:text-white/80"}`}
                  >
                    <BarChart2 size={18} /> Analytics & ROI
                  </button>
                  <button 
                    onClick={() => setActiveTab("SIMULATIONS")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors ${activeTab === "SIMULATIONS" ? "bg-[#bf5af2]/20 text-[#bf5af2]" : "text-white/50 hover:text-white/80"}`}
                  >
                    <Compass size={18} /> Simulations
                  </button>
                  <button 
                    onClick={() => setActiveTab("ACTION_PLAN")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors ${activeTab === "ACTION_PLAN" ? "bg-[#bf5af2]/20 text-[#bf5af2]" : "text-white/50 hover:text-white/80"}`}
                  >
                    <Users size={18} /> Action Plan
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
                  {activeTab === "ANALYTICS" && (
                    <>
                      <div className="col-span-1 md:col-span-6 min-h-[300px]">
                        <HistoricalAnalyticsWidget course={selectedCourse} />
                      </div>
                      <div className="col-span-1 md:col-span-6 min-h-[300px]">
                         <ROIRankerWidget 
                           courses={courses} 
                           history={semesterHistory} 
                           onSelectCourse={(id) => setSelectedDeepDiveCourseId(id)}
                         />
                      </div>
                    </>
                  )}
                  {activeTab === "SIMULATIONS" && (
                    <>
                      <div className="col-span-1 md:col-span-6 min-h-[300px]">
                        <TimeTravelSimulatorWidget 
                          course={selectedCourse} 
                          courses={courses} 
                          history={semesterHistory} 
                          currentCgpa={currentCgpa} 
                          targetGrade={timeTravelTargetGrade}
                          setTargetGrade={setTimeTravelTargetGrade}
                        />
                      </div>
                      <div className="col-span-1 md:col-span-6 min-h-[300px]">
                        <GraceMarksPredictorWidget course={selectedCourse} courses={courses} />
                      </div>
                    </>
                  )}
                  {activeTab === "ACTION_PLAN" && (
                    <>
                      <div className="col-span-1 md:col-span-6 min-h-[300px]">
                        <AIStudyTimelineWidget course={selectedCourse} />
                      </div>
                      <div className="col-span-1 md:col-span-6 min-h-[300px]">
                        <StudySquadWidget course={selectedCourse} />
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </FocusModeWrapper>
  );
}
