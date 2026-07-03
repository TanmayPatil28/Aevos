"use client";

import React from "react";
import { motion } from "framer-motion";
import { Tooltip } from "@/components/ui/tooltip";

interface MetricsBarProps {
  metrics: {
    ruinProbability: number;
    strategicSkips: number;
    timeCushion: number;
    gradeDegradationRisk: string;
  };
  activeBatchView: string;
  setActiveBatchView: (batch: string) => void;
  dimInsteadOfHide: boolean;
  setDimInsteadOfHide: (val: boolean) => void;
  isCurrentlyEmpty: boolean;
}

export function MetricsBar({
  metrics,
  activeBatchView,
  setActiveBatchView,
  dimInsteadOfHide,
  setDimInsteadOfHide,
  isCurrentlyEmpty
}: MetricsBarProps) {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 items-start xl:items-center px-6 py-4 bg-[var(--aevos-canvas)] border-b border-white/[0.05] shrink-0 gap-y-6 z-30">
      
      {/* Col 1: Batch Controls */}
      <div className="flex flex-col gap-2 shrink-0 h-full justify-center">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-[var(--aevos-text-secondary)] uppercase tracking-wider">Batch</span>
          <div className="flex p-0.5 bg-[var(--aevos-surface)] rounded-full border border-white/[0.05] w-max">
            {[
              { id: 'ALL', label: 'ALL' },
              { id: 'H1', label: 'H1' },
              { id: 'H2', label: 'H2' },
              { id: 'H3', label: 'H3' }
            ].map((batch) => {
              const isActive = activeBatchView === batch.id;
              return (
                <button
                  key={batch.id}
                  onClick={() => setActiveBatchView(batch.id)}
                  className={`relative px-3.5 py-1 text-[11px] font-bold tracking-wide rounded-full transition-colors z-10 ${
                    isActive ? "text-[var(--aevos-on-primary)]" : "text-[var(--aevos-text-secondary)] hover:text-[var(--aevos-text-primary)]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeBatchTab"
                      className="absolute inset-0 bg-[var(--aevos-primary)] rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      style={{ zIndex: -1 }}
                    />
                  )}
                  <span className="relative z-10">{batch.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {activeBatchView !== "ALL" && (
          <label className="flex items-center gap-2 text-[11px] font-medium text-[var(--aevos-text-secondary)] cursor-pointer hover:text-[var(--aevos-text-primary)] transition-colors ml-[50px]">
            <input
              type="checkbox"
              checked={dimInsteadOfHide}
              onChange={(e) => setDimInsteadOfHide(e.target.checked)}
              className="rounded border-[var(--aevos-outline)] bg-[var(--aevos-surface-dim)] text-[var(--aevos-primary)] focus:ring-[var(--aevos-primary)]/50 cursor-pointer"
            />
            Show other batches
          </label>
        )}
      </div>

      {/* Col 2: Detention Risk */}
      <Tooltip
        content={
          <div className="flex flex-col gap-1.5 font-sans">
            <p className="font-semibold text-[var(--aevos-text-primary)]">Detention Risk</p>
            <p className="text-[var(--aevos-text-secondary)] text-xs leading-relaxed">The chance you'll be barred from exams due to low attendance. Calculated using Monte Carlo simulation.</p>
            <div className="mt-1 pt-2 border-t border-white/[0.05] text-[10px] text-[var(--aevos-text-tertiary)] leading-relaxed">
              <span className="text-[var(--aevos-text-secondary)] font-medium">How it works:</span> Simulates 10,000 imagined futures to see how many end with you falling below the 75% threshold.
            </div>
          </div>
        }
        position="bottom"
        className="xl:w-full h-full"
      >
        <div className="flex flex-col justify-center bg-transparent relative cursor-help xl:pl-6 xl:border-l border-white/[0.05] h-full group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="text-[10px] font-sans text-[var(--aevos-text-secondary)] uppercase tracking-widest mb-1">Detention Risk</div>
          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl font-light ${
                isCurrentlyEmpty ? 'text-[var(--aevos-text-tertiary)]' : 
                metrics.ruinProbability > 20 ? 'text-[var(--aevos-status-critical)]' : 
                metrics.ruinProbability > 10 ? 'text-[var(--aevos-status-warning)]' : 
                'text-[var(--aevos-text-primary)]'
              }`}>
                {isCurrentlyEmpty ? "-" : metrics.ruinProbability}
              </span>
              <span className="text-lg font-light text-[var(--aevos-text-tertiary)]">%</span>
            </div>
            <div className="flex flex-col">
              {!isCurrentlyEmpty && (
                <div className={`text-[9px] font-medium ${
                    metrics.ruinProbability > 20 ? 'text-[var(--aevos-status-critical)]' :
                    metrics.ruinProbability > 10 ? 'text-[var(--aevos-status-warning)]' : 
                    'text-[var(--aevos-status-success)]'
                  }`}>
                  {metrics.ruinProbability > 20
                    ? '⚠ Attend all classes this week.'
                    : metrics.ruinProbability > 10
                      ? '→ Monitor closely and limit absences.'
                      : '✓ Your attendance is in a safe zone.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </Tooltip>

      {/* Col 3: Freed Preparation Hours */}
      <Tooltip
        content={
          <div className="flex flex-col gap-1.5 font-sans">
            <p className="font-semibold text-[var(--aevos-text-primary)]">Freed Preparation Hours</p>
            <p className="text-xs text-[var(--aevos-text-secondary)] leading-relaxed">Time you get back by missing low-impact classes. Use this to sprint for exams or recover from burnout.</p>
            <div className="mt-1 pt-2 border-t border-white/[0.05] text-[10px] text-[var(--aevos-text-tertiary)] leading-relaxed">
              <span className="text-[var(--aevos-text-secondary)] font-medium">Estimate:</span> Number of skippable sessions &times; average class duration (1.5 hrs)
            </div>
          </div>
        }
        position="bottom"
        className="xl:w-full h-full"
      >
        <div className="flex flex-col justify-center bg-transparent relative h-full cursor-help xl:pl-6 xl:border-l border-white/[0.05] group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="text-[10px] font-sans text-[var(--aevos-text-secondary)] uppercase tracking-widest mb-1">Freed Hours</div>
          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-light text-[var(--aevos-text-primary)]">{isCurrentlyEmpty ? "-" : (metrics.strategicSkips * 1.5).toFixed(1)}</span>
              <span className="text-lg font-light text-[var(--aevos-text-tertiary)]">h</span>
            </div>
            {!isCurrentlyEmpty && (
              <div className="flex flex-col">
                <div className="text-[9px] text-[var(--aevos-text-tertiary)]">
                  → Time you could reclaim.
                </div>
              </div>
            )}
          </div>
        </div>
      </Tooltip>

      {/* Col 4: Safe Skips Remaining */}
      <Tooltip
        content={
          <div className="flex flex-col gap-2 font-sans">
            <p className="font-semibold text-[var(--aevos-text-primary)]">Safe Skips Remaining</p>
            <p className="text-xs text-[var(--aevos-text-secondary)] leading-relaxed">You can skip {isCurrentlyEmpty ? "-" : metrics.strategicSkips} more classes this semester and still stay above the 75% attendance threshold.</p>

            <div className="flex flex-col gap-1.5 mt-1">
              <div className="text-[10px] text-[var(--aevos-text-tertiary)] leading-relaxed border-l-2 border-[var(--aevos-outline)] pl-2">
                <span className="text-[var(--aevos-text-secondary)] font-medium">Note:</span> This is a combined total. Always check individual subjects, as some may have 0 skips remaining.
              </div>
              <div className="text-[10px] text-[var(--aevos-text-tertiary)] leading-relaxed border-l-2 border-[var(--aevos-outline)] pl-2">
                <span className="text-[var(--aevos-text-secondary)] font-medium">Formula (Per Course):</span><br />
                (Total classes &times; 25%) &minus; Classes already missed
              </div>
            </div>
          </div>
        }
        position="bottom-right"
        className="xl:w-full h-full"
      >
        <div className="flex flex-col justify-center bg-transparent relative h-full cursor-help xl:pl-6 xl:border-l border-white/[0.05] group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="text-[10px] font-sans text-[var(--aevos-text-secondary)] uppercase tracking-widest mb-1">Safe Skips</div>
          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl font-light ${
                isCurrentlyEmpty ? 'text-[var(--aevos-text-tertiary)]' : 
                metrics.strategicSkips === 0 ? 'text-[var(--aevos-status-critical)]' : 
                metrics.strategicSkips <= 2 ? 'text-[var(--aevos-status-warning)]' : 
                'text-[var(--aevos-status-success)]'
              }`}>
                {isCurrentlyEmpty ? "-" : `${metrics.strategicSkips}`}
              </span>
            </div>
            {!isCurrentlyEmpty && (
              <div className="flex flex-col">
                <div className={`text-[9px] font-medium ${
                    metrics.strategicSkips === 0 ? 'text-[var(--aevos-status-critical)]' :
                    metrics.strategicSkips <= 2 ? 'text-[var(--aevos-status-warning)]' : 
                    'text-[var(--aevos-text-tertiary)]'
                  }`}>
                  {metrics.strategicSkips === 0
                    ? '⚠ No safe absences left.'
                    : metrics.strategicSkips <= 2
                      ? '→ Running low — be selective.'
                      : '→ Buffer available for use.'}
                </div>
              </div>
            )}
          </div>
        </div>
      </Tooltip>

    </div>
  );
}
