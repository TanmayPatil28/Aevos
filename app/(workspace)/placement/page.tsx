"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Target, PinOff, Filter } from "lucide-react";
import { useUSMStore } from "@/stores/usmStore";
import { intelligenceEngine, IntelligenceEngineInput, IntelligenceResult } from "@/lib/career/intelligenceEngine";
import { DEFAULT_RECRUITERS } from "@/lib/career/careerData";

import PlacementHealthMeter from "@/components/placement/PlacementHealthMeter";
import SkillGapDetector from "@/components/placement/SkillGapDetector";
import PriorityActionItems from "@/components/placement/PriorityActionItems";
import PlacementGuideTypography from "@/components/placement/PlacementGuideTypography";
import CompanyIntelligenceGuide from "@/components/placement/CompanyIntelligenceGuide";
import CompanyComparisonGuide from "@/components/placement/CompanyComparisonGuide";
import TopperBenchmark from "@/components/placement/TopperBenchmark";
import CompanyLedgerRow from "@/components/placement/CompanyLedgerRow";
import DynamicIsland from "@/components/placement/DynamicIsland";
import { cn } from "@/lib/cn";

import { PageHero } from "@/components/ui/PageHero";

export default function CareerIntelligencePage() {
  const [mode, setMode] = useState<"matrix" | "radar">("matrix");
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Advanced features state
  const [isSandboxActive, setIsSandboxActive] = useState(false);
  const rawPinnedCompanies = useUSMStore(state => state.career.targetCompanies) || [];
  const pinnedCompanies = rawPinnedCompanies.filter(name => DEFAULT_RECRUITERS.some(c => c.name === name));
  const setTargetCompanies = useUSMStore(state => state.setTargetCompanies);
  const [activeFilter, setActiveFilter] = useState<"All" | "FAANG" | "Product" | "Startup" | "Service">("All");
  
  // Productivity utilities
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"Score" | "Difficulty" | "Name">("Score");

  const { scrollY } = useScroll();
  const glowY = useTransform(scrollY, [0, 500], [0, 150]);
  const glowOpacity = useTransform(scrollY, [0, 300], [0.8, 0]);

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

  const globalSandboxCgpa = useUSMStore(state => state.workspaceUi.sandboxCgpa);
  const globalSandboxBacklogs = useUSMStore(state => state.workspaceUi.sandboxBacklogs);
  const setSandboxMetrics = useUSMStore(state => state.setSandboxMetrics);

  const sandboxCgpa = globalSandboxCgpa ?? realCgpa;
  const sandboxBacklogs = globalSandboxBacklogs ?? realBacklogs;

  // Sync sandbox with real data when toggling off
  useEffect(() => {
    if (!isSandboxActive) {
      setSandboxMetrics(null, null);
    } else if (globalSandboxCgpa === null || globalSandboxBacklogs === null) {
      setSandboxMetrics(realCgpa, realBacklogs);
    }
  }, [isSandboxActive, realCgpa, realBacklogs, globalSandboxCgpa, globalSandboxBacklogs, setSandboxMetrics]);

  const handleOptimizeSandbox = (targetCgpa: number, targetBacklogs: number) => {
    setIsSandboxActive(true);
    setSandboxMetrics(targetCgpa, targetBacklogs);
    import("react-hot-toast").then((module) => {
      module.toast.success("Sandbox Globally Optimized!");
    });
  };

  const handlePinToggle = (companyName: string) => {
    if (pinnedCompanies.includes(companyName)) {
      setTargetCompanies(pinnedCompanies.filter(n => n !== companyName));
    } else {
      if (pinnedCompanies.length >= 3) {
        import("react-hot-toast").then(m => m.toast.error("You can only pin up to 3 companies."));
        return;
      }
      setTargetCompanies([...pinnedCompanies, companyName]);
    }
  };

  const engineInput: IntelligenceEngineInput = useMemo(() => ({
    cgpa: isSandboxActive ? sandboxCgpa : realCgpa,
    backlogs: isSandboxActive ? sandboxBacklogs : realBacklogs,
    earnedCredits: realCredits,
    branch,
    skills: realSkills,
    targetRole
  }), [isSandboxActive, sandboxCgpa, realCgpa, sandboxBacklogs, realBacklogs, realCredits, branch, realSkills, targetRole]);

  let eligibilityResults = useMemo(() => intelligenceEngine.calculateEligibility(engineInput), [engineInput]);
  
  // Smart Filtering Logic
  if (activeFilter !== "All") {
    eligibilityResults = eligibilityResults.filter(c => c.tier === activeFilter);
  }


  const riskResult = useMemo(() => intelligenceEngine.calculatePlacementRisk(engineInput), [engineInput]);
  const syncSkillGapResult = useMemo(() => intelligenceEngine.detectSkillGaps(realSkills, targetRole), [realSkills, targetRole]);
  const [aiSkillGapResult, setAiSkillGapResult] = useState(syncSkillGapResult);
  
  useEffect(() => {
    let active = true;
    intelligenceEngine.analyzeSkillGapAI(realSkills, targetRole).then(res => {
      if (active) setAiSkillGapResult(res);
    });
    return () => { active = false; };
  }, [realSkills, targetRole]);

  const skillGapResult = aiSkillGapResult;
  
  // Apply Search, Filter and Sort
  let processedResults = eligibilityResults.filter(c => {
    if (activeFilter !== "All" && c.tier !== activeFilter) return false;
    if (searchQuery.trim() !== "" && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  processedResults.sort((a, b) => {
    if (sortBy === "Score") return b.eligibilityScore - a.eligibilityScore;
    if (sortBy === "Difficulty") return a.eligibilityScore - b.eligibilityScore;
    if (sortBy === "Name") return a.name.localeCompare(b.name);
    return 0;
  });

  const pinnedResults = processedResults.filter(c => pinnedCompanies.includes(c.name));
  const unpinnedResults = processedResults.filter(c => !pinnedCompanies.includes(c.name));

  const safeCompanies = unpinnedResults.filter(c => c.status === "ELIGIBLE");
  const borderlineCompanies = unpinnedResults.filter(c => c.status === "BORDERLINE");
  const riskCompanies = unpinnedResults.filter(c => c.status === "INELIGIBLE");

  return (
    <div className="w-full relative min-h-screen bg-black overflow-x-hidden selection:bg-[#0a84ff]/30 selection:text-white pb-40 font-sans">
      
      {/* Background Ambient Glows (macOS / visionOS style) */}
      <motion.div 
        style={{ y: glowY, opacity: glowOpacity }}
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] pointer-events-none z-0"
      >
        <div className={cn("absolute inset-0 blur-[160px] rounded-full mix-blend-screen transition-colors duration-1000", isSandboxActive ? "bg-gradient-to-b from-[#0a84ff]/15 via-transparent to-transparent" : "bg-gradient-to-b from-[#5e5ce6]/15 via-[#bf5af2]/5 to-transparent")} />
        <div className={cn("absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] blur-[120px] rounded-full mix-blend-screen transition-colors duration-1000", isSandboxActive ? "bg-[#0a84ff]/10" : "bg-[#5e5ce6]/10")} />
      </motion.div>

      {/* Standardized Hero Section */}
      <section className="relative z-10 w-full flex flex-col items-start justify-center pt-24 pb-8 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="w-full max-w-2xl flex flex-col items-start text-left">
          <PageHero 
            headline={<>Career Intelligence.<br/>Redefined for Desktop.</>}
            description="The intelligence engine evaluates your profile against live company requirements, instantly calculating your eligibility for top-tier tech roles and identifying skill gaps."
          />
        </div>
      </section>

      {/* Desktop Content Area - Max Width 7xl for large screens */}
      <div className="relative z-10 w-full px-6 md:px-12 max-w-[1400px] mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            {mode === "matrix" ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Metrics & Actions (Takes 4 cols on Desktop) */}
                <div className="lg:col-span-4 flex flex-col gap-6 sticky top-32">
                  
                  {/* Context-Aware Company Guide or Comparison Matrix (Moved to TOP) */}
                  {pinnedCompanies.length === 0 && (
                    <CompanyIntelligenceGuide 
                      pinnedCompany={null} 
                      userCgpa={isSandboxActive ? sandboxCgpa : realCgpa}
                      userBacklogs={isSandboxActive ? sandboxBacklogs : realBacklogs}
                      userSkills={realSkills}
                      readinessScore={riskResult.readinessScore}
                      averageEligibility={riskResult.averageEligibility}
                      userCredits={realCredits}
                      branch={branch}
                    />
                  )}
                  {pinnedCompanies.length === 1 && (
                    <CompanyIntelligenceGuide 
                      pinnedCompany={pinnedCompanies[0]} 
                      userCgpa={isSandboxActive ? sandboxCgpa : realCgpa}
                      userBacklogs={isSandboxActive ? sandboxBacklogs : realBacklogs}
                      userSkills={realSkills}
                      onOptimizeSandbox={handleOptimizeSandbox}
                      isSandboxActive={isSandboxActive}
                      onResetSandbox={() => {
                        setSandboxMetrics(null, null);
                        setIsSandboxActive(false);
                      }}
                      readinessScore={riskResult.readinessScore}
                      averageEligibility={riskResult.averageEligibility}
                      userCredits={realCredits}
                      branch={branch}
                    />
                  )}
                  {pinnedCompanies.length > 1 && (
                    <CompanyComparisonGuide 
                      pinnedCompanies={pinnedCompanies}
                      userCgpa={isSandboxActive ? sandboxCgpa : realCgpa}
                      userBacklogs={isSandboxActive ? sandboxBacklogs : realBacklogs}
                      userSkills={realSkills}
                      onOptimizeSandbox={handleOptimizeSandbox}
                      isSandboxActive={isSandboxActive}
                      onResetSandbox={() => {
                        setSandboxMetrics(null, null);
                        setIsSandboxActive(false);
                      }}
                      readinessScore={riskResult.readinessScore}
                      averageEligibility={riskResult.averageEligibility}
                      userCredits={realCredits}
                      branch={branch}
                    />
                  )}

                  <PriorityActionItems 
                    eligibility={eligibilityResults} 
                    skillGap={skillGapResult} 
                  />
                  
                </div>

                {/* Right Column: Company Ledger (Takes 8 cols on Desktop) */}
                <div className="lg:col-span-8 flex flex-col">
                  {/* Smart Filters and Utility Bar */}
                  <div className="flex flex-col gap-4 mb-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        {pinnedCompanies.length > 0 ? (
                          <><Target size={28} className="text-[#bf5af2]" /> Target Wishlist ({pinnedCompanies.length}/3)</>
                        ) : "Company Target Ledger"}
                      </h2>
                      
                      {pinnedCompanies.length > 0 && (
                        <button 
                          onClick={() => setTargetCompanies([])}
                          className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-semibold text-white transition-all"
                        >
                          <PinOff size={16} /> Clear All
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 bg-[#1c1c1e] p-2 rounded-[24px] border border-white/10">
                      {/* Search */}
                      <div className="flex-1 min-w-[200px] relative">
                        <Filter size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                        <input 
                          type="text" 
                          placeholder="Search companies..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-black/40 border border-white/5 rounded-full py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#bf5af2]/50 transition-colors"
                        />
                      </div>
                      
                      {/* Filters */}
                      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                        {["All", "FAANG", "Product", "Startup", "Service"].map((f) => (
                          <button
                            key={f}
                            onClick={() => setActiveFilter(f as any)}
                            className={cn("px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap", 
                              activeFilter === f 
                                ? "bg-white text-black shadow-lg" 
                                : "bg-black/40 text-white/70 border border-white/5 hover:bg-black/80")}
                          >
                            {f}
                          </button>
                        ))}
                      </div>

                      {/* Sort Dropdown */}
                      <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-black/40 border border-white/5 rounded-full py-2.5 px-4 text-xs font-semibold text-white focus:outline-none focus:border-[#bf5af2]/50 appearance-none min-w-[140px] cursor-pointer"
                      >
                        <option value="Score">Sort by Score</option>
                        <option value="Difficulty">Sort by Easiest</option>
                        <option value="Name">Sort Alphabetically</option>
                      </select>
                    </div>
                  </div>
                  
                  
                  {/* Apple Style Unified List Cards */}
                  <div className="flex flex-col gap-10">
                    {/* Pinned Wishlist Zone */}
                    {pinnedResults.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-[#bf5af2] uppercase tracking-widest pl-2">Pinned Targets ({pinnedResults.length}/3)</h3>
                        <div className="bg-[#1c1c1e]/60 backdrop-blur-3xl border border-[#bf5af2]/30 rounded-[32px] overflow-hidden shadow-[0_0_30px_rgba(191,90,242,0.15)] ring-1 ring-white/5">
                          {pinnedResults.map((company, i) => (
                            <CompanyLedgerRow 
                              key={company.name} 
                              result={company} 
                              isPinned={true} 
                              onPinToggle={handlePinToggle}
                              isLast={i === pinnedResults.length - 1} 
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Safe Zone */}
                    {safeCompanies.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-[#34c759] uppercase tracking-widest pl-2">Achievable Now ({safeCompanies.length})</h3>
                        <div className="bg-[#1c1c1e]/60 backdrop-blur-3xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
                          {safeCompanies.map((company, i) => (
                            <CompanyLedgerRow 
                              key={company.name} 
                              result={company} 
                              isPinned={pinnedCompanies.includes(company.name)} 
                              onPinToggle={handlePinToggle}
                              isLast={i === safeCompanies.length - 1} 
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Borderline Zone */}
                    {borderlineCompanies.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-[#ff9f0a] uppercase tracking-widest pl-2">Requires Work ({borderlineCompanies.length})</h3>
                        <div className="bg-[#1c1c1e]/60 backdrop-blur-3xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
                          {borderlineCompanies.map((company, i) => (
                            <CompanyLedgerRow 
                              key={company.name} 
                              result={company} 
                              isPinned={pinnedCompanies.includes(company.name)} 
                              onPinToggle={handlePinToggle}
                              isLast={i === borderlineCompanies.length - 1} 
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Risk Zone */}
                    {riskCompanies.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-[#ff453a] uppercase tracking-widest pl-2">Out of Reach ({riskCompanies.length})</h3>
                        <div className="bg-[#1c1c1e]/60 backdrop-blur-3xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
                          {riskCompanies.map((company, i) => (
                            <CompanyLedgerRow 
                              key={company.name} 
                              result={company} 
                              isPinned={pinnedCompanies.includes(company.name)} 
                              onPinToggle={handlePinToggle}
                              isLast={i === riskCompanies.length - 1} 
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-6xl mx-auto">
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
      
      {/* Unified Dynamic Island — Fixed at top right */}
      <DynamicIsland
        mode={mode}
        onModeChange={setMode}
        sandboxActive={isSandboxActive}
        onSandboxToggle={() => setIsSandboxActive(!isSandboxActive)}
        cgpa={sandboxCgpa}
        setCgpa={(val) => setSandboxMetrics(val, sandboxBacklogs)}
        backlogs={sandboxBacklogs}
        setBacklogs={(val) => setSandboxMetrics(sandboxCgpa, val)}
      />
    </div>
  );
}
