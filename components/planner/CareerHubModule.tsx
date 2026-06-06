"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, ChevronDown, ChevronUp, Code, CheckCircle, AlertTriangle, ShieldCheck, Map, Terminal, Cpu, Layout, CheckSquare, Square } from "lucide-react";
import Card from "@/components/ui/Card";
import { DEFAULT_RECRUITERS, ROLE_SKILL_MAP } from "@/lib/career/careerData";
import { useUSMStore } from "@/stores/usmStore";

const TIER_COLORS: Record<string, string> = {
  "FAANG": "bg-blue-500",
  "Product": "bg-purple-500",
  "Startup": "bg-amber-500",
  "Service": "bg-emerald-500"
};

// Removed mock CAREER_DATABASE and ROADMAPS

interface CareerHubProps {
  currentCgpa?: number;
  targetCgpa?: number;
  completedSemesters?: number;
  remainingSemesters?: number;
  result?: any;
  preset?: any;
}

export default function CareerHubModule({ currentCgpa = 7.0, targetCgpa = 8.5 }: CareerHubProps) {
  const projectedCgpa = targetCgpa;
  const activeBacklogs = 0;
  const userSkills = useUSMStore(s => s.career.skills.map(skill => skill.toLowerCase()));
  
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTrack, setActiveTrack] = useState<string>("Frontend Developer");

  const checkEligibility = (company: typeof DEFAULT_RECRUITERS[0]) => {
    return projectedCgpa >= company.cgpaCutoff && activeBacklogs <= company.maxBacklogs;
  };

  return (
    <Card className="relative overflow-hidden border border-white/10" padding="xl">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-50" />
      
      <div className="relative z-10 space-y-12">
        <div className="flex items-center gap-4 border-b border-white/20 pb-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20">
            <Briefcase className="text-indigo-400" size={28} />
          </div>
          <div>
            <h3 className="font-headline text-3xl font-black text-white">Career Intelligence</h3>
            <p className="text-on-surface-variant mt-1 text-sm">Placement eligibility & structured skill roadmaps.</p>
          </div>
        </div>

        {/* Company Eligibility Section */}
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
            <CheckCircle size={16} /> Placement Eligibility Engine
          </span>
          <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {DEFAULT_RECRUITERS.map(company => {
              const isEligible = checkEligibility(company);
              const isExpanded = expandedId === company.name;
              const color = TIER_COLORS[company.tier] || "bg-slate-500";
              const isDsaRequired = company.requiredSkills?.some(s => s.toLowerCase().includes("dsa") || s.toLowerCase().includes("algorithms")) || false;
              
              return (
                <div 
                  key={company.name} 
                  className={`rounded-2xl border transition-all duration-300 shrink-0 ${isEligible ? 'border-white/10 bg-white/5' : 'border-red-500/10 bg-red-500/5'} overflow-hidden`}
                >
                  <div 
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.02]"
                    onClick={() => setExpandedId(isExpanded ? null : company.name)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${color} shadow-[0_0_10px_currentColor]`} />
                      <div>
                        <h4 className="font-bold text-white text-lg">{company.name}</h4>
                        <p className="text-xs text-on-surface-variant uppercase tracking-widest font-semibold">{company.tier}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-2 ${isEligible ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'}`}>
                        {isEligible ? <><CheckCircle size={14} /> Eligible</> : <><AlertTriangle size={14} /> At Risk</>}
                      </span>
                      {isExpanded ? <ChevronUp size={20} className="text-white/50" /> : <ChevronDown size={20} className="text-white/50" />}
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className=" border-t border-white/20 bg-[#1D1D1F]"
                      >
                        <div className="p-5 space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Criteria vs Reality</span>
                              <div className="flex items-center justify-between p-3 rounded-xl bg-[#252527] border border-white/5">
                                <span className="text-sm text-white/70">Min CGPA</span>
                                <span className={`font-bold font-mono ${projectedCgpa >= company.cgpaCutoff ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {projectedCgpa.toFixed(2)} / {company.cgpaCutoff.toFixed(1)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                <span className="text-sm text-white/70">Max Backlogs</span>
                                <span className={`font-bold font-mono ${activeBacklogs <= company.maxBacklogs ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {activeBacklogs} / {company.maxBacklogs}
                                </span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Required Core Skills</span>
                              <div className="flex flex-wrap gap-2">
                                {company.requiredSkills?.map(skill => (
                                  <span key={skill} className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 text-xs font-semibold border border-indigo-500/20 flex items-center gap-1.5">
                                    <Code size={12} /> {skill}
                                  </span>
                                ))}
                                {isDsaRequired && (
                                  <span className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 text-xs font-semibold border border-amber-500/20 flex items-center gap-1.5">
                                    <ShieldCheck size={12} /> DSA Heavy
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Skill Roadmap Engine */}
        <div className="pt-8 border-t border-white/20 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
              <Map size={16} /> Skill Roadmap Engine
            </span>
            <div className="flex flex-wrap gap-2">
              {Object.keys(ROLE_SKILL_MAP).map(track => (
                <button
                  key={track}
                  onClick={() => setActiveTrack(track)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                    activeTrack === track 
                    ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
                    : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {track}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#0A0A0B] border border-white/10 shadow-inner">
            <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Terminal className="text-indigo-400" />
              {activeTrack} Journey
            </h4>
            
            <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              {Object.entries(ROLE_SKILL_MAP[activeTrack]).map(([levelName, skillsArray], i) => {
                const title = levelName.replace(/level_\d+_/, "").replace(/_/g, " ").toUpperCase();
                const desc = skillsArray.join(", ");
                // A level is considered 'done' if the user possesses at least one skill from it
                const isDone = skillsArray.some(skill => userSkills.includes(skill.toLowerCase()));

                return (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-[#0A0A0B] text-white/50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 relative">
                      {isDone ? <CheckCircle size={18} className="text-emerald-400" /> : <div className="w-2.5 h-2.5 rounded-full bg-white/20" />}
                    </div>
                    
                    <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border transition-all ${isDone ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/10'} mb-8`}>
                      <div className="flex items-start justify-between mb-1">
                        <h5 className={`font-bold text-sm ${isDone ? 'text-emerald-300' : 'text-white'}`}>Level {i + 1}: {title}</h5>
                        {isDone ? <CheckSquare size={16} className="text-emerald-400/50" /> : <Square size={16} className="text-white/20" />}
                      </div>
                      <p className="text-xs text-white/50 mt-2 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </Card>
  );
}
