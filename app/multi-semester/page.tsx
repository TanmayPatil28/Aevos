"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useUniversity } from "@/components/providers/UniversityProvider";
import AnimatedCounter from "@/components/AnimatedCounter";
import StaggerContainer, { StaggerItem } from "@/components/StaggerContainer";
import PremiumButton from "@/components/PremiumButton";
import CalculationBreakdown from "@/components/CalculationBreakdown";
import { useUSMStore } from "@/stores/usmStore";
import { resolveActiveAcademicContext } from "@/stores/selectors/academic";

interface SemesterData {
  id: string;
  name: string;
  credits: string;
  sgpa: string;
  whatIfSgpa: string;
}

interface ChartDataItem {
  name: string;
  Actual_CGPA: number;
  What_If_CGPA: number;
}

export default function MultiSemesterPage() {
  const { scaleMode, activePreset } = useUniversity();
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [whatIfMode, setWhatIfMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  const store = useUSMStore();
  const context = resolveActiveAcademicContext(store);

  // Load from global state on mount
  useEffect(() => {
    if (context.identity.hasAuthoritativeData && context.semesterHistory.length > 0) {
      const mapped = context.semesterHistory.map((sh: any, idx: number) => ({
        id: `sh-${idx}`,
        name: sh.term || `Semester ${sh.semester}`,
        credits: (sh.totalCredits || sh.credits || 0).toString(),
        sgpa: (sh.sgpa || 0).toString(),
        whatIfSgpa: (sh.sgpa || 0).toString()
      }));
      setSemesters(mapped);
    } else {
      // Fallback for non-hydrated users
      try {
        const saved = localStorage.getItem("gradeflow_multi_sem");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSemesters(parsed);
          } else {
            setSemesters([{ id: "1", name: "Semester 1", credits: "", sgpa: "", whatIfSgpa: "" }]);
          }
        } else {
          setSemesters([
            { id: "1", name: "Semester 1", credits: "20", sgpa: "8.0", whatIfSgpa: "8.0" }
          ]);
        }
      } catch (e) {
        setSemesters([{ id: "1", name: "Semester 1", credits: "", sgpa: "", whatIfSgpa: "" }]);
      }
    }
    setMounted(true);
  }, [context.identity.hasAuthoritativeData]);

  // Save to local storage on change
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem("gradeflow_multi_sem", JSON.stringify(semesters));
      } catch (e) {
        console.error("Local storage save error:", e);
      }
    }
  }, [semesters, mounted]);

  // Real-time calculation state with strict precision handling
  const result = useMemo(() => {
    let isValid = true;
    let limitMax = 10;

    if (scaleMode === "percent") limitMax = 100;
    else if (scaleMode === "4") limitMax = 4;

    semesters.forEach(s => {
      if (!s.credits || !s.sgpa) {
        isValid = false;
        return;
      }

      const c = parseFloat(s.credits);
      const gValue = parseFloat(s.sgpa);

      if (isNaN(c) || c <= 0) isValid = false;
      if (isNaN(gValue) || gValue < 0 || gValue > limitMax) isValid = false;

      if (whatIfMode && s.whatIfSgpa) {
        const wgValue = parseFloat(s.whatIfSgpa);
        if (isNaN(wgValue) || wgValue < 0 || wgValue > limitMax) isValid = false;
      } else if (whatIfMode && !s.whatIfSgpa) {
        isValid = false;
      }
    });

    if (!isValid || semesters.length === 0) return null;

    let cumulativeCredits = 0;
    let cumulativePoints = 0;
    let cumulativeWhatIfPoints = 0;

    const chartData: ChartDataItem[] = [];
    let finalActual = 0;
    let finalWhatIf = 0;

    semesters.forEach((s) => {
      const c = parseFloat(s.credits);
      const gValue = parseFloat(s.sgpa) || 0;
      const wgValue = parseFloat(s.whatIfSgpa) || gValue;

      cumulativeCredits += c;
      cumulativePoints += (c * gValue);
      cumulativeWhatIfPoints += (c * wgValue);

      const currentCgpaValue = cumulativePoints / cumulativeCredits;
      const currentWhatIfCgpaValue = cumulativeWhatIfPoints / cumulativeCredits;

      finalActual = currentCgpaValue;
      finalWhatIf = currentWhatIfCgpaValue;

      chartData.push({
        name: s.name,
        Actual_CGPA: Number(currentCgpaValue.toFixed(2)),
        What_If_CGPA: Number(currentWhatIfCgpaValue.toFixed(2))
      });
    });

    return {
      finalActual: Number(finalActual.toFixed(2)),
      finalWhatIf: Number(finalWhatIf.toFixed(2)),
      diff: Number((finalWhatIf - finalActual).toFixed(2)),
      totalCredits: cumulativeCredits,
      chartData
    };
  }, [semesters, whatIfMode, scaleMode]);


  const addSemester = () => {
    if (semesters.length >= 12) {
      toast.error("Maximum 12 semesters allowed");
      return;
    }
    const newId = Math.random().toString();
    setSemesters([...semesters, { id: newId, name: `Semester ${semesters.length + 1}`, credits: "20", sgpa: "", whatIfSgpa: "" }]);
  };

  const removeSemester = (id: string) => {
    if (semesters.length <= 1) {
      toast.error("You must maintain at least one semester record");
      return;
    }
    setSemesters(semesters.filter((s) => s.id !== id));
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all historical data? This cannot be undone.")) {
      setSemesters([{ id: Math.random().toString(), name: "Semester 1", credits: "", sgpa: "", whatIfSgpa: "" }]);
      setWhatIfMode(false);
      toast.success("History cleared.");
    }
  };

  const handleLoadJspmStructure = () => {
    if (!activePreset.specialFeatures?.defaultCreditsPerSem) return;
    if (confirm("This will overwrite your current timeline with the official JSPM 8-Semester B.Tech structure. Proceed?")) {
      const jspmCredits = activePreset.specialFeatures.defaultCreditsPerSem;
      const struct = jspmCredits.map((cr, idx) => ({
        id: Math.random().toString(),
        name: `Semester ${idx + 1}`,
        credits: cr.toString(),
        sgpa: "",
        whatIfSgpa: ""
      }));
      setSemesters(struct);
      toast.success("JSPM Structure Generated!");
    }
  };

  const handleChange = (id: string, field: keyof SemesterData, value: string) => {
    setSemesters(semesters.map((s) => {
      if (s.id === id) {
        const newObj = { ...s, [field]: value };
        if (field === 'sgpa' && !whatIfMode) {
          newObj.whatIfSgpa = value;
        }
        return newObj;
      }
      return s;
    }));
  };

  const toggleWhatIf = () => {
    if (!whatIfMode) {
      setSemesters(semesters.map(s => ({
        ...s,
        whatIfSgpa: s.whatIfSgpa || s.sgpa
      })));
    }
    setWhatIfMode(!whatIfMode);
  };

  const handleSave = async () => {
    if (!result || isSaving) return;
    if (!result) {
      toast.error("Finish filling out your semester history accurately to secure it.");
      return;
    }
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          semester: `Multi-Sem Timeline (${scaleMode} Scale)`,
          subjects: semesters,
          presetId: store.presetId || "sppu",
          type: "multi_semester",
          total_credits: result.totalCredits,
        }),
      });

      if (res.status === 401) {
        toast.error("Please log in to secure this timeline to your Dashboard.");
        setIsSaving(false);
        return;
      }

      if (!res.ok) throw new Error("Failed to save");
      setSaveSuccess(true);
      toast.success("Timeline secured in database!");
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch {
      // Offline fallback
      try {
        let existing = [];
        try {
          const saved = localStorage.getItem("gradeflow_multi_sem_offline");
          const parsed = saved ? JSON.parse(saved) : [];
          if (Array.isArray(parsed)) {
            existing = parsed;
          }
        } catch {}
        existing.unshift({
          semester: `Multi-Sem Timeline (${scaleMode} Scale)`,
          subjects: semesters,
          sgpa: result.finalActual,
          cgpa: result.finalActual,
          total_credits: result.totalCredits,
          saved_at: new Date().toISOString(),
        });
        try {
          localStorage.setItem("gradeflow_multi_sem_offline", JSON.stringify(existing.slice(0, 20)));
          setSaveSuccess(true);
          toast.success("Locally cached and secured!");
          setTimeout(() => setSaveSuccess(false), 2000);
        } catch {
          toast.error("Failed to locally cache timeline.");
        }
      } catch {
        toast.error("Failed to locally cache timeline.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) return null;

  const getPlaceholder = () => {
    if (scaleMode === "percent") return "0-100";
    if (scaleMode === "4") return "0.0-4.0";
    return "0.0-10.0";
  };

  return (
    <>

      <main className="pt-32 pb-24 px-6 max-w-[1400px] mx-auto space-y-12 min-h-screen">
        <StaggerContainer className="text-center space-y-4 max-w-4xl mx-auto">
          <StaggerItem>
            <span className="inline-flex items-center px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-indigo-500 text-xs font-bold tracking-widest uppercase mb-4 shadow-sm">
              High-Fidelity Timeline Engine
            </span>
          </StaggerItem>
          <StaggerItem>
            <h1 className="text-5xl md:text-6xl font-headline font-extrabold tracking-tight mb-6 text-on-surface drop-shadow-sm leading-tight">
              Multi-Semester Aggregator
            </h1>
          </StaggerItem>
          <StaggerItem>
            <p className="text-on-surface-variant max-w-2xl mx-auto text-lg leading-relaxed">
              Consolidate your academic history live with perfect precision. Your data is automatically backed up locally.
            </p>
          </StaggerItem>
        </StaggerContainer>

        <div className="grid xl:grid-cols-12 gap-8 items-start">

          {/* Left Side: Data Entry */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="xl:col-span-7 glass-card rounded-[2.5rem] p-6 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-outline-variant/20 flex flex-col h-full overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-6 z-10 relative">
              <div className="space-y-2 w-full flex-grow">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-2xl font-headline font-bold text-on-surface flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">analytics</span>
                    Master List
                  </h2>
                  <div className="flex items-center gap-2">
                    {activePreset.specialFeatures?.isVerified && (
                      <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-[10px] font-bold uppercase tracking-widest">
                        <span className="material-symbols-outlined text-[14px]">verified</span>
                        Verified Ruleset
                      </span>
                    )}
                    <button onClick={handleClearAll} className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-error transition-colors flex items-center gap-1 bg-surface-container-low px-3 py-1.5 rounded-full border border-outline-variant/10 hover:border-error/20 hover:bg-error/10">
                      <span className="material-symbols-outlined text-[14px]">delete_sweep</span> Clear
                    </button>
                  </div>
                </div>

                <p className="text-xs text-on-surface-variant/70 font-medium tracking-wide">
                  Grading scale theoretically bound to <span className="text-primary font-bold">{activePreset.name}</span> setting.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-surface-container-high p-1.5 rounded-2xl border border-outline-variant/30 w-full lg:w-fit mt-2 lg:mt-0 lg:ml-auto">
                <button
                  onClick={toggleWhatIf}
                  className={`relative flex items-center justify-center w-full gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-500 z-10 overflow-hidden ${whatIfMode ? 'text-white shadow-xl shadow-indigo-500/30 ring-1 ring-indigo-400/50' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'
                    }`}
                >
                  {whatIfMode && <motion.div layoutId="whatIfBg" className="absolute inset-0 bg-gradient-to-r from-primary via-indigo-500 to-purple-600 -z-10 bg-[length:200%_auto] animate-gradient" />}
                  <span className="material-symbols-outlined text-[18px]">temp_preferences_custom</span>
                  Time Machine
                </button>
              </div>
            </div>

            <div className="overflow-x-auto pb-6 custom-scrollbar flex-grow">
              <table className="w-full text-left min-w-[550px] border-collapse relative z-10 border-spacing-y-2 border-separate">
                <thead>
                  <tr className="text-on-surface-variant/50 text-[10px] font-black uppercase tracking-[0.2em]">
                    <th className="pb-4 px-2 w-[35%] tracking-widest pl-4">Chronology</th>
                    <th className="pb-4 px-2 w-[15%] text-center tracking-widest">Weight (Cr)</th>
                    <th className="pb-4 px-2 text-center tracking-widest" style={{ width: whatIfMode ? '22%' : '45%' }}>
                      {scaleMode === 'percent' ? "Actual %" : "Actual SGPA"}
                    </th>
                    <AnimatePresence>
                      {whatIfMode && (
                        <motion.th initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "23%" }} exit={{ opacity: 0, width: 0 }} className="pb-4 px-2 text-center text-indigo-400 whitespace-nowrap overflow-hidden tracking-widest bg-indigo-500/5 rounded-t-2xl">
                          {scaleMode === 'percent' ? "What-If %" : "What-If SGPA"}
                        </motion.th>
                      )}
                    </AnimatePresence>
                    <th className="pb-4 px-2 w-[5%] text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {semesters.map((s, index) => (
                      <motion.tr
                        key={s.id}
                        layout
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                        transition={{ duration: 0.3 }}
                        className="group"
                      >
                        <td className="py-2 px-1">
                          <div className="bg-surface-container-low/50 group-hover:bg-surface-container border border-transparent rounded-2xl transition-all duration-300 relative focus-within:border-primary/40 focus-within:bg-surface-container">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/30 text-[10px] font-bold">#{index + 1}</div>
                            <input
                              type="text"
                              value={s.name}
                              onChange={(e) => handleChange(s.id, "name", e.target.value)}
                              className="w-full bg-transparent border-none text-on-surface font-black outline-none focus:text-primary transition-colors text-sm py-4 pl-10 pr-4"
                            />
                          </div>
                        </td>
                        <td className="py-2 px-1 text-center">
                          <div className="bg-surface-container-low/50 group-hover:bg-surface-container border border-transparent rounded-2xl transition-all duration-300 focus-within:border-primary/40 focus-within:bg-surface-container focus-within:shadow-[0_0_15px_rgba(80,143,248,0.1)]">
                            <input
                              type="number"
                              value={s.credits}
                              onChange={(e) => handleChange(s.id, "credits", e.target.value)}
                              className="w-[calc(100%-8px)] bg-transparent border-none text-center text-on-surface outline-none py-4 text-sm mx-auto placeholder-on-surface-variant/30 font-bold font-mono"
                              placeholder="0"
                            />
                          </div>
                        </td>
                        <td className="py-2 px-1 text-center">
                          <div className={`bg-surface-container-low/50 group-hover:bg-surface-container border border-transparent rounded-2xl transition-all duration-300 focus-within:border-primary/40 focus-within:bg-surface-container focus-within:shadow-[0_0_15px_rgba(80,143,248,0.1)] ${parseFloat(s.sgpa) > (scaleMode === "percent" ? 100 : scaleMode === "4" ? 4 : 10) ? 'border-error/50 bg-error/5' : ''}`}>
                            <input
                              type="number"
                              step="0.01"
                              value={s.sgpa}
                              onChange={(e) => handleChange(s.id, "sgpa", e.target.value)}
                              className="w-[calc(100%-8px)] bg-transparent border-none text-center text-on-surface font-black outline-none py-4 text-sm mx-auto placeholder-on-surface-variant/30 font-mono tracking-wider"
                              placeholder={getPlaceholder()}
                            />
                          </div>
                        </td>
                        <AnimatePresence>
                          {whatIfMode && (
                            <motion.td initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} className="py-2 px-1 text-center overflow-hidden bg-indigo-500/5 group-last:rounded-b-2xl">
                              <div className={`transition-all duration-300 rounded-2xl border ${s.whatIfSgpa && s.whatIfSgpa !== s.sgpa ? 'bg-indigo-500/15 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.25)]' : 'bg-surface-container-low border-transparent focus-within:border-indigo-500/40 focus-within:shadow-[0_0_15px_rgba(99,102,241,0.15)] bg-opacity-50'}`}>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={s.whatIfSgpa}
                                  onChange={(e) => handleChange(s.id, "whatIfSgpa", e.target.value)}
                                  className={`w-[calc(100%-8px)] bg-transparent border-none text-center font-black outline-none py-4 text-sm mx-auto placeholder-on-surface-variant/30 font-mono tracking-wider ${s.whatIfSgpa && s.whatIfSgpa !== s.sgpa ? 'text-indigo-400' : 'text-on-surface'}`}
                                  placeholder={getPlaceholder()}
                                />
                              </div>
                            </motion.td>
                          )}
                        </AnimatePresence>
                        <td className="py-2 px-1 text-center w-10">
                          <button onClick={() => removeSemester(s.id)} className="text-on-surface-variant/30 hover:text-error p-2.5 rounded-xl bg-surface-container-lowest/50 border border-transparent hover:border-error/20 hover:bg-error/10 transition-all flex items-center justify-center hover:scale-105 active:scale-95 mx-auto">
                            <span className="material-symbols-outlined text-[18px]">close</span>
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            <div className="mt-auto flex flex-col sm:flex-row justify-between items-center gap-6 pt-6 z-10 relative bg-gradient-to-t from-surface to-transparent -mx-6 px-6 -mb-6 pb-6">
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={addSemester}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-on-surface font-bold hover:border-primary/40 transition-all active:scale-95 text-sm w-full sm:w-auto justify-center group shadow-sm hover:shadow-md"
                >
                  <span className="material-symbols-outlined text-[20px] text-primary group-hover:scale-125 transition-transform duration-300">add_circle</span>
                  Add Chronology
                </button>

                {activePreset.specialFeatures?.defaultCreditsPerSem && (
                  <button
                    onClick={handleLoadJspmStructure}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 font-bold hover:border-indigo-500/50 transition-all active:scale-95 text-sm w-full sm:w-auto justify-center group shadow-sm hover:shadow-md"
                  >
                    <span className="material-symbols-outlined text-[20px] group-hover:rotate-180 transition-transform duration-500">auto_mode</span>
                    Auto-Load {activePreset.shortName} Structure
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/20 rounded-full">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                <p className="text-[10px] font-bold text-success tracking-widest uppercase">
                  {!result ? "Awaiting Valid Data..." : "Auto-Saving Live"}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Results & Chart */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="xl:col-span-5 flex flex-col gap-8 h-full">

            {result ? (
              <>
                <div className={`glass-card rounded-[2.5rem] p-8 md:p-10 border-t-[6px] shadow-[0_12px_40px_rgb(0,0,0,0.06)] relative overflow-hidden group transition-all duration-700 flex flex-col h-auto max-h-[300px] ${whatIfMode ? 'border-indigo-500 shadow-[0_20px_60px_rgba(99,102,241,0.2)] bg-surface-container-highest/60' : 'border-primary'}`}>

                  {whatIfMode ? (
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none transition-colors duration-1000" />
                  ) : (
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none transition-colors duration-1000" />
                  )}

                  <div className="grid grid-cols-2 gap-4 flex-grow z-10 relative">
                    <div className="space-y-3">
                      <span className="text-on-surface-variant font-black text-[10px] uppercase tracking-[0.2em] relative inline-flex items-center gap-1.5 opacity-80">
                        {scaleMode === "percent" ? "Actual Agg. %" : "Actual CGPA"}
                      </span>
                      <div className="text-6xl md:text-7xl font-black font-headline text-on-surface tracking-tighter tabular-nums drop-shadow-sm transition-transform group-hover:scale-[1.02] origin-left">
                        <AnimatedCounter target={result.finalActual} decimals={2} />
                      </div>
                    </div>

                    <AnimatePresence>
                      {whatIfMode && (
                        <motion.div initial={{ opacity: 0, scale: 0.8, x: 30 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.8, x: 30 }} transition={{ type: "spring", damping: 20, stiffness: 300 }} className="space-y-3 border-l border-outline-variant/30 pl-6">
                          <span className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em] relative inline-flex items-center gap-1.5">
                            {scaleMode === "percent" ? "What-If Agg. %" : "What-If CGPA"}
                          </span>
                          <div className="text-6xl md:text-7xl font-black font-headline bg-gradient-to-br from-primary via-indigo-500 to-purple-500 bg-clip-text text-transparent tracking-tighter drop-shadow-sm tabular-nums origin-left hover:scale-105 transition-transform duration-300 cursor-default">
                            <AnimatedCounter target={result.finalWhatIf} decimals={2} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <AnimatePresence>
                    {whatIfMode && Math.abs(result.diff) > 0.001 && (
                      <motion.div initial={{ opacity: 0, y: 20, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -20, height: 0 }} className="mt-8 z-10 relative">
                        <div className={`p-5 rounded-3xl flex items-center justify-between shadow-md border backdrop-blur-md ${result.diff > 0 ? 'bg-success/15 border-success/30' : 'bg-error/15 border-error/30'}`}>
                          <div className="flex items-center gap-4">
                            <span className={`material-symbols-outlined text-[32px] ${result.diff > 0 ? 'text-success' : 'text-error'} drop-shadow-md`}>
                              {result.diff > 0 ? 'rocket_launch' : 'crisis_alert'}
                            </span>
                            <div>
                              <p className={`font-black text-sm uppercase tracking-wider ${result.diff > 0 ? 'text-success' : 'text-error'}`}>
                                {result.diff > 0 ? 'Ascension Detected' : 'Decline Detected'}
                              </p>
                              <p className="text-on-surface-variant text-xs font-semibold mt-1 opacity-80">
                                Trajectory shifted by exactly <strong className="text-on-surface">{Math.abs(result.diff).toFixed(2)}</strong> absolute points.
                              </p>
                            </div>
                          </div>
                          <div className={`text-4xl font-black font-mono tracking-tighter ${result.diff > 0 ? 'text-success' : 'text-error'} drop-shadow-sm`}>
                            {result.diff > 0 ? '+' : ''}{result.diff}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="glass-card rounded-[2.5rem] p-6 lg:p-8 flex-grow shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-outline-variant/10 flex flex-col relative overflow-hidden min-h-[400px]">
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="space-y-1">
                      <h3 className="font-headline font-black text-2xl text-on-surface mb-1 drop-shadow-sm">Chronological Trajectory</h3>
                      <p className="text-on-surface-variant text-xs tracking-widest uppercase font-bold opacity-70">
                        Aggregated progression over {semesters.length} periods.
                      </p>
                    </div>
                  </div>

                  <div className="flex-grow w-full h-[300px] relative z-10 -ml-2 select-none">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={result.chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--on-surface-variant)" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="var(--on-surface-variant)" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorWhatIf" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{ fill: "var(--on-surface-variant)", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} dy={15}
                          tickFormatter={(val) => val.replace('Semester ', 'Sem ')}
                        />
                        <YAxis domain={['auto', 'auto']} stroke="rgba(255,255,255,0.2)" tick={{ fill: "var(--on-surface-variant)", fontSize: 10, fontWeight: 700, fontFamily: "monospace" }} axisLine={false} tickLine={false} dx={-15} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#111111", borderRadius: "20px", border: "1px solid var(--outline-variant)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)", backdropFilter: "blur(10px)" }}
                          labelStyle={{ color: "var(--on-surface-variant)", fontWeight: "black", marginBottom: "12px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em" }}
                          itemStyle={{ fontWeight: "900", fontSize: "16px", fontFamily: "monospace" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="Actual_CGPA"
                          stroke="var(--on-surface-variant)"
                          fillOpacity={1}
                          fill="url(#colorActual)"
                          strokeWidth={whatIfMode ? 2 : 4}
                          strokeDasharray={whatIfMode ? "6 6" : "0"}
                          activeDot={{ r: 6, fill: "var(--background)", stroke: "var(--on-surface-variant)", strokeWidth: 3 }}
                          animationDuration={500}
                        />
                        {whatIfMode && (
                          <Area
                            type="monotone"
                            dataKey="What_If_CGPA"
                            stroke="#6366f1"
                            fillOpacity={1}
                            fill="url(#colorWhatIf)"
                            strokeWidth={5}
                            activeDot={{ r: 8, fill: "#6366f1", stroke: "var(--background)", strokeWidth: 3 }}
                            style={{ filter: "drop-shadow(0px 8px 16px rgba(99,102,241,0.6))" }}
                            animationDuration={800}
                          />
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <CalculationBreakdown
                  preset={activePreset}
                  semesters={semesters.map(s => ({
                    semesterName: s.name || "Unnamed Semester",
                    credits: parseFloat(s.credits) || 0,
                    sgpa: parseFloat(whatIfMode ? (s.whatIfSgpa || s.sgpa) : s.sgpa) || 0
                  }))}
                  type="cgpa"
                />

                {/* Save Section */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex w-full">
                  <div onClick={handleSave} className={`w-full ${isSaving ? "opacity-50 pointer-events-none" : ""}`}>
                    <PremiumButton
                      variant={saveSuccess ? "outline" : "primary"}
                      className={`w-full justify-between !py-4 transition-all duration-500 ${saveSuccess ? 'border-success text-success' : 'shadow-[0_10px_30px_rgba(80,143,248,0.2)] hover:shadow-[0_15px_40px_rgba(80,143,248,0.3)]'}`}
                      icon={isSaving ? (
                        <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : saveSuccess ? "verified_user" : "cloud_upload"}
                    >
                      {isSaving ? "Securing Data..." : saveSuccess ? "Timeline Secured!" : "Secure Historical Record"}
                    </PremiumButton>
                  </div>
                </motion.div>
              </>
            ) : (
              <div className="glass-card rounded-[2.5rem] p-12 h-full flex flex-col items-center justify-center border border-outline-variant/5 border-dashed bg-surface-container-lowest/50 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                <div className="w-28 h-28 rounded-full bg-surface-container mb-8 flex items-center justify-center shadow-inner border border-outline-variant/10 relative">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 animate-pulse">query_stats</span>
                </div>
                <h3 className="font-headline font-black text-3xl text-on-surface mb-3 tracking-tight">Awaiting Master Data</h3>
                <p className="text-on-surface-variant max-w-sm mx-auto font-medium leading-relaxed">System demands complete semantic data. Fill out your chronological progression above with valid points to execute sequence.</p>
              </div>
            )}

          </motion.div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
         @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
         }
         .animate-gradient {
            animation: gradient 3s ease infinite;
         }
         
         .custom-scrollbar::-webkit-scrollbar {
           width: 6px;
           height: 6px;
         }
         .custom-scrollbar::-webkit-scrollbar-track {
           background: transparent;
         }
         .custom-scrollbar::-webkit-scrollbar-thumb {
           background: var(--outline-variant);
           border-radius: 10px;
           opacity: 0.5;
         }
         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
           background: var(--primary);
         }
      `}} />
    </>
  );
}
