"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, AlertOctagon, ChevronDown, ShieldAlert, AlertTriangle, ArrowRight } from "lucide-react";
import Card from "@/components/ui/Card";
import { useUSMStore } from "@/stores/usmStore";
import { BacklogEngine } from "@/lib/backlog-intelligence/engine";
import Link from "next/link";

export default function BacklogRecoveryModule() {
  const [isExpanded, setIsExpanded] = useState(false);
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
    <Card className={`relative overflow-hidden transition-all duration-500 border ${hasBacklogs ? 'border-amber-500/30' : 'border-white/10'}`} padding="xl">
      <div className={`absolute inset-0 bg-gradient-to-br opacity-50 ${hasBacklogs ? 'from-amber-500/10 via-transparent to-red-500/5' : 'from-white/5 via-transparent to-transparent'}`} />
      
      <div className="relative z-10 space-y-6">
        <div 
          className="flex items-center justify-between cursor-pointer group"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border group-hover:scale-105 transition-transform ${hasBacklogs ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'bg-white/5 border-white/10 text-white/50'}`}>
              <Activity />
            </div>
            <div>
              <h3 className={`font-headline text-xl font-black ${hasBacklogs ? 'text-amber-400' : 'text-white'}`}>Backlog Intelligence Engine</h3>
              <p className="text-on-surface-variant text-sm">Real-time ATKT rules and clearance data.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {hasBacklogs && (
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-400 border border-amber-500/20 hidden md:flex items-center gap-1.5 animate-pulse">
                <AlertOctagon size={12} /> Active Backlogs
              </span>
            )}
            <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
              <ChevronDown className={hasBacklogs ? "text-amber-500/50" : "text-white/50"} />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-6 border-t border-white/20 space-y-8">
                
                {!hasBacklogs ? (
                  <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-center flex flex-col items-center justify-center space-y-3">
                    <p className="text-emerald-400/80 text-sm">System Nominal. You have no active backlogs.</p>
                    <Link href="/backlog" className="text-xs font-semibold px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                      Open Command Center
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10 col-span-1">
                        <div className="text-xs text-white/50 font-bold uppercase tracking-widest mb-1">Active Backlogs</div>
                        <div className="text-xl font-bold text-white font-mono">{count}</div>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10 col-span-1">
                        <div className="text-xs text-white/50 font-bold uppercase tracking-widest mb-1">Dead Credits</div>
                        <div className="text-xl font-bold text-white font-mono">{credits}</div>
                      </div>
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 col-span-2">
                        <div className="text-xs text-amber-400/70 font-bold uppercase tracking-widest mb-1">ATKT Progression Limit</div>
                        <div className="text-xl font-bold text-amber-400 font-mono">
                          Max {atkt.allowedBacklogsToProceed} allowed
                        </div>
                      </div>
                    </div>

                    {atkt.yearDownRisk ? (
                      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                        <div className="text-xs text-red-400/70 font-bold uppercase tracking-widest mb-1">Year-Down Risk Assessment</div>
                        <div className="flex items-center gap-3 mt-1">
                          <ShieldAlert className="text-red-400 shrink-0" size={24} />
                          <p className="text-sm text-red-400/90 font-medium leading-relaxed">
                            {atkt.criticalWarning}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <div className="text-xs text-amber-400/70 font-bold uppercase tracking-widest mb-1">Year-Down Risk Assessment</div>
                        <div className="flex items-center gap-3 mt-1">
                          <AlertTriangle className="text-amber-400 shrink-0" size={24} />
                          <p className="text-sm text-amber-400/90 font-medium">
                            Warning: You have {count} active backlogs. Keep this under {atkt.allowedBacklogsToProceed} to proceed to the next year.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 flex justify-end">
                      <Link href="/backlog" className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0a84ff] hover:bg-[#0a84ff]/80 text-white font-semibold text-sm transition-colors group">
                        Launch Full Command Center <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>

                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
