// @ts-nocheck
"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Target, PinOff, Filter, Sparkles } from "lucide-react";
import { useUSMStore } from "@/stores/usmStore";
import { intelligenceEngine, IntelligenceEngineInput, IntelligenceResult } from "@/lib/career/intelligenceEngine";
import { DEFAULT_RECRUITERS } from "@/lib/career/careerData";

import PlacementHealthMeter from "@/components/placement/PlacementHealthMeter";
import PlacementSkillsMatrix from "@/components/placement/PlacementSkillsMatrix";
import PriorityActionItems from "@/components/placement/PriorityActionItems";
import PlacementGuideTypography from "@/components/placement/PlacementGuideTypography";
import CompanyIntelligenceGuide from "@/components/placement/CompanyIntelligenceGuide";
import CompanyComparisonGuide from "@/components/placement/CompanyComparisonGuide";
import TopperBenchmark from "@/components/placement/TopperBenchmark";
import CompanyLedgerRow from "@/components/placement/CompanyLedgerRow";
import ResumeUploadTarget from "@/components/placement/ResumeUploadTarget";
import DynamicIsland from "@/components/placement/DynamicIsland";
import { cn } from "@/lib/cn";

import { PageHero } from "@/components/ui/PageHero";
import { DynamicRoadmapModal } from "./components/DynamicRoadmapModal";
import { MagneticWrapper } from "@/components/ui/MagneticWrapper";

export default function CareerIntelligencePage() {
  const [mode, setMode] = useState<"matrix" | "radar">("matrix");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);
  
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
    import("sonner").then((module) => {
      module.toast.success("Sandbox Globally Optimized!");
    });
  };

  const handlePinToggle = (companyName: string) => {
    if (pinnedCompanies.includes(companyName)) {
      setTargetCompanies(pinnedCompanies.filter(n => n !== companyName));
    } else {
      if (pinnedCompanies.length >= 3) {
        import("sonner").then(m => m.toast.error("You can only pin up to 3 companies."));
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
        <div className={cn("absolute inset-0 blur-[160px] rounded-full mix-blend-screen transition-colors duration-1000", "bg-gradient-to-b from-white/[0.02] via-transparent to-transparent")} />
      </motion.div>

      {/* Standardized Hero Section */}
      {mode === "matrix" && (
        <section className="relative z-10 w-full flex flex-col items-start justify-center pt-24 pb-8 px-6 md:px-12 max-w-[1400px] mx-auto">
          <div className="w-full max-w-2xl flex flex-col items-start text-left">
            <PageHero 
              headline={<motion.span 
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(to right, #a1a1aa, #ffffff, #a1a1aa)', backgroundSize: '200% auto', display: 'inline-block' }}
                animate={{ backgroundPosition: ['0% center', '200% center'] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              >Career Intelligence.<br/>Redefined for Desktop.</motion.span>}
              description="The intelligence engine evaluates your profile against live company requirements, instantly calculating your eligibility for top-tier tech roles and identifying skill gaps."
            />
          </div>
        </section>
      )}

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
              <div className="flex flex-col gap-10">
                
                {/* Global Setup Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mb-4 relative z-50">
                  <ResumeUploadTarget />

                  {/* Dynamic AI Roadmaps Widget */}
                  <div className="flex items-center justify-between p-2 pl-5 rounded-full bg-[#1c1c1e] border border-white/[0.04] text-white hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300 h-14 w-full">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-5 w-5 text-white" />
                      <span className="text-[14px] font-bold tracking-tight">
                        Dynamic AI Roadmaps
                      </span>
                    </div>
                    
                    <MagneticWrapper strength={0.6}>
                      <button
                        onClick={() => setIsRoadmapModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-black px-5 py-2 text-[13px] font-bold transition-all duration-300 hover:bg-white/90 outline-none shrink-0 shadow-lg"
                      >
                        Generate
                      </button>
                    </MagneticWrapper>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Company Ledger (Takes 5 cols on Desktop) */}
                  <div className="lg:col-span-5 flex flex-col">
                    {/* Smart Filters and Utility Bar */}
                    <div className="flex flex-col gap-4 mb-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                          {pinnedCompanies.length > 0 ? (
                            <><Target size={24} className="text-[#bf5af2]" /> Target Wishlist ({pinnedCompanies.length}/3)</>
                          ) : "Company Target Ledger"}
                        </h2>
                        
                        {pinnedCompanies.length > 0 && (
                          <button 
                            onClick={() => setTargetCompanies([])}
                            className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white transition-all"
                          >
                            <PinOff size={14} /> Clear
                          </button>
                        )}
                      </div>

                      <div className="mb-4 flex flex-col gap-4 relative z-20">
                        <div className="relative w-full group">
                          <Filter size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors duration-300" />
                          <input 
                            type="text" 
                            placeholder="Search companies..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#111111] border border-white/[0.1] hover:border-white/20 rounded-full py-2.5 pl-11 pr-5 text-[13px] text-white/90 placeholder:text-zinc-500/80 focus:outline-none focus:border-white/60 focus:bg-[#1A1A1A] focus:ring-[2px] focus:ring-white/10 transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                          />
                        </div>

                        <div 
                          className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full"
                          style={{ WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)', maskImage: 'linear-gradient(to right, black 85%, transparent 100%)' }}
                        >
                          {["All", "FAANG", "Product", "Startup", "Service"].map((f) => (
                            <motion.button
                              key={f}
                              onClick={() => setActiveFilter(f as any)}
                              whileTap={{ scale: 0.95 }}
                              className={cn(
                                "relative px-4 py-2 rounded-full text-[12px] font-medium transition-colors duration-300 whitespace-nowrap border outline-none",
                                activeFilter === f 
                                  ? "text-black border-transparent" 
                                  : "bg-[#111111] text-zinc-400 hover:text-white/90 hover:bg-[#1A1A1A] border-white/[0.04]"
                              )}
                            >
                              {activeFilter === f && (
                                <motion.div
                                  layoutId="activeFilterBg"
                                  className="absolute inset-0 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                                  transition={{ type: "spring", stiffness: 500, damping: 35, mass: 1 }}
                                />
                              )}
                              <span className="relative z-10">{f}</span>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Apple Style Unified List Cards */}
                    <div className="flex flex-col gap-6">
                      {/* Pinned Wishlist Zone */}
                      {pinnedResults.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-[13px] font-semibold text-[#86868b] uppercase tracking-wider pl-4">Pinned Targets ({pinnedResults.length}/3)</h3>
                          <div className="flex flex-col rounded-[20px] bg-[#1c1c1e] overflow-hidden">
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
                        <div className="space-y-2">
                          <h3 className="text-[13px] font-semibold text-[#86868b] uppercase tracking-wider pl-4 mt-2">Achievable Now ({safeCompanies.length})</h3>
                          <div className="flex flex-col rounded-[20px] bg-[#1c1c1e] overflow-hidden">
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
                        <div className="space-y-2">
                          <h3 className="text-[13px] font-semibold text-[#86868b] uppercase tracking-wider pl-4 mt-2">Requires Work ({borderlineCompanies.length})</h3>
                          <div className="flex flex-col rounded-[20px] bg-[#1c1c1e] overflow-hidden">
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
                        <div className="space-y-2">
                          <h3 className="text-[13px] font-semibold text-[#86868b] uppercase tracking-wider pl-4 mt-2">Out of Reach ({riskCompanies.length})</h3>
                          <div className="flex flex-col rounded-[20px] bg-[#1c1c1e] overflow-hidden">
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

                  {/* Right Column: Company Intelligence Guide (Takes 7 cols on Desktop) */}
                  <div className="lg:col-span-7 flex flex-col gap-6 sticky top-32">
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
                        onNavigateToSkills={() => setMode("radar")}
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
                        onNavigateToSkills={() => setMode("radar")}
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
                        onNavigateToSkills={() => setMode("radar")}
                      />
                    )}

                    <PriorityActionItems 
                      eligibility={eligibilityResults} 
                      skillGap={skillGapResult} 
                    />
                  </div>
                  
                </div>
              </div>
            ) : (
              <div className="max-w-6xl mx-auto pt-12">
                <PlacementSkillsMatrix />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* MARKETING INTEGRATIONS WIDGET */}
        <div className="mt-10 pt-10 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between bg-[#1c1c1e] hover:bg-white/[0.02] border border-white/[0.04] rounded-[20px] p-4 px-6 transition-colors duration-300">
            
            <div className="flex items-center gap-5">
              <div className="h-12 w-12 rounded-full bg-[#0a84ff]/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-[#0a84ff]" />
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-[15px] font-bold text-white tracking-tight">GradeFlow Auto-Apply Engine</h3>
                  <span className="px-2 py-0.5 bg-[#0a84ff]/10 text-[#0a84ff] text-[9px] font-bold uppercase tracking-widest rounded-full">
                    Chrome Extension
                  </span>
                </div>
                <p className="text-[#86868b] text-[13px] max-w-xl">
                  Bypass Workday CAPTCHAs and one-click inject your generated ATS Resume into job applications.
                </p>
              </div>
            </div>

            <div className="mt-4 md:mt-0 shrink-0">
              <a 
                href="https://chrome.google.com/webstore" 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-white hover:bg-white/90 text-black text-[13px] font-bold transition-colors outline-none"
              >
                Install Extension
              </a>
            </div>
          </div>
        </div>
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

      <DynamicRoadmapModal 
        isOpen={isRoadmapModalOpen} 
        onClose={() => setIsRoadmapModalOpen(false)}
        userId="cm4d9e03"
      />
    </div>
  );
}
