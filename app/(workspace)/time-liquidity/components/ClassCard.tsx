"use client";

import React from "react";
import { GlintCard } from "./GlintCard";
import { Tooltip } from "@/components/ui/tooltip";

interface ClassCardProps {
  courseName?: string;
  classType: "LECTURE" | "PRACTICAL" | "LAB" | "TUTORIAL";
  isSafeSkip?: boolean;
  startTime: string;
  endTime: string;
  room?: string;
  batch?: string;
  isDimmed?: boolean;
}

export function ClassCard({
  courseName,
  classType,
  isSafeSkip,
  startTime,
  endTime,
  room,
  batch,
  isDimmed
}: ClassCardProps) {
  const isPractical = classType === 'PRACTICAL' || classType === 'LAB';
  const isTutorial = classType === 'TUTORIAL';

  // Apply Aevos classes
  let tintClass = "aevos-tint-lecture";
  let dotColor = "bg-[var(--aevos-status-info)]";
  
  if (isSafeSkip) {
    tintClass = "aevos-tint-safeskip";
    dotColor = "bg-[var(--aevos-primary)]";
  } else if (isPractical) {
    tintClass = "aevos-tint-lab";
    dotColor = "bg-[var(--aevos-status-warning)]";
  } else if (isTutorial) {
    tintClass = "aevos-tint-tutorial";
    dotColor = "bg-[var(--aevos-status-success)]";
  }

  const interactionStyles = isDimmed
    ? "opacity-30 grayscale pointer-events-none scale-[0.98]"
    : "hover:bg-[var(--aevos-surface-overlay)] cursor-pointer";
    
  const displayName = courseName || classType;

  const content = (
    <GlintCard 
      className={`w-[94%] mx-auto h-[100px] p-3.5 transition-colors duration-300 flex flex-col justify-between ${tintClass} ${interactionStyles}`}
    >
      {/* Top Left Indicator Dot */}
      <div className={`absolute top-3 left-3 w-1.5 h-1.5 rounded-full ${dotColor}`} />

      <div className="relative h-full flex flex-col justify-between pl-3">
        <div className="flex justify-between items-start gap-1">
          <div
            className="font-bold text-[12px] leading-snug tracking-wide line-clamp-2 text-[var(--aevos-text-primary)]"
            title={displayName}
          >
            {displayName}
          </div>
          {isSafeSkip && (
            <div className="shrink-0 bg-[var(--aevos-surface)] text-[var(--aevos-primary)] text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-[0_0_8px_rgba(191,227,83,0.2)] flex items-center gap-1">
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg> Skip
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="text-[10px] font-mono tracking-tight font-medium text-[var(--aevos-text-secondary)] flex items-center gap-1">
            <svg className="w-3 h-3 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {startTime} - {endTime}
          </div>

          {(room || (batch && batch !== "ALL")) && (
            <div className="flex items-center gap-1.5 text-[var(--aevos-text-secondary)]">
              {room && (
                <div className="font-mono text-[10px] font-medium truncate flex items-center gap-0.5">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {room}
                </div>
              )}
              {batch && batch !== "ALL" && (
                <div className="px-1.5 py-0.5 rounded-[4px] bg-white/5 text-[9px] font-bold uppercase tracking-wider leading-none border border-white/5">
                  {batch}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </GlintCard>
  );

  if (isSafeSkip) {
    return (
      <Tooltip className="w-full !block" triggerClassName="w-full !block" content={<div className="w-48 text-center text-[12px] font-sans">AI recommends missing this class based on your current attendance standing.</div>} position="top">
        {content}
      </Tooltip>
    );
  }

  return content;
}
