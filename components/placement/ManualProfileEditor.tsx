"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X, User, Briefcase, GraduationCap, DollarSign } from "lucide-react";
import { useUSMStore } from "@/stores/usmStore";
import { cn } from "@/lib/cn";

export default function ManualProfileEditor() {
  const career = useUSMStore((state) => state.career);
  const setCareer = useUSMStore((state) => state.setCareer);

  const [newSkill, setNewSkill] = useState("");

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (career.skills.includes(newSkill.trim())) return;
    
    setCareer({
      ...career,
      skills: [...career.skills, newSkill.trim()]
    });
    setNewSkill("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setCareer({
      ...career,
      skills: career.skills.filter(s => s !== skillToRemove)
    });
  };

  const handleUpdateField = (field: keyof typeof career, value: string) => {
    setCareer({
      ...career,
      [field]: value
    });
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20, filter: "blur(10px)" },
    visible: { 
      opacity: 1, scale: 1, y: 0, filter: "blur(0px)",
      transition: { type: "spring", stiffness: 300, damping: 25, staggerChildren: 0.08, delayChildren: 0.05 }
    },
    exit: { opacity: 0, scale: 0.95, y: 10, filter: "blur(10px)" }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, filter: "blur(5px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 300, damping: 25 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="group relative overflow-hidden rounded-[2rem] border border-white/[0.06] bg-surface shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col md:flex-row w-full h-full"
    >
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      {/* LEFT COLUMN: Skills Manager */}
      <div className="w-full md:w-3/5 flex flex-col p-6 md:px-8 md:pt-8 pb-24 md:pb-24 relative z-10 transition-all duration-700 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <motion.div variants={itemVariants} className="mb-4">
          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-1">Career Skills</h2>
          <p className="text-[13px] text-foreground-muted font-medium">Manage the core skills JARVIS uses to match you with opportunities.</p>
        </motion.div>

        <motion.form variants={itemVariants} onSubmit={handleAddSkill} className="relative mb-5">
          <input 
            type="text" 
            placeholder="e.g., React, Python, Product Management..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            className="w-full bg-white/[0.03] border border-border rounded-2xl px-5 py-4 text-[14px] text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:border-brand focus:bg-white/[0.05] transition-all shadow-inner"
          />
          <button 
            type="submit"
            disabled={!newSkill.trim()}
            className="absolute right-2 top-2 bottom-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-surface-overlay text-foreground rounded-xl px-4 transition-colors flex items-center justify-center"
          >
            <Plus className="w-5 h-5" />
          </button>
        </motion.form>

        <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
          {career.skills.length === 0 ? (
            <div className="w-full p-8 border border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center">
              <span className="text-[13px] text-foreground-muted font-medium">No skills added yet. Add some above to improve your matching.</span>
            </div>
          ) : (
            career.skills.map((skill) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                key={skill}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-raised border border-border text-[13px] font-medium text-foreground/90 hover:bg-surface-overlay transition-colors group/pill cursor-default"
              >
                {skill}
                <button 
                  onClick={() => handleRemoveSkill(skill)}
                  className="p-0.5 rounded-full hover:bg-white/20 transition-colors text-foreground/40 hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      {/* RIGHT COLUMN: Core Details */}
      <div className="w-full md:w-2/5 relative p-6 md:px-8 md:pt-8 pb-24 md:pb-24 border-t md:border-t-0 md:border-l border-white/[0.06] bg-surface flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <motion.div variants={itemVariants} className="mb-6">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground-muted/80 mb-2">
            Core Details
          </h3>
          <p className="text-[12px] text-foreground-tertiary font-medium leading-[1.6]">
            Configure your target trajectory.
          </p>
        </motion.div>

        <div className="flex flex-col gap-4">
          <motion.div variants={itemVariants} className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted flex items-center gap-2">
              <Briefcase className="w-3 h-3" /> Target Role
            </label>
            <input 
              type="text" 
              value={career.targetRole || ""}
              onChange={(e) => handleUpdateField("targetRole", e.target.value)}
              placeholder="e.g., Frontend Engineer"
              className="w-full bg-transparent border-b border-border py-2 text-[14px] text-foreground placeholder:text-zinc-700 focus:outline-none focus:border-[#0a84ff] transition-colors"
            />
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted flex items-center gap-2">
              <GraduationCap className="w-3 h-3" /> Branch / Domain
            </label>
            <input 
              type="text" 
              value={career.branch || ""}
              onChange={(e) => handleUpdateField("branch", e.target.value)}
              placeholder="e.g., Computer Science"
              className="w-full bg-transparent border-b border-border py-2 text-[14px] text-foreground placeholder:text-zinc-700 focus:outline-none focus:border-[#0a84ff] transition-colors"
            />
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted flex items-center gap-2">
              <DollarSign className="w-3 h-3" /> Target Package
            </label>
            <input 
              type="text" 
              value={career.targetPackage || ""}
              onChange={(e) => handleUpdateField("targetPackage", e.target.value)}
              placeholder="e.g., 20 LPA"
              className="w-full bg-transparent border-b border-border py-2 text-[14px] text-foreground placeholder:text-zinc-700 focus:outline-none focus:border-[#0a84ff] transition-colors"
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
