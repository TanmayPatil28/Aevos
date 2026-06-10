"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useUSMStore } from "@/stores/usmStore";

import ExpandableTrustPanel from "@/components/dashboard/ExpandableTrustPanel";
import { AlertCircle, Target, TrendingUp, Activity, Compass, ArrowRight, Briefcase, LayoutGrid } from "lucide-react";
import { AcademicIdentityBar } from "@/components/dashboard/identity/AcademicIdentityBar";
import WorkspaceContent from "@/components/layout/WorkspaceContent";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { PageHero } from "@/components/ui/PageHero";
import AnimatedCounter from "@/components/AnimatedCounter";
import DocumentVault from "@/components/DocumentVault";

// OS Views
const AcademicDashboardView = dynamic(() => import("@/components/dashboard/os-views/AcademicDashboardView"), { 
  ssr: false,
  loading: () => <div className="h-[600px] w-full rounded-[2rem] bg-white/5 animate-pulse border border-white/10" />
});
const CareerDashboardView = dynamic(() => import("@/components/dashboard/os-views/CareerDashboardView"), { 
  ssr: false,
  loading: () => <div className="h-[600px] w-full rounded-[2rem] bg-white/5 animate-pulse border border-white/10" />
});
const UnifiedDashboardView = dynamic(() => import("@/components/dashboard/os-views/UnifiedDashboardView"), { 
  ssr: false,
  loading: () => <div className="h-[600px] w-full rounded-[2rem] bg-white/5 animate-pulse border border-white/10" />
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
      <div className="relative min-h-screen bg-black">
        <WorkspaceContent className="space-y-8 relative z-10 pt-8 pb-24">
          <div className="h-16 w-full rounded-2xl bg-white/5 animate-pulse border border-white/10" />
          <div className="h-32 w-full max-w-2xl rounded-2xl bg-white/5 animate-pulse border border-white/10" />
          <div className="h-[600px] w-full rounded-[2rem] bg-white/5 animate-pulse border border-white/10" />
        </WorkspaceContent>
      </div>
    );
  }

  // Adaptive Empty State
  if (!store.identity.hasAuthoritativeData) {
    return (
      <WorkspaceContent className="min-h-[80vh] flex flex-col justify-center gap-12">
        <DataSyncEngine isHero />
        
        <div className="max-w-md mx-auto w-full pt-8 border-t border-white/5 text-center">
          <p className="text-sm text-slate-500 mb-4">Need to clear corrupted backend records? Note: this cannot be undone.</p>
          <div className="mx-auto max-w-xs">
            <ResetDataButton />
          </div>
        </div>
      </WorkspaceContent>
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
    <div className="relative min-h-screen bg-black">
      {/* Immersive Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/20 mix-blend-screen blur-[120px] rounded-full animate-[ambient-pulse-1_10s_ease-in-out_infinite]"
          style={{ willChange: "transform, opacity", transform: "translateZ(0)" }}
        />
        <div 
          className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] bg-blue-500/10 mix-blend-screen blur-[120px] rounded-full animate-[ambient-pulse-2_15s_ease-in-out_2s_infinite]"
          style={{ willChange: "transform, opacity", transform: "translateZ(0)" }}
        />
      </div>

      <WorkspaceContent className="space-y-8 relative z-10 pb-24">
        
        {/* 1. Identity Layer */}
        <AcademicIdentityBar onSyncClick={() => setIsSyncDrawerOpen(true)} />

        {/* 2. Intelligence Layer */}
        
        {/* Contextual Header replaced with PageHero */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-8">
          <PageHero
            headline={isSimulation ? activeScenario.name : isRecovery ? "Get Back on Track" : isOptimization ? "Optimize Your Grades" : "Academic Overview"}
            description={isSimulation ? "Strategy Sandbox Active. Your original academic records are safely locked." : isRecovery ? "We've mapped out a clear path to help you clear your backlogs and stabilize your grades." : "Your academic standing is healthy. Focus on CGPA optimization and strategic skill acquisition."}
            className="mb-0 max-w-2xl"
          />
          
          {/* Academic Health Score Mini Widget using AnimatedCounter */}
          {healthScore && !isSimulation && mode !== "career" && (
            <div className="hidden md:flex flex-col items-end bg-[#1c1c1e]/60 backdrop-blur-xl p-4 rounded-3xl border border-white/10 ring-1 ring-white/5">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-1">Health Score</span>
              <div className="flex items-baseline gap-1">
                <AnimatedCounter target={healthScore.overall} className="text-4xl font-black text-white" />
                <span className="text-sm text-slate-500">/100</span>
              </div>
            </div>
          )}
          
          {isSimulation && (
            <button 
              onClick={() => store.clearSimulationScenarios()}
              className="px-6 py-3 bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 ring-1 ring-white/5 hover:bg-white/10 text-white rounded-full text-sm font-bold transition-all"
            >
              Exit Sandbox
            </button>
          )}
        </div>

      {/* Priority Intervention Inbox */}
      {interventions.length > 0 && !isSimulation && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            Priority Action Inbox
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interventions.map(inv => {
              const tierColor = 
                inv.priorityTier === "CRITICAL" ? "border-rose-500/50 bg-rose-500/5" :
                inv.priorityTier === "HIGH" ? "border-amber-500/50 bg-amber-500/5" :
                "border-indigo-500/30 bg-indigo-500/5";
              
              const Icon = inv.type === "RISK" ? AlertCircle : inv.type === "MILESTONE" ? TrendingUp : Target;

              return (
                <div key={inv.id} className={`p-5 rounded-xl border ${tierColor}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 text-white font-bold">
                      <Icon className="w-4 h-4 opacity-80" />
                      {inv.title}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                      {inv.priorityTier} PRIORITY
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 mb-4">{inv.description}</p>
                  
                  {inv.actionTrigger && (
                    <Link href={
                      inv.actionTrigger.toLowerCase().includes("backlog") ? "/backlog" :
                      inv.actionTrigger.toLowerCase().includes("placement") ? "/placement" :
                      inv.actionTrigger.toLowerCase().includes("attendance") ? "/attendance" :
                      inv.actionTrigger.toLowerCase().includes("forecast") ? "/forecast" :
                      "/planner"
                    } className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded transition-colors w-max mt-2">
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
      <AnimatePresence mode="wait">
        {mode === "academic" && (
          <AcademicDashboardView key="academic-view" />
        )}
        {mode === "career" && (
          <CareerDashboardView key="career-view" />
        )}
        {mode === "unified" && (
          <UnifiedDashboardView key="unified-view" />
        )}
      </AnimatePresence>



      {/* 3. Sync Layer (Drawer) */}
      <DataSyncDrawer 
        isOpen={isSyncDrawerOpen} 
        onClose={() => setIsSyncDrawerOpen(false)} 
      />

      </WorkspaceContent>

      {/* Floating Dynamic Island Mode Toggle */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-[#1c1c1e]/80 backdrop-blur-xl border border-white/10 rounded-full p-1.5 flex items-center shadow-2xl ring-1 ring-white/5">
          <button
            onClick={() => setMode("academic")}
            aria-label="Academic Mode"
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
              mode === "academic" ? "bg-white text-black shadow-md" : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span className="hidden md:inline">Academic</span>
          </button>
          <button
            onClick={() => setMode("unified")}
            aria-label="Unified Mode"
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
              mode === "unified" ? "bg-white text-black shadow-md" : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden md:inline">Unified</span>
          </button>
          <button
            onClick={() => setMode("career")}
            aria-label="Career Mode"
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
              mode === "career" ? "bg-white text-black shadow-md" : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span className="hidden md:inline">Career</span>
          </button>
        </div>
      </div>
    </div>
  );
}
