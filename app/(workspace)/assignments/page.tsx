"use client";

import React from "react";
import AssignmentIntelligence from "@/components/attendance/AssignmentIntelligence";

export default function AssignmentsPage() {
  return (
    <div className="h-screen w-full flex flex-col relative bg-background font-sans overflow-hidden">
      
      {/* Background Shader Placeholder */}
      <div className="absolute inset-0 z-[-1] bg-background" />

      {/* BEGIN: Top Navigation Bar */}
      <header className="h-14 border-b border-white/5 bg-surface/90 backdrop-blur flex items-center px-4 justify-between shrink-0 z-10 glass-panel">
        <div className="flex items-center text-xs tracking-wider text-foreground-muted font-mono uppercase space-x-2">
          <span>Workspace</span>
          <span className="text-white/20">/</span>
          <span className="text-foreground font-medium">Assignments</span>
          <span className="text-white/20">/</span>
          <span>Task Board</span>
        </div>
        
        <div className="flex-1 max-w-2xl mx-8 relative hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input 
            className="block w-full pl-10 pr-12 py-1.5 border border-white/10 rounded-md leading-5 bg-surface-overlay/50 text-sm text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:bg-surface-overlay focus:border-brand/50 focus:ring-1 focus:ring-brand/50 transition-colors" 
            placeholder="Search assignments or type 'add task'..." 
            type="text"
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
            <kbd className="inline-flex items-center border border-white/10 rounded px-1.5 text-xs font-mono text-foreground-muted bg-surface-raised">⌘K</kbd>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 bg-surface-overlay px-3 py-1.5 rounded-full border border-white/5 text-sm hover:bg-surface-raised transition-colors">
            <div className="w-2 h-2 rounded-full bg-brand"></div>
            <span>Auto-Prioritize</span>
          </button>
        </div>
      </header>

      {/* BEGIN: Telemetry Strip */}
      <div className="h-8 border-b border-white/5 bg-surface-raised/80 flex items-center px-4 space-x-4 md:space-x-6 text-[10px] md:text-xs font-mono text-foreground-muted shrink-0 z-10 glass-panel overflow-x-auto whitespace-nowrap scrollbar-hide">
        <div className="flex items-center space-x-2">
          <span className="uppercase">Total Tasks:</span>
          <span className="text-foreground font-medium">4 Active</span>
        </div>
        <div className="w-px h-4 bg-white/10"></div>
        <div className="flex items-center space-x-2">
          <span className="uppercase">Critical Risk:</span>
          <span className="text-rose-400 font-medium">1 Assignment</span>
        </div>
        <div className="w-px h-4 bg-white/10"></div>
        <div className="flex items-center space-x-2">
          <span className="uppercase">Impact:</span>
          <span className="text-brand font-medium">0.18 SGPA Risk</span>
        </div>
      </div>

      {/* BEGIN: Main Workspace Area */}
      <main className="flex-1 flex overflow-hidden z-10">
        <AssignmentIntelligence />
      </main>
    </div>
  );
}
