"use client";

import React from "react";
import { motion } from "framer-motion";
import { School, Zap, Shield, BookOpen } from "lucide-react";
import { useUniversity } from "@/components/providers/UniversityProvider";
import { clsx } from "clsx";

/**
 * PresetInfoCard — Contextual university preset display for feature pages.
 * Shows the active university's key academic parameters at a glance.
 * Entirely driven by preset data — zero university-specific logic.
 */
export default function PresetInfoCard({ compact = false }: { compact?: boolean }) {
  const { activePreset, creditLabel, isRelativeGrading, maxGradePoint } = useUniversity();

  const evalConfig = {
    absolute: { label: "Absolute Grading", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", icon: Shield },
    relative: { label: "Relative Grading", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", icon: Zap },
    hybrid:   { label: "Hybrid Grading",   color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/20",   icon: Zap },
  }[activePreset.evaluationModel] || { label: "Unknown", color: "text-white/50", bg: "bg-white/5", border: "border-white/10", icon: School };

  const EvalIcon = evalConfig.icon;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.02] border border-white/[0.05] w-fit"
      >
        <School size={14} className="text-[#4F8EF7]" />
        <span className="text-[11px] font-bold text-white/70 tracking-tight">{activePreset.shortName}</span>
        <span className="text-white/[0.06]">|</span>
        <span className={clsx("text-[10px] font-bold", evalConfig.color)}>{activePreset.evaluationModel}</span>
        <span className="text-white/[0.06]">|</span>
        <span className="text-[10px] font-medium text-white/30">{activePreset.gradingSystem}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-[20px] bg-white/[0.02] border border-white/[0.06] p-5 relative overflow-hidden group hover:border-[#4F8EF7]/20 transition-all duration-500"
    >
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#4F8EF7]/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#4F8EF7]/10 border border-[#4F8EF7]/15 flex items-center justify-center">
            <School size={18} className="text-[#4F8EF7]" />
          </div>
          <div>
            <h3 className="text-[14px] font-black text-white tracking-tight">{activePreset.shortName}</h3>
            <p className="text-[11px] text-white/30 font-medium">{activePreset.name}</p>
          </div>
        </div>
        <div className={clsx(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
          evalConfig.bg, evalConfig.color, evalConfig.border
        )}>
          <EvalIcon size={10} />
          {activePreset.evaluationModel}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 relative z-10">
        <InfoPill label="System" value={activePreset.gradingSystem} icon={<BookOpen size={10} className="text-white/20" />} />
        <InfoPill label="Max GP" value={maxGradePoint.toString()} icon={<Zap size={10} className="text-white/20" />} />
        <InfoPill label={creditLabel} value={activePreset.totalProgramCredits ? `${activePreset.totalProgramCredits} total` : "Standard"} />
        {activePreset.sgpaToPercentage && (
          <InfoPill label="% Formula" value={activePreset.sgpaToPercentage} mono />
        )}
      </div>

      {/* Grade Scale Preview */}
      <div className="mt-4 relative z-10">
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/15 mb-2">Grade Scale</div>
        <div className="flex flex-wrap gap-1">
          {activePreset.gradeScale
            .filter(g => g.points > 0)
            .sort((a, b) => b.points - a.points)
            .map((g) => (
              <span
                key={g.grade}
                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white/[0.03] text-white/50 border border-white/[0.05] hover:bg-white/[0.06] hover:text-white/70 transition-all"
              >
                {g.grade}
                <span className="text-white/20 ml-1">{g.points}</span>
              </span>
            ))}
        </div>
      </div>

      {/* Relative Grading Notice */}
      {isRelativeGrading && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 px-3 py-2 rounded-xl bg-amber-500/5 border border-amber-500/15 relative z-10"
        >
          <div className="flex items-start gap-2">
            <Zap size={12} className="text-amber-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-amber-400">Relative Grading Active</span>
              <p className="text-[9px] text-amber-200/50 leading-relaxed mt-0.5">
                {activePreset.relativeGrading?.curveDescription ||
                 "Grade thresholds determined by class performance distribution. Enter letter grades or grade points directly."}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Info Pill Sub-component ───────────────────────────────────────────────────

function InfoPill({
  label,
  value,
  icon,
  mono = false,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
      <div className="flex items-center gap-1 mb-1">
        {icon}
        <span className="text-[8px] font-black uppercase tracking-[0.15em] text-white/15">{label}</span>
      </div>
      <span className={clsx(
        "text-[11px] font-bold text-white/50 block truncate",
        mono && "font-mono text-[10px]"
      )}>
        {value}
      </span>
    </div>
  );
}
