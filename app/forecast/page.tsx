"use client";

import { useState, useEffect, useMemo } from "react";
import { useUSMStore } from "@/stores/usmStore";
import { selectVolatility, selectTrajectorySlope, selectDerivedGPA } from "@/stores/selectors";
import { scenarioFactory } from "@/lib/forecasting/scenarioFactory";
import TrajectoryChart from "@/components/forecast/TrajectoryChart";
import ScenarioSelector from "@/components/forecast/ScenarioSelector";
import ProjectionTable from "@/components/forecast/ProjectionTable";
import PageContainer from "@/components/layout/PageContainer";
import Link from "next/link";
import { LineChart as ChartIcon, AlertCircle, Info, Activity, ShieldAlert, Award } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { demoPersonas } from "@/lib/demo/demo-personas";
import toast from "react-hot-toast";
import { getPresetById } from "@/lib/presets/presetRegistry";

export default function ForecastPage() {
  const [mounted, setMounted] = useState(false);
  const [activeScenarioId, setActiveScenarioId] = useState("maintain");
  
  const store = useUSMStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const { presetId, academic, semesterHistory } = store;
  const { currentCgpa, earnedCredits, targetCgpa, completedSemesters } = academic;

  // Derive academic statistics
  const volatility = useMemo(() => {
    if (!mounted) return 0;
    return selectVolatility(store);
  }, [mounted, store]);

  const slope = useMemo(() => {
    if (!mounted) return 0;
    return selectTrajectorySlope(store);
  }, [mounted, store]);

  const derivedGpa = useMemo(() => {
    if (!mounted) return { sgpa: 0, cgpa: 0, percentage: 0 };
    return selectDerivedGPA(store);
  }, [mounted, store]);

  // Generate scenarios and projections
  const forecastData = useMemo(() => {
    if (!mounted) return null;

    const preset = getPresetById(presetId);
    
    // Fallbacks and smart derivations
    const totalProgramSemesters = 8;
    const creditsPerSemester = preset?.defaultCreditsPerSem || 20;

    // Use latest semester's SGPA if available, else current CGPA
    let latestSgpa = currentCgpa;
    if (semesterHistory && semesterHistory.length > 0) {
      // Sort history to get the absolute latest semester entry
      const sortedHistory = [...semesterHistory].sort((a, b) => b.semester - a.semester);
      latestSgpa = sortedHistory[0].sgpa;
    } else if (derivedGpa.sgpa > 0) {
      latestSgpa = derivedGpa.sgpa;
    }

    const input = {
      currentCgpa,
      completedSemesters,
      earnedCredits,
      targetCgpa,
      totalProgramSemesters,
      creditsPerSemester,
      currentSgpa: latestSgpa,
      volatility
    };

    try {
      const scenarios = scenarioFactory.generateAll(input, presetId);
      return {
        scenarios,
        input
      };
    } catch (err) {
      console.error("Failed to generate forecast trajectories:", err);
      return null;
    }
  }, [mounted, presetId, currentCgpa, completedSemesters, earnedCredits, targetCgpa, semesterHistory, volatility, derivedGpa]);

  // Loading state during hydration
  if (!mounted) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 text-[#4F8EF7] border-2 border-[#4F8EF7] border-t-transparent rounded-full" />
          <p className="text-white/60 text-sm">Initializing visual forecast engine...</p>
        </div>
      </PageContainer>
    );
  }

  // Handle loading demo persona directly for easy verification
  const loadDemo = (personaId: string) => {
    const persona = demoPersonas[personaId];
    if (!persona) return;
    
    store.stopSimulation();
    store.resetSimulation();
    
    store.setPresetId(persona.presetId);
    store.setAcademic(persona.academic);
    store.setCourses(persona.courses);
    store.setSemesterHistory(persona.semesterHistory);
    store.setCareer(persona.career);
    store.setRisk(persona.risk);
    
    toast.success(`Loaded demo persona: ${persona.name} (${persona.role})`);
  };

  const hasHistory = semesterHistory && semesterHistory.length > 0;
  const activeScenario = forecastData?.scenarios.find(s => s.id === activeScenarioId);

  return (
    <PageContainer className="relative z-10 space-y-10">
      {/* Background decorations */}
      <div className="fixed top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-500/5 rounded-full blur-[120px] mix-blend-screen -z-10 pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-violet-500/5 rounded-full blur-[120px] mix-blend-screen -z-10 pointer-events-none" />

      {/* Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-indigo-400 text-xs font-bold tracking-widest uppercase mb-2">
          <ChartIcon size={14} />
          Academic Visual Projector
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-sm font-headline">
          Academic Forecast Trajectory
        </h1>
        <p className="text-white/60 text-base md:text-lg leading-relaxed">
          Project your final graduation CGPA across remaining semesters. Analyze three custom scenarios (Steady Improvement, Maintain, Decline Risk) alongside historic grade volatility.
        </p>
      </div>

      {!hasHistory ? (
        <GlassCard className="max-w-2xl mx-auto border border-white/5 text-center p-8 space-y-6" interactive={false}>
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
            <AlertCircle size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">No Semester History Found</h3>
            <p className="text-sm text-white/50 max-w-md mx-auto">
              Your profile doesn&apos;t contain semester history records required to analyze volatility and project trends. Import your academic JSON or load a demo profile to start.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <Link href="/import">
              <button className="px-6 py-3 rounded-full bg-gradient-to-r from-[#4F8EF7] to-blue-600 text-white font-bold text-sm hover:shadow-[0_0_20px_rgba(79,142,247,0.4)] transition-all">
                Upload Academic History
              </button>
            </Link>
            <div className="flex gap-2 justify-center">
              <button 
                onClick={() => loadDemo("arjun")}
                className="px-4 py-3 rounded-full border border-white/10 text-white font-bold text-sm bg-white/5 hover:bg-white/10 transition-colors"
              >
                Load Arjun (High CGPA)
              </button>
              <button 
                onClick={() => loadDemo("rahul")}
                className="px-4 py-3 rounded-full border border-white/10 text-white font-bold text-sm bg-white/5 hover:bg-white/10 transition-colors"
              >
                Load Rahul (Declining/Risk)
              </button>
            </div>
          </div>
        </GlassCard>
      ) : (
        <>
          {/* Quick Metrics Bar & Derived Analytics */}
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <span className="text-[10px] text-white/40 uppercase font-semibold">Current CGPA</span>
              <div className="text-xl font-bold text-white mt-1">{currentCgpa.toFixed(2)}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <span className="text-[10px] text-white/40 uppercase font-semibold">Target CGPA</span>
              <div className="text-xl font-bold text-[#4F8EF7] mt-1">{targetCgpa.toFixed(2)}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <span className="text-[10px] text-white/40 uppercase font-semibold">Completed</span>
              <div className="text-xl font-bold text-white mt-1">{completedSemesters} Semesters</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center relative group">
              <div className="flex items-center justify-center gap-1">
                <span className="text-[10px] text-white/40 uppercase font-semibold">Historic Volatility</span>
                <Info size={10} className="text-white/30 cursor-help" />
              </div>
              <div className="text-xl font-bold text-indigo-300 mt-1 flex items-baseline justify-center gap-1">
                <span>{volatility.toFixed(2)}</span>
                <span className="text-[10px] text-white/40">σ</span>
              </div>
              {/* Tooltip description */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 border border-white/10 text-[10px] text-white/70 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-30 shadow-xl">
                Standard deviation of your historic SGPAs. Lower values (e.g. &lt; 0.2) indicate consistent academic performance.
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center relative group">
              <div className="flex items-center justify-center gap-1">
                <span className="text-[10px] text-white/40 uppercase font-semibold">Trajectory Slope</span>
                <Info size={10} className="text-white/30 cursor-help" />
              </div>
              <div className="text-xl font-bold mt-1 flex items-baseline justify-center gap-1">
                <span className={slope > 0 ? "text-emerald-400" : slope < 0 ? "text-red-400" : "text-white/60"}>
                  {slope > 0 ? `+${slope.toFixed(2)}` : slope.toFixed(2)}
                </span>
              </div>
              {/* Tooltip description */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 border border-white/10 text-[10px] text-white/70 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-30 shadow-xl">
                Linear regression slope of your SGPA history. Positive values represent an improving trend over semesters.
              </div>
            </div>
          </div>

          {/* Interactive Chart Container */}
          {forecastData && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h3 className="text-xl font-headline font-bold text-white flex items-center gap-2">
                  <Activity size={20} className="text-[#4F8EF7]" />
                  Visual Cumulative Projections
                </h3>
                <div className="text-xs text-white/50 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-1.5">
                  <ShieldAlert size={12} className="text-indigo-400" />
                  Shaded interval highlights volatility limits for: <span className="font-semibold text-indigo-300">{activeScenario?.name}</span>
                </div>
              </div>

              <TrajectoryChart
                scenarios={forecastData.scenarios}
                activeScenarioId={activeScenarioId}
                targetCgpa={targetCgpa}
                currentCgpa={currentCgpa}
                completedSemesters={completedSemesters}
              />
            </div>
          )}

          {/* Scenario Tabs Selector */}
          {forecastData && (
            <div className="max-w-5xl mx-auto space-y-4">
              <h3 className="text-xl font-headline font-bold text-white flex items-center gap-2">
                <Award size={20} className="text-[#4F8EF7]" />
                Select Projection Assumption
              </h3>
              <ScenarioSelector
                scenarios={forecastData.scenarios}
                activeScenarioId={activeScenarioId}
                setActiveScenarioId={setActiveScenarioId}
              />
            </div>
          )}

          {/* Tabular Projections */}
          {activeScenario && (
            <div className="max-w-5xl mx-auto space-y-4 pt-4">
              <div className="flex justify-between items-baseline">
                <h3 className="text-xl font-headline font-bold text-white">
                  Semester Breakdown Details
                </h3>
                <span className="text-xs text-white/40">
                  Assumption: SGPA = <span className="font-semibold text-white">{activeScenario.assumedSgpa.toFixed(2)}</span> per semester
                </span>
              </div>
              <ProjectionTable
                projections={activeScenario.projections}
                targetCgpa={targetCgpa}
              />
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
}
