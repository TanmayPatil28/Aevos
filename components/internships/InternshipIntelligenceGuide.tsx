"use client";

import { motion } from "framer-motion";
import { Target, CheckCircle2, XCircle, ExternalLink, Zap } from "lucide-react";
import { cn } from "@/lib/cn";
import { InternshipMatch } from "./InternshipLedgerRow";
import FluidDataWave from "@/components/placement/FluidDataWave";
import { MagneticWrapper } from "@/components/ui/MagneticWrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/Card";

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
      <div className="w-full mt-6 relative z-10 flex flex-col items-center justify-center min-h-[300px] rounded-[24px] bg-surface-raised overflow-hidden py-8 shadow-sm">
        
        {/* Subtle Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand/5 to-transparent opacity-50" />
        
        {/* Minimal Tech Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)", backgroundSize: "24px 24px" }}
        />

        <div className="relative z-20 flex flex-col items-center text-center px-6 max-w-md w-full">
          
          {/* Refined Icon Container */}
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-surface shadow-sm mb-6">
             <div className="absolute inset-0 bg-brand/5 rounded-2xl" />
             <Target className="text-brand w-6 h-6 opacity-80" strokeWidth={1.5} />
          </div>
          
          {/* Clean Enterprise Typography */}
          <h3 className="text-[18px] font-semibold text-foreground tracking-tight mb-2">
            Select an Internship
          </h3>
          
          <p className="text-[14px] text-foreground-muted leading-relaxed mb-8">
            Pin or select an internship from the ledger to unlock its detailed intelligence guide and skill matching.
          </p>

          {/* Minimal Status Indicator */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-background shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-40"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand opacity-80"></span>
            </span>
            <span className="text-[12px] font-medium text-foreground-muted tracking-wide">System Idle</span>
          </div>

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
          <h3 className="text-[34px] font-bold text-foreground tracking-tight leading-tight">{match.title}</h3>
          <p className="text-foreground-muted text-[15px] mt-1">{match.company} • Internship Intelligence Guide</p>
        </div>

        <MagneticWrapper strength={0.4}>
          <Button 
            variant="primary"
            onClick={() => window.open(match.url, "_blank", "noopener,noreferrer")}
            className="flex items-center justify-center gap-2 px-6 py-2.5 text-[14px] shadow-lg whitespace-nowrap"
          >
            Apply Now <ExternalLink size={16} />
          </Button>
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

            <Card variant="default" className="flex flex-col !p-0 border-[#ffd60a]/20 shadow-[0_0_20px_rgba(255,214,10,0.05)]">
              <div className="p-4 border-b border-white/[0.05] bg-[#ffd60a]/5">
                <p className="text-[14px] text-[#ffd60a]/90 font-medium">
                  This role was discovered by your Autonomous Web Scraper Agent bypassing standard APIs and crawling deep-tech boards.
                </p>
              </div>
              <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/[0.05]">
                <div className="flex-1 p-4 flex flex-col gap-1">
                  <span className="text-[12px] text-foreground-muted uppercase tracking-wider font-semibold">Est. Compensation</span>
                  <span className="text-[18px] text-foreground font-bold">{match.compensation || "Competitive"}</span>
                </div>
                <div className="flex-1 p-4 flex flex-col gap-1">
                  <span className="text-[12px] text-foreground-muted uppercase tracking-wider font-semibold">Application Deadline</span>
                  <span className="text-[18px] text-foreground font-bold">{match.deadline || "Rolling"}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Rationale Match Panel */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[13px] font-semibold text-foreground-muted uppercase tracking-wider">Why it's a match</h4>
          </div>

          <Card variant="default">
            <p className="text-[15px] text-foreground-muted leading-relaxed">
              {match.rationale}
            </p>
          </Card>
        </div>

        {/* Live Profile vs Internship Diff */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[13px] font-semibold text-foreground-muted uppercase tracking-wider">Profile Match</h4>
          </div>

          <Card variant="default" className="flex flex-col !p-0">
            
            {/* Score Row */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.05]">
              <div className="flex items-center gap-4">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shadow-sm", match.score >= 50 ? "bg-brand shadow-brand/20" : "bg-[#ff3b30] shadow-[#ff3b30]/20")}>
                  {match.score >= 50 ? <CheckCircle2 size={18} className="text-black" /> : <XCircle size={18} className="text-black" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-medium text-foreground">Overall Readiness</span>
                  <span className="text-[13px] text-foreground-muted">Determined by AI matcher</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn("text-[17px] font-bold", match.score >= 80 ? "text-brand" : match.score >= 50 ? "text-[#ff9f0a]" : "text-[#ff3b30]")}>{match.score}%</span>
              </div>
            </div>

            {/* Skills Match Row */}
            <div className="flex flex-col p-4">
              <div className="text-[15px] font-medium text-foreground mb-3 flex items-center gap-2">Required Technical Stack</div>
              {reqSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skillMatches.map((skill, idx) => {
                    if (skill.isMatched) {
                      return (
                        <Badge key={skill.name} variant="brand" size="md" staggerIndex={idx}>
                          {skill.name}
                        </Badge>
                      );
                    }
                    
                    return (
                      <Badge 
                        key={skill.name}
                        variant="critical" 
                        size="md" 
                        staggerIndex={idx}
                        onClick={onNavigateToSkills}
                        className="cursor-pointer"
                      >
                        {skill.name}
                      </Badge>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[13px] text-foreground-muted">No specific technical skills were explicitly listed for this role.</p>
              )}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
