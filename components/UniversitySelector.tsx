"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { School, ChevronDown, Check, Search, X, Zap, GraduationCap, MapPin } from "lucide-react";
import { useUniversity, UNI_PRESETS } from "@/components/providers/UniversityProvider";
import { getPresetsByState, searchPresets, type UniversityPreset } from "@/lib/presets";
import { cn } from "@/lib/cn";

// ─── Evaluation Model Badge ────────────────────────────────────────────────────
export function EvalBadge({ model }: { model: string }) {
  const config = {
    absolute: { label: "Absolute", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
    relative: { label: "Relative", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
    hybrid:   { label: "Hybrid",   color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  }[model] || { label: model, color: "text-white/50 bg-white/5 border-white/10" };

  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border", config.color)}>
      {config.label}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNIVERSITY TRIGGER (sits in the top row of the island)
// ═══════════════════════════════════════════════════════════════════════════════

export function UniversityTrigger({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  const { activePreset } = useUniversity();

  return (
    <button
      onClick={onClick}
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-label={activePreset.shortName ? `Selected university: ${activePreset.shortName}` : "Select university"}
      className={cn(
        "flex items-center gap-2.5 px-4 py-2 rounded-full backdrop-blur-xl border transition-all duration-500 text-[13px] font-bold group outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]",
        isOpen
          ? "border-white/20 bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.1)]"
          : "border-white/[0.05] bg-white/[0.02] text-white/70 hover:text-white hover:bg-white/[0.06] hover:border-white/15"
      )}
    >
      <School size={16} className={cn("transition-transform group-hover:scale-110", isOpen ? "text-white" : "text-white/50 group-hover:text-white/80")} />
      <span className="max-w-[120px] truncate tracking-tight">{activePreset.shortName || "Select Identity"}</span>
      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 20 }}>
        <ChevronDown size={14} className={cn("transition-colors", isOpen ? "text-white/70" : "text-white/30 group-hover:text-white/60")} />
      </motion.div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNIVERSITY CONTENT (Premium 2-column layout for Dynamic Island)
// ═══════════════════════════════════════════════════════════════════════════════

export function UniversityContent({ onClose }: { onClose: () => void }) {
  const { activePreset, setSelectedUniId } = useUniversity();
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-focus search when rendered
  useEffect(() => {
    setTimeout(() => searchInputRef.current?.focus(), 100);
  }, []);

  const filteredPresets = useMemo(() => {
    if (!searchQuery.trim()) return UNI_PRESETS;
    return searchPresets(searchQuery);
  }, [searchQuery]);

  const groups = useMemo(() => {
    if (searchQuery.trim()) {
      return [{ label: `Results (${filteredPresets.length})`, presets: filteredPresets }];
    }
    return getPresetsByState();
  }, [searchQuery, filteredPresets]);

  const flatPresets = useMemo(() => {
    const flat: UniversityPreset[] = [];
    groups.forEach(g => flat.push(...g.presets));
    return flat;
  }, [groups]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex(prev => Math.min(prev + 1, flatPresets.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < flatPresets.length) {
        setSelectedUniId(flatPresets[focusedIndex].id);
        onClose();
      }
    }
  }, [focusedIndex, flatPresets, setSelectedUniId, onClose]);

  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const el = listRef.current.querySelector(`[data-index="${focusedIndex}"]`);
      if (el) el.scrollIntoView({ block: "nearest" });
    }
  }, [focusedIndex]);

  const handleSelect = (id: string) => {
    setSelectedUniId(id);
    onClose();
  };

  return (
    <div className="w-full px-6 pb-6 pt-2" onKeyDown={handleKeyDown}>
      {/* 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-[1fr_1.2fr] gap-6">
        
        {/* LEFT COLUMN: Search + Active Preset */}
        <div className="flex flex-col gap-4">
          {/* Section Header */}
          <div className="flex items-center gap-2">
            <School size={14} className="text-white/30" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30">
              Institution
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative group/search">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within/search:text-white transition-colors" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setFocusedIndex(0);
              }}
              placeholder="Search university..."
              className="w-full bg-white/[0.03] border border-white/[0.05] rounded-2xl pl-10 pr-8 py-3 text-[13px] font-medium text-white placeholder:text-white/30 outline-none focus:bg-white/[0.06] focus:border-white/10 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setFocusedIndex(-1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/80 transition-colors bg-white/5 hover:bg-white/10 rounded-full p-1"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Active Preset Card */}
          <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl relative overflow-hidden group/banner">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.05] to-transparent opacity-0 group-hover/banner:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-black text-[15px] shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  {activePreset.shortName[0]}
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-bold text-white tracking-tight truncate">{activePreset.shortName}</div>
                  <div className="text-[11px] text-white/40 font-medium">{activePreset.name}</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <EvalBadge model={activePreset.evaluationModel} />
                <span className="text-[10px] text-white/30 font-medium">{activePreset.gradingSystem}</span>
                {activePreset.sgpaToPercentage && (
                  <>
                    <span className="text-white/10">·</span>
                    <span className="text-[10px] text-white/30 font-mono">{activePreset.sgpaToPercentage}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stats Footer */}
          <div className="flex items-center justify-between px-1 mt-auto">
            <span className="text-[10px] text-white/20 font-medium tracking-wide">{UNI_PRESETS.length} institutions</span>
            <div className="flex items-center gap-1.5 text-[10px] text-white/20">
              <Zap size={10} className="text-white/30" />
              <span className="font-medium tracking-wide">Adaptive Engine</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Scrollable University List */}
        <div className="flex flex-col">
          <div className="max-h-[300px] overflow-y-auto custom-scrollbar pr-1" ref={listRef}>
            {groups.map((group) => (
              <div key={group.label} className="mb-3 last:mb-0">
                <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/30 mb-1 flex items-center gap-2 sticky top-0 bg-[#1D1D1F]/95 backdrop-blur-sm z-10">
                  <MapPin size={10} className="text-white/20" />
                  {group.label}
                </div>
                <div className="space-y-0.5">
                  {group.presets.map((uni) => {
                    const globalIdx = flatPresets.findIndex(p => p.id === uni.id);
                    const isFocused = globalIdx === focusedIndex;
                    const isActive = activePreset.id === uni.id;

                    return (
                      <button
                        key={uni.id}
                        data-index={globalIdx}
                        onClick={() => handleSelect(uni.id)}
                        className={cn(
                          "w-full flex items-center justify-between p-2.5 rounded-xl transition-all duration-300 group/item text-left outline-none relative",
                          isActive ? "bg-white/[0.06]" : (isFocused ? "bg-white/[0.04]" : "hover:bg-white/[0.03]")
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-bold shrink-0 transition-all duration-300",
                            isActive
                              ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                              : "bg-white/[0.04] text-white/40 border border-white/[0.06] group-hover/item:bg-white/[0.08] group-hover/item:text-white/70"
                          )}>
                            {uni.shortName[0]}
                          </div>
                          <div className="min-w-0 flex flex-col">
                            <span className={cn(
                              "text-[13px] font-semibold tracking-tight truncate transition-colors duration-300",
                              isActive ? "text-white" : "text-white/60 group-hover/item:text-white/90"
                            )}>
                              {uni.name}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-white/30 font-medium">{uni.state}</span>
                              <span className="text-white/10">·</span>
                              <span className={cn(
                                "text-[10px] font-bold uppercase tracking-wider",
                                uni.evaluationModel === "relative" ? "text-amber-400/70" :
                                uni.evaluationModel === "hybrid" ? "text-blue-400/70" :
                                "text-emerald-400/70"
                              )}>
                                {uni.evaluationModel}
                              </span>
                            </div>
                          </div>
                        </div>
                        {isActive && (
                          <Check size={15} className="text-white shrink-0 mr-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {filteredPresets.length === 0 && (
              <div className="py-12 text-center" role="presentation">
                <Search size={24} className="text-white/10 mx-auto mb-3" />
                <p className="text-[12px] text-white/30 font-medium tracking-wide">No universities found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT DEFAULT (fallback for standalone usage)
// ═══════════════════════════════════════════════════════════════════════════════
export default function UniversitySelector({ variant = "navbar" }: { variant?: "navbar" | "mobile" }) {
  const [isOpen, setIsOpen] = useState(false);
  const { activePreset, setSelectedUniId } = useUniversity();

  if (variant === "mobile") {
    return (
      <div className="mb-8 p-1 bg-white/[0.02] border border-white/[0.05] rounded-[24px]">
        <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/20">
          Active Institution
        </div>
        <div className="max-h-[200px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent overscroll-contain touch-pan-y">
          {UNI_PRESETS.map((uni) => (
            <button
              key={uni.id}
              onClick={() => setSelectedUniId(uni.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-[16px] text-left transition-all",
                activePreset.id === uni.id
                  ? "bg-[#4F8EF7]/10 text-white"
                  : "text-white/40 hover:text-white/60 hover:bg-white/[0.02]"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shrink-0",
                  activePreset.id === uni.id
                    ? "bg-[#4F8EF7] text-white"
                    : "bg-white/5 text-white/40"
                )}>
                  {uni.shortName[0]}
                </div>
                <div className="min-w-0">
                  <span className="text-[12px] font-bold tracking-tight block truncate">{uni.shortName}</span>
                  <span className="text-[9px] text-white/20 font-medium">{uni.state}</span>
                </div>
              </div>
              {activePreset.id === uni.id && (
                <Check size={14} className="text-[#4F8EF7] shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <UniversityTrigger isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
    </div>
  );
}
