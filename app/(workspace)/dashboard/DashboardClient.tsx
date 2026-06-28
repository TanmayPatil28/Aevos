"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useUSMStore } from "@/stores/usmStore";

import ExpandableTrustPanel from "@/components/dashboard/ExpandableTrustPanel";
import { AlertCircle, Target, TrendingUp, Compass, ArrowRight, RefreshCw, GraduationCap, Briefcase, LayoutGrid, Activity, Zap, X, Play, Pause, Square } from "lucide-react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import AnimatedCounter from "@/components/AnimatedCounter";
import DocumentVault from "@/components/DocumentVault";
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AppleCarousel } from "@/components/ui/apple-carousel";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { FloatingPill } from "@/components/ui/floating-pill";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTimerStore } from "@/stores/timerStore";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// OS Views
const AcademicDashboardView = dynamic(() => import("@/components/dashboard/os-views/AcademicDashboardView"), { 
  ssr: false,
  loading: () => <div className="h-[600px] w-full rounded-[2rem] bg-zinc-900/50 animate-pulse border border-zinc-800" />
});
const CareerDashboardView = dynamic(() => import("@/components/dashboard/os-views/CareerDashboardView"), { 
  ssr: false,
  loading: () => <div className="h-[600px] w-full rounded-[2rem] bg-zinc-900/50 animate-pulse border border-zinc-800" />
});
const UnifiedDashboardView = dynamic(() => import("@/components/dashboard/os-views/UnifiedDashboardView"), { 
  ssr: false,
  loading: () => <div className="h-[600px] w-full rounded-[2rem] bg-zinc-900/50 animate-pulse border border-zinc-800" />
});
const MultiSemesterView = dynamic(() => import("@/components/dashboard/os-views/MultiSemesterView"), { 
  ssr: false,
  loading: () => <div className="h-[600px] w-full rounded-[2rem] bg-zinc-900/50 animate-pulse border border-zinc-800" />
});

import { SyncFeaturePanel } from "@/components/dashboard/sync/SyncFeaturePanel";
const DataSyncEngine = dynamic(() => import("@/components/dashboard/sync/DataSyncEngine").then(mod => mod.DataSyncEngine), { ssr: false });
import { diagnostics } from "@/lib/diagnostics";

export default function DashboardClient({
  initialCalculations = [],
  initialPlans = [],
  initialEnrollments = [],
  initialSnapshot = null,
}: {
  initialCalculations?: any[];
  initialPlans?: any[];
  initialEnrollments?: any[];
  initialSnapshot?: any;
}) {
  const store = useUSMStore();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("overview");
  const hasHydratedRef = React.useRef(false);
  const [mounted, setMounted] = useState(false);
  
  const { scrollY } = useScroll();
  const glowY = useTransform(scrollY, [0, 500], [0, 150]);
  const glowOpacity = useTransform(scrollY, [0, 300], [0.6, 0]);

  const [activeCarouselFeature, setActiveCarouselFeature] = useState<string | null>(null);
  const [isPillExpanded, setIsPillExpanded] = useState(false);
  const [macroOsMode, setMacroOsMode] = useState("unified-os");

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const mode = store.workspaceUi.mode;
  const timerStore = useTimerStore();

  useEffect(() => {
    let interval: any;
    if (timerStore.isTimerRunning && timerStore.timerRemaining > 0) {
      interval = setInterval(() => {
        timerStore.setTimerRemaining(prev => prev - 1);
      }, 1000);
    } else if (timerStore.timerRemaining === 0) {
      timerStore.setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerStore.isTimerRunning, timerStore.timerRemaining, timerStore.setTimerRemaining, timerStore.setIsTimerRunning]);

  const activeScenario = store.simulation?.activeScenarios?.find(s => s.id === store.simulation?.selectedScenarioId);

  // Auto-evaluate interventions if empty but we have authoritative data
  useEffect(() => {

    if (store.identity.hasAuthoritativeData && store.interventions.length === 0) {
      store.evaluateInterventions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.identity.hasAuthoritativeData, store.interventions.length]);

// Hydrate store from server props
  useEffect(() => {
    if (process.env.NODE_ENV === "development") diagnostics.info("DashboardClient", `Hydration Effect triggered. hasHydrated: ${hasHydratedRef.current}`);
    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      if (process.env.NODE_ENV === "development") diagnostics.info("DashboardClient", `Starting bootstrap. Server Calculations: ${initialCalculations.length}, Server Enrollments: ${initialEnrollments.length}`);
      
      // If we have an authoritative snapshot from DB, and local store isn't authoritative yet, hydrate it first.
      if (initialSnapshot && !store.identity.hasAuthoritativeData) {
        if (process.env.NODE_ENV === "development") console.log("[QA Instrumentation] Hydrating authoritative snapshot from DB.");
        store.hydrateFromSnapshot(initialSnapshot);
      }
      
      if (initialCalculations.length > 0 || initialEnrollments.length > 0) {
        let semesterHistory: any[] = [];
        let courses: any[] = [];
        
        // Identify which semesters are locked by the authoritative snapshot
        const authoritativeSemesters = store.identity.hasAuthoritativeData 
             ? new Set([
                 ...store.semesterHistory.map(s => s.semester),
                 ...store.courses.map(c => c.semester || 1)
               ])
             : new Set();
             
        let startingSemester = 1;
        if (store.identity.hasAuthoritativeData && store.semesterHistory.length > 0) {
          startingSemester = Math.max(...store.semesterHistory.map(s => s.semester)) + 1;
        }

        const multiSem = initialCalculations.find((c: any) => c.semester.startsWith("Multi-Sem"));
        if (multiSem && Array.isArray(multiSem.subjects)) {
          const multiSemHistory = multiSem.subjects.map((s: any, i: number) => ({
            semester: i + 1, // Multi-Sem always starts from 1
            sgpa: Number(s.sgpa) || 0,
            credits: Number(s.credits) || 0,
            earnedCredits: Number(s.credits) || 0
          }));
          
          multiSemHistory.forEach((sem: any) => {
            if (!authoritativeSemesters.has(sem.semester)) {
              semesterHistory.push(sem);
            }
          });
        } else {
          const singleSems = initialCalculations.filter((c: any) => !c.semester.startsWith("Multi-Sem"));
          if (singleSems.length > 0) {
            // Deduplicate by semester string to prevent spam saves from creating infinite semesters
            // Since array is ordered by desc, the first one encountered is the newest.
            const uniqueMap = new Map();
            singleSems.forEach((c: any) => {
              if (!uniqueMap.has(c.semester)) {
                uniqueMap.set(c.semester, c);
              }
            });
            
            const deduplicatedSems = Array.from(uniqueMap.values());
            const chronological = [...deduplicatedSems].reverse();
            
            chronological.forEach((s: any, i: number) => {
              const match = s.semester.match(/\d+/);
              if (!match) return; // Fix timeline duplication: skip non-numeric semesters
              const parsedSem = parseInt(match[0]);
              
              // NEVER overwrite an authoritative snapshot semester with a manual calculation
              if (authoritativeSemesters.has(parsedSem)) {
                if (process.env.NODE_ENV === "development") console.warn(`[QA Instrumentation] Hydration blocked: Manual calculation for Semester ${parsedSem} skipped due to existing authoritative data.`);
                return;
              }
              
              // Extract manual calculation subjects so they show up in Active Course Ledger
              if (Array.isArray(s.subjects)) {
                s.subjects.forEach((sub: any) => {
                  courses.push({
                    id: `manual_${parsedSem}_${Math.random().toString(36).substr(2, 9)}`,
                    code: sub.name ? sub.name.substring(0, 6).toUpperCase() : "SUBJ",
                    name: sub.name || "Unknown Subject",
                    semester: parsedSem,
                    credits: Number(sub.credits) || 0,
                    grade: sub.score ? sub.score.toString() : "",
                    cieMarks: 0,
                    seeMarks: 0,
                    attendanceTotal: 0,
                    attendanceBunked: 0
                  });
                });
              }

              semesterHistory.push({
                semester: parsedSem,
                sgpa: Number(s.sgpa) || 0,
                credits: Number(s.total_credits) || 0,
                earnedCredits: Number(s.total_credits) || 0
              });
            });
          }
        }

        // Only inject enrollments for semesters that are NOT authoritative
        if (initialEnrollments.length > 0) {
          const validEnrollments = initialEnrollments.filter((e: any) => !authoritativeSemesters.has(parseInt(e.semester) || 1));
          
          validEnrollments.forEach((e: any) => {
            courses.push({
              id: e.courseId,
              code: e.course?.code || "",
              name: e.course?.name || "",
              semester: parseInt(e.semester) || 1,
              credits: e.course?.credits || 0,
              grade: e.grade,
              cieMarks: e.cieMarks,
              seeMarks: e.seeMarks,
              attendanceTotal: e.attendanceTotal,
              attendanceBunked: e.attendanceBunked
            });
          });
        }

        if (semesterHistory.length > 0 || courses.length > 0) {
          if (process.env.NODE_ENV === "development") console.log(`[QA Instrumentation] Executing hydrateFromSnapshot. Injecting ${semesterHistory.length} semesters and ${courses.length} courses.`);
          store.hydrateFromSnapshot({
            sourceType: store.identity.sourceType || "database_sync",
            sourceInstitution: store.identity.institution || "gradeflow",
            createdAt: new Date().toISOString(),
            verificationStatus: store.identity.isVerified ? "verified" : "unverified",
            confidenceScore: 1.0,
            academicProfile: {
              semesterHistory,
              courses,
              presetId: store.presetId
            }
          });
        } else {
          if (process.env.NODE_ENV === "development") console.log("[QA Instrumentation] No new authoritative data to hydrate. Store remains unmodified by server props.");
        }
      } else {
        if (process.env.NODE_ENV === "development") console.log("[QA Instrumentation] Server props were empty. Bypassing hydration.");
      }
      if (process.env.NODE_ENV === "development") console.log("[QA Instrumentation] Hydration complete.");
    }
  }, [initialCalculations, initialEnrollments, store]);

  // Handle URL parameters for routing redirects
  useEffect(() => {
    if (searchParams.get("sync") === "true") {
      setActiveCarouselFeature("sync");
      // Clean up URL without reloading
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams]);

  // GSAP Cinematic Curtain Reveal
  useGSAP(() => {
    const tl = gsap.timeline();
    gsap.set(".curtain-content", { opacity: 0, filter: "blur(10px)", scale: 0.98 });
    gsap.set(".gsap-dashboard-card", { opacity: 0, y: 50 });
    
    tl.to(".curtain-content", {
      opacity: 1, filter: "blur(0px)", scale: 1, duration: 1.2, ease: "power3.out", stagger: 0.2
    });

    ScrollTrigger.batch(".gsap-dashboard-card", {
      onEnter: elements => gsap.to(elements, {
        opacity: 1, y: 0, stagger: 0.15, duration: 0.8, ease: "power3.out", overwrite: true
      }),
      start: "top 85%",
    });
  });

  const carouselSlides = [
    {
      id: "slide-1",
      headline: (
        <>
          Command your semester.<br />
          Your academic intelligence OS.
        </>
      ),
      colors: ["#1c1c1c", "#1e1e1e", "#181818", "#222222"],
    },
    {
      id: "slide-2",
      headline: (
        <>
          Every decision, data-driven.<br />
          Real-time recovery paths.
        </>
      ),
      colors: ["#1c1c1c", "#1f1f1f", "#191919", "#202020"],
    },
    {
      id: "slide-3",
      headline: (
        <>
          Dominate your trajectory.<br />
          AI-powered career milestones.
        </>
      ),
      colors: ["#1c1c1c", "#1a1a1a", "#1b1b1b", "#1f1f1f"],
    },
  ];

  if (!mounted) {
    return (
      <div className="w-full relative min-h-screen bg-background overflow-x-hidden selection:bg-brand/30 selection:text-white pb-40 font-sans scrollbar-hide">
        <div className="px-6 md:px-12 max-w-[1400px] mx-auto space-y-8 relative z-10 pt-8 pb-24">
          <div className="h-16 w-full rounded-2xl bg-zinc-900/50 animate-pulse border border-zinc-800" />
          <div className="h-32 w-full max-w-2xl rounded-2xl bg-zinc-900/50 animate-pulse border border-zinc-800" />
          <div className="h-[600px] w-full rounded-[2rem] bg-zinc-900/50 animate-pulse border border-zinc-800" />
        </div>
      </div>
    );
  }

  // Adaptive Empty State
  if (!store.identity.hasAuthoritativeData) {
    return (
      <div className="w-full relative min-h-screen bg-background overflow-x-hidden selection:bg-brand/30 selection:text-white pb-40 font-sans scrollbar-hide">
        <div className="px-6 md:px-12 max-w-[1400px] mx-auto min-h-[80vh] flex flex-col justify-center gap-12 relative z-10 pt-8">
          <DataSyncEngine isHero />
          
          <div className="max-w-md mx-auto w-full pt-12 border-t border-white/5 text-center flex flex-col items-center">
            <p className="text-[12px] leading-[16px] text-foreground-muted font-semibold uppercase tracking-wider mb-6">Need to clear corrupted backend records? Note: this cannot be undone.</p>
            <Button 
              variant="danger"
              size="md"
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full sm:w-auto font-bold"
            >
              Clear Local Cache & Reload
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { interventions, workspaceContexts, healthScore } = store;
  
  // Health Status Styling Logic
  const isCriticalHealth = healthScore ? healthScore.overall < 40 : false;
  const isAtRiskHealth = healthScore ? (healthScore.overall >= 40 && healthScore.overall < 70) : false;
  
  const healthColorText = isCriticalHealth ? "text-rose-500" : isAtRiskHealth ? "text-amber-500" : "text-emerald-500";
  const healthColorBg = isCriticalHealth ? "bg-rose-500" : isAtRiskHealth ? "bg-amber-500" : "bg-emerald-500";
  const healthColorBorder = isCriticalHealth ? "border-rose-500" : isAtRiskHealth ? "border-amber-500" : "border-emerald-500";
  const healthPillStyles = isCriticalHealth 
    ? "bg-rose-500/10 border-rose-500/30 text-rose-400" 
    : isAtRiskHealth 
      ? "bg-amber-500/10 border-amber-500/30 text-amber-400" 
      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
  const healthLabel = isCriticalHealth ? "CRITICAL RISK" : isAtRiskHealth ? "AT RISK" : "OPTIMAL HEALTH";

  // Determine primary macro context theme
  const isRecovery = workspaceContexts.includes("RECOVERY");
  const isOptimization = workspaceContexts.includes("OPTIMIZATION");
  const isSimulation = !!activeScenario;

  const headerTheme = isSimulation 
    ? "from-blue-900/40 to-blue-600/10 border-blue-500/30 text-blue-400"
    : isRecovery 
      ? "from-rose-900/40 to-rose-600/10 border-rose-500/30 text-rose-400"
      : isOptimization
        ? "from-emerald-900/40 to-emerald-600/10 border-emerald-500/30 text-emerald-400"
        : "from-indigo-900/40 to-indigo-600/10 border-indigo-500/30 text-indigo-400";

  const setMode = store.setWorkspaceMode;

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
      <div className="relative z-50 pt-6 pb-8 max-w-[1400px] mx-auto flex flex-col gap-6 curtain-content">
        <div className="w-full">
          <div className="w-[100vw] relative left-1/2 -translate-x-1/2">
            <AppleCarousel 
              slides={carouselSlides} 
              activeFeatureId={activeCarouselFeature}
              features={[
                { 
                  id: "health", 
                  content: (
                    <div className="w-full h-full flex flex-col relative overflow-hidden backdrop-blur-3xl rounded-[32px] border border-white/[0.05] shadow-2xl">
                      {/* Ambient background glow for the widget itself */}
                      <div className={`absolute inset-0 opacity-[0.03] pointer-events-none ${healthColorBg}`} />
                      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] blur-[120px] opacity-30 pointer-events-none rounded-full ${healthColorBg}`} />
                      
                      <div className="flex items-center justify-between p-8 z-20 relative pointer-events-auto">
                        <div className="flex items-center gap-4">
                          {/* Live pulse dot */}
                          <div className="relative flex h-3 w-3">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${healthColorBg}`}></span>
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${healthColorBg}`}></span>
                          </div>
                          <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-zinc-300">System Diagnostics OS</h3>
                        </div>
                        <button onClick={() => setActiveCarouselFeature(null)} className="p-3 bg-white/5 hover:bg-white/15 rounded-full transition-colors text-zinc-300 hover:text-white backdrop-blur-xl border border-white/10">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                        {healthScore ? (
                          <div className="relative flex flex-col items-center justify-center w-full mt-4">
                            {/* The Outer Animated Ring */}
                            <div className={`absolute rounded-full border-[2px] border-dashed animate-[spin_30s_linear_infinite] opacity-30 ${healthColorBorder}`}
                              style={{ width: '340px', height: '340px' }}
                            />
                            
                            {/* The Inner Glow Circle */}
                            <div className={`absolute rounded-full opacity-20 blur-[60px] ${healthColorBg}`}
                              style={{ width: '200px', height: '200px' }}
                            />

                            <div className="relative z-10 flex flex-col items-center justify-center py-10">
                              <Activity className={`w-8 h-8 mb-4 ${healthColorText}`} />
                              
                              <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-[100px] leading-none font-black text-white tracking-tighter">
                                  {healthScore.overall.toFixed(1)}
                                </span>
                              </div>
                              <span className="text-zinc-400 font-bold text-[10px] uppercase tracking-[0.3em] mb-6">Overall Intelligence Score</span>
                              
                              <div className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-2xl ${healthPillStyles}`}>
                                {healthLabel}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-zinc-500">
                            <Activity className="w-12 h-12 mb-6 opacity-50" />
                            <p className="text-sm font-bold uppercase tracking-[0.3em]">Telemetry Unavailable</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) 
                },
                {
                  id: "sync",
                  content: <SyncFeaturePanel onClose={() => setActiveCarouselFeature(null)} />
                }
              ]}
              leftControls={
                <FloatingPill 
                  id={activeTab}
                  activeId={activeTab}
                  onActiveChange={(id) => setActiveTab(String(id))}
                  isExpanded={isPillExpanded}
                  onExpandChange={setIsPillExpanded}
                  items={[
                    { id: "overview", label: "Overview" },
                    { id: "critical", label: "Critical Issues" },
                    { id: "milestones", label: "Milestones" },
                    ...(isSimulation ? [
                      { id: "exit_sandbox", label: "Exit Sandbox", onClick: () => store.clearSimulationScenarios(), isDestructive: true }
                    ] : [
                      { id: "timeline", label: "Timeline" },
                      { id: "simulations", label: "Simulations" }
                    ])
                  ]}
                />
              }
              centerControls={
                timerStore.activeTimerTaskId ? (
                  <div className="flex items-center gap-3 px-2 py-1">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-full border border-white/5 backdrop-blur-xl">
                      <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                      <span className="text-[10px] font-bold text-white/50 tracking-widest uppercase truncate max-w-[120px]">{timerStore.activeTimerTaskName}</span>
                      <div className="text-[13px] font-black tracking-tighter text-emerald-400 font-mono drop-shadow-[0_0_15px_rgba(52,211,153,0.3)] ml-2 leading-none">
                        {Math.floor(timerStore.timerRemaining / 60).toString().padStart(2, '0')}:{(timerStore.timerRemaining % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => timerStore.setIsTimerRunning(!timerStore.isTimerRunning)}
                        className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/90 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95"
                      >
                        {timerStore.isTimerRunning ? <Pause className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 fill-black ml-0.5" />}
                      </button>
                      <button 
                        onClick={() => {
                          timerStore.setTimerRemaining(25 * 60);
                          timerStore.setIsTimerRunning(false);
                          timerStore.setActiveTimerTask(null, "");
                        }}
                        className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-rose-500/20 hover:text-rose-400 transition-all border border-white/10 hover:border-rose-500/30"
                      >
                        <Square className="w-3 h-3 fill-current opacity-70" />
                      </button>
                    </div>
                  </div>
                ) : undefined
              }
              rightControls={
                <div className="flex items-center gap-3">
                  <SegmentedControl 
                    value={macroOsMode}
                    onChange={setMacroOsMode}
                    options={[
                      { value: "academic", label: "Academic" },
                      { value: "unified-os", label: "Unified OS" },
                      { value: "career", label: "Career" },
                      { value: "recovery", label: "Recovery" }
                    ]}
                  />
                  <div className="h-8 w-[1px] bg-white/10 mx-1" />
                  
                  {healthScore && !isSimulation && mode !== "FOCUS" && (
                    <div className="flex items-center p-1.5 rounded-full bg-[#1C1C1E]/80 backdrop-blur-xl border border-white/5">
                      <button 
                        onClick={() => setActiveCarouselFeature(activeCarouselFeature === "health" ? null : "health")}
                        className={`relative group flex items-center justify-center p-2 rounded-full transition-all duration-300
                          ${activeCarouselFeature === "health" ? "bg-white text-black" : "text-white/70 hover:text-white hover:bg-white/10"}`}
                      >
                        <Activity className={`w-4 h-4 ${activeCarouselFeature === "health" ? "" : healthColorText}`} />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center p-1.5 rounded-full bg-[#1C1C1E]/80 backdrop-blur-xl border border-white/5">
                    <button 
                      onClick={() => setActiveCarouselFeature(activeCarouselFeature === "sync" ? null : "sync")}
                      className={`relative group flex items-center justify-center p-2 rounded-full transition-all duration-300
                        ${activeCarouselFeature === "sync" ? "bg-white text-black" : "text-white/70 hover:text-white hover:bg-white/10"}`}
                    >
                      <RefreshCw className={`w-4 h-4 ${activeCarouselFeature === "sync" ? "text-black" : ""}`} />
                    </button>
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </div>

      {/* Desktop Content Area */}
      <div className="relative z-10 w-full px-6 md:px-12 max-w-[1400px] mx-auto space-y-12">
        
        {/* Priority Intervention Inbox */}
        {interventions.length > 0 && !isSimulation && activeTab !== "simulations" && (
          <div className="space-y-6 curtain-content">
            {(activeTab === "overview" || activeTab === "critical" || activeTab === "milestones") && (
              <h2 className="text-[2rem] font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                <Compass className="w-6 h-6 text-brand" />
                {activeTab === "critical" ? "Critical Issues" : activeTab === "milestones" ? "Milestones" : "Priority Action Inbox"}
              </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {interventions
                .filter(inv => {
                  if (activeTab === "critical") return inv.type === "RISK" || inv.priorityTier === "CRITICAL";
                  if (activeTab === "milestones") return inv.type === "MILESTONE" || inv.type === "TARGET";
                  return true;
                })
                .map(inv => {
                const Icon = inv.type === "RISK" ? AlertCircle : inv.type === "MILESTONE" ? TrendingUp : Target;

                return (
                  <div key={inv.id} className="gsap-dashboard-card">
                    <Card variant="default" padding="lg" className="h-full flex flex-col group relative overflow-hidden transition-all duration-500 hover:border-brand/30">
                      <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="flex items-center gap-3 text-white font-bold text-lg">
                          <Icon className="w-5 h-5 text-foreground-muted" />
                          {inv.title}
                        </div>
                        <Badge variant={inv.priorityTier === 'CRITICAL' ? 'danger' : 'warning'}>
                          {inv.priorityTier} PRIORITY
                        </Badge>
                      </div>
                      
                      <p className="text-foreground-muted text-[15px] leading-relaxed mb-6 flex-1 relative z-10">{inv.description}</p>
                      
                      {inv.actionTrigger && (
                        <div className="relative z-10 mb-4">
                          <Link href={
                            inv.actionTrigger.toLowerCase().includes("backlog") ? "/backlog" :
                            inv.actionTrigger.toLowerCase().includes("placement") ? "/placement" :
                            inv.actionTrigger.toLowerCase().includes("attendance") ? "/attendance" :
                            inv.actionTrigger.toLowerCase().includes("forecast") ? "/forecast" :
                            "/planner"
                          }>
                            <Button variant="ghost" size="sm" className="group/btn">
                              {inv.actionTrigger.toLowerCase().includes("backlog") ? "View Next Steps" : "Explore Options"}
                              <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        </div>
                      )}

                      <div className="relative z-10 border-t border-white/[0.05] pt-4 mt-auto">
                        <ExpandableTrustPanel explanation={inv.explanation} />
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Timeline View */}
        {activeTab === "timeline" && !isSimulation && (
          <div className="curtain-content">
            <motion.div key="timeline-view"
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <MultiSemesterView />
            </motion.div>
          </div>
        )}

        {/* Smart Morphing OS Views */}
        {(activeTab === "overview" || activeTab === "simulations") && (
          <div className="curtain-content">
            <AnimatePresence mode="wait">
              {macroOsMode === "academic" && (
                <motion.div key="academic-view"
                  initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <AcademicDashboardView />
                </motion.div>
              )}
              {macroOsMode === "unified-os" && (
                <motion.div key="unified-view"
                  initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <UnifiedDashboardView />
                </motion.div>
              )}
              {macroOsMode === "career" && (
                <motion.div key="career-view"
                  initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <CareerDashboardView />
                </motion.div>
              )}
              {macroOsMode === "recovery" && (
                <motion.div key="recovery-view"
                  initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-8"
                >
                  <Card variant="default" className="w-full flex items-center justify-center h-[400px] !p-6 border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/[0.02] mix-blend-overlay"></div>
                    <div className="text-center relative z-10 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                        <Activity size={28} className="text-primary" />
                      </div>
                      <h3 className="text-[20px] font-bold text-foreground tracking-tight leading-tight mb-2">Recovery OS</h3>
                      <p className="text-[13px] text-foreground-muted font-medium max-w-[280px] leading-snug">Dedicated environment for backlog clearance and attendance recovery planning.</p>
                      
                      <div className="mt-8">
                        <Badge variant="brand" size="sm">Coming Soon</Badge>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
}

