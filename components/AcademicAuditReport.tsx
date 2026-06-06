"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertTriangle, ShieldAlert, Award, FileText, Calendar, Landmark, AlertCircle, FileCheck2, Scale } from "lucide-react";
import { UniversityPreset } from "@/lib/presets";

interface AcademicAuditReportProps {
  preset: UniversityPreset;
  isOpen: boolean;
  onClose: () => void;
}

export default function AcademicAuditReport({
  preset,
  isOpen,
  onClose,
}: AcademicAuditReportProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key press or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // Badge configurations based on verification level
  const badgeConfig = {
    official: {
      label: "OFFICIALLY VERIFIED",
      icon: <CheckCircle2 size={16} className="text-emerald-400" />,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]",
      glow: "shadow-[0_0_30px_rgba(16,185,129,0.2)] border-emerald-500/30",
      description: "Directly parsed and certified from official gazettes and university senate circulars.",
    },
    community: {
      label: "COMMUNITY VERIFIED",
      icon: <CheckCircle2 size={16} className="text-blue-400" />,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]",
      glow: "shadow-[0_0_30px_rgba(59,130,246,0.2)] border-blue-500/30",
      description: "Cross-checked and aligned using academic record sheets uploaded by student cohorts.",
    },
    experimental: {
      label: "EXPERIMENTAL",
      icon: <AlertTriangle size={16} className="text-amber-400" />,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]",
      glow: "shadow-[0_0_30px_rgba(245,158,11,0.2)] border-amber-500/30",
      description: "Preliminary algorithms derived from draft syllabi. Use with caution for official transcripts.",
    },
  }[preset.trust.verificationLevel] || {
    label: "UNVERIFIED",
    icon: <ShieldAlert size={16} className="text-red-400" />,
    color: "text-red-400 bg-red-500/10 border-red-500/20",
    glow: "border-red-500/30",
    description: "Unverified parameters. Please crosscheck with academic departments.",
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 lg:p-8 bg-[#030712]/80 backdrop-blur-md overflow-y-auto"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="audit-title"
        >
          {/* Main Modal Frame */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-full max-w-4xl bg-[#090F1A] border border-white/[0.06] rounded-[24px] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col my-auto max-h-[90vh]"
          >
            {/* Ambient Background Glows */}

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/20 relative z-10">
              <div className="flex items-center gap-3">
                <Landmark size={20} className="text-[#4F8EF7]" />
                <div>
                  <h3 id="audit-title" className="text-lg font-black text-white tracking-tight leading-none">
                    Academic Trust & Rulebook Audit
                  </h3>
                  <p className="text-[11px] text-white/40 mt-1 leading-none">
                    {preset.name} · Statutory Regulatory Matrix
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="p-2 rounded-full bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] text-white/50 hover:text-white transition-all outline-none focus:ring-1 focus:ring-[#4F8EF7]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-8 relative z-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              
              {/* Trust Badge & Meter Dashboard Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                
                {/* Radial Meter and Level Info */}
                <div className={`md:col-span-7 rounded-2xl bg-white/[0.01] border p-6 flex flex-col md:flex-row gap-6 items-center justify-between ${badgeConfig.glow}`}>
                  <div className="flex-1 flex flex-col gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border w-fit ${badgeConfig.color}`}>
                      {badgeConfig.icon}
                      {badgeConfig.label}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">Rulebook Integrity Audit</h4>
                    <p className="text-xs text-white/50 leading-relaxed">
                      {badgeConfig.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-white/30">
                      <Calendar size={12} />
                      <span>Last Audited: {preset.trust.lastVerifiedAt}</span>
                    </div>
                  </div>

                  {/* Radial Meter Ring */}
                  <div className="shrink-0 flex flex-col items-center gap-2">
                    <div className="relative inline-flex items-center justify-center">
                      <svg className="w-24 h-24" viewBox="0 0 36 36">
                        <path
                          className="text-white/[0.04]"
                          strokeWidth="3"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={
                            preset.trust.verificationLevel === "official" ? "text-emerald-400" :
                            preset.trust.verificationLevel === "community" ? "text-blue-400" : "text-amber-400"
                          }
                          strokeDasharray={`${preset.trust.confidenceScore}, 100`}
                          strokeWidth="3"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <text x="18" y="20.35" className="fill-white font-mono text-[9px] font-black text-center" textAnchor="middle">
                          {preset.trust.confidenceScore}%
                        </text>
                      </svg>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/30">CONFIDENCE RATING</span>
                  </div>
                </div>

                {/* Audit Stamp Certification */}
                <div className="md:col-span-5 rounded-2xl bg-white/[0.01] border border-white/[0.04] p-6 flex flex-col justify-between relative overflow-hidden select-none">
                  {/* Decorative stamp graphic background */}
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 border-4 border-dashed border-white/[0.02] rounded-full rotate-12 flex items-center justify-center">
                    <Award size={48} className="text-white/[0.01]" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#4F8EF7]">AUTHENTICITY STAMP</span>
                    <h4 className="text-xs font-bold text-white">Trust Engine Certified</h4>
                    <p className="text-[11px] text-white/40 leading-relaxed mt-1">
                      Verified against institutional UGC frameworks, autonomous charters, and official credit structures.
                    </p>
                  </div>

                  {/* Certified Seal Box */}
                  <div className="mt-4 border border-dashed border-[#4F8EF7]/30 bg-[#4F8EF7]/5 px-3 py-2 rounded-xl flex items-center gap-2">
                    <FileCheck2 size={16} className="text-[#4F8EF7]" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black font-mono text-white/90 leading-none">GRADEFLOW STATUTORY AUDIT</span>
                      <span className="text-[8px] font-mono text-white/30 mt-0.5 leading-none">CODE: GF-TRUST-{preset.id.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legislative Sources of Truth */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">OFFICIALLY CITED ACADEMIC SOURCES</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {preset.trust.verifiedSources.map((source, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-4 rounded-xl bg-white/[0.01] border border-white/[0.03] items-start hover:border-white/[0.06] transition-colors"
                    >
                      <FileText size={16} className="text-[#4F8EF7] shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white/80 line-clamp-1">{source}</span>
                        <span className="text-[9px] font-mono text-white/30 mt-0.5">Reference Material [{index + 1}]</span>
                      </div>
                    </div>
                  ))}
                  {preset.trust.regulationBasis && (
                    <div className="flex gap-3 p-4 rounded-xl bg-white/[0.01] border border-white/[0.03] items-start sm:col-span-2">
                      <Scale size={16} className="text-[#A855F7] shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white/80">Regulation Framework Basis</span>
                        <p className="text-[11px] text-white/50 mt-1 leading-relaxed">{preset.trust.regulationBasis}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Rulebook Grid Dashboard */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">STATUTORY RULEBOOK GRID</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Grid 1: Academic Pass Rules */}
                  <div className="rounded-2xl bg-white/[0.01] border border-white/[0.03] p-5 flex flex-col gap-3">
                    <h5 className="text-xs font-black text-white uppercase tracking-wider border-b border-white/20 pb-2 flex items-center justify-between">
                      <span>Passing Standards</span>
                      <span className="text-[9px] font-mono text-[#4F8EF7]">Min Thresholds</span>
                    </h5>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/40">Minimum Grade Point (Pass/Fail):</span>
                        <span className="text-white/80 font-bold font-mono">
                          {preset.passRules?.minGradePoint ?? "NA"} GP
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/40">Minimum Attendance Requirement:</span>
                        <span className="text-white/80 font-bold font-mono text-[#4F8EF7]">
                          {preset.passRules?.minAttendance ? `${preset.passRules.minAttendance}%` : "NA"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/40">Independent passing IA / SEE:</span>
                        <span className={`text-[10px] font-black uppercase font-mono ${preset.passRules?.independentPassing ? "text-amber-400" : "text-white/30"}`}>
                          {preset.passRules?.independentPassing ? "Required" : "Combined Marks"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/40">Minimum CGPA for Progression:</span>
                        <span className="text-white/80 font-bold font-mono">
                          {preset.passRules?.minCgpa ?? "NA"} CGPA
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Grid 2: Backlog ATKT & Retake Detention Policy */}
                  <div className="rounded-2xl bg-white/[0.01] border border-white/[0.03] p-5 flex flex-col gap-3">
                    <h5 className="text-xs font-black text-white uppercase tracking-wider border-b border-white/20 pb-2 flex items-center justify-between">
                      <span>Backlog & ATKT Detention Policy</span>
                      <span className="text-[9px] font-mono text-[#A855F7]">Progression rules</span>
                    </h5>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/40">Supplementary/Summer Exams:</span>
                        <span className={`text-[10px] font-black uppercase font-mono ${preset.backlogPolicy?.supplementaryExams ? "text-emerald-400" : "text-white/30"}`}>
                          {preset.backlogPolicy?.supplementaryExams ? "AVAILABLE" : "NA / RE-REGISTR"}
                        </span>
                      </div>
                      {preset.backlogPolicy?.maxBacklogs !== undefined && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/40">Max Allowed Active Backlogs (detention limit):</span>
                          <span className="text-red-400 font-bold font-mono">{preset.backlogPolicy.maxBacklogs}</span>
                        </div>
                      )}
                      <div className="flex items-start justify-between text-xs gap-3">
                        <span className="text-white/40 shrink-0">Grade Cap / Retake Penalty:</span>
                        <span className="text-white/80 font-medium text-right leading-tight">
                          {preset.backlogPolicy?.retakePenalty || "Direct credit replacement"}
                        </span>
                      </div>
                      <div className="flex items-start justify-between text-xs gap-3 pt-1.5 border-t border-white/20">
                        <p className="text-[10px] text-white/30 leading-snug">
                          {preset.backlogPolicy?.description || "Student progression is based strictly on credit accumulation limits per academic year."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Grid 3: Assessment Schemes & Split Weights */}
                  <div className="rounded-2xl bg-white/[0.01] border border-white/[0.03] p-5 flex flex-col gap-3">
                    <h5 className="text-xs font-black text-white uppercase tracking-wider border-b border-white/20 pb-2 flex items-center justify-between">
                      <span>Assessment Weight Schemes</span>
                      <span className="text-[9px] font-mono text-[#4F8EF7]">Component split</span>
                    </h5>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/40">Continuous Evaluation Splits (e.g. IA/SEE):</span>
                        <span className="text-white/80 font-bold font-mono">{preset.assessmentScheme?.split || "UGC Default"}</span>
                      </div>
                      <div className="flex items-start justify-between text-xs gap-3">
                        <span className="text-white/40 shrink-0">Monitored Assessment Components:</span>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {preset.assessmentScheme?.components.map((comp) => (
                            <span key={comp} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono font-bold text-white/60">
                              {comp}
                            </span>
                          )) || <span className="text-white/30 font-mono">Standard Term Exams</span>}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/40">Theory & Practical Separation:</span>
                        <span className={`text-[10px] font-black uppercase font-mono ${preset.assessmentScheme?.theoryPracticalSeparation ? "text-amber-400" : "text-white/30"}`}>
                          {preset.assessmentScheme?.theoryPracticalSeparation ? "PASSED SEPARATELY" : "COMBINED GRADE"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Grid 4: Grading Scale & Curve Framework */}
                  <div className="rounded-2xl bg-white/[0.01] border border-white/[0.03] p-5 flex flex-col gap-3">
                    <h5 className="text-xs font-black text-white uppercase tracking-wider border-b border-white/20 pb-2 flex items-center justify-between">
                      <span>Grading Curve Framework</span>
                      <span className="text-[9px] font-mono text-[#A855F7]">{preset.evaluationModel.toUpperCase()} MODEL</span>
                    </h5>
                    {preset.evaluationModel === "relative" || preset.relativeGrading ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/40">Statistical Distribution:</span>
                          <span className="text-amber-400 font-bold text-[10px] font-mono uppercase truncate max-w-[200px]">
                            {preset.relativeGrading?.model.replace(/_/g, " ") || "Statistical Relative"}
                          </span>
                        </div>
                        {preset.relativeGrading?.absoluteFloorValue !== undefined && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white/40">Absolute Passing Floor:</span>
                            <span className="text-white/80 font-bold font-mono">{preset.relativeGrading.absoluteFloorValue} Marks</span>
                          </div>
                        )}
                        <p className="text-[10px] text-white/40 leading-snug mt-1 pt-1.5 border-t border-white/20">
                          {preset.relativeGrading?.curveDescription || "Grades are curved based on section/cohort averages with statistical deviation mapping."}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/40">Grading Scheme Model:</span>
                          <span className="text-emerald-400 font-bold text-[10px] font-mono uppercase">Absolute Scale Boundaries</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/40">Grade Bands Count:</span>
                          <span className="text-white/80 font-mono font-bold">{preset.gradeScale.length} standard brackets</span>
                        </div>
                        <p className="text-[10px] text-white/40 leading-snug mt-1 pt-1.5 border-t border-white/20">
                          This university uses standard credit grading with absolute lower-bound percentage thresholds to determine grades directly.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Degree Brackets list */}
              {preset.degreeClassification && preset.degreeClassification.length > 0 && (
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">DEGREE AWARD DIVISIONS</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {preset.degreeClassification.map((bracket, index) => (
                      <div key={index} className="px-4 py-3 rounded-xl bg-white/[0.01] border border-white/[0.03] flex flex-col gap-1">
                        <span className="text-[11px] font-black text-white/80 leading-snug">{bracket.label}</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-xs font-mono font-bold text-[#4F8EF7]">{bracket.minCGPA.toFixed(2)}</span>
                          <span className="text-[9px] text-white/30">CGPA</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className=" border-t border-white/20 px-6 py-4 bg-black/20 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10 text-[10px] text-white/20 font-mono">
              <div className="flex items-center gap-1.5">
                <AlertCircle size={10} className="text-[#4F8EF7]" />
                <span>UGC Framework & University Ordinance Compliant Abstraction System</span>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-xs font-bold text-white transition-all shadow-md shrink-0 focus:outline-none focus:ring-1 focus:ring-[#4F8EF7]"
              >
                Close Audit Center
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
