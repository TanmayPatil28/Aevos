"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
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

// Apple-style fade-in text component
function FadeText({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.span>
  );
}

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
  maxAchievable?: number;
}

// Helper: get difficulty info for a specific GPA value (for per-row coloring)
function getRowDifficulty(gpa: number) {
  if (gpa > 9.5) return { barWidth: 100, barColor: "bg-red-500", tint: "bg-red-500/[0.03]", label: "Very Hard" };
  if (gpa >= 8.5) return { barWidth: 75, barColor: "bg-orange-500", tint: "bg-yellow-500/[0.03]", label: "Challenging" };
  if (gpa >= 7.5) return { barWidth: 50, barColor: "bg-blue-500", tint: "bg-blue-500/[0.03]", label: "Achievable" };
  return { barWidth: 25, barColor: "bg-green-500", tint: "bg-green-500/[0.03]", label: "Easy" };
}

import { useUSMStore } from "@/stores/usmStore";

function SliderInputField({ label, value, setValue, max, step = 0.1, placeholder = "-" }: { label: string, value: string, setValue: (v: string) => void, max: number, step?: number, placeholder?: string }) {
  const numValue = parseFloat(value) || 0;
  const percentage = Math.min((numValue / max) * 100, 100);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || val === '.') return setValue(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      if (num > max) setValue(max.toString());
      else setValue(val);
    }
  };

  return (
    <div className="flex flex-col bg-[#000000] border border-white/5 focus-within:border-white/20 rounded-2xl transition-all shadow-inner relative group pb-1">
      <div className="flex flex-col px-5 pt-4 pb-5 z-10 gap-1">
        <span className="text-xs font-semibold text-[#A1A1A6]">{label}</span>
        <input
          type="number" inputMode="decimal" step={step}
          value={value} onChange={handleChange} placeholder={placeholder}
          className="bg-transparent border-none outline-none w-full text-left text-2xl font-bold text-[#F5F5F7] tracking-tight placeholder:text-[#A1A1A6]/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none m-0"
        />
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-1.5 opacity-40 group-hover:opacity-100 transition-opacity rounded-b-[2rem] overflow-hidden">
        <div className="absolute top-0 left-0 h-full bg-[#06b6d4] pointer-events-none transition-all duration-75 ease-linear" style={{ width: `${percentage}%` }} />
        <input 
          type="range" min={0} max={max} step={step} 
          value={numValue} onChange={handleChange} 
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
        />
      </div>
    </div>
  );
}

export default function PlannerPage() {
  const { activePreset, maxGradePoint } = useUniversity();
  const store = useUSMStore();
  const [currentCGPA, setCurrentCGPA] = useState("");
  const [completedSemesters, setCompletedSemesters] = useState("");
  const [totalCredits, setTotalCredits] = useState("");
  const [targetCGPA, setTargetCGPA] = useState("");
  const [remainingSemesters, setRemainingSemesters] = useState("");
  const [creditsPerSemester, setCreditsPerSemester] = useState("20");
  const [activeTab, setActiveTab] = useState<'strategy' | 'attendance'>('strategy');
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  
  // Transform background element on scroll
  const glowY = useTransform(scrollY, [0, 500], [0, 150]);
  const glowOpacity = useTransform(scrollY, [0, 300], [0.6, 0]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAuthoritative = store.identity.hasAuthoritativeData;
  const branch = (store.identity.studentIdentity as any)?.branch || "B.Tech Student";
  const currSem = store.semesterHistory.length > 0 ? store.semesterHistory.length + 1 : 1;

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
      const defCredits = (activePreset as any).defaultCreditsPerSem || 20;
      setCreditsPerSemester(defCredits.toString());
    }
  }, [store.academic, store.semesterHistory, activePreset]);

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
      const backlogCredits = store.academic.activeBacklogsCount > 0 ? store.academic.activeBacklogsCount * 3 : 0;

      const remainingCredits = (remSems * credPerSem) + backlogCredits;
      let requiredGPA = calculateRequiredGPA(target, cCGPA, currentCredits, remainingCredits);
      let isImpossible = requiredGPA > maxGradePoint;
      let maxAchievable = undefined;
      let actualTarget = target;

      if (isImpossible) {
        maxAchievable = Number((((cCGPA * currentCredits) + (maxGradePoint * remainingCredits)) / (currentCredits + remainingCredits)).toFixed(2));
        requiredGPA = maxGradePoint;
        actualTarget = maxAchievable;
        toast.success(`Target adjusted to maximum achievable: ${maxAchievable}`);
      } else {
        toast.success("Plan generated successfully!");
      }

      // Build chart data — linear interpolation from current to target
      const chartData: ChartDataItem[] = [];
      chartData.push({
        semester: `Sem ${completedSemsVal}`,
        Target_Path: cCGPA,
        Current_Trend: cCGPA,
      });

      for (let i = 1; i <= remSems; i++) {
        const projectedCGPA = cCGPA + ((actualTarget - cCGPA) * (i / remSems));
        chartData.push({
          semester: `Sem ${completedSemsVal + i}`,
          Target_Path: Number(projectedCGPA.toFixed(2)),
          Current_Trend: cCGPA,
        });
      }

      const gap = Number((actualTarget - cCGPA).toFixed(2));
      const percentageNeeded = Number(calcSgpaToPercentage(requiredGPA, activePreset).toFixed(1));

      setResult({
        requiredGPA: Number(requiredGPA.toFixed(2)),
        chartData,
        gap,
        difficulty: getDifficultyLevel(requiredGPA, activePreset),
        remainingSems: remSems,
        creditsPerSem: credPerSem,
        isImpossible,
        percentageNeeded,
        maxAchievable,
      });

      setIsGenerating(false);
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
    if (result.isImpossible) return `Your original target was mathematically impossible. We have recalibrated to the maximum achievable target of ${result.maxAchievable}. You will need to score a perfect ${result.requiredGPA} every remaining semester to reach this.`;
    if (result.requiredGPA > 9.5) return `Your target requires maximum effort. Focus on high-credit core subjects first. Maintaining ${result.requiredGPA}+ GPA every semester is extremely demanding but achievable with disciplined study habits.`;
    if (result.requiredGPA >= 8.0) return `Your target requires consistent focus. Scoring ${result.requiredGPA} each semester is achievable with regular study and good preparation. Avoid backlogs at all costs.`;
    if (result.requiredGPA >= 7.0) return "Your target is well within reach. Maintain consistent performance and avoid any backlogs this semester.";
    return "Your target is very comfortable. You are already on a strong path. Keep performing consistently.";
  };

  return (
    <div className="w-full relative min-h-screen bg-black overflow-x-hidden selection:bg-white/20 selection:text-white pb-32">
      {/* Background Ambient Glows (Ice Blue/Cyan) */}
      <motion.div 
        style={{ y: glowY, opacity: glowOpacity }}
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] pointer-events-none z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/30 via-transparent to-transparent blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-cyan-500/15 blur-[100px] rounded-full mix-blend-screen" />
      </motion.div>

      {/* Cinematic Hero Section */}
      <section className="relative z-10 w-full min-h-[70vh] flex flex-col items-center justify-center pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-8"
          >
            <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-white/50 border border-white/10 rounded-full px-4 py-1.5 bg-white/5 backdrop-blur-md">
              GradeFlow Intelligence
            </span>
          </motion.div>
          
          <h1 className="text-7xl md:text-8xl lg:text-[9rem] font-bold tracking-[-0.05em] leading-[1.05] mb-8 text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(to right, #06b6d4, #67e8f9, #cffafe, #67e8f9, #06b6d4)", backgroundSize: "200% auto" }}>
            <motion.span animate={{ backgroundPosition: ["0% center", "200% center"] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="inline-block w-full">
              <FadeText delay={0.1} className="text-transparent">Plan.</FadeText> <FadeText delay={0.3} className="text-transparent">Achieve.</FadeText> <FadeText delay={0.5} className="text-transparent">Conquer.</FadeText>
            </motion.span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/60 font-medium max-w-2xl mx-auto leading-relaxed">
            <FadeText delay={0.7}>
              GradeFlow maps your exact path to success. Calculates your required SGPA to hit your targets effortlessly.
            </FadeText>
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="mt-12"
          >
            <PresetInfoCard compact />
          </motion.div>
        </div>
      </section>

      {/* Sticky Dynamic Island Navigation */}
      <div className={`sticky top-6 z-[100] flex justify-center mb-16 transition-all duration-500 ${isScrolled ? 'px-4' : 'px-6'}`}>
        <motion.div 
          layout
          className="relative overflow-hidden flex items-center p-1.5 bg-black/60 border border-white/[0.08] rounded-full backdrop-blur-3xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)]"
        >
          {/* Active Highlight Background */}
          <div 
            className="absolute top-1.5 bottom-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 transition-all duration-500 ease-in-out z-0"
            style={{
              left: activeTab === "strategy" ? "6px" : "50%",
              width: "calc(50% - 6px)",
            }}
          />
          
          <button
            onClick={() => setActiveTab("strategy")}
            className={`relative z-10 flex items-center justify-center gap-2 px-6 py-3 md:py-2.5 rounded-full text-[13px] md:text-sm font-bold transition-colors duration-300 w-40 md:w-48 ${
              activeTab === "strategy" 
                ? "text-white drop-shadow-md" 
                : "text-white/50 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-base">strategy</span>
            Strategy
          </button>
          
          <button
            onClick={() => setActiveTab("attendance")}
            className={`relative z-10 flex items-center justify-center gap-2 px-6 py-3 md:py-2.5 rounded-full text-[13px] md:text-sm font-bold transition-colors duration-300 w-40 md:w-48 ${
              activeTab === "attendance" 
                ? "text-white drop-shadow-md" 
                : "text-white/50 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-base">policy</span>
            Attendance OS
          </button>
        </motion.div>
      </div>

      <div className="relative z-10 w-full px-4 md:px-8 max-w-[1400px] mx-auto">
        <WorkspaceContent className="!pt-0 !px-0 bg-transparent">
          <WorkspaceSection>

        <div className="flex flex-col xl:flex-row gap-8 items-start w-full">
          
          {/* ━━━ RIGHT PANE (Controls / Side Panel) ━━━ */}
          <div className="flex-1 min-w-[320px] flex flex-col gap-12 lg:sticky lg:top-28 h-fit relative z-10 w-full order-first xl:order-last">
            <MotionCard
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col space-y-10 !bg-[#2A2A2D]/70 !backdrop-blur-md !rounded-[32px] !border-none"
            >
              {/* Left — Academic Profile (Context) */}
            <div className="space-y-8">
              <h3 className="font-headline text-xl font-bold flex items-center gap-4 text-white">
                <span className="w-10 h-10 rounded-full bg-[#4F8EF7]/20 flex items-center justify-center shadow-[0_0_15px_rgba(79,142,247,0.4)]">
                  <span className="material-symbols-outlined text-[#4F8EF7] text-xl">school</span>
                </span>
                Academic Context
              </h3>
              
              <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <div className="text-xs text-on-surface-variant uppercase tracking-widest font-bold mb-1">Programme</div>
                    <div className="text-lg font-headline font-bold text-white">{branch}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-on-surface-variant uppercase tracking-widest font-bold mb-1">Status</div>
                    <div className="text-lg font-headline font-bold text-purple-400">Semester {currSem}</div>
                  </div>
                </div>

                {isAuthoritative ? (
                  <div className="grid grid-cols-2 gap-6 pt-2">
                    <div>
                      <div className="text-xs text-on-surface-variant font-bold mb-1">Current CGPA</div>
                      <div className="text-3xl font-black text-white">{currentCGPA || "0.00"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-on-surface-variant font-bold mb-1">Earned Credits</div>
                      <div className="text-3xl font-black text-white">{totalCredits || "0"}</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
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
                )}
                
                {isAuthoritative && (
                  <div className="flex flex-col gap-2 mt-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <span className="material-symbols-outlined text-green-400 text-sm">verified</span>
                      <span className="text-xs text-green-400 font-medium">Synced with University DB</span>
                    </div>
                    {store.academic.activeBacklogsCount > 0 && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg mt-2">
                        <span className="material-symbols-outlined text-red-400 text-sm">warning</span>
                        <span className="text-xs text-red-400 font-medium">
                          {store.academic.activeBacklogsCount} Active Backlogs detected. Clearance simulated.
                        </span>
                      </div>
                    )}
                  </div>
                )}
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
                <SliderInputField
                  value={targetCGPA}
                  setValue={(v) => { setTargetCGPA(v); setErrors({ ...errors, targetCGPA: "" }); setTouched({ ...touched, targetCGPA: true }); }}
                  label="Target CGPA"
                  max={maxGradePoint}
                  step={0.1}
                  placeholder="-"
                />
                {targetCGPA && !errors.targetCGPA && (
                  <div className="text-xs text-on-surface-variant px-2 flex justify-between">
                    <span>Career Eligibility:</span>
                    <span className={`font-bold ${parseFloat(targetCGPA) >= 8.5 ? "text-green-400" : parseFloat(targetCGPA) >= 7.5 ? "text-blue-400" : parseFloat(targetCGPA) >= 6.5 ? "text-orange-400" : "text-red-400"}`}>
                      {parseFloat(targetCGPA) >= 8.5 ? "Product Tier / Higher Ed" :
                       parseFloat(targetCGPA) >= 7.5 ? "MNCs / IT Services" :
                       parseFloat(targetCGPA) >= 6.5 ? "Mass Recruiters" : "High Risk"}
                    </span>
                  </div>
                )}
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

            {/* Generate Button */}
            <div className="flex justify-center w-full pt-4">
              <motion.button
                onClick={handleGenerate}
                disabled={isGenerating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="w-full max-w-md py-4 px-8 rounded-full font-semibold text-black text-lg flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed bg-[#F5F5F7]"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    Generate Plan
                  </>
                )}
              </motion.button>
            </div>
          </MotionCard>
        </div>

        {/* ━━━ LEFT PANE (Results & Playbook) ━━━ */}
        <div className="flex-[2] min-w-[320px] flex flex-col gap-6 relative z-10 w-full">
          
          {/* Segmented Control Removed (Moved to Dynamic Island) */}

          <AnimatePresence mode="wait">
            {activeTab === 'strategy' ? (
              <motion.div key="strategy" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                {!result && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-[500px] flex flex-col items-center justify-center rounded-[32px] bg-[#2A2A2D]/40 backdrop-blur-md border-none"
                  >
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                      <span className="material-symbols-outlined text-white/20 text-4xl">dashboard_customize</span>
                    </div>
                    <h3 className="text-2xl font-semibold tracking-tight text-[#F5F5F7]">Your Academic Canvas</h3>
                    <p className="text-[#F5F5F7]/40 mt-2 max-w-sm text-center font-medium">
                      Set your targets on the left to generate your interactive playbook and strategy breakdown.
                    </p>
                  </motion.div>
                )}
                {result && (
              <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="space-y-12"
            >
              {/* Adjusted Target Warning */}
              {result.isImpossible && result.maxAchievable !== undefined && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-[2rem] p-8 border border-orange-500/40 text-center space-y-3"
                  style={{
                    background: "rgba(249,115,22,0.08)",
                    boxShadow: "0 0 30px rgba(249,115,22,0.2)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <span className="material-symbols-outlined text-orange-400 text-4xl">info</span>
                  <h3 className="text-xl font-bold text-orange-400">Adjusted Maximum Target: {result.maxAchievable}</h3>
                  <p className="text-orange-300/80 max-w-md mx-auto">
                    Your original target was mathematically impossible. We have adjusted your goal to the maximum achievable CGPA ({result.maxAchievable}) assuming perfect scores in all remaining semesters.
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
                    className="flex flex-col items-center text-center space-y-3 group hover:-translate-y-2 transition-all duration-500 relative overflow-hidden border-t-[3px] border-cyan-500/60 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                  >
                    <span className="text-on-surface-variant font-bold text-[10px] uppercase tracking-[0.2em]">Required Each Semester</span>
                    <div className="text-5xl font-black font-headline bg-gradient-to-br from-cyan-400 to-cyan-600 bg-clip-text text-transparent tracking-tighter group-hover:scale-105 transition-transform">
                      <AnimatedCounter target={result.requiredGPA} decimals={2} />
                    </div>
                    <span className="text-on-surface-variant/60 text-xs">Required SGPA</span>
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

              {/* ━━━ INTERACTIVE PLAYBOOK TABLE ━━━ */}
                <MotionCard
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="overflow-x-auto"
                >
                  <div className="mb-8">
                    <h3 className="font-headline text-2xl font-bold text-on-surface flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#4F8EF7]">menu_book</span>
                      The Playbook
                    </h3>
                    <p className="text-on-surface-variant/60 text-sm mt-1">Your required performance mapped semester by semester.</p>
                  </div>
                  <table className="w-full text-left min-w-[700px]">
                    <thead>
                      <tr className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em]" style={{ borderBottom: "1px solid rgba(79,142,247,0.3)" }}>
                        <th className="pb-4 px-2">Semester</th>
                        <th className="pb-4 px-2">Credits</th>
                        <th className="pb-4 px-2">Required GPA</th>
                        <th className="pb-4 px-2">Action / Status</th>
                        <th className="pb-4 px-2 w-[30%]">Difficulty Bar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: result.remainingSems }).map((_, i) => {
                        const rowDiff = getRowDifficulty(result.requiredGPA);
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
                            <td className="py-5 px-2">
                              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg font-mono font-bold text-cyan-400">
                                {result.requiredGPA}
                              </span>
                            </td>
                            <td className="py-5 px-2">
                              <button className="text-xs font-bold text-[#4F8EF7] hover:underline flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">tune</span> Adjust
                              </button>
                            </td>
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
                          <div className="mt-4 rounded-2xl py-6 px-4 text-center border border-white/10 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(4,120,87,0.1))" }}>
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-sky-600/10 opacity-50 blur-xl" />
                            <div className="relative z-10 flex flex-col items-center justify-center space-y-2">
                              <span className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">Projected Graduation CGPA</span>
                              <span className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-sky-400 bg-clip-text text-transparent">
                                {result.maxAchievable ?? targetCGPA} <span className="text-lg text-white/30">/ {maxGradePoint}</span>
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </MotionCard>

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



              {/* ━━━ EXPERT INSIGHT + CGPA JOURNEY ━━━ */}
              <div className="grid grid-cols-1">
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
                 
                 {/* Attendance OS Buffer Insight */}
                 <MotionCard
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: 0.6 }}
                   className="space-y-6 flex flex-col justify-between mt-8 border border-blue-500/20"
                   style={{ background: "rgba(59,130,246,0.05)" }}
                 >
                   <div className="space-y-5">
                     <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)" }}>
                       <span className="material-symbols-outlined text-blue-400 text-2xl">policy</span>
                     </div>
                     <div className="space-y-3">
                       <h4 className="font-headline font-bold text-lg text-white">Attendance OS Safety Buffer</h4>
                       <p className="text-on-surface-variant leading-relaxed text-base">
                         To safely hit a <strong className="text-blue-400">{result.requiredGPA} SGPA</strong>, you must maintain a minimum attendance of <strong>85%</strong> across all core subjects. Any detentions or marks deducted for low attendance will instantly derail this projection. Use the Attendance OS to track your exact bunking limits.
                       </p>
                     </div>
                   </div>
                   <Link href="/attendance">
                     <button className="mt-4 px-5 py-2.5 rounded-full border border-blue-400/40 text-blue-400 text-sm font-bold hover:bg-blue-400/10 hover:border-blue-400/60 transition-all">
                       Open Attendance OS →
                     </button>
                   </Link>
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
                  whileHover={{ scale: 1.02, boxShadow: "0 0 35px rgba(16,185,129,0.4)" }}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full sm:w-64 px-8 py-4 rounded-full font-bold text-white text-center flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60 ${saveSuccess ? "!bg-green-500 !shadow-[0_0_25px_rgba(34,197,94,0.4)]" : ""}`}
                  style={!saveSuccess ? {
                    background: "linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)",
                    boxShadow: "0 0 20px rgba(16,185,129,0.3)",
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
          </motion.div>
        ) : (
          <motion.div key="attendance" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                {/* ━━━ ATTENDANCE OS MOCK ━━━ */}
                <div className="rounded-[32px] bg-[#2A2A2D]/40 backdrop-blur-md p-10 flex flex-col items-center text-center space-y-6">
                  <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-400 text-4xl">policy</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter text-[#F5F5F7]">
                    Attendance OS
                  </h2>
                  <p className="text-[#F5F5F7]/60 max-w-lg text-lg">
                    Your attendance limits are seamlessly integrated. Keep your attendance above <strong className="text-[#F5F5F7]">85%</strong> to ensure you can sit for all exams and achieve your planned CGPA.
                  </p>
                  
                  <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-black/40 rounded-3xl p-6 border border-white/5">
                      <div className="text-[#F5F5F7]/50 text-sm font-semibold tracking-wide uppercase mb-2">Total Classes</div>
                      <div className="text-5xl font-semibold text-[#F5F5F7]">120</div>
                    </div>
                    <div className="bg-black/40 rounded-3xl p-6 border border-white/5 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent opacity-50" />
                      <div className="relative z-10">
                        <div className="text-blue-400/80 text-sm font-semibold tracking-wide uppercase mb-2">Current %</div>
                        <div className="text-5xl font-semibold text-blue-400">88%</div>
                      </div>
                    </div>
                    <div className="bg-black/40 rounded-3xl p-6 border border-white/5 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-transparent opacity-50" />
                      <div className="relative z-10">
                        <div className="text-orange-400/80 text-sm font-semibold tracking-wide uppercase mb-2">Bunks Left</div>
                        <div className="text-5xl font-semibold text-orange-400">4</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

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
    </div>
    </div>
  );
}
