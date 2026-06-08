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
  onResetSandbox
}: GuideProps) {
  const [expandedRound, setExpandedRound] = useState<number | null>(0);
  const [statsExpanded, setStatsExpanded] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  if (!pinnedCompany) {
    return (
      <div className="w-full mt-8 rounded-[32px] overflow-hidden relative z-10 flex flex-col h-[500px] border border-white/[0.04] bg-[#000000]">
        <div className="absolute inset-0 opacity-40">
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
    <div className="w-full mt-8 rounded-[32px] overflow-hidden relative z-10 flex flex-col border border-white/[0.08] bg-[#1c1c1e] shadow-2xl pb-6">
      
      {/* Header */}
      <div className="p-6 md:p-8 bg-gradient-to-b from-white/[0.05] to-transparent border-b border-white/[0.05] flex flex-col xl:flex-row gap-5 items-start xl:items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <Target className="text-[#bf5af2]" size={24} />
            <h3 className="text-2xl font-bold text-white tracking-tight">{company.name}</h3>
            <span className={cn(
              "ml-2 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full",
              company.tier === "FAANG" ? "bg-[#bf5af2]/20 text-[#e0a8ff]" :
              company.tier === "Product" ? "bg-[#0a84ff]/20 text-[#8ab4f8]" :
              company.tier === "Startup" ? "bg-[#ff9f0a]/20 text-[#ffd60a]" :
              "bg-[#32d74b]/20 text-[#86efac]"
            )}>{company.tier} Tier</span>
          </div>
          <p className="text-[#86868b] text-sm">Actionable Intelligence & Prep Journey</p>
        </div>

        <button 
          onClick={() => setExportModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-all bg-white/10 rounded-full hover:bg-white/20 border border-white/10 w-full sm:w-auto"
        >
          <Download size={16} /> Export Plan
        </button>
      </div>

      <div className="p-6 md:p-8 flex flex-col gap-10">
        
        {/* Profile Stats & Metrics Accordion */}
        <div className="flex flex-col border border-white/10 rounded-2xl bg-[#2c2c2e]/50 overflow-hidden">
          <button 
            onClick={() => setStatsExpanded(!statsExpanded)}
            className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2 text-white">
              <BarChart3 size={18} className="text-[#0a84ff]" />
              <span className="font-semibold text-sm">Profile Stats & Health Metrics</span>
            </div>
            <ChevronDown size={18} className={cn("text-white/40 transition-transform duration-300", statsExpanded && "rotate-180")} />
          </button>
          
          <AnimatePresence>
            {statsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-4 border-t border-white/10 flex flex-col gap-6">
                  <PlacementHealthMeter readinessScore={readinessScore} averageEligibility={averageEligibility} />
                  <TopperBenchmark userCgpa={userCgpa} userCredits={userCredits} userSkillsCount={userSkills.length} branch={branch} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* 1. Live Profile vs Company Diff */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-black tracking-widest uppercase text-white/50">Profile Match Analysis</h4>
            <div className="flex items-center gap-2">
              {(!passesCgpa || !passesBacklogs) && onOptimizeSandbox && (
                <button 
                  onClick={() => onOptimizeSandbox?.(Math.max(userCgpa, company.cgpaCutoff), Math.min(userBacklogs, company.maxBacklogs))}
                  className="group flex items-center gap-1.5 bg-[#bf5af2]/10 hover:bg-[#bf5af2]/20 border border-[#bf5af2]/30 px-3 py-1.5 rounded-full transition-all duration-300 hover:shadow-[0_0_15px_rgba(191,90,242,0.3)]"
                >
                  <Zap size={12} className="text-[#bf5af2] group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold text-[#e0a8ff] tracking-wide">Optimize Sandbox</span>
                </button>
              )}
              {isSandboxActive && onResetSandbox && (
                <button 
                  onClick={onResetSandbox}
                  className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full transition-all duration-300"
                >
                  <RefreshCcw size={12} className="text-[#ff453a]" />
                  <span className="text-[10px] font-bold text-[#ff453a] tracking-wide">Reset</span>
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            
            {/* CGPA Match */}
            <div className={cn(
              "p-4 rounded-2xl border transition-colors duration-500",
              passesCgpa ? "bg-[#32d74b]/5 border-[#32d74b]/20" : "bg-[#ff453a]/5 border-[#ff453a]/20"
            )}>
              <div className="flex justify-between items-start mb-2">
                <div className="text-xs font-medium text-[#86868b]">CGPA Cutoff: <span className="text-white">{company.cgpaCutoff.toFixed(1)}</span></div>
                {passesCgpa ? <CheckCircle2 size={16} className="text-[#32d74b]" /> : <XCircle size={16} className="text-[#ff453a]" />}
              </div>
              <div className="flex items-baseline gap-2">
                <span className={cn("text-2xl font-bold", passesCgpa ? "text-[#32d74b]" : "text-[#ff453a]")}>{userCgpa.toFixed(2)}</span>
                <span className="text-xs text-white/40">Current</span>
              </div>
              {!passesCgpa && <div className="text-[10px] text-[#ff453a]/80 mt-1">Delta: -{(company.cgpaCutoff - userCgpa).toFixed(2)} pts</div>}
            </div>

            {/* Backlogs Match */}
            <div className={cn(
              "p-4 rounded-2xl border transition-colors duration-500",
              passesBacklogs ? "bg-[#32d74b]/5 border-[#32d74b]/20" : "bg-[#ff453a]/5 border-[#ff453a]/20"
            )}>
              <div className="flex justify-between items-start mb-2">
                <div className="text-xs font-medium text-[#86868b]">Max Backlogs: <span className="text-white">{company.maxBacklogs}</span></div>
                {passesBacklogs ? <CheckCircle2 size={16} className="text-[#32d74b]" /> : <XCircle size={16} className="text-[#ff453a]" />}
              </div>
              <div className="flex items-baseline gap-2">
                <span className={cn("text-2xl font-bold", passesBacklogs ? "text-[#32d74b]" : "text-[#ff453a]")}>{userBacklogs}</span>
                <span className="text-xs text-white/40">Active</span>
              </div>
              {!passesBacklogs && <div className="text-[10px] text-[#ff453a]/80 mt-1">Clear {userBacklogs - company.maxBacklogs} immediately</div>}
            </div>

            {/* Skills Match */}
            <div className="p-4 rounded-2xl border border-white/5 bg-black/30 col-span-2">
              <div className="text-xs font-medium text-[#86868b] mb-3">Required Technical Stack</div>
              <div className="flex flex-wrap gap-2">
                {skillMatches.map(skill => (
                  <div key={skill.name} className={cn(
                    "flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-md border",
                    skill.isMatched 
                      ? "bg-[#32d74b]/10 text-[#32d74b] border-[#32d74b]/20" 
                      : "bg-[#ff453a]/10 text-[#ff453a] border-[#ff453a]/20"
                  )}>
                    {skill.isMatched ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                    {skill.name}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* 2. Interactive Prep Journey */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <h4 className="text-[11px] font-black tracking-widest uppercase text-white/50">Interactive Prep Journey</h4>
            {isLoadingRounds && <Loader2 size={12} className="animate-spin text-[#0a84ff]" />}
          </div>
          <div className="flex flex-col gap-3 relative">
            {/* Connecting line */}
            <div className="absolute left-[23px] top-6 bottom-6 w-px bg-gradient-to-b from-white/10 via-white/10 to-transparent" />
            
            {rounds.map((round, i) => {
              const isExpanded = expandedRound === i;
              
              return (
                <div key={i} className="flex gap-4 relative">
                  <div className="w-12 h-12 rounded-full bg-[#1c1c1e] border-4 border-[#1c1c1e] z-10 flex items-center justify-center shrink-0 mt-2">
                    <div className={cn(
                      "w-full h-full rounded-full flex items-center justify-center transition-all duration-300 border",
                      isExpanded ? "bg-[#bf5af2]/10 border-[#bf5af2]/30 text-[#e0a8ff]" : "bg-[#2c2c2e] border-transparent text-white/40"
                    )}>
                      <round.icon size={16} />
                    </div>
                  </div>
                  
                  <div 
                    className={cn(
                      "flex-1 bg-black/40 rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300",
                      isExpanded ? "border-[#bf5af2]/30 shadow-[0_0_20px_rgba(191,90,242,0.1)]" : "border-white/5 hover:bg-black/60 hover:border-white/10"
                    )}
                    onClick={() => setExpandedRound(isExpanded ? null : i)}
                  >
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="text-[10px] font-black tracking-widest uppercase text-[#bf5af2] mb-1">Round {i + 1}</div>
                        <div className="text-sm font-bold text-white">{round.name}</div>
                      </div>
                      <ChevronDown size={16} className={cn("text-white/30 transition-transform duration-300", isExpanded && "rotate-180")} />
                    </div>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <div className="px-4 pb-4 pt-1 flex flex-col gap-4">
                            <div className="h-px w-full bg-white/5" />
                            
                            <div className="flex gap-4 items-start">
                              <Clock size={14} className="text-[#86868b] mt-0.5 shrink-0" />
                              <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider text-[#86868b] font-bold">Duration</span>
                                <span className="text-xs text-white/90 font-medium">{round.duration}</span>
                              </div>
                            </div>
                            
                            <div className="flex gap-4 items-start">
                              <Target size={14} className="text-[#86868b] mt-0.5 shrink-0" />
                              <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider text-[#86868b] font-bold">Focus Area</span>
                                <span className="text-xs text-white/90 font-medium leading-relaxed">{round.focus}</span>
                              </div>
                            </div>
                            
                            <div className="flex gap-4 items-start">
                              <BookOpen size={14} className="text-[#bf5af2] mt-0.5 shrink-0" />
                              <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider text-[#bf5af2] font-bold">Prep Strategy</span>
                                <span className="text-xs text-[#e0a8ff] font-medium leading-relaxed">{round.prep}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
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
