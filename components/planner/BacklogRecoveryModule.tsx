"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, AlertOctagon, ChevronDown, ShieldAlert, AlertTriangle, ArrowRight } from "lucide-react";
import Card from "@/components/ui/Card";
import { useUSMStore } from "@/stores/usmStore";
import { BacklogEngine } from "@/lib/backlog-intelligence/engine";
import Link from "next/link";

export default function BacklogRecoveryModule() {
  const { courses, semesterHistory, career, presetId, academic } = useUSMStore();
  
  const currentSem = academic.completedSemesters + 1;
  const analysis = React.useMemo(() => {
    return BacklogEngine.analyzeBacklogs(courses, currentSem - 1, semesterHistory, career, presetId);
  }, [courses, currentSem, semesterHistory, career, presetId]);

  const hasBacklogs = analysis.activeBacklogs.length > 0;
  const count = analysis.activeBacklogs.length;
  const credits = analysis.totalBacklogCredits;
  const atkt = analysis.atktStatus;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full h-fit">
      {/* Controls (Left) */}
      <div className="col-span-1 lg:col-span-5 flex flex-col h-fit gap-6">
        <div className="relative z-10 flex flex-col h-fit space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/50">ATKT Rules</h3>

          <div className="flex-1 flex flex-col justify-center items-center">
            {hasBacklogs ? (
              <div className="text-center">
                <AlertOctagon size={48} className="text-amber-500/50 mx-auto mb-4 animate-pulse" />
                <span className="px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest bg-amber-500/20 text-amber-400 border border-amber-500/20 inline-flex items-center gap-2">
                  <AlertOctagon size={14} /> Active Backlogs Detected
                </span>
              </div>
            ) : (
              <div className="text-center opacity-50">
                <Activity size={48} className="text-white mx-auto mb-4" />
                <span className="text-sm font-medium">System Nominal</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results (Right) */}
      <div className="col-span-1 lg:col-span-7 flex flex-col h-fit gap-6">
        <div className="flex flex-col h-fit space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <span className="text-[12px] leading-[16px] font-bold uppercase tracking-[0.12em] text-foreground-muted">Engine Diagnostics</span>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            {!hasBacklogs ? (
              <div className="p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 text-center flex flex-col items-center justify-center space-y-4">
                <p className="text-emerald-400/80 text-base font-medium">System Nominal. You have no active backlogs.</p>
                <Link href="/backlog" className="text-sm font-semibold px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                  Open Command Center
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-6 rounded-card-large bg-white/5 flex flex-col justify-center text-center">
                    <div className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-2">Active</div>
                    <div className="text-4xl font-black text-white font-mono tracking-tighter">{count}</div>
                  </div>
                  <div className="p-6 rounded-card-large bg-white/5 flex flex-col justify-center text-center">
                    <div className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-2">Dead Credits</div>
                    <div className="text-4xl font-black text-white font-mono tracking-tighter">{credits}</div>
                  </div>
                  <div className="p-6 rounded-card-large bg-amber-500/10 border border-amber-500/20 col-span-2 flex flex-col justify-center">
                    <div className="text-[10px] text-amber-400/70 font-bold uppercase tracking-widest mb-2">ATKT Progression Limit</div>
                    <div className="text-3xl font-black text-amber-400 font-mono tracking-tighter">
                      Max {atkt.allowedBacklogsToProceed}
                    </div>
                  </div>
                </div>

                {atkt.yearDownRisk ? (
                  <div className="p-6 rounded-card-large bg-red-500/10 border border-red-500/20">
                    <div className="text-[10px] text-red-400/70 font-bold uppercase tracking-widest mb-2">Year-Down Risk Assessment</div>
                    <div className="flex items-start gap-4 mt-2">
                      <ShieldAlert className="text-red-400 shrink-0 mt-1" size={28} />
                      <p className="text-sm text-red-400/90 font-medium leading-relaxed">
                        {atkt.criticalWarning}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-card-large bg-amber-500/10 border border-amber-500/20">
                    <div className="text-[10px] text-amber-400/70 font-bold uppercase tracking-widest mb-2">Year-Down Risk Assessment</div>
                    <div className="flex items-start gap-4 mt-2">
                      <AlertTriangle className="text-amber-400 shrink-0 mt-1" size={28} />
                      <p className="text-sm text-amber-400/90 font-medium leading-relaxed">
                        Warning: You have {count} active backlogs. Keep this under {atkt.allowedBacklogsToProceed} to proceed to the next year.
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-end mt-auto">
                  <Link href="/backlog" className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#0a84ff] hover:bg-[#0a84ff]/80 text-white font-semibold text-sm transition-colors group">
                    Launch Full Command Center <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
