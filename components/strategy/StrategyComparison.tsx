"use client";

import React from "react";
import { StrategyResult } from "@/lib/strategy/types";
import { strategyComparator } from "@/lib/strategy/strategyComparator";
import GlassCard from "../GlassCard";
import { Shuffle, Info, ShieldCheck, Flame, Compass } from "lucide-react";

interface StrategyComparisonProps {
  safe: StrategyResult;
  balanced: StrategyResult;
  aggressive: StrategyResult;
}

export default function StrategyComparison({ safe, balanced, aggressive }: StrategyComparisonProps) {
  const comparison = strategyComparator.compare(safe, balanced, aggressive);
  const { courseDifferences, riskRewardSummary } = comparison;

  return (
    <div className="space-y-6">
      {/* Risk Reward Advisory Box */}
      <GlassCard className="border border-indigo-500/20 bg-indigo-500/5" interactive={false}>
        <div className="flex gap-4 items-start">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Info size={24} />
          </div>
          <div>
            <h4 className="text-base font-bold text-white mb-1.5">Risk-Reward Analysis & Advisory</h4>
            <p className="text-sm text-white/70 leading-relaxed">
              {riskRewardSummary}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Course Differencing Table */}
      {courseDifferences.length > 0 ? (
        <GlassCard className="border border-white/5" interactive={false}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-white/5 text-white/80">
              <Shuffle size={18} />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Subject-Level Target Variations</h4>
              <p className="text-xs text-white/40">Only displaying courses where target recommendations differ.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-xs text-white/40">
                  <th className="py-3 px-4 font-semibold">Course</th>
                  <th className="py-3 px-4 font-semibold text-center">
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      <ShieldCheck size={12} /> Safe Target
                    </span>
                  </th>
                  <th className="py-3 px-4 font-semibold text-center">
                    <span className="inline-flex items-center gap-1 text-blue-400">
                      <Compass size={12} /> Balanced Target
                    </span>
                  </th>
                  <th className="py-3 px-4 font-semibold text-center">
                    <span className="inline-flex items-center gap-1 text-violet-400">
                      <Flame size={12} /> Push Target
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {courseDifferences.map((diff) => (
                  <tr key={diff.courseId} className="border-b border-white/5 text-sm hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white">{diff.courseCode}</div>
                      <div className="text-xs text-white/50">{diff.courseName}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-block bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 px-3 py-1 rounded text-xs">
                        {diff.safeGrade}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-block bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20 px-3 py-1 rounded text-xs">
                        {diff.balancedGrade}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-block bg-violet-500/10 text-violet-400 font-bold border border-violet-500/20 px-3 py-1 rounded text-xs">
                        {diff.aggressiveGrade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      ) : (
        <GlassCard className="border border-white/5 text-center py-6 text-white/40 text-sm" interactive={false}>
          No grade differences detected between strategies. All remaining courses require identical targets.
        </GlassCard>
      )}
    </div>
  );
}
