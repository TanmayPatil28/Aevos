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
import Card from "@/components/ui/Card";

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
  strategy?: "SAFE" | "BALANCED" | "SURVIVAL" | "PLACEMENT_PREP";
}

export default function BunkScheduler({ courses, strategy = "BALANCED" }: BunkSchedulerProps) {
  const storeState = useUSMStore();
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || "");
  const [isSyncing, setIsSyncing] = useState(false);

  const activeCourse = courses.find((c) => c.id === selectedCourseId);

  if (!activeCourse) {
    return (
      <Card className="gsap-bunk-card text-center py-12" padding="xl">
        <AlertCircle className="w-8 h-8 text-white/20 mx-auto mb-3" />
        <h3 className="text-white font-bold text-lg">No Active Courses Found</h3>
        <p className="text-sm text-white/40 mt-1">Please register courses in the planner or import an academic JSON first.</p>
      </Card>
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
      minAttendance,
      strategy
    );
  }

  const getStatusColor = (percent: number, minLimit: number) => {
    if (percent < minLimit) return { text: "text-rose-400", border: "border-rose-500/30", bg: "bg-rose-500/10", glow: "shadow-[0_0_15px_rgba(244,63,94,0.15)]" };
    if (percent < minLimit + 5) return { text: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10", glow: "shadow-[0_0_15px_rgba(245,158,11,0.15)]" };
    return { text: "text-brand", border: "border-brand/30", bg: "bg-brand/10", glow: "shadow-[0_0_15px_rgba(255,214,10,0.15)]" };
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
      <div className="lg:col-span-1 space-y-6 gsap-bunk-card">
        <div className="bg-surface-raised rounded-[24px] p-6 sm:p-8 space-y-8 border-none shadow-none flex flex-col h-full">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <Bot className="w-5 h-5 text-brand" />
              AI Bunk Scheduler
            </h3>
            <p className="text-xs text-white/40 mt-1">
              Select a course to see smart bunk dates that optimize your weekends.
            </p>
          </div>

          {/* Select Course dropdown */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Select Course</label>
            <CustomSelect
              value={selectedCourseId}
              onChange={(val) => handleCourseChange(val)}
              options={courses.map((c) => ({ label: `${c.name} (${c.code})`, value: c.id }))}
              buttonClassName="w-full flex items-center justify-between gap-2 bg-surface hover:bg-[#2A2A2D] rounded-xl py-3 px-4 text-sm text-white focus:outline-none transition-colors cursor-pointer border-none shadow-none"
              dropdownClassName="left-0 w-full min-w-[250px]"
            />
          </div>

          <div className="h-[1px] bg-white/[0.04]" />

          {/* Smart Bunks List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Recommended Bunks</span>
              <span className="text-[9px] text-brand font-mono bg-brand/10 px-2 py-0.5 rounded-full">{projection.smartBunks.length} Scheduled</span>
            </div>
            
            {projection.smartBunks.length > 0 ? (
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {projection.smartBunks.map((date, idx) => (
                  <div key={idx} className="flex items-center justify-between hover:bg-surface p-2 rounded-lg transition-colors group cursor-default">
                    <div className="flex items-center gap-3">
                      <div className="relative w-1.5 h-1.5 rounded-full bg-brand" />
                      <div>
                        <div className="text-xs font-bold text-white/90 group-hover:text-white transition-colors">{new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}</div>
                        <div className="text-[10px] text-white/40">{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                      </div>
                    </div>
                    <Sparkles className="w-3.5 h-3.5 text-brand/50 group-hover:text-brand transition-colors" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-surface p-4 rounded-xl text-center">
                <p className="text-xs text-white/40 leading-relaxed">
                  No safe bunks available. You need to attend upcoming classes to maintain {minAttendance}% compliance.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-white/50 text-[11px] pt-4 mt-auto border-t border-white/[0.04]">
            <span className="uppercase font-bold tracking-wider">Classes Left in Sem</span>
            <span className="font-mono font-bold text-white">
              {projection.projectedPercentage > 0 ? Math.max(0, Math.round((projection.projectedAttended / (projection.projectedPercentage / 100)) - (conducted || 0))) : 0}
            </span>
          </div>
        </div>
      </div>

      {/* Minimalist Dashboard Stats (Right Panel) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-surface-raised rounded-[24px] p-6 sm:p-8 flex flex-col h-full border-none shadow-none">
          
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-base font-bold text-white tracking-wide">
              Final Semester Projection
            </h3>
            <button
              onClick={handleSyncToCloud}
              disabled={isSyncing}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isSyncing 
                  ? "bg-brand text-black" 
                  : "bg-surface hover:bg-[#2A2A2D] text-white"
              }`}
            >
              {isSyncing ? (
                <><CheckCircle2 className="w-3.5 h-3.5" /> SAVED</>
              ) : (
                <><CloudUpload className="w-3.5 h-3.5" /> SYNC CLOUD</>
              )}
            </button>
          </div>

          {/* Minimalist Grid layout for dashboard stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            
            {/* Projected Health Card */}
            <div className="bg-surface p-6 rounded-2xl flex flex-col justify-between group hover:bg-[#2A2A2D] transition-colors">
              <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Projected Health</span>
              <div className="mt-4">
                <span className={`text-2xl font-bold uppercase tracking-wide block ${projectedStatus.text}`}>
                  {projection.projectedPercentage >= minAttendance ? "SAFE STANDING" : "DETENTION RISK"}
                </span>
                <span className="text-xs text-white/40 mt-1 block">
                  Baseline: {minAttendance}%
                </span>
              </div>
            </div>

            {/* Attendance Score Card */}
            <div className="bg-surface p-6 rounded-2xl flex flex-col justify-between group hover:bg-[#2A2A2D] transition-colors">
              <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Attendance Status</span>
              <div className="flex items-end gap-3 mt-4">
                <span className={`text-3xl font-bold tracking-tighter ${projectedStatus.text}`}>
                  {Math.round(projection.projectedPercentage)}%
                </span>
                <div className="flex items-center gap-2 text-xs font-medium text-white/50 mb-1.5">
                  <span>{percentage}%</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="text-white">Projected</span>
                </div>
              </div>
            </div>

            {/* Safe Bunks Card */}
            <div className="bg-surface p-6 rounded-2xl flex flex-col justify-between group hover:bg-[#2A2A2D] transition-colors">
              <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Safe Bunks</span>
              <div className="mt-4">
                <span className={`text-3xl font-bold tracking-tighter ${projection.safeBunksRemaining > 0 ? "text-white" : "text-white/40"}`}>
                  {projection.safeBunksRemaining}
                </span>
                <p className="text-[11px] text-white/40 leading-relaxed mt-2">
                  {projection.projectedPercentage >= minAttendance 
                    ? `You can afford to skip ${projection.safeBunksRemaining} upcoming classes.`
                    : "No safe bunks available."}
                </p>
              </div>
            </div>

            {/* Recovery Required Card */}
            <div className="bg-surface p-6 rounded-2xl flex flex-col justify-between group hover:bg-[#2A2A2D] transition-colors">
              <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Recovery Classes</span>
              <div className="mt-4">
                <span className={`text-3xl font-bold tracking-tighter ${projection.recoveryRequired > 0 ? "text-rose-400" : "text-brand"}`}>
                  {projection.recoveryRequired}
                </span>
                <p className="text-[11px] text-white/40 leading-relaxed mt-2">
                  {projection.recoveryRequired > 0
                    ? `Attend ${projection.recoveryRequired} consecutive classes to restore compliance.`
                    : "Currently in compliance. No recovery needed."}
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
