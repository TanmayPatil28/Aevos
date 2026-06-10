import React from "react";
import { Shield, Scale, Flame, ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { RecoveryPlanResult } from "@/lib/backlog-intelligence/engine";

interface PathwayProps {
  type: "SAFE" | "BALANCED" | "AGGRESSIVE";
  plan: RecoveryPlanResult & { insight: string; maxCredits: number };
  isActive: boolean;
  onSelect: () => void;
}

export default function RecoveryPathwaysWidget({ pathways, selectedType, onSelect }: {
  pathways: {
    SAFE: RecoveryPlanResult & { insight: string; maxCredits: number };
    BALANCED: RecoveryPlanResult & { insight: string; maxCredits: number };
    AGGRESSIVE: RecoveryPlanResult & { insight: string; maxCredits: number };
  };
  selectedType: "SAFE" | "BALANCED" | "AGGRESSIVE";
  onSelect: (type: "SAFE" | "BALANCED" | "AGGRESSIVE") => void;
}) {

  const cards: PathwayProps[] = [
    { type: "SAFE", plan: pathways.SAFE, isActive: selectedType === "SAFE", onSelect: () => onSelect("SAFE") },
    { type: "BALANCED", plan: pathways.BALANCED, isActive: selectedType === "BALANCED", onSelect: () => onSelect("BALANCED") },
    { type: "AGGRESSIVE", plan: pathways.AGGRESSIVE, isActive: selectedType === "AGGRESSIVE", onSelect: () => onSelect("AGGRESSIVE") },
  ];

  return (
    <div className="w-full flex flex-col gap-4">
      <h3 className="text-xl font-bold text-white flex items-center gap-2">
        <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
          <ArrowRight size={18} />
        </span>
        Automated Recovery Pathways
      </h3>
      <p className="text-sm text-white/50 mb-2">Select an AI-generated trajectory to load into the Unified Simulator below.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => {
          let Icon = Shield;
          let config = {
             border: "border-emerald-500",
             bgHover: "hover:bg-emerald-500/5",
             text: "text-emerald-400",
             bgLight: "bg-emerald-500/10",
             shadow: "shadow-[0_0_30px_rgba(16,185,129,0.15)]",
             blob: "bg-emerald-500"
          };
          
          if (card.type === "BALANCED") { 
             Icon = Scale; 
             config = {
               border: "border-blue-500",
               bgHover: "hover:bg-blue-500/5",
               text: "text-blue-400",
               bgLight: "bg-blue-500/10",
               shadow: "shadow-[0_0_30px_rgba(59,130,246,0.15)]",
               blob: "bg-blue-500"
             };
          }
          if (card.type === "AGGRESSIVE") { 
             Icon = Flame; 
             config = {
               border: "border-orange-500",
               bgHover: "hover:bg-orange-500/5",
               text: "text-orange-400",
               bgLight: "bg-orange-500/10",
               shadow: "shadow-[0_0_30px_rgba(249,115,22,0.15)]",
               blob: "bg-orange-500"
             };
          }

          return (
            <button
              key={card.type}
              onClick={card.onSelect}
              className={cn(
                "relative text-left p-5 rounded-2xl border transition-all duration-300 outline-none focus-visible:ring-2 overflow-hidden flex flex-col h-full",
                card.isActive ? `bg-[#1c1c1e] ${config.border} ${config.shadow}` : `bg-[#1c1c1e]/50 border-white/5 hover:border-white/20 hover:bg-[#1c1c1e] ${config.bgHover}`
              )}
            >
              {card.isActive && (
                <div className={cn(`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full blur-[50px] opacity-20 ${config.blob}`)} />
              )}
              
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={cn("flex items-center gap-2", config.text)}>
                  <Icon size={20} />
                  <span className="font-bold tracking-widest text-sm">{card.type}</span>
                </div>
                <div className={cn("text-xs font-bold px-2 py-1 rounded-md", config.bgLight, config.text)}>
                  Max {card.plan.maxCredits} Cr/Sem
                </div>
              </div>

              <p className="text-sm text-white/70 leading-relaxed mb-4 flex-1 relative z-10">
                {card.plan.insight}
              </p>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto relative z-10">
                <span className="text-xs text-white/40 font-medium">Unplannable Backlogs:</span>
                <span className={cn("text-sm font-bold", card.plan.unplannableCourses.length > 0 ? "text-red-400" : "text-white/80")}>
                  {card.plan.unplannableCourses.length}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
