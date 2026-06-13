import React from "react";
import { ArrowRight, PlayCircle, Lock, Target } from "lucide-react";
import { IntelligenceResult, SkillGapResult } from "@/lib/career/intelligenceEngine";
import { cn } from "@/lib/cn";

export default function PriorityActionItems({ 
  eligibility, 
  skillGap 
}: { 
  eligibility: IntelligenceResult[], 
  skillGap: SkillGapResult 
}) {
  const actions: { title: string; desc: string; type: "critical" | "warning" | "info" }[] = [];

  // Logic to generate prioritized actions
  const badCgpa = eligibility.some(e => e.breakdown.some(b => b.factor === "CGPA" && b.status === "Weak"));
  if (badCgpa) {
    actions.push({
      title: "Boost CGPA above 7.0",
      desc: "You are currently locked out of 40% of Product companies due to strict cutoff filters.",
      type: "critical"
    });
  }

  const badBacklogs = eligibility.some(e => e.breakdown.some(b => b.factor === "Backlogs" && (b.status === "Risk" || b.status === "Weak")));
  if (badBacklogs) {
    actions.push({
      title: "Clear Active Backlogs",
      desc: "Most Tier-1 companies automatically reject profiles with active backlogs during placement.",
      type: "critical"
    });
  }

  if (skillGap.missingSkills.length > 0) {
    actions.push({
      title: `Acquire: ${skillGap.missingSkills[0]}`,
      desc: `This is the highest-value missing skill for the ${skillGap.role} role.`,
      type: "warning"
    });
  }

  if (actions.length < 3 && skillGap.missingSkills.length > 1) {
    actions.push({
      title: `Next Skill: ${skillGap.missingSkills[1]}`,
      desc: "Required by 80% of companies hiring for your target role.",
      type: "info"
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 px-2">
        <h4 className="text-[13px] font-semibold text-[#86868b] uppercase tracking-wider">Priority Actions</h4>
      </div>

      <div className="flex flex-col bg-[#1c1c1e] rounded-[20px] overflow-hidden">
        {actions.slice(0, 3).map((action, i) => (
          <div key={i} className={cn(
            "flex flex-col p-4",
            i !== actions.slice(0,3).length - 1 && "border-b border-white/[0.05]"
          )}>
            <div className="flex items-start gap-4">
              <div className="mt-0.5">
                {action.type === "critical" && <div className="w-3 h-3 rounded-full bg-[#ff3b30]" />}
                {action.type === "warning" && <div className="w-3 h-3 rounded-full bg-[#ff9f0a]" />}
                {action.type === "info" && <div className="w-3 h-3 rounded-full bg-[#0a84ff]" />}
              </div>
              <div className="flex-1 flex flex-col">
                <span className="text-[15px] font-medium text-white">{action.title}</span>
                <span className="text-[13px] text-[#86868b] leading-relaxed mt-1">{action.desc}</span>
                
                {(action.title.includes("Acquire") || action.title.includes("Next Skill")) && (
                  <button 
                    onClick={() => {
                      import("sonner").then((mod) => {
                        mod.toast.success(`Added "${action.title.replace('Acquire: ', '').replace('Next Skill: ', '')}" to your learning planner!`);
                      });
                    }}
                    className="flex items-center gap-2 mt-3 text-[13px] font-medium text-[#0a84ff] bg-[#0a84ff]/10 hover:bg-[#0a84ff]/20 px-3 py-1.5 rounded-full self-start transition-colors"
                  >
                    <PlayCircle className="w-4 h-4" />
                    Add to Planner
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {actions.length === 0 && (
           <div className="p-4 text-center text-[#86868b] text-[13px]">
             No critical actions required at this time.
           </div>
        )}
      </div>
    </div>
  );
}
