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
        aria-controls={isOpen ? "preset-list" : undefined}
        aria-label="Select university"
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border transition-all duration-500 text-[13px] font-bold group shadow-inner outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F8EF7] focus-visible:shadow-[0_0_15px_rgba(79,142,247,0.4)] focus-visible:border-transparent",
          isOpen
            ? "border-[#4F8EF7] bg-[#4F8EF7]/10 text-white"
            : "border-white/[0.05] text-white/70 hover:text-white hover:bg-white/[0.06] hover:border-[#4F8EF7]/30"
        )}
      >
        <School size={16} className={cn("transition-transform group-hover:scale-110", isOpen ? "text-white" : "text-[#4F8EF7]")} />
        <span className="max-w-[120px] truncate">{activePreset.shortName || "Select Identity"}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.5 }}>
          <ChevronDown size={14} className="opacity-30" />
        </motion.div>
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 8, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, y: 12, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.92, y: 8, filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="absolute top-full right-0 w-[340px] bg-[#000000]/98 backdrop-blur-[50px] border border-white/[0.08] rounded-[24px] shadow-premium p-3 z-[99999] origin-top-right select-none"
            onKeyDown={handleKeyDown}
          >
            {/* Glow border */}
            <div className="absolute inset-0 rounded-[24px] border-[0.5px] border-gradient-to-br from-[#4F8EF7]/30 via-transparent to-[#A855F7]/30 pointer-events-none" />

            {/* Search Bar */}
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
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
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-[16px] pl-9 pr-8 py-2.5 text-[12px] font-medium text-white placeholder:text-white/20 outline-none focus:border-[#4F8EF7]/40 focus:bg-[#4F8EF7]/5 focus-visible:ring-1 focus-visible:ring-[#4F8EF7]/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); setFocusedIndex(-1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Active Preset Banner */}
            <div className="mb-3 px-3 py-2.5 bg-[#4F8EF7]/5 border border-[#4F8EF7]/15 rounded-[14px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap size={14} className="text-[#4F8EF7]" />
                  <span className="text-[11px] font-black text-[#4F8EF7] tracking-tight">{activePreset.shortName}</span>
                </div>
                <EvalBadge model={activePreset.evaluationModel} />
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[9px] text-white/30 font-medium">{activePreset.gradingSystem}</span>
                {activePreset.sgpaToPercentage && (
                  <>
                    <span className="text-white/10">·</span>
                    <span className="text-[9px] text-white/20 font-mono">{activePreset.sgpaToPercentage}</span>
                  </>
                )}
              </div>
            </div>

            {/* Grouped Preset List */}
            <div
              ref={listRef}
              id="preset-list"
              role="listbox"
              aria-label="Available university presets"
              className="max-h-[340px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent overscroll-contain touch-pan-y"
            >
              {groups.map((group) => (
                <div key={group.label} role="group" aria-label={group.label}>
                  <div className="px-3 pt-3 pb-1 text-[9px] font-black uppercase tracking-[0.2em] text-white/15 flex items-center gap-2">
                    <Building2 size={10} />
                    {group.label}
                  </div>
                  {group.presets.map((uni) => {
                    const globalIdx = flatPresets.indexOf(uni);
                    const isActive = activePreset.id === uni.id;
                    const isFocused = focusedIndex === globalIdx;

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
                          "w-full flex items-center justify-between p-2.5 rounded-[14px] transition-all duration-200 group text-left outline-none focus:outline-none focus-visible:ring-1 focus-visible:ring-[#4F8EF7]/50",
                          isActive ? "bg-white/[0.04]" : "",
                          isFocused ? "bg-white/[0.06] ring-1 ring-[#4F8EF7]/30" : "hover:bg-white/[0.02]"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 transition-all",
                            isActive
                              ? "bg-[#4F8EF7] text-white shadow-[0_0_12px_rgba(79,142,247,0.3)]"
                              : "bg-white/5 text-white/30 group-hover:bg-white/10 group-hover:text-white/50"
                          )}>
                            {uni.shortName[0]}
                          </div>
                          <div className="min-w-0">
                            <div className={cn(
                              "text-[12px] font-bold tracking-tight truncate",
                              isActive ? "text-white" : "text-white/50 group-hover:text-white/80"
                            )}>
                              {uni.name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] text-white/20 font-medium">{uni.state}</span>
                              <span className="text-white/[0.06]">·</span>
                              <span className={cn(
                                "text-[9px] font-bold",
                                uni.evaluationModel === "relative" ? "text-amber-400/60" :
                                uni.evaluationModel === "hybrid" ? "text-blue-400/60" :
                                "text-emerald-400/60"
                              )}>
                                {uni.evaluationModel}
                              </span>
                            </div>
                          </div>
                        </div>
                        {isActive && (
                          <Check size={14} className="text-[#4F8EF7] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}

              {filteredPresets.length === 0 && (
                <div className="py-8 text-center" role="presentation">
                  <Search size={20} className="text-white/10 mx-auto mb-2" />
                  <p className="text-[11px] text-white/20 font-medium">No universities found</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-3 pt-2 border-t border-white/[0.04] flex items-center justify-between px-2">
              <span className="text-[9px] text-white/10 font-medium">{UNI_PRESETS.length} institutions</span>
              <div className="flex items-center gap-1 text-[9px] text-white/10">
                <Zap size={8} />
                <span className="font-medium">Adaptive Engine</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
