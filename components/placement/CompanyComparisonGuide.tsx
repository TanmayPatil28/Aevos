"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Target, CheckCircle2, XCircle, Zap, AlertCircle, BarChart3, ChevronDown, Download, RefreshCcw, FileText, Code2, Users, Lightbulb, Clock, BookOpen, ArrowRight } from "lucide-react";
import { DEFAULT_RECRUITERS } from "@/lib/career/careerData";
import PlacementHealthMeter from "./PlacementHealthMeter";
import TopperBenchmark from "./TopperBenchmark";
import ExportPlanModal from "./ExportPlanModal";
import { cn } from "@/lib/cn";
import Card from "@/components/ui/Card";

interface GuideProps {
  pinnedCompanies: string[];
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

export default function CompanyComparisonGuide({ pinnedCompanies, userCgpa, userBacklogs, userSkills, readinessScore = 0, averageEligibility = 0, userCredits = 0, branch = "Computer Science", isSandboxActive, onOptimizeSandbox, onResetSandbox, onNavigateToSkills }: GuideProps) {
  const [statsExpanded, setStatsExpanded] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [openCompany, setOpenCompany] = useState<string | null>(null);
  const [expandedRoundId, setExpandedRoundId] = useState<string | null>(null);
  if (pinnedCompanies.length < 2) return null;

  const companies = pinnedCompanies
    .map(name => DEFAULT_RECRUITERS.find(c => c.name === name))
    .filter((c): c is NonNullable<typeof c> => !!c);

  // Calculate global minimums needed to unlock all
  const maxCgpaNeeded = Math.max(...companies.map(c => c.cgpaCutoff));
  const minBacklogsAllowed = Math.min(...companies.map(c => c.maxBacklogs));

  // Does the user have a gap for ANY of the pinned companies?
  const needsGlobalOptimization = userCgpa < maxCgpaNeeded || userBacklogs > minBacklogsAllowed;

  return (
    <div className="w-full mt-8 rounded-[24px] overflow-hidden relative z-10 flex flex-col bg-transparent pb-6">
      
      {/* Header */}
      <div className="p-6 md:p-8 flex flex-col 2xl:flex-row gap-5 items-start 2xl:items-center justify-between">
        <div>
          <h3 className="text-[20px] font-bold text-foreground tracking-tight mb-1">Side-by-Side Matrix</h3>
          <p className="text-foreground-muted text-[14px]">Comparing {companies.length} target companies simultaneously.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Global Bulk Optimize Sandbox */}
          {needsGlobalOptimization && onOptimizeSandbox && (
            <button 
              onClick={() => onOptimizeSandbox?.(Math.max(userCgpa, maxCgpaNeeded), Math.min(userBacklogs, minBacklogsAllowed))}
              className="flex items-center gap-2 bg-white hover:bg-white/90 px-5 py-2.5 rounded-full transition-colors text-[13px]"
            >
              <Zap size={16} className="text-black fill-black" />
              <span className="font-bold text-black tracking-tight">Bulk Optimize for All</span>
            </button>
          )}

          {isSandboxActive && onResetSandbox && (
            <button 
              onClick={onResetSandbox}
              className="flex items-center gap-2 bg-status-critical hover:bg-status-critical text-[#ff3b30] px-5 py-2.5 rounded-full transition-colors text-[13px]"
            >
              <RefreshCcw size={16} />
              <span className="font-bold tracking-tight">Reset to Reality</span>
            </button>
          )}

          {/* Export Plan Button */}
          <button 
            onClick={() => setExportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-brand transition-colors hover:text-brand/80 rounded-lg hover:bg-white/[0.05]"
          >
            <Download size={14} /> Export Plan
          </button>
        </div>
      </div>

      <div className="flex flex-col">
        <Card variant="default" className="flex flex-col !p-0">
        
        {/* Profile Stats & Metrics Accordion */}
        <div className="flex flex-col border-b border-white/[0.05] overflow-hidden transition-colors hover:bg-white/[0.02]">
          <button 
            onClick={() => setStatsExpanded(!statsExpanded)}
            className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3 text-foreground">
              <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center shadow-sm shadow-brand/20">
                <BarChart3 size={16} className="text-black" />
              </div>
              <span className="font-bold text-[14px]">Profile Stats & Health Metrics</span>
            </div>
            <ChevronDown size={18} className={cn("text-foreground-muted transition-transform duration-300", statsExpanded && "rotate-180")} />
          </button>
          
          <AnimatePresence>
            {statsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="border-t border-white/[0.05] grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.05]">
                  <PlacementHealthMeter readinessScore={readinessScore} averageEligibility={averageEligibility} />
                  <TopperBenchmark userCgpa={userCgpa} userCredits={userCredits} userSkillsCount={userSkills.length} branch={branch} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stacked Accordions */}
        <div className="flex flex-col">
          {companies.map((company, index) => {
            const isOpen = openCompany === company.name;
            const passesCgpa = userCgpa >= company.cgpaCutoff;
            const passesBacklogs = userBacklogs <= company.maxBacklogs;
            const cgpaPercent = Math.min(100, Math.max(0, (userCgpa / company.cgpaCutoff) * 100));
            
            const reqSkills = company.requiredSkills || [];
            const normalizedUserSkills = userSkills.map(s => s.toLowerCase().trim());
            const missingSkills = reqSkills.filter(skill => !normalizedUserSkills.some(s => s.includes(skill.toLowerCase()) || skill.toLowerCase().includes(s)));

            let rounds: { name: string, icon: any, duration: string, focus: string, prep: string }[] = [];
            if (company.tier === "Service") {
              rounds = [
                { 
                  name: "Aptitude & Logic", 
                  icon: FileText, 
                  duration: "90 mins",
                  focus: "Quantitative Aptitude, Logical Reasoning, Verbal Ability.",
                  prep: "Practice basic math, pattern recognition, and English grammar. Speed and accuracy are key over deep technical knowledge."
                },
                { 
                  name: "Technical Basics", 
                  icon: Code2, 
                  duration: "45 mins",
                  focus: "Core CS subjects: OOPs, DBMS (SQL queries), Basic Java/C++ syntax.",
                  prep: "Review fundamental concepts. You don't need advanced DSA, just solid foundational understanding and theoretical clarity."
                },
                { 
                  name: "HR & Culture", 
                  icon: Users, 
                  duration: "30 mins",
                  focus: "Communication skills, relocation willingness, team fit.",
                  prep: "Be confident, polite, and express willingness to learn and adapt to new technologies. Have a solid 'Tell me about yourself' ready."
                }
              ];
            } else if (company.tier === "Product" || company.tier === "Startup") {
              rounds = [
                { 
                  name: "Machine Coding / DSA", 
                  icon: Code2, 
                  duration: "90 mins",
                  focus: "Medium-Hard LeetCode problems (Trees, Graphs, DP) or building a small feature.",
                  prep: "Focus on writing clean, executable code fast. Practice standard DSA patterns and Edge case handling."
                },
                { 
                  name: "System Design", 
                  icon: Lightbulb, 
                  duration: "60 mins",
                  focus: "Architecture, Scalability, Database Design.",
                  prep: "Practice High Level Design (HLD) for Products, and Low Level Design (LLD) for Startups (Class diagrams, Design patterns)."
                },
                { 
                  name: "Culture & Impact", 
                  icon: Users, 
                  duration: "45 mins",
                  focus: "Past projects, ownership, handling conflicts.",
                  prep: "Use the STAR method. Emphasize impact, technical challenges you overcame, and your ability to work autonomously."
                }
              ];
            } else {
              rounds = [
                { 
                  name: "Online Screening", 
                  icon: FileText, 
                  duration: "70 mins",
                  focus: "Platform specific coding challenge (2-3 questions).",
                  prep: "Competitive programming speed required. Focus on Arrays, Strings, and HashMap optimizations."
                },
                { 
                  name: "Data Structures & Algos", 
                  icon: Code2, 
                  duration: "45 mins x 2",
                  focus: "Rigorous whiteboarding sessions.",
                  prep: "Do not just write code; think out loud. Interviewers care about your approach as much as the solution."
                },
                { 
                  name: "System Architecture", 
                  icon: Lightbulb, 
                  duration: "60 mins",
                  focus: "Scalable architecture design for complex systems.",
                  prep: "CAP Theorem, Load Balancing, Sharding, Microservices. Drive the conversation."
                },
                { 
                  name: "Leadership / Behavioral", 
                  icon: Users, 
                  duration: "45 mins",
                  focus: "Deep dive into leadership principles and cultural fit.",
                  prep: "Strict adherence to company-specific principles. Have 5-6 adaptable stories ready."
                }
              ];
            }

            const actionItems = [];
            if (!passesBacklogs) {
              actionItems.push({
                 priority: "CRITICAL",
                 title: `Clear ${userBacklogs - company.maxBacklogs} Active Backlog(s)`,
                 desc: `Company allows max ${company.maxBacklogs} backlogs. Focus on clearing these before placement season.`,
                 actionLink: "/backlog"
              });
            }
            if (!passesCgpa) {
              actionItems.push({
                 priority: "HIGH",
                 title: `Boost CGPA by ${(company.cgpaCutoff - userCgpa).toFixed(2)} Points`,
                 desc: `Current CGPA is ${userCgpa.toFixed(2)}. You need a ${company.cgpaCutoff} to be eligible for the screening round.`,
                 actionLink: "/calculator"
              });
            }
            if (missingSkills.length > 0) {
              actionItems.push({
                 priority: "MEDIUM",
                 title: `Master ${missingSkills.length} Missing Skill(s)`,
                 desc: `You need to learn: ${missingSkills.join(", ")} to pass the technical rounds.`,
                 actionLink: "/placement"
              });
            }

            return (
              <motion.div 
                key={company.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className={cn("flex flex-col overflow-hidden transition-colors hover:bg-white/[0.02]", index !== companies.length - 1 && "border-b border-white/[0.05]")}
              >
                {/* Accordion Header */}
                <button 
                  onClick={() => setOpenCompany(isOpen ? null : company.name)}
                  className="flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors text-left"
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-3">
                      <h4 className="text-[16px] font-bold text-foreground tracking-tight">{company.name}</h4>
                      <span className="text-foreground-muted text-[10px] uppercase tracking-widest font-bold">
                        {company.tier} Tier
                      </span>
                    </div>
                    {passesCgpa && passesBacklogs ? (
                      <span className="text-[12px] font-bold text-brand flex items-center gap-2"><CheckCircle2 size={14} className="mr-0.5" /> Profile Aligned</span>
                    ) : (
                      <span className="text-[12px] font-bold text-[#ff3b30] flex items-center gap-2"><AlertCircle size={14} className="mr-0.5" /> Gap Detected</span>
                    )}
                  </div>
                  
                  <ChevronDown size={20} className={cn("text-foreground-muted transition-transform duration-300", isOpen && "rotate-180")} />
                </button>

                {/* Accordion Body (Expanded View) */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="p-6 flex flex-col gap-8">
                        
                        {/* 1. Academic Eligibility & Skills (Grouped List) */}
                        <div className="flex flex-col gap-3">
                          <h5 className="text-[11px] font-bold text-foreground-muted tracking-widest uppercase mb-1 px-2">Academic Eligibility</h5>
                          <Card variant="default" className="flex flex-col !p-0">
                            
                            {/* CGPA Row */}
                            <div className="flex items-center justify-between p-4 border-b border-white/[0.05]">
                              <div className="flex items-center gap-4">
                                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shadow-sm shrink-0", passesCgpa ? "bg-brand shadow-brand/20" : "bg-[#ff3b30] shadow-[#ff3b30]/20")}>
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
                                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shadow-sm shrink-0", passesBacklogs ? "bg-brand shadow-brand/20" : "bg-[#ff3b30] shadow-[#ff3b30]/20")}>
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
                            {reqSkills.length > 0 && (
                              <div className="flex flex-col p-4 pt-5">
                                <div className="text-[14px] font-bold text-foreground mb-3">Required Technical Stack</div>
                                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                                  {reqSkills.map(skill => {
                                    const hasSkill = normalizedUserSkills.some(s => s.includes(skill.toLowerCase()) || skill.toLowerCase().includes(s));
                                    
                                    if (hasSkill) {
                                      return (
                                        <span key={skill} className="text-[13px] text-foreground-muted font-medium">
                                          {skill}
                                        </span>
                                      );
                                    }
                                    
                                    return (
                                      <button 
                                        key={skill}
                                        onClick={onNavigateToSkills}
                                        className="text-[13px] text-[#ff3b30] font-medium hover:text-[#ff3b30]/80 transition-all cursor-pointer text-left outline-none"
                                      >
                                        {skill}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </Card>
                        </div>

                        {/* 2. Interactive Prep Journey */}
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-2 px-2">
                            <h4 className="text-[11px] font-bold text-foreground-muted uppercase tracking-widest">Interview Process</h4>
                          </div>
                          
                          <Card variant="default" className="flex flex-col !p-0">
                            {rounds.map((round, i) => {
                              const roundId = `${company.name}-round-${i}`;
                              const isExpanded = expandedRoundId === roundId;
                              
                              return (
                                <div key={i} className={cn(
                                  "flex flex-col transition-all",
                                  i !== rounds.length - 1 && "border-b border-white/[0.05]"
                                )}>
                                  <button 
                                    className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors outline-none"
                                    onClick={() => setExpandedRoundId(isExpanded ? null : roundId)}
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
        </Card>
      </div>

      <ExportPlanModal 
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        companies={companies}
        userCgpa={userCgpa}
        userBacklogs={userBacklogs}
        userSkills={userSkills}
      />
    </div>
  );
}
