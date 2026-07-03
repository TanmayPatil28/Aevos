"use client";

import React, { useState } from "react";
import { FileText, TrendingDown, Clock, AlertTriangle, Check, Plus, SlidersHorizontal, Search } from "lucide-react";
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
      status: "URGENT"
    },
    {
      id: "a2",
      title: "CN Lab Manual Submission",
      subject: "CN Lab",
      dueDate: "In 3 Days",
      impact: "-4 Internal Marks",
      priority: "HIGH",
      status: "ACTIVE"
    },
    {
      id: "a3",
      title: "OS Assignment 2",
      subject: "OS Theory",
      dueDate: "Next Week",
      impact: "-2 Internal Marks",
      priority: "MEDIUM",
      status: "ACTIVE"
    },
    {
      id: "a4",
      title: "Blockchain Research Paper",
      subject: "Elective",
      dueDate: "TBD",
      impact: "None",
      priority: "LOW",
      status: "BLOCKED"
    }
  ]);

  const urgentTasks = assignments.filter(a => a.status === "URGENT");
  const activeTasks = assignments.filter(a => a.status === "ACTIVE");
  const blockedTasks = assignments.filter(a => a.status === "BLOCKED");

  const renderCard = (task: any) => (
    <div key={task.id} className="group bg-surface-overlay border border-white/5 p-4 rounded-xl shadow-sm hover:border-brand/30 transition-all cursor-pointer relative">
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setAssignments(prev => prev.filter(a => a.id !== task.id));
          }}
          className="w-6 h-6 rounded-full bg-surface-raised flex items-center justify-center hover:bg-emerald-500/20 hover:text-emerald-400 text-foreground-muted"
        >
          <Check size={12} />
        </button>
      </div>

      <div className="flex gap-2 items-center mb-3">
        {task.priority === "CRITICAL" && (
          <span className="px-2 py-0.5 rounded-sm bg-rose-500/20 text-rose-400 text-[10px] font-bold tracking-wider font-mono uppercase">
            Critical
          </span>
        )}
        {task.priority === "HIGH" && (
          <span className="px-2 py-0.5 rounded-sm bg-amber-500/20 text-amber-400 text-[10px] font-bold tracking-wider font-mono uppercase">
            High Priority
          </span>
        )}
        <span className="text-[10px] text-foreground-muted font-mono uppercase tracking-widest font-bold">
          {task.subject}
        </span>
      </div>

      <h3 className="text-foreground font-bold text-sm leading-tight mb-4 pr-6">
        {task.title}
      </h3>

      <div className="flex items-center justify-between text-xs font-mono border-t border-white/5 pt-3">
        <div className={`flex items-center gap-1.5 font-bold ${task.dueDate === "Tomorrow" ? 'text-rose-400' : 'text-foreground-muted'}`}>
          <Clock size={12} />
          {task.dueDate}
        </div>
        
        {task.impact !== "None" && (
          <div className="flex items-center gap-1.5 font-bold text-rose-400">
            <TrendingDown size={12} />
            {task.impact}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex w-full h-full">
      {/* LEFT PANEL - Task Commander */}
      <section className="w-[25%] min-w-[280px] max-w-sm border-r border-white/5 flex flex-col bg-surface/50 glass-panel relative hidden lg:flex">
        <div className="h-12 border-b border-white/5 flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center space-x-2 text-sm text-foreground-muted uppercase tracking-wider font-mono">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Task Commander</span>
          </div>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto space-y-6">
          <div className="space-y-2">
            <div className="text-xs font-mono text-foreground-muted uppercase tracking-widest font-bold mb-3">Filters</div>
            <button className="w-full text-left px-3 py-2 rounded-md bg-surface-raised border border-brand/30 text-brand text-sm font-medium transition-colors">
              All Active Tasks
            </button>
            <button className="w-full text-left px-3 py-2 rounded-md bg-transparent border border-transparent text-foreground-muted hover:bg-surface-raised hover:text-foreground text-sm font-medium transition-colors">
              Critical Only
            </button>
            <button className="w-full text-left px-3 py-2 rounded-md bg-transparent border border-transparent text-foreground-muted hover:bg-surface-raised hover:text-foreground text-sm font-medium transition-colors">
              Blocked / Waiting
            </button>
          </div>

          <div className="space-y-2 border-t border-white/5 pt-6">
            <div className="text-xs font-mono text-foreground-muted uppercase tracking-widest font-bold mb-3">Subjects</div>
            {Array.from(new Set(assignments.map(a => a.subject))).map(subj => (
              <div key={subj} className="flex items-center justify-between px-2 py-1">
                <span className="text-sm text-foreground">{subj}</span>
                <span className="text-xs font-mono text-foreground-muted">{assignments.filter(a => a.subject === subj).length}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-white/5 bg-surface/80 shrink-0">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-brand text-background font-bold py-2.5 rounded-md hover:bg-brand/90 transition-colors shadow-sm"
          >
            <Plus size={16} /> New Assignment
          </button>
        </div>
      </section>

      {/* RIGHT PANEL - Kanban Board */}
      <section className="flex-1 flex flex-col bg-background/80 glass-panel overflow-y-auto p-6 md:p-8">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="font-bold text-foreground text-xl tracking-tight mb-1">Kanban Protocol</h3>
            <p className="text-xs text-foreground-muted font-medium">Auto-sorted by Ruin Impact</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full items-start">
          
          {/* Column 1: Urgent */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 px-2 border-b border-rose-500/20 pb-2">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <h4 className="text-rose-400 text-[11px] font-bold uppercase tracking-wider font-mono">Urgent (T-48h)</h4>
              <span className="ml-auto text-rose-500/50 font-mono text-xs font-bold">{urgentTasks.length}</span>
            </div>
            <div className="flex flex-col gap-3">
              {urgentTasks.map(renderCard)}
              {urgentTasks.length === 0 && (
                <div className="border border-dashed border-white/5 rounded-xl p-6 text-center text-foreground-muted text-sm font-medium bg-white/[0.02]">
                  No urgent tasks
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Active */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 px-2 border-b border-blue-500/20 pb-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <h4 className="text-blue-400 text-[11px] font-bold uppercase tracking-wider font-mono">Active (This Week)</h4>
              <span className="ml-auto text-blue-500/50 font-mono text-xs font-bold">{activeTasks.length}</span>
            </div>
            <div className="flex flex-col gap-3">
              {activeTasks.map(renderCard)}
              {activeTasks.length === 0 && (
                <div className="border border-dashed border-white/5 rounded-xl p-6 text-center text-foreground-muted text-sm font-medium bg-white/[0.02]">
                  Inbox Zero
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Blocked */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 px-2 border-b border-white/10 pb-2">
              <div className="w-2 h-2 rounded-full bg-white/20" />
              <h4 className="text-foreground-muted text-[11px] font-bold uppercase tracking-wider font-mono">Blocked / Waiting</h4>
              <span className="ml-auto text-white/20 font-mono text-xs font-bold">{blockedTasks.length}</span>
            </div>
            <div className="flex flex-col gap-3">
              {blockedTasks.map(renderCard)}
              {blockedTasks.length === 0 && (
                <div className="border border-dashed border-white/5 rounded-xl p-6 text-center text-foreground-muted text-sm font-medium bg-white/[0.02]">
                  Clear
                </div>
              )}
            </div>
          </div>

        </div>

      </section>

      <AddAssignmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={(newAssignment) => setAssignments(prev => [...prev, { ...newAssignment, status: "ACTIVE" }])} 
      />
    </div>
  );
}
