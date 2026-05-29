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

export function calculateBunkImpact(
  attended: number,
  conducted: number,
  futureBunks: number,
  futureAttended: number,
  minAttendance: number
) {
  const projectedConducted = conducted + futureBunks + futureAttended;
  const projectedAttended = attended + futureAttended;
  const percentage = projectedConducted > 0 ? Math.round((projectedAttended / projectedConducted) * 100) : 0;
  
  // Calculate safe bunks
  let safeBunks = 0;
  let testConducted = projectedConducted;
  while (true) {
    testConducted++;
    if ((projectedAttended / testConducted) * 100 >= minAttendance) {
      safeBunks++;
    } else {
      break;
    }
  }

  // Calculate recovery required
  let recoveryRequired = 0;
  if (percentage < minAttendance) {
    let testAttended = projectedAttended;
    let testConducted = projectedConducted;
    while ((testAttended / testConducted) * 100 < minAttendance) {
      testAttended++;
      testConducted++;
      recoveryRequired++;
    }
  }

  return { percentage, safeBunks, recoveryRequired };
}

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
  const [futureBunks, setFutureBunks] = useState<number>(0);
  const [futureAttended, setFutureAttended] = useState<number>(0);

  // 14-day calendar state
  const [calendarDays, setCalendarDays] = useState<("ATTEND" | "BUNK" | "NONE")[]>(Array(14).fill("NONE"));
  const [isSyncing, setIsSyncing] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  const activeCourse = courses.find((c) => c.id === selectedCourseId);

  // If no course is available, render empty state
  if (!activeCourse) {
    return (
      <div className="bg-[#1D1D1F] border border-white/[0.05] text-center py-12 rounded-[2rem] shadow-none relative overflow-hidden group">
        <AlertCircle className="w-8 h-8 text-white/20 mx-auto mb-3" />
        <h3 className="text-white font-bold text-lg">No Active Courses Found</h3>
        <p className="text-sm text-white/40 mt-1">Please register courses in the planner or import an academic JSON first.</p>
      </div>
    );
  }

  // Current values
  const { conducted, bunked, attended, percentage, minAttendance } = activeCourse;

  // Calculate totals from sliders + calendar
  const calendarBunks = calendarDays.filter(d => d === "BUNK").length;
  const calendarAttended = calendarDays.filter(d => d === "ATTEND").length;

  const totalFutureBunks = futureBunks + calendarBunks;
  const totalFutureAttended = futureAttended + calendarAttended;

  // Calculate projected impact using our math engine
  const projection = calculateBunkImpact(
    attended,
    conducted,
    totalFutureBunks,
    totalFutureAttended,
    minAttendance
  );

  const getStatusColor = (percent: number, minLimit: number) => {
    if (percent < minLimit) return { text: "text-rose-400", border: "border-rose-500/30", bg: "bg-rose-500/10", glow: "shadow-[0_0_15px_rgba(244,63,94,0.15)]" };
    if (percent < minLimit + 5) return { text: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10", glow: "shadow-[0_0_15px_rgba(245,158,11,0.15)]" };
    return { text: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10", glow: "shadow-[0_0_15px_rgba(16,185,129,0.15)]" };
  };

  const currentStatus = getStatusColor(percentage, minAttendance);
  const projectedStatus = getStatusColor(projection.percentage, minAttendance);

  const handleCourseChange = (id: string) => {
    setSelectedCourseId(id);
    setFutureBunks(0);
    setFutureAttended(0);
    setCalendarDays(Array(14).fill("NONE"));
    setAiMessage(null);
  };

  const toggleCalendarDay = (index: number) => {
    setCalendarDays(prev => {
      const next = [...prev];
      if (next[index] === "NONE") next[index] = "ATTEND";
      else if (next[index] === "ATTEND") next[index] = "BUNK";
      else next[index] = "NONE";
      return next;
    });
  };

  const handleSyncToCloud = () => {
    setIsSyncing(true);
    storeState.queueSyncAction("SIMULATION_SAVE", { courseId: selectedCourseId, futureBunks: totalFutureBunks, futureAttended: totalFutureAttended });
    setTimeout(() => {
      storeState.clearSyncActions();
      setIsSyncing(false);
    }, 1500);
  };

  const handleRunAutoPilot = () => {
    const { timetable, courses, holidays } = storeState;
    const course = courses.find((c: any) => c.id === selectedCourseId);
    
    if (!timetable || Object.keys(timetable).length === 0) {
      setAiMessage("Error: Timetable not configured. Configure it above first.");
      return;
    }
    if (!course) return;

    const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
    let todayIdx = getStudentDayIndex();
    
    // Simulate future timeline
    let simTotal = course.attendanceTotal;
    let simBunked = course.attendanceBunked;
    let proposedBunks = 0;
    
    const nextDays = Array(14).fill("NONE");

    for (let i = 0; i < 14; i++) {
      const iterDate = new Date();
      iterDate.setDate(iterDate.getDate() + i);
      const iterDateStr = iterDate.toISOString().split('T')[0];

      // Skip holidays completely
      if (holidays && holidays.includes(iterDateStr)) {
        nextDays[i] = "HOLIDAY";
        continue;
      }

      const dayOfWeek = DAYS[(todayIdx + i) % 7];
      const classesOnDay = timetable[dayOfWeek] || [];
      // Find how many times this course occurs on this day (e.g. 2 lectures)
      const classCount = classesOnDay.filter((c: any) => c.courseId === selectedCourseId).length;
      
      if (classCount > 0) {
        // Test if we can bunk ALL instances on this day
        const testTotal = simTotal + classCount;
        const testBunked = simBunked + classCount;
        const testAttended = testTotal - testBunked;
        const testPercentage = testTotal === 0 ? 0 : (testAttended / testTotal) * 100;

        if (testPercentage >= minAttendance) {
          // We can safely bunk this day!
          simTotal = testTotal;
          simBunked = testBunked;
          proposedBunks += classCount;
          nextDays[i] = "BUNK";
        } else {
          // We must attend
          simTotal += classCount;
          nextDays[i] = "ATTEND";
        }
      }
    }

    if (proposedBunks > 0) {
      setCalendarDays(nextDays as any);
      setAiMessage(`AI Strategy: I've scheduled ${proposedBunks} strategic bunk(s) on days you have this class, while keeping you strictly above ${minAttendance}%.`);
    } else {
      setAiMessage(`AI Strategy: You cannot safely bunk this class in the next 14 days. Minimum ${minAttendance}% required.`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Simulation Controllers (Left Panel) */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-[#1D1D1F] border border-white/[0.05] p-6 rounded-[2rem] shadow-none space-y-8 relative overflow-hidden group">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#4F8EF7]/10 rounded-full blur-3xl pointer-events-none transition-colors duration-500" />
          
          <div className="relative z-10">
            <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#4F8EF7] drop-shadow-[0_0_8px_rgba(79,142,247,0.5)]" />
              Bunk Simulator Controls
            </h3>
            <p className="text-xs text-white/40 mt-1">
              Select a course and adjust sliders to project compliance.
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

          {/* Simulator Sliders */}
          <div className="space-y-8 relative z-10">
            
            {/* Future Bunks Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/70 font-medium flex items-center gap-1.5">
                  <UserX className="w-4 h-4 text-rose-400" />
                  Upcoming Classes to Bunk
                </span>
                <span className="font-bold text-rose-400 font-mono text-sm bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                  {futureBunks}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={futureBunks}
                onChange={(e) => setFutureBunks(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-rose-500 hover:bg-white/20 transition-all"
              />
              <div className="flex justify-between text-[10px] text-white/40 font-mono">
                <span>0 Classes</span>
                <span>25 Classes</span>
              </div>
            </div>

            {/* Future Attended Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/70 font-medium flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  Upcoming Classes to Attend
                </span>
                <span className="font-bold text-emerald-400 font-mono text-sm bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  {futureAttended}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={futureAttended}
                onChange={(e) => setFutureAttended(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:bg-white/20 transition-all"
              />
              <div className="flex justify-between text-[10px] text-white/40 font-mono">
                <span>0 Classes</span>
                <span>25 Classes</span>
              </div>
            </div>

          </div>

          {/* 14-Day Interactive Calendar Ribbon */}
          <div className="space-y-3 relative z-10 pt-4 border-t border-white/20">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">14-Day Calendar Timeline</span>
              <span className="text-[9px] text-white/30">Click to cycle: Attend → Bunk → Clear</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {calendarDays.map((status, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleCalendarDay(idx)}
                  className={`w-7 h-7 rounded-md text-[10px] font-bold font-mono flex items-center justify-center transition-all ${
                    status === "ATTEND" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]" :
                    status === "BUNK" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.2)]" :
                    "bg-white/[0.03] text-white/20 border border-white/5 hover:bg-white/[0.08]"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            {(calendarAttended > 0 || calendarBunks > 0) && (
              <div className="flex gap-4 text-[10px] font-mono text-white/40 pt-1">
                {calendarAttended > 0 && <span className="text-emerald-400">+{calendarAttended} Calendar Attended</span>}
                {calendarBunks > 0 && <span className="text-rose-400">+{calendarBunks} Calendar Bunked</span>}
              </div>
            )}
            
            {/* AI Auto-Pilot */}
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  {aiMessage ? (
                    <div className="flex items-start gap-2 bg-[#4F8EF7]/10 border border-[#4F8EF7]/20 p-2.5 rounded-xl">
                      <Bot className="w-4 h-4 text-[#4F8EF7] mt-0.5 shrink-0" />
                      <p className="text-[11px] text-[#4F8EF7]/90 leading-snug">{aiMessage}</p>
                    </div>
                  ) : (
                    <p className="text-[10px] text-white/30 max-w-xs">Let GradeFlow's AI automatically schedule strategic bunks based on your timetable.</p>
                  )}
                </div>
                <button
                  onClick={handleRunAutoPilot}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#A855F7]/20 to-[#4F8EF7]/20 border border-[#4F8EF7]/30 text-white rounded-xl hover:shadow-[0_0_15px_rgba(79,142,247,0.3)] transition-all shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#A855F7]" />
                  <span className="text-[10px] font-bold tracking-wider uppercase text-white/90">Run AI Auto-Pilot</span>
                </button>
              </div>
            </div>

          </div>

          <div className="bg-white/[0.02] p-5 rounded-xl border border-white/5 space-y-3 text-xs relative z-10">
            <span className="font-bold text-white block uppercase tracking-wider text-[10px] text-white/50 mb-4">Current Standing</span>
            <div className="flex justify-between items-center text-white/70">
              <span>Classes Conducted:</span>
              <span className="font-mono font-bold text-white bg-white/5 px-2 py-1 rounded-md">{conducted}</span>
            </div>
            <div className="flex justify-between items-center text-white/70">
              <span>Classes Attended:</span>
              <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">{attended}</span>
            </div>
            <div className="flex justify-between items-center text-white/70">
              <span>Classes Bunked:</span>
              <span className="font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded-md">{bunked}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Math Projection Visualization & Outcome (Right Panel) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-[#1D1D1F] border border-white/[0.05] p-6 rounded-[2rem] shadow-none space-y-8 relative overflow-hidden h-full">
          
          <h3 className="text-base font-bold text-white tracking-wide relative z-10">
            Simulated Math Outcome Projections
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            
            {/* Visual Gauge Comparison */}
            <div className="bg-[#222224] border border-white/5 rounded-2xl p-6 flex flex-col justify-between items-center text-center space-y-6">
              <span className="text-xs text-white/50 font-medium uppercase tracking-widest">Compliance Delta</span>
              
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
                    strokeDashoffset={2 * Math.PI * 68 * (1 - percentage / 100)}
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
                    strokeDashoffset={2 * Math.PI * 68 * (1 - projection.percentage / 100)}
                    className={`transition-all duration-700 ease-in-out ${projectedStatus.text}`}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Central Value Readout */}
                <div className="absolute inset-0 flex flex-col items-center justify-center drop-shadow-md">
                  <span className={`text-4xl font-bold font-mono tracking-tighter ${projectedStatus.text}`}>
                    {projection.percentage}%
                  </span>
                  <span className="text-[10px] text-white/40 uppercase font-mono tracking-widest mt-1">
                    Projected
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm font-mono bg-white/[0.03] px-4 py-2 rounded-xl border border-white/5">
                <span className="text-white/50 font-bold">{percentage}%</span>
                <ArrowRight className="w-4 h-4 text-white/30" />
                <span className={`font-bold ${projectedStatus.text}`}>{projection.percentage}%</span>
              </div>
            </div>

            {/* Logical Compliance Outcomes */}
            <div className="space-y-4">
              
              {/* Compliance status banner */}
              <div className={`p-5 rounded-2xl border ${projectedStatus.bg} ${projectedStatus.border} ${projectedStatus.glow} text-center space-y-1.5 transition-all duration-500`}>
                <span className="text-[10px] uppercase font-bold tracking-widest block text-white/50">Projected Health</span>
                <span className={`text-xl font-bold uppercase tracking-wide block ${projectedStatus.text}`}>
                  {projection.percentage >= minAttendance ? "SAFE STANDING" : "DETENTION RISK"}
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
                    <span className={`font-bold font-mono bg-white/5 px-2 py-1 rounded-md border border-white/5 ${projection.safeBunks > 0 ? "text-emerald-400" : "text-white/40"}`}>
                      {projection.safeBunks} Classes
                    </span>
                  </div>
                  <p className="text-[11px] text-white/40 leading-relaxed pt-1">
                    {projection.percentage >= minAttendance 
                      ? `You can afford to skip up to ${projection.safeBunks} upcoming classes before dropping below compliance.`
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
