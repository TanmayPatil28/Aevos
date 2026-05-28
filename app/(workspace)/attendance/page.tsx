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

      {/* Cinematic Hero Section */}
      <section className="relative z-10 w-full min-h-[60vh] flex flex-col items-center justify-center pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-8"
          >
            <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-white/50 border border-white/10 rounded-full px-4 py-1.5 bg-white/5 backdrop-blur-md">
              GradeFlow Risk Engine
            </span>
          </motion.div>
          
          <h1 className="text-7xl md:text-8xl lg:text-[9rem] font-bold tracking-[-0.05em] leading-[1.05] mb-8 text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(to right, #A855F7, #D8B4FE, #E9D5FF, #D8B4FE, #A855F7)", backgroundSize: "200% auto" }}>
            <motion.span animate={{ backgroundPosition: ["0% center", "200% center"] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="inline-block w-full">
              <FadeText delay={0.1} className="text-transparent">Safe.</FadeText> <FadeText delay={0.3} className="text-transparent">Strategic.</FadeText> <FadeText delay={0.5} className="text-transparent">Smart.</FadeText>
            </motion.span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/60 font-medium max-w-2xl mx-auto leading-relaxed">
            <FadeText delay={0.7}>
              Monitor detention probability, assess assignment impact, and dynamically adjust your academic strategy based on faculty strictness.
            </FadeText>
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <WorkspaceContent className="relative z-10">
        <WorkspaceSection>
          
          <div className="flex flex-wrap gap-8 lg:gap-12 items-start mt-8">
            
            {/* LEFT PANE: Strategy & Heatmap */}
            <div className="flex-[2] min-w-[320px] flex flex-col gap-10 relative z-10 w-full">
              
              {/* Strategy Selector Container */}
              <div className="bg-black/60 backdrop-blur-3xl border border-white/[0.05] px-6 py-6 rounded-[2rem] shadow-[0_20px_40px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden group">
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#A855F7]/10 rounded-full blur-3xl pointer-events-none transition-colors duration-500" />
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
                        className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center p-12 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl"
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
                            className={`relative bg-black border border-white/[0.08] rounded-[2rem] p-5 flex flex-col h-full min-h-[160px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] transition-all duration-500 group hover:border-white/[0.15] hover:bg-[#050505] hover:-translate-y-1 ${
                              isCritical ? 'ring-1 ring-rose-500/20' : isWarning ? 'ring-1 ring-amber-500/20' : ''
                            }`}
                          >
                            {/* Ambient Glow */}
                            {isCritical && <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 blur-2xl rounded-full pointer-events-none" />}
                            
                            {/* Top Row: Code & Urgency */}
                            <div className="flex justify-between items-start mb-3 gap-2 relative z-10">
                              <span className="text-[10px] font-mono text-white/60 tracking-widest uppercase bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/[0.08] group-hover:border-white/20 transition-colors">
                                {courseRisk.courseCode}
                              </span>
                              <span className={`text-[9px] px-2 py-1 rounded-md font-mono uppercase font-bold border flex items-center gap-1 ${
                                isCritical ? "text-rose-400 bg-rose-500/10 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.1)]" : 
                                isWarning ? "text-amber-400 bg-amber-500/10 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]" :
                                "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                              }`}>
                                {courseRisk.urgencyLevel}
                              </span>
                            </div>

                            {/* Middle Row: Name & Percentage */}
                            <div className="relative z-10 flex-1 mb-4">
                              <h3 className="text-sm font-bold text-white/95 leading-snug line-clamp-2 pr-2 mb-2 group-hover:text-white transition-colors">
                                {courseRisk.courseName}
                              </h3>
                              <div className="flex items-baseline gap-1">
                                <AnimatedCounter target={courseRisk.percentage} decimals={1} className={`text-3xl font-semibold tracking-tighter ${
                                  courseRisk.percentage >= minAttendance ? "text-white" : "text-rose-400"
                                }`} />
                                <span className={`text-sm font-bold ${courseRisk.percentage >= minAttendance ? "text-white/40" : "text-rose-400/50"}`}>%</span>
                              </div>
                            </div>

                            {/* Bottom Row: Stats */}
                            <div className="mt-auto space-y-2 pt-3 border-t border-white/[0.08] group-hover:border-white/[0.15] relative z-10 transition-colors">
                              {courseRisk.internalsImpact > 0 && (
                                <div className="flex items-center justify-between text-[11px] py-1.5 px-2.5 rounded-lg bg-rose-500/5 border border-rose-500/10 mb-2">
                                  <span className="text-rose-400 flex items-center gap-1.5 font-medium">
                                    <TrendingDown className="w-3.5 h-3.5" />
                                    Internal Impact
                                  </span>
                                  <span className="text-rose-400 font-bold font-mono">-{courseRisk.internalsImpact} marks</span>
                                </div>
                              )}
                              
                              <div className="flex justify-between text-[11px]">
                                <span className="text-white/40 font-medium">Attended / Conducted</span>
                                <span className="text-white/80 font-bold font-mono">
                                  {matchingCourse.attended} / {matchingCourse.conducted}
                                </span>
                              </div>

                              {courseRisk.percentage >= minAttendance ? (
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-white/40 font-medium">Strategy Margin</span>
                                  <span className="text-emerald-400 font-bold font-mono">
                                    {safeBunks} safe
                                  </span>
                                </div>
                              ) : (
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-white/40 font-medium">Strategy Deficit</span>
                                  <span className="text-rose-400 font-bold font-mono">
                                    {recoveryRequired} needed
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Decorative Historical Trend Sparkline (Mocked for UI) */}
                            <div className="absolute bottom-0 left-0 right-0 h-16 opacity-40 pointer-events-none transition-opacity group-hover:opacity-10 rounded-b-[2rem] overflow-hidden">
                              <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
                                <path 
                                  d="M0,30 Q10,15 20,20 T40,10 T60,15 T80,5 T100,20 L100,30 L0,30 Z" 
                                  fill="currentColor" 
                                  className={isCritical ? "text-rose-500/20" : isWarning ? "text-amber-500/20" : "text-emerald-500/20"}
                                />
                                <path 
                                  d="M0,30 Q10,15 20,20 T40,10 T60,15 T80,5 T100,20" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  className={isCritical ? "text-rose-500" : isWarning ? "text-amber-500" : "text-emerald-500"}
                                  strokeWidth="1.5" 
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>

                            {/* Hover Quick Actions */}
                            <div className="absolute -bottom-4 left-0 right-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 group-hover:bottom-4 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto z-20 px-4">
                              <button 
                                onClick={() => storeState.updateCourse(courseRisk.courseId, { attendanceTotal: matchingCourse.conducted + 1, attendanceBunked: matchingCourse.bunked })}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-xl border border-emerald-500/30 backdrop-blur-md transition-colors"
                              >
                                <Check className="w-3 h-3" /> Attended
                              </button>
                              <button 
                                onClick={() => storeState.updateCourse(courseRisk.courseId, { attendanceTotal: matchingCourse.conducted + 1, attendanceBunked: matchingCourse.bunked + 1 })}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-[10px] font-bold rounded-xl border border-rose-500/30 backdrop-blur-md transition-colors"
                              >
                                <X className="w-3 h-3" /> Bunked
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

              <div className="flex flex-col w-full border-t border-white/[0.08] pt-8 gap-8 mt-2">
                <div className="flex flex-col">
                  <span className="text-white/40 font-bold tracking-[0.2em] text-[10px] mb-3 uppercase">Current Aggregate</span>
                  <div className="flex items-baseline gap-1">
                    <AnimatedCounter target={attendanceRiskData.aggregatePercentage} decimals={1} className="text-4xl font-semibold tracking-tighter text-white" />
                    <span className="text-2xl font-bold text-white/40">%</span>
                  </div>
                </div>
                
                <div className="w-full h-px bg-white/[0.08]" />

                <div className="flex flex-col">
                  <span className="text-white/40 font-bold tracking-[0.2em] text-[10px] mb-3 uppercase">Strategy Target</span>
                  <div className="flex items-baseline gap-1">
                    <AnimatedCounter target={minAttendance} decimals={0} className="text-4xl font-semibold tracking-tighter text-white" />
                    <span className="text-2xl font-bold text-white/40">%</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-8 border-t border-white/[0.08]">
                <AssignmentIntelligence />
              </div>

            </div>

          </div>

          {/* SIMULATOR ROW */}
          {schedulerCourses.length > 0 && (
            <div className="mt-24 pt-16 border-t border-white/[0.05] flex flex-col gap-12">
              <TimetableManager />

              <div className="border-t border-white/[0.05] pt-12">
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
