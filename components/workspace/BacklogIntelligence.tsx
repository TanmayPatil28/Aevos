"use client";

import React, { useState, useMemo } from "react";
import { useUSMStore } from "@/stores/usmStore";
import { Inbox, AlertTriangle, TrendingUp, TrendingDown, BookOpen, Clock, Activity, CalendarDays, ShieldAlert } from "lucide-react";
import { BacklogEngine } from "@/lib/backlog-intelligence/engine";
import UnifiedSimulator from "../backlog/UnifiedSimulator";

export function BacklogIntelligence() {
  const courses = useUSMStore(state => state.courses);
  const semesterHistory = useUSMStore(state => state.semesterHistory);
  const currentSemesterIndex = useUSMStore(state => state.currentSemesterIndex);
  
  const [selectedBacklogId, setSelectedBacklogId] = useState<string | null>(null);

  const analysis = useMemo(() => {
    // We pass career state and preset as mock/empty for now just to satisfy the method signature
    return BacklogEngine.analyzeBacklogs(courses, currentSemesterIndex, semesterHistory, {} as any, "sppu");
  }, [courses, semesterHistory, currentSemesterIndex]);

  // Set default selection if none
  React.useEffect(() => {
    if (analysis.activeBacklogs.length > 0 && !selectedBacklogId) {
      setSelectedBacklogId(analysis.activeBacklogs[0].id);
    }
  }, [analysis.activeBacklogs, selectedBacklogId]);

  if (analysis.activeBacklogs.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-background/80 glass-panel">
        <ShieldAlert className="w-12 h-12 text-emerald-400/50 mb-4" />
        <p className="text-foreground-muted font-mono text-sm uppercase tracking-widest">No Active Academic Debt</p>
      </div>
    );
  }

  const selectedCourse = courses.find(c => c.id === selectedBacklogId);
  const currentCgpa = semesterHistory.reduce((sum, s) => sum + (s.sgpa * s.credits), 0) / (semesterHistory.reduce((sum, s) => sum + s.credits, 0) || 1);

  return (
    <div className="flex w-full h-full">
      {/* LEFT PANEL - Debt Inbox */}
      <section className="w-[30%] min-w-[320px] max-w-md border-r border-white/5 flex flex-col bg-surface/50 glass-panel relative hidden lg:flex">
        <div className="h-12 border-b border-white/5 flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center space-x-2 text-sm text-foreground-muted uppercase tracking-wider font-mono">
            <Inbox className="w-4 h-4" />
            <span>Debt Inbox</span>
          </div>
          <span className="text-xs font-mono text-rose-400 font-bold">{analysis.activeBacklogs.length} Pending</span>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto space-y-3 scrollbar-hide">
          {analysis.activeBacklogs.map(backlog => {
            const isSelected = selectedBacklogId === backlog.id;
            return (
              <div 
                key={backlog.id}
                onClick={() => setSelectedBacklogId(backlog.id)}
                className={`group border p-4 rounded-xl cursor-pointer transition-all ${
                  isSelected 
                    ? "bg-surface-raised border-rose-500/30 shadow-sm" 
                    : "bg-surface-overlay border-white/5 hover:border-brand/30"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className={`font-bold text-sm leading-tight ${isSelected ? 'text-foreground' : 'text-foreground-muted group-hover:text-foreground'}`}>
                      {backlog.name}
                    </h4>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-foreground-muted/60">{backlog.code}</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px] font-mono font-bold">
                    {backlog.severity}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 text-[10px] font-mono text-foreground-muted uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" />
                    Fail Sem {backlog.failedSemester}
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400/80">
                    <TrendingUp className="w-3 h-3" />
                    +{backlog.recoveryCGPAImpact.toFixed(2)} CGPA
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-white/5 bg-surface/80 shrink-0">
          <div className="text-xs font-mono text-foreground-muted uppercase tracking-widest font-bold mb-2">ATKT Status</div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-foreground font-medium">Risk Level</span>
            <span className={`font-mono font-bold ${analysis.atktStatus.riskLevel === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'}`}>
              {analysis.atktStatus.riskLevel}
            </span>
          </div>
        </div>
      </section>

      {/* RIGHT PANEL - Deep Dive Analytics */}
      <section className="flex-1 flex flex-col bg-background/80 glass-panel overflow-y-auto">
        <div className="p-6 md:p-8 flex-1 flex flex-col">
          
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-bold text-foreground text-xl tracking-tight mb-1">Deep Dive Analytics</h3>
              <p className="text-xs text-foreground-muted font-medium">Clearance Simulator & Strategy</p>
            </div>
            
            {selectedCourse && (
              <div className="bg-surface border border-white/5 rounded-full px-4 py-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
                <span className="text-xs font-mono text-brand font-bold uppercase">{selectedCourse.code} Selected</span>
              </div>
            )}
          </div>

          {selectedCourse ? (
            <div className="flex-1 min-h-[500px]">
              <UnifiedSimulator 
                course={selectedCourse}
                currentCgpa={currentCgpa}
                semesterHistory={semesterHistory}
                currentSemesterIndex={currentSemesterIndex}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
              <p className="text-foreground-muted text-sm font-medium">Select a backlog from the inbox to simulate clearance strategy.</p>
            </div>
          )}
          
        </div>
      </section>
      
    </div>
  );
}
