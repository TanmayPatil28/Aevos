"use client";

import React from "react";
import { FileText, TrendingDown, Clock, AlertTriangle } from "lucide-react";

export default function AssignmentIntelligence() {
  // Mock data for upcoming critical assignments
  const mockAssignments = [
    {
      id: "a1",
      title: "DBMS Mini Project Phase 1",
      subject: "DBMS Lab",
      dueDate: "Tomorrow",
      impact: "-0.18 SGPA",
      priority: "CRITICAL",
    },
    {
      id: "a2",
      title: "CN Lab Manual Submission",
      subject: "CN Lab",
      dueDate: "In 3 Days",
      impact: "-4 Internal Marks",
      priority: "HIGH",
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 relative z-10">
        <FileText className="text-[#4F8EF7] w-5 h-5 drop-shadow-[0_0_8px_rgba(79,142,247,0.5)]" />
        <span className="font-bold text-white tracking-tight text-lg">Assignment Intelligence</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {mockAssignments.map((assignment) => (
          <div key={assignment.id} className="relative bg-black border border-white/[0.08] rounded-[1.5rem] p-5 flex flex-col gap-4 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] transition-all duration-500 group hover:border-white/[0.15] hover:bg-[#050505] overflow-hidden">
            
            {/* Ambient Glow */}
            <div className="absolute inset-0 pointer-events-none rounded-[1.5rem] overflow-hidden">
              <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                assignment.priority === 'CRITICAL' ? 'bg-rose-500/20' : 'bg-amber-500/20'
              }`} />
            </div>

            <div className="flex justify-between items-start gap-3 relative z-10">
              <div className="space-y-1">
                <h3 className="font-bold text-white/95 text-sm group-hover:text-white transition-colors">{assignment.title}</h3>
                <p className="text-[11px] font-mono tracking-widest uppercase text-white/40">{assignment.subject}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono uppercase font-bold border flex items-center gap-1 shrink-0 ${
                assignment.priority === 'CRITICAL' 
                  ? "text-rose-400 bg-rose-500/10 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.1)]" 
                  : "text-amber-400 bg-amber-500/10 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
              }`}>
                {assignment.priority === 'CRITICAL' && <AlertTriangle className="w-3 h-3" />}
                {assignment.priority}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.08] pt-4 relative z-10">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/50">
                <Clock className="w-3.5 h-3.5" />
                <span>Due: <strong className="text-white/80">{assignment.dueDate}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold font-mono text-rose-400 bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>{assignment.impact}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
