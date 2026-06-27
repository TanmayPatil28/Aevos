// @ts-nocheck
"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Target, PinOff, Filter, Sparkles, Upload, FileEdit, Download, Trash2, RefreshCw } from "lucide-react";
import { useUSMStore } from "@/stores/usmStore";
import { intelligenceEngine, IntelligenceEngineInput, IntelligenceResult } from "@/lib/career/intelligenceEngine";
import { DEFAULT_RECRUITERS } from "@/lib/career/careerData";

import { ReactLenis } from '@studio-freight/react-lenis';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

import PlacementHealthMeter from "@/components/placement/PlacementHealthMeter";
import PlacementSkillsMatrix from "@/components/placement/PlacementSkillsMatrix";
import PriorityActionItems from "@/components/placement/PriorityActionItems";
import PlacementGuideTypography from "@/components/placement/PlacementGuideTypography";
import CompanyIntelligenceGuide from "@/components/placement/CompanyIntelligenceGuide";
import CompanyComparisonGuide from "@/components/placement/CompanyComparisonGuide";
import TopperBenchmark from "@/components/placement/TopperBenchmark";
import CompanyLedgerRow from "@/components/placement/CompanyLedgerRow";
import ResumeUploadTarget from "@/components/placement/ResumeUploadTarget";
import ManualProfileEditor from "@/components/placement/ManualProfileEditor";
import DynamicIsland from "@/components/placement/DynamicIsland";
import { cn } from "@/lib/cn";

import { PageHero } from "@/components/ui/PageHero";
import { DynamicRoadmapModal } from "./components/DynamicRoadmapModal";
import Card from "@/components/ui/card";
import { MagneticWrapper } from "@/components/ui/MagneticWrapper";
import CareerOSHeader from "@/components/placement/CareerOSHeader";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { FloatingPill } from "@/components/ui/floating-pill";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import InternshipsDashboard from "@/components/internships/InternshipsDashboard";
import { Badge } from "@/components/ui/badge";
import { matchInternships } from "@/app/(workspace)/internships/actions";
import { InternshipMatch } from "@/components/internships/InternshipLedgerRow";
import { AppleCarousel } from "@/components/ui/apple-carousel";
export default function CareerIntelligencePage() {
  const router = useRouter();
  const [mode, setMode] = useState<"matrix" | "radar" | "ledger" | "internships">("ledger");
  const [internships, setInternships] = useState<InternshipMatch[]>([]);
  const [isLoadingInternships, setIsLoadingInternships] = useState(false);

  // GSAP Cinematic Curtain Reveal
  useGSAP(() => {
    const tl = gsap.timeline();

    // Reset initial state
    gsap.set(".curtain-content", { opacity: 0, filter: "blur(10px)", scale: 0.98 });
    gsap.set(".guide-column", { opacity: 0, x: 30 });
    gsap.set(".ledger-card", { opacity: 0, y: 50 });

    tl.to(".curtain-content", {
      opacity: 1,
      filter: "blur(0px)",
      scale: 1,
      duration: 1.2,
      ease: "power3.out"
    })
    .to(".guide-column", {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: "power3.out"
    }, "-=0.6");

    // ScrollTrigger for ledger cards cascading in as you scroll
    ScrollTrigger.batch(".ledger-card", {
      onEnter: elements => gsap.to(elements, {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "back.out(1.2)",
        overwrite: true
      }),
      start: "top 95%",
    });

    // ScrollTrigger Parallax on the Guide Column
    ScrollTrigger.matchMedia({
      // desktop
      "(min-width: 1024px)": function() {
        gsap.to(".guide-column", {
          yPercent: 10,
          ease: "none",
          scrollTrigger: {
            trigger: ".main-grid",
            start: "top top",
            end: "bottom bottom",
            scrub: true
          }
        });
      }
    });

  }, []);

  const carouselSlides = [
    {
      id: "slide-1",
      headline: (
        <>
          Secure your dream role.<br />
          Data-driven placement strategies.
        </>
      ),
      colors: ["#1c1c1c", "#1e1e1e", "#181818", "#222222"], // Matte Dark Gray
    },
    {
      id: "slide-2",
      headline: (
        <>
          Master the tech stack.<br />
          Your personalized skills matrix.
        </>
      ),
      colors: ["#1c1c1c", "#1f1f1f", "#191919", "#202020"], // Matte Dark Gray
    },
    {
      id: "slide-3",
      headline: (
        <>
          Launch your career.<br />
          High-impact internship matches.
        </>
      ),
      colors: ["#1c1c1c", "#1a1a1a", "#1b1b1b", "#1f1f1f"], // Matte Dark Gray
    },
  ];
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFeatureId, setActiveFeatureId] = useState<string | null>(null);
  
  // Floating Pill State
  const [activePillId, setActivePillId] = useState<string | number>("none");
  const [isPillExpanded, setIsPillExpanded] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const setCareer = useUSMStore((state) => state.setCareer);

  useEffect(() => {
    fetch("/api/career/skills")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.skills)) {
          setCareer({ skills: data.skills });
        }
      })
      .catch((err) => console.error("Error fetching skills on mount:", err));
  }, [setCareer]);
  
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
    <ReactLenis root options={{ lerp: 0.08, smoothWheel: true }}>
    <div className="w-full relative min-h-screen bg-background overflow-x-hidden selection:bg-brand selection:text-foreground pb-40 font-sans curtain-content">
      
      {/* Background Ambient Glows (macOS / visionOS style) */}
      <motion.div 
        style={{ y: glowY, opacity: glowOpacity }}
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] pointer-events-none z-0"
      >
        <div className={cn("absolute inset-0 blur-[160px] rounded-full mix-blend-screen transition-colors duration-1000", "bg-gradient-to-b from-white/[0.02] via-transparent to-transparent")} />
      </motion.div>


      {/* Premium Apple Carousel Section at Very Top */}
      <div className="relative z-50 pt-6 pb-8 max-w-[1400px] mx-auto flex flex-col gap-6">

        <div className="w-full">
          <div className="w-[100vw] relative left-1/2 -translate-x-1/2">
            <AppleCarousel 
              slides={carouselSlides} 
              activeFeatureId={activeFeatureId}
              hideCenterControls={isPillExpanded}
              features={[
                { 
                  id: "resume", 
                  content: <ResumeUploadTarget /> 
                },
                {
                  id: "roadmap",
                  content: (
                    <DynamicRoadmapModal 
                      isOpen={true} 
                      onClose={() => {
                        setActiveFeatureId(null);
                        setActivePillId("none");
                      }} 
                      userId="cm4d9e03" 
                      inline={true}
                    />
                  )
                },
                {
                  id: "edit",
                  content: <ManualProfileEditor />
                }
              ]}
              leftControls={
                <FloatingPill 
                  id={activePillId as string}
                  activeId={activePillId as string}
                  onActiveChange={(id) => {
                    const strId = String(id);
                    if (activeFeatureId === strId) {
                      // Toggle off
                      setActiveFeatureId(null);
                      setActivePillId("none");
                      if (strId === "edit") setIsEditMode(false);
                    } else {
                      // Toggle on
                      setActivePillId(strId);
                      if (strId === "resume" || strId === "roadmap" || strId === "edit") {
                        setActiveFeatureId(strId);
                      }
                      if (strId === "edit") {
                        setIsEditMode(true);
                      }
                    }
                  }}
                  isExpanded={isPillExpanded}
                  onExpandChange={setIsPillExpanded}
                  items={[
                    { id: "resume", label: "Upload Resume" },
                    { id: "roadmap", label: "AI Roadmaps" },
                    { id: "edit", label: "Edit Mode" }
                  ]}
                  expandable={true}
                  expandLabel="Actions"
                  expandedItems={[
                    { 
                      id: "export", 
                      label: "Export PDF", 
                      onClick: () => import("sonner").then(m => m.toast.success("Preparing PDF export..."))
                    },
                    { 
                      id: "resync", 
                      label: "Re-sync JARVIS", 
                      onClick: () => import("sonner").then(m => m.toast.success("JARVIS parsing re-synced!"))
                    },
                    { 
                      id: "clear", 
                      label: "Clear Profile", 
                      onClick: () => { 
                        setCareer({ skills: [], targetRole: "", branch: "", targetPackage: "", projects: [], targetCompanies: [], wesGpaEquivalent: 0, ectsStandingBand: "" });
                        import("sonner").then(m => m.toast.success("Profile data cleared.")); 
                      }
                    }
                  ]}
                />
              }
              rightControls={
                <SegmentedControl
                  options={[
                    { value: "placement", label: "Placement" },
                    { value: "matrix", label: "Skills Matrix" },
                    { value: "internships", label: "Internships" },
                  ]}
                  value={mode === "ledger" ? "placement" : mode}
                  onChange={(val) => {
                    if (val === "internships") {
                      setMode("internships");
                      if (internships.length === 0) {
                        setIsLoadingInternships(true);
                        matchInternships().then(res => {
                          setInternships(res);
                          setIsLoadingInternships(false);
                        });
                      }
                    } else if (val === "placement") {
                      setMode("ledger");
                    } else if (val === "matrix") {
                      setMode("matrix");
                    }
                  }}
                />
              }
            />
          </div>
        </div>
      </div>

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
            {mode === "internships" ? (
              <InternshipsDashboard matches={internships} isLoading={isLoadingInternships} />
            ) : mode === "ledger" ? (
              <div className="flex flex-col gap-10">
                
                {/* The grid layout goes straight into the main columns now */}

                <div className="main-grid grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Company Ledger (Takes 5 cols on Desktop) */}
                  <div className="lg:col-span-5 flex flex-col">
                    {/* Smart Filters and Utility Bar */}
                    <div className="flex flex-col gap-4 mb-6">

                      <div className="mb-4 flex flex-col gap-4 relative z-20">
                        <div className="relative flex items-center w-full rounded-xl backdrop-blur-md bg-white/[0.04] border border-white/[0.08] transition-all duration-300 h-12 focus-within:ring-2 focus-within:ring-white/20 focus-within:bg-white/[0.08] hover:bg-white/[0.06] group">
                          <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted group-focus-within:text-foreground transition-colors duration-300" />
                          <input 
                            type="text" 
                            placeholder="Search companies..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent text-[15px] font-medium text-foreground placeholder:text-foreground-muted w-full px-4 outline-none pl-11"
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
                                "relative flex items-center justify-center h-10 px-4 text-sm leading-[20px] font-medium rounded-full whitespace-nowrap border outline-none transition-colors duration-300 before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:min-w-[44px] before:min-h-[44px] before:content-['']",
                                activeFilter === f 
                                  ? "text-black border-transparent" 
                                  : "backdrop-blur-md bg-white/[0.08] border-white/[0.08] text-foreground hover:bg-white/[0.12] active:bg-white/[0.16]"
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
                          {pinnedCompanies.length > 0 && (
                            <button
                              onClick={() => setTargetCompanies([])}
                              className="relative flex items-center justify-center h-10 px-4 text-sm leading-[20px] font-medium rounded-full whitespace-nowrap border outline-none transition-colors duration-300 backdrop-blur-md bg-white/[0.08] border-white/[0.08] text-foreground hover:bg-white/[0.12] active:bg-white/[0.16] shrink-0"
                            >
                              <PinOff size={14} className="mr-1.5 text-brand-tertiary" /> Clear
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Apple Style Unified List Cards */}
                    <div className="flex flex-col gap-6">
                      {/* Pinned Wishlist Zone */}
                      {pinnedResults.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between pl-4 pr-2">
                            <h3 className="text-[13px] font-semibold text-foreground-muted uppercase tracking-wider flex items-center gap-2">
                              <Target size={14} className="text-brand-tertiary" />
                              Target Wishlist ({pinnedResults.length}/3)
                            </h3>
                          </div>
                          <Card variant="default" className="ledger-card flex flex-col !p-0">
                            {pinnedResults.map((company, i) => (
                              <CompanyLedgerRow 
                                key={company.name} 
                                result={company} 
                                isPinned={true} 
                                onPinToggle={handlePinToggle}
                                isLast={i === pinnedResults.length - 1} 
                              />
                            ))}
                          </Card>
                        </div>
                      )}

                      {/* Safe Zone */}
                      {safeCompanies.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-[13px] font-semibold text-foreground-muted uppercase tracking-wider pl-4 mt-2">Achievable Now ({safeCompanies.length})</h3>
                          <Card variant="default" className="ledger-card flex flex-col !p-0">
                            {safeCompanies.map((company, i) => (
                              <CompanyLedgerRow 
                                key={company.name} 
                                result={company} 
                                isPinned={pinnedCompanies.includes(company.name)} 
                                onPinToggle={handlePinToggle}
                                isLast={i === safeCompanies.length - 1} 
                              />
                            ))}
                          </Card>
                        </div>
                      )}

                      {/* Borderline Zone */}
                      {borderlineCompanies.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-[13px] font-semibold text-foreground-muted uppercase tracking-wider pl-4 mt-2">Requires Work ({borderlineCompanies.length})</h3>
                          <Card variant="default" className="ledger-card flex flex-col !p-0">
                            {borderlineCompanies.map((company, i) => (
                              <CompanyLedgerRow 
                                key={company.name} 
                                result={company} 
                                isPinned={pinnedCompanies.includes(company.name)} 
                                onPinToggle={handlePinToggle}
                                isLast={i === borderlineCompanies.length - 1} 
                              />
                            ))}
                          </Card>
                        </div>
                      )}

                      {/* Risk Zone */}
                      {riskCompanies.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-[13px] font-semibold text-foreground-muted uppercase tracking-wider pl-4 mt-2">Out of Reach ({riskCompanies.length})</h3>
                          <Card variant="default" className="ledger-card flex flex-col !p-0">
                            {riskCompanies.map((company, i) => (
                              <CompanyLedgerRow 
                                key={company.name} 
                                result={company} 
                                isPinned={pinnedCompanies.includes(company.name)} 
                                onPinToggle={handlePinToggle}
                                isLast={i === riskCompanies.length - 1} 
                              />
                            ))}
                          </Card>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Company Intelligence Guide (Takes 7 cols on Desktop) */}
                  <motion.div layout className="guide-column lg:col-span-7 flex flex-col gap-6 sticky top-32">
                    <AnimatePresence mode="wait">
                      {pinnedCompanies.length === 0 ? (
                        <motion.div
                          key="empty-guide"
                          initial={{ opacity: 0, scale: 0.98, y: 15, filter: "blur(8px)" }}
                          animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                          exit={{ opacity: 0, scale: 0.98, y: -15, filter: "blur(8px)" }}
                          transition={{ type: "spring", stiffness: 350, damping: 30, mass: 1 }}
                        >
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
                        </motion.div>
                      ) : pinnedCompanies.length === 1 ? (
                        <motion.div
                          key={`single-${pinnedCompanies[0]}`}
                          initial={{ opacity: 0, scale: 0.98, y: 15, filter: "blur(8px)" }}
                          animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                          exit={{ opacity: 0, scale: 0.98, y: -15, filter: "blur(8px)" }}
                          transition={{ type: "spring", stiffness: 350, damping: 30, mass: 1 }}
                        >
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
                        </motion.div>
                      ) : (
                        <motion.div
                          key={`multi-${pinnedCompanies.join('-')}`}
                          initial={{ opacity: 0, scale: 0.98, y: 15, filter: "blur(8px)" }}
                          animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                          exit={{ opacity: 0, scale: 0.98, y: -15, filter: "blur(8px)" }}
                          transition={{ type: "spring", stiffness: 350, damping: 30, mass: 1 }}
                        >
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
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <PriorityActionItems 
                      eligibility={eligibilityResults} 
                      skillGap={skillGapResult} 
                    />
                  </motion.div>
                  
                </div>
              </div>
            ) : (
              <div className="max-w-6xl mx-auto">
                <PlacementSkillsMatrix />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* MARKETING INTEGRATIONS WIDGET */}
        <div className="mt-8 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between bg-surface-raised rounded-card-large p-4 px-6">
            
            <div className="flex items-center gap-5">
              <div className="h-12 w-12 rounded-full bg-brand flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-[#0a84ff]" />
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-[15px] font-bold text-foreground tracking-tight">Aevos Auto-Apply Engine</h3>
                  <span className="text-foreground-muted text-[12px] font-medium">
                    Chrome Extension
                  </span>
                </div>
                <p className="text-foreground-muted text-[13px] max-w-xl">
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
      




    </div>
    </ReactLenis>
  );
}
