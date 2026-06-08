import React from "react";
import { TrendingUp, Users } from "lucide-react";

interface TopperBenchmarkProps {
  userCgpa: number;
  userCredits: number;
  userSkillsCount: number;
  branch: string;
}

export default function TopperBenchmark({ userCgpa, userCredits, userSkillsCount, branch }: TopperBenchmarkProps) {
  // Mock Percentile Calculation
  const cgpaPercentile = userCgpa >= 9.5 ? 1 : userCgpa >= 9.0 ? 5 : userCgpa >= 8.5 ? 12 : userCgpa >= 8.0 ? 25 : userCgpa >= 7.0 ? 45 : 70;
  const skillsPercentile = userSkillsCount >= 10 ? 1 : userSkillsCount >= 8 ? 8 : userSkillsCount >= 5 ? 22 : userSkillsCount >= 3 ? 45 : 80;
  const overallPercentile = Math.round((cgpaPercentile + skillsPercentile) / 2);

  return (
    <div className="bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 relative overflow-hidden h-full shadow-2xl flex flex-col justify-between">
      
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="p-2 bg-[#bf5af2]/20 rounded-xl">
          <Users className="w-5 h-5 text-[#bf5af2]" />
        </div>
        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest">Peer Ranking</h3>
        <span className="ml-auto text-xs font-bold uppercase bg-white/10 px-3 py-1.5 rounded-full text-white/70">
          {branch === "Computer Science" ? "CS" : branch}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center py-6 relative z-10">
        <div className="flex items-baseline gap-2">
          <span className="text-7xl md:text-[7rem] font-black tracking-tighter text-transparent bg-clip-text leading-none bg-gradient-to-b from-[#bf5af2] to-[#bf5af2]/50">
            Top {overallPercentile}%
          </span>
        </div>
        <span className="text-sm font-medium text-white/40 mt-4">Overall Percentile</span>
      </div>

      <div className="grid grid-cols-2 gap-4 relative z-10">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
          <div className="text-[11px] uppercase tracking-widest text-white/40 font-bold mb-1">CGPA Rank</div>
          <div className="text-2xl font-bold text-[#bf5af2]">Top {cgpaPercentile}%</div>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
          <div className="text-[11px] uppercase tracking-widest text-white/40 font-bold mb-1">Skills Rank</div>
          <div className="text-2xl font-bold text-[#bf5af2]">Top {skillsPercentile}%</div>
        </div>
      </div>
      
      <div className="mt-6 flex items-start gap-3 relative z-10 bg-white/5 p-4 rounded-2xl">
        <TrendingUp className="w-5 h-5 text-[#bf5af2] mt-0.5 shrink-0" />
        <p className="text-sm text-white/60 leading-relaxed">
          This live ranking compares your trajectory against anonymized data from 400+ peers in your branch. Top 15% is the sweet spot for Tier-1.
        </p>
      </div>
    </div>
  );
}
