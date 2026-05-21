"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { clsx } from "clsx";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
  RadialBarChart, RadialBar, PolarAngleAxis
} from "recharts";
import {
  Zap, AlertTriangle, CheckCircle2, TrendingDown,
  RefreshCw, Save, History,
  Plus, Trash2
} from "lucide-react";
import AnimatedCounter from "@/components/AnimatedCounter";
import StaggerContainer, { StaggerItem } from "@/components/StaggerContainer";
import PremiumButton from "@/components/PremiumButton";
import PageContainer from "@/components/layout/PageContainer";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import PresetInfoCard from "@/components/PresetInfoCard";
import CalculationBreakdown from "@/components/CalculationBreakdown";
import { useUniversity } from "@/components/providers/UniversityProvider";

const MotionCard = motion(Card);

interface BacklogItem {
  id: string;
  subjectName: string;
  credits: string;
  expectedGrade: string; // Grade if failed (usually 0)
}

interface BacklogResult {
  cgpaPass: number;
  cgpaFail: number;
  drop: number;
  recoveryGPA: number;
  nextSemCredits: number;
  severityLabel: string;
  severityColor: string;
  textSeverityColor: string;
  borderGlow: string;
  isPulse: boolean;
  chartData: { name: string; CGPA: number; fill: string }[];
  gaugeData: { name: string; value: number; fill: string }[];
  totalBacklogCredits: number;
}

export default function BacklogPage() {
  const { maxGradePoint, activePreset } = useUniversity();
  const [currentCGPA, setCurrentCGPA] = useState("");
  const [completedCredits, setCompletedCredits] = useState("");
  const [semesterCredits, setSemesterCredits] = useState("20");
  const [expectedGPA, setExpectedGPA] = useState("8.0"); // GPA for non-backlog subjects
  const [backlogs, setBacklogs] = useState<BacklogItem[]>([
    { id: "1", subjectName: "Engineering Math", credits: "4", expectedGrade: "0" }
  ]);

  const [result, setResult] = useState<BacklogResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [mounted, setMounted] = useState(false);

  // Removed inputClass and labelClass helper to use componentized Input instead

  useEffect(() => {
    setMounted(true);
  }, []);

  const addBacklog = () => {
    setBacklogs([...backlogs, { id: Math.random().toString(36).substr(2, 9), subjectName: "", credits: "4", expectedGrade: "0" }]);
  };

  const removeBacklog = (id: string) => {
    if (backlogs.length > 1) {
      setBacklogs(backlogs.filter(b => b.id !== id));
    } else {
      toast.error("At least one backlog is required for simulation.");
    }
  };

  const updateBacklog = (id: string, field: keyof BacklogItem, value: string) => {
    setBacklogs(backlogs.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    const cCGPA = parseFloat(currentCGPA);
    const cCredits = parseFloat(completedCredits);
    const sCredits = parseFloat(semesterCredits);
    const eGPA = parseFloat(expectedGPA);

    if (!currentCGPA) e.currentCGPA = "Required";
    else if (cCGPA < 0 || cCGPA > maxGradePoint) e.currentCGPA = `0-${maxGradePoint} format`;

    if (!completedCredits) e.completedCredits = "Required";
    else if (cCredits <= 0) e.completedCredits = "> 0";

    if (!semesterCredits) e.semesterCredits = "Required";
    else if (sCredits <= 0) e.semesterCredits = "> 0";

    if (!expectedGPA) e.expectedGPA = "Required";
    else if (eGPA < 0 || eGPA > maxGradePoint) e.expectedGPA = `0-${maxGradePoint} format`;

    backlogs.forEach((b, i) => {
      if (!b.subjectName) e[`backlog_${i}_name`] = "Required";
      if (!b.credits || parseFloat(b.credits) <= 0) e[`backlog_${i}_credits`] = "Required";
    });

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCalculate = () => {
    if (!validate()) {
      toast.error("Please explicitly fill the required fields.");
      return;
    }
    setIsCalculating(true);

    setTimeout(() => {
      const cCGPA = parseFloat(currentCGPA);
      const cCredits = parseFloat(completedCredits);
      const sCredits = parseFloat(semesterCredits);
      const eGPA = parseFloat(expectedGPA);

      const totalBacklogCredits = backlogs.reduce((sum, b) => sum + parseFloat(b.credits || "0"), 0);
      const currentPoints = cCGPA * cCredits;
      const totalCreditsAtEnd = cCredits + sCredits;

      // Scenario 1: Pass everything with Expected GPA
      const passPointsTotal = currentPoints + (sCredits * eGPA);
      const cgpaPass = passPointsTotal / totalCreditsAtEnd;

      // Scenario 2: Actual impact of specified backlogs
      const safeCredits = sCredits - totalBacklogCredits;
      const safePoints = safeCredits * eGPA;
      const backlogPoints = backlogs.reduce((sum, b) => sum + (parseFloat(b.credits || "0") * parseFloat(b.expectedGrade || "0")), 0);
      const failPointsTotal = currentPoints + safePoints + backlogPoints;
      const cgpaFail = failPointsTotal / totalCreditsAtEnd;

      const dropValue = cgpaPass - cgpaFail;

      // Recovery calculation
      const nextSemCredits = sCredits;
      const targetTotalPointsAfterNext = cgpaPass * (totalCreditsAtEnd + nextSemCredits);
      const pointsNeededNextSem = targetTotalPointsAfterNext - failPointsTotal;
      const recoveryGPA = pointsNeededNextSem / nextSemCredits;

      // Classifying Severity
      let severityLabel = "Minor";
      let severityColor = "bg-green-500";
      let textSeverityColor = "text-green-500";
      let borderGlow = "shadow-[0_0_20px_rgba(34,197,94,0.3)]";
      let isPulse = false;

      if (dropValue >= 0.8) {
        severityLabel = "Catastrophic";
        severityColor = "bg-red-600";
        textSeverityColor = "text-red-500";
        borderGlow = "shadow-[0_0_40px_rgba(220,38,38,0.5)]";
        isPulse = true;
      } else if (dropValue >= 0.5) {
        severityLabel = "Severe";
        severityColor = "bg-orange-600";
        textSeverityColor = "text-orange-500";
        borderGlow = "shadow-[0_0_30px_rgba(234,88,12,0.4)]";
      } else if (dropValue >= 0.2) {
        severityLabel = "Moderate";
        severityColor = "bg-yellow-500";
        textSeverityColor = "text-yellow-500";
        borderGlow = "shadow-[0_0_20px_rgba(234,179,8,0.3)]";
      }

      // Gauge Data
      const gaugeData = [
        { name: 'Damage', value: Number(cgpaFail.toFixed(2)), fill: dropValue > 0.5 ? '#ef4444' : '#f59e0b' }
      ];

      const chartData = [
        { name: "If Passed", CGPA: Number(cgpaPass.toFixed(2)), fill: "url(#blueGradient)" },
        { name: "If Failed", CGPA: Number(cgpaFail.toFixed(2)), fill: "url(#redGradient)" }
      ];

      setResult({
        cgpaPass: Number(cgpaPass.toFixed(2)),
        cgpaFail: Number(cgpaFail.toFixed(2)),
        drop: Number(dropValue.toFixed(2)),
        recoveryGPA: Number(recoveryGPA.toFixed(2)),
        nextSemCredits,
        severityLabel,
        severityColor,
        textSeverityColor,
        borderGlow,
        isPulse,
        chartData,
        gaugeData,
        totalBacklogCredits
      });

      setIsCalculating(false);
      toast.success("Simulation complete.");
    }, 1000);
  };



  return (
    <PageContainer className="relative z-10 space-y-12">
      <div className="fixed top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[140px] mix-blend-screen -z-10 pointer-events-none animate-pulse" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-secondary/15 rounded-full blur-[140px] mix-blend-screen -z-10 pointer-events-none animate-pulse" />
        <StaggerContainer className="text-center space-y-4">
          <StaggerItem>
            <h1 className="text-5xl md:text-7xl font-headline font-black tracking-tighter mb-6 text-white drop-shadow-2xl">
              Backlog Impact <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-primary/80 animate-gradient-x">Scanner</span>
            </h1>
          </StaggerItem>
          <StaggerItem>
            <p className="text-on-surface-variant max-w-2xl mx-auto text-lg leading-relaxed font-medium">
               Quantify the precision damage of academic setbacks.
            </p>
          </StaggerItem>
          <StaggerItem>
            <div className="mt-4">
              <PresetInfoCard compact />
            </div>
          </StaggerItem>
        </StaggerContainer>

        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          padding="xl"
          className="relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-50" />

          <div className="grid lg:grid-cols-2 gap-16 items-start mb-12 relative z-10">
            <div className="space-y-10">
              <div className="space-y-2">
                <h3 className="font-headline text-2xl font-black flex items-center gap-4 text-white">
                  <span className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-[0_0_20px_rgba(80,143,248,0.3)] border border-primary/20">
                    <History className="text-primary w-6 h-6" />
                  </span>
                  Your Academic Status
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-2 md:pl-16">
                <Input
                  type="number"
                  step="0.01"
                  value={currentCGPA}
                  onChange={(e) => { setCurrentCGPA(e.target.value); setErrors({ ...errors, currentCGPA: "" }); }}
                  label="Current CGPA"
                  floating
                  error={errors.currentCGPA}
                  placeholder=" "
                />
                <Input
                  type="number"
                  value={completedCredits}
                  onChange={(e) => { setCompletedCredits(e.target.value); setErrors({ ...errors, completedCredits: "" }); }}
                  label="Credits Earned"
                  floating
                  error={errors.completedCredits}
                  placeholder=" "
                />
                <Input
                  type="number"
                  value={semesterCredits}
                  onChange={(e) => { setSemesterCredits(e.target.value); setErrors({ ...errors, semesterCredits: "" }); }}
                  label="Sem Credits"
                  floating
                  placeholder=" "
                />
                <Input
                  type="number"
                  step="0.1"
                  value={expectedGPA}
                  onChange={(e) => { setExpectedGPA(e.target.value); setErrors({ ...errors, expectedGPA: "" }); }}
                  label="Target GPA"
                  floating
                  placeholder=" "
                />
              </div>
            </div>

            <div className="space-y-10">
              <div className="flex items-end justify-between">
                <div className="space-y-2">
                  <h3 className="font-headline text-2xl font-black flex items-center gap-4 text-white leading-none">
                    <span className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.2)] border border-red-500/20 shrink-0">
                      <AlertTriangle className="text-red-500 w-6 h-6" />
                    </span>
                    Backlog Details
                  </h3>
                </div>
                <button
                  onClick={addBacklog}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 group mb-1"
                >
                  <Plus size={14} className="group-hover:rotate-90 transition-transform" />
                  Add Backlog
                </button>
              </div>

              <div className="space-y-4 pl-2 md:pl-16">
                <AnimatePresence mode="popLayout">
                  {backlogs.map((backlog, index) => (
                    <motion.div
                      key={backlog.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, scale: 0.95 }}
                      className="grid grid-cols-12 gap-3 items-center group/row"
                    >
                      <div className="col-span-5">
                        <Input
                          type="text"
                          value={backlog.subjectName}
                          onChange={(e) => updateBacklog(backlog.id, "subjectName", e.target.value)}
                          label="Subject"
                          floating
                          hasError={!!errors[`backlog_${index}_name`]}
                          placeholder=" "
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          value={backlog.credits}
                          onChange={(e) => updateBacklog(backlog.id, "credits", e.target.value)}
                          label="Credits"
                          floating
                          hasError={!!errors[`backlog_${index}_credits`]}
                          placeholder=" "
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          value={backlog.expectedGrade}
                          onChange={(e) => updateBacklog(backlog.id, "expectedGrade", e.target.value)}
                          label="F Grade"
                          floating
                          hasError={!!errors[`backlog_${index}_grade`]}
                          placeholder=" "
                        />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button
                          onClick={() => removeBacklog(backlog.id)}
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover/row:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="flex justify-center relative z-10 pt-4">
            <button
              onClick={handleCalculate}
              disabled={isCalculating}
              className={clsx(
                "group relative w-full max-w-2xl h-16 rounded-full overflow-hidden transition-all duration-500 active:scale-[0.98]",
                isCalculating ? "opacity-90" : "hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(80,143,248,0.4)]"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-secondary animate-gradient-x" />
              <div className="relative h-full flex items-center justify-center gap-3 text-white">
                <AnimatePresence mode="wait">
                  {isCalculating ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 } }
                      animate={{ opacity: 1 } }
                      className="flex items-center gap-3"
                    >
                      <RefreshCw className="animate-spin w-6 h-6" />
                      <span className="text-lg font-black tracking-widest uppercase">Scanning...</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="simulate"
                      initial={{ opacity: 0 } }
                      animate={{ opacity: 1 } }
                      className="flex items-center gap-3"
                    >
                      <Zap className="w-6 h-6 fill-white" />
                      <span className="text-lg font-black tracking-widest uppercase">Start Impact Analysis</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </button>
          </div>
        </MotionCard>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-12 pb-20"
            >
              <div className="grid lg:grid-cols-3 gap-8">
                <Card className="flex flex-col items-center justify-center relative h-full">
                  <div className="relative w-full h-[250px] flex items-center justify-center">
                    {mounted && (
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                          cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={20}
                          data={result.gaugeData} startAngle={180} endAngle={0}
                        >
                          <PolarAngleAxis type="number" domain={[0, 10]} tick={false} />
                          <RadialBar background dataKey="value" cornerRadius={10} fill={result.drop > 0.5 ? "#ef4444" : "#f59e0b"} />
                        </RadialBarChart>
                      </ResponsiveContainer>
                    )}
                    <div className="absolute inset-x-0 bottom-10 flex flex-col items-center">
                      <span className="text-4xl md:text-5xl font-headline font-black text-white">
                        <AnimatedCounter target={result.cgpaFail} decimals={2} />
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">Post-Backlog CGPA</span>
                    </div>
                  </div>
                  <div className="text-center mt-4 space-y-3 relative z-10">
                    <div className={clsx("inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border", result.textSeverityColor, "border-current bg-current/5")}>
                      {result.severityLabel} Severity
                    </div>
                  </div>
                </Card>

                <div className="lg:col-span-2 grid md:grid-cols-2 gap-8">
                  <Card className="border border-green-500/20 bg-green-500/5 relative h-full overflow-hidden">
                    <div className="relative z-10 flex flex-col justify-between h-full">
                      <div className="space-y-6">
                         <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center border border-green-500/20"><CheckCircle2 className="text-green-500" /></div>
                         <h4 className="text-green-500 font-headline font-black uppercase tracking-widest">Optimistic Path</h4>
                      </div>
                      <div className="flex items-baseline gap-3 mt-8">
                        <span className="text-6xl font-headline font-black text-white"><AnimatedCounter target={result.cgpaPass} decimals={2} /></span>
                        <span className="text-green-500 font-black text-xs uppercase bg-green-500/10 px-3 py-1 rounded-full">Clear ✓</span>
                      </div>
                    </div>
                  </Card>

                  <Card className={clsx("border relative h-full overflow-hidden", result.borderGlow, result.drop > 0.5 ? "border-red-500/30 bg-red-500/5" : "border-orange-500/30 bg-orange-500/5")}>
                    <div className="relative z-10 flex flex-col justify-between h-full">
                       <div className="space-y-6">
                          <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center border", result.drop > 0.5 ? "bg-red-500/20 border-red-500/20" : "bg-orange-500/20 border-orange-500/20")}><TrendingDown className={result.textSeverityColor} /></div>
                          <h4 className={clsx("font-headline font-black uppercase tracking-widest", result.textSeverityColor)}>Backlog Reality</h4>
                       </div>
                       <div className="flex items-baseline gap-3 mt-8">
                         <span className="text-6xl font-headline font-black text-white"><AnimatedCounter target={result.cgpaFail} decimals={2} /></span>
                         <span className={clsx("font-black text-xs uppercase px-3 py-1 rounded-full bg-current/10", result.textSeverityColor)}>-{result.drop} Drop</span>
                       </div>
                    </div>
                  </Card>
                </div>
              </div>

              <Card className="md:p-14 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
                <div className="relative z-10">
                  <h3 className="text-3xl font-headline font-black text-white mb-12">Impact Delta Analysis</h3>
                  <div className="h-[400px] w-full">
                    {mounted && (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={result.chartData} barGap={0}>
                           <defs>
                             <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4} /></linearGradient>
                             <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" /><stop offset="100%" stopColor="#ef4444" stopOpacity={0.4} /></linearGradient>
                           </defs>
                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 800 }} dy={15} />
                           <YAxis hide domain={[0, 10]} />
                           <Bar dataKey="CGPA" radius={[20, 20, 12, 12]} barSize={120} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </Card>

              <CalculationBreakdown
                preset={activePreset}
                semesters={[
                  { 
                    semesterName: "Previous Semesters (Cumulative)", 
                    credits: parseFloat(completedCredits) || 0, 
                    sgpa: parseFloat(currentCGPA) || 0 
                  },
                  { 
                    semesterName: "Current Semester (Impacted)", 
                    credits: parseFloat(semesterCredits) || 0, 
                    sgpa: parseFloat(semesterCredits) > 0 
                      ? (((parseFloat(semesterCredits) - result.totalBacklogCredits) * (parseFloat(expectedGPA) || 0)) / parseFloat(semesterCredits)) 
                      : 0 
                  }
                ]}
                type="cgpa"
              />

              <Card variant="warning" className="md:p-14 relative overflow-hidden">
                <div className="relative z-10 space-y-12">
                   <div className="space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center"><RefreshCw className="text-amber-500" /></div>
                      <h3 className="text-4xl font-headline font-black text-white">Recovery Roadmap</h3>
                      <p className="text-on-surface-variant text-lg">Hit your targets next cycle to restore academic baseline.</p>
                   </div>
                   <div className="grid md:grid-cols-2 gap-12">
                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase text-amber-500/70">Required Target Next Cycle</span>
                        <div className="flex items-baseline gap-4">
                           <span className="text-7xl font-headline font-black text-white"><AnimatedCounter target={result.recoveryGPA} decimals={2} /></span>
                           {result.recoveryGPA > 10 && <span className="text-red-500 font-black text-xs animate-pulse">Critical</span>}
                        </div>
                      </div>
                      <div className="space-y-4">
                         {backlogs.map((b) => (
                           <div key={b.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                              <span className="font-bold text-white">{b.subjectName || "Subject"}</span>
                              <span className="text-xs font-black text-amber-500">RESIT REQ</span>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              </Card>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12">
                <button
                  onClick={() => {
                    if (isSaving) return;
                    setIsSaving(true);
                    setTimeout(() => {
                      let existing = [];
                      try {
                        const saved = localStorage.getItem("gradeflow_backlog_reports");
                        const parsed = saved ? JSON.parse(saved) : [];
                        if (Array.isArray(parsed)) {
                          existing = parsed;
                        }
                      } catch {}
                      try {
                        existing.unshift({ ...result, saved_at: new Date().toISOString() });
                        localStorage.setItem("gradeflow_backlog_reports", JSON.stringify(existing.slice(0, 20)));
                        toast.success("Report saved locally.");
                      } catch {
                        toast.error("Failed to save report.");
                      }
                      setIsSaving(false);
                    }, 500);
                  }}
                  className="px-10 h-14 rounded-full bg-primary text-white font-black uppercase text-xs flex items-center gap-3 disabled:opacity-50"
                  disabled={isSaving}
                >
                   {isSaving ? <RefreshCw className="animate-spin" /> : <Save size={18} />} Save Report
                </button>
                <button onClick={() => setResult(null)} className="px-10 h-14 rounded-full border border-white/10 text-white font-black uppercase text-xs flex items-center gap-3">
                   <RefreshCw size={18} /> Reset
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-20">
          <Link href="/planner" className="w-full sm:w-auto">
            <PremiumButton variant="outline" icon="arrow_back" className="w-full justify-between">Back to Planner</PremiumButton>
          </Link>
          <Link href="/calculator" className="w-full sm:w-auto">
            <PremiumButton variant="primary" icon="calculate" className="w-full justify-between">GPA Calculator</PremiumButton>
          </Link>
        </div>
    </PageContainer>
  );
}
