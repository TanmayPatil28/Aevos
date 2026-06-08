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
    <div className="w-full bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 md:p-12 relative overflow-hidden shadow-2xl">
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#0a84ff]/20 rounded-xl">
                <Crosshair size={20} className="text-[#0a84ff]" />
              </div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-white/50">Competency Radar</h2>
            </div>
            <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
              {role}
            </h3>
            <p className="text-white/40 text-lg">Detailed competency overlap</p>
          </div>
          
          <div className="flex flex-col items-start md:items-end">
            <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2">Readiness Index</span>
            <div className="flex items-baseline gap-1">
              <span className="text-6xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text leading-none bg-gradient-to-b from-white to-white/60">
                {result.readinessPercentage}
              </span>
              <span className="text-3xl text-white/30 font-bold">%</span>
            </div>
          </div>
        </div>

        {/* macOS Style Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden mb-12 shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${result.readinessPercentage}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="bg-[#0a84ff] h-full shadow-[0_0_15px_rgba(10,132,255,0.8)]" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/5 rounded-3xl p-8">
            <h4 className="text-[#34c759] text-sm font-bold mb-6 flex items-center gap-2 uppercase tracking-widest">
              <CheckCircle2 className="w-5 h-5" /> Acquired Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.presentSkills.length > 0 ? result.presentSkills.map(s => (
                <span key={s} className="px-4 py-2 bg-[#34c759]/10 text-[#34c759] rounded-xl text-xs font-bold border border-[#34c759]/20 shadow-sm">
                  {s}
                </span>
              )) : <span className="text-sm text-white/30 italic font-medium">No exact matches found in profile.</span>}
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-3xl p-8">
            <h4 className="text-[#ff453a] text-sm font-bold mb-6 flex items-center gap-2 uppercase tracking-widest">
              <AlertCircle className="w-5 h-5" /> Missing Requirements
            </h4>
            <div className="flex flex-wrap gap-2">
               {result.missingSkills.length > 0 ? result.missingSkills.map(s => (
                <span key={s} className="px-4 py-2 bg-[#ff453a]/10 text-[#ff453a] rounded-xl text-xs font-bold border border-[#ff453a]/20 shadow-sm">
                  {s}
                </span>
              )) : <span className="text-sm text-white/30 italic font-medium">All core requirements met.</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
