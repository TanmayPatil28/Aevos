"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Layers, Crosshair, Target, CheckCircle2, AlertTriangle, XCircle, Beaker, PinOff, FileText, Download, Filter } from "lucide-react";
import { useUSMStore } from "@/stores/usmStore";
import { intelligenceEngine, IntelligenceEngineInput, IntelligenceResult } from "@/lib/career/intelligenceEngine";

import PlacementHealthMeter from "@/components/placement/PlacementHealthMeter";
import SkillGapDetector from "@/components/placement/SkillGapDetector";
import PriorityActionItems from "@/components/placement/PriorityActionItems";
import TopperBenchmark from "@/components/placement/TopperBenchmark";
import CompanyLedgerRow from "@/components/placement/CompanyLedgerRow";
import { cn } from "@/lib/cn";

import { PageHero } from "@/components/ui/PageHero";

export default function CareerIntelligencePage() {
  const [mode, setMode] = useState<"matrix" | "radar">("matrix");
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Advanced features state
  const [isSandbox, setIsSandbox] = useState(false);
  const [pinnedCompany, setPinnedCompany] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"All" | "FAANG" | "Product" | "Startup" | "Service">("All");

  const { scrollY } = useScroll();
  const glowY = useTransform(scrollY, [0, 500], [0, 150]);
  const glowOpacity = useTransform(scrollY, [0, 300], [0.6, 0]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Store data
  const realCgpa = useUSMStore((state) => state.academic.currentCgpa);
  const realBacklogs = useUSMStore((state) => state.academic.activeBacklogsCount);
  const realCredits = useUSMStore((state) => state.academic.earnedCredits);
  const branch = useUSMStore((state) => state.career.branch) || "Computer Science";
  const realSkills = useUSMStore((state) => state.career.skills) || [];
  const targetRole = useUSMStore((state) => state.career.targetRole) || "Frontend Developer";

  // Sandbox data
  const [sandboxCgpa, setSandboxCgpa] = useState(realCgpa);
  const [sandboxBacklogs, setSandboxBacklogs] = useState(realBacklogs);
  
  // Sync sandbox with real data when toggling off
  useEffect(() => {
    if (!isSandbox) {
      setSandboxCgpa(realCgpa);
      setSandboxBacklogs(realBacklogs);
    }
  }, [isSandbox, realCgpa, realBacklogs]);

  const engineInput: IntelligenceEngineInput = useMemo(() => ({
    cgpa: isSandbox ? sandboxCgpa : realCgpa,
    backlogs: isSandbox ? sandboxBacklogs : realBacklogs,
    earnedCredits: realCredits,
    branch,
    skills: realSkills,
    targetRole
  }), [isSandbox, sandboxCgpa, realCgpa, sandboxBacklogs, realBacklogs, realCredits, branch, realSkills, targetRole]);

  let eligibilityResults = useMemo(() => intelligenceEngine.calculateEligibility(engineInput), [engineInput]);
  
  // Smart Filtering Logic
  if (activeFilter !== "All") {
    eligibilityResults = eligibilityResults.filter(c => c.tier === activeFilter);
  }

  // Target Pinning Logic
  if (pinnedCompany) {
    // Bring pinned company to front, hide others or show just the pinned one for intense focus
    eligibilityResults = eligibilityResults.filter(c => c.name === pinnedCompany);
  }

  const riskResult = useMemo(() => intelligenceEngine.calculatePlacementRisk(engineInput), [engineInput]);
  const skillGapResult = useMemo(() => intelligenceEngine.detectSkillGaps(realSkills, targetRole), [realSkills, targetRole]);

  const safeCompanies = eligibilityResults.filter(c => c.status === "ELIGIBLE");
  const borderlineCompanies = eligibilityResults.filter(c => c.status === "BORDERLINE");
  const riskCompanies = eligibilityResults.filter(c => c.status === "INELIGIBLE");

  return (
    <div className="w-full relative min-h-screen bg-[#000] overflow-x-hidden selection:bg-purple-500/30 selection:text-white pb-32 font-sans">
      
      {/* Background Ambient Glows */}
      <motion.div 
        style={{ y: glowY, opacity: glowOpacity }}
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] pointer-events-none z-0"
      >
        <div className={cn("absolute inset-0 blur-[120px] rounded-full mix-blend-screen transition-colors duration-700", isSandbox ? "bg-gradient-to-b from-[#3b82f6]/20 via-transparent to-transparent" : "bg-gradient-to-b from-[#7c3aed]/20 via-transparent to-transparent")} />
        <div className={cn("absolute top-20 left-1/2 -translate-x-1/2 w-[400px] h-[400px] blur-[100px] rounded-full mix-blend-screen transition-colors duration-700", isSandbox ? "bg-[#3b82f6]/15" : "bg-[#8b5cf6]/15")} />
      </motion.div>

      {/* Standardized Hero Section */}
      <section className="relative z-10 w-full flex flex-col items-center justify-center pt-32 pb-8 px-6">
        <div className="w-full max-w-7xl mx-auto flex flex-col">
          <PageHero 
            headline={<>Predict placements.<br/>Know your exact eligibility.</>}
            description="The career intelligence engine evaluates your current CGPA and skill profile against live company requirements, instantly calculating your eligibility for top-tier tech roles and identifying skill gaps."
          />

          {/* Integrated Prominent Sandbox Sliders */}
          <div className="w-full max-w-4xl mx-auto mt-4">
            <div className="flex items-center justify-center gap-4 mb-8">
               <button 
                onClick={() => setIsSandbox(!isSandbox)}
                className={cn("flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold border transition-all duration-500", isSandbox ? "bg-blue-500 text-white border-blue-500 shadow-none" : "bg-[#1D1D1F] text-white/60 border-white/10 hover:text-white hover:border-white/20")}
              >
                <Beaker size={18} className={isSandbox ? "text-blue-400" : ""} />
                {isSandbox ? "Exit Sandbox Mode" : "Enter Sandbox Mode"}
              </button>
            </div>

            <AnimatePresence>
              {isSandbox && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -20 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full overflow-hidden"
                >
                  <div className="p-8 md:p-10 rounded-[32px] border border-blue-500/30 bg-[#1D1D1F] flex flex-col md:flex-row gap-12 items-center relative overflow-hidden">
                    <div className="flex-1 w-full relative z-10">
                      <label className="flex justify-between text-sm font-bold text-blue-300 mb-4 uppercase tracking-[0.15em]">
                        <span>Simulate CGPA</span>
                        <span className="text-2xl text-white">{sandboxCgpa.toFixed(2)}</span>
                      </label>
                      <input 
                        type="range" min="5" max="10" step="0.1" 
                        value={sandboxCgpa} 
                        onChange={(e) => setSandboxCgpa(parseFloat(e.target.value))}
                        className="w-full h-3 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
                      />
                    </div>
                    <div className="w-px h-20 bg-white/10 hidden md:block" />
                    <div className="flex-1 w-full relative z-10">
                      <label className="flex justify-between text-sm font-bold text-blue-300 mb-4 uppercase tracking-[0.15em]">
                        <span>Simulate Backlogs</span>
                        <span className="text-2xl text-white">{sandboxBacklogs}</span>
                      </label>
                      <input 
                        type="range" min="0" max="10" step="1" 
                        value={sandboxBacklogs} 
                        onChange={(e) => setSandboxBacklogs(parseInt(e.target.value))}
                        className="w-full h-3 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Sticky Dynamic Island Navigation */}
      <div className={`sticky top-6 z-[100] flex justify-center mb-16 transition-all duration-500 ${isScrolled ? 'px-4' : 'px-6'}`}>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <motion.div 
            layout
            className="relative overflow-hidden flex items-center p-1.5 bg-[#1D1D1F] border border-white/5 rounded-full"
          >
            <div 
              className="absolute top-1.5 bottom-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 transition-all duration-500 ease-in-out z-0"
              style={{ left: mode === "matrix" ? "6px" : "50%", width: "calc(50% - 6px)" }}
            />
            <button
              onClick={() => setMode("matrix")}
              className={cn("relative z-10 flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition-colors duration-300 w-40 md:w-48", mode === "matrix" ? "text-white" : "text-white/50 hover:text-white")}
            >
              <Layers size={14} /> Matrix
            </button>
            <button
              onClick={() => setMode("radar")}
              className={cn("relative z-10 flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition-colors duration-300 w-40 md:w-48", mode === "radar" ? "text-white" : "text-white/50 hover:text-white")}
            >
              <Crosshair size={14} /> Skills
            </button>
          </motion.div>
        </div>
      </div>

      {/* Dashboard Content Area */}
      <div className="relative z-10 w-full px-4 md:px-8 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            {mode === "matrix" ? (
              <div className="flex flex-col gap-8">
                {/* Executive Summary Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <PlacementHealthMeter 
                      readinessScore={riskResult.readinessScore} 
                      averageEligibility={riskResult.averageEligibility} 
                    />
                  </div>
                  <div className="md:col-span-1">
                    <PriorityActionItems eligibility={eligibilityResults} skillGap={skillGapResult} />
                  </div>
                  <div className="md:col-span-1">
                    <TopperBenchmark userCgpa={isSandbox ? sandboxCgpa : realCgpa} userCredits={realCredits} userSkillsCount={realSkills.length} branch={branch} />
                  </div>
                </div>

                {/* Company Targets Ledger */}
                <div className="w-full mt-8">
                  {/* Smart Filters */}
                  {!pinnedCompany && (
                    <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-2 scrollbar-hide">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-bold mr-2">
                        <Filter size={14} /> Filters
                      </div>
                      {["All", "FAANG", "Product", "Startup", "Service"].map((f) => (
                        <button
                          key={f}
                          onClick={() => setActiveFilter(f as any)}
                          className={cn("px-4 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap", activeFilter === f ? "bg-purple-500/20 text-purple-300 border-purple-500/30" : "bg-black/50 text-white/40 border-white/10 hover:text-white")}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-2 mb-6 gap-4">
                    <div className="flex items-center gap-3">
                      <Target size={20} className={pinnedCompany ? "text-purple-400" : "text-[#8b5cf6]"} />
                      <h2 className="text-xl font-bold text-white tracking-tight">
                        {pinnedCompany ? `Pinned Target: ${pinnedCompany}` : "Company Target Ledger"}
                      </h2>
                    </div>
                    
                    {pinnedCompany && (
                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <button 
                          onClick={() => {
                            import("react-hot-toast").then((mod) => {
                              mod.toast.success(`Generating ATS-optimized Resume for ${pinnedCompany}...`);
                            });
                          }}
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-xs font-bold text-emerald-400 hover:bg-emerald-500/30 transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                        >
                          <FileText size={14} /> Generate Resume
                        </button>
                        <button 
                          onClick={() => setPinnedCompany(null)}
                          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white/60 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <PinOff size={14} /> Clear
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-8">
                    {/* Safe Zone */}
                    {safeCompanies.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest pl-2 flex items-center gap-2">
                          <CheckCircle2 size={14} /> Achievable Now ({safeCompanies.length})
                        </h3>
                        <div className="space-y-2">
                          {safeCompanies.map((company, i) => (
                            <CompanyLedgerRow key={i} result={company} isPinned={pinnedCompany === company.name} onPinToggle={(n) => setPinnedCompany(n === pinnedCompany ? null : n)} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Borderline Zone */}
                    {borderlineCompanies.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest pl-2 flex items-center gap-2">
                          <AlertTriangle size={14} /> Requires Work ({borderlineCompanies.length})
                        </h3>
                        <div className="space-y-2">
                          {borderlineCompanies.map((company, i) => (
                            <CompanyLedgerRow key={i} result={company} isPinned={pinnedCompany === company.name} onPinToggle={(n) => setPinnedCompany(n === pinnedCompany ? null : n)} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Risk Zone */}
                    {riskCompanies.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest pl-2 flex items-center gap-2">
                          <XCircle size={14} /> Out of Reach ({riskCompanies.length})
                        </h3>
                        <div className="space-y-2">
                          {riskCompanies.map((company, i) => (
                            <CompanyLedgerRow key={i} result={company} isPinned={pinnedCompany === company.name} onPinToggle={(n) => setPinnedCompany(n === pinnedCompany ? null : n)} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                <SkillGapDetector 
                  role={targetRole} 
                  skills={realSkills} 
                  result={skillGapResult} 
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
