"use client";

import React, { useState, useMemo } from "react";
import { Sparkles, Search, Filter } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { DynamicRoadmapModal } from "@/app/(workspace)/placement/components/DynamicRoadmapModal";
import { SKILL_TRACKS, SkillTrack } from "@/lib/career/skillsLedger";

// Dynamic Icon Renderer
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

export default function CareerOSPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  const filteredTracks = useMemo(() => {
    return SKILL_TRACKS.filter((track) => {
      const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            track.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "All" || track.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const handleOpenRoadmap = (track: SkillTrack) => {
    setSelectedRole(track.title);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full min-h-screen flex flex-col pt-24 px-6 max-w-[1400px] mx-auto pb-32">
      <PageHero 
        headline={<>The 2026 Technology Paradigm.<br/>Your Skills Matrix.</>}
        description="A massive, industry-validated ledger of the exact roles and technologies demanded by FAANG and elite startups. Click any skill to instantly generate a hyper-personalized, AI-driven learning roadmap."
      />

      {/* Filters and Search */}
      <div className="mt-8 mb-12 flex flex-col lg:flex-row items-center justify-between gap-6 relative z-20">
        
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === category 
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                  : "bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text"
            placeholder="Search skills, roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-full py-2.5 pl-10 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10">
        {filteredTracks.map((track) => (
          <div 
            key={track.id} 
            onClick={() => handleOpenRoadmap(track)}
            className="group cursor-pointer h-full rounded-[24px] border border-white/5 bg-zinc-900/40 p-6 transition-all duration-300 hover:bg-zinc-800/60 hover:-translate-y-1 hover:border-indigo-500/30 relative overflow-hidden backdrop-blur-md flex flex-col"
          >
            {/* Hover Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-inner group-hover:border-indigo-500/50 transition-colors">
                  <DynamicIcon iconName={track.iconName} className="w-6 h-6 text-indigo-400 group-hover:text-indigo-300" />
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md border ${
                    track.difficulty === "Advanced" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                    track.difficulty === "Intermediate" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}>
                    {track.difficulty}
                  </span>
                  
                  {track.marketDemand === "Critical" && (
                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <Sparkles className="w-3 h-3" /> Critical Demand
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-xl font-bold text-zinc-100 mb-2">{track.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6 flex-grow">
                {track.description}
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800/50">
                <span className="text-xs font-medium text-zinc-500">{track.category}</span>
                <div className="flex items-center text-indigo-400 font-medium text-sm group-hover:text-indigo-300 transition-colors">
                  <span>Generate Roadmap</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTracks.length === 0 && (
        <div className="w-full py-24 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
            <Filter className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-xl font-semibold text-zinc-300 mb-2">No skills found</h3>
          <p className="text-zinc-500 max-w-md">Try adjusting your search query or selecting a different category filter.</p>
        </div>
      )}

      {/* Dynamic Roadmap Modal */}
      <DynamicRoadmapModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId="cm4d9e03"
        initialRole={selectedRole}
      />
    </div>
  );
}
