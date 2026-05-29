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
    <div className="bg-[#1D1D1F] border border-white/5 rounded-[32px] p-6 md:p-8 relative overflow-hidden h-full shadow-none flex flex-col justify-between group">
      
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <Users className="w-5 h-5 text-emerald-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Peer Ranking</h3>
        <span className="ml-auto text-[10px] font-bold uppercase bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-white/50 whitespace-nowrap text-center">
          {branch === "Computer Science" ? "CS" : branch}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center py-6 relative z-10">
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mb-2">Overall Percentile</span>
        <div className="flex items-baseline gap-2">
          <span className="text-6xl md:text-7xl font-black tracking-[-0.05em] text-transparent bg-clip-text leading-none bg-gradient-to-b from-emerald-300 to-emerald-600 drop-shadow-none">
            Top {overallPercentile}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 relative z-10">
        <div className="p-4 rounded-[20px] bg-white/[0.02] border border-white/[0.05]">
          <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-1">CGPA Rank</div>
          <div className="text-xl font-bold text-emerald-400">Top {cgpaPercentile}%</div>
        </div>
        <div className="p-4 rounded-[20px] bg-white/[0.02] border border-white/[0.05]">
          <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-1">Skills Rank</div>
          <div className="text-xl font-bold text-emerald-400">Top {skillsPercentile}%</div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-white/20 flex items-start gap-3 relative z-10">
        <TrendingUp className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
        <p className="text-[11px] text-white/40 leading-relaxed">
          This live ranking compares your trajectory against anonymized data from 400+ peers in your branch. Top 15% is the sweet spot for Tier-1.
        </p>
      </div>
    </div>
  );
}
