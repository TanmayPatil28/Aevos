"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useUSMStore } from "@/stores/usmStore";

import ExpandableTrustPanel from "@/components/dashboard/ExpandableTrustPanel";
import { AlertCircle, Target, TrendingUp, Compass, ArrowRight, RefreshCw, GraduationCap, Briefcase, LayoutGrid, Activity } from "lucide-react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import AnimatedCounter from "@/components/AnimatedCounter";
import DocumentVault from "@/components/DocumentVault";

// OS Views
const AcademicDashboardView = dynamic(() => import("@/components/dashboard/os-views/AcademicDashboardView"), { 
  ssr: false,
  loading: () => <div className="h-[600px] w-full rounded-[2rem] bg-zinc-900/50 animate-pulse border border-zinc-800" />
});
const CareerDashboardView = dynamic(() => import("@/components/dashboard/os-views/CareerDashboardView"), { 
  ssr: false,
  loading: () => <div className="h-[600px] w-full rounded-[2rem] bg-zinc-900/50 animate-pulse border border-zinc-800" />
});

const DataSyncDrawer = dynamic(() => import("@/components/dashboard/sync/DataSyncDrawer").then(mod => mod.DataSyncDrawer), { ssr: false });
const ResetDataButton = dynamic(() => import("@/components/dashboard/sync/DataSyncDrawer").then(mod => mod.ResetDataButton), { ssr: false });
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
  const [isSyncDrawerOpen, setIsSyncDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const hasHydratedRef = React.useRef(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const mode = store.workspaceUi.mode;

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
      setIsSyncDrawerOpen(true);
      // Clean up URL without reloading
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams]);

  if (!mounted) {
    return (
      <div className="w-full relative min-h-screen bg-black overflow-x-hidden selection:bg-[#0a84ff]/30 selection:text-white pb-40 font-sans">
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
      <div className="w-full relative min-h-screen bg-black overflow-x-hidden selection:bg-[#0a84ff]/30 selection:text-white pb-40 font-sans">
        <div className="px-6 md:px-12 max-w-[1400px] mx-auto min-h-[80vh] flex flex-col justify-center gap-12 relative z-10 pt-8">
          <DataSyncEngine isHero />
          
          <div className="max-w-md mx-auto w-full pt-8 border-t border-zinc-800 text-center">
            <p className="text-sm text-zinc-500 mb-4">Need to clear corrupted backend records? Note: this cannot be undone.</p>
            <div className="mx-auto max-w-xs">
              <ResetDataButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { interventions, workspaceContexts, healthScore } = store;
  
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
    <div className="w-full relative min-h-screen bg-black overflow-x-hidden selection:bg-[#0a84ff]/30 selection:text-white pb-40 font-sans">
      
      {/* Subtle Monochrome Gradient */}
      <motion.div 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] pointer-events-none z-0 opacity-30"
      >
      </motion.div>

      {/* Standardized Hero Section */}
      <section className="relative z-10 w-full flex flex-col items-start justify-center pt-16 pb-8 px-6 md:px-12 max-w-[1400px] mx-auto border-b border-zinc-800/50 mb-8">
        <div className="w-full flex flex-col items-start text-left gap-8">
          
          {/* Upper Header: Title, Description, and Mode Toggle */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 w-full">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                {isSimulation ? activeScenario.name : isRecovery ? "Get Back on Track" : isOptimization ? "Academic Strategy" : "Command Center"}
              </h1>
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
                {isSimulation 
                  ? "Strategy Sandbox Active. Your original academic records are safely locked." 
                  : isRecovery 
                    ? "We've mapped out a clear path to help you clear your backlogs and stabilize your grades." 
                    : "The intelligence engine tracks your academic margins in real-time. Explore precise recovery paths and career milestones to dominate your trajectory."}
              </p>
            </div>
            
            {/* Integrated Mode Toggle */}
            <div className="flex items-center bg-[#111] border border-zinc-800/80 rounded-full p-1.5 shadow-xl shrink-0 mt-2 lg:mt-0">
              <button
                onClick={() => setMode("OPTIMIZATION")}
                className={`relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${mode !== "FOCUS" ? "text-black" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                {mode !== "FOCUS" && (
                  <motion.div
                    layoutId="activeTabDashboardHeader"
                    className="absolute inset-0 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <GraduationCap size={16} className="relative z-10" />
                <span className="relative z-10">Academic</span>
              </button>
              
              <button
                onClick={() => setMode("FOCUS")}
                className={`relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${mode === "FOCUS" ? "text-black" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                {mode === "FOCUS" && (
                  <motion.div
                    layoutId="activeTabDashboardHeader"
                    className="absolute inset-0 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <Briefcase size={16} className="relative z-10" />
                <span className="relative z-10">Career</span>
              </button>
            </div>
          </div>
          
          {/* Lower Header: Secondary Filters and Health Widget */}
          <div className="w-full flex flex-wrap lg:flex-nowrap items-center justify-between gap-4">
            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar w-full lg:w-auto">
              <button 
                onClick={() => setActiveTab("overview")}
                className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${activeTab === "overview" ? "bg-white text-black" : "bg-[#111] border border-zinc-800/80 text-zinc-400 hover:text-white"}`}
              >
                <LayoutGrid className="w-4 h-4" /> Overview
              </button>
              <button 
                onClick={() => setActiveTab("critical")}
                className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${activeTab === "critical" ? "bg-white text-black" : "bg-[#111] border border-zinc-800/80 text-zinc-400 hover:text-white"}`}
              >
                Critical Issues
              </button>
              <button 
                onClick={() => setActiveTab("milestones")}
                className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${activeTab === "milestones" ? "bg-white text-black" : "bg-[#111] border border-zinc-800/80 text-zinc-400 hover:text-white"}`}
              >
                Upcoming Milestones
              </button>
              {isSimulation ? (
                <button 
                  onClick={() => store.clearSimulationScenarios()}
                  className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-500 hover:bg-rose-500/20 transition-all text-xs font-bold"
                >
                  Exit Sandbox
                </button>
              ) : (
                <button 
                  onClick={() => setActiveTab("simulations")}
                  className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${activeTab === "simulations" ? "bg-white text-black" : "bg-[#111] border border-zinc-800/80 text-zinc-400 hover:text-white"}`}
                >
                  Simulations
                </button>
              )}
            </div>
            
            {/* Right Side Widgets (Sync + Health) */}
            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={() => setIsSyncDrawerOpen(true)}
                className="flex items-center justify-center p-3 rounded-full bg-[#111] border border-zinc-800/80 text-zinc-500 hover:text-white transition-all shadow-lg"
                title="Sync Data"
              >
                <RefreshCw size={15} />
              </button>
              
              {healthScore && !isSimulation && mode !== "FOCUS" && (
                <div className="flex items-center gap-4 bg-[#111] border border-zinc-800/80 px-5 py-2.5 rounded-full shadow-lg">
                  <div className="flex items-center gap-2 border-r border-zinc-800/80 pr-4">
                    <Activity className={`w-4 h-4 ${healthScore.overall < 40 ? "text-rose-500" : healthScore.overall < 70 ? "text-amber-500" : "text-emerald-500"}`} />
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold hidden sm:inline">Health</span>
                    <span className={`text-[10px] uppercase tracking-widest font-black ${healthScore.overall < 40 ? "text-rose-500" : healthScore.overall < 70 ? "text-amber-500" : "text-emerald-500"}`}>
                      {healthScore.overall < 40 ? "CRITICAL" : healthScore.overall < 70 ? "AT RISK" : "OPTIMAL"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 hidden sm:inline">Score</span>
                    <span className="text-xs font-black text-white">{healthScore.overall.toFixed(1)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Desktop Content Area */}
      <div className="relative z-10 w-full px-6 md:px-12 max-w-[1400px] mx-auto space-y-8">
        
        {/* Priority Intervention Inbox */}
        {interventions.length > 0 && !isSimulation && activeTab !== "simulations" && (
          <div className="space-y-4">
            {(activeTab === "overview" || activeTab === "critical" || activeTab === "milestones") && (
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-zinc-500" />
                {activeTab === "critical" ? "Critical Issues" : activeTab === "milestones" ? "Milestones" : "Priority Action Inbox"}
              </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interventions
                .filter(inv => {
                  if (activeTab === "critical") return inv.type === "RISK" || inv.priorityTier === "CRITICAL";
                  if (activeTab === "milestones") return inv.type === "MILESTONE" || inv.type === "TARGET";
                  return true;
                })
                .map(inv => {
                const Icon = inv.type === "RISK" ? AlertCircle : inv.type === "MILESTONE" ? TrendingUp : Target;

                return (
                  <div key={inv.id} className={`p-6 rounded-[24px] bg-transparent border border-zinc-800 transition-colors hover:border-zinc-700`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2 text-white font-bold">
                        <Icon className="w-4 h-4 text-zinc-400" />
                        {inv.title}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                        {inv.priorityTier} PRIORITY
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 mb-4">{inv.description}</p>
                    
                    {inv.actionTrigger && (
                      <Link href={
                        inv.actionTrigger.toLowerCase().includes("backlog") ? "/backlog" :
                        inv.actionTrigger.toLowerCase().includes("placement") ? "/placement" :
                        inv.actionTrigger.toLowerCase().includes("attendance") ? "/attendance" :
                        inv.actionTrigger.toLowerCase().includes("forecast") ? "/forecast" :
                        "/planner"
                      } className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0a84ff] bg-[#0a84ff]/10 hover:bg-[#0a84ff]/20 px-3 py-1.5 rounded-full transition-colors w-max mt-2">
                        {inv.actionTrigger.toLowerCase().includes("backlog") ? "View Next Steps" : "Explore Options"}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}

                    <ExpandableTrustPanel explanation={inv.explanation} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Smart Morphing OS Views */}
        {(activeTab === "overview" || activeTab === "simulations") && (
          <AnimatePresence mode="wait">
            {mode !== "FOCUS" && (
              <AcademicDashboardView key="academic-view" />
            )}
            {mode === "FOCUS" && (
              <CareerDashboardView key="career-view" />
            )}
          </AnimatePresence>
        )}

        {/* 3. Sync Layer (Drawer) */}
        <DataSyncDrawer 
          isOpen={isSyncDrawerOpen} 
          onClose={() => setIsSyncDrawerOpen(false)} 
        />
      </div>
    </div>
  );
}

