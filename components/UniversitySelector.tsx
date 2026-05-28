"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { School, ChevronDown, Check, Search, X, Zap, GraduationCap, Building2 } from "lucide-react";
import { useUniversity, UNI_PRESETS } from "@/components/providers/UniversityProvider";
import { getPresetsByState, searchPresets, type UniversityPreset } from "@/lib/presets";
import { cn } from "@/lib/cn";

// ─── Evaluation Model Badge ────────────────────────────────────────────────────

function EvalBadge({ model }: { model: string }) {
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
// UNIVERSITY SELECTOR — Premium Command-Palette Style
// ═══════════════════════════════════════════════════════════════════════════════

interface UniversitySelectorProps {
  variant?: "navbar" | "mobile";
}

export default function UniversitySelector({ variant = "navbar" }: UniversitySelectorProps) {
  const { activePreset, setSelectedUniId } = useUniversity();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Close on click outside or escape
  useEffect(() => {
    const handleEvents = (e: MouseEvent | globalThis.KeyboardEvent) => {
      if (e instanceof KeyboardEvent && e.key === "Escape") {
        setIsOpen(false);
        setSearchQuery("");
      }
      if (e instanceof MouseEvent && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleEvents);
    document.addEventListener("keydown", handleEvents);
    return () => {
      document.removeEventListener("mousedown", handleEvents);
      document.removeEventListener("keydown", handleEvents);
    };
  }, []);

  // Auto-focus search when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
    if (!isOpen) {
      setSearchQuery("");
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  // Filtered and grouped presets
  const filteredPresets = useMemo(() => {
    if (!searchQuery.trim()) return UNI_PRESETS;
    return searchPresets(searchQuery);
  }, [searchQuery]);

  const groups = useMemo(() => {
    if (searchQuery.trim()) {
      // When searching, show flat results
      return [{ label: `Results (${filteredPresets.length})`, presets: filteredPresets }];
    }
    return getPresetsByState();
  }, [searchQuery, filteredPresets]);

  // Flat list for keyboard navigation
  const flatPresets = useMemo(() => {
    const flat: UniversityPreset[] = [];
    groups.forEach(g => flat.push(...g.presets));
    return flat;
  }, [groups]);

  // Keyboard navigation
  const handleTriggerKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(true);
      setFocusedIndex(0);
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex(prev => Math.min(prev + 1, flatPresets.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex(prev => Math.max(prev - 1, -1)); // Go back to search input at index -1
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < flatPresets.length) {
        setSelectedUniId(flatPresets[focusedIndex].id);
        setIsOpen(false);
        setSearchQuery("");
      }
    } else if (e.key === "Tab") {
      // Keep focus inside command palette when open
      if (searchInputRef.current && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current.focus();
      }
    }
  }, [focusedIndex, flatPresets, setSelectedUniId]);

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const el = listRef.current.querySelector(`[data-index="${focusedIndex}"]`);
      if (el) el.scrollIntoView({ block: "nearest" });
    }
  }, [focusedIndex]);

  const handleSelect = (id: string) => {
    setSelectedUniId(id);
    setIsOpen(false);
    setSearchQuery("");
  };

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
                "w-full flex items-center justify-between px-3 py-2.5 rounded-[16px] text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F8EF7]/50 focus-visible:bg-white/[0.04]",
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

  // ─── Desktop Navbar Variant ────────────────────────────────────────────────

  return (
    <div className="relative z-[9999]" ref={containerRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleTriggerKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={isOpen ? "preset-listbox" : undefined}
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

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, y: 16, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.94, y: 12, filter: "blur(12px)" }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className="absolute top-full right-0 w-[360px] bg-black/70 backdrop-blur-[60px] border border-white/[0.08] rounded-[24px] shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] p-3.5 z-[99999] origin-top-right select-none"
            onKeyDown={handleKeyDown}
          >
            {/* Subtle internal glow ring */}
            <div className="absolute inset-0 rounded-[24px] pointer-events-none ring-1 ring-inset ring-white/[0.02]" />

            {/* Search Bar */}
            <div className="relative mb-4 group/search">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within/search:text-white transition-colors" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setFocusedIndex(0);
                }}
                role="combobox"
                aria-autocomplete="list"
                aria-controls="preset-list"
                aria-expanded={isOpen}
                aria-activedescendant={focusedIndex >= 0 ? `preset-option-${focusedIndex}` : undefined}
                placeholder="Search university..."
                className="w-full bg-white/[0.03] border border-transparent rounded-[16px] pl-10 pr-8 py-3 text-[13px] font-medium text-white placeholder:text-white/30 outline-none focus:bg-white/[0.06] focus:border-white/10 transition-all shadow-inner"
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

            {/* Active Preset Banner */}
            <div className="mb-4 px-4 py-3.5 bg-white/[0.03] border border-white/[0.05] rounded-[16px] relative overflow-hidden group/banner">
              {/* Subtle background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent opacity-0 group-hover/banner:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                    <GraduationCap size={14} className="text-white" />
                  </div>
                  <span className="text-[13px] font-semibold text-white tracking-tight">{activePreset.shortName}</span>
                </div>
                <EvalBadge model={activePreset.evaluationModel} />
              </div>
              <div className="relative z-10 flex items-center gap-2 mt-2 ml-9">
                <span className="text-[11px] text-white/40 font-medium tracking-wide">{activePreset.gradingSystem}</span>
                {activePreset.sgpaToPercentage && (
                  <>
                    <span className="text-white/10">·</span>
                    <span className="text-[11px] text-white/40 font-mono tracking-wider">{activePreset.sgpaToPercentage}</span>
                  </>
                )}
              </div>
            </div>

            {/* List Body */}
            <div 
              className="p-2 max-h-[320px] overflow-y-auto custom-scrollbar"
              role="listbox"
              id="preset-listbox"
            >
              {groups.map((group) => (
                <div key={group.label} className="mb-4 last:mb-0">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">
                    {group.label}
                  </div>
                  <div className="space-y-1">
                    {group.presets.map((uni) => {
                      const globalIdx = flatPresets.findIndex(p => p.id === uni.id);
                      const isFocused = globalIdx === focusedIndex;
                      const isActive = activePreset.id === uni.id;

                      return (
                        <button
                          key={uni.id}
                          id={`preset-option-${globalIdx}`}
                          role="option"
                          aria-selected={isActive}
                          tabIndex={-1}
                          data-index={globalIdx}
                          onClick={() => handleSelect(uni.id)}
                          className={cn(
                            "w-full flex items-center justify-between p-2.5 rounded-[16px] transition-all duration-300 group/item text-left outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 relative overflow-hidden",
                            (isActive || isFocused) ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"
                          )}
                        >
                          {/* Hover & Active Background Layers for smooth transitions */}
                          <div 
                            className={cn("absolute inset-0 rounded-[16px] transition-opacity duration-300", 
                              isActive ? "opacity-100 bg-white/[0.08]" : (isFocused ? "opacity-100 bg-white/[0.04]" : "opacity-0 group-hover/item:opacity-100 group-hover/item:bg-white/[0.02]")
                            )}
                          />
                          <div className="flex items-center gap-3.5 min-w-0 relative z-10">
                          <div className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 transition-all duration-300",
                            isActive
                              ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                              : "bg-white/[0.03] text-white/40 border border-white/[0.05] group-hover/item:bg-white/[0.08] group-hover/item:text-white group-hover/item:border-white/10"
                          )}>
                            {uni.shortName[0]}
                          </div>
                          <div className="min-w-0 flex flex-col justify-center">
                            <div className={cn(
                              "text-[13px] font-semibold tracking-tight truncate transition-colors duration-300",
                              isActive ? "text-white" : "text-white/60 group-hover/item:text-white"
                            )}>
                              {uni.name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5 opacity-60 group-hover/item:opacity-100 transition-opacity duration-300">
                              <span className="text-[10px] text-white/50 font-medium tracking-wide">{uni.state}</span>
                              <span className="text-white/20">·</span>
                              <span className={cn(
                                "text-[10px] font-bold uppercase tracking-wider",
                                uni.evaluationModel === "relative" ? "text-amber-400" :
                                uni.evaluationModel === "hybrid" ? "text-blue-400" :
                                "text-emerald-400"
                              )}>
                                {uni.evaluationModel}
                              </span>
                            </div>
                          </div>
                        </div>
                        {isActive && (
                          <Check size={16} className="text-white shrink-0 relative z-10 mr-1 shadow-black drop-shadow-md" />
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

            {/* Footer */}
            <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center justify-between px-3">
              <span className="text-[10px] text-white/20 font-medium tracking-wide">{UNI_PRESETS.length} institutions</span>
              <div className="flex items-center gap-1.5 text-[10px] text-white/20">
                <Zap size={10} className="text-white/30" />
                <span className="font-medium tracking-wide">Adaptive Engine</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
