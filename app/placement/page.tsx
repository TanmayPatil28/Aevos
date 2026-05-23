"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, 
  Settings, 
  Plus, 
  RefreshCw, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Search
} from "lucide-react";
import toast from "react-hot-toast";

import PageContainer from "@/components/layout/PageContainer";
import GlassCard from "@/components/GlassCard";
import CompanyEligibilityList from "@/components/placement/CompanyEligibilityList";
import SkillGapAdvisor from "@/components/placement/SkillGapAdvisor";
import { useUSMStore } from "@/stores/usmStore";
import { eligibilityEngine, CompanyCriteria } from "@/lib/career/eligibilityEngine";
import { selectDerivedGPA } from "@/stores/selectors";

export default function PlacementPage() {
  const storeAcademic = useUSMStore((state) => state.academic);
  const storeState = useUSMStore((state) => state);
  
  // Calculate current CGPA dynamically from selectors (handling active simulations if any)
  const { cgpa: currentCgpa } = selectDerivedGPA(storeState);
  const currentBacklogs = storeAcademic.activeBacklogsCount;
  const currentCredits = storeAcademic.earnedCredits;

  // Simulator values
  const [simulatedCgpa, setSimulatedCgpa] = useState<number>(8.0);
  const [simulatedBacklogs, setSimulatedBacklogs] = useState<number>(0);
  const [simulatedCredits, setSimulatedCredits] = useState<number>(80);

  // Sync simulator with store on mount/changes
  useEffect(() => {
    setSimulatedCgpa(currentCgpa);
    setSimulatedBacklogs(currentBacklogs);
    setSimulatedCredits(currentCredits);
  }, [currentCgpa, currentBacklogs, currentCredits]);

  // Custom companies list
  const [customCompanies, setCustomCompanies] = useState<CompanyCriteria[]>([]);

  // Load custom companies from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("gradeflow_custom_recruiters");
    if (saved) {
      try {
        setCustomCompanies(JSON.parse(saved));
      } catch {
        setCustomCompanies([]);
      }
    }
  }, []);

  const saveCustomCompanies = (updated: CompanyCriteria[]) => {
    setCustomCompanies(updated);
    localStorage.setItem("gradeflow_custom_recruiters", JSON.stringify(updated));
  };

  // Add custom recruiter state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCgpaCutoff, setNewCgpaCutoff] = useState(6.5);
  const [newMaxBacklogs, setNewMaxBacklogs] = useState(0);
  const [newRequiredCredits, setNewRequiredCredits] = useState(60);

  // Trace expansion state
  const [showTrace, setShowTrace] = useState(false);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Handle Add Custom Recruiter
  const handleAddRecruiter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) {
      toast.error("Recruiter name is required");
      return;
    }

    if (customCompanies.some(c => c.name.toLowerCase() === newCompanyName.toLowerCase().trim())) {
      toast.error("A recruiter with this name already exists");
      return;
    }

    const newCompany: CompanyCriteria = {
      name: newCompanyName.trim(),
      cgpaCutoff: newCgpaCutoff,
      maxBacklogs: newMaxBacklogs,
      requiredCredits: newRequiredCredits,
      details: "User-defined custom career milestone threshold.",
    };

    const updated = [...customCompanies, newCompany];
    saveCustomCompanies(updated);
    toast.success(`${newCompanyName} benchmark added!`);
    
    // Reset Form
    setNewCompanyName("");
    setNewCgpaCutoff(6.5);
    setNewMaxBacklogs(0);
    setNewRequiredCredits(60);
    setShowAddForm(false);
  };

  const handleRemoveCustomCompany = (name: string) => {
    const updated = customCompanies.filter(c => c.name !== name);
    saveCustomCompanies(updated);
    toast.success(`Removed benchmark: ${name}`);
  };

  const handleResetToRealProfile = () => {
    setSimulatedCgpa(currentCgpa);
    setSimulatedBacklogs(currentBacklogs);
    setSimulatedCredits(currentCredits);
    toast.success("Synchronized simulator with your real academic standing!");
  };

  // Build evaluated matrix list
  // Standard Indian Recruiting Compliance Matrices
  const DEFAULT_RECRUITERS: CompanyCriteria[] = [
    { name: "TCS (Ninja/Digital)", cgpaCutoff: 6.0, maxBacklogs: 0, requiredCredits: 60, details: "Requires absolute clear standing with zero active backlogs." },
    { name: "Infosys", cgpaCutoff: 6.5, maxBacklogs: 0, requiredCredits: 60, details: "Requires a 65% aggregate equivalent or 6.5 CGPA." },
    { name: "Cognizant", cgpaCutoff: 6.0, maxBacklogs: 1, requiredCredits: 60, details: "Allows up to 1 active backlog during recruitment." },
    { name: "Accenture", cgpaCutoff: 6.5, maxBacklogs: 0, requiredCredits: 60, details: "Strict zero-backlog check with 6.5 CGPA minimum." },
    { name: "Wipro", cgpaCutoff: 6.0, maxBacklogs: 1, requiredCredits: 60, details: "Allows 1 active backlog; 6.0 CGPA baseline." },
    { name: "FAANG / Top Tier", cgpaCutoff: 8.0, maxBacklogs: 0, requiredCredits: 80, details: "Elite hiring benchmark requiring strong academic standing." },
  ];

  const fullCriteriaList = [...DEFAULT_RECRUITERS, ...customCompanies];
  
  // Filter by search query if set
  const filteredCriteria = fullCriteriaList.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const evaluationResult = eligibilityEngine.evaluate({
    cgpa: simulatedCgpa,
    backlogs: simulatedBacklogs,
    earnedCredits: simulatedCredits,
    customCriteria: filteredCriteria,
  });

  // Calculate some aggregate values for header KPI cards
  const totalCount = evaluationResult.companies.length;
  const eligibleCount = evaluationResult.companies.filter(c => c.status === "ELIGIBLE").length;
  const borderlineCount = evaluationResult.companies.filter(c => c.status === "BORDERLINE").length;
  const ineligibleCount = evaluationResult.companies.filter(c => c.status === "INELIGIBLE").length;

  return (
    <PageContainer>
      {/* Background radial highlight */}

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
              <Briefcase className="w-6 h-6" />
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Placement & Internship Career Hub
            </h1>
          </div>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Evaluate your real-time eligibility status against top tech firms, simulate academic improvements to unlock new milestones, and map key skill milestones.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm py-2.5 px-4 rounded-xl border border-indigo-400/20 hover:border-indigo-400/40 shadow-lg shadow-indigo-600/10 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Custom Benchmark
          </button>
        </div>
      </div>

      {/* Stats Summary Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="border border-white/5 flex flex-col justify-between py-6 px-6">
          <span className="text-xs text-slate-400 font-medium">Aggregate Eligibility</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold tracking-tight ${
              evaluationResult.overallStatus === "ELIGIBLE" ? "text-emerald-400" :
              evaluationResult.overallStatus === "BORDERLINE" ? "text-amber-400" : "text-rose-400"
            }`}>
              {evaluationResult.overallStatus}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-2 block font-mono">OVERALL COMPLIANCE</span>
        </GlassCard>

        <GlassCard className="border border-white/5 flex flex-col justify-between py-6 px-6">
          <span className="text-xs text-slate-400 font-medium">Unlocked Companies</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">{eligibleCount}</span>
            <span className="text-xs text-slate-500">/ {totalCount}</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-2 block font-mono">DIRECT ELIGIBILITY</span>
        </GlassCard>

        <GlassCard className="border border-white/5 flex flex-col justify-between py-6 px-6">
          <span className="text-xs text-slate-400 font-medium">Borderline Opportunities</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-400 font-mono">{borderlineCount}</span>
            <span className="text-xs text-slate-500">/ {totalCount}</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-2 block font-mono">WITHIN 0.25 GPA OR 6 CREDITS</span>
        </GlassCard>

        <GlassCard className="border border-white/5 flex flex-col justify-between py-6 px-6">
          <span className="text-xs text-slate-400 font-medium">Ineligible Gates</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-rose-400 font-mono">{ineligibleCount}</span>
            <span className="text-xs text-slate-500">/ {totalCount}</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-2 block font-mono">REQUIRES REMEDIATION</span>
        </GlassCard>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Interactive Simulator Panel */}
        <div className="xl:col-span-1 space-y-6">
          <GlassCard className="border border-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.02)] space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                Eligibility Simulator
              </h2>
              <button
                onClick={handleResetToRealProfile}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Reset Sliders to official profile values"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Slide target academic values to simulate how GPA increases, backlog clearance, or additional credit accumulation impacts recruiting eligibility.
            </p>

            <div className="space-y-6 pt-2">
              {/* CGPA Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium">Simulated CGPA</span>
                  <span className="font-bold text-indigo-400 font-mono text-sm">
                    {simulatedCgpa.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.00"
                  max="10.00"
                  step="0.05"
                  value={simulatedCgpa}
                  onChange={(e) => setSimulatedCgpa(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0.00</span>
                  <span>5.00</span>
                  <span>10.00</span>
                </div>
              </div>

              {/* Backlogs Count */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium">Active Backlogs</span>
                  <span className={`font-bold font-mono text-sm ${simulatedBacklogs > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                    {simulatedBacklogs}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSimulatedBacklogs(Math.max(0, simulatedBacklogs - 1))}
                    className="flex-1 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 transition-colors text-sm font-semibold"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setSimulatedBacklogs(Math.min(10, simulatedBacklogs + 1))}
                    className="flex-1 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 transition-colors text-sm font-semibold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Earned Credits */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium">Earned Credits</span>
                  <span className="font-bold text-indigo-400 font-mono text-sm">
                    {simulatedCredits}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="160"
                  step="2"
                  value={simulatedCredits}
                  onChange={(e) => setSimulatedCredits(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0 Credits</span>
                  <span>80 Credits</span>
                  <span>160 Credits</span>
                </div>
              </div>
            </div>

            {/* Quick Profile Summary Widget */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-2 text-xs">
              <span className="font-semibold text-white block">Official Profile Standing</span>
              <div className="flex justify-between text-slate-400">
                <span>Current CGPA:</span>
                <span className="font-mono font-medium text-white">{currentCgpa.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Active Backlogs:</span>
                <span className="font-mono font-medium text-white">{currentBacklogs}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Earned Credits:</span>
                <span className="font-mono font-medium text-white">{currentCredits}</span>
              </div>
            </div>
          </GlassCard>

          {/* Add Custom Company Form Overlay */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <GlassCard className="border border-indigo-500/20 bg-indigo-950/10 space-y-4">
                  <h3 className="font-bold text-white text-sm">Configure Custom Recruiter Criteria</h3>
                  <form onSubmit={handleAddRecruiter} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-semibold text-slate-400 block">Company Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Google, McKinsey"
                        value={newCompanyName}
                        onChange={(e) => setNewCompanyName(e.target.value)}
                        className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-semibold text-slate-400 block">CGPA Cutoff</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={newCgpaCutoff}
                          onChange={(e) => setNewCgpaCutoff(parseFloat(e.target.value))}
                          className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-semibold text-slate-400 block">Max Backlogs</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={newMaxBacklogs}
                          onChange={(e) => setNewMaxBacklogs(parseInt(e.target.value))}
                          className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-semibold text-slate-400 block">Min Credits</label>
                        <input
                          type="number"
                          min="0"
                          max="180"
                          value={newRequiredCredits}
                          onChange={(e) => setNewRequiredCredits(parseInt(e.target.value))}
                          className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="flex-1 py-2 bg-slate-900 border border-white/10 rounded-lg text-slate-400 hover:bg-slate-800 text-xs transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-indigo-600 rounded-lg text-white font-medium text-xs hover:bg-indigo-500 transition-colors"
                      >
                        Save Criteria
                      </button>
                    </div>
                  </form>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Columns: Recruiter Grid Matrix */}
        <div className="xl:col-span-2 space-y-6">
          {/* Search bar inside header */}
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search companies by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface/20 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/10 transition-colors"
            />
          </div>

          <CompanyEligibilityList
            companies={evaluationResult.companies}
            customCompanies={customCompanies}
            onRemoveCustomCompany={handleRemoveCustomCompany}
          />
        </div>
      </div>

      {/* Skill Gap Section */}
      <div className="mt-8">
        <SkillGapAdvisor currentCgpa={simulatedCgpa} />
      </div>

      {/* Ordinance Trace Transparency Box */}
      <GlassCard className="border border-white/5 space-y-4">
        <button
          onClick={() => setShowTrace(!showTrace)}
          className="w-full flex items-center justify-between text-left"
        >
          <span className="text-xs font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wider font-mono">
            <Info className="w-4 h-4 text-indigo-400" />
            Ordinance Trace Metadata & Verification Log
          </span>
          {showTrace ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        <AnimatePresence>
          {showTrace && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 text-xs overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-xl border border-white/5 text-slate-400 leading-relaxed font-mono">
                <div className="space-y-2">
                  <div>
                    <span className="text-white block font-semibold mb-0.5">Algorithm Applied:</span>
                    <span>{evaluationResult.trace.formulaApplied}</span>
                  </div>
                  <div>
                    <span className="text-white block font-semibold mb-0.5">Regulation Source:</span>
                    <span>{evaluationResult.trace.sourceRegulationId}</span>
                  </div>
                  <div>
                    <span className="text-white block font-semibold mb-0.5">Circular Reference:</span>
                    <span>{evaluationResult.trace.sourceCircular}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-white block font-semibold mb-0.5">Clause Reference:</span>
                    <span>{evaluationResult.trace.sourceClause}</span>
                  </div>
                  <div>
                    <span className="text-white block font-semibold mb-0.5">Evaluation Quality Confidence:</span>
                    <span className="text-indigo-400">{evaluationResult.trace.confidenceScore}% (Deterministic check)</span>
                  </div>
                  <div>
                    <span className="text-white block font-semibold mb-0.5">Assumptions:</span>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {evaluationResult.trace.assumptions?.map((as, idx) => (
                        <li key={idx}>{as}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {evaluationResult.trace.warnings && (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3 rounded-lg flex items-start gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-semibold block">Compliance Warnings:</span>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {evaluationResult.trace.warnings.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </PageContainer>
  );
}
