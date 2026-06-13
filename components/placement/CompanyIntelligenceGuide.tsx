"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Code2, Users, Lightbulb, Zap, FileText, CheckCircle2, XCircle, ChevronDown, Clock, BookOpen, AlertCircle, BarChart3, Download, RefreshCcw, Loader2 } from "lucide-react";
import { DEFAULT_RECRUITERS } from "@/lib/career/careerData";
import FluidDataWave from "./FluidDataWave";
import PlacementHealthMeter from "./PlacementHealthMeter";
import TopperBenchmark from "./TopperBenchmark";
import ExportPlanModal from "./ExportPlanModal";
import { cn } from "@/lib/cn";

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
      <div className="w-full mt-8 relative z-10 flex flex-col pb-8 border-b border-[#23252a]/50">
        <div className="absolute inset-0 opacity-10">
           <FluidDataWave />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-20 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-2xl">
            <Target className="text-white/70" size={32} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Select a Target</h3>
          <p className="text-[#86868b] max-w-xs font-medium text-sm">Pin a company from the ledger to unlock its detailed hiring intelligence and selection process.</p>
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
    <div className="w-full relative z-10 flex flex-col pb-6">
      
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
          <h3 className="text-[34px] font-bold text-white tracking-tight leading-none">{company.name}</h3>
          <p className="text-[#86868b] text-[15px] mt-1">Intelligence & Prep Guide</p>
        </div>

        <button 
          onClick={() => setExportModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 text-[15px] font-medium text-[#0a84ff] bg-[#0a84ff]/10 hover:bg-[#0a84ff]/20 rounded-[14px] transition-all w-full sm:w-auto outline-none"
        >
          <Download size={16} /> Export
        </button>
      </div>

      <div className="flex flex-col gap-8">
        
        {/* Profile Stats & Metrics Accordion */}
        <div className="flex flex-col bg-[#1c1c1e] rounded-[20px] overflow-hidden transition-all duration-300">
          <button 
            onClick={() => setStatsExpanded(!statsExpanded)}
            className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors outline-none"
          >
            <div className="flex items-center gap-4 text-white">
              <div className="w-8 h-8 rounded-full bg-[#0a84ff] flex items-center justify-center">
                <BarChart3 size={16} className="text-white" />
              </div>
              <span className="font-medium text-[15px]">Profile Health Metrics</span>
            </div>
            <div className="flex items-center gap-2">
              {!statsExpanded && <span className="text-[15px] text-[#86868b]">View</span>}
              <ChevronDown size={16} className={cn("text-[#86868b] transition-transform duration-300", statsExpanded && "rotate-180")} />
            </div>
          </button>
          
          <AnimatePresence>
            {statsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="px-4 pb-4 pt-0">
                  <div className="h-px w-full bg-white/[0.05] mb-4" />
                  <div className="flex flex-col md:flex-row items-stretch divide-y md:divide-y-0 md:divide-x divide-white/[0.05] bg-black/20 rounded-[14px] overflow-hidden">
                    <PlacementHealthMeter readinessScore={readinessScore} averageEligibility={averageEligibility} />
                    <TopperBenchmark userCgpa={userCgpa} userCredits={userCredits} userSkillsCount={userSkills.length} branch={branch} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* 1. Live Profile vs Company Diff */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[13px] font-semibold text-[#86868b] uppercase tracking-wider">Profile Match</h4>
            <div className="flex items-center gap-2">
              {(!passesCgpa || !passesBacklogs) && onOptimizeSandbox && (
                <button 
                  onClick={() => onOptimizeSandbox?.(Math.max(userCgpa, company.cgpaCutoff), Math.min(userBacklogs, company.maxBacklogs))}
                  className="flex items-center gap-1.5 bg-[#0a84ff]/10 hover:bg-[#0a84ff]/20 px-3 py-1 rounded-full transition-all"
                >
                  <Zap size={10} className="text-[#0a84ff]" />
                  <span className="text-[11px] font-semibold text-[#0a84ff]">Optimize</span>
                </button>
              )}
              {isSandboxActive && onResetSandbox && (
                <button 
                  onClick={onResetSandbox}
                  className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full transition-all"
                >
                  <RefreshCcw size={10} className="text-[#ff3b30]" />
                  <span className="text-[11px] font-semibold text-[#ff3b30]">Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* iOS Settings Grouped List */}
          <div className="flex flex-col bg-[#1c1c1e] rounded-[20px] overflow-hidden">
            
            {/* CGPA Row */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.05]">
              <div className="flex items-center gap-4">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", passesCgpa ? "bg-[#34c759]" : "bg-[#ff3b30]")}>
                  {passesCgpa ? <CheckCircle2 size={18} className="text-white" /> : <XCircle size={18} className="text-white" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-medium text-white">CGPA Requirement</span>
                  <span className="text-[13px] text-[#86868b]">Min cutoff: {company.cgpaCutoff.toFixed(1)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[17px] text-[#86868b]">{userCgpa.toFixed(2)}</span>
              </div>
            </div>

            {/* Backlogs Row */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.05]">
              <div className="flex items-center gap-4">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", passesBacklogs ? "bg-[#34c759]" : "bg-[#ff3b30]")}>
                  {passesBacklogs ? <CheckCircle2 size={18} className="text-white" /> : <XCircle size={18} className="text-white" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-medium text-white">Active Backlogs</span>
                  <span className="text-[13px] text-[#86868b]">Max allowed: {company.maxBacklogs}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[17px] text-[#86868b]">{userBacklogs}</span>
              </div>
            </div>

            {/* Skills Match Row */}
            <div className="flex flex-col p-4">
              <div className="text-[15px] font-medium text-white mb-3">Required Technical Stack</div>
              <div className="flex flex-wrap gap-2">
                {skillMatches.map(skill => {
                  if (skill.isMatched) {
                    return (
                      <div key={skill.name} className="flex items-center gap-1.5 text-[13px] px-3 py-1.5 rounded-[10px] bg-[#34c759]/15 text-[#34c759] font-medium">
                        {skill.name}
                      </div>
                    );
                  }
                  
                  return (
                    <button 
                      key={skill.name}
                      onClick={onNavigateToSkills}
                      className="group flex items-center gap-1.5 text-[13px] px-3 py-1.5 rounded-[10px] bg-white/5 text-[#86868b] hover:bg-white/10 hover:text-white transition-all outline-none cursor-pointer"
                    >
                      {skill.name}
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#ff3b30]/10 text-[#ff3b30] rounded-full uppercase tracking-wider ml-1">Missing</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Interactive Prep Journey */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 px-2">
            <h4 className="text-[13px] font-semibold text-[#86868b] uppercase tracking-wider">Interview Process</h4>
            {isLoadingRounds && <Loader2 size={12} className="animate-spin text-[#0a84ff]" />}
          </div>
          
          <div className="flex flex-col bg-[#1c1c1e] rounded-[20px] overflow-hidden">
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
                    <div className="flex items-center gap-4 text-white">
                      <div className="w-8 h-8 rounded-full bg-[#0a84ff] flex items-center justify-center shrink-0">
                        <round.icon size={16} className="text-white" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-[15px] font-medium">{round.name}</span>
                        <span className="text-[13px] text-[#86868b]">{round.duration}</span>
                      </div>
                    </div>
                    <ChevronDown size={16} className={cn("text-[#86868b] transition-transform duration-300", isExpanded && "rotate-180")} />
                  </button>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-4 pb-4 pt-0 flex flex-col gap-3 ml-[48px]">
                          <div className="flex flex-col">
                            <span className="text-[13px] font-medium text-white mb-1">Focus Area</span>
                            <span className="text-[14px] text-[#86868b] leading-relaxed">{round.focus}</span>
                          </div>
                          
                          <div className="flex flex-col">
                            <span className="text-[13px] font-medium text-white mb-1">Prep Strategy</span>
                            <span className="text-[14px] text-[#0a84ff] leading-relaxed">{round.prep}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
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
    </div>
  );
}
