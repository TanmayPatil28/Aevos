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
    },
    {
      id: "a3",
      title: "OS Assignment 2",
      subject: "OS Theory",
      dueDate: "Next Week",
      impact: "-2 Internal Marks",
      priority: "MEDIUM",
    }
  ];

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center gap-3 relative z-10">
        <FileText className="text-[#10b981] drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] w-6 h-6" />
        <span className="font-bold text-white tracking-tight text-2xl">Assignment Intelligence</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockAssignments.map((assignment) => (
          <div key={assignment.id} className="relative bg-[#1c1c1e] border border-white/[0.05] rounded-[24px] p-6 flex flex-col gap-6 shadow-[0_0_20px_rgba(0,0,0,0.2)] transition-all duration-500 group hover:border-white/[0.15] hover:bg-white/[0.02] overflow-hidden min-h-[180px]">

            <div className="flex justify-between items-start gap-3 relative z-10">
              <div className="space-y-2">
                <p className="text-[10px] font-mono tracking-widest uppercase text-white/40 font-semibold">{assignment.subject}</p>
                <h3 className="font-bold text-white/95 text-lg group-hover:text-white transition-colors leading-snug pr-2">{assignment.title}</h3>
              </div>
              <span className={`text-[9px] px-2 py-1 rounded-full font-mono uppercase font-bold border flex items-center gap-1 shrink-0 ${
                assignment.priority === 'CRITICAL' 
                  ? "text-rose-400 bg-rose-500/10 border-rose-500/30" 
                  : assignment.priority === 'HIGH'
                  ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
                  : "text-blue-400 bg-blue-500/10 border-blue-500/30"
              }`}>
                {assignment.priority === 'CRITICAL' && <AlertTriangle className="w-3 h-3" />}
                {assignment.priority}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.04] pt-4 relative z-10 mt-auto">
              <div className="flex items-center gap-1.5 text-xs font-medium text-white/50">
                <Clock className="w-4 h-4" />
                <span>Due: <strong className="text-white/80">{assignment.dueDate}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold font-mono text-rose-400 bg-rose-500/10 px-2.5 py-1.5 rounded-md border border-rose-500/20">
                <TrendingDown className="w-4 h-4" />
                <span>{assignment.impact}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
