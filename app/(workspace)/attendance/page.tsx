// @ts-nocheck
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { PageHero } from "@/components/ui/PageHero";
import { 
  AlertTriangle, 
  TrendingDown,
  Activity,
  Filter,
  Check,
  X,
  Target,
  Sparkles,
  Zap
} from "lucide-react";
import BunkScheduler from "@/components/attendance/BunkScheduler";
import TimetableManager from "@/components/attendance/TimetableManager";
import DailyStandupModal from "@/components/attendance/DailyStandupModal";
import StrategySelector, { BurnoutStrategy } from "@/components/attendance/StrategySelector";
import AssignmentIntelligence from "@/components/attendance/AssignmentIntelligence";
import AnimatedCounter from "@/components/AnimatedCounter";
import DynamicIsland from "@/components/attendance/DynamicIsland";
import { useUSMStore } from "@/stores/usmStore";
import { selectAttendanceRisk } from "@/stores/selectors/attendance";
import { getPresetById } from "@/lib/presets/presetRegistry";
import { cn } from "@/lib/cn";


export default function AttendancePage() {
  const storeState = useUSMStore();
  const [showTip, setShowTip] = useState(true);
  const presetId = useUSMStore((state) => state.presetId);
  const activePreset = getPresetById(presetId);
  
  const [mode, setMode] = useState<"attendance" | "assignments">("attendance");
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

  // Drag & Drop / Custom Categorization state
  const [customCategories, setCustomCategories] = useState<Record<string, "THEORY" | "LAB">>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("attendance_categories");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Error reading attendance categories from localStorage", e);
        }
      }
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem("attendance_categories", JSON.stringify(customCategories));
  }, [customCategories]);

  const [isDragOverTheory, setIsDragOverTheory] = useState(false);
  const [isDragOverLab, setIsDragOverLab] = useState(false);
  const [activeDraggedId, setActiveDraggedId] = useState<string | null>(null);

  const getCourseCategory = (courseId: string, name: string): "THEORY" | "LAB" => {
    if (customCategories[courseId]) {
      return customCategories[courseId];
    }
    return /lab|practical|workshop/i.test(name) ? "LAB" : "THEORY";
  };

  const handleDragStart = (e: React.DragEvent, courseId: string) => {
    e.dataTransfer.setData("text/plain", courseId);
    e.dataTransfer.effectAllowed = "move";
    setActiveDraggedId(courseId);
  };

  const handleDragEnd = () => {
    setActiveDraggedId(null);
    setIsDragOverTheory(false);
    setIsDragOverLab(false);
  };

  const handleDragOverTheory = (e: React.DragEvent) => {
    e.preventDefault();
    if (activeDraggedId) {
      setIsDragOverTheory(true);
    }
  };

  const handleDragOverLab = (e: React.DragEvent) => {
    e.preventDefault();
    if (activeDraggedId) {
      setIsDragOverLab(true);
    }
  };

  const handleDropTheory = (e: React.DragEvent) => {
    e.preventDefault();
    const courseId = e.dataTransfer.getData("text/plain") || activeDraggedId;
    if (courseId) {
      setCustomCategories(prev => ({
        ...prev,
        [courseId]: "THEORY"
      }));
    }
    handleDragEnd();
  };

  const handleDropLab = (e: React.DragEvent) => {
    e.preventDefault();
    const courseId = e.dataTransfer.getData("text/plain") || activeDraggedId;
    if (courseId) {
      setCustomCategories(prev => ({
        ...prev,
        [courseId]: "LAB"
      }));
    }
    handleDragEnd();
  };

  const filteredCourses = attendanceRiskData.courses.filter(c => !filterCriticalOnly || c.urgencyLevel === "CRITICAL" || c.urgencyLevel === "WARNING");
  const theoryCourses = filteredCourses.filter(c => getCourseCategory(c.courseId, c.courseName) === "THEORY");
  const labCourses = filteredCourses.filter(c => getCourseCategory(c.courseId, c.courseName) === "LAB");

  const renderCourseCard = (courseRisk: any, idx: number) => {
    const matchingCourse = schedulerCourses.find((c) => c.id === courseRisk.courseId);
    if (!matchingCourse) return null;

    const isCritical = courseRisk.urgencyLevel === "CRITICAL";
    const isWarning = courseRisk.urgencyLevel === "WARNING";

    const currentPercentage = matchingCourse.conducted === 0 
      ? 100 
      : (matchingCourse.attended / matchingCourse.conducted) * 100;

    let safeBunks = 0;
    let recoveryRequired = 0;
    const attendanceDecimal = minAttendance / 100;
    
    if (currentPercentage >= minAttendance) {
      safeBunks = Math.floor((matchingCourse.attended - attendanceDecimal * matchingCourse.conducted) / attendanceDecimal);
      safeBunks = Math.max(0, safeBunks);
    } else {
      recoveryRequired = Math.ceil((attendanceDecimal * matchingCourse.conducted - matchingCourse.attended) / (1 - attendanceDecimal));
      recoveryRequired = Math.max(0, recoveryRequired);
    }

    return (
      <motion.div
        key={courseRisk.courseId}
        layout
        draggable
        onDragStart={(e) => handleDragStart(e, courseRisk.courseId)}
        onDragEnd={handleDragEnd}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: activeDraggedId === courseRisk.courseId ? 0.92 : 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`relative bg-[#1c1c1e] border border-white/[0.05] shadow-[0_0_20px_rgba(0,0,0,0.2)] rounded-[24px] p-6 flex flex-col h-full min-h-[180px] transition-all duration-500 group overflow-hidden cursor-grab active:cursor-grabbing select-none ${
          isCritical ? 'hover:border-rose-500/30' : isWarning ? 'hover:border-amber-500/30' : 'hover:border-white/15'
        } ${activeDraggedId === courseRisk.courseId ? 'opacity-30 border-dashed border-white/15' : ''}`}
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
            <AnimatedCounter target={currentPercentage} decimals={1} className={`text-5xl font-semibold tracking-tighter ${
              currentPercentage >= minAttendance ? "text-white" : "text-rose-400"
            }`} />
            <span className={`text-xl font-bold ${currentPercentage >= minAttendance ? "text-white/30" : "text-rose-400/40"}`}>%</span>
          </div>
          {courseRisk.internalsImpact > 0 && (
            <div className="mt-2 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-rose-400/80" />
              <span className="text-[10px] text-rose-400/80 font-medium">Internal Impact: -{courseRisk.internalsImpact}</span>
            </div>
          )}
        </div>

        {/* Bottom Row: Minimalist Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.04] relative z-10">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-widest text-white/30 font-semibold mb-1">Attended</span>
            <span className="text-xs font-mono font-medium text-white/60">
              {matchingCourse.attended} / {matchingCourse.conducted}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase tracking-widest text-white/30 font-semibold mb-1">
              {currentPercentage >= minAttendance ? 'Safe' : 'Needed'}
            </span>
            <span className={`text-xs font-mono font-medium ${currentPercentage >= minAttendance ? 'text-emerald-400/80' : 'text-rose-400/80'}`}>
              {currentPercentage >= minAttendance ? `${safeBunks} bunks` : `${recoveryRequired} classes`}
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
  };

  return (
    <div className="w-full relative min-h-screen bg-black overflow-x-hidden selection:bg-[#10b981]/30 selection:text-white pb-40 font-sans">
      
      {/* Background Ambient Glows */}
      <motion.div 
        style={{ y: glowY, opacity: glowOpacity }}
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] pointer-events-none z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#10b981]/15 via-transparent to-transparent blur-[160px] rounded-full mix-blend-screen transition-colors duration-1000" />
      </motion.div>

      {/* Standardized Hero Section */}
      <section className="relative z-10 w-full flex flex-col items-start justify-center pt-16 pb-6 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="w-full flex flex-col items-start text-left gap-4">
          <div className="w-full max-w-3xl flex flex-col items-start mb-6">
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-white"
            >
              Attendance Intelligence
            </motion.h2>
            <p className="text-lg md:text-xl text-[#A1A1AA] font-medium leading-[1.4] tracking-tight">
              The intelligence engine tracks your academic margins in real-time. Accurately simulate leave allowances and generate precise recovery paths to maintain threshold compliance.
            </p>
          </div>
        </div>
      </section>

      {/* Desktop Content Area */}
      <div className="relative z-10 w-full px-6 md:px-12 max-w-[1400px] mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            {mode === "attendance" ? (
              <div className="flex flex-col gap-8">
                
                {/* Unified Action Toolbar */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-50 mb-2">
                  <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 shrink-0">
                    <Target size={20} className="text-[#10b981]" /> Risk Heatmap
                  </h2>
                  
                  <div className="flex-1 overflow-x-auto pb-2 -mb-2 md:pb-0 md:mb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <StrategySelector currentStrategy={strategy} onStrategyChange={setStrategy} />
                  </div>

                  {/* Sleek Survival Score Widget (matching Skills search bar dimensions) */}
                  <div className="shrink-0 flex items-center gap-4 bg-[#1c1c1e] border border-white/[0.04] hover:border-white/10 rounded-full py-2.5 px-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <Activity className={`w-4 h-4 ${scoreDetails.color}`} />
                      <span className="text-[12px] font-medium text-white/50 tracking-wide">Survival Score</span>
                      <span className={`text-[15px] font-bold tracking-tight ${scoreDetails.color}`}>
                        {attendanceRiskData.survivalScore}
                      </span>
                    </div>
                    <div className="w-px h-5 bg-white/[0.08]" />
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-medium text-white/40 tracking-wide">Risk</span>
                      <span className="text-[13px] font-mono font-medium text-white/90">
                        {attendanceRiskData.aggregatePercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Premium Drag and Drop Tip Banner */}
                <AnimatePresence>
                  {schedulerCourses.length > 0 && showTip && (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: -20, height: 0, filter: "blur(10px)" }}
                      animate={{ opacity: 1, y: 0, height: "auto", filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -20, height: 0, filter: "blur(10px)", marginBottom: 0 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="relative w-full sm:w-auto self-start flex items-center justify-between gap-6 px-3 py-2.5 rounded-full border border-[#eab308]/20 bg-[#18181b] shadow-lg mb-2 overflow-hidden group will-change-transform"
                    >
                      <div className="flex items-center gap-4 pl-1 relative z-10">
                        {/* Static Lightning Badge */}
                        <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#eab308]/10 shrink-0">
                          <Zap className="w-5 h-5 text-[#eab308] relative z-10" fill="currentColor" />
                        </div>
                        <div className="flex flex-col pointer-events-none">
                          <span className="text-[15px] font-bold text-white tracking-tight leading-tight">Smart Organization</span>
                          <span className="text-[10px] font-bold text-white/40 tracking-[0.1em] uppercase mt-0.5">Drag & drop cards to personalize view</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowTip(false)}
                        className="relative z-10 shrink-0 bg-[#eab308] hover:bg-[#ca8a04] hover:scale-105 active:scale-95 text-black font-bold text-[13px] px-6 py-2.5 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                      >
                        Got it
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Full Width Grid Section */}
                <div className="w-full">
                  {schedulerCourses.length === 0 ? (
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
                      <AnimatePresence mode="popLayout">
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
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-10">
                      
                      {/* Droppable Theory Column - Full Width Grid */}
                      <div 
                        onDragOver={handleDragOverTheory}
                        onDragLeave={() => setIsDragOverTheory(false)}
                        onDrop={handleDropTheory}
                        className={`flex flex-col gap-6 p-6 rounded-[28px] border transition-all duration-300 ${
                          isDragOverTheory 
                            ? "bg-blue-500/5 border-dashed border-blue-500/30 shadow-[0_0_25px_rgba(59,130,246,0.05)] scale-[1.01]" 
                            : activeDraggedId 
                            ? "border-dashed border-white/5 bg-white/[0.01]" 
                            : "border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2 px-1 mb-2">
                          <h4 className="text-[#86868b] text-[13px] font-bold uppercase tracking-wider">Theory Subjects</h4>
                          <div className="flex-1 h-px bg-white/5 ml-2" />
                        </div>
                        
                        {theoryCourses.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 px-6 bg-[#1c1c1e]/30 border border-dashed border-white/[0.05] rounded-[24px] min-h-[150px]">
                            <span className="text-[12px] font-mono text-white/30 tracking-wider">Drag & drop theory subjects here</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence mode="popLayout">
                              {theoryCourses.map((courseRisk, idx) => renderCourseCard(courseRisk, idx))}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>

                      {/* Droppable Lab Column - Full Width Grid */}
                      <div 
                        onDragOver={handleDragOverLab}
                        onDragLeave={() => setIsDragOverLab(false)}
                        onDrop={handleDropLab}
                        className={`flex flex-col gap-6 p-6 rounded-[28px] border transition-all duration-300 ${
                          isDragOverLab 
                            ? "bg-emerald-500/5 border-dashed border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.05)] scale-[1.01]" 
                            : activeDraggedId 
                            ? "border-dashed border-white/5 bg-white/[0.01]" 
                            : "border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2 px-1 mb-2">
                          <h4 className="text-[#86868b] text-[13px] font-bold uppercase tracking-wider">Laboratories & Practicals</h4>
                          <div className="flex-1 h-px bg-white/5 ml-2" />
                        </div>

                        {labCourses.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 px-6 bg-[#1c1c1e]/30 border border-dashed border-white/[0.05] rounded-[24px] min-h-[150px]">
                            <span className="text-[12px] font-mono text-white/30 tracking-wider">Drag & drop laboratory subjects here</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence mode="popLayout">
                              {labCourses.map((courseRisk, idx) => renderCourseCard(courseRisk, idx))}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>

                {/* SIMULATOR ROW */}
                {schedulerCourses.length > 0 && (
                  <div className="mt-16 pt-16 border-t border-white/10 flex flex-col gap-12">
                    <TimetableManager />

                    <div className=" border-t border-white/10 pt-12">
                      <div className="mb-10">
                        <h3 className="text-[2rem] md:text-[2.5rem] font-semibold tracking-[-0.04em] leading-[1.1]">
                          <motion.span 
                            className="text-transparent bg-clip-text inline-block"
                            style={{ backgroundImage: "linear-gradient(to right, #10b981, #34d399, #6ee7b7, #34d399, #10b981)", backgroundSize: "200% auto" }}
                            animate={{ backgroundPosition: ["0% center", "200% center"] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                          >Predictive Timeline.</motion.span>
                        </h3>
                        <p className="text-[#86868b] text-xl font-medium leading-[1.4] tracking-tight mt-4 max-w-3xl">
                          Run simulations to visualize timeline-based risk and safely plan your placement or hackathon leave.
                        </p>
                      </div>
                      <BunkScheduler courses={schedulerCourses} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="max-w-[1400px] mx-auto pt-4">
                <AssignmentIntelligence />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Unified Dynamic Island — Fixed at top right */}
      <DynamicIsland
        mode={mode}
        onModeChange={setMode}
      />
      <DailyStandupModal />
    </div>
  );
}
