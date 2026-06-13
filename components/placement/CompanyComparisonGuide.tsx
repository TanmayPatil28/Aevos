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
    <div className="w-full mt-8 rounded-[24px] overflow-hidden relative z-10 flex flex-col border border-white/[0.04] bg-[#1c1c1e] pb-6">
      
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-white/[0.04] flex flex-col 2xl:flex-row gap-5 items-start 2xl:items-center justify-between">
        <div>
          <h3 className="text-[20px] font-bold text-white tracking-tight mb-1">Side-by-Side Matrix</h3>
          <p className="text-[#86868b] text-[14px]">Comparing {companies.length} target companies simultaneously.</p>
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
              className="flex items-center gap-2 bg-[#ff3b30]/10 hover:bg-[#ff3b30]/20 text-[#ff3b30] px-5 py-2.5 rounded-full transition-colors text-[13px]"
            >
              <RefreshCcw size={16} />
              <span className="font-bold tracking-tight">Reset to Reality</span>
            </button>
          )}

          {/* Export Plan Button */}
          <button 
            onClick={() => setExportModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-[13px] font-bold text-white transition-colors bg-white/10 rounded-full hover:bg-white/20"
          >
            <Download size={16} /> Export Plan
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6 flex flex-col gap-6">
        
        {/* Profile Stats & Metrics Accordion */}
        <div className="flex flex-col border border-white/[0.04] rounded-[16px] bg-white/[0.02] overflow-hidden">
          <button 
            onClick={() => setStatsExpanded(!statsExpanded)}
            className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3 text-white">
              <BarChart3 size={18} className="text-white" />
              <span className="font-bold text-[14px]">Profile Stats & Health Metrics</span>
            </div>
            <ChevronDown size={18} className={cn("text-[#86868b] transition-transform duration-300", statsExpanded && "rotate-180")} />
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="flex flex-col border border-white/[0.04] rounded-[16px] bg-[#1c1c1e] overflow-hidden"
              >
                {/* Accordion Header */}
                <button 
                  onClick={() => setOpenCompany(isOpen ? null : company.name)}
                  className="flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors text-left"
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-3">
                      <h4 className="text-[16px] font-bold text-white tracking-tight">{company.name}</h4>
                      <span className="bg-white/10 text-white text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full">
                        {company.tier} Tier
                      </span>
                    </div>
                    {passesCgpa && passesBacklogs ? (
                      <span className="text-[12px] font-bold text-[#34c759] flex items-center gap-1.5"><CheckCircle2 size={12} /> Profile Aligned</span>
                    ) : (
                      <span className="text-[12px] font-bold text-[#ff3b30] flex items-center gap-1.5"><AlertCircle size={12} /> Gap Detected</span>
                    )}
                  </div>
                  
                  <ChevronDown size={20} className={cn("text-[#86868b] transition-transform duration-300", isOpen && "rotate-180")} />
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
                        
                        {/* 1. Academic Strictness (Vertical) */}
                        <div className="flex flex-col gap-3">
                          <h5 className="text-[11px] font-bold text-[#86868b] tracking-widest uppercase mb-1">Academic Eligibility</h5>
                          
                          {/* CGPA */}
                          <div className="flex flex-col gap-2 p-4 rounded-[16px] bg-white/[0.02] border border-white/[0.04]">
                            <div className="flex justify-between text-[13px]">
                              <span className="text-[#86868b] font-medium">CGPA Required: <span className="text-white font-bold">{company.cgpaCutoff}</span></span>
                              <span className={passesCgpa ? "text-[#34c759] font-bold" : "text-[#ff3b30] font-bold"}>{userCgpa.toFixed(2)} Current</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                              <div 
                                className={cn("h-full rounded-full transition-all duration-1000", passesCgpa ? "bg-[#34c759]" : "bg-[#ff3b30]")}
                                style={{ width: `${cgpaPercent}%` }}
                              />
                            </div>
                          </div>
                          
                          {/* Backlogs */}
                          <div className="flex items-center justify-between text-[13px] p-4 rounded-[16px] bg-white/[0.02] border border-white/[0.04]">
                            <span className="text-[#86868b] font-medium">Active Backlogs (≤{company.maxBacklogs})</span>
                            {passesBacklogs ? (
                              <span className="text-[#34c759] font-bold flex items-center gap-1.5"><CheckCircle2 size={14} /> Passing ({userBacklogs})</span>
                            ) : (
                              <span className="text-[#ff3b30] font-bold flex items-center gap-1.5"><XCircle size={14} /> Failing ({userBacklogs})</span>
                            )}
                          </div>
                        </div>

                        {/* 2. Skills Checklist (Vertical) */}
                        {reqSkills.length > 0 && (
                          <div className="flex flex-col gap-3">
                            <h5 className="text-[11px] font-bold text-[#86868b] tracking-widest uppercase mb-1">Technical Skills Required</h5>
                            <div className="flex flex-col gap-2">
                              {reqSkills.map(skill => {
                                const hasSkill = normalizedUserSkills.some(s => s.includes(skill.toLowerCase()) || skill.toLowerCase().includes(s));
                                
                                if (hasSkill) {
                                  return (
                                    <div key={skill} className="flex items-center gap-3 p-3.5 rounded-[16px] bg-white/[0.02] border border-white/[0.04]">
                                      <CheckCircle2 size={18} className="text-[#34c759]" />
                                      <span className="text-[14px] font-medium tracking-tight text-white">{skill}</span>
                                    </div>
                                  );
                                }
                                
                                return (
                                  <button 
                                    key={skill} 
                                    onClick={onNavigateToSkills}
                                    className="group flex items-center gap-3 p-3.5 rounded-[16px] bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/10 transition-all text-left outline-none"
                                  >
                                    <XCircle size={18} className="text-[#ff3b30] shrink-0" />
                                    <span className="text-[14px] font-medium tracking-tight text-[#86868b] group-hover:text-white transition-colors">{skill}</span>
                                    <div className="ml-auto flex items-center gap-2">
                                      <span className="text-[10px] font-bold px-2.5 py-0.5 bg-[#ff3b30]/10 text-[#ff3b30] rounded-full uppercase tracking-wider">Missing</span>
                                      <ArrowRight size={14} className="text-[#86868b] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* 3. Interactive Prep Journey */}
                        <div className="flex flex-col gap-3">
                          <h5 className="text-[11px] font-bold text-[#86868b] tracking-widest uppercase mb-2">Interactive Prep Journey</h5>
                          <div className="flex flex-col relative">
                            {/* Connecting line */}
                            <div className="absolute left-[19px] top-6 bottom-6 w-px bg-white/[0.04]" />
                            
                            {rounds.map((round, i) => {
                              const roundId = `${company.name}-round-${i}`;
                              const isExpanded = expandedRoundId === roundId;
                              
                              return (
                                <div key={i} className="flex gap-4 relative mb-3">
                                  <div className="w-10 h-10 rounded-full bg-[#1c1c1e] border-[3px] border-[#1c1c1e] z-10 flex items-center justify-center shrink-0 mt-2">
                                    <div className={cn(
                                      "w-full h-full rounded-full flex items-center justify-center transition-all duration-300",
                                      isExpanded 
                                        ? "bg-white text-black"
                                        : "bg-white/5 text-[#86868b]"
                                    )}>
                                      <round.icon size={14} />
                                    </div>
                                  </div>
                                  
                                  <div 
                                    className={cn(
                                      "flex-1 bg-white/[0.02] rounded-[16px] border overflow-hidden cursor-pointer transition-all duration-300",
                                      isExpanded 
                                        ? "border-white/20"
                                        : "border-white/[0.04] hover:bg-white/[0.04]"
                                    )}
                                    onClick={() => setExpandedRoundId(isExpanded ? null : roundId)}
                                  >
                                    <div className="p-4 flex items-center justify-between">
                                      <div className="flex flex-col">
                                        <div className="text-[10px] font-black tracking-widest uppercase mb-1 text-[#86868b]">Round {i + 1}</div>
                                        <div className="text-[14px] font-bold text-white tracking-tight">{round.name}</div>
                                      </div>
                                      <ChevronDown size={16} className={cn("text-[#86868b] transition-transform duration-300", isExpanded && "rotate-180")} />
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
                                            <div className="h-px w-full bg-white/[0.04]" />
                                            
                                            <div className="flex gap-4 items-start">
                                              <Clock size={14} className="text-[#86868b] mt-0.5 shrink-0" />
                                              <div className="flex flex-col">
                                                <span className="text-[10px] uppercase tracking-wider text-[#86868b] font-bold mb-0.5">Duration</span>
                                                <span className="text-[13px] text-white/90 font-medium">{round.duration}</span>
                                              </div>
                                            </div>
                                            
                                            <div className="flex gap-4 items-start">
                                              <Target size={14} className="text-[#86868b] mt-0.5 shrink-0" />
                                              <div className="flex flex-col">
                                                <span className="text-[10px] uppercase tracking-wider text-[#86868b] font-bold mb-0.5">Focus Area</span>
                                                <span className="text-[13px] text-white/90 font-medium leading-relaxed">{round.focus}</span>
                                              </div>
                                            </div>
                                            
                                            <div className="flex gap-4 items-start">
                                              <BookOpen size={14} className="text-white mt-0.5 shrink-0" />
                                              <div className="flex flex-col">
                                                <span className="text-[10px] uppercase tracking-wider font-bold mb-0.5 text-white">Prep Strategy</span>
                                                <span className="text-[13px] font-medium leading-relaxed text-white/90">{round.prep}</span>
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
                          <h5 className="text-[11px] font-bold text-[#86868b] tracking-widest uppercase mb-1">Strategic Action Plan</h5>
                          
                          {actionItems.length > 0 ? (
                            <div className="flex flex-col gap-3">
                              {actionItems.map((item, i) => (
                                <Link key={i} href={item.actionLink} className="p-4 rounded-[16px] border border-white/[0.04] bg-white/[0.02] flex items-center gap-4 group hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300">
                                   <div className={cn(
                                     "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
                                     item.priority === "CRITICAL" ? "bg-[#ff3b30]/10 text-[#ff3b30]" : 
                                     item.priority === "HIGH" ? "bg-[#ff9f0a]/10 text-[#ff9f0a]" : 
                                     "bg-[#0a84ff]/10 text-[#0a84ff]"
                                   )}>
                                     {item.priority === "CRITICAL" ? <AlertCircle size={18} /> : 
                                      item.priority === "HIGH" ? <Target size={18} /> : 
                                      <CheckCircle2 size={18} />}
                                   </div>
                                   <div className="flex flex-col flex-1">
                                     <div className="flex items-center mb-0.5">
                                       <span className={cn(
                                         "text-[10px] font-bold uppercase tracking-wider",
                                         item.priority === "CRITICAL" ? "text-[#ff3b30]" :
                                         item.priority === "HIGH" ? "text-[#ff9f0a]" :
                                         "text-[#0a84ff]"
                                       )}>
                                         {item.priority} Priority
                                       </span>
                                     </div>
                                     <h6 className="text-[14px] font-bold text-white tracking-tight mb-1">{item.title}</h6>
                                     <p className="text-[13px] text-[#86868b] font-medium leading-relaxed">{item.desc}</p>
                                   </div>
                                   <ArrowRight size={16} className={cn(
                                     "opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 shrink-0",
                                     item.priority === "CRITICAL" ? "text-[#ff3b30]" : item.priority === "HIGH" ? "text-[#ff9f0a]" : "text-[#0a84ff]"
                                   )} />
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <div className="p-6 rounded-[16px] border border-[#34c759]/20 bg-[#34c759]/5 flex flex-col gap-3 items-center justify-center text-center">
                               <div className="w-12 h-12 rounded-full bg-[#34c759]/10 flex items-center justify-center mb-1">
                                 <CheckCircle2 size={24} className="text-[#34c759]" />
                               </div>
                               <h6 className="text-[15px] font-bold text-white tracking-tight">Target Achieved</h6>
                               <p className="text-[13px] text-[#86868b]">You meet all eligibility and skill requirements! Focus 100% on Interview prep.</p>
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
