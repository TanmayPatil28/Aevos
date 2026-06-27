// @ts-nocheck
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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
  Zap,
  BookOpen,
  Brain
} from "lucide-react";
import FocusWidget from "@/components/attendance/FocusWidget";
import BunkScheduler from "@/components/attendance/BunkScheduler";
import TimetableManager from "@/components/attendance/TimetableManager";
import DailyStandupModal from "@/components/attendance/DailyStandupModal";
import StrategySelector, { BurnoutStrategy } from "@/components/attendance/StrategySelector";
import AssignmentIntelligence from "@/components/attendance/AssignmentIntelligence";
import { BacklogIntelligence } from "@/components/workspace/BacklogIntelligence";
import AnimatedCounter from "@/components/AnimatedCounter";
import DynamicIsland from "@/components/attendance/DynamicIsland";
import { useUSMStore } from "@/stores/usmStore";
import { selectAttendanceRisk } from "@/stores/selectors/attendance";
import { getPresetById } from "@/lib/presets/presetRegistry";
import { cn } from "@/lib/cn";
import Card from "@/components/ui/Card";
import { AppleCarousel } from "@/components/ui/apple-carousel";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { FloatingPill } from "@/components/ui/floating-pill";

gsap.registerPlugin(useGSAP, ScrollTrigger);


export default function AttendancePage() {
  const storeState = useUSMStore();
  const presetId = useUSMStore((state) => state.presetId);
  const activePreset = getPresetById(presetId);
  
  const carouselSlides = [
    {
      id: "slide-1",
      headline: (
        <>
          Optimize your margins.<br />
          Data-driven attendance strategies.
        </>
      ),
      colors: ["#1c1c1c", "#1e1e1e", "#181818", "#222222"],
    },
    {
      id: "slide-2",
      headline: (
        <>
          Never miss a threshold.<br />
          Your predictive bunk roadmap.
        </>
      ),
      colors: ["#1c1c1c", "#1f1f1f", "#191919", "#202020"],
    },
    {
      id: "slide-3",
      headline: (
        <>
          Master your schedule.<br />
          High-impact recovery paths.
        </>
      ),
      colors: ["#1c1c1c", "#1a1a1a", "#1b1b1b", "#1f1f1f"],
    },
  ];
  
  // GSAP Cinematic Curtain Reveal
  useGSAP(() => {
    const tl = gsap.timeline();
    
    // Initial state
    gsap.set(".curtain-content", { opacity: 0, filter: "blur(10px)", scale: 0.98 });
    gsap.set(".gsap-bunk-card", { opacity: 0, y: 50 });
    
    // Animate hero content
    tl.to(".curtain-content", {
      opacity: 1,
      filter: "blur(0px)",
      scale: 1,
      duration: 1.2,
      ease: "power3.out",
      stagger: 0.2
    });

    // Scroll trigger for Bunk Scheduler
    ScrollTrigger.batch(".gsap-bunk-card", {
      onEnter: elements => gsap.to(elements, {
        opacity: 1,
        y: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
        overwrite: true
      }),
      start: "top 85%",
    });
  });
  
  const [mode, setMode] = useState<"attendance" | "assignments" | "backlogs">("attendance");
  const [strategy, setStrategy] = useState<BurnoutStrategy>("BALANCED");
  const [activeCarouselFeature, setActiveCarouselFeature] = useState<string | null>(null);
  const [activePillId, setActivePillId] = useState<string | number>("none");
  const [isPillExpanded, setIsPillExpanded] = useState(false);
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

  // Allow ?mode= query parameter to override initial state
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const modeParam = urlParams.get("mode");
      if (modeParam === "attendance" || modeParam === "assignments" || modeParam === "backlogs") {
        setMode(modeParam);
      }
    }
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
        className={`relative h-full min-h-[130px] transition-all duration-500 group cursor-grab active:cursor-grabbing select-none ${activeDraggedId === courseRisk.courseId ? 'opacity-30' : ''}`}
      >
        <Card padding="md" className="flex flex-col h-full overflow-hidden">
          <div className="w-full flex flex-col gap-2 relative z-10">
          <div className="flex justify-end items-start">
            <span className={`text-[10px] font-mono uppercase font-bold tracking-widest flex items-center gap-1 ${
              isCritical ? "text-rose-400" : 
              isWarning ? "text-amber-400" :
              "text-brand"
            }`}>
              {courseRisk.urgencyLevel}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white leading-snug line-clamp-2 pr-2">
            {courseRisk.courseName}
          </h3>
        </div>

        {/* Middle Row: Balanced Percentage */}
        <div className="relative z-10 flex-1 flex flex-col justify-center mb-6 mt-4">
          <div className="flex items-baseline gap-1">
            <AnimatedCounter target={currentPercentage} decimals={1} className={`text-3xl font-bold tracking-tight ${
              currentPercentage >= minAttendance ? "text-white" : "text-rose-400"
            }`} />
            <span className={`text-lg font-bold ${currentPercentage >= minAttendance ? "text-white/40" : "text-rose-400/50"}`}>%</span>
          </div>
          {courseRisk.internalsImpact > 0 && (
            <div className="mt-2 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-rose-400/80" />
              <span className="text-[10px] text-rose-400/80 font-medium">Internal Impact: -{courseRisk.internalsImpact}</span>
            </div>
          )}
        </div>

        {/* Bottom Row: Minimalist Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.04] relative z-10 mt-auto transition-opacity duration-300 ease-out group-hover:opacity-0">
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
            <span className={`text-xs font-mono font-medium ${currentPercentage >= minAttendance ? 'text-brand/80' : 'text-rose-400/80'}`}>
              {currentPercentage >= minAttendance ? `${safeBunks} bunks` : `${recoveryRequired} classes`}
            </span>
          </div>
        </div>

        {/* Floating Tooltip Quick Actions */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-5 translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out z-30 flex items-center justify-center gap-6 px-6 py-3 bg-[#1a1a1a] shadow-xl border border-white/10 rounded-full pointer-events-none group-hover:pointer-events-auto whitespace-nowrap">
          <button 
            onClick={() => storeState.updateCourse(courseRisk.courseId, { attendanceTotal: matchingCourse.conducted + 1, attendanceBunked: matchingCourse.bunked })}
            className="flex items-center justify-center gap-1.5 text-brand text-[13px] font-bold hover:brightness-125 transition-all"
          >
            <Check className="w-3.5 h-3.5" /> Attended
          </button>
          <div className="w-[1px] h-4 bg-white/10" />
          <button 
            onClick={() => storeState.updateCourse(courseRisk.courseId, { attendanceTotal: matchingCourse.conducted + 1, attendanceBunked: matchingCourse.bunked + 1 })}
            className="flex items-center justify-center gap-1.5 text-rose-400 text-[13px] font-bold hover:brightness-125 transition-all"
          >
            <X className="w-3.5 h-3.5" /> Bunked
          </button>
        </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="w-full relative min-h-screen bg-background overflow-x-hidden selection:bg-brand/30 selection:text-white pb-32 font-sans scrollbar-hide">
      
      {/* Background Ambient Glows */}
      <motion.div 
        style={{ y: glowY, opacity: glowOpacity }}
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] pointer-events-none z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-brand/15 via-transparent to-transparent blur-[160px] rounded-full mix-blend-screen transition-colors duration-1000" />
      </motion.div>

      {/* Premium Apple Carousel Section at Very Top */}
      <div className="relative z-50 pt-16 pb-8 max-w-[1400px] mx-auto flex flex-col gap-6">
        <div className="w-full">
          <div className="w-[100vw] relative left-1/2 -translate-x-1/2">
            <AppleCarousel 
              slides={carouselSlides} 
              activeFeatureId={activeCarouselFeature}
              features={[
                { id: "focus", content: <FocusWidget onClose={() => setActiveCarouselFeature(null)} /> }
              ]}
              leftControls={
                <FloatingPill 
                  id={activePillId as string}
                  activeId={activePillId as string}
                  onActiveChange={(id) => {
                    const strId = String(id);
                    if (strId === "safe") setStrategy("SAFE");
                    if (strId === "balanced") setStrategy("BALANCED");
                    if (strId === "survival") setStrategy("SURVIVAL");
                    if (strId === "placement") setStrategy("PLACEMENT_PREP");
                    setActivePillId(strId);
                  }}
                  isExpanded={isPillExpanded}
                  onExpandChange={setIsPillExpanded}
                  items={[
                    { id: "safe", label: "Safe Mode" },
                    { id: "balanced", label: "Balanced Mode" },
                    { id: "survival", label: "Survival Mode" },
                    { id: "placement", label: "Placement Prep" }
                  ]}
                  expandable={false}
                />
              }
              rightControls={
                <div className="flex items-center gap-3">
                  <SegmentedControl
                    options={[
                      { value: "attendance", label: "Attendance", icon: <Target className="w-3.5 h-3.5" /> },
                      { value: "assignments", label: "Assignments", icon: <BookOpen className="w-3.5 h-3.5" /> },
                      { value: "backlogs", label: "Backlogs", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
                    ]}
                    value={mode}
                    onChange={(val) => setMode(val as any)}
                  />
                  <div className="flex items-center p-1.5 rounded-full bg-[#1C1C1E]/80 backdrop-blur-xl border border-white/5">
                    <button 
                      onClick={() => setActiveCarouselFeature(prev => prev === "focus" ? null : "focus")}
                      className={`relative w-9 h-9 rounded-full transition-colors duration-300 flex items-center justify-center z-10 ${
                        activeCarouselFeature === "focus" 
                          ? "bg-white text-black shadow-sm" 
                          : "text-white/70 hover:text-white hover:bg-white/5"
                      }`}
                      title="Focus Center"
                    >
                      <Brain className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </div>

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
                
                {/* Full Width Grid Section */}
                <div className="w-full">
                  {schedulerCourses.length === 0 ? (
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
                      <AnimatePresence mode="popLayout">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center p-12 bg-surface border border-dashed border-white/10 rounded-[24px]"
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
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <div className="mt-16 pt-16 border-t border-white/10 flex flex-col gap-12 curtain-content">
                    <TimetableManager />

                    <div className=" border-t border-white/10 pt-12">
                      <div className="mb-10">
                        <h3 className="text-[2rem] md:text-[2.5rem] font-bold tracking-tight text-white mb-2">
                          Predictive Timeline
                        </h3>
                        <p className="text-lg text-[#A1A1AA] font-medium leading-[1.4] max-w-2xl">
                          Run simulations to visualize timeline-based risk and safely plan your placement or hackathon leave.
                        </p>
                      </div>
                      <BunkScheduler courses={schedulerCourses} strategy={strategy} />
                    </div>
                  </div>
                )}
              </div>
            ) : mode === "assignments" ? (
              <div className="max-w-[1400px] mx-auto pt-4">
                <AssignmentIntelligence />
              </div>
            ) : (
              <div className="max-w-[1400px] mx-auto pt-4">
                <BacklogIntelligence />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      
      <DailyStandupModal />
    </div>
  );
}
