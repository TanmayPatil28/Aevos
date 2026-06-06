"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Printer, CheckCircle2, XCircle } from "lucide-react";
import { DEFAULT_RECRUITERS } from "@/lib/career/careerData";
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

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 lg:p-8 print:p-0">
          {/* Backdrop (hidden when printing) */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md print:hidden"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#1c1c1e] border border-white/10 rounded-3xl shadow-2xl print:shadow-none print:border-none print:w-full print:max-w-none print:h-auto print:bg-white print:text-black"
          >
            {/* Header (hidden when printing) */}
            <div className="sticky top-0 z-20 flex items-center justify-between p-6 bg-[#1c1c1e]/90 backdrop-blur-xl border-b border-white/5 print:hidden">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Placement Preparation Plan</h2>
                <p className="text-sm text-white/50">High-fidelity export format.</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handlePrint}
                  className="group flex items-center gap-2 px-5 py-2 text-sm font-semibold text-[#e0a8ff] transition-all bg-[#bf5af2]/10 border border-[#bf5af2]/30 rounded-full hover:bg-[#bf5af2]/20 hover:shadow-[0_0_15px_rgba(191,90,242,0.3)]"
                >
                  <Printer size={16} className="group-hover:scale-110 transition-transform" /> Save PDF
                </button>
                <button 
                  onClick={onClose}
                  className="p-2 text-white/50 transition-colors bg-white/5 rounded-full hover:bg-white/10 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-8 md:p-10 print:p-0 text-white print:text-black">
              
              {/* Document Header */}
              <div className="mb-12 text-center">
                <h1 className="mb-3 text-4xl font-black tracking-tight text-white print:text-black">Target Preparation Strategy</h1>
                <p className="text-white/60 print:text-black/60 font-medium">Generated for {companies.length} target {companies.length === 1 ? 'company' : 'companies'}</p>
              </div>

              {/* Profile Snapshot */}
              <div className="p-6 mb-12 bg-black/40 border border-white/5 rounded-2xl print:bg-black/5 print:border-black/10">
                <h3 className="mb-6 text-xs font-black tracking-widest text-white/40 print:text-black/40 uppercase">Profile Snapshot</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex flex-col gap-1">
                    <div className="text-xs text-white/60 print:text-black/60 font-semibold uppercase tracking-wider">Current CGPA</div>
                    <div className="text-3xl font-black text-white print:text-black">{userCgpa.toFixed(2)}</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="text-xs text-white/60 print:text-black/60 font-semibold uppercase tracking-wider">Active Backlogs</div>
                    <div className="text-3xl font-black text-white print:text-black">{userBacklogs}</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="text-xs text-white/60 print:text-black/60 font-semibold uppercase tracking-wider">Technical Skills</div>
                    <div className="text-sm font-medium leading-relaxed text-white/80 print:text-black/80">{userSkills.join(", ") || "None recorded"}</div>
                  </div>
                </div>
              </div>

              {/* Company Sections */}
              <div className="space-y-16">
                {companies.map((company, idx) => {
                  const passesCgpa = userCgpa >= company.cgpaCutoff;
                  const passesBacklogs = userBacklogs <= company.maxBacklogs;
                  
                  return (
                    <div key={company.name} className="break-inside-avoid">
                      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8 pb-4 border-b border-white/10 print:border-black/20">
                        <h2 className="text-3xl font-bold tracking-tight text-white print:text-black">{company.name}</h2>
                        <span className={cn(
                          "w-fit px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border",
                          company.tier === "FAANG" ? "bg-[#bf5af2]/10 text-[#e0a8ff] border-[#bf5af2]/20 print:bg-purple-100 print:text-purple-700 print:border-purple-200" :
                          company.tier === "Product" ? "bg-[#0a84ff]/10 text-[#8ab4f8] border-[#0a84ff]/20 print:bg-blue-100 print:text-blue-700 print:border-blue-200" :
                          company.tier === "Startup" ? "bg-[#ff9f0a]/10 text-[#ffd60a] border-[#ff9f0a]/20 print:bg-yellow-100 print:text-yellow-700 print:border-yellow-200" :
                          "bg-[#32d74b]/10 text-[#86efac] border-[#32d74b]/20 print:bg-green-100 print:text-green-700 print:border-green-200"
                        )}>{company.tier} Tier</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 print:gap-8">
                        {/* Eligibility Gap Analysis */}
                        <div className="flex flex-col gap-5">
                          <h4 className="text-xs font-black tracking-widest text-white/40 print:text-black/40 uppercase">Eligibility Gaps</h4>
                          <ul className="space-y-4">
                            <li className={cn(
                              "flex items-start gap-3 p-4 rounded-xl border",
                              passesCgpa ? "bg-[#32d74b]/5 border-[#32d74b]/20 print:bg-green-50 print:border-green-200" : "bg-[#ff453a]/5 border-[#ff453a]/20 print:bg-red-50 print:border-red-200"
                            )}>
                              {passesCgpa ? <CheckCircle2 size={20} className="text-[#32d74b] print:text-green-600 shrink-0" /> : <XCircle size={20} className="text-[#ff453a] print:text-red-600 shrink-0" />}
                              <div>
                                <div className="text-sm font-bold text-white print:text-black">CGPA Requirement: {company.cgpaCutoff}</div>
                                {!passesCgpa && <div className="text-xs font-semibold text-[#ff453a] print:text-red-600 mt-1">Shortfall of {(company.cgpaCutoff - userCgpa).toFixed(2)} points</div>}
                              </div>
                            </li>
                            <li className={cn(
                              "flex items-start gap-3 p-4 rounded-xl border",
                              passesBacklogs ? "bg-[#32d74b]/5 border-[#32d74b]/20 print:bg-green-50 print:border-green-200" : "bg-[#ff453a]/5 border-[#ff453a]/20 print:bg-red-50 print:border-red-200"
                            )}>
                              {passesBacklogs ? <CheckCircle2 size={20} className="text-[#32d74b] print:text-green-600 shrink-0" /> : <XCircle size={20} className="text-[#ff453a] print:text-red-600 shrink-0" />}
                              <div>
                                <div className="text-sm font-bold text-white print:text-black">Max Backlogs: {company.maxBacklogs}</div>
                                {!passesBacklogs && <div className="text-xs font-semibold text-[#ff453a] print:text-red-600 mt-1">Must clear {userBacklogs - company.maxBacklogs} backlogs immediately</div>}
                              </div>
                            </li>
                          </ul>
                        </div>

                        {/* Required Skills Matrix */}
                        <div className="flex flex-col gap-5">
                          <h4 className="text-xs font-black tracking-widest text-white/40 print:text-black/40 uppercase">Skill Matrix Analysis</h4>
                          <div className="p-5 rounded-xl border border-white/5 bg-black/20 print:bg-black/5 print:border-black/10">
                            <div className="flex flex-wrap gap-2.5">
                              {company.requiredSkills?.map(skill => {
                                const isMatched = userSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(s.toLowerCase()));
                                return (
                                  <span key={skill} className={cn(
                                    "px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1.5",
                                    isMatched 
                                      ? "bg-[#32d74b]/10 text-[#32d74b] border-[#32d74b]/20 print:bg-green-100 print:text-green-800 print:border-green-200" 
                                      : "bg-[#ff453a]/10 text-[#ff453a] border-[#ff453a]/20 print:bg-red-100 print:text-red-800 print:border-red-200"
                                  )}>
                                    {isMatched ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                    {skill}
                                  </span>
                                )
                              })}
                            </div>
                            <p className="mt-4 text-xs font-medium text-white/40 print:text-black/50">
                              Green badges indicate a match with your current profile. Missing skills must be acquired before the first screening round.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Interview Timeline Overview */}
                      <div className="mt-8">
                        <h4 className="mb-4 text-xs font-black tracking-widest text-white/40 print:text-black/40 uppercase">Interview Pipeline</h4>
                        <div className="flex flex-col sm:flex-row gap-4">
                           {/* A simplified representation of rounds based on tier for the export */}
                           {company.tier === "FAANG" && (
                              <>
                                <div className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10 print:border-black/20 print:bg-transparent">
                                  <div className="text-[10px] uppercase font-bold text-[#bf5af2] print:text-purple-600 mb-1">Round 1</div>
                                  <div className="text-sm font-bold text-white print:text-black">Online Assessment</div>
                                </div>
                                <div className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10 print:border-black/20 print:bg-transparent">
                                  <div className="text-[10px] uppercase font-bold text-[#bf5af2] print:text-purple-600 mb-1">Round 2</div>
                                  <div className="text-sm font-bold text-white print:text-black">DSA Whiteboarding</div>
                                </div>
                                <div className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10 print:border-black/20 print:bg-transparent">
                                  <div className="text-[10px] uppercase font-bold text-[#bf5af2] print:text-purple-600 mb-1">Round 3</div>
                                  <div className="text-sm font-bold text-white print:text-black">System Design</div>
                                </div>
                              </>
                           )}
                           {company.tier === "Product" && (
                              <>
                                <div className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10 print:border-black/20 print:bg-transparent">
                                  <div className="text-[10px] uppercase font-bold text-[#0a84ff] print:text-blue-600 mb-1">Round 1</div>
                                  <div className="text-sm font-bold text-white print:text-black">Machine Coding</div>
                                </div>
                                <div className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10 print:border-black/20 print:bg-transparent">
                                  <div className="text-[10px] uppercase font-bold text-[#0a84ff] print:text-blue-600 mb-1">Round 2</div>
                                  <div className="text-sm font-bold text-white print:text-black">Technical Problem Solving</div>
                                </div>
                              </>
                           )}
                           {company.tier === "Service" && (
                              <>
                                <div className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10 print:border-black/20 print:bg-transparent">
                                  <div className="text-[10px] uppercase font-bold text-[#32d74b] print:text-green-600 mb-1">Round 1</div>
                                  <div className="text-sm font-bold text-white print:text-black">Aptitude & Logic</div>
                                </div>
                                <div className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10 print:border-black/20 print:bg-transparent">
                                  <div className="text-[10px] uppercase font-bold text-[#32d74b] print:text-green-600 mb-1">Round 2</div>
                                  <div className="text-sm font-bold text-white print:text-black">Technical Basics</div>
                                </div>
                                <div className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10 print:border-black/20 print:bg-transparent">
                                  <div className="text-[10px] uppercase font-bold text-[#32d74b] print:text-green-600 mb-1">Round 3</div>
                                  <div className="text-sm font-bold text-white print:text-black">HR & Comm</div>
                                </div>
                              </>
                           )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="mt-16 pt-8 border-t border-white/10 print:border-black/20 text-center text-xs font-semibold text-white/30 print:text-black/40">
                Generated by GradeFlow Intelligence Engine • {new Date().toLocaleDateString()}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
