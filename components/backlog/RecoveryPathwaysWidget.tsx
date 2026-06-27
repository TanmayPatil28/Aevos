import React from "react";
import { Shield, Scale, Flame, Route } from "lucide-react";
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
        <Route className="text-brand" size={20} />
        Automated Recovery Pathways
      </h3>
      <p className="text-sm text-white/50 mb-2">Select an AI-generated trajectory to load into the Unified Simulator below.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => {
          let Icon = Shield;
          let config = {
             text: "text-status-success",
             bgLight: "bg-surface border border-white/[0.04]",
          };
          
          if (card.type === "BALANCED") { 
             Icon = Scale; 
             config = {
               text: "text-brand",
               bgLight: "bg-surface border border-white/[0.04]",
             };
          }
          if (card.type === "AGGRESSIVE") { 
             Icon = Flame; 
             config = {
               text: "text-status-critical",
               bgLight: "bg-surface border border-white/[0.04]",
             };
          }

          return (

              <button
                key={card.type}
                onClick={card.onSelect}
                className={cn(
                  "relative text-left p-5 rounded-[24px] border transition-all duration-300 outline-none focus-visible:ring-2 overflow-hidden flex flex-col h-full w-full",
                  card.isActive ? `bg-surface-raised border-white/10 shadow-none` : `bg-surface border-white/[0.04] hover:bg-[#2A2A2D]`
                )}
              >
                {/* Removed ambient blob */}
                
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
