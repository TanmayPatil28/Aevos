"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  CheckCircle, 
  Circle, 
  PlayCircle, 
  TrendingUp, 
  ChevronRight, 
  Star,
  GraduationCap
} from "lucide-react";
import GlassCard from "../GlassCard";
import { CAREER_PATHS } from "../../lib/career/careerRegistry";
import { CareerRole } from "../../lib/career/types";

interface SkillGapAdvisorProps {
  currentCgpa: number;
}

export default function SkillGapAdvisor({ currentCgpa }: SkillGapAdvisorProps) {
  const [selectedRole, setSelectedRole] = useState<CareerRole>("SDE");
  
  // Local state for skill status overrides, persisted to localStorage
  const [skillStatuses, setSkillStatuses] = useState<Record<string, "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED">>({});

  // Load custom progress on mount or role swap
  useEffect(() => {
    const key = `gradeflow_skill_gap_${selectedRole}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setSkillStatuses(JSON.parse(saved));
      } catch {
        setSkillStatuses({});
      }
    } else {
      // Initialize from registry default (which is NOT_STARTED)
      const path = CAREER_PATHS[selectedRole];
      const initial: Record<string, "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"> = {};
      path.coreSkills.forEach((skill) => {
        initial[skill.name] = "NOT_STARTED";
      });
      setSkillStatuses(initial);
    }
  }, [selectedRole]);

  const saveProgress = (updated: Record<string, "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED">) => {
    setSkillStatuses(updated);
    const key = `gradeflow_skill_gap_${selectedRole}`;
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const handleCycleStatus = (skillName: string) => {
    const current = skillStatuses[skillName] || "NOT_STARTED";
    let next: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" = "NOT_STARTED";
    if (current === "NOT_STARTED") next = "IN_PROGRESS";
    else if (current === "IN_PROGRESS") next = "COMPLETED";

    const updated = {
      ...skillStatuses,
      [skillName]: next,
    };
    saveProgress(updated);
  };

  const activePath = CAREER_PATHS[selectedRole];
  if (!activePath) return null;

  // Calculate completion percentage
  const totalSkills = activePath.coreSkills.length;
  const completedSkillsCount = activePath.coreSkills.filter(
    (s) => skillStatuses[s.name] === "COMPLETED"
  ).length;


  const completionRate = totalSkills > 0 ? Math.round((completedSkillsCount / totalSkills) * 100) : 0;

  // CGPA match check
  const cgpaMeetsTarget = currentCgpa >= activePath.cgpaTargetRecommendation;
  const cgpaDiff = activePath.cgpaTargetRecommendation - currentCgpa;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-indigo-400" />
          Skill Gap & Elective Advisor
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Map academic focus and industry skill checklists to target career roles.
        </p>
      </div>

      {/* Target Role Selector Tabs */}
      <div className="grid grid-cols-3 gap-3">
        {(Object.keys(CAREER_PATHS) as CareerRole[]).map((roleKey) => {
          const path = CAREER_PATHS[roleKey];
          const isSelected = selectedRole === roleKey;

          return (
            <button
              key={roleKey}
              onClick={() => setSelectedRole(roleKey)}
              className={`p-4 rounded-xl border text-left transition-all duration-300 relative overflow-hidden ${
                isSelected
                  ? "bg-indigo-600/10 border-indigo-500/40 text-white shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                  : "bg-surface/20 border-white/5 text-slate-400 hover:bg-surface/30 hover:border-white/10"
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-500/10 rounded-bl-full pointer-events-none flex items-center justify-center pl-4 pb-4">
                  <Star className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
                </div>
              )}
              <span className="text-[10px] uppercase font-mono tracking-wider block mb-1">
                {roleKey === "SDE" ? "SDE" : roleKey === "DATA_SCIENTIST" ? "Data Science" : "DevOps"}
              </span>
              <span className="font-bold text-sm line-clamp-1">{path.title}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Role details, Target CGPA & Electives */}
        <div className="space-y-6 lg:col-span-1">
          <GlassCard className="border border-white/5 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                {activePath.title}
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {activePath.description}
              </p>
            </div>

            {/* CGPA Recommendation Gate */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Recommended Target CGPA</span>
                <span className="font-mono font-bold text-indigo-400 text-lg">
                  {activePath.cgpaTargetRecommendation.toFixed(2)}
                </span>
              </div>

              <div className="h-[2px] bg-white/5 w-full" />

              <div className="flex items-start gap-3">
                <div className={`mt-0.5 p-1 rounded ${cgpaMeetsTarget ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs text-white font-medium block">
                    {cgpaMeetsTarget ? "CGPA Criteria Met" : "Target Deficiency"}
                  </span>
                  <span className="text-[11px] text-slate-400 leading-relaxed block">
                    {cgpaMeetsTarget
                      ? `Your CGPA (${currentCgpa.toFixed(2)}) is comfortably above the target milestone.`
                      : `You need a +${cgpaDiff.toFixed(2)} CGPA lift to clear typical filters for this role.`}
                  </span>
                </div>
              </div>
            </div>

            {/* Suggested Elective Courses */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-300 block flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                Suggested Electives
              </span>
              <div className="space-y-2">
                {activePath.suggestedElectives.map((elective) => (
                  <div
                    key={elective}
                    className="flex items-center gap-2 p-2 rounded-lg bg-surface/30 border border-white/5 text-xs text-slate-300"
                  >
                    <ChevronRight className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span className="line-clamp-1">{elective}</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Side: Interactive Industry Skill Checklist */}
        <div className="lg:col-span-2 space-y-4">
          <GlassCard className="border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">
                  Core Skill Registry
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click a skill badge to cycle status: Not Started → In Progress → Completed
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-indigo-400 font-mono">
                  {completionRate}%
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">COMPLETED</span>
              </div>
            </div>

            {/* Skill Progress Bar */}
            <div className="w-full bg-slate-950/50 rounded-full h-2 overflow-hidden border border-white/5">
              <motion.div
                className="h-full bg-indigo-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activePath.coreSkills.map((skill) => {
                const status = skillStatuses[skill.name] || "NOT_STARTED";
                
                let badgeStyle = "bg-slate-800/40 border-white/5 text-slate-400";
                let statusIcon = <Circle className="w-4 h-4 shrink-0 text-slate-500" />;
                if (status === "IN_PROGRESS") {
                  badgeStyle = "bg-indigo-500/10 border-indigo-500/20 text-indigo-300";
                  statusIcon = <PlayCircle className="w-4 h-4 shrink-0 text-indigo-400 animate-pulse" />;
                } else if (status === "COMPLETED") {
                  badgeStyle = "bg-emerald-500/10 border-emerald-500/20 text-emerald-300";
                  statusIcon = <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />;
                }

                const importanceBadge = skill.importance === "CRITICAL" 
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                  : skill.importance === "RECOMMENDED"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "bg-slate-500/10 text-slate-400 border border-slate-500/20";

                return (
                  <button
                    key={skill.name}
                    onClick={() => handleCycleStatus(skill.name)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all duration-300 group hover:shadow-md hover:bg-surface/30 ${badgeStyle}`}
                  >
                    <div className="mt-0.5">{statusIcon}</div>
                    <div className="space-y-1.5 flex-grow">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-white text-xs tracking-wide">
                          {skill.name}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-bold shrink-0 ${importanceBadge}`}>
                          {skill.importance}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                        {skill.description}
                      </p>
                      <div className="flex items-center justify-between text-[10px] pt-1 text-slate-400 font-mono">
                        <span>{skill.category}</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 text-indigo-400">
                          Cycle Status
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
