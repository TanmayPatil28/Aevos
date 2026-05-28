"use client";

import React, { useMemo } from "react";
import { CheckCircle2, FileDown, Info, Percent } from "lucide-react";
import { UniversityPreset, explainSGPA, explainCGPA } from "@/lib/presets";

interface CalculationBreakdownProps {
  preset: UniversityPreset;
  subjects?: { name: string; credits: number; grade: string }[];
  semesters?: { semesterName: string; credits: number; sgpa: number }[];
  type: "sgpa" | "cgpa";
}

export default function CalculationBreakdown({
  preset,
  subjects = [],
  semesters = [],
  type,
}: CalculationBreakdownProps) {
  // 1. Calculate and memoize trace
  const sgpaTrace = useMemo(() => {
    if (type !== "sgpa" || subjects.length === 0) return null;
    return explainSGPA(subjects, preset);
  }, [subjects, preset, type]);

  const cgpaTrace = useMemo(() => {
    if (type !== "cgpa" || semesters.length === 0) return null;
    return explainCGPA(semesters, preset);
  }, [semesters, preset, type]);

  const activeTrace = sgpaTrace || cgpaTrace;
  
  if (!activeTrace) return null;

  const finalGPA = type === "sgpa" ? sgpaTrace!.sgpa : cgpaTrace!.cgpa;
  const totalCredits = activeTrace.totalCredits;
  const totalWeightedPoints = activeTrace.totalWeightedPoints;
  const maxScale = preset.gradeScale[0]?.points || 10.0;
  
  // Handle statutory Print Proof Export
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="relative w-full flex flex-col gap-6" id="gflow-calculation-breakdown">
      
      {/* Ambient Blue Radial Glow Behind the Glass */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/15 via-[#0B0F19]/5 to-transparent blur-[80px] pointer-events-none rounded-[32px] -z-10" />

      {/* Dynamic Print Styles for Statutory Proof */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Hide everything except the print wrapper */
          body * {
            visibility: hidden;
          }
          #print-proof-container, #print-proof-container * {
            visibility: visible;
          }
          #print-proof-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 30px;
            background: #000000 !important;
            color: #ffffff !important;
            box-sizing: border-box;
            border-radius: 0px !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      {/* Main Breakdown Dashboard - Apple Tech Specs Aesthetic */}
      <div 
        id="print-proof-container"
        className="rounded-[32px] bg-[#0A0D14]/60 backdrop-blur-[64px] border border-white/[0.08] p-8 md:p-10 flex flex-col gap-10 relative shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] overflow-hidden"
      >
        {/* Section 1: Institution Header & Verification Badge */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.06] relative z-10">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#86868b]">Academic Trust Tracer</span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 size={10} /> {preset.trust.verificationLevel.toUpperCase()}
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-[#f5f5f7] tracking-tight leading-tight">
              Statutory Explanation Matrix.
            </h2>
            <p className="text-sm md:text-base text-[#86868b] font-medium tracking-tight max-w-xl">
              {preset.name} — {preset.metadata?.patternYear || `${preset.regulationYear} Regulations`}
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="no-print group flex items-center justify-center w-12 h-12 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all"
            aria-label="Print Official Proof"
          >
            <FileDown size={18} className="text-[#86868b] group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Section 2: Visual CSS Math Formula Rendering & Tracer Output */}
        <div className="flex flex-col lg:flex-row gap-10 relative z-10">
          
          {/* Left: Math Equations */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#86868b]">Statutory Mathematical Formulation</span>
              
              <div className="flex items-center gap-4 text-white font-mono select-none">
                <span className="text-2xl md:text-3xl font-bold tracking-tighter">{type.toUpperCase()}</span>
                <span className="text-white/20 text-2xl">=</span>

                {type === "sgpa" ? (
                  <div className="inline-flex items-center gap-4">
                    <div className="inline-flex flex-col items-center">
                      <div className="flex items-center text-white/90">
                        <span className="text-2xl font-light leading-none font-serif mr-1">∑</span>
                        <span className="text-sm">(C<sub>i</sub> × GP<sub>i</sub>)</span>
                      </div>
                      <span className="w-full h-[1px] bg-white/20 my-1" />
                      <div className="flex items-center text-white/50">
                        <span className="text-lg font-light leading-none font-serif mr-1">∑</span>
                        <span className="text-xs">C<sub>i</sub></span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-4">
                    <div className="inline-flex flex-col items-center">
                      <div className="flex items-center text-white/90">
                        <span className="text-2xl font-light leading-none font-serif mr-1">∑</span>
                        <span className="text-sm">(Credits<sub>j</sub> × {preset.creditType === "units" ? "Units" : "SGPA"}<sub>j</sub>)</span>
                      </div>
                      <span className="w-full h-[1px] bg-white/20 my-1" />
                      <div className="flex items-center text-white/50">
                        <span className="text-lg font-light leading-none font-serif mr-1">∑</span>
                        <span className="text-xs">Credits<sub>j</sub></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full h-[1px] bg-white/[0.04]" />

            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#86868b]">Arithmetic Value Substitution</span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 font-mono">
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold text-lg">{finalGPA.toFixed(2)}</span>
                  <span className="text-white/20 text-lg">=</span>
                </div>
                <div className="flex flex-col items-start sm:items-center min-w-0 flex-1">
                  {type === "sgpa" && sgpaTrace ? (
                    <span className="text-xs text-[#86868b] w-full max-w-[200px] sm:max-w-[300px] lg:max-w-[380px] overflow-hidden whitespace-nowrap text-ellipsis text-center" title={sgpaTrace.courses.filter(c => c.credits > 0).map(c => `(${c.credits}×${c.points})`).join(" + ")}>
                      {sgpaTrace.courses.filter(c => c.credits > 0).map(c => `(${c.credits}×${c.points})`).join(" + ")}
                    </span>
                  ) : cgpaTrace ? (
                    <span className="text-xs text-[#86868b] w-full max-w-[200px] sm:max-w-[300px] lg:max-w-[380px] overflow-hidden whitespace-nowrap text-ellipsis text-center" title={cgpaTrace.semesters.filter(s => s.credits > 0).map(s => `(${s.credits}×${s.sgpa})`).join(" + ")}>
                      {cgpaTrace.semesters.filter(s => s.credits > 0).map(s => `(${s.credits}×${s.sgpa})`).join(" + ")}
                    </span>
                  ) : null}
                  <span className="w-full max-w-[200px] sm:max-w-[300px] lg:max-w-[380px] h-[1px] bg-white/10 my-1" />
                  <span className="text-[10px] text-[#86868b] font-medium tracking-tight text-center">
                    {totalCredits} {preset.creditType === "units" ? "Units" : "Credits"} (Denominator)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Massive Typography Output (Replacing Ring) */}
          <div className="flex flex-col justify-center gap-4 shrink-0 pl-0 lg:pl-12 lg:border-l border-white/[0.06] relative">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#86868b]">Tracer Output</span>
            
            <div className="relative group w-fit">
              {/* Subtle shimmering blue glow underneath */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/20 blur-3xl rounded-full opacity-60 pointer-events-none" />
              
              <div className="relative flex items-baseline gap-1.5">
                <span className="text-7xl md:text-8xl font-bold text-white tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] leading-none">{finalGPA.toFixed(2)}</span>
                <span className="text-sm md:text-base font-bold text-[#86868b]">/ {maxScale}</span>
              </div>
            </div>

            <div className="w-full max-w-[220px] flex justify-between text-xs font-mono mt-1 pt-3 border-t border-white/[0.04]">
              <span className="text-[#86868b]">Weighted: <span className="text-white font-semibold">{totalWeightedPoints.toFixed(2)}</span></span>
              <span className="text-[#86868b]">Earned: <span className="text-white font-semibold">{totalCredits}</span></span>
            </div>
          </div>
        </div>

        {/* Section 3: Sleek Spec Flex-Grid (Strict Single Line Layout) */}
        <div className="flex flex-col gap-3 relative z-10 w-full overflow-hidden">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#86868b] mb-1">Courseweight Arithmetic Grid</div>
          
          <div className="w-full flex flex-col">
            {/* Grid Header (Flex) */}
            <div className="flex items-center w-full pb-2.5 border-b border-white/[0.08] text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[#86868b]">
              <div className="flex-[3] min-w-0 pr-3">Course / Element Name</div>
              <div className="flex-1 min-w-[50px] text-center truncate">{preset.creditType === "units" ? "Units" : "Credits"}</div>
              <div className="flex-1 min-w-[50px] text-center truncate">Grade</div>
              <div className="flex-1 min-w-[40px] text-center truncate">GP</div>
              <div className="flex-[1.2] min-w-[60px] text-right truncate">Product</div>
            </div>

            {/* Grid Rows (Flex) */}
            <div className="flex flex-col w-full">
              {type === "sgpa" && sgpaTrace ? (
                sgpaTrace.courses.map((course, idx) => (
                  <div key={idx} className="flex items-center w-full py-2.5 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors text-xs md:text-sm">
                    <div className="flex-[3] min-w-0 pr-3 font-semibold text-white truncate" title={course.name}>{course.name}</div>
                    <div className="flex-1 min-w-[50px] text-center font-mono text-[#86868b]">{course.credits}</div>
                    <div className="flex-1 min-w-[50px] text-center flex justify-center">
                      <span className="px-1.5 py-0.5 rounded text-[10px] md:text-[11px] font-mono font-bold text-white bg-white/10">{course.grade}</span>
                    </div>
                    <div className="flex-1 min-w-[40px] text-center font-mono text-[#86868b]">{course.points}</div>
                    <div className="flex-[1.2] min-w-[60px] text-right font-mono font-bold text-white">{course.weightedPoints}</div>
                  </div>
                ))
              ) : cgpaTrace ? (
                cgpaTrace.semesters.map((sem, idx) => (
                  <div key={idx} className="flex items-center w-full py-2.5 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors text-xs md:text-sm">
                    <div className="flex-[3] min-w-0 pr-3 font-semibold text-white truncate" title={sem.semesterName}>{sem.semesterName}</div>
                    <div className="flex-1 min-w-[50px] text-center font-mono text-[#86868b]">{sem.credits}</div>
                    <div className="flex-1 min-w-[50px] text-center flex justify-center">
                      <span className="px-1.5 py-0.5 rounded text-[10px] md:text-[11px] font-mono font-bold text-[#3b82f6] bg-[#3b82f6]/10">SGPA</span>
                    </div>
                    <div className="flex-1 min-w-[40px] text-center font-mono text-[#86868b]">{sem.sgpa.toFixed(2)}</div>
                    <div className="flex-[1.2] min-w-[60px] text-right font-mono font-bold text-white">{sem.weightedPoints.toFixed(2)}</div>
                  </div>
                ))
              ) : null}
            </div>
          </div>
        </div>

        {/* Section 4 & 5: Percentage & Statutory Rationale */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-12 relative z-10 pt-4 border-t border-white/[0.06]">
          <div className="flex-1 flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#86868b] flex items-center gap-2">
              <Percent size={12} /> Percentage Equivalency
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-white tracking-tight">{activeTrace.percentage.toFixed(2)}%</span>
            </div>
            <div className="text-[10px] text-[#86868b] font-mono mt-1">
              Formula: <span className="text-white">{activeTrace.percentageFormula}</span>
            </div>
          </div>

          <div className="w-[1px] hidden md:block bg-white/[0.06]" />

          <div className="flex-[1.5] flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#86868b] flex items-center gap-2">
              <Info size={12} /> Statutory Basis
            </span>
            <p className="text-xs text-[#86868b] font-medium leading-relaxed mt-1">
              {preset.trust.academicReasoning || "The statutory conversion algorithm is computed using standard credit weighting systems to guarantee uniform division brackets across all degree pathways."}
            </p>
            {preset.trust.circularRef && (
              <div className="text-[10px] text-white/50 font-mono mt-1">
                Ref: <span className="text-white">{preset.trust.circularRef}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer verification stamp */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 text-[9px] font-bold uppercase tracking-widest text-[#86868b] pt-6 mt-2 border-t border-white/[0.06] relative z-10">
          <span>GradeFlow Trust Engine — VERIFIED</span>
          <span className="no-print opacity-50">{new Date().toISOString().split("T")[0]}</span>
        </div>
      </div>
    </div>
  );
}
