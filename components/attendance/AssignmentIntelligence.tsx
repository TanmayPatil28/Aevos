"use client";

import React, { useState } from "react";
import { FileText, TrendingDown, Clock, AlertTriangle, Check, Plus } from "lucide-react";
import { AddAssignmentModal } from "./AddAssignmentModal";

export default function AssignmentIntelligence() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assignments, setAssignments] = useState([
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
  ]);

  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-between items-center relative z-10 w-full">
        <div className="flex items-center gap-3">
          <FileText className="text-[#10b981] drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] w-6 h-6" />
          <span className="font-bold text-white tracking-tight text-2xl">Assignment Intelligence</span>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-brand hover:bg-[#E5D51E] text-black px-4 py-2 rounded-full font-bold text-[13px] transition-colors shadow-[0_0_15px_rgba(205,255,0,0.3)] hover:shadow-[0_0_25px_rgba(205,255,0,0.5)] border-none"
        >
          <Plus className="w-4 h-4" />
          Add Assignment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="relative bg-[#1c1c1e] border border-white/[0.05] rounded-[24px] p-4 flex flex-col h-full overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.2)] transition-all duration-500 group hover:border-white/[0.15] hover:bg-white/[0.02] min-h-[130px]">
            
            <div className="w-full flex flex-col gap-2 relative z-10">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-base sm:text-lg font-bold text-white leading-snug line-clamp-2 pr-2">
                  {assignment.title}
                </h3>
                <span className={`text-[10px] font-mono uppercase font-bold tracking-widest flex items-center gap-1 shrink-0 ${
                  assignment.priority === 'CRITICAL' 
                    ? "text-rose-400" 
                    : assignment.priority === 'HIGH'
                    ? "text-amber-400"
                    : "text-brand"
                }`}>
                  {assignment.priority}
                </span>
              </div>
              <p className="text-[10px] font-mono tracking-widest uppercase text-white/40 font-semibold">{assignment.subject}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/[0.04] relative z-10 mt-auto transition-opacity duration-300 ease-out group-hover:opacity-0">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-widest text-white/30 font-semibold mb-1">Due Date</span>
                <span className="text-xs font-mono font-medium text-white/60 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> {assignment.dueDate}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[9px] uppercase tracking-widest text-white/30 font-semibold mb-1">Impact</span>
                <span className={`text-xs font-mono font-medium flex items-center gap-1.5 ${
                  !assignment.impact || assignment.impact.toLowerCase() === 'none' || assignment.impact === '0'
                    ? 'text-white/40'
                    : 'text-rose-400/80'
                }`}>
                  {(!assignment.impact || assignment.impact.toLowerCase() === 'none' || assignment.impact === '0') ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  {assignment.impact || 'None'}
                </span>
              </div>
            </div>

            {/* Floating Tooltip Quick Actions */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-5 translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out z-30 flex items-center justify-center gap-6 px-6 py-3 bg-[#1a1a1a] shadow-xl border border-white/10 rounded-full pointer-events-none group-hover:pointer-events-auto whitespace-nowrap">
              <button 
                onClick={() => setAssignments(prev => prev.filter(a => a.id !== assignment.id))}
                className="flex items-center justify-center gap-1.5 text-brand text-[13px] font-bold hover:brightness-125 transition-all"
              >
                <Check className="w-3.5 h-3.5" /> Mark Done
              </button>
            </div>
          </div>
        ))}
      </div>

      <AddAssignmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={(newAssignment) => setAssignments(prev => [...prev, newAssignment])} 
      />
    </div>
  );
}
