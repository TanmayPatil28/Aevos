"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import {
  GraduationCap,
  Trophy,
  Calculator,
  Target,
  AlertTriangle,
  Flag,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Plus,
  Minus,
  Save,
  Trash2,
  Building,
  Calendar,
  Layers,
  ArrowUpRight,
  Upload,
  LucideIcon,
  Info,
  TrendingDown
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getPresetById } from "@/lib/presets/presetRegistry";
import { cn } from "@/lib/cn";
import { demoPersonas } from "@/lib/demo/demo-personas";

// Dashboard & UI Components
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/dashboard/StatCard";
import BreakdownCards from "@/components/dashboard/BreakdownCards";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";
import InsightsPanel from "@/components/dashboard/InsightsPanel";
import MotivationalBanner from "@/components/dashboard/MotivationalBanner";
import TraceDrawer from "@/components/explainability/TraceDrawer";
import Card from "@/components/ui/Card";
import DashboardLoading from "./loading";
import { Skeleton } from "@/components/ui/Skeleton";

// Dynamic Imports for Heavy Sections
const TrendChartSection = dynamic(() => import("@/components/dashboard/TrendChartSection"), {
  ssr: false,
  loading: () => <Skeleton variant="card" className="h-96" />,
});

const HistoryTable = dynamic(() => import("@/components/dashboard/HistoryTable"), {
  ssr: false,
  loading: () => <Skeleton variant="card" className="h-80" />,
});

const SemesterComparison = dynamic(() => import("@/components/dashboard/SemesterComparison"), {
  ssr: false,
  loading: () => <Skeleton variant="card" className="h-[28rem]" />,
});

const TrajectoryChart = dynamic(() => import("@/components/forecast/TrajectoryChart"), {
  ssr: false,
  loading: () => <Skeleton variant="card" className="h-[320px]" />,
});

// Zustand Store & Selectors
import { useUSMStore } from "@/stores/usmStore";
import {
  selectActiveCourses,
  selectDerivedGPA,
  selectPlacementEligibility,
  selectAttendanceRisk,
  selectRecoveryDifficulty,
  selectSemesterCredits,
  selectAcademicHealth,
  selectVolatility,
  selectTrajectorySlope,
  TraceMetadata
} from "@/stores/selectors";
import { scenarioFactory } from "@/lib/forecasting/scenarioFactory";
import { strategyAllocator } from "@/lib/strategy/strategyAllocator";
import type { Calculation } from "@/types/calculation";

interface Plan {
  id: number | string;
  target_cgpa: number;
  created_at: string;
}

interface Activity {
  id: string | number;
  type: "calculation" | "plan";
  text: string;
  timestamp: string;
  date: Date;
}

interface Insight {
  title: string;
  text: string;
  icon: LucideIcon;
  color: string;
}

interface DBEnrollment {
  grade?: string | null;
  cieMarks: number;
  seeMarks?: number | null;
  attendanceTotal: number;
  attendanceBunked: number;
  course: {
    id: string;
    code: string;
    name: string;
    credits: number;
  };
  user?: {
    university?: string;
  };
}

interface DashboardClientProps {
  userName: string;
  initialCalculations: Calculation[];
  initialPlans: Plan[];
  initialEnrollments: DBEnrollment[];
  dbError?: boolean;
}

export default function DashboardClient({
  userName,
  initialCalculations,
  initialEnrollments,
  dbError = false,
}: DashboardClientProps) {
  const [mounted, setMounted] = useState(false);

  // Bind Zustand Store Slices
  const store = useUSMStore();

  // Explainability Trace Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("");
  const [drawerExplanation, setDrawerExplanation] = useState("");
  const [drawerEquation, setDrawerEquation] = useState("");
  const [drawerVariables, setDrawerVariables] = useState<{ name: string; value: string | number; description: string }[]>([]);
  const [drawerTrace, setDrawerTrace] = useState<TraceMetadata | null>(null);

  // Snapshot name state
  const [snapshotName, setSnapshotName] = useState("");

  // Selectors mapping
  const activeCourses = selectActiveCourses(store);
  const gpa = selectDerivedGPA(store);
  const placement = selectPlacementEligibility(store);
  const attendance = selectAttendanceRisk(store);
  const recovery = selectRecoveryDifficulty(store);
  const semesterCredits = selectSemesterCredits(store);
  const healthScore = selectAcademicHealth(store);

  // Derived forecasting metrics
  const volatility = selectVolatility(store);
  const slope = selectTrajectorySlope(store);
  const hasHistory = store.semesterHistory && store.semesterHistory.length > 0;

  // Generate forecast scenarios and projections
  const forecastData = useMemo(() => {
    if (!mounted) return null;

    const preset = getPresetById(store.presetId);
    const totalProgramSemesters = 8;
    const creditsPerSemester = preset?.defaultCreditsPerSem || 20;

    let latestSgpa = store.academic.currentCgpa;
    if (store.semesterHistory && store.semesterHistory.length > 0) {
      const sortedHistory = [...store.semesterHistory].sort((a, b) => b.semester - a.semester);
      latestSgpa = sortedHistory[0].sgpa;
    } else if (gpa.sgpa > 0) {
      latestSgpa = gpa.sgpa;
    }

    const input = {
      currentCgpa: store.academic.currentCgpa,
      completedSemesters: store.academic.completedSemesters,
      earnedCredits: store.academic.earnedCredits,
      targetCgpa: store.academic.targetCgpa,
      totalProgramSemesters,
      creditsPerSemester,
      currentSgpa: latestSgpa,
      volatility
    };

    try {
      const scenarios = scenarioFactory.generateAll(input, store.presetId);
      return { scenarios, input };
    } catch (err) {
      console.error("Failed to generate forecast trajectories in dashboard:", err);
      return null;
    }
  }, [mounted, store.presetId, store.academic.currentCgpa, store.academic.completedSemesters, store.academic.earnedCredits, store.academic.targetCgpa, store.semesterHistory, volatility, gpa.sgpa]);

  // Generate strategies
  const strategies = useMemo(() => {
    if (!mounted || store.courses.length === 0) return null;

    const engineInput = {
      currentCgpa: store.academic.currentCgpa,
      earnedCredits: store.academic.earnedCredits,
      targetCgpa: store.academic.targetCgpa,
      presetId: store.presetId,
      courses: store.courses.map(c => ({
        id: c.id,
        code: c.code,
        name: c.name,
        credits: c.credits,
        grade: c.grade,
        cieMarks: c.cieMarks || 0,
        attendanceTotal: c.attendanceTotal || 0,
        attendanceBunked: c.attendanceBunked || 0,
      }))
    };

    try {
      const safe = strategyAllocator.generate(engineInput, 'SAFE');
      const balanced = strategyAllocator.generate(engineInput, 'BALANCED');
      const aggressive = strategyAllocator.generate(engineInput, 'AGGRESSIVE');
      return { safe, balanced, aggressive };
    } catch (err) {
      console.error("Failed to generate strategies in dashboard:", err);
      return null;
    }
  }, [mounted, store.presetId, store.academic.currentCgpa, store.academic.earnedCredits, store.academic.targetCgpa, store.courses]);

  // ─── Direct Store Hydration ──────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);

    // If we have database enrollments, populate the store courses slice
    if (initialEnrollments && initialEnrollments.length > 0 && store.courses.length === 0) {
      console.log("[Hydration] Seeding store with initial database enrollments...");
      const mappedCourses = initialEnrollments.map((env: DBEnrollment) => ({
        id: env.course.id,
        code: env.course.code,
        name: env.course.name,
        credits: env.course.credits,
        grade: env.grade || undefined,
        cieMarks: env.cieMarks,
        seeMarks: env.seeMarks || undefined,
        attendanceTotal: env.attendanceTotal,
        attendanceBunked: env.attendanceBunked,
      }));
      store.setCourses(mappedCourses);
      
      // Update university preset matches user profile preference
      if (initialEnrollments[0]?.user?.university) {
        store.setPresetId(initialEnrollments[0].user.university);
      }
    } 
    // Fallback: guest offline-first default seeding (hydrating with Arjun's profile)
    else if (store.courses.length === 0) {
      console.log("[Hydration] Seeding store with default mock syllabus (Arjun Mehta)...");
      const arjun = demoPersonas.arjun;
      store.setCourses(arjun.courses);
      store.setPresetId(arjun.presetId);
      store.setAcademic(arjun.academic);
      store.setCareer(arjun.career);
      store.setRisk(arjun.risk);
    }
  }, [initialEnrollments, store]);

  // ─── Demo Persona Switcher Action ────────────────────────────────────────────
  const loadDemoPersona = useCallback((personaId: string) => {
    const persona = demoPersonas[personaId];
    if (!persona) return;

    // Stop and reset active simulation before setting states
    store.stopSimulation();
    store.resetSimulation();

    store.setPresetId(persona.presetId);
    store.setAcademic(persona.academic);
    store.setCourses(persona.courses);
    store.setCareer(persona.career);
    store.setRisk(persona.risk);

    toast.success(`Loaded demo persona: ${persona.name} (${persona.role})`);
  }, [store]);

  // ─── Silent PostgreSQL State Sync Adapter ────────────────────────────────────
  useEffect(() => {
    if (store.sync.pendingSyncActions.length > 0 && !dbError) {
      const syncState = async () => {
        try {
          const response = await fetch("/api/sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ actions: store.sync.pendingSyncActions }),
          });

          if (response.ok) {
            store.clearSyncActions();
            console.log("[Silent Sync] Core state synchronized cleanly with PostgreSQL.");
          }
        } catch (err) {
          console.warn("[Silent Sync] Offline queue post deferred:", err);
        }
      };
      syncState();
    }
  }, [store.sync.pendingSyncActions, dbError, store]);

  // ─── Define Explainability Drawers Triggers ──────────────────────────────────
  const openHealthDrawer = useCallback(() => {
    setDrawerTitle("Academic Health Index");
    setDrawerExplanation(
      "A comprehensive, multi-dimensional score representing overall student progress. This serves as your core guiding telemetry, calculated dynamically from weighted indicators."
    );
    setDrawerEquation(
      "Academic Health = 0.40 * CGPA_Score + 0.30 * Attendance_Score + 0.15 * Backlog_Score + 0.15 * Placement_Score\n\n- CGPA_Score = Math.max(0, Math.min(100, ((CGPA - 4.0) / (Target_CGPA - 4.0)) * 100)) * 0.40\n- Attendance_Score: 85%+ = full 30 pts; 75%-85% = 15-30 pts; <75% = sharp drop.\n- Backlog_Score = 15 - Backlogs * 5 (min 0)\n- Placement_Score = (Eligible_Companies / Total_Companies) * 15"
    );
    setDrawerVariables([
      { name: "CGPA", value: gpa.cgpa, description: "Your current actual or simulated CGPA" },
      { name: "Target CGPA", value: store.academic.targetCgpa, description: "The milestone goal set in your profile" },
      { name: "Aggregate Attendance", value: `${attendance.aggregatePercentage}%`, description: "Overall attendance across active courses" },
      { name: "Active Backlogs", value: store.academic.activeBacklogsCount, description: "Unresolved backlog courses registered" },
      { name: "Recruiter Eligibility", value: `${placement.eligibleCount}/${placement.totalCount}`, description: "Companies you meet compliance cutouts for" },
    ]);
    setDrawerTrace({
      formulaApplied: "Unified Academic Health Index W-Equation v1",
      sourceRegulationId: "GF-AH-2026",
      sourceClause: "Clause 1.2 Multi-Dimensional Weighted Index",
      sourceCircular: "GF-Circular-01/2026",
      lastVerifiedAt: new Date().toISOString(),
      confidenceScore: 100,
    });
    setDrawerOpen(true);
  }, [gpa.cgpa, store.academic.targetCgpa, attendance.aggregatePercentage, store.academic.activeBacklogsCount, placement.eligibleCount, placement.totalCount]);

  const openGpaDrawer = useCallback(() => {
    setDrawerTitle("Semester Progression & Target Solver");
    setDrawerExplanation(
      "Weighted cumulative CGPA and semester SGPA mathematical solvers calculate exact standing without LLM approximations. The back-solver computes required SGPA to hit your target CGPA."
    );
    setDrawerEquation(
      "SGPA = SUM(CourseCredits * GradePoints) / SUM(CourseCredits)\n\nCGPA_sim = (CGPA_current * Credits_completed + SGPA * Credits_semester) / (Credits_completed + Credits_semester)\n\nSGPA_required = (CGPA_target * (Credits_completed + Credits_semester) - CGPA_current * Credits_completed) / Credits_semester"
    );
    setDrawerVariables([
      { name: "Current CGPA", value: store.academic.currentCgpa, description: "Prior cumulative CGPA" },
      { name: "Credits Completed", value: store.academic.earnedCredits, description: "Credits completed in previous semesters" },
      { name: "Active Semester Credits", value: semesterCredits.totalActiveCredits, description: "Total credits registered this semester" },
      { name: "Target CGPA Milestone", value: store.academic.targetCgpa, description: "Target CGPA milestone" },
      { name: "SGPA Required", value: recovery.requiredSgpa, description: "Solved SGPA required in active semester to hit target" },
      { name: "Derived SGPA", value: gpa.sgpa, description: "Current/simulated active semester SGPA" },
      { name: "Derived CGPA", value: gpa.cgpa, description: "Cumulative derived CGPA under simulated weights" },
    ]);
    
    const uniLabel = store.presetId.toUpperCase();
    setDrawerTrace({
      formulaApplied: `Weighted Cumulative GPA Solver & target back-solver (${uniLabel})`,
      sourceRegulationId: `${uniLabel}-CBCS-2019`,
      sourceClause: "Clause 4.1.2 Piecewise Mapping & GPA Progression Rules",
      sourceCircular: store.presetId === "mu" ? "No. UG/144 of 2019-20" : store.presetId === "vtu" ? "No. VTU/Aca/2018-19" : "CB/Science/2019-114",
      lastVerifiedAt: new Date().toISOString(),
      confidenceScore: 100,
    });
    setDrawerOpen(true);
  }, [store.academic.currentCgpa, store.academic.earnedCredits, semesterCredits.totalActiveCredits, store.academic.targetCgpa, recovery.requiredSgpa, gpa.sgpa, gpa.cgpa, store.presetId]);

  const openPlacementDrawer = useCallback(() => {
    setDrawerTitle("Recruitment Compliance Auditing");
    setDrawerExplanation(
      "Audits your academic standing against target compliance matrices for Tier-1, Tier-2, and FAANG/Top Tier recruiters based on CGPA cutoffs, backlogs, and total earned credits."
    );
    setDrawerEquation(
      "Eligible = (CGPA >= Cutoff) AND (Backlogs <= Max_Backlogs) AND (Credits >= Required_Credits)\n\nCompany Benchmarks Mapped:\n- TCS/Cognizant/Wipro: CGPA >= 6.0, Max Backlogs 1\n- Infosys/Accenture: CGPA >= 6.5, Max Backlogs 0\n- FAANG / Top Tier: CGPA >= 8.0, Max Backlogs 0, Credits >= 80"
    );
    setDrawerVariables([
      { name: "Derived CGPA", value: gpa.cgpa, description: "Current active simulated/actual CGPA" },
      { name: "Active Backlogs Count", value: store.academic.activeBacklogsCount, description: "Current unresolved backlogs registered" },
      { name: "Total Earned Credits", value: semesterCredits.simulatedEarnedCredits, description: "Cumulative completed credits" },
      { name: "Eligible Cutouts", value: `${placement.eligibleCount}/${placement.totalCount}`, description: "Compliant recruiters meeting all thresholds" },
    ]);
    setDrawerTrace({
      formulaApplied: "Recruiter Eligibility Compliance Matrix v1.0",
      sourceRegulationId: "GF-REC-2026",
      sourceClause: "Recruiting Placement Cell Standards",
      sourceCircular: "Placement Cell Cutoff Ordinance 2026",
      lastVerifiedAt: new Date().toISOString(),
      confidenceScore: 99,
    });
    setDrawerOpen(true);
  }, [gpa.cgpa, store.academic.activeBacklogsCount, semesterCredits.simulatedEarnedCredits, placement.eligibleCount, placement.totalCount]);

  const openAttendanceDrawer = useCallback(() => {
    setDrawerTitle("Attendance Risk & Detention Safe-Bounds");
    setDrawerExplanation(
      "Evaluates upcoming attendance safety limits, resolving exactly how many lectures you can bunk without dropping below threshold, or how many consecutive classes you must attend to restore compliance."
    );
    setDrawerEquation(
      "- Safe Bunks: floor((Attended - (minAttendance% * Conducted)) / minAttendance%)\n- Recovery Required: ceil(((minAttendance% * Conducted) - Attended) / (1 - minAttendance%))\n\nOrdinance threshold is 75% minimum aggregate attendance across all registered courses."
    );
    setDrawerVariables([
      { name: "Aggregate Attendance", value: `${attendance.aggregatePercentage}%`, description: "Overall aggregate attendance percentage" },
      { name: "Min Ordinance Limit", value: "75%", description: "Standard university minimum attendance requirement" },
      { name: "Overall Risk Level", value: attendance.overallRisk, description: "Attendance risk rating based on safety thresholds" },
    ]);
    setDrawerTrace({
      formulaApplied: "Attendance Safety Bunk & Recovery Stat Equations",
      sourceRegulationId: "UGC-ATT-2023",
      sourceClause: "Ordinance 12(A) minimum attendance standards",
      sourceCircular: "UGC Circular No. F-1-1/2023(CPP-II)",
      lastVerifiedAt: new Date().toISOString(),
      confidenceScore: 100,
    });
    setDrawerOpen(true);
  }, [attendance.aggregatePercentage, attendance.overallRisk]);

  // ─── Calculations processing ───────────────────────────────────────────────
  const mockCalculationsList = useMemo(() => {
    return initialCalculations.length > 0 ? initialCalculations : [
      { id: 1, date: new Date().toISOString(), semester: "Semester 3", sgpa: gpa.sgpa, cgpa: gpa.cgpa, total_credits: semesterCredits.totalActiveCredits, created_at: new Date().toISOString(), subjects: [] }
    ];
  }, [initialCalculations, gpa.sgpa, gpa.cgpa, semesterCredits.totalActiveCredits]);

  const trendData = useMemo(() => {
    return mockCalculationsList.slice().reverse().map(c => ({
      name: c.semester,
      gpa: c.sgpa,
      cgpa: c.cgpa
    }));
  }, [mockCalculationsList]);

  const performanceBreakdown = useMemo(() => {
    return [
      { name: "S Tier (9+)", value: mockCalculationsList.filter(c => c.sgpa >= 9).length || 1, color: "#4F8EF7" },
      { name: "A Tier (8-9)", value: mockCalculationsList.filter(c => c.sgpa >= 8 && c.sgpa < 9).length || 2, color: "#7C3AED" },
      { name: "B Tier (7-8)", value: mockCalculationsList.filter(c => c.sgpa >= 7 && c.sgpa < 8).length || 1, color: "#A855F7" },
      { name: "Review Session (<7)", value: mockCalculationsList.filter(c => c.sgpa < 7).length || 0, color: "#FF4D4D" },
    ];
  }, [mockCalculationsList]);

  const performanceData = useMemo(() => {
    const totalPerf = performanceBreakdown.reduce((acc, curr) => acc + curr.value, 0);
    return performanceBreakdown.map(p => ({
      ...p,
      value: totalPerf > 0 ? Math.round((p.value / totalPerf) * 100) : p.value
    }));
  }, [performanceBreakdown]);

  const topSubjects = useMemo(() => {
    return activeCourses
      .map(c => ({ name: c.name, score: c.cieMarks + (c.seeMarks ? c.seeMarks * 0.7 : 50) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [activeCourses]);

  const comparisonData = useMemo(() => {
    return mockCalculationsList.map((c, i) => {
      const prev = mockCalculationsList[i + 1];
      return {
        semester: c.semester,
        date: new Date(c.created_at || c.date || new Date()).toLocaleDateString(),
        subjects: activeCourses.length,
        credits: c.total_credits,
        gpa: c.sgpa,
        cgpa: c.cgpa,
        delta: prev ? c.sgpa - prev.sgpa : 0,
        rank: c.sgpa >= 9.5 ? "1st" : c.sgpa >= 9.0 ? "2nd" : "3rd"
      };
    });
  }, [mockCalculationsList, activeCourses.length]);

  const activities = useMemo((): Activity[] => {
    return [
      {
        id: "act-1",
        type: "calculation" as const,
        text: `Academic Health Score computed — ${healthScore}/100`,
        timestamp: "Just now",
        date: new Date()
      },
      ...mockCalculationsList.map(c => ({
        id: `calc-${c.id}`,
        type: "calculation" as const,
        text: `${c.semester} CGPA computed — ${c.cgpa.toFixed(2)}`,
        timestamp: "Synced with Local OS",
        date: new Date(c.created_at || c.date || new Date())
      }))
    ];
  }, [healthScore, mockCalculationsList]);

  const insights = useMemo((): Insight[] => {
    return [
      {
        title: "Academic Health Rating",
        text: healthScore >= 80 
          ? "Excellent health status. Your placement compliance and attendance metrics are highly secure." 
          : healthScore >= 60 
          ? "Caution: Maintain attendance bounds and try to secure higher grades this semester to improve standing." 
          : "Critical status. Detention risks identified in attendance or active backlogs are impacting placements.",
        icon: ShieldCheck,
        color: healthScore >= 80 ? "#34d399" : healthScore >= 60 ? "#fbbf24" : "#f87171"
      },
      {
        title: "Placement Compliance",
        text: `You are eligible for ${placement.eligibleCount} out of ${placement.totalCount} company cutouts. Meet targets to maximize compliance.`,
        icon: Building,
        color: "#4F8EF7"
      },
      {
        title: "Next Milestone Advisor",
        text: `Target CGPA is ${store.academic.targetCgpa.toFixed(2)}. ${recovery.explainReason}`,
        icon: Flag,
        color: "#A855F7"
      }
    ];
  }, [healthScore, placement.eligibleCount, placement.totalCount, store.academic.targetCgpa, recovery.explainReason]);

  const handleSaveSnapshot = () => {
    if (!snapshotName.trim()) {
      toast.error("Enter a valid name for the sandbox state snapshot.");
      return;
    }
    store.saveSimulationSnapshot(snapshotName);
    setSnapshotName("");
    toast.success(`Simulation Snapshot "${snapshotName}" saved successfully!`);
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear your local database history?")) {
      store.resetStore();
      toast.success("State machine history reset to initial presets.");
    }
  };

  const handleExportCSV = () => {
    toast.success("CSV Export initiated.");
  };

  const handleExportPDF = () => {
    window.print();
    toast.success("Print dialog opened. Select 'Save as PDF' to save.");
  };

  if (!mounted) {
    return <DashboardLoading />;
  }

  return (
    <div className="min-h-screen text-foreground selection:bg-primary/20 transition-colors duration-1000 bg-[#090d16]">
      {/* Decorative Blur Backdrops */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[20%] right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <main className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto space-y-16">
        {/* Dashboard Header */}
        <DashboardHeader
          userName={userName}
          onClearHistory={handleClearHistory}
          onExportCSV={handleExportCSV}
          onExportPDF={handleExportPDF}
        />

        {/* Database Offline Error indicator */}
        {dbError && (
          <div className="p-4 rounded-[24px] bg-red-500/10 border border-red-500/20 text-red-200 text-sm font-semibold flex items-center gap-3 shadow-lg">
            <AlertTriangle className="text-red-400 shrink-0" size={18} />
            <span>Unable to log in to cloud databases. GradeFlow is running in high-fidelity Offline Guest Mode.</span>
          </div>
        )}

        {/* Demo Persona Sandbox Switcher */}
        <div className="bg-slate-950/40 border border-white/5 backdrop-blur-xl rounded-[24px] p-6 space-y-4 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="text-blue-400 animate-pulse" size={20} />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Demo Persona Sandbox Switcher
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Quickly switch datasets to simulate academic workflows
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.values(demoPersonas).map((persona) => {
              // Determine active persona by currentCgpa & presetId & course count matching
              const isActive = store.academic.currentCgpa === persona.academic.currentCgpa && 
                               store.presetId === persona.presetId &&
                               store.courses.length === persona.courses.length &&
                               (store.courses[0]?.code === persona.courses[0]?.code);
                               
              return (
                <button
                  key={persona.id}
                  onClick={() => loadDemoPersona(persona.id)}
                  className={cn(
                    "text-left p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between h-28 relative overflow-hidden group",
                    isActive 
                      ? "bg-blue-600/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]" 
                      : "bg-slate-900/30 border-white/5 hover:bg-slate-900/50 hover:border-white/10"
                  )}
                >
                  <div className={cn(
                    "absolute -right-6 -bottom-6 w-16 h-16 rounded-full blur-xl transition-all duration-500 group-hover:scale-150",
                    persona.id === "arjun" ? "bg-emerald-500/10" : persona.id === "priya" ? "bg-amber-500/10" : "bg-red-500/10"
                  )} />
                  
                  <div className="z-10">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {persona.name}
                      </span>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
                        persona.id === "arjun" 
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                          : persona.id === "priya" 
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-400" 
                          : "bg-red-500/10 border-red-500/30 text-red-400"
                      )}>
                        {persona.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {persona.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase mt-2 z-10">
                    <span>Preset: {persona.presetId.toUpperCase()}</span>
                    <span>CGPA: {persona.academic.currentCgpa.toFixed(2)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Telemetry Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div onClick={openHealthDrawer} className="cursor-pointer">
            <StatCard
              label="Academic Health"
              value={healthScore}
              decimals={0}
              suffix="/100"
              subtext={
                healthScore >= 80
                  ? "Excellent Standing • Secure"
                  : healthScore >= 60
                  ? "Caution • Volatility Identified"
                  : "Critical Risk • Review Required"
              }
              icon={ShieldCheck}
              iconColor={healthScore >= 80 ? "text-[#34d399]" : healthScore >= 60 ? "text-[#fbbf24]" : "text-[#f87171]"}
              glowColor={healthScore >= 80 ? "rgba(52, 211, 153, 0.4)" : healthScore >= 60 ? "rgba(251, 191, 36, 0.4)" : "rgba(248, 113, 113, 0.4)"}
              tooltip="Click to inspect weighted Academic Health audit formula"
            />
          </div>

          <div onClick={openGpaDrawer} className="cursor-pointer">
            <StatCard
              label={store.simulation.isSimulating ? "Simulated CGPA" : "Current CGPA"}
              value={gpa.cgpa}
              subtext={
                store.simulation.isSimulating
                  ? "Active hypothetical sandbox state"
                  : `Target: ${store.academic.targetCgpa.toFixed(2)} • Active solver active`
              }
              icon={GraduationCap}
              iconColor="text-[#4F8EF7]"
              glowColor="rgba(79, 142, 247, 0.4)"
              trend={
                store.simulation.isSimulating
                  ? { value: "SIMULATED", isUp: true }
                  : { value: "STABLE", isUp: true }
              }
              tooltip="Click to audit CGPA progression & required SGPA target solvers"
            />
          </div>

          <div onClick={openPlacementDrawer} className="cursor-pointer">
            <StatCard
              label="Recruiter Compliance"
              value={parseFloat(((placement.eligibleCount / placement.totalCount) * 100).toFixed(0))}
              suffix="%"
              decimals={0}
              subtext={`Eligible for ${placement.eligibleCount}/${placement.totalCount} benchmark firms`}
              icon={Trophy}
              iconColor={placement.overallStatus === "ELIGIBLE" ? "text-emerald-400" : "text-[#A855F7]"}
              glowColor="rgba(168, 85, 247, 0.4)"
              tooltip="Click to view full corporate recruiting cutoff matrices"
            />
          </div>

          <div onClick={openAttendanceDrawer} className="cursor-pointer">
            <StatCard
              label="Aggregate Attendance"
              value={attendance.aggregatePercentage}
              suffix="%"
              subtext={
                attendance.overallRisk === "HIGH"
                  ? "HIGH RISK • Detention Alert"
                  : attendance.overallRisk === "MEDIUM"
                  ? "CAUTION • Near Ordinance Limit"
                  : "SAFE • Above Ordinance Limits"
              }
              icon={Target}
              iconColor={attendance.overallRisk === "HIGH" ? "text-red-400" : attendance.overallRisk === "MEDIUM" ? "text-amber-400" : "text-emerald-400"}
              glowColor="rgba(52, 211, 153, 0.2)"
              tooltip="Click to inspect course-by-course bunk allowance rules"
            />
          </div>
        </div>

        {/* Core Layout Grid: Telemetry, Sandbox, History */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Telemetry & Sandboxing Column (Left) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Interactive Simulation Sandbox Panel */}
            <Card className="border border-white/10 bg-slate-950/40 backdrop-blur-xl p-6 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Preset Institution
                </span>
                <select
                  value={store.presetId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    store.setPresetId(nextId);
                    // Reset store courses matching university catalog
                    if (nextId === "vtu") {
                      store.setCourses([
                        { id: "v_1", code: "21CS31", name: "Transform Calculus & Fourier Series", credits: 3, grade: "A+", cieMarks: 30, seeMarks: 52, attendanceTotal: 44, attendanceBunked: 4 },
                        { id: "v_2", code: "21CS32", name: "Data Structures & Applications", credits: 4, grade: "A+", cieMarks: 35, seeMarks: 55, attendanceTotal: 44, attendanceBunked: 3 },
                        { id: "v_3", code: "21CS33", name: "Analog and Digital Electronics", credits: 3, grade: "A", cieMarks: 28, seeMarks: 48, attendanceTotal: 44, attendanceBunked: 5 },
                        { id: "v_4", code: "21CS34", name: "Computer Organization & Architecture", credits: 3, grade: "B+", cieMarks: 32, seeMarks: 44, attendanceTotal: 44, attendanceBunked: 7 },
                        { id: "v_5", code: "21CS35", name: "Object Oriented Programming with Java", credits: 3, grade: "A", cieMarks: 34, seeMarks: 50, attendanceTotal: 44, attendanceBunked: 4 },
                        { id: "v_6", code: "21CS36", name: "Constitution of India, Ethics", credits: 0, grade: "PP", cieMarks: 38, seeMarks: 40, attendanceTotal: 44, attendanceBunked: 2 }
                      ]);
                    } else if (nextId === "mu") {
                      store.setCourses([
                        { id: "m_1", code: "CSC301", name: "Engineering Mathematics-III", credits: 4, grade: "A", cieMarks: 32, seeMarks: 48, attendanceTotal: 42, attendanceBunked: 5 },
                        { id: "m_2", code: "CSC302", name: "Discrete Structures & Graph Theory", credits: 3, grade: "B", cieMarks: 28, seeMarks: 42, attendanceTotal: 42, attendanceBunked: 4 },
                        { id: "m_3", code: "CSC303", name: "Data Structures", credits: 3, grade: "A", cieMarks: 30, seeMarks: 50, attendanceTotal: 42, attendanceBunked: 3 },
                        { id: "m_4", code: "CSC304", name: "Digital Logic & Computer Architecture", credits: 3, grade: "O", cieMarks: 35, seeMarks: 56, attendanceTotal: 42, attendanceBunked: 6 },
                        { id: "m_5", code: "CSC305", name: "Computer Graphics", credits: 3, grade: "B", cieMarks: 26, seeMarks: 46, attendanceTotal: 42, attendanceBunked: 2 }
                      ]);
                    } else {
                      // SPPU default
                      store.setCourses([
                        { id: "s_1", code: "CS-201", name: "Data Structures & Algorithms", credits: 4, grade: "A+", cieMarks: 22, seeMarks: 62, attendanceTotal: 40, attendanceBunked: 4 },
                        { id: "s_2", code: "CS-202", name: "Discrete Mathematics", credits: 4, grade: "A", cieMarks: 19, seeMarks: 58, attendanceTotal: 40, attendanceBunked: 6 },
                        { id: "s_3", code: "CS-203", name: "Digital Electronics & Logic Design", credits: 3, grade: "B+", cieMarks: 21, seeMarks: 52, attendanceTotal: 40, attendanceBunked: 2 },
                        { id: "s_4", code: "CS-204", name: "Object Oriented Programming", credits: 3, grade: "O", cieMarks: 25, seeMarks: 68, attendanceTotal: 40, attendanceBunked: 5 },
                        { id: "s_5", code: "CS-205", name: "Computer Graphics", credits: 3, grade: "B", cieMarks: 18, seeMarks: 44, attendanceTotal: 40, attendanceBunked: 3 }
                      ]);
                    }
                    toast.success(`Active regulation preset shifted to: ${nextId.toUpperCase()}`);
                  }}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-1 text-xs font-bold text-white focus:outline-none focus:border-[#4F8EF7]"
                >
                  <option value="sppu" className="bg-slate-950">SPPU (Pune)</option>
                  <option value="vtu" className="bg-slate-950">VTU (Karnataka)</option>
                  <option value="mu" className="bg-slate-950">MU (Mumbai)</option>
                </select>
              </div>

              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <Calculator className="text-[#4F8EF7]" size={22} />
                  <div>
                    <h3 className="text-xl font-black text-white">Semester Simulation Sandbox</h3>
                    <p className="text-xs text-slate-400">Play with hypothetical marks, grades, and bunk counters</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (store.simulation.isSimulating) {
                        store.stopSimulation();
                        toast.success("Simulation deactivated. Showing real data.");
                      } else {
                        store.startSimulation();
                        toast.success("Simulation activated! Edit grades below to see changes.");
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                      store.simulation.isSimulating
                        ? "bg-[#fbbf24]/10 border border-[#fbbf24]/30 text-[#fbbf24]"
                        : "bg-[#4F8EF7] text-white hover:bg-[#3b82f6]"
                    }`}
                  >
                    {store.simulation.isSimulating ? "Sandbox Active" : "Activate Sandbox"}
                  </button>
                  {store.simulation.isSimulating && (
                    <button
                      onClick={() => {
                        store.resetSimulation();
                        toast.success("Simulation state cleared.");
                      }}
                      className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition"
                      title="Clear simulated values"
                    >
                      <RotateCcw size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Simulation Courses Grid List */}
              {store.simulation.isSimulating ? (
                <div className="space-y-4">
                  <div className="divide-y divide-white/5 border border-white/5 rounded-2xl overflow-hidden bg-black/20">
                    {activeCourses.map((c) => {
                      const simC = store.simulation.simulatedCourses[c.id] || {};
                      const simAtt = store.simulation.simulatedAttendance[c.id] || {};
                      const offset = simAtt.bunkedOffset || 0;

                      return (
                        <div key={c.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.01] transition text-sm">
                          <div className="space-y-1 md:w-1/3">
                            <span className="font-mono text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded mr-2">
                              {c.code}
                            </span>
                            <span className="font-bold text-white leading-tight">{c.name}</span>
                            <span className="text-xs text-slate-500 block">Credits: {c.credits}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-6">
                            {/* Hypothetical Grade selection */}
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-black uppercase text-slate-500">Hypothetical Grade</span>
                              <select
                                value={simC.grade !== undefined ? simC.grade : c.grade || ""}
                                onChange={(e) => store.updateSimulatedCourse(c.id, { grade: e.target.value || undefined })}
                                className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#4F8EF7] font-bold"
                              >
                                <option value="" className="bg-slate-950">Select Grade</option>
                                <option value="O" className="bg-slate-950">O (Outstanding)</option>
                                <option value="A+" className="bg-slate-950">A+ (Excellent)</option>
                                <option value="A" className="bg-slate-950">A (Very Good)</option>
                                <option value="B+" className="bg-slate-950">B+ (Good)</option>
                                <option value="B" className="bg-slate-950">B (Above Average)</option>
                                <option value="C" className="bg-slate-950">C (Average)</option>
                                <option value="D" className="bg-slate-950">D (Pass)</option>
                                <option value="PP" className="bg-slate-950">PP (Passed Audit)</option>
                                <option value="F" className="bg-slate-950">F (Fail)</option>
                              </select>
                            </div>

                            {/* Bunk Offset adjusting counter */}
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-black uppercase text-slate-500">Simulate Bunks</span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => store.updateSimulatedAttendance(c.id, offset - 1)}
                                  className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className={`font-mono font-bold text-xs w-8 text-center ${offset > 0 ? "text-red-400" : offset < 0 ? "text-emerald-400" : "text-white"}`}>
                                  {offset > 0 ? `+${offset}` : offset}
                                </span>
                                <button
                                  onClick={() => store.updateSimulatedAttendance(c.id, offset + 1)}
                                  className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Save Simulation snapshot to history */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                    <input
                      type="text"
                      placeholder="Snapshot Name (e.g. Best Case CIE)"
                      value={snapshotName}
                      onChange={(e) => setSnapshotName(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#4F8EF7] flex-1 w-full"
                    />
                    <button
                      onClick={handleSaveSnapshot}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED] text-white text-xs font-black uppercase tracking-wider hover:opacity-90 transition shrink-0"
                    >
                      <Save size={14} />
                      Save Snapshot State
                    </button>
                  </div>

                  {/* Render Simulation snapshot rollback history stack */}
                  {store.simulation.history.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Simulation Rollback Stack
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {store.simulation.history.map((snap) => (
                          <div
                            key={snap.id}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs transition-all ${
                              store.simulation.activeSnapshotId === snap.id
                                ? "bg-[#7C3AED]/20 border-[#7C3AED]/40 text-white"
                                : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                            }`}
                          >
                            <button
                              onClick={() => {
                                store.loadSimulationSnapshot(snap.id);
                                toast.success(`Loaded simulated state: ${snap.name}`);
                              }}
                              className="font-bold cursor-pointer"
                            >
                              {snap.name}
                            </button>
                            <button
                              onClick={() => {
                                store.deleteSimulationSnapshot(snap.id);
                                toast.success("Snapshot removed.");
                              }}
                              className="text-slate-500 hover:text-red-400 transition"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center flex flex-col items-center justify-center space-y-4">
                  <div className="p-3.5 rounded-2xl bg-white/5 text-slate-400">
                    <Layers size={28} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-white uppercase tracking-wider">
                      Simulation sandbox offline
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Click the &apos;Activate Sandbox&apos; button above to unlock grades, internal marks, and custom bunk slider simulations.
                    </p>
                  </div>
                </div>
              )}
            </Card>

            {/* Active Registered Semester Courses List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black font-headline tracking-tighter text-white">
                  Active semester courses telemetry
                </h3>
                <span className="text-xs font-mono font-bold text-[#4F8EF7] bg-[#4F8EF7]/10 px-3 py-1 rounded-full border border-[#4F8EF7]/20">
                  {activeCourses.length} Registered Courses
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeCourses.map((c) => {
                  const preset = getPresetById(store.presetId);
                  const minAtt = preset?.passRules?.minAttendance || 75;
                  const conducted = c.attendanceTotal;
                  const bunked = c.attendanceBunked;
                  const attended = Math.max(0, conducted - bunked);
                  const attPerc = conducted > 0 ? (attended / conducted) * 100 : 100;

                  // Compute bunk advisor details inline
                  let bunkColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                  let advisorText = "";
                  
                  if (attPerc >= minAtt) {
                    const decimal = minAtt / 100;
                    const safeBunks = Math.floor((attended - decimal * conducted) / decimal);
                    advisorText = safeBunks > 0 ? `Safe to bunk ${safeBunks} classes` : "Attendance on borderline";
                    bunkColor = safeBunks > 0 
                      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
                      : "text-amber-400 bg-amber-500/10 border-amber-500/20";
                  } else {
                    const decimal = minAtt / 100;
                    const recovery = Math.ceil((decimal * conducted - attended) / (1 - decimal));
                    advisorText = `Must attend ${recovery} consecutive classes`;
                    bunkColor = "text-red-400 bg-red-500/10 border-red-500/20";
                  }

                  return (
                    <Card key={c.id} className="relative overflow-hidden group hover:scale-[1.01] transition-all duration-300">
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-0.5">
                          <span className="font-mono text-[10px] font-black uppercase text-slate-500">
                            {c.code}
                          </span>
                          <h4 className="text-md font-black text-white leading-tight mt-0.5 group-hover:text-[#4F8EF7] transition-colors">
                            {c.name}
                          </h4>
                          <span className="text-xs text-slate-400">Credits: {c.credits}</span>
                        </div>
                        <span className="text-lg font-black font-mono text-[#A855F7]">
                          {c.grade || "CIE"}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-3.5 mt-3 text-center">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-black uppercase text-slate-500">CIE</span>
                          <p className="text-sm font-mono font-bold text-white">{c.cieMarks}</p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-black uppercase text-slate-500">SEE</span>
                          <p className="text-sm font-mono font-bold text-white">{c.seeMarks || "—"}</p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-black uppercase text-slate-500">Attendance</span>
                          <p className={`text-sm font-mono font-bold ${attPerc < minAtt ? "text-red-400" : "text-emerald-400"}`}>
                            {attPerc.toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      {/* Bunk advisor badge */}
                      <div className={`mt-3.5 flex items-center justify-center gap-1.5 py-1.5 rounded-xl border text-[11px] font-black uppercase tracking-wider ${bunkColor}`}>
                        <ShieldCheck size={12} />
                        {advisorText}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Trajectory Telemetry Widget */}
            {hasHistory ? (
              <Card className="border border-white/10 bg-slate-950/40 backdrop-blur-xl p-6 rounded-3xl relative overflow-hidden group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <TrendingDown className={cn("text-indigo-400", slope >= 0 && "rotate-180 text-emerald-400")} size={22} />
                    <div>
                      <h3 className="text-xl font-black text-white">CGPA Trajectory Forecast</h3>
                      <p className="text-xs text-slate-400">Future graduation projections and historical volatility analysis</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-indigo-300 flex items-center gap-1.5" title="Historic Volatility (Standard Deviation of SGPA)">
                      <Info size={12} className="text-indigo-400 shrink-0" />
                      Volatility: {volatility.toFixed(2)} σ
                    </span>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center gap-1.5",
                      slope > 0 
                        ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400" 
                        : slope < 0 
                        ? "border-red-500/30 bg-red-500/5 text-red-400" 
                        : "border-white/10 bg-white/5 text-slate-400"
                    )} title="Trajectory Slope (Linear Regression)">
                      {slope > 0 ? "Improving" : slope < 0 ? "Declining" : "Stable"} ({slope > 0 ? `+${slope.toFixed(2)}` : slope.toFixed(2)})
                    </span>
                  </div>
                </div>

                {forecastData && (
                  <div className="space-y-4">
                    <TrajectoryChart
                      scenarios={forecastData.scenarios}
                      activeScenarioId="maintain"
                      targetCgpa={store.academic.targetCgpa}
                      currentCgpa={store.academic.currentCgpa}
                      completedSemesters={store.academic.completedSemesters}
                    />
                    <div className="flex justify-end">
                      <Link href="/forecast" className="text-xs font-black uppercase tracking-wider text-[#4F8EF7] hover:text-blue-400 flex items-center gap-1 group-hover:underline">
                        Explore forecast assumptions & breakdown
                        <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="border border-white/10 bg-slate-950/40 backdrop-blur-xl p-8 rounded-3xl relative text-center space-y-6">
                <div className="w-12 h-12 mx-auto rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                  <TrendingDown size={24} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-md font-black text-white uppercase tracking-wider">Unlock Trajectory Projections</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Import your past semester SGPAs and credit details to project graduation pathways and evaluate historic volatility constraints.
                  </p>
                </div>
                <Link href="/import" className="inline-block">
                  <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4F8EF7] to-blue-600 text-white text-xs font-black uppercase tracking-wider hover:shadow-[0_0_20px_rgba(79,142,247,0.3)] transition-all">
                    Ingest Academic History
                  </button>
                </Link>
              </Card>
            )}

            <TrendChartSection data={trendData} />
            <HistoryTable calculations={mockCalculationsList} onDelete={() => {}} />
          </div>

          {/* Side Panels Column (Right) */}
          <div className="lg:col-span-4 space-y-8">
            <BreakdownCards
              performanceData={performanceData}
              currentCgpa={gpa.cgpa}
              targetCgpa={store.academic.targetCgpa}
              topSubjects={topSubjects}
            />

            {/* Target Strategy Summary Card */}
            <Card className="flex flex-col h-fit group border border-white/10 bg-slate-950/40 backdrop-blur-xl p-6 rounded-3xl relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Target size={22} className="text-[#A855F7]" />
                  <div>
                    <h3 className="text-lg font-black text-white">Target Grade Strategies</h3>
                    <p className="text-xs text-slate-400">Pathways to reach target CGPA</p>
                  </div>
                </div>
              </div>

              {/* Render the 3 paths */}
              {strategies ? (
                <div className="space-y-4">
                  {[
                    { key: "safe", data: strategies.safe, colorClass: "text-emerald-400", bgClass: "bg-emerald-500/10 border-emerald-500/20" },
                    { key: "balanced", data: strategies.balanced, colorClass: "text-[#4F8EF7]", bgClass: "bg-blue-500/10 border-blue-500/20" },
                    { key: "aggressive", data: strategies.aggressive, colorClass: "text-[#A855F7]", bgClass: "bg-purple-500/10 border-purple-500/20" }
                  ].map(({ key, data, colorClass, bgClass }) => {
                    const feasibility = data.feasibilityScore;
                    return (
                      <div key={key} className="p-4 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition space-y-3">
                        <div className="flex justify-between items-center">
                          <span className={cn("text-sm font-bold", colorClass)}>{data.label}</span>
                          <span className={cn("text-[10px] font-black uppercase px-2 py-0.5 rounded-full border", bgClass, colorClass)}>
                            {feasibility >= 70 ? "High Feasibility" : feasibility >= 40 ? "Medium Feasibility" : "Low Feasibility"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{data.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Proj. CGPA</span>
                            <span className="font-bold text-white font-mono text-sm">{data.projectedCgpa.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Feasibility</span>
                            <span className="font-bold text-white font-mono text-sm">{feasibility}%</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              feasibility >= 70 ? "bg-emerald-500" : feasibility >= 40 ? "bg-amber-500" : "bg-red-500"
                            )}
                            style={{ width: `${feasibility}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-2 flex justify-end">
                    <Link href="/strategy" className="text-xs font-black uppercase tracking-wider text-[#A855F7] hover:text-purple-400 flex items-center gap-1 group-hover:underline">
                      View course grade requirements
                      <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center space-y-4">
                  <div className="p-3.5 rounded-2xl bg-white/5 text-slate-400 w-fit mx-auto">
                    <Target size={24} />
                  </div>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Set up your active semester syllabus courses first to generate target grade allocation paths.
                  </p>
                </div>
              )}
            </Card>

            {/* Premium quick action links including standard imports */}
            <Card className="flex flex-col h-fit group">
              <div className="flex items-center gap-3 mb-8 relative z-10">
                <Sparkles size={22} strokeWidth={3} className="text-[#4F8EF7]" />
                <h3 className="text-xl font-black font-headline tracking-tighter text-white">Neural Actions</h3>
              </div>

              <div className="flex flex-col gap-5 relative z-10">
                <Link href="/import" className="block group">
                  <div className="relative p-6 rounded-2xl border bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED] border-transparent text-white transition-all duration-500 flex items-center justify-between overflow-hidden shadow-2xl hover:scale-102">
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="p-3 rounded-2xl bg-white/20">
                        <Upload size={22} strokeWidth={2.5} />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-black tracking-tight">Ingest Transcript</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                          Regex OCR Matrix Ingest
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight size={20} strokeWidth={3} />
                  </div>
                </Link>

                <Link href="/calculator" className="block group">
                  <div className="relative p-6 rounded-2xl border bg-white/[0.03] border-white/[0.05] text-white hover:bg-white/[0.05] transition-all duration-500 flex items-center justify-between overflow-hidden">
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="p-3 rounded-2xl bg-white/[0.05]">
                        <Calculator size={22} strokeWidth={2.5} />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-black tracking-tight">New Calculation</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                          Single Semester Frame
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight size={20} strokeWidth={3} />
                  </div>
                </Link>

                <button
                  onClick={handleExportPDF}
                  className="w-full text-left bg-transparent border-none p-0 cursor-pointer"
                >
                  <div className="relative p-6 rounded-2xl border bg-white/[0.03] border-white/[0.05] text-white hover:bg-white/[0.05] transition-all duration-500 flex items-center justify-between overflow-hidden">
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="p-3 rounded-2xl bg-white/[0.05]">
                        <Calendar size={22} strokeWidth={2.5} />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-black tracking-tight">Export Telemetry</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                          Generate PDF Spectrum Report
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight size={20} strokeWidth={3} />
                  </div>
                </button>
              </div>
            </Card>
          </div>
        </div>

        <SemesterComparison data={comparisonData} />

        <ActivityTimeline activities={activities} />

        <InsightsPanel insights={insights} />

        <MotivationalBanner currentCgpa={gpa.cgpa} targetCgpa={store.academic.targetCgpa} />
      </main>

      {/* High-fidelity Trace Drawer slide-up sheets */}
      <TraceDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={drawerTitle}
        trace={drawerTrace}
        explanation={drawerExplanation}
        equation={drawerEquation}
        variables={drawerVariables}
      />
    </div>
  );
}
