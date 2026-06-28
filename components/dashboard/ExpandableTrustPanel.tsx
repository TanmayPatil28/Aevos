"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, ShieldCheck, ShieldAlert, Calculator, FileText, Anchor } from "lucide-react";
import { ExplanationTree } from "@/lib/academic-intelligence/types";
import Card from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";

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
    <Card variant="accent" padding="sm" className="mt-4">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-[11px] text-foreground-muted hover:text-foreground transition-colors"
      >
        <div className="flex items-center gap-2">
          {explanation.confidence === "HIGH" ? (
            <ShieldCheck className={`w-4 h-4 ${confidenceColor}`} />
          ) : (
            <ShieldAlert className={`w-4 h-4 ${confidenceColor}`} />
          )}
          <span className="font-bold uppercase tracking-wider">Trust & Transparency</span>
          <Badge variant={explanation.confidence === "HIGH" ? "success" : explanation.confidence === "MEDIUM" ? "warning" : "danger"} className="ml-2">
            {explanation.confidence} CONFIDENCE
          </Badge>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="pt-4 mt-4 border-t border-white/5 space-y-4 text-xs text-foreground-muted">
          
          {/* Projected Impact */}
          <div>
            <h4 className="flex items-center gap-2 text-foreground font-semibold mb-1">
              <Anchor className="w-3.5 h-3.5 text-foreground-muted" />
              Projected Impact
            </h4>
            <p className="pl-5.5 leading-relaxed text-foreground-muted">{explanation.projectedImpact}</p>
          </div>

          {/* Mathematical Basis */}
          <div>
            <h4 className="flex items-center gap-2 text-foreground font-semibold mb-3">
              <Calculator className="w-3.5 h-3.5 text-foreground-muted" />
              Mathematical Basis
            </h4>
            <div className="pl-5.5 space-y-4">
              {explanation.calculations.map((calc, idx) => (
                <div key={idx} className="font-mono text-[11px] pl-3 border-l border-white/10">
                  <div className="text-foreground-muted/60 mb-1">{calc.step}</div>
                  <div className="text-foreground-muted">{calc.formula}</div>
                  <div className="text-foreground mt-1">↳ {calc.result}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Assumptions & Constraints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="flex items-center gap-2 text-foreground font-semibold mb-2">
                <FileText className="w-3.5 h-3.5 text-foreground-muted" />
                Assumptions
              </h4>
              <ul className="pl-5.5 list-disc space-y-1 text-foreground-muted">
                {explanation.assumptions.map((ass, idx) => (
                  <li key={idx}>{ass}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="flex items-center gap-2 text-foreground font-semibold mb-2">
                <ShieldAlert className="w-3.5 h-3.5 text-foreground-muted" />
                Constraints
              </h4>
              <ul className="pl-5.5 list-disc space-y-1 text-foreground-muted">
                {explanation.constraints.map((con, idx) => (
                  <li key={idx}>{con}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Dependencies */}
          <div>
            <h4 className="flex items-center gap-2 text-foreground font-semibold mb-2">
              <Anchor className="w-3.5 h-3.5 text-foreground-muted" />
              Data Dependencies
            </h4>
            <div className="pl-5.5 flex flex-wrap gap-2">
              {explanation.dependencies.map((dep, idx) => (
                <span key={idx} className="text-foreground-muted/80 text-[10px] font-mono">
                  {dep}
                  {idx < explanation.dependencies.length - 1 && <span className="mx-2 text-white/10">|</span>}
                </span>
              ))}
            </div>
          </div>

        </div>
      )}
    </Card>
  );
}
