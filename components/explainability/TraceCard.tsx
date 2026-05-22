"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, AlertTriangle, HelpCircle, Code, CornerDownRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { TraceMetadata } from "@/stores/selectors";
import RegulationCitation from "./RegulationCitation";

export interface TraceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  trace: TraceMetadata;
  title?: string;
  defaultExpanded?: boolean;
}

export default function TraceCard({
  trace,
  title = "Audit Trace Log",
  defaultExpanded = false,
  className,
  ...props
}: TraceCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const hasExtraInfo = 
    (trace.assumptions && trace.assumptions.length > 0) ||
    (trace.warnings && trace.warnings.length > 0) ||
    (trace.fallbackConditions && trace.fallbackConditions.length > 0);

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.05] bg-white/[0.01] overflow-hidden transition-all duration-300",
        className
      )}
      {...props}
    >
      {/* Header / Summary Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.02] transition-colors gap-4"
      >
        <div className="flex items-center gap-2.5">
          <Code className="h-4 w-4 text-[var(--color-primary)]" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-white/50">
            {title}
          </span>
        </div>
        <button className="p-1 rounded bg-white/[0.04] border border-white/[0.05] text-white/60 hover:text-white transition-colors">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-4 border-t border-white/[0.03] bg-black/10">
          {/* Formula */}
          <div className="space-y-1.5 mt-4">
            <h5 className="text-[10px] font-black uppercase tracking-wider text-white/30">Equation Applied</h5>
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.05] font-mono text-[11px] text-white/80 leading-relaxed overflow-x-auto whitespace-pre-wrap">
              {trace.formulaApplied}
            </div>
          </div>

          {/* Citation */}
          <RegulationCitation
            regulationId={trace.sourceRegulationId}
            clause={trace.sourceClause}
            circular={trace.sourceCircular}
            confidenceScore={trace.confidenceScore}
          />

          {/* Warnings / Assumptions / Fallback Conditions */}
          {hasExtraInfo && (
            <div className="grid grid-cols-1 gap-3 border-t border-white/[0.03] pt-4">
              {/* Warnings */}
              {trace.warnings && trace.warnings.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <h5 className="text-[10px] font-black uppercase tracking-wider">Engine Alerts</h5>
                  </div>
                  <ul className="space-y-1 pl-1">
                    {trace.warnings.map((warning, i) => (
                      <li key={i} className="text-xs text-white/60 flex items-start gap-1.5">
                        <CornerDownRight className="h-3.5 w-3.5 text-white/20 shrink-0 mt-0.5" />
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Assumptions */}
              {trace.assumptions && trace.assumptions.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-blue-400">
                    <HelpCircle className="h-3.5 w-3.5" />
                    <h5 className="text-[10px] font-black uppercase tracking-wider">Modeling Assumptions</h5>
                  </div>
                  <ul className="space-y-1 pl-1">
                    {trace.assumptions.map((assumption, i) => (
                      <li key={i} className="text-xs text-white/60 flex items-start gap-1.5">
                        <CornerDownRight className="h-3.5 w-3.5 text-white/20 shrink-0 mt-0.5" />
                        <span>{assumption}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Fallback Conditions */}
              {trace.fallbackConditions && trace.fallbackConditions.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-purple-400">
                    <Code className="h-3.5 w-3.5" />
                    <h5 className="text-[10px] font-black uppercase tracking-wider">Fallback Triggers</h5>
                  </div>
                  <ul className="space-y-1 pl-1">
                    {trace.fallbackConditions.map((fallback, i) => (
                      <li key={i} className="text-xs text-white/60 flex items-start gap-1.5">
                        <CornerDownRight className="h-3.5 w-3.5 text-white/20 shrink-0 mt-0.5" />
                        <span>{fallback}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
