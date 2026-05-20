"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, Calculator, BrainCircuit,
  AlertTriangle, CheckCircle2, Save
} from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { useUniversity } from '@/components/providers/UniversityProvider';

const GRADES = [
  { grade: "O", gpa: 10, minPercent: 90, color: "text-emerald-400" },
  { grade: "A+", gpa: 9, minPercent: 80, color: "text-emerald-400/80" },
  { grade: "A", gpa: 8, minPercent: 70, color: "text-green-400" },
  { grade: "B+", gpa: 7, minPercent: 60, color: "text-yellow-300" },
  { grade: "B", gpa: 6, minPercent: 55, color: "text-yellow-400" },
  { grade: "C", gpa: 5, minPercent: 50, color: "text-orange-400" },
  { grade: "P", gpa: 4, minPercent: 40, color: "text-red-400" },
  { grade: "F", gpa: 0, minPercent: 0, color: "text-red-600" },
];

type SubjectType = 'theory100' | 'theory50' | 'lab';

export default function PredictorPage() {
  const { activePreset } = useUniversity();
  const [type, setType] = useState<SubjectType>('theory100');

  // Marks state
  const [t1, setT1] = useState<string>('');
  const [t2, setT2] = useState<string>('');
  const [assig, setAssig] = useState<string>('');
  const [endSem, setEndSem] = useState<string>('');
  const [labExam, setLabExam] = useState<string>('');

  // Settings
  const [useBestOf, setUseBestOf] = useState(false);
  const [targetGrade, setTargetGrade] = useState<string>('O');

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculations
  const stats = useMemo(() => {
    // Parse numbers safely inside to avoid hook dependency issues
    const nT1 = parseFloat(t1) || 0;
    const nT2 = parseFloat(t2) || 0;
    const nAssig = parseFloat(assig) || 0;
    const nEndSem = parseFloat(endSem) || 0;
    const nLabExam = parseFloat(labExam) || 0;

    // Constants
    const maxEndSem = type === 'theory100' ? 100 : type === 'theory50' ? 50 : 0;
    const maxT1 = 30;
    const maxT2 = 30;
    const maxAssig = 40;
    const maxLabExam = 50;

    const isLab = type === 'lab';
    
    let maxBase = 0;
    let scoredBase = 0;
    let totalMax = 0;
    let totalScored = 0;

    if (isLab) {
      maxBase = maxAssig;
      scoredBase = Math.min(nAssig, maxAssig);
      totalMax = maxAssig + maxLabExam; // 90
      totalScored = scoredBase + Math.min(nLabExam, maxLabExam);
    } else {
      if (useBestOf) {
        maxBase = maxT1 + maxAssig; // 30 + 40 = 70
        scoredBase = Math.max(nT1, nT2) + Math.min(nAssig, maxAssig);
      } else {
        maxBase = maxT1 + maxT2 + maxAssig; // 100
        scoredBase = Math.min(nT1, maxT1) + Math.min(nT2, maxT2) + Math.min(nAssig, maxAssig);
      }
      totalMax = maxBase + maxEndSem;
      totalScored = scoredBase + Math.min(nEndSem, maxEndSem);
    }

    const percentage = totalMax > 0 ? (totalScored / totalMax) * 100 : 0;
    const currentGrade = GRADES.find(g => percentage >= g.minPercent) || GRADES[GRADES.length - 1];

    // Predictor Logic
    const target = GRADES.find(g => g.grade === targetGrade) || GRADES[0];
    const requiredTotalMarks = (target.minPercent / 100) * totalMax;
    const neededInEndSem = requiredTotalMarks - scoredBase;

    const achievable = neededInEndSem <= (isLab ? maxLabExam : maxEndSem);
    const alreadyThere = scoredBase >= requiredTotalMarks;

    return {
      maxBase,
      scoredBase,
      totalMax,
      totalScored,
      percentage,
      currentGrade,
      neededInEndSem: Math.max(0, Math.ceil(neededInEndSem)),
      achievable,
      alreadyThere,
      maxExamMarks: isLab ? maxLabExam : maxEndSem,
      missingForPass: (0.4 * totalMax) - totalScored,
      isLab,
      maxEndSem,
      nT1,
      nT2,
      nAssig,
      nEndSem,
      nLabExam
    };
  }, [type, t1, t2, assig, endSem, labExam, useBestOf, targetGrade]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    if (isSaving) return;
    setIsSaving(true);
    let existing = [];
    try {
      const saved = localStorage.getItem("gradeflow_predictor_scenarios");
      const parsed = saved ? JSON.parse(saved) : [];
      if (Array.isArray(parsed)) {
        existing = parsed;
      }
    } catch {}

    try {
      existing.unshift({
        type,
        percentage: stats.percentage,
        currentGrade: stats.currentGrade.grade,
        neededInEndSem: stats.neededInEndSem,
        saved_at: new Date().toISOString(),
      });
      localStorage.setItem("gradeflow_predictor_scenarios", JSON.stringify(existing.slice(0, 20)));
      toast.success("Scenario saved locally.");
    } catch {
      toast.error("Failed to save scenario.");
    } finally {
      setIsSaving(false);
    }
  };

  const isLab = type === 'lab';
  const maxEndSem = type === 'theory100' ? 100 : type === 'theory50' ? 50 : 0;

  return (
    <div className="min-h-screen pt-24 pb-20 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 relative z-10 space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-bold tracking-widest uppercase mb-2">
              <BrainCircuit className="w-4 h-4" />
              Strategy Engine
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60">
              Marks Predictor
            </h1>
            <p className="text-on-surface-variant font-medium text-lg max-w-xl leading-relaxed">
               Predict exact End Semester marks needed to achieve your target grade.
            </p>
          </div>

          <div className="flex bg-[var(--surface-container-highest)]/50 backdrop-blur-md p-1.5 rounded-[1.25rem] border border-[var(--outline-variant)] w-full md:w-auto">
            {(['theory100', 'theory50', 'lab'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={clsx(
                  "flex-1 md:w-32 py-2.5 text-xs font-bold uppercase tracking-wider rounded-[1rem] transition-all relative",
                  type === t ? "text-primary" : "text-on-surface-variant hover:text-on-surface hover:bg-white/5"
                )}
              >
                {type === t && (
                  <motion.div
                    layoutId="type-active"
                    className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-[1rem]"
                  />
                )}
                <span className="relative z-10">
                  {t === 'theory100' ? 'Theory (100)' : t === 'theory50' ? 'Theory (50)' : 'Lab Subject'}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12">
            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-[var(--surface-container-high)]/40 backdrop-blur-2xl border border-[var(--outline-variant)]/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-primary" />
                      Performance Inputs
                    </h3>
                    {!isLab && (
                      <label className="flex items-center gap-2 cursor-pointer group/toggle">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant group-hover/toggle:text-on-surface transition-colors">
                          Best of T1/T2
                        </span>
                        <div className={clsx(
                          "w-9 h-5 rounded-full p-0.5 transition-colors duration-300 relative",
                          useBestOf ? "bg-primary" : "bg-[var(--outline-variant)]"
                        )}>
                          <motion.div
                            className="w-4 h-4 bg-white rounded-full shadow-sm"
                            animate={{ x: useBestOf ? 16 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        </div>
                        <input type="checkbox" className="hidden" checked={useBestOf} onChange={() => setUseBestOf(!useBestOf)} />
                      </label>
                    )}
                  </div>

                  <div className="space-y-4 relative z-10">
                    <AnimatePresence mode="popLayout">
                      {!isLab ? (
                        <motion.div
                          key="theory"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="grid grid-cols-2 gap-4"
                        >
                          <InputField label="T1 Marks" value={t1} setValue={setT1} max={30} icon="1" />
                          <InputField label="T2 Marks" value={t2} setValue={setT2} max={30} icon="2" />
                          <div className="col-span-2">
                            <InputField label="Assignments" value={assig} setValue={setAssig} max={40} icon="A" />
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="lab"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="space-y-4"
                        >
                          <InputField label="Assignments / Journal" value={assig} setValue={setAssig} max={40} icon="A" />
                          <InputField label="Mock Practical (Optional)" value={t1} setValue={setT1} max={0} icon="M" disabled />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="pt-4 mt-6 border-t border-[var(--outline-variant)]/30">
                      <InputField
                        label={isLab ? "Lab Final Exam" : "End Semester"}
                        value={isLab ? labExam : endSem}
                        setValue={isLab ? setLabExam : setEndSem}
                        max={isLab ? 50 : maxEndSem}
                        icon="E"
                        highlight
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 relative overflow-hidden backdrop-blur-xl">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                      <BrainCircuit className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface mb-1">Strategic Insight</h4>
                      <p className="text-sm text-on-surface-variant leading-relaxed">
                        {stats.scoredBase < (stats.maxBase * 0.5)
                          ? "Internal marks are weak."
                          : "Strong internal base!"}
                        {" "}
                        {useBestOf && !isLab && (parseFloat(t1) === 0 || parseFloat(t2) === 0) && "Consider skipping the other test."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6">
                <div className="bg-[var(--surface-container-highest)]/80 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-8 shadow-[0_32px_64px_rgba(0,0,0,0.5)] relative overflow-hidden z-20">
                  <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
                    <div>
                      <h2 className="text-2xl font-black tracking-tight mb-1 flex items-center gap-2">
                        <Target className="w-6 h-6 text-primary" />
                        Target Predictor
                      </h2>
                      <p className="text-sm font-medium text-on-surface-variant">Select desired grade to calculate required marks.</p>
                      {activePreset?.id !== 'jspm' && activePreset?.id !== 'sppu' && (
                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold uppercase tracking-widest rounded-lg">
                          <AlertTriangle className="w-3 h-3" />
                          Math standardized.
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 bg-black/40 p-2 rounded-2xl border border-white/5 backdrop-blur-md">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant px-2">Target Grade</span>
                      <select
                        value={targetGrade}
                        onChange={(e) => setTargetGrade(e.target.value)}
                        className="bg-primary/20 text-primary font-black text-xl w-16 text-center py-1 rounded-xl appearance-none outline-none border border-primary/30 shadow-inner focus:ring-2 focus:ring-primary/50 cursor-pointer"
                      >
                        {GRADES.map(g => (
                          <option key={g.grade} value={g.grade}>{g.grade}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="relative z-10 bg-black/20 rounded-2xl p-6 border border-white/5 text-center flex flex-col items-center justify-center min-h-[140px]">
                    {stats.alreadyThere ? (
                      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center text-emerald-400">
                        <CheckCircle2 className="w-12 h-12 mb-2" />
                        <span className="font-extrabold tracking-tight text-xl">Target Already Achieved!</span>
                      </motion.div>
                    ) : stats.achievable ? (
                      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        <span className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-2 block">You need to score</span>
                        <div className="flex items-baseline justify-center gap-2">
                          <span className="text-6xl md:text-7xl font-black text-white tracking-tighter tabular-nums drop-shadow-2xl">
                            {stats.neededInEndSem}
                          </span>
                          <span className="text-xl font-bold opacity-40">/ {stats.maxExamMarks}</span>
                        </div>
                        <span className="text-sm font-medium text-primary mt-2 block">in the {isLab ? 'Lab Exam' : 'End Semester'}</span>
                      </motion.div>
                    ) : (
                      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center text-red-400">
                        <AlertTriangle className="w-12 h-12 mb-2" />
                        <span className="font-extrabold tracking-tight text-xl">Target Mathematically Impossible</span>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="bg-[var(--surface-container-highest)]/50 border border-[var(--outline-variant)] rounded-[2rem] p-6 grid md:grid-cols-2 gap-8 shadow-2xl relative overflow-hidden">
                  <div className="flex flex-col justify-center">
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-2 text-white">
                       Score Distribution
                    </h3>
                    <div className="space-y-3">
                      <LegendItem color="#3b82f6" label="Marks Scored" value={stats.totalScored} />
                      <LegendItem color="#ef4444" label="Marks Lost" value={(stats.maxBase - stats.scoredBase) + (parseFloat(endSem) > 0 || parseFloat(labExam) > 0 ? (isLab ? 50 - parseFloat(labExam) : (type === 'theory100' ? 100 : 50) - parseFloat(endSem)) : 0)} />
                      <LegendItem color="#cbd5e1" label="Remaining Potential" value={(!parseFloat(endSem) && !parseFloat(labExam)) ? (isLab ? 50 : (type === 'theory100' ? 100 : 50)) : 0} />
                    </div>
                  </div>
                  <div className="h-[200px] w-full flex items-center justify-center relative">
                    {mounted && (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Scored', value: stats.totalScored },
                              { name: 'Lost', value: (stats.maxBase - stats.scoredBase) + (parseFloat(endSem) > 0 || parseFloat(labExam) > 0 ? (isLab ? 50 - parseFloat(labExam) : (type === 'theory100' ? 100 : 50) - parseFloat(endSem)) : 0) },
                              { name: 'Remaining', value: (!parseFloat(endSem) && !parseFloat(labExam)) ? (isLab ? 50 : (type === 'theory100' ? 100 : 50)) : 0 }
                            ].filter(d => d.value > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            <Cell fill="#3b82f6" />
                            <Cell fill="#ef4444" />
                            <Cell fill="#cbd5e1" opacity={0.3} />
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-black text-white">{stats.percentage.toFixed(0)}%</span>
                      <span className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">Of Max</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
                  <StatCard label="Internal Base" value={`${stats.scoredBase.toFixed(1)}/${stats.maxBase}`} icon="box" />
                  <StatCard label="Total Scored" value={`${stats.totalScored.toFixed(1)}/${stats.totalMax}`} icon="functions" highlight />
                  <StatCard label="Running %" value={`${stats.percentage.toFixed(1)}%`} icon="percent" />
                  <StatCard label="Current Grade" value={stats.currentGrade.grade} icon="star" colorClass={stats.currentGrade.color} />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-white/5 hover:bg-white/10 text-on-surface border border-white/10 px-6 py-3 rounded-full flex items-center gap-3 transition-all active:scale-95 text-sm font-bold tracking-wide disabled:opacity-50"
                  >
                    {isSaving ? (
                      <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : <Save className="w-4 h-4" />}
                    {isSaving ? "Saving..." : "Save Scenario"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface InputFieldProps {
  label: string;
  value: string;
  setValue: (val: string) => void;
  max: number;
  icon: string | React.ReactNode;
  disabled?: boolean;
  highlight?: boolean;
}

function InputField({ label, value, setValue, max, icon, disabled, highlight }: InputFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || val === '.') {
      setValue(val);
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      if (num > max) {
        setValue(max.toString());
      } else {
        setValue(val);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5 px-1">
        <label className={clsx("text-xs font-bold uppercase tracking-wider", highlight ? "text-primary" : "text-on-surface-variant")}>
          {label}
        </label>
        <span className="text-[10px] font-mono text-on-surface-variant/50">Max {max}</span>
      </div>
      <div className="relative group">
        <div className={clsx(
          "absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none blur-md opacity-0",
          highlight ? "bg-primary/20 group-focus-within:opacity-100" : "bg-white/5 group-focus-within:opacity-50"
        )} />
        <div className={clsx(
          "relative flex items-center bg-[var(--surface-container-highest)] border px-4 py-3.5 rounded-2xl transition-colors",
          disabled && "opacity-50 cursor-not-allowed",
          highlight ? "border-primary/50 focus-within:border-primary shadow-inner" : "border-[var(--outline-variant)] focus-within:border-white/30"
        )}>
          <span className="w-6 font-black text-on-surface-variant/40 mr-2">{icon}</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            value={value}
            onChange={handleChange}
            disabled={disabled}
            placeholder={disabled ? "N/A" : "0"}
            className="bg-transparent border-none outline-none w-full text-xl font-bold text-on-surface placeholder:text-on-surface-variant/30 font-mono"
          />
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  highlight?: boolean;
  colorClass?: string;
}

function StatCard({ label, value, icon, highlight, colorClass }: StatCardProps) {
  return (
    <div className={clsx(
      "p-5 rounded-3xl border transition-all hover:-translate-y-1 relative overflow-hidden",
      highlight ? "bg-primary/10 border-primary/20 shadow-[0_8px_32px_rgba(80,143,248,0.1)]" : "bg-[var(--surface-container-highest)]/50 border-[var(--outline-variant)]"
    )}>
      <span className={clsx("material-symbols-outlined mb-3 block text-2xl opacity-60", highlight && "text-primary")}>
        {icon}
      </span>
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{label}</p>
      <p className={clsx("text-2xl font-black tracking-tight font-mono", colorClass || "text-on-surface")}>{value}</p>
    </div>
  );
}

interface LegendItemProps {
  label: string;
  value: number;
  color: string;
}

function LegendItem({ label, value, color }: LegendItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-sm font-semibold text-on-surface-variant">{label}</span>
      </div>
      <span className="text-sm font-black text-on-surface font-mono">{Number(value).toFixed(1)}</span>
    </div>
  );
}
