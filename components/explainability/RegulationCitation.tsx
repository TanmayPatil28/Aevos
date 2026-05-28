"use client";

import React from "react";
import { ShieldCheck, BookOpen } from "lucide-react";
import { cn } from "@/lib/cn";

export interface RegulationCitationProps extends React.HTMLAttributes<HTMLDivElement> {
  regulationId: string;
  clause: string;
  circular?: string;
  confidenceScore?: number;
}

export default function RegulationCitation({
  regulationId,
  clause,
  circular,
  confidenceScore,
  className,
  ...props
}: RegulationCitationProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 space-y-3 text-xs md:text-sm font-medium",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[var(--color-primary)]" />
          <span className="font-black uppercase tracking-wider text-white bg-white/[0.06] px-2 py-0.5 rounded border border-white/[0.05]">
            {regulationId}
          </span>
        </div>
        {confidenceScore !== undefined && (
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
            <ShieldCheck className="h-3 w-3" />
            <span>Deterministic Verified ({confidenceScore}%)</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-white/60 font-medium">
          <span className="font-black text-white/40 uppercase tracking-wider mr-1 text-[10px]">Clause:</span>
          {clause}
        </p>
        {circular && (
          <p className="text-white/40 font-medium text-xs">
            <span className="font-black text-white/20 uppercase tracking-wider mr-1 text-[9px]">Ref:</span>
            {circular}
          </p>
        )}
      </div>
    </div>
  );
}
