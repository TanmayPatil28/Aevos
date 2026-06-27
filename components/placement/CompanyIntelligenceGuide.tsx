"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Code2, Users, Lightbulb, Zap, FileText, CheckCircle2, XCircle, ChevronDown, Clock, BookOpen, AlertCircle, BarChart3, Download, RefreshCcw, Loader2, Terminal } from "lucide-react";
import { DEFAULT_RECRUITERS } from "@/lib/career/careerData";
import FluidDataWave from "./FluidDataWave";
import PlacementHealthMeter from "./PlacementHealthMeter";
import TopperBenchmark from "./TopperBenchmark";
import ExportPlanModal from "./ExportPlanModal";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Card from "@/components/ui/Card";

interface GuideProps {
  pinnedCompany: string | null;
  userCgpa: number;
  userBacklogs: number;
  userSkills: string[];
  readinessScore?: number;
  averageEligibility?: number;
  userCredits?: number;
  branch?: string;
  isSandboxActive?: boolean;
  onOptimizeSandbox?: (cgpa: number, backlogs: number) => void;
  onResetSandbox?: () => void;
  onNavigateToSkills?: () => void;
}

export default function CompanyIntelligenceGuide({ 
  pinnedCompany, 
  userCgpa, 
  userBacklogs, 
  userSkills, 
  readinessScore = 0, 
  averageEligibility = 0, 
  userCredits = 0, 
  branch = "Computer Science", 
  isSandboxActive,
  onOptimizeSandbox,
  onResetSandbox,
  onNavigateToSkills
}: GuideProps) {
  const [expandedRound, setExpandedRound] = useState<number | null>(0);
  const [statsExpanded, setStatsExpanded] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  if (!pinnedCompany) {
    return (
      <div className="w-full mt-6 relative z-10 flex flex-col items-center justify-center min-h-[300px] rounded-[24px] bg-surface-raised overflow-hidden py-8 shadow-sm">
        
        {/* Subtle Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand/5 to-transparent opacity-50" />
        
        {/* Minimal Tech Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)", backgroundSize: "24px 24px" }}
        />

        <div className="relative z-20 flex flex-col items-center text-center px-6 max-w-md w-full">
          
          {/* Refined Icon Container */}
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-surface shadow-sm mb-6">
             <div className="absolute inset-0 bg-brand/5 rounded-2xl" />
             <Target className="text-brand w-6 h-6 opacity-80" strokeWidth={1.5} />
          </div>
          
          {/* Clean Enterprise Typography */}
          <h3 className="text-[18px] font-semibold text-foreground tracking-tight mb-2">
            Target Selection Required
          </h3>
          
          <p className="text-[14px] text-foreground-muted leading-relaxed mb-8">
            Pin a company from your placement ledger to initiate the intelligence engine. Aevos will analyze your profile and generate precise hiring probabilities.
          </p>

          {/* Minimal Status Indicator */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-background shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-40"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand opacity-80"></span>
            </span>
            <span className="text-[12px] font-medium text-foreground-muted tracking-wide">System Idle</span>
          </div>

        </div>
      </div>
    );
  }

  const company = DEFAULT_RECRUITERS.find(c => c.name === pinnedCompany);
  if (!company) return null;

  // 1. Live Profile vs Company Diff
  const passesCgpa = userCgpa >= company.cgpaCutoff;
  const passesBacklogs = userBacklogs <= company.maxBacklogs;
  
  // Diff Skills
  const reqSkills = company.requiredSkills || [];
  const normalizedUserSkills = userSkills.map(s => s.toLowerCase().trim());
  const skillMatches = reqSkills.map(req => {
    // Basic match logic: if user has a skill that includes the req skill (or vice versa)
    const reqLower = req.toLowerCase().trim();
    const isMatched = normalizedUserSkills.some(s => s.includes(reqLower) || reqLower.includes(s));
    return { name: req, isMatched };
  });

  // 2. Interactive Prep Journey Generation
  let defaultRounds = [];
  if (company.tier === "Service") {
    defaultRounds = [
      { name: "Online Assessment", icon: FileText, duration: "90 mins", focus: "Aptitude, Logical Reasoning, Verbal Ability.", prep: "Practice quantitative aptitude and basic grammar. Speed and accuracy over deep technical knowledge." },
      { name: "Technical Interview", icon: Code2, duration: "45 mins", focus: "Basic Data Structures, OOPs, DBMS, and core languages.", prep: "Be ready to write pseudo-code or basic SQL queries on paper. Thoroughly revise OOPs concepts." },
      { name: "HR Interview", icon: Users, duration: "20 mins", focus: "Behavioral questions, company fit, and communication skills.", prep: "Prepare your introduction, willingness to relocate, and basic knowledge about the company's recent news." }
    ];
  } else if (company.tier === "Product" || company.tier === "Startup") {
    defaultRounds = [
      { name: "Machine Coding / OA", icon: Code2, duration: "90-120 mins", focus: "Medium/Hard Leetcode style questions or a mini-app.", prep: "Focus on edge-cases and clean code. If startup, expect to build an API or React component from scratch." },
      { name: "Technical Round 1", icon: Zap, duration: "60 mins", focus: "Advanced Data Structures & Algorithms, Problem Solving.", prep: "Graphs, DP, Trees. You must explain your time and space complexity clearly." },
      { name: "Technical Round 2", icon: Lightbulb, duration: "60 mins", focus: "System Design, Architecture, Core OS/Networking concepts.", prep: "HLD/LLD. Practice designing systems like URL shorteners or chat apps. Know your database indexing." },
      { name: "Managerial / HR", icon: Users, duration: "45 mins", focus: "Cultural fit, past projects deep dive, behavioral.", prep: "Use the STAR method for answering. Be ready to explain the hardest bug you've ever fixed." }
    ];
  } else {
    defaultRounds = [
      { name: "Online Screening", icon: FileText, duration: "70 mins", focus: "Platform specific coding challenge (2-3 questions).", prep: "Competitive programming speed required. Focus on Arrays, Strings, and HashMap optimizations." },
      { name: "Data Structures & Algos", icon: Code2, duration: "45 mins x 2", focus: "Rigorous whiteboarding sessions.", prep: "Do not just write code; think out loud. Interviewers care about your approach as much as the solution." },
      { name: "System Design", icon: Lightbulb, duration: "60 mins", focus: "Scalable architecture design for complex systems.", prep: "CAP Theorem, Load Balancing, Sharding, Microservices. Drive the conversation." },
      { name: "Leadership / Behavioral", icon: Users, duration: "45 mins", focus: "Deep dive into leadership principles and cultural fit.", prep: "Strict adherence to company-specific principles (e.g., Amazon LPs). Have 5-6 adaptable stories ready." }
    ];
  }

  const [dynamicRounds, setDynamicRounds] = useState<any[]>([]);
  const [isLoadingRounds, setIsLoadingRounds] = useState(false);

  useEffect(() => {
    let active = true;
    setDynamicRounds([]);
    setIsLoadingRounds(true);
    
    fetch('/api/career/prep-rounds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: company.name,
        tier: company.tier,
        userSkills: userSkills
      })
    })
    .then(res => res.json())
    .then(data => {
      if (active && Array.isArray(data) && data.length > 0) {
        // Map icons appropriately
        const aiRounds = data.map((r, i) => ({
          ...r,
          icon: i === 0 ? FileText : i === data.length - 1 ? Users : Code2
        }));
        setDynamicRounds(aiRounds);
      }
    })
    .catch(console.error)
    .finally(() => {
      if (active) setIsLoadingRounds(false);
    });

    return () => { active = false; };
  }, [company.name, company.tier, userSkills]);

  const rounds = dynamicRounds.length > 0 ? dynamicRounds : defaultRounds;

  return (
    <Card variant="default" className="w-full relative z-10 flex flex-col pb-6 !p-0 !bg-transparent !border-none !shadow-none">
      
      {/* Header */}
      <div className="pb-6 flex flex-col xl:flex-row gap-6 items-start xl:items-end justify-between px-2 pt-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-[12px] font-semibold tracking-wide",
              company.tier === "FAANG" ? "text-[#0a84ff]" :
              company.tier === "Product" ? "text-[#0a84ff]" :
              company.tier === "Startup" ? "text-[#ff9f0a]" :
              "text-[#34c759]"
            )}>{company.tier} Target</span>
          </div>
          <h3 className="text-[34px] font-bold text-foreground tracking-tight leading-none">{company.name}</h3>
          <p className="text-foreground-muted text-[15px] mt-1">Intelligence & Prep Guide</p>
        </div>

        <Button 
          variant="ghost"
          size="sm"
          onClick={() => setExportModalOpen(true)}
          className="w-full sm:w-auto text-foreground-muted hover:text-foreground"
        >
          <Download size={14} className="mr-1.5" /> Export
        </Button>
      </div>

      <div className="flex flex-col gap-8">
        
        {/* Profile Stats & Metrics Accordion */}
        <Card variant="default" className="flex flex-col !p-0 transition-all duration-300">
          <button 
            onClick={() => setStatsExpanded(!statsExpanded)}
            className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors outline-none"
          >
            <div className="flex items-center gap-4 text-foreground">
              <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center shadow-sm shadow-brand/20">
                <BarChart3 size={16} className="text-black" />
              </div>
              <span className="font-medium text-[15px]">Profile Health Metrics</span>
            </div>
            <div className="flex items-center gap-2">
              {!statsExpanded && <span className="text-[15px] text-foreground-muted">View</span>}
              <ChevronDown size={16} className={cn("text-foreground-muted transition-transform duration-300", statsExpanded && "rotate-180")} />
            </div>
          </button>
          
          <AnimatePresence initial={false}>
            {statsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0, filter: "blur(8px)" }}
                animate={{ height: "auto", opacity: 1, filter: "blur(0px)" }}
                exit={{ height: 0, opacity: 0, filter: "blur(8px)" }}
                transition={{ 
                  height: { type: "spring", stiffness: 350, damping: 30, mass: 1 },
                  opacity: { duration: 0.2 },
                  filter: { duration: 0.2 }
                }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pt-0">
                  <div className="h-px w-full bg-white/[0.05] mb-4" />
                  <div className="flex flex-col md:flex-row items-stretch divide-y md:divide-y-0 md:divide-x divide-white/[0.05] bg-background/20 rounded-[14px] overflow-hidden">
                    <PlacementHealthMeter readinessScore={readinessScore} averageEligibility={averageEligibility} />
                    <TopperBenchmark userCgpa={userCgpa} userCredits={userCredits} userSkillsCount={userSkills.length} branch={branch} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
        
        {/* 1. Live Profile vs Company Diff */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[13px] font-semibold text-foreground-muted uppercase tracking-wider">Profile Match</h4>
            <div className="flex items-center gap-2">
              {(!passesCgpa || !passesBacklogs) && onOptimizeSandbox && (
                <button 
                  onClick={() => onOptimizeSandbox?.(Math.max(userCgpa, company.cgpaCutoff), Math.min(userBacklogs, company.maxBacklogs))}
                  className="flex items-center gap-1.5 bg-brand hover:bg-brand px-3 py-1 rounded-full transition-all"
                >
                  <Zap size={10} className="text-[#0a84ff]" />
                  <span className="text-[11px] font-semibold text-[#0a84ff]">Optimize</span>
                </button>
              )}
              {isSandboxActive && onResetSandbox && (
                <button 
                  onClick={onResetSandbox}
                  className="flex items-center gap-1.5 bg-surface-raised hover:bg-surface-overlay px-3 py-1 rounded-full transition-all"
                >
                  <RefreshCcw size={10} className="text-[#ff3b30]" />
                  <span className="text-[11px] font-semibold text-[#ff3b30]">Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* iOS Settings Grouped List */}
          <Card variant="default" className="flex flex-col !p-0">
            
            {/* CGPA Row */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.05]">
              <div className="flex items-center gap-4">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shadow-sm", passesCgpa ? "bg-brand shadow-brand/20" : "bg-[#ff3b30] shadow-[#ff3b30]/20")}>
                  {passesCgpa ? <CheckCircle2 size={16} className="text-black" /> : <XCircle size={16} className="text-black" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-medium text-foreground">CGPA Requirement</span>
                  <span className="text-[13px] text-foreground-muted">Min cutoff: {company.cgpaCutoff.toFixed(1)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn("text-[17px] font-bold", passesCgpa ? "text-brand" : "text-[#ff3b30]")}>{userCgpa.toFixed(2)}</span>
              </div>
            </div>

            {/* Backlogs Row */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.05]">
              <div className="flex items-center gap-4">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shadow-sm", passesBacklogs ? "bg-brand shadow-brand/20" : "bg-[#ff3b30] shadow-[#ff3b30]/20")}>
                  {passesBacklogs ? <CheckCircle2 size={16} className="text-black" /> : <XCircle size={16} className="text-black" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-medium text-foreground">Active Backlogs</span>
                  <span className="text-[13px] text-foreground-muted">Max allowed: {company.maxBacklogs}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn("text-[17px] font-bold", passesBacklogs ? "text-brand" : "text-[#ff3b30]")}>{userBacklogs}</span>
              </div>
            </div>

            {/* Skills Match Row */}
            <div className="flex flex-col p-4 pt-5">
              <div className="text-[14px] font-bold text-foreground mb-3">Required Technical Stack</div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                {skillMatches.map((skill, idx) => {
                  if (skill.isMatched) {
                    return (
                      <span key={skill.name} className="text-[13px] text-foreground-muted font-medium">
                        {skill.name}
                      </span>
                    );
                  }
                  
                  return (
                    <button 
                      key={skill.name}
                      onClick={onNavigateToSkills}
                      className="text-[13px] text-[#ff3b30] font-medium hover:text-[#ff3b30]/80 transition-all cursor-pointer text-left outline-none"
                    >
                      {skill.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* 2. Interactive Prep Journey */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 px-2">
            <h4 className="text-[13px] font-semibold text-foreground-muted uppercase tracking-wider">Interview Process</h4>
            {isLoadingRounds && <Loader2 size={12} className="animate-spin text-[#0a84ff]" />}
          </div>
          
          <Card variant="default" className="flex flex-col !p-0">
            {rounds.map((round, i) => {
              const isExpanded = expandedRound === i;
              
              return (
                <div key={i} className={cn(
                  "flex flex-col transition-all",
                  i !== rounds.length - 1 && "border-b border-white/[0.05]"
                )}>
                  <button 
                    className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors outline-none"
                    onClick={() => setExpandedRound(isExpanded ? null : i)}
                  >
                    <div className="flex items-center gap-4 text-foreground">
                      <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center shrink-0 shadow-sm shadow-brand/20">
                        <round.icon size={16} className="text-black" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-[15px] font-medium">{round.name}</span>
                        <span className="text-[13px] text-foreground-muted">{round.duration}</span>
                      </div>
                    </div>
                    <ChevronDown size={16} className={cn("text-foreground-muted transition-transform duration-300", isExpanded && "rotate-180")} />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, filter: "blur(8px)" }}
                        animate={{ height: "auto", opacity: 1, filter: "blur(0px)" }}
                        exit={{ height: 0, opacity: 0, filter: "blur(8px)" }}
                        transition={{ 
                          height: { type: "spring", stiffness: 350, damping: 30, mass: 1 },
                          opacity: { duration: 0.2 },
                          filter: { duration: 0.2 }
                        }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-0 flex flex-col gap-3 ml-[48px]">
                          <div className="flex flex-col">
                            <span className="text-[13px] font-medium text-foreground mb-1">Focus Area</span>
                            <span className="text-[14px] text-foreground-muted leading-relaxed">{round.focus}</span>
                          </div>
                          
                          <div className="flex flex-col bg-surface-raised border-l-2 border-brand/50 rounded-r-xl p-4 mt-2">
                            <div className="flex items-center gap-2 mb-3">
                               <Lightbulb size={14} className="text-brand" />
                               <span className="text-[13px] font-bold text-foreground uppercase tracking-wider">AI Prep Strategy</span>
                            </div>
                            <ul className="flex flex-col gap-2.5">
                              {round.prep.split('. ').filter(Boolean).map((sentence: string, idx: number) => {
                                const cleanSentence = sentence.trim() + (sentence.trim().endsWith('.') ? '' : '.');
                                return (
                                  <li key={idx} className="flex items-start gap-2.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand/60 mt-2 shrink-0" />
                                    <span className="text-[14px] text-foreground-muted leading-relaxed">{cleanSentence}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </Card>
        </div>

      </div>
      
      <ExportPlanModal 
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        companies={[company]}
        userCgpa={userCgpa}
        userBacklogs={userBacklogs}
        userSkills={userSkills}
      />
    </Card>
  );
}
