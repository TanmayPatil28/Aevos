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
      case "SAFE": return { glow: "bg-[#34c759]/10", text: "text-[#34c759]", border: "border-[#34c759]/20" };
      case "MODERATE RISK": return { glow: "bg-[#ff9f0a]/10", text: "text-[#ff9f0a]", border: "border-[#ff9f0a]/20" };
      case "HIGH RISK": return { glow: "bg-[#ff9f0a]/10", text: "text-[#ff9f0a]", border: "border-[#ff9f0a]/20" };
      case "CRITICAL": return { glow: "bg-[#ff3b30]/10", text: "text-[#ff3b30]", border: "border-[#ff3b30]/20" };
      default: return { glow: "bg-white/5", text: "text-white/50", border: "border-white/10" };
    }
  };

  const colors = getRiskColors();

  return (
    <div className="flex flex-col flex-1 px-6 py-4 hover:bg-white/[0.02] transition-colors group cursor-default">
       <span className="text-[10px] font-bold uppercase tracking-widest text-[#86868b] flex items-center gap-1.5 mb-2">
         <Activity className="w-3.5 h-3.5 text-[#86868b]" />
         Eligibility
       </span>
       <div className="flex flex-wrap xl:flex-nowrap items-baseline gap-2.5">
         <span className="text-3xl font-black tracking-tighter leading-none text-white">
           {averageEligibility.toFixed(0)}%
         </span>
         <span className={cn("text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm border whitespace-nowrap", colors.border, colors.glow, colors.text)}>
           {scoreString}
         </span>
       </div>
    </div>
  );
}
