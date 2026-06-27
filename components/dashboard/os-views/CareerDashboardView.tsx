"use client";

import React from "react";
import { motion } from "framer-motion";
import { Briefcase, Map, GitMerge, Code2, Terminal, Award, Target } from "lucide-react";
import { useUSMStore } from "@/stores/usmStore";
import { selectDerivedGPA } from "@/stores/selectors/academic";
import AnimatedCounter from "@/components/AnimatedCounter";
import { intelligenceEngine } from "@/lib/career/intelligenceEngine";
import { ROLE_SKILL_MAP } from "@/lib/career/careerData";
import Card from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";

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
    { key: "level_1_basics", name: "Level 1: Basics", color: "bg-zinc-700" },
    { key: "level_2_core", name: "Level 2: Core", color: "bg-zinc-600" },
    { key: "level_3_intermediate", name: "Level 3: Intermediate", color: "bg-zinc-500" },
    { key: "level_4_advanced", name: "Level 4: Advanced", color: "bg-primary" },
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
        <Card variant="default" className="lg:col-span-4 !p-6 border-white/5 flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Briefcase size={16} className="text-primary" />
              <div className="flex flex-col">
                <h3 className="text-[14px] font-semibold text-foreground tracking-tight leading-tight">Placement Readiness</h3>
                <p className="text-[11px] text-foreground-muted uppercase tracking-wider font-semibold">Active Score</p>
              </div>
            </div>
            
            <div className="flex items-baseline gap-2">
              <AnimatedCounter target={readinessScore} className="text-5xl font-black text-white block tracking-tighter" />
              <span className="text-lg text-foreground-muted font-bold">/ 100</span>
            </div>
            
            <div className="text-[12px] text-foreground-muted mt-3 flex items-center gap-1.5 font-semibold">
              <Award className="w-3.5 h-3.5 text-primary" /> {probabilityLabel}
            </div>
          </div>
          
          <div className="mt-6 pt-3 border-t border-white/5 flex justify-between text-[11px] font-bold text-foreground-muted uppercase tracking-wider">
            <span>CGPA: <AnimatedCounter target={cgpa} decimals={2} className="text-white ml-1" /></span>
            <span>Backlogs: <AnimatedCounter target={backlogs} className="text-white ml-1" /></span>
          </div>
        </Card>

        {/* Developer Presence (GitHub & LeetCode) */}
        <Card variant="default" className="lg:col-span-8 !p-6 border-white/5 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Terminal size={16} className="text-zinc-400" />
              <div className="flex flex-col">
                <h3 className="text-[14px] font-semibold text-foreground tracking-tight leading-tight">Developer Presence</h3>
                <p className="text-[11px] text-foreground-muted uppercase tracking-wider font-semibold">Code & Contribution Metrics</p>
              </div>
            </div>
            <Badge variant="brand" size="sm">Coming Soon</Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            <div className="p-4 rounded-xl bg-surface border border-white/5 flex flex-col justify-center items-center text-center group cursor-not-allowed">
              <GitMerge className="w-5 h-5 text-foreground-muted mb-2 group-hover:text-white transition-colors" />
              <div className="text-[13px] font-bold text-foreground">GitHub Integration</div>
              <div className="text-[11px] text-foreground-muted mt-1 max-w-[150px] leading-snug">Track commits, PRs, and top repositories.</div>
            </div>
            
            <div className="p-4 rounded-xl bg-surface border border-white/5 flex flex-col justify-center items-center text-center group cursor-not-allowed">
              <Code2 className="w-5 h-5 text-foreground-muted mb-2 group-hover:text-white transition-colors" />
              <div className="text-[13px] font-bold text-foreground">LeetCode Sync</div>
              <div className="text-[11px] text-foreground-muted mt-1 max-w-[150px] leading-snug">DSA progress and contest ratings.</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Skills Matrix / Radar Chart Placeholder */}
        <Card variant="default" className="lg:col-span-6 !p-6 border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <Target size={16} className="text-zinc-400" />
            <div className="flex flex-col">
              <h3 className="text-[14px] font-semibold text-foreground tracking-tight leading-tight">Skills Matrix ({targetRole})</h3>
              <p className="text-[11px] text-foreground-muted uppercase tracking-wider font-semibold">Core Competencies</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-5">
            {dynamicSkills.map(skill => (
              <div key={skill.name}>
                <div className="flex justify-between items-center text-[11px] font-bold mb-1.5 text-foreground-muted uppercase tracking-wider">
                  <span>{skill.name}</span>
                  <span className="text-white">{skill.val}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.val}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className={`h-full ${skill.val === 100 ? "bg-primary" : skill.color}`} 
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Internship & Project Roadmap */}
        <Card variant="default" className="lg:col-span-6 !p-6 border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <Map size={16} className="text-zinc-400" />
            <div className="flex flex-col">
              <h3 className="text-[14px] font-semibold text-foreground tracking-tight leading-tight">Career Roadmap</h3>
              <p className="text-[11px] text-foreground-muted uppercase tracking-wider font-semibold">Projected Path</p>
            </div>
          </div>
          
          <div className="relative border-l border-white/10 ml-2 space-y-5">
            {activeTimeline.map((item, idx) => (
              <div key={idx} className="relative pl-5">
                <div className={`absolute w-2 h-2 bg-zinc-950 border-2 ${item.status === "CURRENT" ? "border-primary" : "border-zinc-500"} rounded-full -left-[4.5px] top-1.5`} />
                <div className={`text-[10px] uppercase tracking-widest font-bold ${item.status === "CURRENT" ? "text-primary" : "text-foreground-muted"} mb-0.5`}>
                  {item.status === "CURRENT" ? "Current Focus" : `Semester ${item.sem} Target`}
                </div>
                <div className={`text-[13px] font-bold ${item.status === "CURRENT" ? "text-white" : "text-zinc-400"}`}>{item.title}</div>
                <div className={`text-[11px] ${item.status === "CURRENT" ? "text-zinc-400" : "text-zinc-500"} mt-0.5 leading-snug`}>{item.tasks.join(" • ")}</div>
              </div>
            ))}

            {activeTimeline.length === 0 && (
              <div className="text-foreground-muted text-[11px] pl-5">No upcoming roadmap items.</div>
            )}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
