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
import { MagneticWrapper } from "@/components/ui/MagneticWrapper";
import { CustomSelect } from "@/components/ui/CustomSelect";

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
      <div className="bg-[#1c1c1e] border border-white/[0.05] text-center py-12 rounded-[2rem] shadow-none relative overflow-hidden group">
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
        <div className="bg-white/[0.02] border border-white/5 backdrop-blur-md p-6 rounded-[2rem] shadow-none space-y-8 relative overflow-hidden group">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#10b981]/10 rounded-full blur-3xl pointer-events-none transition-colors duration-500" />
          
          <div className="relative z-10">
            <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#10b981] drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              AI Bunk Scheduler
            </h3>
            <p className="text-xs text-white/40 mt-1">
              Select a course to see smart bunk dates that optimize your weekends.
            </p>
          </div>

          {/* Select Course dropdown */}
          <div className="space-y-2 relative z-10">
            <label className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Select Course</label>
            <CustomSelect
              value={selectedCourseId}
              onChange={(val) => handleCourseChange(val)}
              options={courses.map((c) => ({ label: `${c.name} (${c.code})`, value: c.id }))}
              buttonClassName="w-full flex items-center justify-between gap-2 bg-white/[0.04] border border-white/10 hover:bg-white/[0.06] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#10b981]/50 transition-colors cursor-pointer"
              dropdownClassName="left-0 w-full min-w-[250px]"
            />
          </div>

          <div className="h-[1px] bg-white/[0.08] relative z-10" />

          {/* Smart Bunks List */}
          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Recommended Bunks</span>
              <span className="text-[9px] text-[#10b981] font-mono bg-[#10b981]/10 px-2 py-0.5 rounded-full border border-[#10b981]/20">{projection.smartBunks.length} Scheduled</span>
            </div>
            
            {projection.smartBunks.length > 0 ? (
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {projection.smartBunks.map((date, idx) => (
                  <div key={idx} className="flex items-center justify-between hover:bg-white/[0.04] p-2 rounded-lg transition-colors group cursor-default">
                    <div className="flex items-center gap-3">
                      <div className="relative w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      <div>
                        <div className="text-xs font-bold text-white/90 group-hover:text-white transition-colors">{new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}</div>
                        <div className="text-[10px] text-white/40">{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                      </div>
                    </div>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400/50 group-hover:text-emerald-400 transition-colors" />
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

          {/* Minimal Inline Semester Projection */}
          <div className="flex justify-between items-center text-white/50 text-[11px] relative z-10 pt-2 border-t border-white/[0.04]">
            <span className="uppercase font-bold tracking-wider">Classes Left in Sem</span>
            <span className="font-mono font-bold text-white">
              {projection.projectedPercentage > 0 ? Math.max(0, Math.round((projection.projectedAttended / (projection.projectedPercentage / 100)) - (conducted || 0))) : 0}
            </span>
          </div>

        </div>
      </div>

      {/* Math Projection Visualization & Outcome (Right Panel) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white/[0.02] border border-white/5 backdrop-blur-md p-6 rounded-[2rem] shadow-none space-y-8 relative overflow-hidden h-full">
          
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
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col justify-between items-center text-center space-y-6">
              <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">End of Semester</span>
              
              <div className="relative flex items-center justify-center">
                {/* SVG circular track rings */}
                <svg className="w-40 h-40 transform -rotate-90 drop-shadow-[0_0_15px_currentColor] transition-all duration-700 ease-in-out" style={{ color: projectedStatus.text.replace('text-', '') }}>
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
              <div className={`p-5 rounded-2xl border ${projectedStatus.bg} ${projectedStatus.border} ${projectedStatus.glow} text-center space-y-1.5 transition-all duration-500 relative overflow-hidden`}>
                <div className={`absolute inset-0 bg-gradient-to-t from-transparent to-white/[0.02] ${projectedStatus.text === 'text-rose-400' ? 'animate-pulse' : ''}`} />
                <div className="relative z-10">
                  <span className="text-[10px] uppercase font-bold tracking-widest block text-white/50">Projected Health</span>
                  <span className={`text-xl font-bold uppercase tracking-wide block drop-shadow-md ${projectedStatus.text}`}>
                    {projection.projectedPercentage >= minAttendance ? "SAFE STANDING" : "DETENTION RISK"}
                  </span>
                  <span className="text-[10px] text-white/40 font-mono block mt-1">
                    University baseline: <strong className="text-white/70">{minAttendance}%</strong>
                  </span>
                </div>
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

          {/* Mathematical Explainability Note (Terminal Style) */}
          <div className="bg-[#0D1117] border border-white/[0.05] rounded-xl relative z-10 mt-auto overflow-hidden shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
            <div className="flex items-center px-3 py-2 bg-white/[0.02] border-b border-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="ml-3 text-[10px] text-white/30 font-mono font-bold tracking-wider">math_projection.js</span>
            </div>
            <div className="p-4 flex items-start gap-3">
              <div className="text-[10px] text-white/20 font-mono text-right select-none flex flex-col leading-relaxed">
                <span>1</span><span>2</span><span>3</span>
              </div>
              <div className="space-y-1.5 text-[11px] font-mono text-[#a5d6ff] leading-relaxed">
                <p>
                  <span className="text-[#ff7b72]">const</span> projection <span className="text-[#ff7b72]">=</span> (Attended <span className="text-[#ff7b72]">+</span> SimulatedAttended) <span className="text-[#ff7b72]">/</span><br />
                  <span className="pl-4">(Conducted <span className="text-[#ff7b72]">+</span> SimulatedBunks <span className="text-[#ff7b72]">+</span> SimulatedAttended)</span> <span className="text-[#ff7b72]">*</span> <span className="text-[#79c0ff]">100</span>;
                </p>
                <p className="text-white/40 italic">
                  // Safe bunks and recovery limits adjust continuously using discrete floor/ceil functions.
                </p>
              </div>
            </div>
          </div>

          {/* Sync Button */}
          <div className="relative z-10 pt-4 flex justify-end mt-auto">
            <MagneticWrapper strength={0.4}>
              <button 
                onClick={handleSyncToCloud}
                disabled={isSyncing}
                className="flex items-center gap-2 px-6 py-3 bg-[#10b981]/10 hover:bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30 rounded-xl font-bold text-xs transition-all w-full sm:w-auto justify-center disabled:opacity-50"
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
            </MagneticWrapper>
          </div>

        </div>
      </div>

    </div>
  );
}
