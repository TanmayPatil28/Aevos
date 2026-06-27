"use client";

import React, { useState } from "react";
import { Building2, ChevronDown, ChevronUp, ExternalLink, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface InternshipMatch {
  title: string;
  company: string;
  url: string;
  score: number;
  rationale: string;
  requiredSkills: string[];
  isHiddenGem?: boolean;
  compensation?: string;
  deadline?: string;
}

interface InternshipLedgerRowProps {
  match: InternshipMatch;
  isSelected?: boolean;
  onSelect?: (match: InternshipMatch) => void;
  isLast?: boolean;
}

export default function InternshipLedgerRow({ match, isSelected, onSelect, isLast }: InternshipLedgerRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusColor = match.isHiddenGem ? "text-[#ffd60a]" :
    match.score >= 80 ? "text-status-success" :
    match.score >= 50 ? "text-status-warning" : "text-status-critical";

  const bgColor = match.isHiddenGem ? "bg-[#ffd60a]/10 border-[#ffd60a]/30 drop-shadow-[0_0_15px_rgba(255,214,10,0.25)]" :
    match.score >= 80 ? "bg-[#34c759]/10 border-[#34c759]/30 drop-shadow-[0_0_15px_rgba(52,199,89,0.25)]" :
    match.score >= 50 ? "bg-[#ff9f0a]/10 border-[#ff9f0a]/30 drop-shadow-[0_0_15px_rgba(255,159,10,0.25)]" : "bg-[#ff3b30]/10 border-[#ff3b30]/30 drop-shadow-[0_0_15px_rgba(255,59,48,0.25)]";

  return (
    <div className={cn(
      "group flex flex-col transition-all duration-300 cursor-pointer relative overflow-hidden",
      !isLast && "border-b border-white/[0.05]",
      isSelected ? "bg-surface" : "bg-transparent hover:bg-surface/50"
    )}
    onClick={() => onSelect && onSelect(match)}>
      {/* Main Row Header */}
      <div 
        role="button"
        tabIndex={0}
        className="flex items-center justify-between gap-4 p-4 relative z-10 focus:outline-none"
      >
        {/* Left Side: Icon & Name */}
        <div className="flex items-center gap-4 flex-1 overflow-hidden">
          <div className={cn(
            "w-10 h-10 rounded-full flex flex-col items-center justify-center shrink-0 border",
            bgColor
          )}>
            <span className={cn(
              "text-[14px] font-bold",
              statusColor
            )}>{Math.round(match.score)}</span>
          </div>
          
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-2">

              <h4 className="text-[16px] font-medium text-foreground truncate">{match.title}</h4>
            </div>
            <div className="flex items-center text-[13px] text-foreground-muted truncate mt-0.5 gap-3">
              <span className="flex items-center gap-1.5">
                <Building2 size={14} />
                {match.company}
              </span>
              {match.compensation && (
                <span className="flex items-center gap-1.5 text-[#34c759]">
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  {match.compensation}
                </span>
              )}
              {match.deadline && (
                <span className="flex items-center gap-1.5 text-[#ff9f0a]">
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  Due: {match.deadline}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <Button 
            variant="icon"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              window.open(match.url, "_blank");
            }}
          >
            <ExternalLink size={14} className="text-foreground-muted" />
          </Button>
          
          <div className="text-foreground-muted group-hover:text-foreground transition-colors">
            <ChevronDown size={16} className="-rotate-90" />
          </div>
        </div>
      </div>
    </div>
  );
}
