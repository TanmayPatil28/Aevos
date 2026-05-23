"use client";

import React, { useState } from "react";
import { 
  Calendar, 
  UserX, 
  UserCheck, 
  AlertCircle, 
  ArrowRight,
  Info
} from "lucide-react";
import GlassCard from "../GlassCard";
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
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || "");
  const [futureBunks, setFutureBunks] = useState<number>(0);
  const [futureAttended, setFutureAttended] = useState<number>(0);

  const activeCourse = courses.find((c) => c.id === selectedCourseId);

  // If no course is available, render empty state
  if (!activeCourse) {
    return (
      <GlassCard className="border border-white/5 text-center py-12">
        <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-3" />
        <h3 className="text-white font-bold">No Active Courses Found</h3>
        <p className="text-xs text-slate-400 mt-1">Please register courses in the planner or import an academic JSON first.</p>
      </GlassCard>
    );
  }

  // Current values
  const { conducted, bunked, attended, percentage, minAttendance } = activeCourse;

  // Calculate projected impact using our math engine
  const projection = calculateBunkImpact(
    attended,
    conducted,
    futureBunks,
    futureAttended,
    minAttendance
  );

  const getStatusColor = (percent: number, minLimit: number) => {
    if (percent < minLimit) return { text: "text-rose-400", border: "border-rose-500/30", bg: "bg-rose-500/10", glow: "shadow-[0_0_15px_rgba(239,68,68,0.15)]" };
    if (percent < minLimit + 5) return { text: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10", glow: "shadow-[0_0_15px_rgba(245,158,11,0.15)]" };
    return { text: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10", glow: "shadow-[0_0_15px_rgba(16,185,129,0.15)]" };
  };

  const currentStatus = getStatusColor(percentage, minAttendance);
  const projectedStatus = getStatusColor(projection.percentage, minAttendance);

  const handleCourseChange = (id: string) => {
    setSelectedCourseId(id);
    setFutureBunks(0);
    setFutureAttended(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Simulation Controllers (Left Panel) */}
      <div className="lg:col-span-1 space-y-6">
        <GlassCard className="border border-white/5 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-indigo-400" />
              Bunk Simulator Controls
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select a course and adjust sliders to project compliance.
            </p>
          </div>

          {/* Select Course dropdown */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Select Course</label>
            <select
              value={selectedCourseId}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div className="h-[1px] bg-white/5" />

          {/* Simulator Sliders */}
          <div className="space-y-6">
            
            {/* Future Bunks Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <UserX className="w-4 h-4 text-rose-400" />
                  Upcoming Classes to Bunk
                </span>
                <span className="font-bold text-rose-400 font-mono text-sm">
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
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 Classes</span>
                <span>25 Classes</span>
              </div>
            </div>

            {/* Future Attended Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  Upcoming Classes to Attend
                </span>
                <span className="font-bold text-emerald-400 font-mono text-sm">
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
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 Classes</span>
                <span>25 Classes</span>
              </div>
            </div>

          </div>

          <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-2 text-xs">
            <span className="font-semibold text-white block">Current Standing Summary</span>
            <div className="flex justify-between text-slate-400">
              <span>Classes Conducted:</span>
              <span className="font-mono font-medium text-white">{conducted}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Classes Attended:</span>
              <span className="font-mono font-medium text-white">{attended}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Classes Bunked:</span>
              <span className="font-mono font-medium text-white">{bunked}</span>
            </div>
          </div>

        </GlassCard>
      </div>

      {/* Math Projection Visualization & Outcome (Right Panel) */}
      <div className="lg:col-span-2 space-y-6">
        <GlassCard className="border border-white/5 space-y-6">
          <h3 className="text-base font-bold text-white tracking-wide">
            Simulated Math Outcome Projections
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Visual Gauge Comparison */}
            <div className="bg-slate-950/20 border border-white/5 rounded-2xl p-5 flex flex-col justify-between items-center text-center space-y-4">
              <span className="text-xs text-slate-400 font-medium">Compliance Delta</span>
              
              <div className="relative flex items-center justify-center">
                {/* SVG circular track rings */}
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  {/* Current Ring */}
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - percentage / 100)}
                    className={`transition-all duration-500 opacity-30 ${currentStatus.text}`}
                  />
                  {/* Projected Ring */}
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - projection.percentage / 100)}
                    className={`transition-all duration-500 ${projectedStatus.text}`}
                  />
                </svg>

                {/* Central Value Readout */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl font-bold font-mono ${projectedStatus.text}`}>
                    {projection.percentage}%
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider mt-0.5">
                    Projected
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">{percentage}%</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                <span className={`font-bold ${projectedStatus.text}`}>{projection.percentage}%</span>
              </div>
            </div>

            {/* Logical Compliance Outcomes */}
            <div className="space-y-4">
              
              {/* Compliance status banner */}
              <div className={`p-4 rounded-xl border ${projectedStatus.bg} ${projectedStatus.border} ${projectedStatus.glow} text-center space-y-1 transition-all`}>
                <span className="text-[10px] uppercase font-bold tracking-wider block text-slate-400">Projected Health</span>
                <span className={`text-lg font-bold uppercase tracking-wide block ${projectedStatus.text}`}>
                  {projection.percentage >= minAttendance ? "SAFE STANDING" : "DETENTION RISK"}
                </span>
                <span className="text-[11px] text-slate-300 leading-normal block">
                  University baseline limit: {minAttendance}%
                </span>
              </div>

              {/* Action items based on math */}
              <div className="space-y-3">
                <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Safe Bunks Remaining:</span>
                    <span className={`font-bold font-mono ${projection.safeBunks > 0 ? "text-emerald-400" : "text-slate-400"}`}>
                      {projection.safeBunks} Classes
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    {projection.percentage >= minAttendance 
                      ? `You can afford to skip up to ${projection.safeBunks} upcoming classes before dropping below compliance.`
                      : "No safe bunks available. You are currently non-compliant."}
                  </p>
                </div>

                <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Recovery Classes Required:</span>
                    <span className={`font-bold font-mono ${projection.recoveryRequired > 0 ? "text-rose-400 animate-pulse" : "text-emerald-400"}`}>
                      {projection.recoveryRequired} Classes
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    {projection.recoveryRequired > 0
                      ? `To restore your attendance to a safe ${minAttendance}%, you must attend the next ${projection.recoveryRequired} consecutive classes without failure.`
                      : "Currently in compliance. No immediate recovery block needed."}
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* Mathematical Explainability Note */}
          <div className="bg-indigo-950/10 border border-indigo-500/10 p-4 rounded-xl flex items-start gap-3">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-indigo-300">
              <span className="font-semibold block text-white">Mathematical Explanation:</span>
              <p className="leading-relaxed text-[11px]">
                The projection is calculated using: <code className="font-mono text-white">Projected% = (Attended + SimulatedAttended) / (Conducted + SimulatedBunks + SimulatedAttended) * 100</code>.
                Safe bunks and recovery limits adjust continuously using discrete floor/ceil functions based on your active university ordinance rules.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

    </div>
  );
}
