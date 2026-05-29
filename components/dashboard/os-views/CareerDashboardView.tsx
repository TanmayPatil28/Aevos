"use client";

import React from "react";
import { motion } from "framer-motion";
import { Briefcase, Map, GitMerge, Code2, Terminal, Award, Target } from "lucide-react";
import { useUSMStore } from "@/stores/usmStore";
import { selectDerivedGPA } from "@/stores/selectors/academic";

export default function CareerDashboardView() {
  const store = useUSMStore();
  const { cgpa } = selectDerivedGPA(store);
  
  // Calculate a mock Placement Readiness Score based on CGPA and backlogs (just for visual representation right now)
  const backlogs = store.semesterHistory.reduce((acc, sem) => acc + (sem.credits - sem.earnedCredits), 0);
  let readinessScore = 85;
  if (cgpa < 7) readinessScore -= 20;
  if (backlogs > 0) readinessScore -= 15;
  if (cgpa >= 8.5) readinessScore += 10;
  if (readinessScore > 100) readinessScore = 98;
  if (readinessScore < 10) readinessScore = 15;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Placement Readiness Hero Metric */}
        <div className="lg:col-span-1 bg-[#000000] border border-slate-800 p-6 rounded-xl relative overflow-hidden group hover:border-purple-500/30 transition-colors flex flex-col justify-between min-h-[220px]">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Briefcase className="w-24 h-24 text-purple-400" /></div>
          <div>
            <div className="text-sm text-slate-500 uppercase font-bold tracking-wider mb-2">Placement Readiness</div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-white">{readinessScore}</span>
              <span className="text-sm text-slate-500">/ 100</span>
            </div>
            <div className="text-xs text-purple-400 mt-2 font-mono flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> High Probability (Tier 1)
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 flex justify-between text-xs font-bold text-slate-400">
            <span>CGPA: {cgpa.toFixed(2)}</span>
            <span>Backlogs: {backlogs}</span>
          </div>
        </div>

        {/* Developer Presence (GitHub & LeetCode) */}
        <div className="lg:col-span-2 bg-[#000000] border border-slate-800 p-6 rounded-xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-400" /> Developer Presence
            </h3>
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold border border-white/10 px-2 py-1 rounded-full">Coming Soon</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex flex-col justify-center items-center text-center group cursor-not-allowed">
              <GitMerge className="w-8 h-8 text-slate-600 mb-3 group-hover:text-white/40 transition-colors" />
              <div className="text-sm font-bold text-white/50">GitHub Integration</div>
              <div className="text-xs text-slate-500 mt-1 max-w-[150px]">Track commits, PRs, and top repositories.</div>
            </div>
            
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex flex-col justify-center items-center text-center group cursor-not-allowed">
              <Code2 className="w-8 h-8 text-slate-600 mb-3 group-hover:text-yellow-500/40 transition-colors" />
              <div className="text-sm font-bold text-white/50">LeetCode Sync</div>
              <div className="text-xs text-slate-500 mt-1 max-w-[150px]">DSA progress and contest ratings.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills Matrix / Radar Chart Placeholder */}
        <div className="bg-[#000000] border border-slate-800 p-6 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" /> Skills Matrix
          </h3>
          <div className="flex flex-col gap-4">
            {/* Simple linear progress bars as placeholders for a radar chart */}
            {[
              { name: "Frontend (React/Next)", val: 85, color: "bg-blue-500" },
              { name: "Backend (Node/Python)", val: 60, color: "bg-emerald-500" },
              { name: "Data Structures & Algorithms", val: 75, color: "bg-yellow-500" },
              { name: "System Design", val: 40, color: "bg-purple-500" },
            ].map(skill => (
              <div key={skill.name}>
                <div className="flex justify-between text-xs font-bold mb-1.5 text-slate-400">
                  <span>{skill.name}</span>
                  <span>{skill.val}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.val}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className={`h-full ${skill.color}`} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Internship & Project Roadmap */}
        <div className="bg-[#000000] border border-slate-800 p-6 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Map className="w-5 h-5 text-amber-400" /> Internship Roadmap
          </h3>
          <div className="relative border-l-2 border-white/10 ml-3 space-y-6">
            
            <div className="relative pl-6">
              <div className="absolute w-4 h-4 bg-[#000000] border-2 border-emerald-500 rounded-full -left-[9px] top-1" />
              <div className="text-xs font-bold text-emerald-400 mb-0.5">Current Focus</div>
              <div className="text-sm font-bold text-white">Build Core Projects</div>
              <div className="text-xs text-slate-500 mt-1">Develop 2 full-stack applications to showcase skills.</div>
            </div>

            <div className="relative pl-6">
              <div className="absolute w-4 h-4 bg-[#000000] border-2 border-slate-600 rounded-full -left-[9px] top-1" />
              <div className="text-xs font-bold text-slate-500 mb-0.5">Next Milestone</div>
              <div className="text-sm font-bold text-slate-300">Resume Review & DSA</div>
              <div className="text-xs text-slate-600 mt-1">Optimize resume and solve top 100 interview questions.</div>
            </div>

            <div className="relative pl-6">
              <div className="absolute w-4 h-4 bg-[#000000] border-2 border-slate-700 rounded-full -left-[9px] top-1" />
              <div className="text-xs font-bold text-slate-600 mb-0.5">Target</div>
              <div className="text-sm font-bold text-slate-400">Summer Internship Application</div>
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
}
