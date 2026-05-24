"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { calculateRequiredGPA, getDifficultyLevel, sgpaToPercentage as calcSgpaToPercentage } from "@/lib/presets";
import { useUniversity } from "@/components/providers/UniversityProvider";
import PresetInfoCard from "@/components/PresetInfoCard";
import CalculationBreakdown from "@/components/CalculationBreakdown";
import AnimatedCounter from "@/components/AnimatedCounter";
import StaggerContainer, { StaggerItem } from "@/components/StaggerContainer";
import PremiumButton from "@/components/PremiumButton";
import WorkspaceContent from "@/components/layout/WorkspaceContent";
import WorkspaceSection from "@/components/layout/WorkspaceSection";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

const MotionCard = motion(Card);

interface ChartDataItem {
  semester: string;
  Target_Path: number;
  Current_Trend: number;
}

interface Difficulty {
  label: string;
  color: string;
  borderColor: string;
  bgTint: string;
  subLabel: string;
}

interface PlannerResult {
  requiredGPA: number;
  chartData: ChartDataItem[];
  gap: number;
  difficulty: Difficulty;
  remainingSems: number;
  creditsPerSem: number;
  isImpossible: boolean;
  percentageNeeded: number;
  journeyPercent: number;
}

// Helper: get difficulty info for a specific GPA value (for per-row coloring)
function getRowDifficulty(gpa: number) {
  if (gpa > 9.5) return { barWidth: 100, barColor: "bg-red-500", tint: "bg-red-500/[0.03]", label: "Very Hard" };
  if (gpa >= 8.5) return { barWidth: 75, barColor: "bg-orange-500", tint: "bg-yellow-500/[0.03]", label: "Challenging" };
  if (gpa >= 7.5) return { barWidth: 50, barColor: "bg-blue-500", tint: "bg-blue-500/[0.03]", label: "Achievable" };
  return { barWidth: 25, barColor: "bg-green-500", tint: "bg-green-500/[0.03]", label: "Easy" };
}

import { useUSMStore } from "@/stores/usmStore";

export default function PlannerPage() {
  const { activePreset, maxGradePoint } = useUniversity();
  const store = useUSMStore();
  const [currentCGPA, setCurrentCGPA] = useState("");
  const [completedSemesters, setCompletedSemesters] = useState("");
  const [totalCredits, setTotalCredits] = useState("");
  const [targetCGPA, setTargetCGPA] = useState("");
  const [remainingSemesters, setRemainingSemesters] = useState("");
  const [creditsPerSemester, setCreditsPerSemester] = useState("20");

  const [result, setResult] = useState<PlannerResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (store.academic.currentCgpa) {
      setCurrentCGPA(store.academic.currentCgpa.toFixed(2));
      setCompletedSemesters(store.semesterHistory.length.toString());
      setTotalCredits(store.academic.earnedCredits.toString());
      const remSems = Math.max(1, 8 - store.semesterHistory.length);
      setRemainingSemesters(remSems.toString());
    }
  }, []);

  // Live validation for green glow on valid fields
  const fieldValid = useMemo(() => {
    const v: Record<string, boolean> = {};
    const c = parseFloat(currentCGPA);
    const t = parseFloat(targetCGPA);
    const rs = parseInt(remainingSemesters);
    const cps = parseInt(creditsPerSemester);
    const tc = parseInt(totalCredits);

    if (currentCGPA && !isNaN(c) && c >= 0 && c <= maxGradePoint) v.currentCGPA = true;
    if (completedSemesters && !isNaN(parseInt(completedSemesters)) && parseInt(completedSemesters) >= 1) v.completedSemesters = true;
    if (totalCredits && !isNaN(tc) && tc >= 1) v.totalCredits = true;
    if (targetCGPA && !isNaN(t) && t >= 0 && t <= maxGradePoint && (!currentCGPA || t > c)) v.targetCGPA = true;
    if (remainingSemesters && !isNaN(rs) && rs >= 1 && rs <= 8) v.remainingSemesters = true;
    if (creditsPerSemester && !isNaN(cps) && cps >= 1 && cps <= 30) v.creditsPerSemester = true;

    return v;
  }, [currentCGPA, completedSemesters, totalCredits, targetCGPA, remainingSemesters, creditsPerSemester, maxGradePoint]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    const cVal = parseFloat(currentCGPA);
    const tVal = parseFloat(targetCGPA);
    const rsVal = parseInt(remainingSemesters);
    const cpsVal = parseInt(creditsPerSemester);
    const tcVal = parseInt(totalCredits);

    if (!currentCGPA) e.currentCGPA = "Required";
    else if (isNaN(cVal) || cVal < 0 || cVal > maxGradePoint) e.currentCGPA = `Must be 0.0 – ${maxGradePoint}`;

    if (!completedSemesters) e.completedSemesters = "Required";
    else if (isNaN(parseInt(completedSemesters)) || parseInt(completedSemesters) < 1) e.completedSemesters = "Must be ≥ 1";

    if (!totalCredits) e.totalCredits = "Required";
    else if (isNaN(tcVal) || tcVal < 1) e.totalCredits = "Must be ≥ 1";

    if (!targetCGPA) e.targetCGPA = "Required";
    else if (isNaN(tVal) || tVal < 0 || tVal > maxGradePoint) e.targetCGPA = `Must be 0.0 – ${maxGradePoint}`;
    else if (!isNaN(cVal) && tVal <= cVal) e.targetCGPA = "Must be > current CGPA";

    if (!remainingSemesters) e.remainingSemesters = "Required";
    else if (isNaN(rsVal) || rsVal < 1 || rsVal > 8) e.remainingSemesters = "Must be 1 – 8";

    if (!creditsPerSemester) e.creditsPerSemester = "Required";
    else if (isNaN(cpsVal) || cpsVal < 1 || cpsVal > 30) e.creditsPerSemester = "Must be 1 – 30";

    setErrors(e);
    // Mark all as touched
    const allTouched: Record<string, boolean> = {};
    ["currentCGPA", "completedSemesters", "totalCredits", "targetCGPA", "remainingSemesters", "creditsPerSemester"].forEach(k => allTouched[k] = true);
    setTouched(allTouched);
    return Object.keys(e).length === 0;
  };

  const handleGenerate = () => {
    if (!validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      const cCGPA = parseFloat(currentCGPA);
      const completedSemsVal = parseInt(completedSemesters);
      const currentCredits = parseInt(totalCredits);
      const target = parseFloat(targetCGPA);
      const remSems = parseInt(remainingSemesters);
      const credPerSem = parseInt(creditsPerSemester);

      const remainingCredits = remSems * credPerSem;
      const requiredGPA = calculateRequiredGPA(target, cCGPA, currentCredits, remainingCredits);
      const isImpossible = requiredGPA > maxGradePoint;

      if (isImpossible) {
        toast.error(`Target requires GPA above ${maxGradePoint} — mathematically impossible!`);
      }

      // Build chart data — linear interpolation from current to target
      const chartData: ChartDataItem[] = [];
      chartData.push({
        semester: `Sem ${completedSemsVal}`,
        Target_Path: cCGPA,
        Current_Trend: cCGPA,
      });

      for (let i = 1; i <= remSems; i++) {
        const projectedCGPA = cCGPA + ((target - cCGPA) * (i / remSems));
        chartData.push({
          semester: `Sem ${completedSemsVal + i}`,
          Target_Path: Number(projectedCGPA.toFixed(2)),
          Current_Trend: cCGPA,
        });
      }

      const gap = Number((target - cCGPA).toFixed(2));
      const percentageNeeded = Number(calcSgpaToPercentage(requiredGPA, activePreset).toFixed(1));
      const journeyPercent = Number(((cCGPA / target) * 100).toFixed(1));

      setResult({
        requiredGPA: Number(requiredGPA.toFixed(2)),
        chartData,
        gap,
        difficulty: getDifficultyLevel(requiredGPA, activePreset),
        remainingSems: remSems,
        creditsPerSem: credPerSem,
        isImpossible,
        percentageNeeded,
        journeyPercent,
      });

      setIsGenerating(false);
      if (!isImpossible) toast.success("Plan generated successfully!");
    }, 1000);
  };

  const handleSavePlan = async () => {
    if (!result || isSaving) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_cgpa: currentCGPA,
          target_cgpa: targetCGPA,
          completed_semesters: completedSemesters,
          remaining_semesters: remainingSemesters,
          required_gpa: result.requiredGPA,
          plan_data: result.chartData,
        }),
      });

      if (res.status === 401) {
        toast.error("Please log in to save plans to your Dashboard.");
        setIsSaving(false);
        return;
      }
      if (!res.ok) throw new Error("API failed");
      setSaveSuccess(true);
      toast.success("Plan saved to Dashboard!");
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error(err);
      toast.error("Error saving. Attempting local sync.");
      setTimeout(() => {
        try {
          let existing = [];
          try {
            const saved = localStorage.getItem("gradeflow_offline_plans");
            const parsed = saved ? JSON.parse(saved) : [];
            if (Array.isArray(parsed)) {
              existing = parsed;
            }
          } catch {}
          existing.unshift({
            current_cgpa: currentCGPA,
            target_cgpa: targetCGPA,
            completed_semesters: completedSemesters,
            remaining_semesters: remainingSemesters,
            required_gpa: result.requiredGPA,
            plan_data: result.chartData,
            saved_at: new Date().toISOString(),
          });
          try {
            localStorage.setItem("gradeflow_offline_plans", JSON.stringify(existing.slice(0, 20)));
            setSaveSuccess(true);
            toast.success("Saved to local cache!");
          } catch {
            toast.error("Failed to save to local cache.");
          }
          setIsSaving(false);
        } catch {
          toast.error("Failed to save to local cache.");
          setIsSaving(false);
        }
      }, 1000);
    } finally {
      if (!saveSuccess) setIsSaving(false);
    }
  };


  // Removed getInputClass and labelClass helper to use componentized Input instead

  // Expert insight text
  const getExpertText = () => {
    if (!result) return "";
    if (result.isImpossible) return "Mathematically impossible target. Please adjust your target CGPA or increase remaining semesters.";
    if (result.requiredGPA > 9.5) return `Your target requires maximum effort. Focus on high-credit core subjects first. Maintaining ${result.requiredGPA}+ GPA every semester is extremely demanding but achievable with disciplined study habits.`;
    if (result.requiredGPA >= 8.0) return `Your target requires consistent focus. Scoring ${result.requiredGPA} each semester is achievable with regular study and good preparation. Avoid backlogs at all costs.`;
    if (result.requiredGPA >= 7.0) return "Your target is well within reach. Maintain consistent performance and avoid any backlogs this semester.";
    return "Your target is very comfortable. You are already on a strong path. Keep performing consistently.";
  };

  return (
    <WorkspaceContent className="relative z-10">
      <WorkspaceSection>

        {/* ━━━ PAGE HEADER ━━━ */}
        <StaggerContainer className="text-center space-y-4">
          <StaggerItem>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#4F8EF7]/30 bg-[#4F8EF7]/5 text-[#4F8EF7] text-xs font-bold tracking-widest uppercase mb-4">
              <span className="material-symbols-outlined text-sm">calendar_month</span>
              Semester Planner
            </span>
          </StaggerItem>
          <StaggerItem>
            <h1 className="text-5xl md:text-6xl font-headline font-extrabold tracking-tight mb-6 text-on-surface drop-shadow-sm">
              Plan Your Path to Your Target CGPA
            </h1>
          </StaggerItem>
          <StaggerItem>
            <p className="text-on-surface-variant max-w-[500px] mx-auto text-lg leading-relaxed text-center">
              Enter your current standing and target.
              <br />
              GradeFlow maps your exact path to success.
            </p>
          </StaggerItem>
          <StaggerItem>
            <div className="mt-4 flex justify-center">
              <PresetInfoCard compact />
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/* ━━━ INPUT CARD ━━━ */}
        <MotionCard
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="grid md:grid-cols-2 gap-12 items-start mb-10">
            {/* Left — Current Status */}
            <div className="space-y-8">
              <h3 className="font-headline text-xl font-bold flex items-center gap-4 text-white">
                <span className="w-10 h-10 rounded-full bg-[#4F8EF7]/20 flex items-center justify-center shadow-[0_0_15px_rgba(79,142,247,0.4)]">
                  <span className="material-symbols-outlined text-[#4F8EF7] text-xl">person</span>
                </span>
                Your Current Status
              </h3>
              <div className="grid grid-cols-1 gap-6">
                {/* Current CGPA */}
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={currentCGPA}
                  onChange={(e) => { setCurrentCGPA(e.target.value); setErrors({ ...errors, currentCGPA: "" }); setTouched({ ...touched, currentCGPA: true }); }}
                  label="Current CGPA"
                  floating
                  error={touched.currentCGPA ? errors.currentCGPA : undefined}
                  isValid={fieldValid.currentCGPA && touched.currentCGPA}
                  placeholder="."
                />
                {/* Completed Sems + Credits */}
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    min="1"
                    value={completedSemesters}
                    onChange={(e) => { setCompletedSemesters(e.target.value); setErrors({ ...errors, completedSemesters: "" }); setTouched({ ...touched, completedSemesters: true }); }}
                    label="Completed Sems"
                    floating
                    error={touched.completedSemesters ? errors.completedSemesters : undefined}
                    isValid={fieldValid.completedSemesters && touched.completedSemesters}
                    placeholder="."
                  />
                  <Input
                    type="number"
                    min="1"
                    value={totalCredits}
                    onChange={(e) => { setTotalCredits(e.target.value); setErrors({ ...errors, totalCredits: "" }); setTouched({ ...touched, totalCredits: true }); }}
                    label="Credits Done"
                    floating
                    error={touched.totalCredits ? errors.totalCredits : undefined}
                    isValid={fieldValid.totalCredits && touched.totalCredits}
                    placeholder="."
                  />
                </div>
              </div>
            </div>

            {/* Right — The Goal */}
            <div className="space-y-8">
              <h3 className="font-headline text-xl font-bold flex items-center gap-4 text-white">
                <span className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.4)]">
                  <span className="material-symbols-outlined text-purple-400 text-xl">target</span>
                </span>
                The Goal
              </h3>
              <div className="grid grid-cols-1 gap-6">
                {/* Target CGPA */}
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={targetCGPA}
                  onChange={(e) => { setTargetCGPA(e.target.value); setErrors({ ...errors, targetCGPA: "" }); setTouched({ ...touched, targetCGPA: true }); }}
                  label="Target CGPA"
                  floating
                  error={touched.targetCGPA ? errors.targetCGPA : undefined}
                  isValid={fieldValid.targetCGPA && touched.targetCGPA}
                  placeholder="."
                />
                {/* Remaining Sems + Credits Per Sem */}
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    min="1"
                    max="8"
                    value={remainingSemesters}
                    onChange={(e) => { setRemainingSemesters(e.target.value); setErrors({ ...errors, remainingSemesters: "" }); setTouched({ ...touched, remainingSemesters: true }); }}
                    label="Remaining Sems"
                    floating
                    error={touched.remainingSemesters ? errors.remainingSemesters : undefined}
                    isValid={fieldValid.remainingSemesters && touched.remainingSemesters}
                    placeholder="."
                  />
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={creditsPerSemester}
                    onChange={(e) => { setCreditsPerSemester(e.target.value); setErrors({ ...errors, creditsPerSemester: "" }); setTouched({ ...touched, creditsPerSemester: true }); }}
                    label="Credits Per Sem"
                    floating
                    error={touched.creditsPerSemester ? errors.creditsPerSemester : undefined}
                    isValid={fieldValid.creditsPerSemester && touched.creditsPerSemester}
                    placeholder="."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center w-full">
            <motion.button
              onClick={handleGenerate}
              disabled={isGenerating}
              whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(79,142,247,0.4)" }}
              whileTap={{ scale: 0.97 }}
              className="w-full max-w-md py-4 px-8 rounded-full font-bold text-white text-base flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #4F8EF7 0%, #7C3AED 100%)",
                boxShadow: "0 0 25px rgba(79,142,247,0.3)",
              }}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  Generate My Plan
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </motion.button>
          </div>
        </MotionCard>

        {/* ━━━ RESULTS ━━━ */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="space-y-12"
            >
              {/* Impossible Warning */}
              {result.isImpossible && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-[2rem] p-8 border border-red-500/40 text-center space-y-3"
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    boxShadow: "0 0 30px rgba(239,68,68,0.2)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <span className="material-symbols-outlined text-red-400 text-4xl">warning</span>
                  <h3 className="text-xl font-bold text-red-400">Target Cannot Be Achieved</h3>
                  <p className="text-red-300/80 max-w-md mx-auto">
                    This target cannot be achieved in the remaining semesters.
                    Please adjust your target CGPA or increase the number of remaining semesters.
                  </p>
                </motion.div>
              )}

              {/* ━━━ 3 RESULT CARDS ━━━ */}
              <StaggerContainer staggerDelay={0.15} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Card 1 — CGPA Gap */}
                <StaggerItem>
                  <Card
                    variant="accent"
                    className="flex flex-col items-center text-center space-y-3 group hover:-translate-y-2 transition-all duration-500 relative overflow-hidden border-t-[3px] border-[#4F8EF7]/60"
                  >
                    <span className="text-on-surface-variant font-bold text-[10px] uppercase tracking-[0.2em]">CGPA Gap</span>
                    <div className="text-5xl font-black font-headline bg-gradient-to-br from-[#4F8EF7] to-blue-400 bg-clip-text text-transparent tracking-tighter group-hover:scale-105 transition-transform">
                      +<AnimatedCounter target={result.gap > 0 ? result.gap : 0} decimals={2} />
                    </div>
                    <span className="text-on-surface-variant/60 text-xs">Points needed to reach target</span>
                  </Card>
                </StaggerItem>

                {/* Card 2 — Required GPA */}
                <StaggerItem>
                  <Card
                    className="flex flex-col items-center text-center space-y-3 group hover:-translate-y-2 transition-all duration-500 relative overflow-hidden border-t-[3px] border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.1)]"
                  >
                    <span className="text-on-surface-variant font-bold text-[10px] uppercase tracking-[0.2em]">Required Each Semester</span>
                    <div className="text-5xl font-black font-headline bg-gradient-to-br from-purple-400 to-purple-600 bg-clip-text text-transparent tracking-tighter group-hover:scale-105 transition-transform">
                      <AnimatedCounter target={result.requiredGPA} decimals={2} />
                    </div>
                    <span className="text-on-surface-variant/60 text-xs">Average maintenance GPA</span>
                  </Card>
                </StaggerItem>

                {/* Card 3 — Difficulty */}
                <StaggerItem>
                  <Card
                    className={`flex flex-col items-center text-center space-y-3 group hover:-translate-y-2 transition-all duration-500 relative overflow-hidden ${result.requiredGPA > 9.5 ? "animate-pulse" : ""}`}
                    style={{
                      borderTop: `3px solid ${result.requiredGPA > 9.5 ? "rgba(239,68,68,0.6)" : result.requiredGPA >= 8.0 ? "rgba(234,179,8,0.6)" : result.requiredGPA >= 7.0 ? "rgba(59,130,246,0.6)" : "rgba(34,197,94,0.6)"}`,
                      boxShadow: result.requiredGPA > 9.5
                        ? "0 0 20px rgba(239,68,68,0.15)"
                        : result.requiredGPA >= 8.0
                          ? "0 0 20px rgba(234,179,8,0.15)"
                          : result.requiredGPA >= 7.0
                            ? "0 0 20px rgba(59,130,246,0.15)"
                            : "0 0 20px rgba(34,197,94,0.15)",
                    }}
                  >
                    <span className="text-on-surface-variant font-bold text-[10px] uppercase tracking-[0.2em]">Difficulty Level</span>
                    <div className={`text-4xl font-black font-headline ${result.difficulty.color} group-hover:scale-105 transition-transform leading-[1.1]`}>
                      {result.difficulty.label}
                    </div>
                    <span className="text-on-surface-variant/60 text-xs">{result.difficulty.subLabel}</span>
                  </Card>
                </StaggerItem>
              </StaggerContainer>

              {/* ━━━ SEMESTER TABLE ━━━ */}
              {!result.isImpossible && (
                <MotionCard
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="overflow-x-auto"
                >
                  <div className="mb-8">
                    <h3 className="font-headline text-2xl font-bold text-on-surface">Semester Plan Breakdown</h3>
                    <p className="text-on-surface-variant/60 text-sm mt-1">Your required performance per semester</p>
                  </div>
                  <table className="w-full text-left min-w-[700px]">
                    <thead>
                      <tr className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em]" style={{ borderBottom: "1px solid rgba(79,142,247,0.3)" }}>
                        <th className="pb-4 px-2">Semester</th>
                        <th className="pb-4 px-2">Credits</th>
                        <th className="pb-4 px-2">Required GPA</th>
                        <th className="pb-4 px-2">Percentage Needed</th>
                        <th className="pb-4 px-2 w-[30%]">Difficulty Bar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: result.remainingSems }).map((_, i) => {
                        const rowDiff = getRowDifficulty(result.requiredGPA);
                        const pct = calcSgpaToPercentage(result.requiredGPA, activePreset);
                        return (
                          <motion.tr
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + (i * 0.1) }}
                            className={`border-b border-white/5 last:border-0 hover:bg-white/[0.04] transition-colors ${rowDiff.tint}`}
                          >
                            <td className="py-5 px-2 font-bold text-on-surface">Semester {parseInt(completedSemesters) + i + 1}</td>
                            <td className="py-5 px-2 text-on-surface-variant">{result.creditsPerSem}</td>
                            <td className="py-5 px-2 font-bold text-purple-400">{result.requiredGPA}</td>
                            <td className="py-5 px-2 text-on-surface-variant font-medium">{pct.toFixed(1)}%</td>
                            <td className="py-5 px-2">
                              <div className="h-2.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${rowDiff.barWidth}%` }}
                                  transition={{ duration: 1, delay: 0.8 + (i * 0.1), ease: "easeOut" }}
                                  className={`h-full rounded-full ${rowDiff.barColor}`}
                                />
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                      {/* Final row */}
                      <tr>
                        <td colSpan={5} className="py-0 px-0">
                          <div className="mt-2 rounded-2xl py-5 px-4 text-center font-bold text-lg" style={{ background: "linear-gradient(135deg, rgba(79,142,247,0.1), rgba(124,58,237,0.1))" }}>
                            <span className="bg-gradient-to-r from-[#4F8EF7] to-purple-400 bg-clip-text text-transparent">
                              Final Predicted CGPA: {targetCGPA} / 10
                            </span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </MotionCard>
              )}

              {!result.isImpossible && (
                <CalculationBreakdown
                  preset={activePreset}
                  semesters={[
                    {
                      semesterName: "Completed Semesters (Cumulative)",
                      credits: parseFloat(totalCredits) || 0,
                      sgpa: parseFloat(currentCGPA) || 0
                    },
                    ...Array.from({ length: result.remainingSems }).map((_, i) => ({
                      semesterName: `Semester ${parseInt(completedSemesters || "0") + i + 1} (Planned)`,
                      credits: result.creditsPerSem,
                      sgpa: result.requiredGPA
                    }))
                  ]}
                  type="cgpa"
                />
              )}

              {/* ━━━ CGPA PROJECTION CHART ━━━ */}
              {!result.isImpossible && (
                <MotionCard
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="space-y-8"
                >
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <h3 className="font-headline text-2xl font-bold text-on-surface">CGPA Projection</h3>
                      <p className="text-on-surface-variant text-sm">Visualization of your path from current to target status.</p>
                    </div>
                  </div>
                  <div className="w-full h-[300px] sm:h-[400px]">
                    {mounted && (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={result.chartData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                          <XAxis
                            dataKey="semester"
                            stroke="rgba(255,255,255,0.3)"
                            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                          />
                          <YAxis
                            domain={[0, 10]}
                            stroke="rgba(255,255,255,0.3)"
                            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            dx={-10}
                            ticks={[0, 2, 4, 6, 8, 10]}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#111111",
                              borderRadius: "12px",
                              border: "1px solid rgba(255,255,255,0.1)",
                              color: "#fff",
                              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="Current_Trend"
                            stroke="rgba(255,255,255,0.3)"
                            strokeWidth={2}
                            strokeDasharray="6 6"
                            dot={false}
                            animationDuration={1500}
                            name="Current Trend"
                          />
                          <Line
                            type="monotone"
                            dataKey="Target_Path"
                            stroke="#4F8EF7"
                            strokeWidth={3}
                            activeDot={{ r: 8, fill: "#4F8EF7", stroke: "#0a0a0f", strokeWidth: 3 }}
                            dot={{ r: 5, fill: "#4F8EF7", stroke: "#0a0a0f", strokeWidth: 2 }}
                            style={{ filter: "drop-shadow(0 0 6px #4F8EF7)" }}
                            animationDuration={1500}
                            name="Target Path"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  {/* Legend */}
                  <div className="flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/10">
                      <div className="w-6 h-0 border-t-2 border-dashed border-white/30" />
                      <span className="text-xs text-on-surface-variant font-medium">Current Trend</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/10">
                      <div className="w-6 h-0.5 bg-[#4F8EF7] rounded-full shadow-[0_0_6px_#4F8EF7]" />
                      <span className="text-xs text-on-surface-variant font-medium">Target Path</span>
                    </div>
                  </div>
                </MotionCard>
              )}

              {/* ━━━ EXPERT INSIGHT + CGPA JOURNEY ━━━ */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Expert Insight */}
                 <MotionCard
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: 0.5 }}
                   variant="warning"
                   className="space-y-6 flex flex-col justify-between"
                 >
                   <div className="space-y-5">
                     <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(255,193,7,0.15)", border: "1px solid rgba(255,193,7,0.3)" }}>
                       <span className="material-symbols-outlined text-yellow-400 text-2xl">lightbulb</span>
                     </div>
                     <div className="space-y-3">
                       <h4 className="font-headline font-bold text-lg text-white">Expert Insight</h4>
                       <p className="text-on-surface-variant leading-relaxed text-base">
                         {getExpertText()}
                       </p>
                     </div>
                   </div>
                   <Link href="/dashboard">
                     <button className="mt-4 px-5 py-2.5 rounded-full border border-[#4F8EF7]/40 text-[#4F8EF7] text-sm font-bold hover:bg-[#4F8EF7]/10 hover:border-[#4F8EF7]/60 transition-all">
                       View Full Breakdown →
                     </button>
                   </Link>
                 </MotionCard>

                 <MotionCard
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: 0.6 }}
                   variant="accent"
                   className="flex flex-col justify-center"
                 >
                   <h4 className="font-headline font-bold text-xl text-white mb-8">Your CGPA Journey</h4>
                   <div className="relative pt-10 pb-2">
                     {/* Current CGPA Marker */}
                     <motion.div
                       initial={{ left: "0%" }}
                       animate={{ left: `${(parseFloat(currentCGPA) / 10) * 100}%` }}
                       transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                       className="absolute top-0 -translate-x-1/2 flex flex-col items-center gap-0.5 z-10"
                     >
                       <span className="text-[11px] font-bold text-[#4F8EF7] whitespace-nowrap">Current: {parseFloat(currentCGPA).toFixed(1)}</span>
                       <span className="material-symbols-outlined text-[#4F8EF7] text-sm">arrow_drop_down</span>
                     </motion.div>
 
                     {/* Target CGPA Marker */}
                     <motion.div
                       initial={{ left: "0%" }}
                       animate={{ left: `${(parseFloat(targetCGPA) / 10) * 100}%` }}
                       transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
                       className="absolute top-0 -translate-x-1/2 flex flex-col items-center gap-0.5 z-10"
                     >
                       <span className="text-[11px] font-bold text-purple-400 whitespace-nowrap flex items-center gap-0.5">
                         <span className="material-symbols-outlined text-[12px]">flag</span>
                         Target: {parseFloat(targetCGPA).toFixed(1)}
                       </span>
                       <span className="material-symbols-outlined text-purple-400 text-sm">arrow_drop_down</span>
                     </motion.div>
 
                     {/* Progress Bar */}
                     <div className="h-3 bg-white/[0.08] rounded-md w-full relative overflow-hidden">
                       <motion.div
                         initial={{ width: 0 }}
                         animate={{ width: `${(parseFloat(currentCGPA) / 10) * 100}%` }}
                         transition={{ duration: 1, ease: "easeOut", delay: 0.8 }}
                         className="absolute inset-y-0 left-0 rounded-md"
                         style={{ background: "linear-gradient(90deg, #4F8EF7, #7C3AED)" }}
                       />
                       {/* Current position dot */}
                       <motion.div
                         initial={{ left: "0%" }}
                         animate={{ left: `${(parseFloat(currentCGPA) / 10) * 100}%` }}
                         transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                         className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#4F8EF7] border-2 border-black/50 z-10"
                         style={{ boxShadow: "0 0 10px rgba(79,142,247,0.6)" }}
                       />
                       {/* Target position dot */}
                       <motion.div
                         initial={{ left: "0%" }}
                         animate={{ left: `${(parseFloat(targetCGPA) / 10) * 100}%` }}
                         transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
                         className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-purple-500 border-2 border-black/50 z-10"
                         style={{ boxShadow: "0 0 10px rgba(124,58,237,0.6)" }}
                       />
                     </div>
 
                     {/* Scale Labels */}
                     <div className="flex justify-between mt-2 text-[10px] text-on-surface-variant/50 font-bold tracking-widest">
                       <span>0.0</span><span>5.0</span><span>10.0</span>
                     </div>
                   </div>
                   <p className="text-on-surface-variant text-sm mt-6 text-center">
                     You are <span className="text-[#4F8EF7] font-bold">{result.journeyPercent}%</span> of the way to your target.
                   </p>
                 </MotionCard>
              </div>

              {/* ━━━ ACTION BUTTONS ━━━ */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
                <button
                  onClick={() => { setResult(null); }}
                  className="w-full sm:w-64 px-8 py-4 rounded-full border border-white/20 text-on-surface font-bold hover:border-[#4F8EF7]/50 hover:shadow-[0_0_20px_rgba(79,142,247,0.15)] transition-all active:scale-95 text-center flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">refresh</span>
                  Recalculate
                </button>
                <motion.button
                  onClick={handleSavePlan}
                  disabled={isSaving}
                  whileHover={{ scale: 1.02, boxShadow: "0 0 35px rgba(79,142,247,0.4)" }}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full sm:w-64 px-8 py-4 rounded-full font-bold text-white text-center flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60 ${saveSuccess ? "!bg-green-500 !shadow-[0_0_25px_rgba(34,197,94,0.4)]" : ""}`}
                  style={!saveSuccess ? {
                    background: "linear-gradient(135deg, #4F8EF7 0%, #7C3AED 100%)",
                    boxShadow: "0 0 20px rgba(79,142,247,0.3)",
                  } : undefined}
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving...
                    </>
                  ) : saveSuccess ? (
                    <>
                      <span className="material-symbols-outlined text-lg">check_circle</span>
                      Saved!
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">bookmark</span>
                      Save This Plan
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ━━━ BOTTOM NAVIGATION ━━━ */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-20 pb-10">
          <Link href="/calculator" className="w-full sm:w-auto">
            <PremiumButton variant="outline" icon="arrow_back" className="w-full justify-between">
              Back to Calculator
            </PremiumButton>
          </Link>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <PremiumButton variant="primary" icon="arrow_forward" className="w-full justify-between">
              View Dashboard
            </PremiumButton>
          </Link>
        </div>
      </WorkspaceSection>
    </WorkspaceContent>
  );
}
