import React from "react";
import { ArrowRight, PlayCircle, Lock, Target } from "lucide-react";
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
    <div className="bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 relative overflow-hidden h-full shadow-2xl">
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="p-2 bg-[#0a84ff]/20 rounded-xl">
          <Target className="w-5 h-5 text-[#0a84ff]" />
        </div>
        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest">Priority Actions</h3>
      </div>

      <div className="flex flex-col gap-0 bg-white/5 border border-white/5 rounded-3xl overflow-hidden relative z-10">
        {actions.slice(0, 3).map((action, i) => (
          <div key={i} className={`group flex items-start gap-4 p-5 bg-white/0 hover:bg-white/[0.05] transition-all duration-300 ${i !== actions.slice(0,3).length - 1 ? 'border-b border-white/[0.05]' : ''}`}>
            <div className="mt-1">
              {action.type === "critical" && <div className="w-3 h-3 rounded-full bg-[#ff453a] shadow-[0_0_10px_rgba(255,69,58,0.5)]" />}
              {action.type === "warning" && <div className="w-3 h-3 rounded-full bg-[#ff9f0a] shadow-[0_0_10px_rgba(255,159,10,0.5)]" />}
              {action.type === "info" && <div className="w-3 h-3 rounded-full bg-[#0a84ff] shadow-[0_0_10px_rgba(10,132,255,0.5)]" />}
            </div>
            <div className="flex-1">
              <h4 className="text-white font-semibold text-base mb-1">{action.title}</h4>
              <p className="text-white/50 text-sm leading-relaxed mb-3">{action.desc}</p>
              
              {action.title.includes("Acquire") || action.title.includes("Next Skill") ? (
                <button 
                  onClick={() => {
                    import("react-hot-toast").then((mod) => {
                      mod.toast.success(`Added "${action.title.replace('Acquire: ', '').replace('Next Skill: ', '')}" to your learning planner!`);
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-xs font-semibold w-fit border border-white/5 text-white/80"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  Add to Planner
                </button>
              ) : null}
            </div>
          </div>
        ))}
        {actions.length === 0 && (
           <div className="p-6 text-center text-white/50 text-sm">
             You are perfectly positioned. No critical actions required!
           </div>
        )}
      </div>
    </div>
  );
}
