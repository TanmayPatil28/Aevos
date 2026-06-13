import React from "react";
import { Users, GraduationCap, Code2 } from "lucide-react";

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
    <>
      <div className="flex flex-col flex-1 px-6 py-4 hover:bg-white/[0.02] transition-colors group cursor-default">
         <span className="text-[10px] font-bold uppercase tracking-widest text-[#86868b] flex items-center gap-1.5 mb-2">
           <Users className="w-3.5 h-3.5 text-[#0a84ff]" />
           Overall Rank
         </span>
         <div className="flex flex-wrap xl:flex-nowrap items-baseline gap-2.5">
           <span className="text-3xl font-black tracking-tighter leading-none text-white">
             Top {overallPercentile}%
           </span>
           <span className="text-[9px] font-bold uppercase tracking-widest text-[#0a84ff] px-2 py-0.5 rounded-sm border border-[#0a84ff]/20 bg-[#0a84ff]/10 whitespace-nowrap">
             {branch === "Computer Science" ? "CS" : branch}
           </span>
         </div>
      </div>

      <div className="flex flex-col flex-1 px-6 py-4 hover:bg-white/[0.02] transition-colors group cursor-default">
         <span className="text-[10px] font-bold uppercase tracking-widest text-[#86868b] flex items-center gap-1.5 mb-2">
           <GraduationCap className="w-3.5 h-3.5 text-[#86868b]" />
           CGPA
         </span>
         <div className="flex items-baseline gap-2">
           <span className="text-2xl font-bold tracking-tight text-white leading-none">
             Top {cgpaPercentile}%
           </span>
         </div>
      </div>

      <div className="flex flex-col flex-1 px-6 py-4 hover:bg-white/[0.02] transition-colors group cursor-default">
         <span className="text-[10px] font-bold uppercase tracking-widest text-[#86868b] flex items-center gap-1.5 mb-2">
           <Code2 className="w-3.5 h-3.5 text-[#86868b]" />
           Skills
         </span>
         <div className="flex items-baseline gap-2">
           <span className="text-2xl font-bold tracking-tight text-white leading-none">
             Top {skillsPercentile}%
           </span>
         </div>
      </div>
    </>
  );
}
