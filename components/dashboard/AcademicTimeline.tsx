"use client";

import React from "react";
import { SemesterHistoryEntry } from "@/stores/usmStore";
import { Activity, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { useUniversity } from "@/components/providers/UniversityProvider";

interface AcademicTimelineProps {
  history: SemesterHistoryEntry[];
}

export default function AcademicTimeline({ history }: AcademicTimelineProps) {
  const { maxGradePoint } = useUniversity();

  if (history.length === 0) {
    return (
      <div className="bg-[#000000] border border-slate-800 p-6 rounded-xl h-[500px] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-4">
          <Activity className="w-8 h-8 text-slate-600" />
        </div>
        <h3 className="text-white font-bold text-lg mb-2">No History Available</h3>
        <p className="text-slate-400 text-sm max-w-[220px]">
          Your academic timeline will dynamically render here once you complete a semester.
        </p>
      </div>
    );
  }

  const sortedHistory = [...history].sort((a, b) => a.semester - b.semester);
  
  // Dynamic scale based on active grading system
  const maxSgpa = Math.max(...sortedHistory.map(h => h.sgpa), maxGradePoint);

  return (
    <div className="bg-[#000000] border border-slate-800 p-6 rounded-xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-white">Academic Timeline</h3>
          <p className="text-xs text-slate-400">Semester progression & trajectory</p>
        </div>
      </div>

      <div className="relative pt-8 pb-4">
        {/* Connection Line */}
        <div className="absolute bottom-[46px] left-0 w-full h-0.5 bg-slate-800 z-0" />
        
        <div className="relative z-10 flex justify-between items-center">
          {sortedHistory.map((entry, idx) => {
            const previousSgpa = idx > 0 ? sortedHistory[idx - 1].sgpa : entry.sgpa;
            const diff = entry.sgpa - previousSgpa;
            const isDrop = diff < 0;
            const isJump = diff > 0.5;

            // Visual mapping (0 to 100% of container height)
            const heightPercent = (entry.sgpa / maxSgpa) * 100;

            return (
              <div key={`${entry.semester}-${idx}`} className="flex flex-col items-center justify-end relative group w-full h-[120px]">
                
                {/* Visual marker mapping */}
                <div 
                  className="absolute bottom-10 w-1 bg-indigo-500/20 rounded-t transition-all duration-500"
                  style={{ height: `${heightPercent}px` }}
                />

                {/* Data Point */}
                <div className={`w-4 h-4 rounded-full border-2 border-[#141a2c] z-10 ${
                  isDrop ? "bg-rose-500" : isJump ? "bg-emerald-500" : "bg-indigo-500"
                }`} />

                {/* Label */}
                <div className="mt-3 text-center">
                  <div className="text-xs font-bold text-white">Sem {entry.semester}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{entry.sgpa.toFixed(2)}</div>
                </div>

                {/* Hover Tooltip */}
                <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-white/10 p-2 rounded text-xs whitespace-nowrap shadow-xl z-20 pointer-events-none">
                  <div className="font-bold text-white">Semester {entry.semester}</div>
                  <div className="text-slate-400 flex items-center gap-1 mt-1">
                    SGPA: <span className="text-indigo-400 font-mono">{entry.sgpa.toFixed(2)}</span>
                    {idx > 0 && (
                      <span className={`ml-1 flex items-center ${isDrop ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {isDrop ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                        {Math.abs(diff).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="text-slate-400 mt-0.5">
                    Credits: <span className="text-white font-mono">{entry.credits}</span>
                  </div>
                </div>

                {/* Anomaly Indicator */}
                {isDrop && (
                  <div className="absolute -top-6 text-rose-500 animate-pulse">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
