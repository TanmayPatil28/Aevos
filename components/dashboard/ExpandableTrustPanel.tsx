"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, ShieldCheck, ShieldAlert, Calculator, FileText, Anchor } from "lucide-react";
import { ExplanationTree } from "@/lib/academic-intelligence/types";

interface ExpandableTrustPanelProps {
  explanation: ExplanationTree;
}

export default function ExpandableTrustPanel({ explanation }: ExpandableTrustPanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (!explanation) return null;

  const confidenceColor = 
    explanation.confidence === "HIGH" ? "text-emerald-400" : 
    explanation.confidence === "MEDIUM" ? "text-amber-400" : "text-rose-400";

  return (
    <div className="mt-4 border border-white/10 rounded-lg overflow-hidden bg-[#1D1D1F]">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 text-xs text-slate-300 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          {explanation.confidence === "HIGH" ? (
            <ShieldCheck className={`w-4 h-4 ${confidenceColor}`} />
          ) : (
            <ShieldAlert className={`w-4 h-4 ${confidenceColor}`} />
          )}
          <span className="font-semibold">Trust & Transparency Panel</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 ${confidenceColor}`}>
            {explanation.confidence} CONFIDENCE
          </span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="p-4 border-t border-white/20 space-y-4 text-xs text-slate-400">
          
          {/* Projected Impact */}
          <div>
            <h4 className="flex items-center gap-1.5 text-white font-semibold mb-1">
              <Anchor className="w-3.5 h-3.5 text-indigo-400" />
              Projected Impact
            </h4>
            <p className="pl-5 leading-relaxed">{explanation.projectedImpact}</p>
          </div>

          {/* Mathematical Basis */}
          <div>
            <h4 className="flex items-center gap-1.5 text-white font-semibold mb-2">
              <Calculator className="w-3.5 h-3.5 text-indigo-400" />
              Mathematical Basis
            </h4>
            <div className="pl-5 space-y-2">
              {explanation.calculations.map((calc, idx) => (
                <div key={idx} className="bg-black/20 p-2 rounded border border-white/5 font-mono text-[11px]">
                  <div className="text-slate-500 mb-1">{calc.step}</div>
                  <div className="text-indigo-300">{calc.formula}</div>
                  <div className="text-emerald-400 mt-1">↳ {calc.result}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Assumptions & Constraints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="flex items-center gap-1.5 text-white font-semibold mb-1">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                Assumptions
              </h4>
              <ul className="pl-5 list-disc space-y-1">
                {explanation.assumptions.map((ass, idx) => (
                  <li key={idx}>{ass}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="flex items-center gap-1.5 text-white font-semibold mb-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                Constraints
              </h4>
              <ul className="pl-5 list-disc space-y-1">
                {explanation.constraints.map((con, idx) => (
                  <li key={idx}>{con}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Dependencies */}
          <div>
            <h4 className="flex items-center gap-1.5 text-white font-semibold mb-1">
              <Anchor className="w-3.5 h-3.5 text-slate-400" />
              Data Dependencies
            </h4>
            <div className="pl-5 flex flex-wrap gap-2">
              {explanation.dependencies.map((dep, idx) => (
                <span key={idx} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-mono">
                  {dep}
                </span>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
