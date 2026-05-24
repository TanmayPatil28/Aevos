"use client";

import { motion, Variants } from "framer-motion";
import { SlidersHorizontal, Calculator, GraduationCap, ShieldCheck, Zap } from "lucide-react";

export default function SimulatorGuide() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="bg-[#000000] border border-white/[0.08] rounded-[1.5rem] p-6 relative group shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity duration-1000" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity duration-1000" />
      
      <div className="mb-6 flex items-center justify-between relative z-10">
        <h3 className="text-white font-semibold text-sm tracking-tight flex items-center gap-2">
          <GraduationCap size={16} className="text-white/80" />
          Simulator Guide
        </h3>
        <div className="px-2 py-1 rounded border border-[#4F8EF7]/30 bg-[#4F8EF7]/10 flex items-center gap-1.5">
          <Zap size={10} className="text-[#4F8EF7] animate-pulse" />
          <span className="text-[9px] font-bold text-[#4F8EF7] uppercase tracking-widest">Interactive</span>
        </div>
      </div>

      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show"
        className="flex flex-col gap-6 relative z-10"
      >
        <motion.div variants={itemVariants} className="flex gap-4 items-start group/item cursor-default">
          <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center shrink-0 mt-0.5 group-hover/item:border-indigo-500/50 group-hover/item:bg-indigo-500/10 transition-colors">
            <SlidersHorizontal size={14} className="text-white/70 group-hover/item:text-indigo-400 transition-colors" />
          </div>
          <div>
            <h4 className="text-white text-xs font-semibold mb-1 tracking-wide">Adjust Trajectories</h4>
            <p className="text-white/50 text-[11px] leading-relaxed font-medium">
              Use the dropdowns on any course card to manipulate your expected grade. Watch as the engine instantly recalculates your future.
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex gap-4 items-start group/item cursor-default">
          <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center shrink-0 mt-0.5 group-hover/item:border-[#4F8EF7]/50 group-hover/item:bg-[#4F8EF7]/10 transition-colors">
            <Calculator size={14} className="text-white/70 group-hover/item:text-[#4F8EF7] transition-colors" />
          </div>
          <div>
            <h4 className="text-white text-xs font-semibold mb-1 tracking-wide">Real-Time Arithmetic</h4>
            <p className="text-white/50 text-[11px] leading-relaxed font-medium">
              Every change instantly updates your Simulated SGPA and Projected CGPA, giving you immediate feedback on your academic strategy.
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex gap-4 items-start group/item cursor-default">
          <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center shrink-0 mt-0.5 group-hover/item:border-emerald-500/50 group-hover/item:bg-emerald-500/10 transition-colors">
            <ShieldCheck size={14} className="text-white/70 group-hover/item:text-emerald-400 transition-colors" />
          </div>
          <div>
            <h4 className="text-white text-xs font-semibold mb-1 tracking-wide">Statutory Verification</h4>
            <p className="text-white/50 text-[11px] leading-relaxed font-medium">
              All projections are mathematically bound to your university's official credit weightings and exact grading scales.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
