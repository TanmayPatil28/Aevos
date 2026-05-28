import React from "react";
import { Crosshair, CheckCircle2, AlertCircle } from "lucide-react";
import { SkillGapResult } from "@/lib/career/intelligenceEngine";
import { motion } from "framer-motion";

interface SkillGapDetectorProps {
  role: string;
  skills: string[];
  result: SkillGapResult;
}

export default function SkillGapDetector({ role, skills, result }: SkillGapDetectorProps) {
  return (
    <div className="w-full bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 md:p-12 relative overflow-hidden group">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay z-0" />
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full" />

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-purple-400 mb-4">
              <Crosshair size={18} />
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em]">Skill Gap Radar</h2>
            </div>
            <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-2">
              Target: {role}
            </h3>
            <p className="text-white/40 text-lg">Analyzing competency overlap</p>
          </div>
          
          <div className="flex flex-col items-start md:items-end">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2">Readiness Index</span>
            <div className="flex items-baseline gap-1">
              <span className="text-6xl md:text-7xl font-bold tracking-tighter text-white leading-none">
                {result.readinessPercentage}
              </span>
              <span className="text-2xl text-white/30 font-medium">%</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden mb-12">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${result.readinessPercentage}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="bg-purple-500 h-full shadow-[0_0_15px_rgba(168,85,247,0.5)]" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/[0.01] border border-white/[0.03] rounded-2xl p-6 md:p-8">
            <h4 className="text-emerald-400/80 text-sm font-semibold mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Present Competencies
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.presentSkills.length > 0 ? result.presentSkills.map(s => (
                <span key={s} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-300 rounded-lg text-xs font-medium border border-emerald-500/20">
                  {s}
                </span>
              )) : <span className="text-sm text-white/20 italic">No exact matches found.</span>}
            </div>
          </div>

          <div className="bg-white/[0.01] border border-white/[0.03] rounded-2xl p-6 md:p-8">
            <h4 className="text-rose-400/80 text-sm font-semibold mb-6 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Missing Layers
            </h4>
            <div className="flex flex-wrap gap-2">
               {result.missingSkills.length > 0 ? result.missingSkills.map(s => (
                <span key={s} className="px-3 py-1.5 bg-rose-500/5 text-rose-300 rounded-lg text-xs font-medium border border-rose-500/10">
                  {s}
                </span>
              )) : <span className="text-sm text-white/20 italic">All core requirements met.</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
