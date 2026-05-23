"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUSMStore } from "@/stores/usmStore";
import { selectActiveCourses, selectDerivedGPA, selectSemesterCredits } from "@/stores/selectors/academic";
import ExpandableTrustPanel from "@/components/dashboard/ExpandableTrustPanel";
import AcademicTimeline from "@/components/dashboard/AcademicTimeline";
import { AlertCircle, Target, TrendingUp, Activity, Compass, ArrowRight } from "lucide-react";
import { AcademicIdentityBar } from "@/components/dashboard/identity/AcademicIdentityBar";
import { DataSyncDrawer } from "@/components/dashboard/sync/DataSyncDrawer";
import { DataSyncEngine } from "@/components/dashboard/sync/DataSyncEngine";

export default function DashboardClient() {
  const store = useUSMStore();
  const searchParams = useSearchParams();
  const [isSyncDrawerOpen, setIsSyncDrawerOpen] = useState(false);

  const activeCourses = selectActiveCourses(store);
  const { cgpa, percentage } = selectDerivedGPA(store);
  const credits = selectSemesterCredits(store);
  const activeScenario = store.simulation?.activeScenarios?.find(s => s.id === store.simulation?.selectedScenarioId);

  // Auto-evaluate interventions if empty but we have authoritative data
  useEffect(() => {
    if (store.identity.hasAuthoritativeData && store.interventions.length === 0) {
      store.evaluateInterventions();
    }
  }, [store.identity.hasAuthoritativeData, store]);

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
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 min-h-[80vh] flex flex-col justify-center">
        <DataSyncEngine isHero />
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

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      
      {/* 1. Identity Layer */}
      <AcademicIdentityBar onSyncClick={() => setIsSyncDrawerOpen(true)} />

      {/* 2. Intelligence Layer */}
      
      {/* Contextual Header */}
      <div className={`p-6 rounded-2xl border bg-gradient-to-r ${headerTheme} transition-colors duration-500`}>
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2 block">
              {isSimulation ? "Strategy Sandbox Active" : "Academic Command Center"}
            </span>
            <h1 className="text-3xl font-black text-white">
              {isSimulation 
                ? activeScenario.name 
                : isRecovery 
                  ? "Recovery Protocol Active" 
                  : isOptimization 
                    ? "Optimization Trajectory" 
                    : "Academic Overview"}
            </h1>
            <p className="text-sm mt-2 opacity-80 max-w-2xl">
              {isSimulation 
                ? "You are viewing a projected simulation overlay. Authoritative data is protected."
                : isRecovery 
                  ? "Your academic health requires immediate attention. Focus on clearing backlogs and stabilizing momentum."
                  : "Your academic standing is healthy. Focus on CGPA optimization and strategic skill acquisition."}
            </p>
          </div>
          
          {/* Academic Health Score Mini Widget */}
          {healthScore && !isSimulation && (
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
                    <button className="flex items-center gap-1.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded transition-colors">
                      {inv.actionTrigger.includes("backlog") ? "Launch Recovery Plan" : "Open Optimizer"}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <ExpandableTrustPanel explanation={inv.explanation} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* KPI Grid & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[#000000] border border-slate-800 p-6 rounded-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5"><Activity className="w-16 h-16" /></div>
              <div className="text-sm text-slate-500 uppercase font-bold tracking-wider mb-2">Active CGPA</div>
              <div className="text-4xl font-black text-white">{cgpa.toFixed(2)}</div>
              {percentage > 0 && <div className="text-xs text-indigo-400 mt-2 font-mono">≈ {percentage.toFixed(2)}% Equivalent</div>}
            </div>
            
            <div className="bg-[#000000] border border-slate-800 p-6 rounded-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5"><TrendingUp className="w-16 h-16" /></div>
              <div className="text-sm text-slate-500 uppercase font-bold tracking-wider mb-2">Sem Credits</div>
              <div className="text-4xl font-black text-white">{credits.totalActiveCredits}</div>
              <div className="text-xs text-slate-400 mt-2">Active Semester Load</div>
            </div>
          </div>
          
          <div className="bg-[#000000] border border-slate-800 p-6 rounded-xl">
            <h3 className="text-lg font-bold text-white mb-6">Active Course Ledger</h3>
            <div className="space-y-3">
              {activeCourses.map(course => (
                <div key={course.id} className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/5">
                  <div>
                    <div className="font-bold text-white text-sm">{course.name}</div>
                    <div className="text-xs font-mono text-slate-400">{course.code}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-indigo-300">{course.credits} Cr</div>
                    {course.grade && <div className="text-xs font-bold text-emerald-400">Grade: {course.grade}</div>}
                  </div>
                </div>
              ))}
              {activeCourses.length === 0 && (
                <div className="text-sm text-slate-500 text-center py-4">No active courses available.</div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <AcademicTimeline history={store.semesterHistory} />
        </div>
      </div>

      {/* 3. Sync Layer (Drawer) */}
      <DataSyncDrawer 
        isOpen={isSyncDrawerOpen} 
        onClose={() => setIsSyncDrawerOpen(false)} 
      />

    </div>
  );
}
