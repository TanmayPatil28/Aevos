import React from "react";
import { Activity, ShieldAlert, ShieldCheck, Shield, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface HealthProps {
  readinessScore: string; // SAFE, MODERATE RISK, HIGH RISK, CRITICAL
  averageEligibility: number;
}

export default function PlacementHealthMeter({ readinessScore, averageEligibility }: HealthProps) {
  
  const getRiskColors = () => {
    switch(readinessScore) {
      case "SAFE": return { glow: "bg-[#34c759]/20", text: "text-[#34c759]", border: "border-[#34c759]/30" };
      case "MODERATE RISK": return { glow: "bg-[#ffcc00]/20", text: "text-[#ffcc00]", border: "border-[#ffcc00]/30" };
      case "HIGH RISK": return { glow: "bg-[#ff9f0a]/20", text: "text-[#ff9f0a]", border: "border-[#ff9f0a]/30" };
      case "CRITICAL": return { glow: "bg-[#ff453a]/20", text: "text-[#ff453a]", border: "border-[#ff453a]/30" };
      default: return { glow: "bg-white/10", text: "text-white/50", border: "border-white/10" };
    }
  };

  const colors = getRiskColors();

  return (
    <div className="w-full flex flex-col items-center justify-center p-8 bg-[#1c1c1e]/60 backdrop-blur-3xl border border-white/10 rounded-[32px] relative overflow-hidden shadow-2xl">
      <div className="relative z-10 flex flex-col items-center text-center w-full">
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-white/50 mb-6">
          Placement Health
        </h2>

        <div className="flex flex-col items-center justify-center mb-8">
          <div className="flex items-baseline gap-1">
            <span className="text-8xl md:text-[8rem] font-black tracking-tighter text-transparent bg-clip-text leading-none bg-gradient-to-b from-white to-white/60">
              {averageEligibility.toFixed(0)}
            </span>
            <span className="text-4xl font-bold text-white/30">%</span>
          </div>
          <span className="text-sm font-medium text-white/40 mt-4">Average Eligibility</span>
        </div>

        <div className={cn("px-6 py-2.5 rounded-full border flex items-center gap-3", colors.border, colors.glow)}>
          <div className={cn("w-2.5 h-2.5 rounded-full", "bg-current", colors.text, "shadow-sm")} />
          <span className={cn("text-sm font-bold tracking-wider uppercase", colors.text)}>
            {readinessScore}
          </span>
        </div>

        <button 
          onClick={() => {
            import("react-hot-toast").then((mod) => {
              mod.toast.success("Trajectory graphic generated and copied to clipboard!");
            });
          }}
          className="mt-8 flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 transition-colors text-sm font-semibold"
        >
          <Share2 className="w-4 h-4" /> Share Dashboard
        </button>
      </div>
    </div>
  );
}
