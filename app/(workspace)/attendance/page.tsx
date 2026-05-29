"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { 
  Radar, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  AlertTriangle, 
  TrendingDown,
  Activity,
  Filter,
  Check,
  X
} from "lucide-react";
import WorkspaceContent from "@/components/layout/WorkspaceContent";
import WorkspaceSection from "@/components/layout/WorkspaceSection";
import BunkScheduler from "@/components/attendance/BunkScheduler";
import TimetableManager from "@/components/attendance/TimetableManager";
import DailyStandupModal from "@/components/attendance/DailyStandupModal";
import StrategySelector, { BurnoutStrategy } from "@/components/attendance/StrategySelector";
import AssignmentIntelligence from "@/components/attendance/AssignmentIntelligence";
import AnimatedCounter from "@/components/AnimatedCounter";
import { useUSMStore } from "@/stores/usmStore";
import { selectAttendanceRisk } from "@/stores/selectors/attendance";
import { getPresetById } from "@/lib/presets/presetRegistry";

import { PageHero } from "@/components/ui/PageHero";

export default function AttendancePage() {
  const storeState = useUSMStore();
  const presetId = useUSMStore((state) => state.presetId);
  const activePreset = getPresetById(presetId);
  
  const [strategy, setStrategy] = useState<BurnoutStrategy>("BALANCED");
  const [filterCriticalOnly, setFilterCriticalOnly] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  // Transform background element on scroll
  const glowY = useTransform(scrollY, [0, 500], [0, 150]);
  const glowOpacity = useTransform(scrollY, [0, 300], [0.6, 0]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate attendance details dynamically
  const attendanceRiskData = useMemo(() => selectAttendanceRisk(storeState), [storeState]);
  
  // Adjust minAttendance threshold based on strategy
  let minAttendance = activePreset?.passRules?.minAttendance || 75;
  if (strategy === "SAFE") minAttendance = Math.min(100, minAttendance + 10);
  if (strategy === "SURVIVAL") minAttendance = Math.max(0, minAttendance - 5);

  // Map courses to the shape BunkScheduler expects
  const schedulerCourses = useMemo(() => {
    return attendanceRiskData.courses.map((courseRisk) => {
      const originalCourse = storeState.courses.find((c) => c.id === courseRisk.courseId);
      
      const conducted = originalCourse ? originalCourse.attendanceTotal : 0;
      const bunked = originalCourse ? originalCourse.attendanceBunked : 0;
      const attended = Math.max(0, conducted - bunked);

      return {
        id: courseRisk.courseId,
        name: courseRisk.courseName,
        code: courseRisk.courseCode,
        conducted,
        bunked,
        attended,
        percentage: courseRisk.percentage,
        minAttendance,
      };
    });
  }, [attendanceRiskData.courses, storeState.courses, minAttendance]);

  const getSurvivalScoreDetails = (score: string) => {
    switch(score) {
      case "STABLE": return { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" };
      case "RISKY": return { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" };
      case "CRITICAL": return { color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30" };
      case "ACADEMIC EMERGENCY": return { color: "text-rose-500", bg: "bg-rose-500/20 border-rose-500/50" };
      default: return { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" };
    }
  };
  
  const scoreDetails = getSurvivalScoreDetails(attendanceRiskData.survivalScore);

  return (
    <div className="w-full relative min-h-screen bg-black overflow-x-hidden selection:bg-white/20 selection:text-white pb-32">
      
      {/* Background Ambient Glows */}
      <motion.div 
        style={{ y: glowY, opacity: glowOpacity }}
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] pointer-events-none z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#A855F7]/20 via-transparent to-transparent blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#4F8EF7]/15 blur-[100px] rounded-full mix-blend-screen" />
      </motion.div>



      {/* Main Content Area */}
      <WorkspaceContent className="relative z-10">
        <WorkspaceSection>
          <PageHero 
            headline={<>Calculate safe bunks.<br/>Never drop below the threshold.</>}
            description="The attendance intelligence system tracks your classes in real-time. Know exactly how many lectures you can afford to skip, or the exact recovery path needed to stay out of the danger zone."
          />
          
          <div className="flex flex-wrap gap-8 lg:gap-12 items-start mt-8">
            
            {/* LEFT PANE: Strategy & Heatmap */}
            <div className="flex-[2] min-w-[320px] flex flex-col gap-10 relative z-10 w-full">
              
              {/* Strategy Selector Container */}
              <div className="bg-[#1D1D1F] border border-white/5 px-6 py-6 rounded-[32px] relative overflow-hidden group">
                <div className="relative z-10">
                  <StrategySelector currentStrategy={strategy} onStrategyChange={setStrategy} />
                </div>
              </div>

              {/* Subject-Wise Risk Heatmap */}
              <div className="w-full flex flex-col gap-6">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <Activity className="text-[#A855F7] w-5 h-5 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                    <span className="font-bold text-white tracking-tight text-lg">Subject-Wise Risk Heatmap</span>
                  </div>
                  <button 
                    onClick={() => setFilterCriticalOnly(!filterCriticalOnly)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      filterCriticalOnly 
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]' 
                        : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white/80'
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    {filterCriticalOnly ? "CRITICAL ONLY" : "ALL SUBJECTS"}
                  </button>
                </div>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
                  <AnimatePresence mode="popLayout">
                    {schedulerCourses.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center p-12 bg-[#1D1D1F] border border-dashed border-white/10 rounded-[24px]"
                      >
                        <AlertTriangle className="w-8 h-8 text-white/20 mb-4" />
                        <h3 className="text-white font-bold text-lg mb-2">No courses registered</h3>
                        <p className="text-white/40 text-sm max-w-sm text-center">
                          Please register your active semester courses in the calculator to activate intelligence tracking.
                        </p>
                      </motion.div>
                    ) : (
                      attendanceRiskData.courses
                        .filter(c => !filterCriticalOnly || c.urgencyLevel === "CRITICAL" || c.urgencyLevel === "WARNING")
                        .map((courseRisk, idx) => {
                        const matchingCourse = schedulerCourses.find((c) => c.id === courseRisk.courseId);
                        if (!matchingCourse) return null;

                        const isCritical = courseRisk.urgencyLevel === "CRITICAL";
                        const isWarning = courseRisk.urgencyLevel === "WARNING";

                        // Recalculate margins based on strategy modified minAttendance
                        let safeBunks = 0;
                        let recoveryRequired = 0;
                        const attendanceDecimal = minAttendance / 100;
                        if (courseRisk.percentage >= minAttendance) {
                          safeBunks = Math.floor((matchingCourse.attended - attendanceDecimal * matchingCourse.conducted) / attendanceDecimal);
                          safeBunks = Math.max(0, safeBunks);
                        } else {
                          recoveryRequired = Math.ceil((attendanceDecimal * matchingCourse.conducted - matchingCourse.attended) / (1 - attendanceDecimal));
                          recoveryRequired = Math.max(0, recoveryRequired);
                        }

                        return (
                          <motion.div
                            key={courseRisk.courseId}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ delay: idx * 0.05, type: "spring", stiffness: 300, damping: 25 }}
                            className={`relative bg-[#111111] border border-white/5 rounded-[24px] p-6 flex flex-col h-full min-h-[180px] transition-all duration-500 group overflow-hidden ${
                              isCritical ? 'hover:border-rose-500/30' : isWarning ? 'hover:border-amber-500/30' : 'hover:border-white/15'
                            }`}
                          >
                            {/* Top Row: Code & Name */}
                            <div className="flex flex-col mb-4 relative z-10">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-mono font-semibold text-white/40 tracking-widest uppercase">
                                  {courseRisk.courseCode}
                                </span>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono uppercase font-bold flex items-center gap-1 ${
                                  isCritical ? "text-rose-400 bg-rose-500/10 border border-rose-500/20" : 
                                  isWarning ? "text-amber-400 bg-amber-500/10 border border-amber-500/20" :
                                  "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                                }`}>
                                  {courseRisk.urgencyLevel}
                                </span>
                              </div>
                              <h3 className="text-sm font-semibold text-white/90 leading-snug line-clamp-2 pr-2">
                                {courseRisk.courseName}
                              </h3>
                            </div>

                            {/* Middle Row: Massive Percentage */}
                            <div className="relative z-10 flex-1 flex flex-col justify-center mb-6 mt-2">
                              <div className="flex items-baseline gap-1">
                                <AnimatedCounter target={courseRisk.percentage} decimals={1} className={`text-5xl font-semibold tracking-tighter ${
                                  courseRisk.percentage >= minAttendance ? "text-white" : "text-rose-400"
                                }`} />
                                <span className={`text-xl font-bold ${courseRisk.percentage >= minAttendance ? "text-white/30" : "text-rose-400/40"}`}>%</span>
                              </div>
                              {courseRisk.internalsImpact > 0 && (
                                <div className="mt-2 flex items-center gap-1.5">
                                  <TrendingDown className="w-3.5 h-3.5 text-rose-400/80" />
                                  <span className="text-[10px] text-rose-400/80 font-medium">Internal Impact: -{courseRisk.internalsImpact}</span>
                                </div>
                              )}
                            </div>

                            {/* Bottom Row: Minimalist Stats */}
                            <div className="flex items-center justify-between pt-4 border-t border-white/20 relative z-10">
                              <div className="flex flex-col">
                                <span className="text-[9px] uppercase tracking-widest text-white/30 font-semibold mb-1">Attended</span>
                                <span className="text-xs font-mono font-medium text-white/60">
                                  {matchingCourse.attended} / {matchingCourse.conducted}
                                </span>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-[9px] uppercase tracking-widest text-white/30 font-semibold mb-1">
                                  {courseRisk.percentage >= minAttendance ? 'Safe' : 'Needed'}
                                </span>
                                <span className={`text-xs font-mono font-medium ${courseRisk.percentage >= minAttendance ? 'text-emerald-400/80' : 'text-rose-400/80'}`}>
                                  {courseRisk.percentage >= minAttendance ? `${safeBunks} bunks` : `${recoveryRequired} classes`}
                                </span>
                              </div>
                            </div>

                            {/* Glassmorphic Quick Actions Overlay */}
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 flex flex-col items-center justify-center gap-3 p-6 pointer-events-none group-hover:pointer-events-auto">
                              <button 
                                onClick={() => storeState.updateCourse(courseRisk.courseId, { attendanceTotal: matchingCourse.conducted + 1, attendanceBunked: matchingCourse.bunked })}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-[14px] transition-colors shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10 hover:border-white/20"
                              >
                                <Check className="w-4 h-4 text-emerald-400" /> Mark Attended
                              </button>
                              <button 
                                onClick={() => storeState.updateCourse(courseRisk.courseId, { attendanceTotal: matchingCourse.conducted + 1, attendanceBunked: matchingCourse.bunked + 1 })}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-100 text-xs font-bold rounded-[14px] transition-colors shadow-[0_0_20px_rgba(244,63,94,0.05)] border border-rose-500/20 hover:border-rose-500/40"
                              >
                                <X className="w-4 h-4 text-rose-400" /> Mark Bunked
                              </button>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </AnimatePresence>
                </div>
              </div>

            </div>

            {/* RIGHT PANE: Sticky Numbers & Assignments */}
            <div className="flex-1 min-w-[320px] flex flex-col gap-12 lg:sticky lg:top-28 h-fit relative z-10 w-full">
              
              <div className="flex flex-col">
                <span className="text-white/50 font-black tracking-[0.3em] text-[10px] mb-6 uppercase">Semester Survival</span>
                <motion.div 
                  className="flex items-baseline gap-2"
                  animate={{ opacity: [0.9, 1, 0.9] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <span className={`text-[4rem] lg:text-[5rem] xl:text-[6rem] font-semibold tracking-tighter leading-[0.9] ${scoreDetails.color}`}>
                    {attendanceRiskData.survivalScore}
                  </span>
                </motion.div>
                <div className="mt-6 inline-flex items-center">
                  <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-white/50 border border-white/10 bg-white/5 px-3 py-1.5 rounded-lg">
                    {attendanceRiskData.overallRisk} DETENTION RISK
                  </span>
                </div>
              </div>

              <div className="flex flex-col w-full border-t border-white/20 pt-8 gap-8 mt-2">
                <div className="flex flex-col">
                  <span className="text-white/40 font-bold tracking-[0.2em] text-[10px] mb-3 uppercase">Current Aggregate</span>
                  <div className="flex items-baseline gap-1">
                    <AnimatedCounter target={attendanceRiskData.aggregatePercentage} decimals={1} className="text-4xl font-semibold tracking-tighter text-white" />
                    <span className="text-2xl font-bold text-white/40">%</span>
                  </div>
                </div>
                
                <div className="w-full h-px bg-white/20" />

                <div className="flex flex-col">
                  <span className="text-white/40 font-bold tracking-[0.2em] text-[10px] mb-3 uppercase">Strategy Target</span>
                  <div className="flex items-baseline gap-1">
                    <AnimatedCounter target={minAttendance} decimals={0} className="text-4xl font-semibold tracking-tighter text-white" />
                    <span className="text-2xl font-bold text-white/40">%</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-8 border-t border-white/20">
                <AssignmentIntelligence />
              </div>

            </div>

          </div>

          {/* SIMULATOR ROW */}
          {schedulerCourses.length > 0 && (
            <div className="mt-24 pt-16 border-t border-white/20 flex flex-col gap-12">
              <TimetableManager />

              <div className="border-t border-white/20 pt-12">
                <div className="mb-10">
                  <h3 className="text-[2rem] md:text-[2.5rem] font-semibold tracking-[-0.04em] leading-[1.1]">
                    <motion.span 
                      className="text-transparent bg-clip-text inline-block"
                      style={{ backgroundImage: "linear-gradient(to right, #3b82f6, #93c5fd, #e0f2fe, #93c5fd, #3b82f6)", backgroundSize: "200% auto" }}
                      animate={{ backgroundPosition: ["0% center", "200% center"] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    >Predictive Timeline.</motion.span>
                  </h3>
                  <p className="text-[#86868b] text-xl font-medium leading-[1.4] tracking-tight mt-4">
                    Run simulations to visualize timeline-based risk and safely plan your placement or hackathon leave.
                  </p>
                </div>
                <BunkScheduler courses={schedulerCourses} />
              </div>
            </div>
          )}

        </WorkspaceSection>

        <DailyStandupModal />
      </WorkspaceContent>
    </div>
  );
}
