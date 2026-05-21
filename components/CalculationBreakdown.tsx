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

  // Handle statutory Print Proof Export
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="w-full flex flex-col gap-6" id="gflow-calculation-breakdown">
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
            background: #030712 !important;
            color: #f3f4f6 !important;
            box-sizing: border-box;
            border-radius: 0px !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      {/* Main Breakdown Dashboard */}
      <div 
        id="print-proof-container"
        className="rounded-[24px] bg-[#0B0F19] border border-white/[0.04] p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden shadow-2xl"
      >
        {/* Decorative Grid Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

        {/* Section 1: Institution Header & Verification Badge */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.05] pb-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4F8EF7]">Academic Trust Tracer</span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 size={10} /> {preset.trust.verificationLevel.toUpperCase()}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Statutory Explanation Matrix
            </h2>
            <p className="text-xs text-white/40 mt-1">
              {preset.name} — {preset.metadata?.patternYear || `${preset.regulationYear} Regulations`}
            </p>
          </div>

          <div className="flex items-center gap-2 no-print">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-xs font-bold text-white/80 hover:text-white transition-all shadow-lg"
            >
              <FileDown size={14} className="text-[#4F8EF7]" />
              Print Official Proof
            </button>
          </div>
        </div>

        {/* Section 2: Visual CSS Math Formula Rendering */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          {/* Custom Pure-CSS Equation Card */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">STATUTORY MATHEMATICAL FORMULATION</div>
            
            <div className="flex flex-wrap items-center gap-3 p-5 rounded-2xl bg-white/[0.01] border border-white/[0.03] w-fit font-mono select-none">
              <span className="text-base font-black text-white tracking-tight">{type.toUpperCase()}</span>
              <span className="text-white/30">=</span>

              {type === "sgpa" ? (
                // Pure CSS SGPA Formulation
                <div className="inline-flex items-center gap-2">
                  <div className="inline-flex flex-col items-center">
                    <div className="flex items-center text-white/80 text-xs">
                      <span className="text-[18px] font-light leading-none font-serif text-[#4F8EF7] mr-0.5">∑</span>
                      <span>(C<sub>i</sub> × GP<sub>i</sub>)</span>
                    </div>
                    <span className="w-full h-[1px] bg-white/20 my-1" />
                    <div className="flex items-center text-white/40 text-[10px]">
                      <span className="text-[14px] font-light leading-none font-serif text-white/20 mr-0.5">∑</span>
                      <span>C<sub>i</sub></span>
                    </div>
                  </div>
                  <span className="text-white/20 text-xs">; where i ∈ semester courses</span>
                </div>
              ) : (
                // Pure CSS CGPA Formulation
                <div className="inline-flex items-center gap-2">
                  <div className="inline-flex flex-col items-center">
                    <div className="flex items-center text-white/80 text-xs">
                      <span className="text-[18px] font-light leading-none font-serif text-[#4F8EF7] mr-0.5">∑</span>
                      <span>(Credits<sub>j</sub> × {preset.creditType === "units" ? "Units" : "SGPA"}<sub>j</sub>)</span>
                    </div>
                    <span className="w-full h-[1px] bg-white/20 my-1" />
                    <div className="flex items-center text-white/40 text-[10px]">
                      <span className="text-[14px] font-light leading-none font-serif text-white/20 mr-0.5">∑</span>
                      <span>Credits<sub>j</sub></span>
                    </div>
                  </div>
                  <span className="text-white/20 text-xs">; where j ∈ completed semesters</span>
                </div>
              )}
            </div>

            {/* Substitution Equation Card */}
            <div className="flex flex-col gap-2 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/20">Arithmetic Value Substitution</span>
              <div className="flex items-center gap-3 font-mono text-sm">
                <span className="text-white font-bold">{finalGPA.toFixed(2)}</span>
                <span className="text-white/30">=</span>
                <div className="inline-flex flex-col items-center align-middle">
                  {type === "sgpa" && sgpaTrace ? (
                    <span className="text-[11px] text-white/70 max-w-[280px] md:max-w-[400px] truncate">
                      {sgpaTrace.courses.filter(c => c.credits > 0).map(c => `(${c.credits}×${c.points})`).join(" + ")}
                    </span>
                  ) : cgpaTrace ? (
                    <span className="text-[11px] text-white/70 max-w-[280px] md:max-w-[400px] truncate">
                      {cgpaTrace.semesters.filter(s => s.credits > 0).map(s => `(${s.credits}×${s.sgpa})`).join(" + ")}
                    </span>
                  ) : null}
                  <span className="w-full h-[1px] bg-white/10 my-1" />
                  <span className="text-[10px] text-white/40 font-bold">
                    {totalCredits} {preset.creditType === "units" ? "Units" : "Credits"} (Denominator)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Numerical Derivation Box */}
          <div className="lg:col-span-5 flex flex-col gap-3 p-5 rounded-2xl bg-gradient-to-br from-[#4F8EF7]/10 to-transparent border border-[#4F8EF7]/10">
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#4F8EF7]">Tracer Output</span>
            
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white tracking-tight">{finalGPA.toFixed(2)}</span>
              <span className="text-sm text-white/40 font-bold">/ {preset.gradeScale[0]?.points || 10.0} GP</span>
            </div>

            <div className="flex flex-col gap-1.5 mt-2 pt-3 border-t border-white/[0.05]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40">Total Weighted Points:</span>
                <span className="text-white/80 font-mono font-black">{totalWeightedPoints.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40">Earned Academic {preset.creditType === "units" ? "Units" : "Credits"}:</span>
                <span className="text-white/80 font-mono font-black">{totalCredits}</span>
              </div>
              {activeTrace.classification && (
                <div className="flex items-center justify-between text-xs pt-1.5 mt-1 border-t border-white/[0.03]">
                  <span className="text-white/40">Degree Division Bracket:</span>
                  <span className="text-[#4F8EF7] font-black tracking-tight">{activeTrace.classification}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Sleek Dark Table of Course-wise Breakdown */}
        <div className="flex flex-col gap-3 relative z-10">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">COURSEWEIGHT ARITHMETIC GRID</div>
          
          <div className="rounded-xl border border-white/[0.04] overflow-hidden bg-white/[0.005]">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/[0.05] text-[10px] text-white/40 font-black uppercase tracking-wider">
                  <th className="p-3">Course / Element Name</th>
                  <th className="p-3 text-center">{preset.creditType === "units" ? "Units" : "Credits"} (C)</th>
                  <th className="p-3 text-center">Grade Letter</th>
                  <th className="p-3 text-center">Grade Point (GP)</th>
                  <th className="p-3 text-right">Weighted Product (C × GP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03] text-white/70">
                {type === "sgpa" && sgpaTrace ? (
                  sgpaTrace.courses.map((course, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-3 font-bold text-white/80">{course.name}</td>
                      <td className="p-3 text-center font-mono">{course.credits}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] font-mono font-black text-white/90 text-[10px]">
                          {course.grade}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono">{course.points}</td>
                      <td className="p-3 text-right font-mono font-black text-[#4F8EF7]">{course.weightedPoints}</td>
                    </tr>
                  ))
                ) : cgpaTrace ? (
                  cgpaTrace.semesters.map((sem, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-3 font-bold text-white/80">{sem.semesterName}</td>
                      <td className="p-3 text-center font-mono">{sem.credits}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-[#4F8EF7]/10 border border-[#4F8EF7]/20 font-mono font-black text-[#4F8EF7] text-[10px]">
                          SGPA
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono">{sem.sgpa.toFixed(2)}</td>
                      <td className="p-3 text-right font-mono font-black text-[#4F8EF7]">{sem.weightedPoints.toFixed(2)}</td>
                    </tr>
                  ))
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Percentage Derivation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/[0.03] flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4F8EF7] flex items-center gap-1.5">
              <Percent size={12} />
              Percentage Equivalency Derivation
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white tracking-tight">
                {activeTrace.percentage.toFixed(2)}%
              </span>
              <span className="text-xs text-white/30 font-medium">Equivalency Score</span>
            </div>
            <div className="text-[11px] text-white/40 leading-relaxed font-mono mt-1 pt-2 border-t border-white/[0.04]">
              Formula: <span className="text-white/70">{activeTrace.percentageFormula}</span>
            </div>
          </div>

          {/* Section 5: Statutory Explainer / Reasoning */}
          <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/[0.03] flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4F8EF7] flex items-center gap-1.5">
              <Info size={12} />
              Statutory Basis & Rationale
            </span>
            <p className="text-xs text-white/50 leading-relaxed italic">
              {`"${preset.trust.academicReasoning || "The statutory conversion algorithm is computed using standard credit weighting systems to guarantee uniform division brackets across all degree pathways."}"`}
            </p>
            {preset.trust.circularRef && (
              <div className="text-[10px] text-white/30 font-mono mt-1 pt-2 border-t border-white/[0.04]">
                Gov Circular Ref: <span className="text-[#4F8EF7]">{preset.trust.circularRef}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer verification stamp */}
        <div className="border-t border-white/[0.04] pt-4 flex flex-col md:flex-row items-center justify-between gap-3 relative z-10 text-[10px] text-white/20 font-mono">
          <span>GradeFlow Trust Engine Certified — Statut: VERIFIED</span>
          <span className="no-print">System Timestamp: {new Date().toISOString().split("T")[0]}</span>
        </div>
      </div>
    </div>
  );
}
