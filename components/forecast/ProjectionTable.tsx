"use client";

import React from "react";
import { SemesterProjection } from "@/lib/forecasting/types";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/cn";

interface ProjectionTableProps {
  projections: SemesterProjection[];
  targetCgpa: number;
}

export default function ProjectionTable({ projections, targetCgpa }: ProjectionTableProps) {
  if (projections.length === 0) {
    return (
      <div className="text-center p-6 text-white/40 text-xs">
        No projections available. Add completed semesters or credits to project future trajectories.
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden border border-white/5 rounded-2xl bg-white/[0.01]">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02] text-[10px] text-white/40 uppercase font-semibold tracking-wider">
              <th className="py-4 px-6">Semester</th>
              <th className="py-4 px-6 text-center">Assumed SGPA</th>
              <th className="py-4 px-6 text-center">Cumulative Credits</th>
              <th className="py-4 px-6 text-center">Projected CGPA</th>
              <th className="py-4 px-6 text-center">Confidence Interval (±Vol)</th>
              <th className="py-4 px-6 text-right">Goal Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs text-white/80">
            {projections.map((proj) => {
              const meetsTarget = proj.projectedCgpa >= targetCgpa;

              return (
                <tr 
                  key={proj.semester}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-4 px-6 font-bold text-white">
                    Semester {proj.semester}
                  </td>
                  <td className="py-4 px-6 text-center font-semibold text-white/70">
                    {proj.projectedSgpa.toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-center text-white/50">
                    {proj.cumulativeCredits}
                  </td>
                  <td className="py-4 px-6 text-center font-bold text-white text-sm">
                    {proj.projectedCgpa.toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-center text-indigo-300/80 font-mono">
                    [{proj.lower.toFixed(2)} — {proj.upper.toFixed(2)}]
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span 
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide",
                        meetsTarget 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      )}
                    >
                      {meetsTarget ? (
                        <>
                          <CheckCircle size={10} /> Meets Goal
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={10} /> Shortfall
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
