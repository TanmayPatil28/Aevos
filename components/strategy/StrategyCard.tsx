"use client";

import React from "react";
import { StrategyResult } from "@/lib/strategy/types";
import GlassCard from "../GlassCard";
import { cn } from "@/lib/cn";
import { CheckCircle, AlertTriangle, ShieldCheck, Flame, Compass, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StrategyCardProps {
  strategy: StrategyResult;
  isRecommended?: boolean;
}

export default function StrategyCard({ strategy, isRecommended = false }: StrategyCardProps) {
  const {
    mode,
    label,
    description,
    projectedSgpa,
    projectedCgpa,
    isAchievable,
    courseTargets,
    healthScoreDelta,
    feasibilityScore,
  } = strategy;

  const [isExpanded, setIsExpanded] = React.useState(false);

  // Style configs based on strategy mode
  const modeConfigs = {
    SAFE: {
      borderColor: "border-emerald-500/30 hover:border-emerald-500/60",
      glowColor: "shadow-emerald-500/5",
      badgeBg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
      icon: ShieldCheck,
      colorClass: "text-emerald-400",
      progressColor: "stroke-emerald-400",
    },
    BALANCED: {
      borderColor: "border-blue-500/30 hover:border-blue-500/60",
      glowColor: "shadow-blue-500/5",
      badgeBg: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
      icon: Compass,
      colorClass: "text-blue-400",
      progressColor: "stroke-blue-400",
    },
    AGGRESSIVE: {
      borderColor: "border-violet-500/30 hover:border-violet-500/60",
      glowColor: "shadow-violet-500/5",
      badgeBg: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
      icon: Flame,
      colorClass: "text-violet-400",
      progressColor: "stroke-violet-400",
    },
  };

  const config = modeConfigs[mode] || modeConfigs.BALANCED;
  const IconComponent = config.icon;

  // Circle properties for feasibility progress
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (feasibilityScore / 100) * circumference;

  return (
    <GlassCard
      className={cn(
        "relative flex flex-col justify-between border transition-all duration-300",
        config.borderColor,
        config.glowColor,
        isRecommended && "ring-2 ring-primary/40"
      )}
      interactive={true}
    >
      {isRecommended && (
        <div className="absolute -top-3 right-6 bg-gradient-to-r from-primary to-purple-600 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full shadow-md z-20">
          Recommended Path
        </div>
      )}

      {/* Header Info */}
      <div className="relative">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("p-2.5 rounded-xl bg-white/5", config.colorClass)}>
              <IconComponent size={20} />
            </div>
            <div>
              <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-md", config.badgeBg)}>
                {mode}
              </span>
              <h3 className="text-xl font-bold mt-1 text-white tracking-tight">{label}</h3>
            </div>
          </div>

          {/* Feasibility Circle */}
          <div className="relative flex items-center justify-center">
            <svg className="w-14 h-14 transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r={radius}
                className="stroke-white/5 fill-transparent"
                strokeWidth="4"
              />
              <motion.circle
                cx="28"
                cy="28"
                r={radius}
                className={cn("fill-transparent", config.progressColor)}
                strokeWidth="4"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[11px] font-bold text-white leading-none">{feasibilityScore}%</span>
              <span className="text-[7px] text-white/40 uppercase mt-0.5 leading-none">Feasible</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-white/60 mb-6 min-h-[40px]">{description}</p>

        {/* Projections Matrix */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 mb-6">
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Projected SGPA</div>
            <div className="text-2xl font-bold text-white mt-1">
              {projectedSgpa.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Projected CGPA</div>
            <div className="text-2xl font-bold text-white mt-1 flex items-baseline gap-1.5">
              <span>{projectedCgpa.toFixed(2)}</span>
              {projectedCgpa > strategy.courseTargets[0]?.targetGradePoint ? ( // arbitrary check placeholder
                <span className="text-xs text-emerald-400 font-semibold">▲</span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Metadata Details */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center text-xs">
            <span className="text-white/40">Status:</span>
            <span className={cn("font-semibold flex items-center gap-1", isAchievable ? "text-emerald-400" : "text-amber-400")}>
              {isAchievable ? (
                <>
                  <CheckCircle size={12} /> Achievable
                </>
              ) : (
                <>
                  <AlertTriangle size={12} /> Challenging
                </>
              )}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-white/40">Academic Health Impact:</span>
            <span className={cn(
              "font-semibold flex items-center gap-0.5",
              healthScoreDelta > 0 ? "text-emerald-400" : healthScoreDelta < 0 ? "text-red-400" : "text-white/60"
            )}>
              {healthScoreDelta > 0 ? `+${healthScoreDelta}` : healthScoreDelta} pts
            </span>
          </div>
        </div>
      </div>

      {/* Courses Accordion Toggle */}
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-xs py-2 px-3 border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] transition-colors rounded-lg text-white/80"
        >
          <span>Course Targets ({courseTargets.length})</span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-3 space-y-2 max-h-[250px] overflow-y-auto pr-1 mt-1 scrollbar-thin">
                {courseTargets.map((course) => {
                  const difficultyColor = 
                    course.difficultyWeight > 0.6 
                      ? "text-red-400 bg-red-500/10 border-red-500/25"
                      : course.difficultyWeight > 0.3
                      ? "text-amber-400 bg-amber-500/10 border-amber-500/25"
                      : "text-emerald-400 bg-emerald-500/10 border-emerald-500/25";

                  return (
                    <div
                      key={course.courseId}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-lg border text-xs bg-white/[0.01]",
                        course.isFixed ? "border-white/5 opacity-60" : "border-white/5"
                      )}
                    >
                      <div className="max-w-[70%]">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <span>{course.courseCode}</span>
                          {course.isFixed && (
                            <span className="text-[9px] uppercase font-bold text-white/40 bg-white/5 px-1 py-0.2 rounded">
                              Graded
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-white/50 truncate mt-0.5">
                          {course.courseName} ({course.credits} Cr)
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={cn("text-[9px] px-1.5 py-0.5 rounded-md border", difficultyColor)}>
                          {course.isFixed ? "Fixed" : `Diff: ${Math.round(course.difficultyWeight * 100)}%`}
                        </span>
                        <div className="font-bold text-white bg-white/5 px-2.5 py-1 rounded text-right min-w-[32px]">
                          {course.targetGrade}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}
