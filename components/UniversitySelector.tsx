"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { School, ChevronDown, Check, Search, X, Zap, GraduationCap, MapPin } from "lucide-react";
import { useUniversity, UNI_PRESETS } from "@/components/providers/UniversityProvider";
import { getPresetsByState, searchPresets, type UniversityPreset } from "@/lib/presets";
import { cn } from "@/lib/cn";
import Card from "@/components/ui/Card";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";

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
        "flex items-center gap-2.5 px-4 py-2.5 rounded-full backdrop-blur-xl border transition-all duration-500 text-[13px] font-bold group outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]",
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDropdownOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isDropdownOpen]);

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
    if (!isDropdownOpen) return;
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
        setIsDropdownOpen(false);
        onClose();
      }
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
    }
  }, [focusedIndex, flatPresets, setSelectedUniId, onClose, isDropdownOpen]);

  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const el = listRef.current.querySelector(`[data-index="${focusedIndex}"]`);
      if (el) el.scrollIntoView({ block: "nearest" });
    }
  }, [focusedIndex]);

  const handleSelect = (id: string) => {
    setSelectedUniId(id);
    setIsDropdownOpen(false);
  };

  return (
    <div className="w-full flex flex-col gap-6 relative" onKeyDown={handleKeyDown}>
      <div className="flex items-center justify-between px-2">
        <h2 className="text-[16px] font-medium text-[#F5F5F7] tracking-tight">Academic Profile</h2>
        <span className="text-[13px] text-[#86868B] font-medium tracking-wide">Institution Config</span>
      </div>

      {/* Popover Trigger and Dropdown Container */}
      <div className="px-2 relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full text-left outline-none group"
        >
          <Card padding="md" className={cn(
            "flex items-center justify-between relative z-10 transition-all duration-300 cursor-pointer border-[0.8px]",
            isDropdownOpen ? "border-white/30 bg-white/5" : "border-[rgba(255,255,255,0.08)] group-hover:border-white/20 group-hover:bg-white/[0.02]"
          )}>
            <div className="flex items-center gap-4">
              <Avatar size="md" name={activePreset.name} />
              <div className="flex flex-col gap-0.5">
                <div className="text-[16px] font-semibold text-[#F5F5F7] tracking-tight">{activePreset.shortName}</div>
                <div className="text-[14px] text-[#86868B] font-medium">{activePreset.name}</div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <EvalBadge model={activePreset.evaluationModel} />
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-[#86868B] font-medium">{activePreset.gradingSystem}</span>
                <ChevronDown size={16} className={cn("text-[#86868B] transition-transform duration-300", isDropdownOpen && "rotate-180")} />
              </div>
            </div>
          </Card>
        </button>

        {/* Floating Popover Container */}
        <AnimatePresence>
          {isDropdownOpen && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100]" 
                onClick={() => setIsDropdownOpen(false)} 
              />
              
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="absolute left-2 right-2 top-[calc(100%+8px)] z-[110]"
              >
                <Card className="overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.6)] border-[0.8px] border-[rgba(255,255,255,0.15)] bg-[#1c1c1e] max-h-[400px] flex flex-col">
                  
                  {/* Search Header */}
                  <div className="p-3 border-b-[0.8px] border-[rgba(255,255,255,0.08)] bg-[#1c1c1e]/90 backdrop-blur-xl sticky top-0 z-20">
                    <Input
                      ref={searchInputRef as any}
                      variant="search"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setFocusedIndex(0);
                      }}
                      placeholder="Search institutions..."
                      className="w-full border-transparent focus:border-white/20 bg-[#2c2c2e]"
                    />
                  </div>
                  
                  {/* Ledger List */}
                  <div className="overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] p-2 flex-1" ref={listRef}>
                    {groups.map((group) => (
                      <div key={group.label} className="mb-4 last:mb-0">
                        <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[#86868B] mb-1 flex items-center gap-2">
                          <MapPin size={10} className="text-white/20" />
                          {group.label}
                        </div>
                        <div className="flex flex-col bg-[#1c1c1e]">
                          {group.presets.map((uni, i) => {
                            const globalIdx = flatPresets.findIndex(p => p.id === uni.id);
                            const isFocused = globalIdx === focusedIndex;
                            const isActive = activePreset.id === uni.id;
                            const isLast = i === group.presets.length - 1;

                            return (
                              <button
                                key={uni.id}
                                data-index={globalIdx}
                                onClick={() => handleSelect(uni.id)}
                                className={cn(
                                  "w-full flex items-center justify-between px-4 py-3 transition-all duration-200 group/item text-left outline-none border-b-[0.8px] border-[rgba(255,255,255,0.04)]",
                                  isLast && "border-b-0",
                                  isActive ? "bg-white/[0.06]" : (isFocused ? "bg-white/[0.04]" : "hover:bg-white/[0.04] bg-transparent")
                                )}
                              >
                                <div className="flex items-center gap-4 min-w-0">
                                  <Avatar size="sm" name={uni.name} />
                                  <div className="min-w-0 flex flex-col gap-0.5">
                                    <span className={cn(
                                      "text-[14px] font-semibold tracking-tight truncate transition-colors duration-200",
                                      isActive ? "text-[#F5F5F7]" : "text-[#86868B] group-hover/item:text-[#F5F5F7]"
                                    )}>
                                      {uni.name}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[12px] text-[#86868B] font-medium">{uni.state}</span>
                                      <span className="text-white/10">·</span>
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B]">
                                        {uni.gradingSystem}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <EvalBadge model={uni.evaluationModel} />
                                  {isActive && (
                                    <Check size={16} className="text-[#F5F5F7] shrink-0" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {filteredPresets.length === 0 && (
                      <div className="py-10 text-center" role="presentation">
                        <Search size={24} className="text-white/20 mx-auto mb-3" />
                        <p className="text-[14px] text-[#86868B] font-medium tracking-wide">No institutions found</p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            </>
          )}
        </AnimatePresence>
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
