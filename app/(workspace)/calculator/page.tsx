"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from "recharts";
import { TableVirtuoso } from "react-virtuoso";
import * as Select from "@radix-ui/react-select";
import { toast } from "sonner";
import { 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  Search, 
  AlertTriangle,
  PanelRightClose,
  ShieldCheck,
  Send,
  Zap,
  Sparkles
} from "lucide-react";

import { useUSMStore } from "@/stores/usmStore";
import { resolveActiveAcademicContext } from "@/stores/selectors/academic";
import { getPresetById, getGradeScale, convertLetterGradeToGradePoint } from "@/lib/presets";
import { VolatilityEngine } from "@/lib/academic-intelligence/engines/volatility/VolatilityEngine";

// Chamfer micro-texture style for premium visual panels
const chamferStyle = {
  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
  boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
};

interface SimulatedCourse {
  id: string;
  code: string;
  name: string;
  semester: number;
  credits: number;
  grade?: string;
  cieMarks: number;
  seeMarks?: number;
  attendanceTotal: number;
  attendanceBunked: number;
}

// Stable TableVirtuoso component overrides (defined outside render to prevent re-creation)
const VirtuosoTable = (props: React.HTMLAttributes<HTMLTableElement>) => (
  <table {...props} className="w-full text-left border-collapse font-sans" />
);
const VirtuosoTableHead = (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead {...props} className="bg-[#151515] border-b border-white/[0.08] text-white/40 sticky top-0 z-30 font-display" />
);
const VirtuosoTableRow = (props: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr {...props} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors" />
);
const VirtuosoTableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  (props, ref) => <tbody {...props} ref={ref} className="bg-[#151515]" />
);
VirtuosoTableBody.displayName = "VirtuosoTableBody";

const virtuosoComponents = {
  Table: VirtuosoTable,
  TableHead: VirtuosoTableHead,
  TableRow: VirtuosoTableRow,
  TableBody: VirtuosoTableBody,
};

// Radical UI portal select dropdown
function GradeDropdown({ 
  value, 
  onChange, 
  options 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  options: string[]; 
}) {
  return (
    <Select.Root value={value || "none"} onValueChange={(v) => onChange(v === "none" ? "" : v)}>
      <Select.Trigger className="w-20 h-8 bg-white/5 hover:bg-white/10 text-white font-mono text-xs px-2 rounded border border-white/10 outline-none transition-colors cursor-pointer flex items-center justify-between gap-1 data-[state=open]:ring-1 data-[state=open]:ring-[#A4C639]">
        <Select.Value placeholder="-" />
        <Select.Icon>
          <ChevronDown size={12} className="text-white/40" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content 
          position="popper" 
          sideOffset={4}
          className="w-20 bg-[#151515] border border-white/[0.08] rounded shadow-2xl z-[1000] overflow-hidden"
        >
          <Select.Viewport className="py-1 max-h-[200px]">
            <Select.Item 
              value="none" 
              className="w-full text-center px-2 py-1.5 text-xs font-semibold text-white/40 hover:bg-white/[0.05] hover:text-white focus:bg-white/[0.05] focus:text-white outline-none cursor-pointer"
            >
              <Select.ItemText>-</Select.ItemText>
            </Select.Item>
            
            {options.map(opt => (
              <Select.Item 
                key={opt} 
                value={opt}
                className="w-full text-center px-2 py-1.5 text-xs font-semibold text-white/60 hover:bg-[#A4C639]/10 hover:text-[#A4C639] focus:bg-[#A4C639]/10 focus:text-[#A4C639] outline-none cursor-pointer data-[state=checked]:text-[#A4C639] data-[state=checked]:bg-[#A4C639]/5"
              >
                <Select.ItemText>{opt}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

export default function UnifiedCommandCenterPage() {
  const router = useRouter();
  const store = useUSMStore();
  const context = resolveActiveAcademicContext(store);
  const preset = getPresetById(context.presetId) || getPresetById("sppu");

  const [simulatedCourses, setSimulatedCourses] = useState<SimulatedCourse[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [relativeGradingEnabled, setRelativeGradingEnabled] = useState(false);
  const [useMonospace, setUseMonospace] = useState(true);
  
  // Scoped states for modals/drawers
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [cmdKQuery, setCmdKQuery] = useState("");

  const targetCgpa = store.academic.targetCgpa || 7.5;
  const completedSemesters = store.academic.completedSemesters || 0;
  const currentCgpa = store.academic.currentCgpa || 0;
  const earnedCredits = store.academic.earnedCredits || 0;
  
  const gradeScale = getGradeScale(preset!);
  const options = gradeScale.map(e => e.grade);

  // Initialize course table with simulated active semester courses + mock courses if < 50
  const initialCoursesList = useMemo(() => {
    const list = [...(context.activeCourses || [])];
    if (list.length < 50) {
      for (let i = list.length; i < 55; i++) {
        list.push({
          id: `c-mock-${i}`,
          code: `CS${300 + i}`,
          name: `Advanced System Course ${i}`,
          semester: completedSemesters + 1,
          credits: (i % 3) + 2,
          grade: i % 7 === 0 ? "F" : i % 5 === 0 ? "B+" : "A",
          cieMarks: 20 + (i % 15),
          seeMarks: 35 + (i % 20),
          attendanceTotal: 40,
          attendanceBunked: 2
        });
      }
    }
    return list;
  }, [context.activeCourses, completedSemesters]);

  useEffect(() => {
    if (!hasChanges) {
      setSimulatedCourses(initialCoursesList);
    }
  }, [initialCoursesList, hasChanges]);

  // Command palette toggle listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCmdKOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // GPA computations
  const derivationSubjects = useMemo(() => {
    return simulatedCourses
      .filter(c => c.grade)
      .map(c => ({
        name: c.name,
        credits: c.credits,
        grade: c.grade!,
        gradePoint: convertLetterGradeToGradePoint(c.grade!, preset!)
      }));
  }, [simulatedCourses, preset]);

  const simulatedCredits = derivationSubjects.reduce((acc, c) => acc + c.credits, 0);
  const simulatedPoints = derivationSubjects.reduce((acc, c) => acc + (c.credits * c.gradePoint), 0);
  const calculatedSGPA = simulatedCredits > 0 ? simulatedPoints / simulatedCredits : 0;

  const projectedTotalCredits = earnedCredits + simulatedCredits;
  const projectedCGPA = projectedTotalCredits > 0
    ? (currentCgpa * earnedCredits + simulatedPoints) / projectedTotalCredits
    : 0;

  // Time-Weighted Grade Margin calculations
  // Target SGPA to align overall CGPA with the target CGPA
  const S_target = simulatedCredits > 0
    ? (targetCgpa * (earnedCredits + simulatedCredits) - currentCgpa * earnedCredits) / simulatedCredits
    : targetCgpa;
  const GP_target = Math.max(0, Math.min(10, S_target));

  const getRequiredMarksForGP = (gp: number) => {
    if (!preset || !preset.gradeScale) return gp * 10;
    const scale = [...preset.gradeScale]
      .filter(e => e.minMarks !== undefined)
      .sort((a, b) => a.points - b.points);
    const match = scale.find(e => e.points >= gp);
    if (match) return match.minMarks || 0;
    if (scale.length > 0) return scale[scale.length - 1].minMarks || 0;
    return gp * 10;
  };

  // Calculate cumulative study hours & base hours for active courses
  const { totalStudyHours, totalBaseHours } = useMemo(() => {
    let studySum = 0;
    let baseSum = 0;
    simulatedCourses.forEach(c => {
      const base = c.credits * 2;
      baseSum += base;
      const currentMarks = c.cieMarks + (c.seeMarks || 0);
      const requiredMarks = getRequiredMarksForGP(GP_target);
      const lostMarks = Math.max(0, requiredMarks - currentMarks);
      const hours = projectedCGPA >= targetCgpa ? base : base + (lostMarks * 0.2 * c.credits);
      studySum += hours;
    });
    return { totalStudyHours: studySum, totalBaseHours: baseSum };
  }, [simulatedCourses, GP_target, targetCgpa, projectedCGPA]);

  // Risk Telemetry definition
  const adherenceRisk = useMemo(() => {
    if (projectedCGPA >= targetCgpa) return "Optimal";
    if (totalStudyHours <= totalBaseHours * 1.25) return "Low Exposure";
    return "High Deviation";
  }, [projectedCGPA, targetCgpa, totalStudyHours, totalBaseHours]);

  // Trajectory Chart plotting points Sem 1-8
  const points = useMemo(() => {
    const pts = [];
    const historicSgpas = store.semesterHistory || [];
    let cumulativePoints = 0;
    let cumulativeCredits = 0;

    for (let i = 0; i < 8; i++) {
      const semNum = i + 1;
      if (semNum <= completedSemesters) {
        const hist = historicSgpas.find(h => h.semester === semNum);
        if (hist) {
          cumulativePoints += hist.sgpa * hist.credits;
          cumulativeCredits += hist.credits;
        }
        pts.push({
          name: `Sem ${semNum}`,
          cgpa: cumulativeCredits > 0 ? parseFloat((cumulativePoints / cumulativeCredits).toFixed(2)) : 0
        });
      } else if (semNum === completedSemesters + 1) {
        pts.push({
          name: `Sem ${semNum}`,
          cgpa: parseFloat(projectedCGPA.toFixed(2))
        });
      } else {
        const remainingSems = 8 - (completedSemesters + 1);
        const semIndex = semNum - (completedSemesters + 1);
        const interpolatedCgpa = projectedCGPA + ((targetCgpa - projectedCGPA) * semIndex) / remainingSems;
        pts.push({
          name: `Sem ${semNum}`,
          cgpa: parseFloat(interpolatedCgpa.toFixed(2))
        });
      }
    }
    return pts;
  }, [completedSemesters, projectedCGPA, targetCgpa, store.semesterHistory]);

  // Volatility calculations
  const baseVolatility = useMemo(() => {
    const pastSgpas = (store.semesterHistory || []).map(h => h.sgpa);
    return VolatilityEngine.calculate({ pastSgpas }).volatilityScore;
  }, [store.semesterHistory]);

  const currentVolatility = useMemo(() => {
    const pastSgpas = (store.semesterHistory || []).map(h => h.sgpa);
    return VolatilityEngine.calculate({ pastSgpas: [...pastSgpas, calculatedSGPA] }).volatilityScore;
  }, [store.semesterHistory, calculatedSGPA]);

  // Contextual AI Watchdog pattern
  const triggeredAnomaly = useRef(false);
  useEffect(() => {
    let hasAnomaly = false;
    let anomalyMessage = "";

    // 1. Placement Company Cutoff check
    const targetCompanies = store.career.targetCompanies || [];
    const companiesToCheck = targetCompanies.length > 0 ? targetCompanies : ["tcs", "cognizant"];
    const cutoffs = {
      tcs: 6.0,
      infosys: 6.5,
      cognizant: 6.0,
      accenture: 6.5,
      wipro: 6.0,
      faang: 8.0
    };

    for (const company of companiesToCheck) {
      const nameKey = company.toLowerCase() as keyof typeof cutoffs;
      const cutoffVal = cutoffs[nameKey] || 6.0;
      if (projectedCGPA < cutoffVal) {
        hasAnomaly = true;
        anomalyMessage = `Projected CGPA (${projectedCGPA.toFixed(2)}) dropped below cutoff for ${company.toUpperCase()} (${cutoffVal.toFixed(2)}).`;
        break;
      }
    }

    // 2. Volatility increase >15%
    const volDiff = currentVolatility - baseVolatility;
    if (volDiff > 15) {
      hasAnomaly = true;
      anomalyMessage = `CGPA Volatility increased by ${volDiff.toFixed(0)}% (from ${baseVolatility.toFixed(0)}% to ${currentVolatility.toFixed(0)}%).`;
    }

    if (hasAnomaly && !triggeredAnomaly.current) {
      triggeredAnomaly.current = true;
      toast.warning("Academic Anomaly Detected", {
        description: anomalyMessage,
        action: {
          label: "Resolve Anomaly",
          onClick: () => setIsChatOpen(true)
        },
        duration: 8000,
        onClick: () => setIsChatOpen(true)
      });
    } else if (!hasAnomaly) {
      triggeredAnomaly.current = false;
    }
  }, [projectedCGPA, currentVolatility, baseVolatility, store.career.targetCompanies]);

  // Chat artifact response details
  const anomalyExplanation = useMemo(() => {
    let explanation = "";
    const targetCompanies = store.career.targetCompanies || [];
    const companiesToCheck = targetCompanies.length > 0 ? targetCompanies : ["tcs", "cognizant"];
    const cutoffs = {
      tcs: 6.0,
      infosys: 6.5,
      accenture: 6.5,
      cognizant: 6.0,
      wipro: 6.0,
      faang: 8.0
    };

    const failed = [];
    for (const company of companiesToCheck) {
      const nameKey = company.toLowerCase() as keyof typeof cutoffs;
      const cutoffVal = cutoffs[nameKey] || 6.0;
      if (projectedCGPA < cutoffVal) {
        failed.push(`${company.toUpperCase()} (Cutoff: ${cutoffVal.toFixed(2)})`);
      }
    }

    if (failed.length > 0) {
      explanation += `⚠️ Cutoff Violation: Your projected CGPA is currently below ${failed.join(", ")}.\n\n`;
    }

    const volDiff = currentVolatility - baseVolatility;
    if (volDiff > 15) {
      explanation += `📉 Performance Fluctuations: A volatility surge of ${volDiff.toFixed(0)}% was detected due to low grades in active courses.\n\n`;
    }

    if (!explanation) {
      explanation = "✅ Stable trajectory. Current projection fully satisfies targets with no anomalies detected.";
    }

    return explanation;
  }, [projectedCGPA, currentVolatility, baseVolatility, store.career.targetCompanies]);

  const [messages, setMessages] = useState<any[]>([
    { role: "assistant", content: "Initializing Watchdog..." }
  ]);

  useEffect(() => {
    if (projectedCGPA < 6.0 || (currentVolatility - baseVolatility > 15)) {
      setMessages([
        {
          role: "assistant",
          content: `Academic Watchdog analysis:\n\n${anomalyExplanation}\nRecommended Actions:\n- Focus self-study on highest credit course (Data Structures).\n- Recover F/FF grades to eliminate active backlog penalty.\n- Bending trajectory requires at least 15 hrs/wk self-study.`
        }
      ]);
    } else {
      setMessages([
        {
          role: "assistant",
          content: "Hello! Watchdog is active. Your simulation metrics are stable. No warning thresholds breached."
        }
      ]);
    }
  }, [anomalyExplanation]);

  // Handler functions
  const handleUpdateCourseLocal = (id: string, field: string, value: any) => {
    setSimulatedCourses(prev => prev.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
    setHasChanges(true);
  };

  const handleReset = () => {
    setSimulatedCourses(initialCoursesList);
    setHasChanges(false);
    toast.success("Simulation parameters restored");
  };

  const handleSaveSandbox = () => {
    const overrides: Record<string, any> = {};
    simulatedCourses.forEach(c => {
      overrides[c.id] = { grade: c.grade, cieMarks: c.cieMarks, seeMarks: c.seeMarks };
    });

    const scenarioId = `sandbox-${Date.now()}`;
    useUSMStore.setState(state => ({
      ...state,
      simulation: {
        ...state.simulation,
        activeScenarios: [
          ...(state.simulation?.activeScenarios || []),
          {
            id: scenarioId,
            name: "Command Center Sandbox",
            overrides: { courses: overrides, semesters: {} }
          }
        ]
      }
    }));
    toast.success("Sandbox sandbox scenario saved");
    setHasChanges(false);
  };

  // Command palette actions configuration
  const localActions = [
    {
      id: "relative",
      label: `Toggle Relative Grading (${relativeGradingEnabled ? 'ON' : 'OFF'})`,
      shortcut: "⌥R",
      perform: () => {
        setRelativeGradingEnabled(prev => !prev);
        toast.success(`Relative grading ${!relativeGradingEnabled ? 'enabled' : 'disabled'}`);
      }
    },
    {
      id: "reset",
      label: "Reset Sandbox Calculations",
      shortcut: "⌥C",
      perform: handleReset
    },
    {
      id: "mono",
      label: `Toggle Monospace Figures (${useMonospace ? 'ON' : 'OFF'})`,
      shortcut: "⌥M",
      perform: () => {
        setUseMonospace(prev => !prev);
        toast.success(`Monospace figures ${!useMonospace ? 'enabled' : 'disabled'}`);
      }
    },
    {
      id: "save",
      label: "Save Sandbox Scenario",
      shortcut: "⌥S",
      perform: handleSaveSandbox
    }
  ];

  const globalActions = [
    {
      id: "nav-career",
      label: "Navigate to Career Overview",
      perform: () => router.push("/career")
    },
    {
      id: "nav-internships",
      label: "Navigate to Internship Ledger",
      perform: () => router.push("/internships")
    },
    {
      id: "nav-placement",
      label: "Navigate to Placement Matrix",
      perform: () => router.push("/placement")
    }
  ];

  const filteredLocalActions = localActions.filter(a => 
    a.label.toLowerCase().includes(cmdKQuery.toLowerCase())
  );
  const filteredGlobalActions = globalActions.filter(a => 
    a.label.toLowerCase().includes(cmdKQuery.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-[#0f0f10] text-[#f5f5f7] relative overflow-hidden flex font-sans selection:bg-[#A4C639]/20 selection:text-white">
      {/* Noise micro-texture */}
      <div className="absolute inset-0 pointer-events-none bg-[url('/noise.svg')] opacity-[0.02] mix-blend-overlay z-[100]" />

      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#A4C639]/5 via-transparent to-transparent blur-[160px] rounded-full mix-blend-screen" />
      </div>

      {/* Main dashboard content area */}
      <div className="flex-1 flex flex-col min-w-0 z-10 p-6 md:p-10 gap-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold font-display tracking-tight text-white flex items-center gap-2">
              Unified Command Center
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#A4C639]/10 text-[#A4C639] border border-[#A4C639]/20 font-sans font-medium">
                Active Adherence
              </span>
            </h1>
            <p className="text-sm text-white/40 mt-1">
              Deterministic target-pursuit and study-hour grade solver. Press <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-xs font-mono">⌘K</kbd> for command menu.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <RotateCcw size={14} />
              Reset Simulation
            </button>
            <button
              onClick={handleSaveSandbox}
              className="px-4 py-2 rounded-xl bg-[#A4C639] hover:bg-[#A4C639]/90 text-[#0f0f10] text-xs font-semibold transition-all shadow-[0_0_15px_rgba(164,198,57,0.3)] hover:shadow-[0_0_20px_rgba(164,198,57,0.5)] active:scale-[0.97]"
            >
              Save Sandbox
            </button>
          </div>
        </div>

        {/* Zone 1: Interactive Trajectory Chart */}
        <div className="w-full bg-[#151515] rounded-2xl border border-white/[0.08] p-6 relative flex flex-col gap-4 shadow-xl" style={chamferStyle}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold font-display text-white uppercase tracking-wider">
                Interactive CGPA Trajectory
              </h2>
              <p className="text-xs text-white/40">
                Plotting Semesters 1-8. Drag the green dot on the right edge to adjust your Target CGPA.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-white/60">
                <span className="w-2.5 h-2.5 rounded-full bg-white/20 border border-white/40" />
                Historical / Projected
              </span>
              <span className="flex items-center gap-1.5 text-[#A4C639]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#A4C639] shadow-[0_0_8px_#A4C639]" />
                Target Goal Node
              </span>
            </div>
          </div>

          <div className="w-full h-[240px] flex relative gap-8">
            <div className="flex-1 h-full pr-12">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTrajectory" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgba(255,255,255,0.08)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="rgba(255,255,255,0)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.2)" 
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700 }} 
                    axisLine={false} 
                    tickLine={false} 
                    dy={10} 
                  />
                  <YAxis 
                    domain={[4.0, 10.0]} 
                    stroke="rgba(255,255,255,0.2)" 
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700, fontFamily: "monospace" }} 
                    axisLine={false} 
                    tickLine={false} 
                    dx={-10} 
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: "#151515", 
                      borderRadius: "12px", 
                      border: "1px solid rgba(255,255,255,0.08)", 
                      boxShadow: "0 20px 40px rgba(0,0,0,0.5)", 
                      backdropFilter: "blur(10px)" 
                    }}
                    labelStyle={{ color: "rgba(255,255,255,0.4)", fontWeight: "bold", fontSize: "10px", textTransform: "uppercase" }}
                    itemStyle={{ color: "#white", fontWeight: "bold", fontSize: "14px", fontFamily: "monospace" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cgpa"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorTrajectory)"
                    dot={(props: any) => {
                      const { cx, cy, payload } = props;
                      const isTarget = payload.name === "Sem 8";
                      return (
                        <circle 
                          cx={cx} 
                          cy={cy} 
                          r={isTarget ? 6 : 4} 
                          fill={isTarget ? "#A4C639" : "rgba(255,255,255,0.2)"} 
                          stroke={isTarget ? "#0f0f10" : "rgba(255,255,255,0.4)"} 
                          strokeWidth={2}
                        />
                      );
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Interactive Vertical Slider */}
            <div className="absolute right-[4px] top-[10px] bottom-[30px] w-8 flex items-center justify-center">
              <div className="absolute w-[2px] h-full bg-white/5 rounded-full" />
              <div 
                className="absolute w-[2px] bg-[#A4C639] rounded-full" 
                style={{ 
                  bottom: 0, 
                  top: `${(1 - (targetCgpa - 4) / 6) * 100}%` 
                }} 
              />
              <div 
                className="absolute w-4 h-4 rounded-full bg-[#A4C639] border-2 border-[#151515] shadow-[0_0_12px_#A4C639] pointer-events-none flex items-center justify-center"
                style={{ 
                  bottom: `calc(${((targetCgpa - 4) / 6) * 100}% - 8px)` 
                }} 
              >
                <span className="text-[7px] text-[#0f0f10] font-bold font-mono">T</span>
              </div>
              <input
                type="range"
                min="4.00"
                max="10.00"
                step="0.05"
                value={targetCgpa}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  store.setAcademic({ targetCgpa: val });
                }}
                className="absolute w-8 h-full opacity-0 cursor-row-resize [writing-mode:vertical-lr] z-20"
                style={{
                  WebkitAppearance: 'slider-vertical',
                }}
              />
            </div>
          </div>
        </div>

        {/* Zone 2: Risk Telemetry Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-[#151515] rounded-xl border border-white/[0.08] p-5 flex flex-col justify-between relative shadow-lg" style={chamferStyle}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                Target CGPA Status
              </span>
              {projectedCGPA >= targetCgpa ? (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#A4C639]/10 text-[#A4C639] border border-[#A4C639]/20 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A4C639] animate-pulse" />
                  ON TRACK
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  BEHIND TARGET
                </span>
              )}
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className={`text-4xl font-extrabold tracking-tight ${useMonospace ? 'font-mono tabular-nums' : 'font-display'}`}>
                {projectedCGPA.toFixed(2)}
              </span>
              <span className="text-xs text-white/30">
                / target {targetCgpa.toFixed(2)}
              </span>
            </div>
            <p className="text-[11px] text-white/40 mt-2">
              Current simulated standing across {completedSemesters + 1} semesters.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#151515] rounded-xl border border-white/[0.08] p-5 flex flex-col justify-between relative shadow-lg" style={chamferStyle}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                Weekly Study Effort
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/5 text-white/60 border border-white/10 text-[10px] font-bold">
                ESTIMATED
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className={`text-4xl font-extrabold tracking-tight text-white ${useMonospace ? 'font-mono tabular-nums' : 'font-display'}`}>
                {totalStudyHours.toFixed(1)}
              </span>
              <span className="text-xs text-white/30">
                hours / week
              </span>
            </div>
            <p className="text-[11px] text-white/40 mt-2">
              Baseline was {totalBaseHours.toFixed(0)} hrs/wk. Adjustment is due to CGPA targets.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#151515] rounded-xl border border-white/[0.08] p-5 flex flex-col justify-between relative shadow-lg" style={chamferStyle}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                Adherence Risk
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                adherenceRisk === "Optimal" 
                  ? "bg-[#A4C639]/10 text-[#A4C639] border-[#A4C639]/20" 
                  : adherenceRisk === "Low Exposure"
                    ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
              }`}>
                {adherenceRisk.toUpperCase()}
              </span>
            </div>
            <div className="mt-4">
              <span className="text-xl font-bold tracking-tight text-white font-display">
                {adherenceRisk === "Optimal" 
                  ? "No Adjustments Required" 
                  : adherenceRisk === "Low Exposure"
                    ? "Moderate Reallocation"
                    : "Significant Deviation"}
              </span>
            </div>
            <p className="text-[11px] text-white/40 mt-4">
              {adherenceRisk === "Optimal"
                ? "Study schedule aligns with baseline academic recommendations."
                : adherenceRisk === "Low Exposure"
                  ? "Minor marks deficit. Add study blocks of ~0.5h/credit course."
                  : "Severe GPA deficit. Relocate study blocks to recover failed credits."}
            </p>
          </div>
        </div>

        {/* Zone 3: Virtualized Course Table */}
        <div className="bg-[#151515] rounded-xl border border-white/[0.08] flex flex-col flex-1 overflow-hidden min-h-[400px] shadow-lg" style={chamferStyle}>
          <div className="p-4 border-b border-white/[0.08] flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-sm font-bold font-display text-white uppercase tracking-wider">
                Adherence Course Table
              </h2>
              <p className="text-xs text-white/40">
                Course status with dynamically recalculated study-hour margins.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {relativeGradingEnabled && (
                <span className="text-[10px] font-semibold text-[#A4C639] px-2 py-0.5 rounded bg-[#A4C639]/10 border border-[#A4C639]/20">
                  Relative protection active (VIT/COEP protected)
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 relative">
            <TableVirtuoso
              style={{ height: "100%", minHeight: 350 }}
              data={simulatedCourses}
              components={virtuosoComponents}
              fixedHeaderContent={() => (
                <tr>
                  <th className="p-3 pl-5 text-[11px] font-bold uppercase tracking-wider text-left">Course</th>
                  <th className="p-3 text-[11px] font-bold uppercase tracking-wider text-center w-24">Credits</th>
                  <th className="p-3 text-[11px] font-bold uppercase tracking-wider text-center w-28">CIE Marks</th>
                  <th className="p-3 text-[11px] font-bold uppercase tracking-wider text-center w-28">SEE Marks</th>
                  <th className="p-3 text-[11px] font-bold uppercase tracking-wider text-center w-28">Grade</th>
                  <th className="p-3 text-[11px] font-bold uppercase tracking-wider text-center w-28">Target GP</th>
                  <th className="p-3 pr-5 text-[11px] font-bold uppercase tracking-wider text-center w-36">Study Hours/Wk</th>
                </tr>
              )}
              itemContent={(index, course) => {
                const baseHours = course.credits * 2;
                const currentMarks = course.cieMarks + (course.seeMarks || 0);
                const requiredMarks = getRequiredMarksForGP(GP_target);
                const lostMarks = Math.max(0, requiredMarks - currentMarks);
                const studyHours = projectedCGPA >= targetCgpa ? baseHours : baseHours + (lostMarks * 0.2 * course.credits);
                
                return (
                  <>
                    <td className="p-3 pl-5 text-left">
                      <div className="font-semibold text-white">{course.name}</div>
                      <div className="text-[10px] text-white/40 mt-0.5">{course.code}</div>
                    </td>
                    <td className={`p-3 text-center ${useMonospace ? 'font-mono text-xs' : 'text-sm'}`}>
                      {course.credits}
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="40"
                        value={course.cieMarks}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(40, parseInt(e.target.value) || 0));
                          handleUpdateCourseLocal(course.id, "cieMarks", val);
                        }}
                        className={`w-16 h-8 rounded border border-white/10 bg-white/5 hover:bg-white/10 text-center text-white focus:outline-none focus:border-[#A4C639]/50 ${
                          useMonospace ? 'font-mono text-xs' : 'text-sm font-sans'
                        }`}
                      />
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={course.seeMarks || 0}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(60, parseInt(e.target.value) || 0));
                          handleUpdateCourseLocal(course.id, "seeMarks", val);
                        }}
                        className={`w-16 h-8 rounded border border-white/10 bg-white/5 hover:bg-white/10 text-center text-white focus:outline-none focus:border-[#A4C639]/50 ${
                          useMonospace ? 'font-mono text-xs' : 'text-sm font-sans'
                        }`}
                      />
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center">
                        <GradeDropdown
                          value={course.grade || ""}
                          options={options}
                          onChange={(val) => handleUpdateCourseLocal(course.id, "grade", val)}
                        />
                      </div>
                    </td>
                    <td className={`p-3 text-center text-white/80 ${useMonospace ? 'font-mono text-xs' : 'text-sm'}`}>
                      {GP_target.toFixed(2)}
                    </td>
                    <td className={`p-3 pr-5 text-center font-bold text-[#A4C639] ${useMonospace ? 'font-mono text-xs' : 'text-sm'}`}>
                      {studyHours.toFixed(1)}
                    </td>
                  </>
                );
              }}
            />
          </div>
        </div>
      </div>

      {/* Right Sliding Chat Artifact Drawer Panel */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="w-[380px] h-screen bg-[#151515] border-l border-white/[0.08] flex flex-col z-[100] relative shadow-2xl shrink-0"
          >
            <div className="absolute inset-0 pointer-events-none bg-[url('/noise.svg')] opacity-[0.02] mix-blend-overlay" />
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-white/[0.08] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#A4C639]" />
                <span className="text-xs font-bold font-display uppercase tracking-widest text-[#A4C639]">
                  Jarvis Watchdog Advisor
                </span>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <PanelRightClose size={16} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
              {messages.map((msg, index) => (
                <div key={index} className="flex flex-col gap-1 items-start">
                  <span className="text-[9px] uppercase tracking-wider text-white/30 font-semibold pl-1 font-sans">
                    {msg.role === "assistant" ? "Jarvis" : "You"}
                  </span>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/[0.04] text-xs leading-relaxed text-white/80 whitespace-pre-wrap font-sans">
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Footer */}
            <div className="p-4 border-t border-white/[0.08] bg-black/20 shrink-0 flex flex-col gap-2">
              <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                <input
                  type="text"
                  placeholder="Ask Jarvis for grading pathways..."
                  className="flex-1 bg-transparent text-xs text-white placeholder-white/30 focus:outline-none"
                  disabled
                />
                <button className="text-white/40 cursor-not-allowed">
                  <Send size={14} />
                </button>
              </div>
              <span className="text-[9px] text-white/30 text-center font-sans">
                Watchdog executes local analysis over active sandbox state.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scoped Command Palette (Cmd+K) Modal */}
      <AnimatePresence>
        {isCmdKOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4"
            onClick={() => setIsCmdKOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="w-full max-w-lg bg-[#151515] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[400px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 p-4 border-b border-white/[0.08]">
                <Search size={18} className="text-white/40" />
                <input
                  type="text"
                  placeholder="Search workspace commands..."
                  value={cmdKQuery}
                  onChange={(e) => setCmdKQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-white placeholder-white/30 focus:outline-none font-sans"
                  autoFocus
                />
                <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-white/40">
                  ESC
                </kbd>
              </div>

              <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 custom-scrollbar">
                {filteredLocalActions.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-[9px] font-bold text-white/30 uppercase tracking-widest font-sans">
                      Workspace Actions (Local)
                    </div>
                    {filteredLocalActions.map(action => (
                      <button
                        key={action.id}
                        onClick={() => {
                          action.perform();
                          setIsCmdKOpen(false);
                          setCmdKQuery("");
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-white/80 hover:text-[#A4C639] hover:bg-white/[0.03] rounded-lg transition-colors flex items-center justify-between group font-sans"
                      >
                        <span>{action.label}</span>
                        <span className="text-[10px] text-white/30 group-hover:text-[#A4C639]/60 font-medium">
                          {action.shortcut}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {filteredGlobalActions.length > 0 && (
                  <div className="mt-2">
                    <div className="px-3 py-1.5 text-[9px] font-bold text-white/30 uppercase tracking-widest font-sans">
                      Global Navigation
                    </div>
                    {filteredGlobalActions.map(action => (
                      <button
                        key={action.id}
                        onClick={() => {
                          action.perform();
                          setIsCmdKOpen(false);
                          setCmdKQuery("");
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-white/60 hover:text-white hover:bg-white/[0.03] rounded-lg transition-colors flex items-center justify-between font-sans"
                      >
                        <span>{action.label}</span>
                        <span className="text-[10px] text-white/20">Go to</span>
                      </button>
                    ))}
                  </div>
                )}

                {filteredLocalActions.length === 0 && filteredGlobalActions.length === 0 && (
                  <div className="p-4 text-center text-xs text-white/30 font-sans">
                    No commands matched "{cmdKQuery}"
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
