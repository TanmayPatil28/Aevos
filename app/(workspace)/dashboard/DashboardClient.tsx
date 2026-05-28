"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useUSMStore } from "@/stores/usmStore";
import { selectActiveCourses, selectDerivedGPA, selectSemesterCredits } from "@/stores/selectors/academic";
import ExpandableTrustPanel from "@/components/dashboard/ExpandableTrustPanel";
import AcademicTimeline from "@/components/dashboard/AcademicTimeline";
import { AlertCircle, Target, TrendingUp, Activity, Compass, ArrowRight, Briefcase, ShieldCheck, LineChart, LayoutGrid } from "lucide-react";
import { AcademicIdentityBar } from "@/components/dashboard/identity/AcademicIdentityBar";
import WorkspaceContent from "@/components/layout/WorkspaceContent";
import WorkspaceSection from "@/components/layout/WorkspaceSection";
import CalendarManager from "@/components/dashboard/CalendarManager";
import dynamic from "next/dynamic";
import { useOSMode } from "@/contexts/OSModeContext";
import { AnimatePresence } from "framer-motion";

// OS Views
import AcademicDashboardView from "@/components/dashboard/os-views/AcademicDashboardView";
import CareerDashboardView from "@/components/dashboard/os-views/CareerDashboardView";
import UnifiedDashboardView from "@/components/dashboard/os-views/UnifiedDashboardView";

const DataSyncDrawer = dynamic(() => import("@/components/dashboard/sync/DataSyncDrawer").then(mod => mod.DataSyncDrawer), { ssr: false });
const DataSyncEngine = dynamic(() => import("@/components/dashboard/sync/DataSyncEngine").then(mod => mod.DataSyncEngine), { ssr: false });
import { diagnostics } from "@/lib/diagnostics";

export default function DashboardClient({
  initialCalculations = [],
  initialPlans = [],
  initialEnrollments = []
}: {
  initialCalculations?: any[];
  initialPlans?: any[];
  initialEnrollments?: any[];
}) {
  const store = useUSMStore();
  const searchParams = useSearchParams();
  const [isSyncDrawerOpen, setIsSyncDrawerOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  
  const { mode } = useOSMode();

  const activeCourses = selectActiveCourses(store);
  const { cgpa, percentage } = selectDerivedGPA(store);
  const credits = selectSemesterCredits(store);
  const activeScenario = store.simulation?.activeScenarios?.find(s => s.id === store.simulation?.selectedScenarioId);

  // Auto-evaluate interventions if empty but we have authoritative data
  useEffect(() => {
    // EMERGENCY FIX: If local storage is corrupted with 60+ semesters from the old timeline bug, nuke it.
    if (store.semesterHistory.length > 20) {
      localStorage.removeItem("gradeflow-usm-storage");
      window.location.reload();
      return;
    }

    if (store.identity.hasAuthoritativeData && store.interventions.length === 0) {
      store.evaluateInterventions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.identity.hasAuthoritativeData, store.interventions.length]);

// Hydrate store from server props
  useEffect(() => {
    if (process.env.NODE_ENV === "development") diagnostics.info("DashboardClient", `Hydration Effect triggered. hasHydrated: ${hasHydrated}`);
    if (!hasHydrated) {
      if (process.env.NODE_ENV === "development") diagnostics.info("DashboardClient", `Starting bootstrap. Server Calculations: ${initialCalculations.length}, Server Enrollments: ${initialEnrollments.length}`);
      if (initialCalculations.length > 0 || initialEnrollments.length > 0) {
        let semesterHistory: any[] = [];
        let courses: any[] = [];
        
        // Identify which semesters are locked by the authoritative snapshot
        const authoritativeSemesters = store.identity.hasAuthoritativeData 
             ? new Set(store.semesterHistory.map(s => s.semester))
             : new Set();
             
        let startingSemester = 1;
        if (store.identity.hasAuthoritativeData && store.semesterHistory.length > 0) {
          startingSemester = Math.max(...store.semesterHistory.map(s => s.semester)) + 1;
        }

        const multiSem = initialCalculations.find((c: any) => c.semester.startsWith("Multi-Sem"));
        if (multiSem && Array.isArray(multiSem.subjects)) {
          semesterHistory = multiSem.subjects.map((s: any, i: number) => ({
            semester: startingSemester + i,
            sgpa: Number(s.sgpa) || 0,
            credits: Number(s.credits) || 0,
            earnedCredits: Number(s.credits) || 0
          }));
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
              const parsedSem = s.semester.match(/\d+/) ? parseInt(s.semester.match(/\d+/)[0]) : startingSemester + i;
              
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
      if (process.env.NODE_ENV === "development") console.log("[QA Instrumentation] Hydration complete. Setting hasHydrated to true.");
      setHasHydrated(true);
    }
  }, [hasHydrated, initialCalculations, initialEnrollments, store]);

  // Handle URL parameters for routing redirects
  useEffect(() => {
    if (searchParams.get("sync") === "true") {
      setIsSyncDrawerOpen(true);
      // Clean up URL without reloading
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams]);

  // Adaptive Empty State
  if (!store.identity.hasAuthoritativeData) {
    return (
      <WorkspaceContent className="min-h-[80vh] flex flex-col justify-center">
        <DataSyncEngine isHero />
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

  return (
    <WorkspaceContent className="space-y-8">
      
      {/* 1. Identity Layer */}
      <AcademicIdentityBar onSyncClick={() => setIsSyncDrawerOpen(true)} />

      {/* 2. Intelligence Layer */}
      
      {/* Contextual Header */}
      <div className={`p-6 rounded-2xl border bg-gradient-to-r ${headerTheme} transition-colors duration-500`}>
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2 block">
              {isSimulation ? "Strategy Sandbox Active" : "Your Dashboard"}
            </span>
            <h1 className="text-3xl font-black text-white">
              {isSimulation 
                ? activeScenario.name 
                : isRecovery 
                  ? "Get Back on Track" 
                  : isOptimization 
                    ? "Optimize Your Grades" 
                    : "Academic Overview"}
            </h1>
            <p className="text-sm mt-2 opacity-80 max-w-2xl">
              {isSimulation 
                ? "You are in sandbox mode. Your original academic records are safely locked."
                : isRecovery 
                  ? "We've mapped out a clear path to help you clear your backlogs and stabilize your grades."
                  : "Your academic standing is healthy. Focus on CGPA optimization and strategic skill acquisition."}
            </p>
          </div>
          
          {/* Academic Health Score Mini Widget (Only in Academic/Unified) */}
          {healthScore && !isSimulation && mode !== "career" && (
            <div className="hidden md:flex flex-col items-end bg-black/20 p-4 rounded-xl border border-white/10">
              <span className="text-xs uppercase tracking-wider opacity-70">Health Score</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">{healthScore.overall}</span>
                <span className="text-sm opacity-50">/100</span>
              </div>
            </div>
          )}
        </div>

        {isSimulation && (
          <button 
            onClick={() => store.clearSimulationScenarios()}
            className="mt-4 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded text-xs font-bold transition-colors"
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
  );
}
