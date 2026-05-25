"use client";

import { useDomainStore, OSTerm } from "@/stores/os/domainStore";
import CourseDataGrid from "./CourseDataGrid";

export default function TermSection({ term }: { term: OSTerm }) {
  const { courses } = useDomainStore();
  
  // Derived state: Get courses for this term
  const termCourses = courses.filter(c => c.termId === term.id);

  // Derived state: SGPA calculation
  const totalCredits = termCourses.reduce((acc, c) => acc + (c.credits || 0), 0);
  const totalPoints = termCourses.reduce((acc, c) => acc + ((c.credits || 0) * (c.gradePoints || 0)), 0);
  const sgpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Term Header */}
      <div className="flex items-end justify-between px-2">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-slate-100">{term.name}</h3>
          <span className={`
            px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
            ${term.status === "ACTIVE" ? "bg-indigo-500/20 text-indigo-400" : 
              term.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-400" : 
              "bg-slate-700/50 text-slate-400"}
          `}>
            {term.status}
          </span>
        </div>
        
        <div className="flex items-baseline gap-4 text-sm">
          <div className="text-slate-400">
            Credits: <span className="text-slate-200 font-medium ml-1">{totalCredits}</span>
          </div>
          <div className="text-slate-400">
            SGPA: <span className="text-white font-mono font-bold ml-1 text-lg">{sgpa.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <CourseDataGrid termId={term.id} initialCourses={termCourses} />
    </div>
  );
}
