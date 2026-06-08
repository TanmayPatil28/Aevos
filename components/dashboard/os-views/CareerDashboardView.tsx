"use client";

import React from "react";
import { motion } from "framer-motion";
import { Briefcase, Map, GitMerge, Code2, Terminal, Award, Target } from "lucide-react";
import { useUSMStore } from "@/stores/usmStore";
import { selectDerivedGPA } from "@/stores/selectors/academic";
import AnimatedCounter from "@/components/AnimatedCounter";
import { intelligenceEngine } from "@/lib/career/intelligenceEngine";
import { ROLE_SKILL_MAP } from "@/lib/career/careerData";
export default function CareerDashboardView() {
  const store = useUSMStore();
  const { cgpa } = selectDerivedGPA(store);
  
  const backlogs = store.academic.activeBacklogsCount;
  const earnedCredits = store.academic.earnedCredits;
  const { skills, targetRole, branch } = store.career;

  const placementRisk = intelligenceEngine.calculatePlacementRisk({
    cgpa,
    backlogs,
    earnedCredits,
    branch,
    skills,
    targetRole
  });
  
  const readinessScore = Math.round(placementRisk.averageEligibility);
  const probabilityLabel = placementRisk.readinessScore;

  const roleMap = ROLE_SKILL_MAP[targetRole] || ROLE_SKILL_MAP["Frontend Developer"];
  const levels = [
    { key: "level_1_basics", name: "Level 1: Basics", color: "bg-blue-500" },
    { key: "level_2_core", name: "Level 2: Core", color: "bg-emerald-500" },
    { key: "level_3_intermediate", name: "Level 3: Intermediate", color: "bg-yellow-500" },
    { key: "level_4_advanced", name: "Level 4: Advanced", color: "bg-purple-500" },
  ];

  const userSkillsNorm = skills.map(s => s.toLowerCase());
  const dynamicSkills = levels.map(lvl => {
    const req = roleMap[lvl.key] || [];
    const present = req.filter(r => userSkillsNorm.some(u => r.toLowerCase().includes(u) || u.includes(r.toLowerCase()))).length;
    const val = req.length > 0 ? Math.round((present / req.length) * 100) : 0;
    return { name: lvl.name, val, color: lvl.color };
  });

  const timeline = intelligenceEngine.generateTimeline(store.academic.completedSemesters);
  const activeTimeline = timeline.filter(t => t.status === "CURRENT" || t.status === "FUTURE").slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Placement Readiness Hero Metric */}
        <div className="lg:col-span-4 bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] ring-1 ring-white/5 relative overflow-hidden group hover:bg-white/[0.02] transition-all flex flex-col justify-between min-h-[260px]">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Briefcase className="w-32 h-32 text-purple-400" /></div>
          <div className="relative z-10">
            <div className="text-sm text-slate-400 uppercase font-bold tracking-wider mb-3">Placement Readiness</div>
            <div className="flex items-baseline gap-2">
              <AnimatedCounter target={readinessScore} className="text-6xl font-black text-white" />
              <span className="text-lg text-slate-500">/ 100</span>
            </div>
            <div className="text-sm text-purple-400 mt-3 font-mono flex items-center gap-1.5">
              <Award className="w-4 h-4" /> {probabilityLabel}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-white/10 flex justify-between text-sm font-bold text-slate-400 relative z-10">
            <span>CGPA: <AnimatedCounter target={cgpa} decimals={2} /></span>
            <span>Backlogs: <AnimatedCounter target={backlogs} /></span>
          </div>
        </div>

        {/* Developer Presence (GitHub & LeetCode) */}
        <div className="lg:col-span-8 bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] ring-1 ring-white/5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-400" /> Developer Presence
            </h3>
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold border border-white/10 px-2 py-1 rounded-full">Coming Soon</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex flex-col justify-center items-center text-center group cursor-not-allowed">
              <GitMerge className="w-8 h-8 text-slate-600 mb-3 group-hover:text-white/40 transition-colors" />
              <div className="text-sm font-bold text-white/50">GitHub Integration</div>
              <div className="text-xs text-slate-500 mt-1 max-w-[150px]">Track commits, PRs, and top repositories.</div>
            </div>
            
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex flex-col justify-center items-center text-center group cursor-not-allowed">
              <Code2 className="w-8 h-8 text-slate-600 mb-3 group-hover:text-yellow-500/40 transition-colors" />
              <div className="text-sm font-bold text-white/50">LeetCode Sync</div>
              <div className="text-xs text-slate-500 mt-1 max-w-[150px]">DSA progress and contest ratings.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Skills Matrix / Radar Chart Placeholder */}
        <div className="lg:col-span-6 bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] ring-1 ring-white/5">
          <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
            <Target className="w-6 h-6 text-emerald-400" /> Skills Matrix ({targetRole})
          </h3>
          <div className="flex flex-col gap-4">
            {dynamicSkills.map(skill => (
              <div key={skill.name}>
                <div className="flex justify-between text-xs font-bold mb-1.5 text-slate-400">
                  <span>{skill.name}</span>
                  <span>{skill.val}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.val}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className={`h-full ${skill.color}`} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Internship & Project Roadmap */}
        <div className="lg:col-span-6 bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] ring-1 ring-white/5">
          <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
            <Map className="w-6 h-6 text-amber-400" /> Career Roadmap
          </h3>
          <div className="relative border-l-2 border-white/10 ml-3 space-y-6">
            
            {activeTimeline.map((item, idx) => (
              <div key={idx} className="relative pl-6">
                <div className={`absolute w-4 h-4 bg-[#000000] border-2 ${item.status === "CURRENT" ? "border-emerald-500" : "border-slate-600"} rounded-full -left-[9px] top-1`} />
                <div className={`text-xs font-bold ${item.status === "CURRENT" ? "text-emerald-400" : "text-slate-500"} mb-0.5`}>
                  {item.status === "CURRENT" ? "Current Focus" : `Semester ${item.sem} Target`}
                </div>
                <div className={`text-sm font-bold ${item.status === "CURRENT" ? "text-white" : "text-slate-300"}`}>{item.title}</div>
                <div className={`text-xs ${item.status === "CURRENT" ? "text-slate-400" : "text-slate-500"} mt-1`}>{item.tasks.join(" • ")}</div>
              </div>
            ))}

            {activeTimeline.length === 0 && (
              <div className="text-slate-400 text-sm">No upcoming roadmap items.</div>
            )}

          </div>
        </div>
      </div>
    </motion.div>
  );
}
