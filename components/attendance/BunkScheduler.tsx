"use client";

import React, { useState } from "react";
import { 
  Calendar, 
  UserX, 
  UserCheck, 
  AlertCircle, 
  ArrowRight,
  Info,
  CloudUpload,
  CheckCircle2,
  Sparkles,
  Bot
} from "lucide-react";
import { useUSMStore } from "@/stores/usmStore";
import { getStudentDayIndex } from "@/lib/dateUtils";

import { AttendanceForecastingEngine } from "@/lib/academic-intelligence/engines/simulation/AttendanceForecastingEngine";

interface CourseData {
  id: string;
  name: string;
  code: string;
  conducted: number;
  bunked: number;
  attended: number;
  percentage: number;
  minAttendance: number;
}

interface BunkSchedulerProps {
  courses: CourseData[];
}

export default function BunkScheduler({ courses }: BunkSchedulerProps) {
  const storeState = useUSMStore();
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || "");
  const [isSyncing, setIsSyncing] = useState(false);

  const activeCourse = courses.find((c) => c.id === selectedCourseId);

  if (!activeCourse) {
    return (
      <div className="bg-[#1D1D1F] border border-white/[0.05] text-center py-12 rounded-[2rem] shadow-none relative overflow-hidden group">
        <AlertCircle className="w-8 h-8 text-white/20 mx-auto mb-3" />
        <h3 className="text-white font-bold text-lg">No Active Courses Found</h3>
        <p className="text-sm text-white/40 mt-1">Please register courses in the planner or import an academic JSON first.</p>
      </div>
    );
  }

  const { conducted, percentage, minAttendance } = activeCourse;
  const storeCourse = storeState.courses.find(c => c.id === selectedCourseId);
  
  // Clean the percentage in case it's NaN
  const safePercentage = isNaN(percentage) ? 0 : percentage;
  
  // Calculate AI Projection
  let projection = {
    projectedPercentage: safePercentage,
    safeBunksRemaining: 0,
    recoveryRequired: 0,
    projectedAttended: 0,
    projectedConducted: 0,
    smartBunks: [] as string[]
  };

  if (storeCourse && storeState.academic.semesterStartDate && storeState.academic.semesterEndDate) {
    projection = AttendanceForecastingEngine.generateSmartBunkSchedule(
      storeCourse,
      storeState.timetable,
      storeState.holidays,
      new Date(storeState.academic.semesterStartDate),
      new Date(storeState.academic.semesterEndDate),
      minAttendance
    );
  }

  const getStatusColor = (percent: number, minLimit: number) => {
    if (percent < minLimit) return { text: "text-rose-400", border: "border-rose-500/30", bg: "bg-rose-500/10", glow: "shadow-[0_0_15px_rgba(244,63,94,0.15)]" };
    if (percent < minLimit + 5) return { text: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10", glow: "shadow-[0_0_15px_rgba(245,158,11,0.15)]" };
    return { text: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10", glow: "shadow-[0_0_15px_rgba(16,185,129,0.15)]" };
  };

  const currentStatus = getStatusColor(percentage, minAttendance);
  const projectedStatus = getStatusColor(projection.projectedPercentage, minAttendance);

  const handleCourseChange = (id: string) => {
    setSelectedCourseId(id);
  };

  const handleSyncToCloud = () => {
    setIsSyncing(true);
    storeState.queueSyncAction("SIMULATION_SAVE", { courseId: selectedCourseId, autoPilotUsed: true });
    setTimeout(() => {
      storeState.clearSyncActions();
      setIsSyncing(false);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Smart Bunk Recommendations (Left Panel) */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-[#1D1D1F] border border-white/[0.05] p-6 rounded-[2rem] shadow-none space-y-8 relative overflow-hidden group">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#4F8EF7]/10 rounded-full blur-3xl pointer-events-none transition-colors duration-500" />
          
          <div className="relative z-10">
            <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#4F8EF7] drop-shadow-[0_0_8px_rgba(79,142,247,0.5)]" />
              AI Bunk Scheduler
            </h3>
            <p className="text-xs text-white/40 mt-1">
              Select a course to see smart bunk dates that optimize your weekends.
            </p>
          </div>

          {/* Select Course dropdown */}
          <div className="space-y-2 relative z-10">
            <label className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Select Course</label>
            <select
              value={selectedCourseId}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#4F8EF7]/50 focus:bg-white/[0.08] transition-colors appearance-none cursor-pointer hover:bg-white/[0.06]"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#131C31] text-white">
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div className="h-[1px] bg-white/[0.08] relative z-10" />

          {/* Smart Bunks List */}
          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Recommended Bunks</span>
              <span className="text-[9px] text-[#4F8EF7] font-mono">{projection.smartBunks.length} Scheduled</span>
            </div>
            
            {projection.smartBunks.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {projection.smartBunks.map((date, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white/[0.03] border border-white/5 p-3 rounded-xl hover:bg-white/[0.06] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}</div>
                        <div className="text-[10px] text-white/40">{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400/80 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-md">Smart Bunk</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl text-center">
                <p className="text-xs text-white/40 leading-relaxed">
                  No safe bunks available. You need to attend upcoming classes to maintain {minAttendance}% compliance.
                </p>
              </div>
            )}
          </div>

          <div className="bg-white/[0.02] p-5 rounded-xl border border-white/5 space-y-3 text-xs relative z-10 mt-6">
            <span className="font-bold text-white block uppercase tracking-wider text-[10px] text-white/50 mb-4">Semester Projection</span>
            <div className="flex justify-between items-center text-white/70">
              <span>Classes Left in Sem:</span>
              <span className="font-mono font-bold text-white bg-white/5 px-2 py-1 rounded-md">
                {projection.projectedPercentage > 0 ? Math.max(0, Math.round((projection.projectedAttended / (projection.projectedPercentage / 100)) - (conducted || 0))) : 0}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Math Projection Visualization & Outcome (Right Panel) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-[#1D1D1F] border border-white/[0.05] p-6 rounded-[2rem] shadow-none space-y-8 relative overflow-hidden h-full">
          
          <div className="flex justify-between items-center relative z-10">
            <h3 className="text-base font-bold text-white tracking-wide">
              Final Semester Math Projection
            </h3>
            <button
              onClick={handleSyncToCloud}
              disabled={isSyncing}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                isSyncing 
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                  : "bg-white/[0.03] text-white/50 border border-white/10 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              {isSyncing ? (
                <><CheckCircle2 className="w-3.5 h-3.5" /> SAVED</>
              ) : (
                <><CloudUpload className="w-3.5 h-3.5" /> SYNC PROJECTION</>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            
            {/* Visual Gauge Comparison */}
            <div className="bg-[#222224] border border-white/5 rounded-2xl p-6 flex flex-col justify-between items-center text-center space-y-6">
              <span className="text-xs text-white/50 font-medium uppercase tracking-widest">End of Semester</span>
              
              <div className="relative flex items-center justify-center">
                {/* SVG circular track rings */}
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  {/* Current Ring */}
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 68}
                    strokeDashoffset={2 * Math.PI * 68 * (1 - safePercentage / 100)}
                    className={`transition-all duration-700 ease-in-out opacity-20 ${currentStatus.text}`}
                    strokeLinecap="round"
                  />
                  {/* Projected Ring */}
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 68}
                    strokeDashoffset={2 * Math.PI * 68 * (1 - projection.projectedPercentage / 100)}
                    className={`transition-all duration-700 ease-in-out ${projectedStatus.text}`}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Central Value Readout */}
                <div className="absolute inset-0 flex flex-col items-center justify-center drop-shadow-md">
                  <span className={`text-4xl font-bold font-mono tracking-tighter ${projectedStatus.text}`}>
                    {Math.round(projection.projectedPercentage)}%
                  </span>
                  <span className="text-[10px] text-white/40 uppercase font-mono tracking-widest mt-1">
                    Projected
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm font-mono bg-white/[0.03] px-4 py-2 rounded-xl border border-white/5">
                <span className="text-white/50 font-bold">{percentage}%</span>
                <ArrowRight className="w-4 h-4 text-white/30" />
                <span className={`font-bold ${projectedStatus.text}`}>{Math.round(projection.projectedPercentage)}%</span>
              </div>
            </div>

            {/* Logical Compliance Outcomes */}
            <div className="space-y-4">
              
              {/* Compliance status banner */}
              <div className={`p-5 rounded-2xl border ${projectedStatus.bg} ${projectedStatus.border} ${projectedStatus.glow} text-center space-y-1.5 transition-all duration-500`}>
                <span className="text-[10px] uppercase font-bold tracking-widest block text-white/50">Projected Health</span>
                <span className={`text-xl font-bold uppercase tracking-wide block ${projectedStatus.text}`}>
                  {projection.projectedPercentage >= minAttendance ? "SAFE STANDING" : "DETENTION RISK"}
                </span>
                <span className="text-[11px] text-white/40 font-mono block mt-1">
                  University baseline: <strong className="text-white/70">{minAttendance}%</strong>
                </span>
              </div>

              {/* Action items based on math */}
              <div className="space-y-3">
                <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 space-y-2 hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60 font-medium">Safe Bunks Remaining:</span>
                    <span className={`font-bold font-mono bg-white/5 px-2 py-1 rounded-md border border-white/5 ${projection.safeBunksRemaining > 0 ? "text-emerald-400" : "text-white/40"}`}>
                      {projection.safeBunksRemaining} Classes
                    </span>
                  </div>
                  <p className="text-[11px] text-white/40 leading-relaxed pt-1">
                    {projection.projectedPercentage >= minAttendance 
                      ? `You can afford to skip up to ${projection.safeBunksRemaining} upcoming classes before dropping below compliance.`
                      : "No safe bunks available. You are currently non-compliant."}
                  </p>
                </div>

                <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 space-y-2 hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60 font-medium">Recovery Classes Required:</span>
                    <span className={`font-bold font-mono bg-white/5 px-2 py-1 rounded-md border border-white/5 ${projection.recoveryRequired > 0 ? "text-rose-400 animate-pulse" : "text-emerald-400"}`}>
                      {projection.recoveryRequired} Classes
                    </span>
                  </div>
                  <p className="text-[11px] text-white/40 leading-relaxed pt-1">
                    {projection.recoveryRequired > 0
                      ? `To restore your attendance to a safe ${minAttendance}%, you must attend the next ${projection.recoveryRequired} consecutive classes.`
                      : "Currently in compliance. No immediate recovery block needed."}
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* Mathematical Explainability Note */}
          <div className="bg-[#4F8EF7]/5 border border-[#4F8EF7]/10 p-5 rounded-xl flex items-start gap-4 relative z-10 mt-auto">
            <Info className="w-5 h-5 text-[#4F8EF7] shrink-0 mt-0.5 opacity-80" />
            <div className="space-y-1.5 text-xs text-[#4F8EF7]/70">
              <span className="font-bold block text-[#4F8EF7] uppercase tracking-wider text-[10px]">Mathematical Explanation</span>
              <p className="leading-relaxed text-[11px] font-medium">
                The projection is calculated using: <code className="font-mono text-[#4F8EF7]/90 bg-[#4F8EF7]/10 px-1 py-0.5 rounded ml-1 mr-1">Projected% = (Attended + SimulatedAttended) / (Conducted + SimulatedBunks + SimulatedAttended) * 100</code>.
                Safe bunks and recovery limits adjust continuously using discrete floor/ceil functions.
              </p>
            </div>
          </div>

          {/* Sync Button */}
          <div className="relative z-10 pt-4 flex justify-end mt-auto">
            <button 
              onClick={handleSyncToCloud}
              disabled={isSyncing}
              className="flex items-center gap-2 px-6 py-3 bg-[#4F8EF7]/10 hover:bg-[#4F8EF7]/20 text-[#4F8EF7] border border-[#4F8EF7]/30 rounded-xl font-bold text-xs transition-all w-full sm:w-auto justify-center disabled:opacity-50"
            >
              {isSyncing ? (
                <>
                  <CheckCircle2 className="w-4 h-4 animate-pulse" />
                  SYNCING TO ACADEMIC RECORD...
                </>
              ) : (
                <>
                  <CloudUpload className="w-4 h-4" />
                  SYNC SIMULATION TO CLOUD
                </>
              )}
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
