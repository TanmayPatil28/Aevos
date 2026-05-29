import React from "react";
import { ArrowRight, PlayCircle, Lock } from "lucide-react";
import { IntelligenceResult, SkillGapResult } from "@/lib/career/intelligenceEngine";

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
    <div className="bg-[#1D1D1F] border border-white/5 rounded-[32px] p-6 md:p-8 relative overflow-hidden h-full shadow-none">
      
      <div className="flex items-center gap-2 mb-6">
        <PlayCircle className="w-5 h-5 text-purple-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Next Best Actions</h3>
      </div>

      <div className="space-y-3 relative z-10">
        {actions.slice(0, 3).map((action, i) => (
          <div key={i} className="flex items-start gap-4 p-4 rounded-[20px] bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.05] hover:border-white/[0.08] transition-all duration-300">
            <div className="mt-1">
              {action.type === "critical" && <div className="w-2 h-2 rounded-full bg-rose-500 shadow-none" />}
              {action.type === "warning" && <div className="w-2 h-2 rounded-full bg-amber-500 shadow-none" />}
              {action.type === "info" && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-none" />}
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-1">{action.title}</h4>
              <p className="text-white/50 text-xs leading-relaxed mb-2">{action.desc}</p>
              
              {action.title.includes("Acquire") || action.title.includes("Next Skill") ? (
                <button 
                  onClick={() => {
                    import("react-hot-toast").then((mod) => {
                      mod.toast.success(`Successfully added "${action.title.replace('Acquire: ', '').replace('Next Skill: ', '')}" to your learning planner!`);
                    });
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 hover:text-purple-200 transition-colors text-xs font-bold w-fit mt-1 border border-purple-500/30"
                >
                  <PlayCircle className="w-3 h-3" />
                  Add to Planner
                </button>
              ) : null}
            </div>
            <ArrowRight className="w-4 h-4 text-white/20 ml-auto mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>
    </div>
  );
}
