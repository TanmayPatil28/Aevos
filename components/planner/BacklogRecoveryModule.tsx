"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, AlertOctagon, ChevronDown, RefreshCcw, BookOpen, AlertTriangle } from "lucide-react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { useUSMStore } from "@/stores/usmStore";

interface BacklogProps {
  currentCgpa?: number;
  targetCgpa?: number;
  completedSemesters?: number;
  remainingSemesters?: number;
  result?: any;
  preset?: any;
}

export default function BacklogRecoveryModule(props: BacklogProps) {
  const storeBacklogsCount = useUSMStore(state => state.academic.activeBacklogsCount);
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [backlogsCount, setBacklogsCount] = useState(storeBacklogsCount.toString());
  const [backlogCredits, setBacklogCredits] = useState((storeBacklogsCount * 4).toString()); // Estimate 4 credits per backlog by default

  React.useEffect(() => {
    setBacklogsCount(storeBacklogsCount.toString());
    setBacklogCredits((storeBacklogsCount * 4).toString());
  }, [storeBacklogsCount]);

  const count = parseInt(backlogsCount) || 0;
  const credits = parseInt(backlogCredits) || 0;

  const hasBacklogs = count > 0;

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
              <h3 className={`font-headline text-xl font-black ${hasBacklogs ? 'text-amber-400' : 'text-white'}`}>Backlog Recovery Engine</h3>
              <p className="text-on-surface-variant text-sm">Clearance roadmaps and re-registration limits.</p>
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Active Backlog Count" 
                    type="number" 
                    value={backlogsCount} 
                    onChange={(e) => setBacklogsCount(e.target.value)}
                  />
                  <Input 
                    label="Total Dead Credits" 
                    type="number" 
                    value={backlogCredits} 
                    onChange={(e) => setBacklogCredits(e.target.value)}
                  />
                </div>

                {!hasBacklogs ? (
                  <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-center">
                    <p className="text-emerald-400/80 text-sm">You have no active backlogs. Keep up the great work!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <div className="text-xs text-amber-400/70 font-bold uppercase tracking-widest mb-1">Max Re-Registration</div>
                        <div className="text-xl font-bold text-amber-400 font-mono">
                          {Math.min(count, 3)} subjects
                        </div>
                        <p className="text-[10px] text-amber-400/60 mt-1">Per university ordinance limit per semester.</p>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 md:col-span-2">
                        <div className="text-xs text-red-400/70 font-bold uppercase tracking-widest mb-1">Year-Down Risk Assessment</div>
                        <div className="flex items-center gap-3 mt-1">
                          <AlertTriangle className="text-red-400" size={24} />
                          <p className="text-sm text-red-400/90 font-medium">
                            {credits >= 16 
                              ? "CRITICAL: You are at immediate risk of a Year Down. Clear at least " + (credits - 12) + " credits immediately." 
                              : "Warning: You are approaching the maximum carry-forward credit limit. Prioritize backlog exams."}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#1D1D1F] border border-white/5">
                      <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <RefreshCcw size={16} className="text-amber-400" />
                        Recommended Clearance Roadmap
                      </h4>
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 text-xs font-bold">1</div>
                            <div className="w-px h-full bg-white/10 my-1" />
                          </div>
                          <div className="pb-4">
                            <h5 className="text-sm font-bold text-white">Register for Even/Odd Matches</h5>
                            <p className="text-xs text-white/50 mt-1">Check if the backlog subject is offered in the upcoming semester. You can only register for Odd sem subjects in Odd sems, and Even in Even.</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 text-xs font-bold">2</div>
                            <div className="w-px h-full bg-white/10 my-1" />
                          </div>
                          <div className="pb-4">
                            <h5 className="text-sm font-bold text-white">Prioritize High-Credit Subjects</h5>
                            <p className="text-xs text-white/50 mt-1">If you have multiple backlogs, clear 4-credit or 3-credit subjects first to reduce the Year-Down risk drastically.</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 text-xs font-bold">3</div>
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-white">Target 40% Minimum Passing Score</h5>
                            <p className="text-xs text-white/50 mt-1">For backlog exams, focus entirely on crossing the passing threshold. Do not aim for high grades at the cost of failing another backlog exam.</p>
                          </div>
                        </div>
                      </div>
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
