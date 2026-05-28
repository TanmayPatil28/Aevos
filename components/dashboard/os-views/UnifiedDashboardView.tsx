"use client";

import React from "react";
import { motion } from "framer-motion";
import { useUSMStore } from "@/stores/usmStore";
import { selectDerivedGPA } from "@/stores/selectors/academic";
import { Activity, Briefcase, GraduationCap, LayoutDashboard, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useOSMode } from "@/contexts/OSModeContext";

export default function UnifiedDashboardView() {
  const store = useUSMStore();
  const { cgpa } = selectDerivedGPA(store);
  const { setMode } = useOSMode();

  // Mock Readiness Score
  const backlogs = store.semesterHistory.reduce((acc, sem) => acc + (sem.credits - sem.earnedCredits), 0);
  let readinessScore = 85;
  if (cgpa < 7) readinessScore -= 20;
  if (backlogs > 0) readinessScore -= 15;
  if (cgpa >= 8.5) readinessScore += 10;
  if (readinessScore > 100) readinessScore = 98;
  if (readinessScore < 10) readinessScore = 15;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Academic Half */}
        <div className="bg-gradient-to-br from-blue-900/20 to-[#000000] border border-blue-500/20 p-8 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[300px] group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><GraduationCap className="w-32 h-32 text-blue-400" /></div>
          
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2 mb-6">
              <Activity className="text-blue-400" /> Academic Standing
            </h2>
            <div className="text-sm text-blue-400/80 uppercase font-bold tracking-wider mb-2">Active CGPA</div>
            <div className="text-6xl font-black text-white">{cgpa.toFixed(2)}</div>
            <div className="text-sm text-slate-400 mt-3 max-w-[200px]">
              {backlogs > 0 ? `Attention required: ${backlogs} backlogs pending.` : "You are on track. Maintain consistency."}
            </div>
          </div>

          <button 
            onClick={() => setMode("academic")}
            className="mt-8 flex items-center gap-2 w-max px-5 py-2.5 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold text-sm transition-colors"
          >
            Enter Academic OS <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Career Half */}
        <div className="bg-gradient-to-br from-purple-900/20 to-[#000000] border border-purple-500/20 p-8 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[300px] group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Briefcase className="w-32 h-32 text-purple-400" /></div>
          
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2 mb-6">
              <LayoutDashboard className="text-purple-400" /> Career Readiness
            </h2>
            <div className="text-sm text-purple-400/80 uppercase font-bold tracking-wider mb-2">Placement Score</div>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black text-white">{readinessScore}</span>
              <span className="text-lg text-slate-500 font-bold">/ 100</span>
            </div>
            <div className="text-sm text-slate-400 mt-3 max-w-[200px]">
              Your academic profile is strong. Focus on DSA and Projects.
            </div>
          </div>

          <button 
            onClick={() => setMode("career")}
            className="mt-8 flex items-center gap-2 w-max px-5 py-2.5 rounded-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-bold text-sm transition-colors"
          >
            Enter Career OS <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      <div className="bg-[#000000] border border-white/5 p-6 rounded-xl flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold text-lg mb-1">Explore all modules</h3>
          <p className="text-slate-400 text-sm">Use the OS Switcher in the navbar to morph this dashboard to your current goals.</p>
        </div>
      </div>
    </motion.div>
  );
}
