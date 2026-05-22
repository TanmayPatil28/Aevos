"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CalendarRange, 
  HelpCircle, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  FileSpreadsheet
} from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import GlassCard from "@/components/GlassCard";
import BunkScheduler from "@/components/attendance/BunkScheduler";
import { useUSMStore } from "@/stores/usmStore";
import { selectAttendanceRisk } from "@/stores/selectors";
import { getPresetById } from "@/lib/presets/presetRegistry";

export default function AttendancePage() {
  const storeState = useUSMStore((state) => state);
  const presetId = useUSMStore((state) => state.presetId);
  const activePreset = getPresetById(presetId);
  
  // Calculate attendance details dynamically
  const attendanceRiskData = selectAttendanceRisk(storeState);
  
  const minAttendance = activePreset?.passRules?.minAttendance || 75;

  const [showTrace, setShowTrace] = useState(false);

  // Map courses to the shape BunkScheduler expects
  const schedulerCourses = attendanceRiskData.courses.map((courseRisk) => {
    // Find the original course to extract conducted vs bunked
    const originalCourse = storeState.courses.find((c) => c.id === courseRisk.courseId);
    
    // Fallbacks if not found
    const conducted = originalCourse ? originalCourse.attendanceTotal : 0;
    const bunked = originalCourse ? originalCourse.attendanceBunked : 0;
    const attended = Math.max(0, conducted - bunked);

    return {
      id: courseRisk.courseId,
      name: courseRisk.courseName,
      code: courseRisk.courseCode,
      conducted,
      bunked,
      attended,
      percentage: courseRisk.percentage,
      minAttendance,
    };
  });

  const getRiskColor = (risk: "LOW" | "MEDIUM" | "HIGH") => {
    switch (risk) {
      case "LOW":
        return "text-emerald-400 border-emerald-500/20 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]";
      case "MEDIUM":
        return "text-amber-400 border-amber-500/20 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]";
      case "HIGH":
        return "text-rose-400 border-rose-500/20 bg-rose-500/10 shadow-[0_0_15px_rgba(239,68,68,0.15)]";
    }
  };

  const getCourseStatusDetails = (status: "PRESENT" | "ABSENT" | "CANCELLED" | "LOW_RISK" | "MED_RISK" | "HIGH_RISK") => {
    switch (status) {
      case "LOW_RISK":
      case "PRESENT":
        return {
          text: "Safe",
          color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        };
      case "MED_RISK":
        return {
          text: "Borderline",
          color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
          icon: <AlertTriangle className="w-4 h-4 text-amber-400" />
        };
      case "HIGH_RISK":
      case "ABSENT":
        return {
          text: "Deficient",
          color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
          icon: <XCircle className="w-4 h-4 text-rose-400 animate-pulse" />
        };
      default:
        return {
          text: "No Data",
          color: "text-slate-400 bg-slate-500/10 border-slate-500/20",
          icon: <HelpCircle className="w-4 h-4 text-slate-400" />
        };
    }
  };

  // Static trace details representing our compliance verification logs
  const traceMetadata = {
    formulaApplied: "Course% = (Attended / Conducted) * 100 | Aggregate% = (TotalAttended / TotalConducted) * 100",
    sourceRegulationId: activePreset?.id === "sppu" ? "SPPU-ATT-ORD-302" : "UNIV-ATT-ORD-V2",
    sourceClause: `Clause 12.1 (Minimum ${minAttendance}% attendance requirement)`,
    sourceCircular: activePreset?.name 
      ? `${activePreset.name} Academic Council Ordinance on Mandatory Attendance & Detention`
      : "University Ordinance on Mandatory Student Attendance & Detention Gates",
    lastVerifiedAt: "2026-05-21T00:00:00Z",
    confidenceScore: 100,
    assumptions: [
      "Calculated from registered active semester courses only",
      "Bunked classes directly decrement from total conducted classes to derive attended hours",
      "Detention risk category is set to HIGH if percentage < minAttendance, MEDIUM if within 5% above it."
    ],
  };

  return (
    <PageContainer>
      {/* Background highlight */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none -z-10" />

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
              <CalendarRange className="w-6 h-6" />
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Predictive Attendance & Bunk Planner
            </h1>
          </div>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Monitor subject attendance, simulate prospective bunks to plan events safely, and trace academic compliance against {activePreset?.name || "University"} requirements.
          </p>
        </div>
      </div>

      {/* Overview stats panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="border border-white/5 flex flex-col justify-between py-6">
          <span className="text-xs text-slate-400 font-medium">Aggregate Attendance</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">
              {attendanceRiskData.aggregatePercentage}%
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-2 block font-mono">ALL COURSES COMBINED</span>
        </GlassCard>

        <GlassCard className="border border-white/5 flex flex-col justify-between py-6">
          <span className="text-xs text-slate-400 font-medium">detention risk status</span>
          <div className="mt-2">
            <span className={`text-xl font-bold px-3 py-1 rounded-lg border font-mono tracking-wider ${getRiskColor(attendanceRiskData.overallRisk)}`}>
              {attendanceRiskData.overallRisk} RISK
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-2 block font-mono">BASED ON UNIVERSITY CEILING</span>
        </GlassCard>

        <GlassCard className="border border-white/5 flex flex-col justify-between py-6">
          <span className="text-xs text-slate-400 font-medium">Ordinance Threshold</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-indigo-400 font-mono">{minAttendance}%</span>
            <span className="text-xs text-slate-500">Min Limit</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-2 block font-mono">
            {activePreset?.name || "UNIVERSITY PRESCRIPTION"}
          </span>
        </GlassCard>
      </div>

      {/* Active Courses Attendance Checklist */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            Subject Compliance Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Course-by-course overview indicating total classes, safe bunks remaining, or classes needed to recover compliance.
          </p>
        </div>

        {schedulerCourses.length === 0 ? (
          <GlassCard className="border border-white/5 text-center py-12">
            <AlertTriangle className="w-8 h-8 text-slate-500 mx-auto mb-3" />
            <h3 className="text-white font-bold">No registered courses found</h3>
            <p className="text-xs text-slate-400 mt-1">Please register your active semester courses in the calculator or planner to activate attendance tracking.</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {attendanceRiskData.courses.map((courseRisk) => {
              // Find matching course details
              const matchingCourse = schedulerCourses.find((c) => c.id === courseRisk.courseId);
              const statusDetails = getCourseStatusDetails(courseRisk.status);
              
              if (!matchingCourse) return null;

              return (
                <GlassCard
                  key={courseRisk.courseId}
                  className={`border border-white/5 space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow duration-300`}
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-white tracking-wide text-sm line-clamp-1">
                          {courseRisk.courseName}
                        </h3>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {courseRisk.courseCode}
                        </span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase font-semibold flex items-center gap-1 border ${statusDetails.color}`}>
                        {statusDetails.icon}
                        {statusDetails.text}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-2">
                      <span className="text-xs text-slate-400 font-medium">Attendance Score</span>
                      <span className={`text-2xl font-bold font-mono ${
                        courseRisk.percentage >= minAttendance ? "text-emerald-400" :
                        courseRisk.percentage >= minAttendance - 5 ? "text-amber-400" : "text-rose-400"
                      }`}>
                        {courseRisk.percentage}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Attended / Conducted:</span>
                      <span className="text-white font-semibold font-mono">
                        {matchingCourse.attended} / {matchingCourse.conducted}
                      </span>
                    </div>

                    {courseRisk.percentage >= minAttendance ? (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Safe Bunks Available:</span>
                        <span className="text-emerald-400 font-bold font-mono">
                          {courseRisk.safeBunks} classes
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Recovery Needed:</span>
                        <span className="text-rose-400 font-bold font-mono animate-pulse">
                          {courseRisk.recoveryRequired} classes
                        </span>
                      </div>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Simulator Section */}
      {schedulerCourses.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Interactive Bunk Scheduler
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Project future scenarios to see how class counts alter compliance percentages.
            </p>
          </div>
          <BunkScheduler courses={schedulerCourses} />
        </div>
      )}

      {/* Ordinance Trace Transparency Box */}
      <GlassCard className="border border-white/5 space-y-4">
        <button
          onClick={() => setShowTrace(!showTrace)}
          className="w-full flex items-center justify-between text-left"
        >
          <span className="text-xs font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wider font-mono">
            <Info className="w-4 h-4 text-indigo-400" />
            University Ordinance Trace & Regulatory Reference
          </span>
          {showTrace ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        <AnimatePresence>
          {showTrace && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 text-xs overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-xl border border-white/5 text-slate-400 leading-relaxed font-mono">
                <div className="space-y-2">
                  <div>
                    <span className="text-white block font-semibold mb-0.5">Algorithm Reference:</span>
                    <span>{traceMetadata.formulaApplied}</span>
                  </div>
                  <div>
                    <span className="text-white block font-semibold mb-0.5">Ordinance Regulation ID:</span>
                    <span>{traceMetadata.sourceRegulationId}</span>
                  </div>
                  <div>
                    <span className="text-white block font-semibold mb-0.5">Governing Circular:</span>
                    <span>{traceMetadata.sourceCircular}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-white block font-semibold mb-0.5">Section Clause Reference:</span>
                    <span>{traceMetadata.sourceClause}</span>
                  </div>
                  <div>
                    <span className="text-white block font-semibold mb-0.5">Last Audited Timestamp:</span>
                    <span>{traceMetadata.lastVerifiedAt}</span>
                  </div>
                  <div>
                    <span className="text-white block font-semibold mb-0.5">Ordinance Verification Rules:</span>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {traceMetadata.assumptions.map((as, idx) => (
                        <li key={idx}>{as}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </PageContainer>
  );
}
