import { useState, useEffect } from "react";
import { History, TrendingUp, Loader2 } from "lucide-react";
import { CourseState, SemesterHistoryEntry } from "@/stores/usmStore";
import { BacklogEngine } from "@/lib/backlog-intelligence/engine";

export default function TimeTravelSimulatorWidget({ 
  course, 
  courses, 
  history,
  currentCgpa,
  targetGrade,
  setTargetGrade
}: { 
  course: CourseState;
  courses: CourseState[];
  history: SemesterHistoryEntry[];
  currentCgpa: number;
  targetGrade: string;
  setTargetGrade: (grade: string) => void;
}) {
  const displayedCgpa = BacklogEngine.calculateTimeTravelCGPA(course, targetGrade, history, courses);
  const boost = (displayedCgpa - currentCgpa).toFixed(3);

  const gradeOptions = ["O", "A+", "A", "B+", "B", "C", "P"];

  const handleGradeSelect = (g: string) => {
    if (g === targetGrade) return;
    setTargetGrade(g);
  };

  return (
    <div className="p-6 rounded-[24px] bg-surface-raised border border-white/[0.04] shadow-none flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-[17px] font-semibold text-white flex items-center gap-2 tracking-tight">
            <History className="text-brand" size={20} /> Time-Travel Simulator
          </h3>
          <p className="text-[15px] text-[#8E8E93] mt-1 tracking-tight">Retroactive Injection: {course.code}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between space-y-6">
        <div>
          <label className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-wide mb-2 block ml-1">Target Grade</label>
          <div className="flex bg-surface border border-white/[0.04] p-1 rounded-2xl overflow-x-auto no-scrollbar relative">
            {gradeOptions.map(g => (
              <button
                key={g}
                onClick={() => handleGradeSelect(g)}
                disabled={false}
                className={`flex-1 min-w-[40px] py-2 rounded-xl text-[15px] font-semibold transition-all ${
                  targetGrade === g 
                  ? "bg-white text-black shadow-none" 
                  : "text-[#8E8E93] hover:text-white"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-surface border border-white/[0.04]">
            <div className="text-[13px] text-[#8E8E93] font-semibold uppercase tracking-wide mb-1">Current</div>
            <div className="text-[22px] font-bold text-white font-mono tracking-tight">{currentCgpa > 0 ? currentCgpa.toFixed(2) : "0.00"}</div>
          </div>
          <div className="p-4 rounded-2xl bg-surface border border-white/[0.04] relative overflow-hidden">
            <div className="text-[13px] text-[#8E8E93] font-semibold uppercase tracking-wide mb-1">Simulated</div>
            
            <div className="text-[22px] font-bold text-white font-mono tracking-tight flex items-center gap-2 h-[33px]">
              {displayedCgpa?.toFixed(2) || "0.00"}
              <span className="text-[13px] font-bold text-status-success flex items-center gap-0.5">
                <TrendingUp size={14} strokeWidth={3} /> +{boost}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
