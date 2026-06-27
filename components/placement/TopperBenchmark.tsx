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
      <div className="flex flex-col flex-1 px-6 py-5 hover:bg-white/[0.02] transition-colors group cursor-default">
         <span className="text-[12px] font-semibold text-foreground-muted mb-2 block">
           Overall Rank
         </span>
         <div className="flex flex-wrap xl:flex-nowrap items-center gap-3">
           <span className="text-2xl font-bold tracking-tight text-foreground">
             Top {overallPercentile}%
           </span>
           <span className="text-[13px] font-bold uppercase tracking-wider text-foreground-muted whitespace-nowrap">
             {branch === "Computer Science" ? "CS" : branch}
           </span>
         </div>
      </div>

      <div className="flex flex-col flex-1 px-6 py-5 hover:bg-white/[0.02] transition-colors group cursor-default">
         <span className="text-[12px] font-semibold text-foreground-muted mb-2 block">
           CGPA
         </span>
         <div className="flex items-center gap-3">
           <span className="text-2xl font-bold tracking-tight text-foreground">
             Top {cgpaPercentile}%
           </span>
         </div>
      </div>

      <div className="flex flex-col flex-1 px-6 py-5 hover:bg-white/[0.02] transition-colors group cursor-default">
         <span className="text-[12px] font-semibold text-foreground-muted mb-2 block">
           Skills
         </span>
         <div className="flex items-center gap-3">
           <span className="text-2xl font-bold tracking-tight text-foreground">
             Top {skillsPercentile}%
           </span>
         </div>
      </div>
    </>
  );
}
