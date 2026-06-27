import React from "react";
import { Activity } from "lucide-react";
import { cn } from "@/lib/cn";

interface HealthProps {
  readinessScore: string | number;
  averageEligibility: number;
}

export default function PlacementHealthMeter({ readinessScore, averageEligibility }: HealthProps) {
  
  let scoreString = typeof readinessScore === 'string' ? readinessScore : "SAFE";
  if (typeof readinessScore === 'number') {
    if (readinessScore >= 80) scoreString = "SAFE";
    else if (readinessScore >= 60) scoreString = "MODERATE RISK";
    else if (readinessScore >= 40) scoreString = "HIGH RISK";
    else scoreString = "CRITICAL";
  }

  const getRiskColors = () => {
    switch(scoreString) {
      case "SAFE": return { glow: "bg-status-success", text: "text-[#34c759]", border: "border-status-success" };
      case "MODERATE RISK": return { glow: "bg-status-warning", text: "text-[#ff9f0a]", border: "border-status-warning" };
      case "HIGH RISK": return { glow: "bg-status-critical", text: "text-[#ff3b30]", border: "border-status-critical" };
      case "CRITICAL": return { glow: "bg-status-critical", text: "text-[#ff3b30]", border: "border-status-critical" };
      default: return { glow: "bg-surface-raised", text: "text-foreground/50", border: "border-border" };
    }
  };

  const colors = getRiskColors();

  return (
    <div className="flex flex-col flex-1 px-6 py-5 hover:bg-white/[0.02] transition-colors group cursor-default">
       <span className="text-[12px] font-semibold text-foreground-muted mb-2 block">
         Eligibility
       </span>
       <div className="flex flex-wrap xl:flex-nowrap items-center gap-3">
         <span className="text-2xl font-bold tracking-tight text-foreground">
           {averageEligibility.toFixed(0)}%
         </span>
         <span className={cn("text-[13px] font-bold uppercase tracking-wider", colors.text)}>
           {scoreString}
         </span>
       </div>
    </div>
  );
}
