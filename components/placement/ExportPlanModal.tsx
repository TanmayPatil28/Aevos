"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, CheckCircle2, XCircle, FileText, Target } from "lucide-react";
import { DEFAULT_RECRUITERS } from "@/lib/career/careerData";
import { intelligenceEngine } from "@/lib/career/intelligenceEngine";
import { cn } from "@/lib/cn";

interface ExportPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: NonNullable<typeof DEFAULT_RECRUITERS[0]>[];
  userCgpa: number;
  userBacklogs: number;
  userSkills: string[];
}

export default function ExportPlanModal({ isOpen, onClose, companies, userCgpa, userBacklogs, userSkills }: ExportPlanModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const intelligenceResults = useMemo(() => {
    return intelligenceEngine.calculateEligibility({
      cgpa: userCgpa,
      backlogs: userBacklogs,
      skills: userSkills,
      earnedCredits: 120, // defaults for export calc
      branch: "Computer Science",
      targetRole: "Software Engineer",
      customCriteria: companies
    });
  }, [userCgpa, userBacklogs, userSkills, companies]);

  const actionPlan = useMemo(() => {
    return generateActionPlan(userCgpa, userBacklogs, userSkills, companies);
  }, [userCgpa, userBacklogs, userSkills, companies]);

  if (!mounted) return null;

  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 lg:p-8 print:p-0">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm print:hidden"
          />

          {/* Modal */}
          <motion.div 
            initial={{ scale: 0.96, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col rounded-2xl shadow-2xl font-sans print:shadow-none print:rounded-none print:w-full print:max-w-none print:max-h-none"
          >
            {/* ─── Dark Header Bar (hidden on print) ─── */}
            <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#1d1d1f] border-b border-white/[0.08] shrink-0 print:hidden">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
                  <FileText size={16} className="text-black" />
                </div>
                <div>
                  <h2 className="text-[15px] leading-[20px] font-semibold text-white tracking-tight">Export Preparation Plan</h2>
                  <p className="text-[12px] leading-[16px] text-[#86868b]">{companies.length} target companies · Comprehensive Report</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-black bg-brand rounded-lg hover:bg-brand/90 transition-colors"
                >
                  <Download size={14} /> Save PDF
                </button>
                <button 
                  onClick={onClose}
                  className="p-2 text-[#86868b] hover:text-white transition-colors rounded-lg hover:bg-white/[0.06]"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* ─── White Document Body ─── */}
            <div className="flex-1 overflow-y-auto bg-white print:overflow-visible">
              <div className="px-8 md:px-12 py-12 print:px-8 print:py-6 font-[var(--font-inter)] max-w-3xl mx-auto">

                {/* ── Document Title ── */}
                <div className="mb-12 print:mb-8 text-center border-b border-[#d2d2d7]/60 pb-8">
                  <span className="text-[12px] leading-[16px] uppercase tracking-[0.12em] text-[#86868b] font-bold">
                    Aevos Intelligence Engine
                  </span>
                  <h1 className="text-[36px] leading-[44px] font-semibold text-[#1d1d1f] tracking-tight mt-3">
                    Target Preparation Strategy
                  </h1>
                  <p className="text-[15px] leading-[22px] text-[#86868b] mt-3 font-medium">
                    Comprehensive career readiness analysis generated on {dateStr}.
                  </p>
                </div>

                {/* ── Profile Snapshot ── */}
                <div className="mb-14 print:mb-10">
                  <h3 className="text-[12px] leading-[16px] font-bold tracking-[0.12em] text-[#86868b] uppercase mb-6 flex items-center gap-2">
                    <Target size={14} /> Profile Snapshot
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#f5f5f7] p-5 rounded-xl">
                      <span className="text-[11px] leading-[14px] font-semibold text-[#86868b] uppercase tracking-wider block mb-1">Current CGPA</span>
                      <span className="text-[32px] leading-[36px] font-bold text-[#1d1d1f] tracking-tight">{userCgpa.toFixed(2)}</span>
                    </div>
                    <div className="bg-[#f5f5f7] p-5 rounded-xl">
                      <span className="text-[11px] leading-[14px] font-semibold text-[#86868b] uppercase tracking-wider block mb-1">Active Backlogs</span>
                      <span className="text-[32px] leading-[36px] font-bold text-[#1d1d1f] tracking-tight">{userBacklogs}</span>
                    </div>
                    <div className="bg-[#f5f5f7] p-5 rounded-xl md:col-span-1">
                      <span className="text-[11px] leading-[14px] font-semibold text-[#86868b] uppercase tracking-wider block mb-2">Technical Skills</span>
                      <div className="text-[13px] leading-[20px] font-medium text-[#1d1d1f] line-clamp-3">
                        {userSkills.length > 0 ? userSkills.join(", ") : "None recorded"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Company Breakdowns ── */}
                <div className="flex flex-col gap-14 print:gap-10">
                  {companies.map((company) => {
                    const passesCgpa = userCgpa >= company.cgpaCutoff;
                    const passesBacklogs = userBacklogs <= company.maxBacklogs;
                    const reqSkills = company.requiredSkills || [];
                    const intelResult = intelligenceResults.find(r => r.name === company.name);
                    const readinessScore = intelResult?.eligibilityScore || 0;
                    
                    return (
                      <div key={company.name} className="break-inside-avoid">
                        {/* Company Header with Readiness Score */}
                        <div className="flex items-start justify-between mb-6 pb-4 border-b border-[#d2d2d7]/60">
                          <div>
                            <span className="text-[11px] leading-[16px] font-bold tracking-[0.12em] text-[#86868b] uppercase">
                              {company.tier} Tier
                            </span>
                            <h2 className="text-[28px] leading-[36px] font-semibold text-[#1d1d1f] tracking-tight mt-1">
                              {company.name}
                            </h2>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] leading-[16px] font-bold tracking-[0.12em] text-[#86868b] uppercase">
                              Readiness
                            </span>
                            <div className={cn(
                              "text-[28px] leading-[36px] font-bold tracking-tight mt-1",
                              readinessScore >= 80 ? "text-[#34c759]" : readinessScore >= 50 ? "text-[#ff9f0a]" : "text-[#ff3b30]"
                            )}>
                              {readinessScore}%
                            </div>
                          </div>
                        </div>

                        {/* Eligibility & Skills Matrix in 2 columns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                          {/* Eligibility Check */}
                          <div>
                            <h4 className="text-[11px] leading-[16px] font-bold text-[#86868b] uppercase tracking-wider mb-4">
                              Eligibility Check
                            </h4>
                            <div className="flex flex-col gap-3">
                              <div className="flex items-start justify-between py-2 border-b border-[#d2d2d7]/30">
                                <div className="flex items-center gap-2.5">
                                  {passesCgpa 
                                    ? <CheckCircle2 size={16} className="text-[#34c759] shrink-0" />
                                    : <XCircle size={16} className="text-[#ff3b30] shrink-0" />
                                  }
                                  <span className="text-[13px] leading-[18px] font-medium text-[#1d1d1f]">
                                    CGPA Req: {company.cgpaCutoff.toFixed(1)}
                                  </span>
                                </div>
                                <span className={cn(
                                  "text-[13px] leading-[18px] font-bold",
                                  passesCgpa ? "text-[#34c759]" : "text-[#ff3b30]"
                                )}>
                                  {userCgpa.toFixed(2)} {passesCgpa ? "" : `(−${(company.cgpaCutoff - userCgpa).toFixed(2)})`}
                                </span>
                              </div>

                              <div className="flex items-start justify-between py-2 border-b border-[#d2d2d7]/30">
                                <div className="flex items-center gap-2.5">
                                  {passesBacklogs 
                                    ? <CheckCircle2 size={16} className="text-[#34c759] shrink-0" />
                                    : <XCircle size={16} className="text-[#ff3b30] shrink-0" />
                                  }
                                  <span className="text-[13px] leading-[18px] font-medium text-[#1d1d1f]">
                                    Max Backlogs: {company.maxBacklogs}
                                  </span>
                                </div>
                                <span className={cn(
                                  "text-[13px] leading-[18px] font-bold",
                                  passesBacklogs ? "text-[#34c759]" : "text-[#ff3b30]"
                                )}>
                                  {userBacklogs} {passesBacklogs ? "" : `(+${userBacklogs - company.maxBacklogs})`}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Required Technical Stack */}
                          {reqSkills.length > 0 && (
                            <div>
                              <h4 className="text-[11px] leading-[16px] font-bold text-[#86868b] uppercase tracking-wider mb-4">
                                Required Technical Stack
                              </h4>
                              <div className="flex flex-wrap gap-x-1.5 gap-y-1 text-[13px] leading-[20px] font-medium">
                                {reqSkills.map((skill, i) => {
                                  const isMatched = userSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(s.toLowerCase()));
                                  return (
                                    <span key={skill}>
                                      <span className={cn(
                                        isMatched ? "text-[#1d1d1f]" : "text-[#ff3b30]"
                                      )}>
                                        {skill}
                                      </span>
                                      {i < reqSkills.length - 1 && <span className="text-[#d2d2d7] mx-0.5">·</span>}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Detailed Interview Pipeline */}
                        <div>
                          <h4 className="text-[11px] leading-[16px] font-bold text-[#86868b] uppercase tracking-wider mb-4">
                            Strategic Interview Pipeline
                          </h4>
                          <div className="flex flex-col gap-3">
                            {getRoundsForTier(company.tier).map((round, i) => (
                              <div key={i} className="flex gap-4 p-4 bg-[#f5f5f7] rounded-xl border border-[#d2d2d7]/30">
                                <div className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#e8e8ed] text-[11px] font-bold text-[#86868b]">
                                  {i + 1}
                                </div>
                                <div>
                                  <div className="text-[14px] leading-[20px] font-semibold text-[#1d1d1f] mb-1">{round.name}</div>
                                  <div className="text-[13px] leading-[18px] font-medium text-[#6e6e73]">{round.strategy}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── Priority Action Plan (Next Steps) ── */}
                <div className="mt-16 pt-10 border-t-2 border-[#1d1d1f] print:mt-12 break-inside-avoid">
                  <h2 className="text-[24px] leading-[32px] font-semibold text-[#1d1d1f] tracking-tight mb-6">
                    Priority Action Plan
                  </h2>
                  <div className="flex flex-col gap-4">
                    {actionPlan.map((action, i) => (
                      <div key={i} className="flex gap-4 p-5 rounded-xl border border-[#d2d2d7]/50 bg-white">
                        <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#1d1d1f] text-[14px] font-bold text-white">
                          {i + 1}
                        </div>
                        <div>
                          <h4 className="text-[15px] leading-[20px] font-semibold text-[#1d1d1f] mb-1.5">{action.title}</h4>
                          <p className="text-[14px] leading-[22px] font-medium text-[#6e6e73]">{action.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Footer ── */}
                <div className="mt-12 pt-6 border-t border-[#d2d2d7]/60 flex items-center justify-between print:mt-8">
                  <span className="text-[11px] leading-[16px] text-[#86868b] font-bold uppercase tracking-wider">Aevos Intelligence Engine</span>
                  <span className="text-[11px] leading-[16px] text-[#86868b] font-bold uppercase tracking-wider">{dateStr}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// Helpers

function getRoundsForTier(tier: string) {
  switch (tier) {
    case "FAANG": return [
      { name: "Online Assessment", strategy: "Focus on medium-to-hard LeetCode DSA and edge cases." },
      { name: "DSA Whiteboarding", strategy: "Optimize space/time complexity and dry-run code clearly." },
      { name: "System Design", strategy: "Design for scale, discuss tradeoffs, load balancing, and sharding." },
      { name: "Behavioral", strategy: "Use STAR method for conflict resolution and leadership principles." }
    ];
    case "Product": return [
      { name: "Machine Coding", strategy: "Build modular, extensible code with solid OOP principles." },
      { name: "Technical Interview", strategy: "Core CS fundamentals: OS, DBMS, Networks, and DSA." },
      { name: "System Design", strategy: "High-level component design and database choices." }
    ];
    case "Service": return [
      { name: "Aptitude & Logic", strategy: "Speed and accuracy in quantitative and logical reasoning." },
      { name: "Technical Basics", strategy: "Core concepts of OOPs, SQL queries, and basic coding." },
      { name: "HR & Communication", strategy: "Clear communication, flexibility, and cultural fit." }
    ];
    case "Startup": return [
      { name: "Take-Home Assignment", strategy: "Production-ready code with tests, linting, and docs." },
      { name: "Technical Discussion", strategy: "Deep dive into your project architecture and choices." },
      { name: "Culture Fit", strategy: "Demonstrate ownership, agility, and product mindset." }
    ];
    default: return [
      { name: "Screening", strategy: "Basic resume walkthrough and technical screening." },
      { name: "Technical Round", strategy: "Core technical concepts and problem-solving." },
      { name: "HR", strategy: "General fit and expectations." }
    ];
  }
}

function generateActionPlan(userCgpa: number, userBacklogs: number, userSkills: string[], companies: any[]) {
  const actions = [];
  const maxCgpaNeeded = Math.max(...companies.map(c => c.cgpaCutoff));
  const minBacklogsAllowed = Math.min(...companies.map(c => c.maxBacklogs));

  if (userBacklogs > minBacklogsAllowed) {
      actions.push({
          title: "Clear Active Backlogs Immediately",
          desc: `You have ${userBacklogs} active backlogs, but target companies allow a maximum of ${minBacklogsAllowed}. This is an immediate blocker for eligibility. Schedule clearance exams as the highest priority.`
      });
  }

  if (userCgpa < maxCgpaNeeded) {
      actions.push({
          title: "Bridge the CGPA Deficit",
          desc: `Your CGPA is ${userCgpa.toFixed(2)}, which is below the ${maxCgpaNeeded.toFixed(2)} cutoff for top targets. Focus on scoring higher in upcoming semesters to meet the baseline requirement.`
      });
  } else {
       actions.push({
          title: "Maintain Academic Safety Buffer",
          desc: `Your CGPA (${userCgpa.toFixed(2)}) is safely above target cutoffs. Maintain this performance to ensure a strong safety margin during initial screening.`
      });
  }

  // Skills Check
  const allRequired = new Set<string>();
  companies.forEach(c => c.requiredSkills?.forEach((s: string) => allRequired.add(s)));
  const missing = Array.from(allRequired).filter(req => !userSkills.some(u => u.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(u.toLowerCase())));
  
  if (missing.length > 0) {
      actions.push({
          title: "Acquire Missing Core Technical Skills",
          desc: `You are missing key skills required by your targets: ${missing.slice(0, 4).join(", ")}. Prioritize hands-on projects in these domains to bridge the capability gap.`
      });
  } else {
      actions.push({
          title: "Deepen Technical Expertise",
          desc: `You have all the baseline skills required. Shift focus from learning new syntax to building advanced, production-grade projects that demonstrate deep expertise.`
      });
  }

  return actions.slice(0, 3);
}
