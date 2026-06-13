"use client";

import React from "react";
import { motion } from "framer-motion";
import { useUSMStore } from "@/stores/usmStore";
import { selectDerivedGPA } from "@/stores/selectors/academic";
import { intelligenceEngine } from "@/lib/career/intelligenceEngine";
import { Activity, Briefcase, GraduationCap, LayoutDashboard, ArrowRight } from "lucide-react";
import Link from "next/link";
import AnimatedCounter from "@/components/AnimatedCounter";
import DocumentVault from "@/components/DocumentVault";

export default function UnifiedDashboardView() {
  const store = useUSMStore();
  const { cgpa } = selectDerivedGPA(store);
  const setMode = store.setWorkspaceMode;

  // Fetch Readiness Score via Intelligence Engine
  const backlogs = store.semesterHistory.reduce((acc, sem) => acc + (sem.credits - sem.earnedCredits), 0);
  const earnedCredits = store.semesterHistory.reduce((acc, sem) => acc + sem.earnedCredits, 0);
  
  const placementRisk = intelligenceEngine.calculatePlacementRisk({
    cgpa,
    backlogs,
    earnedCredits,
    branch: "Computer Science", // Default fallback if not in store
    skills: store.career?.skills || [],
    targetRole: store.career?.targetRole || "Frontend Developer"
  });
  
  const readinessScore = Math.round(placementRisk.averageEligibility);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Academic Half */}
        <div className="lg:col-span-6 bg-[#1c1c1e] border border-white/[0.05] shadow-[0_0_20px_rgba(0,0,0,0.2)] p-8 rounded-[32px] relative overflow-hidden flex flex-col justify-between min-h-[340px] group hover:border-white/10 hover:shadow-[0_0_30px_rgba(0,0,0,0.4)] transition-all duration-500">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700"><GraduationCap className="w-48 h-48 text-blue-400" /></div>
          
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2 mb-6">
              <Activity className="text-blue-400" /> Academic Standing
            </h2>
            <div className="text-sm text-blue-400 uppercase font-bold tracking-wider mb-3 relative z-10">Active CGPA</div>
            <AnimatedCounter target={cgpa} decimals={2} className="text-7xl font-black text-white relative z-10 block" />
            <div className="text-sm text-slate-400 mt-3 max-w-[200px]">
              {backlogs > 0 ? `Attention required: ${backlogs} backlogs pending.` : "You are on track. Maintain consistency."}
            </div>
          </div>

          <button 
            onClick={() => setMode("OPTIMIZATION")}
            className="mt-8 flex items-center justify-center gap-2 w-max px-6 py-3 rounded-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 font-bold text-sm transition-colors shadow-[0_0_15px_rgba(59,130,246,0.1)]"
          >
            Enter Academic OS <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Career Half */}
        <div className="lg:col-span-6 bg-[#1c1c1e] border border-white/[0.05] shadow-[0_0_20px_rgba(0,0,0,0.2)] p-8 rounded-[32px] relative overflow-hidden flex flex-col justify-between min-h-[340px] group hover:border-white/10 hover:shadow-[0_0_30px_rgba(0,0,0,0.4)] transition-all duration-500">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700"><Briefcase className="w-48 h-48 text-purple-400" /></div>
          
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2 mb-6">
              <LayoutDashboard className="text-purple-400" /> Career Readiness
            </h2>
            <div className="text-sm text-purple-400 uppercase font-bold tracking-wider mb-3 relative z-10">Placement Score</div>
            <div className="flex items-baseline gap-2 relative z-10">
              <AnimatedCounter target={readinessScore} className="text-7xl font-black text-white block" />
              <span className="text-xl text-slate-500 font-bold">/ 100</span>
            </div>
            <div className="text-sm text-slate-400 mt-3 max-w-[200px]">
              Your academic profile is strong. Focus on DSA and Projects.
            </div>
          </div>

          <button 
            onClick={() => setMode("FOCUS")}
            className="mt-8 flex items-center justify-center gap-2 w-max px-6 py-3 rounded-full bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 font-bold text-sm transition-colors shadow-[0_0_15px_rgba(168,85,247,0.1)]"
          >
            Enter Career OS <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      <div className="bg-[#1c1c1e] border border-white/[0.05] shadow-[0_0_20px_rgba(0,0,0,0.2)] p-8 rounded-[32px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden group hover:border-white/10 transition-all duration-500">
        <div className="relative z-10">
          <h3 className="text-white font-bold text-xl mb-2 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-[#0a84ff]" /> Explore all modules
          </h3>
          <p className="text-slate-400 text-sm max-w-xl">Use the Dynamic Island toggle below to morph this dashboard to your current goals.</p>
        </div>
      </div>

      {/* Smart Documents / RAG Integration */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-white mb-4">Academic Vault</h3>
        <DocumentVault />
      </div>
    </motion.div>
  );
}


