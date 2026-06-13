"use client";

import { motion } from "framer-motion";
import { Target, CheckCircle2, XCircle, ExternalLink, Zap } from "lucide-react";
import { cn } from "@/lib/cn";
import { InternshipMatch } from "./InternshipLedgerRow";
import FluidDataWave from "@/components/placement/FluidDataWave";
import { MagneticWrapper } from "@/components/ui/MagneticWrapper";

interface GuideProps {
  match: InternshipMatch | null;
  userSkills: string[];
  onNavigateToSkills?: () => void;
}

export default function InternshipIntelligenceGuide({ 
  match, 
  userSkills, 
  onNavigateToSkills
}: GuideProps) {

  if (!match) {
    return (
      <div className="w-full mt-8 relative z-10 flex flex-col pb-8 border-b border-[#23252a]/50">
        <div className="absolute inset-0 opacity-10">
           <FluidDataWave />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-20 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-2xl">
            <Target className="text-white/70" size={32} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Select an Internship</h3>
          <p className="text-[#86868b] max-w-xs font-medium text-sm">Pin or select an internship from the ledger to unlock its detailed intelligence guide and skill matching.</p>
        </div>
      </div>
    );
  }

  // Diff Skills
  const reqSkills = match.requiredSkills || [];
  const normalizedUserSkills = userSkills.map(s => s.toLowerCase().trim());
  const skillMatches = reqSkills.map(req => {
    const reqLower = req.toLowerCase().trim();
    const isMatched = normalizedUserSkills.some(s => s.includes(reqLower) || reqLower.includes(s));
    return { name: req, isMatched };
  });

  return (
    <div className="w-full relative z-10 flex flex-col pb-6">
      
      {/* Header */}
      <div className="pb-6 flex flex-col xl:flex-row gap-6 items-start xl:items-end justify-between px-2 pt-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-[12px] font-semibold tracking-wide",
              match.score >= 80 ? "text-[#34c759]" :
              match.score >= 50 ? "text-[#ff9f0a]" : "text-[#ff3b30]"
            )}>{match.score}% Match Score</span>
          </div>
          <h3 className="text-[34px] font-bold text-white tracking-tight leading-tight">{match.title}</h3>
          <p className="text-[#86868b] text-[15px] mt-1">{match.company} • Internship Intelligence Guide</p>
        </div>

        <MagneticWrapper strength={0.4}>
          <a 
            href={match.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-2.5 text-[14px] font-bold text-black bg-white hover:bg-white/90 rounded-full transition-all shadow-lg outline-none whitespace-nowrap"
          >
            Apply Now <ExternalLink size={16} />
          </a>
        </MagneticWrapper>
      </div>

      <div className="flex flex-col gap-8">
        
        {/* Agentic Insights for Hidden Gems */}
        {match.isHiddenGem && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-2">
              <h4 className="text-[13px] font-semibold text-[#ffd60a] uppercase tracking-wider flex items-center gap-2">
                <Zap size={14} className="fill-[#ffd60a]" /> Agentic Discovery
              </h4>
            </div>

            <div className="flex flex-col bg-[#1c1c1e] rounded-[20px] overflow-hidden border border-[#ffd60a]/20 shadow-[0_0_20px_rgba(255,214,10,0.05)]">
              <div className="p-4 border-b border-white/[0.05] bg-[#ffd60a]/5">
                <p className="text-[14px] text-[#ffd60a]/90 font-medium">
                  This role was discovered by your Autonomous Web Scraper Agent bypassing standard APIs and crawling deep-tech boards.
                </p>
              </div>
              <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/[0.05]">
                <div className="flex-1 p-4 flex flex-col gap-1">
                  <span className="text-[12px] text-[#86868b] uppercase tracking-wider font-semibold">Est. Compensation</span>
                  <span className="text-[18px] text-white font-bold">{match.compensation || "Competitive"}</span>
                </div>
                <div className="flex-1 p-4 flex flex-col gap-1">
                  <span className="text-[12px] text-[#86868b] uppercase tracking-wider font-semibold">Application Deadline</span>
                  <span className="text-[18px] text-white font-bold">{match.deadline || "Rolling"}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rationale Match Panel */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[13px] font-semibold text-[#86868b] uppercase tracking-wider">Why it's a match</h4>
          </div>

          <div className="flex flex-col bg-[#1c1c1e] rounded-[20px] overflow-hidden p-6 border border-white/[0.04]">
            <p className="text-[15px] text-[#86868b] leading-relaxed">
              {match.rationale}
            </p>
          </div>
        </div>

        {/* Live Profile vs Internship Diff */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[13px] font-semibold text-[#86868b] uppercase tracking-wider">Profile Match</h4>
          </div>

          <div className="flex flex-col bg-[#1c1c1e] rounded-[20px] overflow-hidden">
            
            {/* Score Row */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.05]">
              <div className="flex items-center gap-4">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", match.score >= 50 ? "bg-[#34c759]" : "bg-[#ff3b30]")}>
                  {match.score >= 50 ? <CheckCircle2 size={18} className="text-white" /> : <XCircle size={18} className="text-white" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-medium text-white">Overall Readiness</span>
                  <span className="text-[13px] text-[#86868b]">Determined by AI matcher</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn("text-[17px] font-bold", match.score >= 80 ? "text-[#34c759]" : match.score >= 50 ? "text-[#ff9f0a]" : "text-[#ff3b30]")}>{match.score}%</span>
              </div>
            </div>

            {/* Skills Match Row */}
            <div className="flex flex-col p-4">
              <div className="text-[15px] font-medium text-white mb-3 flex items-center gap-2">Required Technical Stack</div>
              {reqSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skillMatches.map(skill => {
                    if (skill.isMatched) {
                      return (
                        <div key={skill.name} className="flex items-center gap-1.5 text-[13px] px-3 py-1.5 rounded-[10px] bg-[#34c759]/15 text-[#34c759] font-medium border border-[#34c759]/20">
                          {skill.name}
                        </div>
                      );
                    }
                    
                    return (
                      <button 
                        key={skill.name}
                        onClick={onNavigateToSkills}
                        className="group flex items-center gap-1.5 text-[13px] px-3 py-1.5 rounded-[10px] bg-white/5 text-[#86868b] hover:bg-white/10 hover:text-white transition-all outline-none cursor-pointer border border-white/[0.05]"
                      >
                        {skill.name}
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#ff3b30]/10 text-[#ff3b30] rounded-full uppercase tracking-wider ml-1">Missing</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[13px] text-[#86868b]">No specific technical skills were explicitly listed for this role.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
