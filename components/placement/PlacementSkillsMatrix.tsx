"use client";

import React, { useState, useMemo } from "react";
import { Sparkles, Search, Filter } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { SKILL_TRACKS, SkillTrack } from "@/lib/career/skillsLedger";
import { DynamicRoadmapModal } from "@/app/(workspace)/placement/components/DynamicRoadmapModal";
import { cn } from "@/lib/cn";
import { motion } from "framer-motion";

const DynamicIcon = ({ iconName, className }: { iconName: string; className?: string }) => {
  const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Circle;
  return <IconComponent className={className} />;
};

const CATEGORIES = [
  "All",
  "Roles",
  "Frontend Technologies",
  "Backend Technologies",
  "Data & AI",
  "Cloud & DevOps",
  "Core CS & Security"
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { 
      staggerChildren: 0.05,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.9, filter: "blur(10px)" },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    filter: "blur(0px)",
    transition: { 
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1]
    } 
  }
};

export default function PlacementSkillsMatrix() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  const filteredTracks = useMemo(() => {
    // 1. Tokenize query for multi-word search (e.g., "AI Python" -> ["ai", "python"])
    const queryTokens = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);

    return SKILL_TRACKS.filter((track) => {
      // 2. Build a comprehensive search string representing the entire track
      const searchableText = [
        track.title,
        track.description,
        track.category,
        track.difficulty,
        track.marketDemand,
        ...(track.atsKeywords || [])
      ].join(" ").toLowerCase();

      // 3. Every word the user typed MUST be found somewhere in the track's text
      const matchesSearch = queryTokens.length === 0 || queryTokens.every(token => searchableText.includes(token));
      
      const matchesCategory = activeCategory === "All" || track.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const handleOpenRoadmap = (track: SkillTrack) => {
    setSelectedRole(track.title);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full flex flex-col pb-32 pt-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="mb-12 text-center md:text-left relative z-20"
      >
        <motion.h2 
          className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-white"
        >
          The 2026 Skills Matrix
        </motion.h2>
        <p className="text-[#86868b] max-w-2xl text-[15px] leading-[1.618]">
          Explore the top 60 most critical technologies and roles demanded by tier-1 product companies. Track your mastery, build your roadmap, and dominate your career.
        </p>
      </motion.div>

      {/* Filters and Search */}
      <motion.div 
        initial={{ opacity: 0, x: -30, filter: "blur(5px)" }}
        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="mb-10 flex flex-col lg:flex-row items-center justify-between gap-6 relative z-20"
      >
        <div 
          className="flex items-center gap-2 overflow-x-auto pb-4 -mb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full flex-1 pr-8"
          style={{ WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)', maskImage: 'linear-gradient(to right, black 85%, transparent 100%)' }}
          role="tablist"
          aria-label="Skill Categories"
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
              e.preventDefault();
              const currentIndex = CATEGORIES.indexOf(activeCategory);
              let newIndex = e.key === 'ArrowRight' 
                ? (currentIndex + 1) % CATEGORIES.length 
                : (currentIndex - 1 + CATEGORIES.length) % CATEGORIES.length;
              setActiveCategory(CATEGORIES[newIndex]);
            }
          }}
        >
          {CATEGORIES.map(category => (
            <motion.button
              key={category}
              onClick={() => setActiveCategory(category)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "relative px-5 py-2.5 rounded-full text-[13px] font-medium transition-colors duration-300 whitespace-nowrap border outline-none",
                activeCategory === category 
                  ? "text-black border-transparent" 
                  : "bg-[#1c1c1e] text-[#86868b] hover:text-white hover:bg-white/5 border-white/[0.04]"
              )}
            >
              {activeCategory === category && (
                <motion.div
                  layoutId="skillsCategoryBg"
                  className="absolute inset-0 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                  transition={{ type: "spring", stiffness: 500, damping: 35, mass: 1 }}
                />
              )}
              <span className="relative z-10">{category}</span>
            </motion.button>
          ))}
        </div>

        <div className="relative w-full lg:w-80 shrink-0 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors duration-300" />
          <input 
            type="text"
            placeholder="Search skills, roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1c1c1e] border border-white/[0.04] hover:border-white/10 rounded-full py-3 pl-11 pr-5 text-[14px] text-white placeholder:text-[#86868b] focus:outline-none focus:border-[#0a84ff]/50 focus:ring-[2px] focus:ring-[#0a84ff]/20 transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
          />
        </div>
      </motion.div>

      {/* Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10"
      >
        {filteredTracks.map((track, index) => (
          <motion.div 
            variants={itemVariants}
            key={track.id} 
            onClick={() => handleOpenRoadmap(track)}
            className="group cursor-pointer h-full rounded-[24px] border border-white/[0.04] bg-[#1c1c1e] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-300 hover:bg-[#2c2c2e] relative overflow-hidden flex flex-col will-change-transform [content-visibility:auto] [contain-intrinsic-size:100%_320px]"
          >
            <div className="relative z-10 flex flex-col h-full">
              {/* Header: Icon, Category & Title Inline */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center transition-colors group-hover:bg-white/[0.04] group-hover:border-white/[0.08] shadow-sm">
                  <DynamicIcon iconName={track.iconName} className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" />
                </div>
                <div className="flex flex-col pt-0.5">
                  <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-zinc-500/80 mb-1">{track.category}</p>
                  <h3 className="text-lg font-medium tracking-tight text-white/95 group-hover:text-white transition-colors leading-none">{track.title}</h3>
                </div>
              </div>

              {/* Data Row (Stat-Block) */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-4 pb-4 border-b border-white/[0.04]">
                {track.placementProbability && (
                  <div className="flex items-center gap-1.5 pr-3 border-r border-white/[0.06]">
                    <motion.svg 
                      className="w-3 h-3 -rotate-90" 
                      viewBox="0 0 16 16"
                      animate={{ scale: [1, 1.15, 1], filter: ["brightness(1)", "brightness(1.3)", "brightness(1)"] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: (index % 10) * 0.15 }}
                    >
                      <circle className="text-white/10" strokeWidth="2.5" stroke="currentColor" fill="transparent" r="6" cx="8" cy="8" />
                      <circle className="text-emerald-400/80" strokeWidth="2.5" strokeDasharray={`${track.placementProbability * 0.377} 37.7`} strokeLinecap="round" stroke="currentColor" fill="transparent" r="6" cx="8" cy="8" />
                    </motion.svg>
                    <span className="text-[11px] font-semibold text-zinc-300 tracking-wide">
                      {track.placementProbability}% MATCH
                    </span>
                  </div>
                )}
                <span className={cn("text-[11px] font-medium tracking-wide",
                  track.salaryRange ? "pr-3 border-r border-white/[0.06]" : "",
                  track.difficulty === "Advanced" ? "text-rose-400/80" :
                  track.difficulty === "Intermediate" ? "text-amber-400/80" :
                  "text-zinc-400/80"
                )}>
                  {track.difficulty}
                </span>
                {track.salaryRange && (
                  <span className="text-[11px] font-medium text-zinc-400/80 tracking-wide">
                    {track.salaryRange}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-zinc-400/80 text-[13px] leading-[1.6] mb-6 flex-grow font-medium line-clamp-2">
                {track.description}
              </p>

              {/* Footer: Keywords & Action Inline */}
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.03] group-hover:border-white/[0.08] transition-colors">
                <div className="flex flex-wrap gap-1.5 overflow-hidden">
                  {track.atsKeywords && track.atsKeywords.slice(0, 2).map((kw, idx) => (
                    <span key={`${track.id}-kw-${idx}`} className="text-[9px] font-semibold tracking-wide text-zinc-500 bg-white/[0.02] px-2 py-0.5 rounded border border-white/[0.03] whitespace-nowrap">
                      {kw}
                    </span>
                  ))}
                  {track.atsKeywords && track.atsKeywords.length > 2 && (
                    <span className="text-[9px] font-semibold tracking-wide text-zinc-600 bg-white/[0.01] px-1.5 py-0.5 rounded border border-white/[0.02] whitespace-nowrap">
                      +{track.atsKeywords.length - 2}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center text-zinc-500 font-medium text-[11px] group-hover:text-white transition-colors shrink-0 pl-3">
                  <span>View Roadmap</span>
                  <LucideIcons.ArrowRight className="w-3 h-3 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredTracks.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full flex flex-col items-center justify-center py-24 px-4 text-center border border-white/[0.04] rounded-[24px] bg-[#1c1c1e] relative z-10 mt-6"
        >
          <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/[0.04] flex items-center justify-center mb-6 shadow-inner">
            <Search className="w-6 h-6 text-zinc-500" />
          </div>
          <h3 className="text-lg font-medium text-white/95 mb-2 tracking-tight">No results found</h3>
          <p className="text-zinc-500 max-w-sm text-[14px] leading-[1.6] mb-8 font-medium">
            We couldn't find any roles matching "{searchQuery}" in {activeCategory}. 
          </p>
          <button 
            onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
            className="px-6 py-2.5 rounded-full bg-white text-black hover:bg-white/90 text-[13px] font-semibold transition-all shadow-lg shadow-white/5 active:scale-95"
          >
            Clear Search
          </button>
        </motion.div>
      )}

      <DynamicRoadmapModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId="cm4d9e03"
        initialRole={selectedRole}
      />
    </div>
  );
}
