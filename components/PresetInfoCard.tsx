"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { School, Zap, Shield, BookOpen, Layers } from "lucide-react";
import { useUniversity, UNI_PRESETS } from "@/components/providers/UniversityProvider";
import { clsx } from "clsx";
import AcademicAuditReport from "./AcademicAuditReport";

/**
 * PresetInfoCard — Contextual university preset display for feature pages.
 * Shows the active university's key academic parameters at a glance.
 * Entirely driven by preset data — zero university-specific logic.
 */
export default function PresetInfoCard({ compact = false }: { compact?: boolean }) {
  const {
    activePreset,
    setSelectedUniId,
    creditLabel,
    isRelativeGrading,
    maxGradePoint,
    isIsolatedFallback,
    isolatedPresetName
  } = useUniversity();
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  const evalConfig = {
    absolute: { label: "Absolute Grading", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", icon: Shield },
    relative: { label: "Relative Grading", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", icon: Zap },
    hybrid:   { label: "Hybrid Grading",   color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/20",   icon: Zap },
  }[activePreset.evaluationModel] || { label: "Unknown", color: "text-white/50", bg: "bg-white/5", border: "border-white/10", icon: School };

  const EvalIcon = evalConfig.icon;

  // Filter and group presets sharing the same canonicalInstitutionId to switch regulations
  const siblingPresets = useMemo(() => {
    if (!activePreset.canonicalInstitutionId) return [];
    return UNI_PRESETS.filter(
      (p) => p.canonicalInstitutionId === activePreset.canonicalInstitutionId
    ).sort((a, b) => (b.regulationYear || 0) - (a.regulationYear || 0));
  }, [activePreset.canonicalInstitutionId]);

  if (compact) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={clsx(
            "flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.02] border w-fit shadow-md",
            isIsolatedFallback ? "border-red-500/20 bg-red-950/10" : "border-white/[0.05]"
          )}
        >
          <School size={14} className={isIsolatedFallback ? "text-red-400" : "text-[#4F8EF7]"} />
          <span className="text-[11px] font-bold text-white/70 tracking-tight text-ellipsis truncate max-w-[150px]">
            {isIsolatedFallback ? `${isolatedPresetName} (Isolated)` : activePreset.shortName}
          </span>
          <span className="text-white/[0.06]">|</span>
          <span className={clsx("text-[10px] font-bold", isIsolatedFallback ? "text-red-400" : evalConfig.color)}>
            {isIsolatedFallback ? "Isolated Fallback" : activePreset.evaluationModel}
          </span>
          <span className="text-white/[0.06]">|</span>
          {isIsolatedFallback ? (
            <button
              onClick={() => setSelectedUniId("jspm")}
              className="text-[10px] font-bold text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 active:scale-95 transition-all"
            >
              ⚠️ Reset
            </button>
          ) : (
            <button
              onClick={() => setIsAuditOpen(true)}
              className="text-[10px] font-bold text-[#4F8EF7] hover:underline flex items-center gap-1"
            >
              🛡️ Audit ({activePreset.trust.confidenceScore}%)
            </button>
          )}
        </motion.div>

        <AcademicAuditReport
          preset={activePreset}
          isOpen={isAuditOpen}
          onClose={() => setIsAuditOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={clsx(
          "rounded-[20px] bg-[#0A0F1A]/95 border p-5 relative overflow-hidden group hover:border-[#4F8EF7]/20 transition-all duration-500 shadow-xl",
          isIsolatedFallback ? "border-red-500/25 bg-gradient-to-b from-[#1C0D0D]/95 to-[#0A0F1A]/95" : "border-white/[0.06]"
        )}
      >
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#4F8EF7]/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        {/* Premium Isolation Warning Banner */}
        {isIsolatedFallback && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-500/5 border border-red-500/15 relative z-10">
            <div className="flex items-start gap-3">
              <span className="text-[16px] mt-0.5 select-none" role="img" aria-label="warning">⚠️</span>
              <div className="flex-1">
                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest block mb-1">
                  Preset Safety Isolation Active
                </span>
                <p className="text-[11px] text-red-200/70 leading-relaxed font-medium">
                  The academic preset for <strong className="text-white">{isolatedPresetName}</strong> was temporarily isolated because its rule formulas failed GradeFlow Trust validation checks. To protect calculations, we are safely running on a standardized 10-point scale.
                </p>
                <button
                  onClick={() => setSelectedUniId("jspm")}
                  className="mt-2.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 hover:border-red-500/40 text-[9px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95"
                >
                  Reset to Verified Preset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header with Title and Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/[0.04] relative z-10">
          <div className="flex items-center gap-3">
            <div className={clsx(
              "w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0",
              isIsolatedFallback 
                ? "bg-red-500/10 border-red-500/20 text-red-400" 
                : "bg-[#4F8EF7]/10 border-[#4F8EF7]/15 text-[#4F8EF7]"
            )}>
              <School size={18} />
            </div>
            <div>
              <h3 className="text-[14px] font-black text-white tracking-tight leading-none">
                {isIsolatedFallback ? "Standard scale (Fallback)" : activePreset.shortName}
              </h3>
              <p className="text-[11px] text-white/30 font-medium mt-1 leading-tight">
                {isIsolatedFallback ? `Isolated: ${isolatedPresetName}` : activePreset.name}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {isIsolatedFallback ? (
              <>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shrink-0 text-red-400 bg-red-400/10 border-red-400/20">
                  <Shield size={10} className="text-red-400" />
                  Isolated
                </div>
                <div
                  title="This preset rules failed trust validation checks and calculation reverted to safe fallback."
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0 text-red-400 bg-red-500/10 border-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.1)]"
                >
                  <span>⚠️ Isolated Fallback</span>
                  <span className="font-mono text-[8px] bg-red-500/20 px-1 py-0.5 rounded leading-none text-red-300">
                    0%
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className={clsx(
                  "flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shrink-0",
                  evalConfig.bg, evalConfig.color, evalConfig.border
                )}>
                  <EvalIcon size={10} />
                  {activePreset.evaluationModel}
                </div>

                <button
                  onClick={() => setIsAuditOpen(true)}
                  className={clsx(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-sm transition-all duration-300 hover:scale-105 shrink-0",
                    activePreset.trust.verificationLevel === "official" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:shadow-[0_0_12px_rgba(16,185,129,0.2)]" :
                    activePreset.trust.verificationLevel === "community" ? "text-blue-400 bg-blue-500/10 border-blue-500/20 hover:shadow-[0_0_12px_rgba(59,130,246,0.2)]" :
                    "text-amber-400 bg-amber-500/10 border-amber-500/20 hover:shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                  )}
                >
                  <span>🛡️ AUDIT</span>
                  <span className="font-mono text-[8px] bg-white/10 px-1 py-0.5 rounded leading-none">
                    {activePreset.trust.confidenceScore}%
                  </span>
                </button>
              </>
            )}
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
        {isRelativeGrading && !isIsolatedFallback && (
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

        {/* Regulation/Pattern Swapper Selector */}
        {siblingPresets.length > 1 && !isIsolatedFallback && (
          <div className="mt-4 border-t border-white/[0.04] pt-4 relative z-10">
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/15 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Layers size={10} className="text-white/20" />
                REGULATION PATTERNS
              </span>
              <span className="text-[8px] text-[#4F8EF7] font-bold">Group Swappable</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {siblingPresets.map((sibling) => (
                <button
                  key={sibling.id}
                  onClick={() => setSelectedUniId(sibling.id)}
                  className={clsx(
                    "px-2.5 py-1.5 rounded-xl text-[10px] font-black tracking-tight border transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-[#4F8EF7]",
                    activePreset.id === sibling.id
                      ? "bg-[#4F8EF7]/10 text-[#4F8EF7] border-[#4F8EF7]/30 shadow-[0_0_10px_rgba(79,142,247,0.15)]"
                      : "bg-white/[0.01] text-white/40 border-white/[0.04] hover:text-white/60 hover:bg-white/[0.03]"
                  )}
                >
                  {sibling.metadata?.patternYear || sibling.shortName || `${sibling.regulationYear} Pattern`}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Trust Audit Modal */}
      <AcademicAuditReport
        preset={activePreset}
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
      />
    </>
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

