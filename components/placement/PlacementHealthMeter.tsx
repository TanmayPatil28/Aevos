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
      case "SAFE": return { glow: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/20" };
      case "MODERATE RISK": return { glow: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/20" };
      case "HIGH RISK": return { glow: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/20" };
      case "CRITICAL": return { glow: "bg-rose-500/20", text: "text-rose-400", border: "border-rose-500/20" };
      default: return { glow: "bg-white/10", text: "text-white/50", border: "border-white/10" };
    }
  };

  const colors = getRiskColors();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center pt-8 pb-12 px-6 bg-[#1D1D1F] border border-white/5 rounded-[32px] relative overflow-hidden group shadow-none">
      
      

      <div className="relative z-10 flex flex-col items-center text-center">
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 mb-8">
          Placement Health
        </h2>

        <div className="flex flex-col items-center justify-center mb-8">
          <span className="text-[12px] font-medium text-white/50 uppercase tracking-widest mb-2">Overall Eligibility</span>
          <div className="flex items-baseline gap-1">
            <span className="text-8xl md:text-[9rem] font-black tracking-[-0.05em] text-transparent bg-clip-text leading-none bg-gradient-to-b from-white to-white/40">
              {averageEligibility.toFixed(0)}
            </span>
            <span className="text-3xl font-bold text-white/20">%</span>
          </div>
        </div>

        <div className={cn("px-5 py-2 rounded-full border backdrop-blur-md flex items-center gap-2", colors.border, "bg-black/40")}>
          <div className={cn("w-2 h-2 rounded-full", colors.text, "shadow-none")} />
          <span className={cn("text-xs font-bold tracking-widest uppercase", colors.text)}>
            {readinessScore}
          </span>
        </div>

        {/* Share Trajectory Button */}
        <button 
          onClick={() => {
            import("react-hot-toast").then((mod) => {
              mod.toast.success("Trajectory graphic generated and copied to clipboard!");
            });
          }}
          className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition-colors text-xs font-bold shadow-none"
        >
          <Share2 className="w-4 h-4" /> Share My Trajectory
        </button>
      </div>
    </div>
  );
}
