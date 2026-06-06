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
}

export default function CompanyComparisonGuide({ pinnedCompanies, userCgpa, userBacklogs, userSkills, readinessScore = 0, averageEligibility = 0, userCredits = 0, branch = "Computer Science", isSandboxActive, onOptimizeSandbox, onResetSandbox }: GuideProps) {
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
    <div className="w-full mt-8 rounded-[32px] overflow-hidden relative z-10 flex flex-col border border-white/[0.08] bg-[#1c1c1e] shadow-2xl pb-6">
      
      {/* Header */}
      <div className="p-6 md:p-8 bg-gradient-to-b from-white/[0.05] to-transparent border-b border-white/[0.05] flex flex-col 2xl:flex-row gap-5 items-start 2xl:items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Target className="text-[#0a84ff]" size={24} />
            <h3 className="text-2xl font-bold text-white tracking-tight">Side-by-Side Matrix</h3>
          </div>
          <p className="text-[#86868b] text-sm">Comparing {companies.length} target companies simultaneously.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Global Bulk Optimize Sandbox */}
          {needsGlobalOptimization && onOptimizeSandbox && (
            <button 
              onClick={() => onOptimizeSandbox?.(Math.max(userCgpa, maxCgpaNeeded), Math.min(userBacklogs, minBacklogsAllowed))}
              className="group flex items-center gap-2 bg-[#bf5af2]/10 hover:bg-[#bf5af2]/20 border border-[#bf5af2]/30 px-4 py-2 rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(191,90,242,0.4)]"
            >
              <Zap size={16} className="text-[#bf5af2] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-[#e0a8ff] tracking-wide">Bulk Optimize for All</span>
            </button>
          )}

          {isSandboxActive && onResetSandbox && (
            <button 
              onClick={onResetSandbox}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full transition-all duration-300"
            >
              <RefreshCcw size={16} className="text-[#ff453a]" />
              <span className="text-xs font-bold text-[#ff453a] tracking-wide">Reset to Reality</span>
            </button>
          )}

          {/* Export Plan Button */}
          <button 
            onClick={() => setExportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-all bg-white/10 rounded-full hover:bg-white/20 border border-white/10"
          >
            <Download size={16} /> Export Plan
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6 flex flex-col gap-6">
        
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

        {/* Stacked Accordions */}
        <div className="flex flex-col gap-4 mt-2">
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="flex flex-col border border-white/10 rounded-2xl bg-black/40 overflow-hidden"
              >
                {/* Accordion Header */}
                <button 
                  onClick={() => setOpenCompany(isOpen ? null : company.name)}
                  className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors text-left"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-bold text-white">{company.name}</h4>
                      <span className={cn(
                        "text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full",
                        company.tier === "FAANG" ? "bg-[#bf5af2]/20 text-[#e0a8ff]" :
                        company.tier === "Product" ? "bg-[#0a84ff]/20 text-[#8ab4f8]" :
                        company.tier === "Startup" ? "bg-[#ff9f0a]/20 text-[#ffd60a]" :
                        "bg-[#32d74b]/20 text-[#86efac]"
                      )}>{company.tier} Tier</span>
                    </div>
                    {passesCgpa && passesBacklogs ? (
                      <span className="text-xs font-bold text-[#32d74b] flex items-center gap-1"><CheckCircle2 size={12} /> Profile Aligned</span>
                    ) : (
                      <span className="text-xs font-bold text-[#ff453a] flex items-center gap-1"><AlertCircle size={12} /> Gap Detected</span>
                    )}
                  </div>
                  
                  <ChevronDown size={20} className={cn("text-white/40 transition-transform duration-300", isOpen && "rotate-180")} />
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
                      <div className="p-5 border-t border-white/5 flex flex-col gap-8 bg-[#1c1c1e]/50">
                        
                        {/* 1. Academic Strictness (Vertical) */}
                        <div className="flex flex-col gap-3">
                          <h5 className="text-xs font-bold text-white/50 tracking-widest uppercase mb-1">Academic Eligibility</h5>
                          
                          {/* CGPA */}
                          <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                            <div className="flex justify-between text-xs">
                              <span className="text-white/70 font-medium">CGPA Required: <span className="text-white">{company.cgpaCutoff}</span></span>
                              <span className={passesCgpa ? "text-[#32d74b] font-bold" : "text-[#ff453a] font-bold"}>{userCgpa.toFixed(2)} Current</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className={cn("h-full rounded-full transition-all duration-1000", passesCgpa ? "bg-[#32d74b]" : "bg-[#ff453a]")}
                                style={{ width: `${cgpaPercent}%` }}
                              />
                            </div>
                          </div>
                          
                          {/* Backlogs */}
                          <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-white/[0.02] border border-white/5">
                            <span className="text-white/70 font-medium">Active Backlogs (≤{company.maxBacklogs})</span>
                            {passesBacklogs ? (
                              <span className="text-[#32d74b] font-bold flex items-center gap-1"><CheckCircle2 size={12} /> Passing ({userBacklogs})</span>
                            ) : (
                              <span className="text-[#ff453a] font-bold flex items-center gap-1"><XCircle size={12} /> Failing ({userBacklogs})</span>
                            )}
                          </div>
                        </div>

                        {/* 2. Skills Checklist (Vertical) */}
                        {reqSkills.length > 0 && (
                          <div className="flex flex-col gap-3">
                            <h5 className="text-xs font-bold text-white/50 tracking-widest uppercase mb-1">Technical Skills Required</h5>
                            <div className="flex flex-col gap-2">
                              {reqSkills.map(skill => {
                                const hasSkill = normalizedUserSkills.some(s => s.includes(skill.toLowerCase()) || skill.toLowerCase().includes(s));
                                return (
                                  <div key={skill} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                    {hasSkill ? <CheckCircle2 size={16} className="text-[#32d74b]" /> : <XCircle size={16} className="text-[#ff453a]" />}
                                    <span className={cn("text-sm font-medium", hasSkill ? "text-white" : "text-white/50")}>{skill}</span>
                                    {!hasSkill && <span className="ml-auto text-[10px] font-bold px-2 py-0.5 bg-[#ff453a]/10 text-[#ff453a] border border-[#ff453a]/20 rounded-full uppercase tracking-wider">Missing</span>}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* 3. Interactive Prep Journey */}
                        <div className="flex flex-col gap-3">
                          <h5 className="text-xs font-bold text-white/50 tracking-widest uppercase mb-2">Interactive Prep Journey</h5>
                          <div className="flex flex-col relative">
                            {/* Connecting line */}
                            <div className="absolute left-[23px] top-6 bottom-6 w-px bg-gradient-to-b from-white/10 via-white/10 to-transparent" />
                            
                            {rounds.map((round, i) => {
                              const roundId = `${company.name}-round-${i}`;
                              const isExpanded = expandedRoundId === roundId;
                              
                              return (
                                <div key={i} className="flex gap-4 relative mb-3">
                                  <div className="w-12 h-12 rounded-full bg-[#1c1c1e] border-4 border-[#1c1c1e] z-10 flex items-center justify-center shrink-0 mt-2">
                                    <div className={cn(
                                      "w-full h-full rounded-full flex items-center justify-center transition-all duration-300 border",
                                      isExpanded 
                                        ? company.tier === "FAANG" ? "bg-[#bf5af2]/10 border-[#bf5af2]/30 text-[#e0a8ff]" : 
                                          company.tier === "Product" ? "bg-[#0a84ff]/10 border-[#0a84ff]/30 text-[#8ab4f8]" : 
                                          "bg-[#32d74b]/10 border-[#32d74b]/30 text-[#86efac]"
                                        : "bg-[#2c2c2e] border-transparent text-white/40"
                                    )}>
                                      <round.icon size={16} />
                                    </div>
                                  </div>
                                  
                                  <div 
                                    className={cn(
                                      "flex-1 bg-black/40 rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300",
                                      isExpanded 
                                        ? company.tier === "FAANG" ? "border-[#bf5af2]/30 shadow-[0_0_20px_rgba(191,90,242,0.1)]" : 
                                          company.tier === "Product" ? "border-[#0a84ff]/30 shadow-[0_0_20px_rgba(10,132,255,0.1)]" : 
                                          "border-[#32d74b]/30 shadow-[0_0_20px_rgba(50,215,75,0.1)]"
                                        : "border-white/5 hover:bg-black/60 hover:border-white/10"
                                    )}
                                    onClick={() => setExpandedRoundId(isExpanded ? null : roundId)}
                                  >
                                    <div className="p-4 flex items-center justify-between">
                                      <div className="flex flex-col">
                                        <div className={cn(
                                          "text-[10px] font-black tracking-widest uppercase mb-1",
                                          company.tier === "FAANG" ? "text-[#bf5af2]" : company.tier === "Product" ? "text-[#0a84ff]" : "text-[#32d74b]"
                                        )}>Round {i + 1}</div>
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
                                              <BookOpen size={14} className={cn(
                                                "mt-0.5 shrink-0",
                                                company.tier === "FAANG" ? "text-[#bf5af2]" : company.tier === "Product" ? "text-[#0a84ff]" : "text-[#32d74b]"
                                              )} />
                                              <div className="flex flex-col">
                                                <span className={cn(
                                                  "text-[10px] uppercase tracking-wider font-bold",
                                                  company.tier === "FAANG" ? "text-[#bf5af2]" : company.tier === "Product" ? "text-[#0a84ff]" : "text-[#32d74b]"
                                                )}>Prep Strategy</span>
                                                <span className={cn(
                                                  "text-xs font-medium leading-relaxed",
                                                  company.tier === "FAANG" ? "text-[#e0a8ff]" : company.tier === "Product" ? "text-[#8ab4f8]" : "text-[#86efac]"
                                                )}>{round.prep}</span>
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

                        {/* 4. Strategic Action Plan (To-Do List) */}
                        <div className="flex flex-col gap-3 mt-2">
                          <h5 className="text-xs font-bold text-white/50 tracking-widest uppercase mb-1">Strategic Action Plan</h5>
                          
                          {actionItems.length > 0 ? (
                            <div className="flex flex-col gap-3">
                              {actionItems.map((item, i) => (
                                <Link key={i} href={item.actionLink} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col gap-1 relative overflow-hidden group hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300">
                                   <div className={cn(
                                     "absolute top-0 left-0 w-1 h-full",
                                     item.priority === "CRITICAL" ? "bg-[#ff453a]" : item.priority === "HIGH" ? "bg-[#ff9f0a]" : "bg-[#0a84ff]"
                                   )} />
                                   <div className="flex items-center justify-between mb-1">
                                     <span className={cn(
                                       "text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                                       item.priority === "CRITICAL" ? "bg-[#ff453a]/20 text-[#ff453a]" :
                                       item.priority === "HIGH" ? "bg-[#ff9f0a]/20 text-[#ff9f0a]" :
                                       "bg-[#0a84ff]/20 text-[#0a84ff]"
                                     )}>
                                       {item.priority} Priority
                                     </span>
                                     <ArrowRight size={14} className={cn(
                                       "opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300",
                                       item.priority === "CRITICAL" ? "text-[#ff453a]" : item.priority === "HIGH" ? "text-[#ff9f0a]" : "text-[#0a84ff]"
                                     )} />
                                   </div>
                                   <h6 className="text-sm font-bold text-white group-hover:text-white transition-colors">{item.title}</h6>
                                   <p className="text-xs text-white/60 font-medium leading-relaxed">{item.desc}</p>
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <div className="p-6 rounded-xl border border-[#32d74b]/20 bg-[#32d74b]/5 flex flex-col gap-2 items-center justify-center text-center">
                               <div className="w-10 h-10 rounded-full bg-[#32d74b]/20 flex items-center justify-center mb-2">
                                 <CheckCircle2 size={24} className="text-[#32d74b]" />
                               </div>
                               <h6 className="text-sm font-bold text-white">Target Achieved</h6>
                               <p className="text-xs text-white/60">You meet all eligibility and skill requirements! Focus 100% on Interview prep.</p>
                            </div>
                          )}
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
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
