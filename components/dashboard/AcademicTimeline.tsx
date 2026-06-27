"use client";

import React from "react";
import { SemesterHistoryEntry } from "@/stores/usmStore";
import { Activity, TrendingUp, TrendingDown, AlertTriangle, History } from "lucide-react";
import { useUniversity } from "@/components/providers/UniversityProvider";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/cn";

interface AcademicTimelineProps {
  history: SemesterHistoryEntry[];
}

export default function AcademicTimeline({ history }: AcademicTimelineProps) {
  const { maxGradePoint } = useUniversity();

  if (history.length === 0) {
    return (
      <Card variant="default" className="w-full h-[300px] flex flex-col items-center justify-center text-center border-white/5">
        <div className="w-12 h-12 rounded-full bg-surface border border-white/5 flex items-center justify-center mb-4">
          <Activity className="w-6 h-6 text-foreground-muted" />
        </div>
        <h3 className="text-foreground tracking-tight leading-tight font-semibold text-[14px] mb-2">No History Available</h3>
        <p className="text-foreground-muted text-[12px] max-w-[250px]">
          Your academic timeline will dynamically render here once you complete a semester.
        </p>
      </Card>
    );
  }

  const sortedHistory = [...history].sort((a, b) => a.semester - b.semester);
  
  // Dynamic scale based on active grading system
  const maxSgpa = Math.max(...sortedHistory.map(h => h.sgpa), maxGradePoint);

  return (
    <Card variant="default" className="w-full p-6 border-white/5 space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <History size={16} className="text-foreground-muted" />
          <div className="flex flex-col">
            <h3 className="text-[14px] font-semibold text-foreground tracking-tight leading-tight">Academic Timeline</h3>
            <span className="text-[12px] text-foreground-muted">Semester progression trajectory</span>
          </div>
        </div>
      </div>

      <div className="relative pt-10 pb-4 w-full">
        {/* Connection Line */}
        <div className="absolute bottom-[46px] left-0 w-full h-[1px] bg-white/5 z-0" />
        
        <div className="relative z-10 flex justify-between items-center">
          {sortedHistory.map((entry, idx) => {
            const previousSgpa = idx > 0 ? sortedHistory[idx - 1].sgpa : entry.sgpa;
            const diff = entry.sgpa - previousSgpa;
            const isDrop = diff < 0;
            const isJump = diff > 0.5;

            // Visual mapping (0 to 100% of container height)
            const heightPercent = (entry.sgpa / maxSgpa) * 100;

            const pointColor = isDrop ? "bg-[#ff3b30]" : isJump ? "bg-[#34c759]" : "bg-[#0a84ff]";
            const barColor = isDrop ? "bg-[#ff3b30]/10" : isJump ? "bg-[#34c759]/10" : "bg-[#0a84ff]/10";

            return (
              <div key={`${entry.semester}-${idx}`} className="flex flex-col items-center justify-end relative group flex-1 h-[140px]">
                
                {/* Visual marker mapping */}
                <div 
                  className={cn("absolute bottom-[48px] w-2 rounded-t-sm transition-all duration-500", barColor)}
                  style={{ height: `${heightPercent}px` }}
                />

                {/* Data Point */}
                <div className={cn("w-3 h-3 rounded-full border-2 border-surface z-10", pointColor)} />

                {/* Label */}
                <div className="mt-4 text-center">
                  <div className="text-[12px] font-semibold text-foreground tracking-tight">Sem {entry.semester}</div>
                  <div className="text-[11px] text-foreground-muted font-mono mt-0.5">{entry.sgpa.toFixed(2)}</div>
                </div>

                {/* Hover Tooltip */}
                <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity bg-surface border border-white/10 p-3 rounded-xl text-xs whitespace-nowrap shadow-2xl z-20 pointer-events-none">
                  <div className="font-semibold text-foreground tracking-tight">Semester {entry.semester}</div>
                  <div className="text-foreground-muted flex items-center gap-1.5 mt-1.5">
                    SGPA: <span className="text-foreground font-mono font-medium">{entry.sgpa.toFixed(2)}</span>
                    {idx > 0 && (
                      <span className={cn("ml-2 flex items-center gap-0.5 font-bold", isDrop ? 'text-[#ff3b30]' : 'text-[#34c759]')}>
                        {isDrop ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                        {Math.abs(diff).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="text-foreground-muted mt-1 flex items-center gap-1.5">
                    Credits: <span className="text-foreground font-mono font-medium">{entry.credits}</span>
                  </div>
                </div>

                {/* Anomaly Indicator */}
                {isDrop && (
                  <div className="absolute -top-8 text-[#ff3b30]">
                    <AlertTriangle size={14} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
