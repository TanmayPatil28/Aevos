"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import dynamic from "next/dynamic";
const MultiSemesterChart = dynamic(() => import("@/components/MultiSemesterChart"), { ssr: false });
import { useUniversity } from "@/components/providers/UniversityProvider";
import AnimatedCounter from "@/components/AnimatedCounter";
import { useUSMStore } from "@/stores/usmStore";
import { resolveActiveAcademicContext } from "@/stores/selectors/academic";
import { Activity, Clock, Trash2, Plus, Zap, RefreshCw, Save, ShieldCheck } from "lucide-react";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

export default function MultiSemesterView() {
  const { scaleMode, activePreset } = useUniversity();
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [whatIfMode, setWhatIfMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isCompressed, setIsCompressed] = useState(false);

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
      setSemesters([
        { id: "1", name: "Semester 1", credits: "20", sgpa: "8.0", whatIfSgpa: "8.0" }
      ]);
    }
    setMounted(true);
  }, [context.identity.hasAuthoritativeData]);

  const result = useMemo(() => {
    let isValid = true;
    let limitMax = 10;

    if (scaleMode === "percent") limitMax = 100;
    else if (scaleMode === "4") limitMax = 4;

    semesters.forEach(s => {
      if (s.credits === "0") return;

      if (!s.credits || !s.sgpa) {
        isValid = false;
        return;
      }

      const c = parseFloat(s.credits);
      const gValue = parseFloat(s.sgpa);

      if (isNaN(c) || c < 0) isValid = false;
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
      if (s.credits === "0") return;

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

  const handleCompressTimeline = () => {
    if (semesters.length < 2) {
      toast.error("Not enough semesters to compress");
      return;
    }
    
    const MAX_CREDITS_PER_SEM = 28;
    const totalCredits = semesters.reduce((acc, s) => acc + (parseFloat(s.credits) || 0), 0);
    
    const newSemesters = semesters.map(s => ({ ...s }));
    let remainingCredits = totalCredits;
    
    for (let i = 0; i < newSemesters.length; i++) {
      if (remainingCredits <= 0) {
        newSemesters[i].credits = "0";
        newSemesters[i].sgpa = "";
        newSemesters[i].whatIfSgpa = "";
        continue;
      }
      
      const allocate = Math.min(MAX_CREDITS_PER_SEM, remainingCredits);
      newSemesters[i].credits = allocate.toString();
      remainingCredits -= allocate;
    }

    setSemesters(newSemesters);
    setIsCompressed(true);
    toast.success("Timeline Compressed! Time Bought Back.");
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
      const newHistory = semesters.map((s, idx) => ({
        semester: idx + 1,
        term: s.name,
        sgpa: parseFloat(s.sgpa) || 0,
        credits: parseFloat(s.credits) || 0,
        earnedCredits: parseFloat(s.credits) || 0, 
      }));

      store.setSemesterHistory(newHistory);
      
      if (!store.identity.hasAuthoritativeData) {
        store.setIdentity({ hasAuthoritativeData: true, sourceType: "manual_entry", isVerified: false });
      }
      
      store.evaluateInterventions();

      setSaveSuccess(true);
      toast.success("Timeline secured & synced with OS!");
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e) {
      toast.error("Failed to sync timeline with OS.");
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 columns) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          <div className="flex gap-3">
            <Button variant={whatIfMode ? "primary" : "secondary"} className="flex-1" onClick={toggleWhatIf}>
              <Zap className="w-4 h-4 mr-2" />
              {whatIfMode ? "Time Machine Active" : "Enable Time Machine"}
            </Button>
            <Button variant={isCompressed ? "primary" : "secondary"} className="flex-1" onClick={handleCompressTimeline}>
              <Activity className="w-4 h-4 mr-2" />
              {isCompressed ? "Compressed" : "Compress Timeline"}
            </Button>
            <Button variant="ghost" onClick={handleClearAll} className="px-4 text-foreground-muted hover:text-red-400 hover:bg-red-500/10">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card variant="default" className={`flex flex-col !p-6 border-white/5 transition-colors ${whatIfMode ? 'border-primary/20' : 'hover:bg-surface/50'}`}>
              <div className="flex items-center gap-2 mb-4">
                <Clock size={14} className={whatIfMode ? 'text-primary' : 'text-foreground-muted'} />
                <div className={`text-[11px] uppercase tracking-wider font-semibold ${whatIfMode ? 'text-primary' : 'text-foreground-muted'}`}>
                  {scaleMode === "percent" ? "Actual Agg. %" : "Actual CGPA"}
                </div>
              </div>
              <AnimatedCounter target={result?.finalActual || 0} decimals={2} className={`text-4xl font-black tracking-tighter ${whatIfMode ? 'text-primary' : 'text-white'}`} />
            </Card>

            <AnimatePresence mode="popLayout">
              {whatIfMode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, width: 0 }}
                  animate={{ opacity: 1, scale: 1, width: "auto" }}
                  exit={{ opacity: 0, scale: 0.9, width: 0 }}
                  className="w-full"
                >
                  <Card variant="default" className="flex flex-col w-full !p-6 border-indigo-500/20 bg-indigo-500/5">
                    <div className="flex items-center gap-2 mb-4">
                      <Zap size={14} className="text-indigo-400" />
                      <div className="text-[11px] text-indigo-400 uppercase tracking-wider font-semibold">
                        {scaleMode === "percent" ? "What-If Agg. %" : "What-If CGPA"}
                      </div>
                    </div>
                    <AnimatedCounter target={result?.finalWhatIf || 0} decimals={2} className="text-4xl font-black text-indigo-400 tracking-tighter" />
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {whatIfMode && result && Math.abs(result.diff) > 0.001 && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Card variant="default" className={`!p-4 border ${result.diff > 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${result.diff > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {result.diff > 0 ? 'Ascension Detected' : 'Decline Detected'}
                      </span>
                    </div>
                    <span className={`text-xl font-black tracking-tighter ${result.diff > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {result.diff > 0 ? '+' : ''}{result.diff}
                    </span>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <Button 
            variant="primary" 
            size="lg" 
            className="w-full mt-auto" 
            onClick={handleSave} 
            disabled={isSaving || !result}
          >
            {isSaving ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : saveSuccess ? <ShieldCheck className="w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            {isSaving ? "Securing Data..." : saveSuccess ? "OS Synced!" : "Sync Historical Record to OS"}
          </Button>

        </div>

        {/* Right Column (7 columns) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          <Card variant="default" className="!p-6 border-white/5 flex flex-col gap-6">
            
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-3">
                <Activity size={16} className="text-primary" />
                <div className="flex flex-col">
                  <h3 className="text-[14px] font-semibold text-foreground tracking-tight leading-tight">Trajectory Aggregator</h3>
                  <p className="text-[11px] text-foreground-muted uppercase tracking-wider font-semibold">Semantic Sequence</p>
                </div>
              </div>
              <div className="flex gap-2">
                 <Button variant="secondary" size="sm" onClick={addSemester}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
                {activePreset.specialFeatures?.defaultCreditsPerSem && (
                  <Button variant="secondary" size="sm" onClick={handleLoadJspmStructure}>
                    <RefreshCw className="w-3.5 h-3.5 mr-1" /> Load JSPM
                  </Button>
                )}
              </div>
            </div>

            {/* Input Table */}
            <div className="w-full overflow-x-auto rounded-xl border border-white/5 bg-surface-raised p-2">
              <table className="w-full text-left min-w-[500px]">
                <thead>
                  <tr className="text-foreground-muted text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                    <th className="pb-3 px-3 w-[40%]">Period</th>
                    <th className="pb-3 px-3 text-center w-[20%]">Credits</th>
                    <th className="pb-3 px-3 text-center">Actual</th>
                    {whatIfMode && <th className="pb-3 px-3 text-center text-indigo-400">What-If</th>}
                    <th className="pb-3 px-2 w-[10%]"></th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {semesters.map((s, index) => (
                      <motion.tr
                        key={s.id}
                        layout
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="group border-b border-white/[0.02] last:border-0"
                      >
                        <td className="py-2 px-1">
                          {s.credits === "0" ? (
                            <div className="flex items-center gap-2 px-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                              <span className="text-emerald-500 font-black text-[11px] tracking-[0.2em] uppercase">Void Semester: Freed Time</span>
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={s.name}
                              onChange={(e) => handleChange(s.id, "name", e.target.value)}
                              className="w-full bg-transparent border-none text-foreground font-semibold outline-none focus:text-primary transition-colors text-sm px-3"
                            />
                          )}
                        </td>
                        <td className="py-2 px-1 text-center">
                          <input
                            type="number"
                            value={s.credits}
                            onChange={(e) => handleChange(s.id, "credits", e.target.value)}
                            className="w-16 bg-transparent border-none text-center text-foreground outline-none text-sm mx-auto font-mono"
                            placeholder="0"
                          />
                        </td>
                        <td className="py-2 px-1 text-center">
                          <input
                            type="number"
                            step="0.01"
                            value={s.sgpa}
                            onChange={(e) => handleChange(s.id, "sgpa", e.target.value)}
                            className="w-16 bg-transparent border-none text-center text-foreground outline-none text-sm mx-auto font-mono font-bold"
                            placeholder={getPlaceholder()}
                          />
                        </td>
                        {whatIfMode && (
                          <td className="py-2 px-1 text-center">
                             <input
                                type="number"
                                step="0.01"
                                value={s.whatIfSgpa}
                                onChange={(e) => handleChange(s.id, "whatIfSgpa", e.target.value)}
                                className={`w-16 bg-transparent border-none text-center outline-none text-sm mx-auto font-mono font-bold ${s.whatIfSgpa && s.whatIfSgpa !== s.sgpa ? 'text-indigo-400' : 'text-foreground'}`}
                                placeholder={getPlaceholder()}
                              />
                          </td>
                        )}
                        <td className="py-2 px-1 text-right">
                          <Button variant="ghost" size="icon" onClick={() => removeSemester(s.id)} className="h-8 w-8 text-foreground-muted hover:text-red-400">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Chart Card */}
          {result && result.chartData.length > 0 && (
            <Card variant="default" className="!p-6 border-white/5 h-[300px] flex flex-col">
              <div className="flex-grow w-full select-none">
                <MultiSemesterChart chartData={result.chartData} whatIfMode={whatIfMode} />
              </div>
            </Card>
          )}

        </div>
      </div>
    </motion.div>
  );
}
