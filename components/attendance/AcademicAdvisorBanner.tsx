"use client";

import React from "react";
import { AlertCircle, CheckCircle2, ShieldAlert, Sparkles, BookOpen } from "lucide-react";
import { DerivedAttendanceStatus } from "@/stores/selectors/attendance";

interface AcademicAdvisorBannerProps {
  status: DerivedAttendanceStatus;
}

export default function AcademicAdvisorBanner({ status }: AcademicAdvisorBannerProps) {
  // Generate pseudo-intelligent advice based on status
  
  let icon = <Sparkles className="w-5 h-5 text-indigo-400" />;
  let title = "AI Academic Advisor";
  let message = "Your attendance is well maintained. Keep it up!";
  let bgColor = "bg-indigo-500/10 border-indigo-500/20";
  let textColor = "text-indigo-400";
  
  const worstCourse = status.courses.find(c => c.courseId === status.worstCourseId);

  if (status.overallRisk === "EMERGENCY") {
    icon = <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />;
    title = "Academic Emergency Alert";
    message = worstCourse 
      ? `Critical detention risk detected. Immediate attendance recovery needed in ${worstCourse.courseName}. Internal marks are being affected.`
      : "Critical detention risk detected across multiple subjects. Do not skip any upcoming classes.";
    bgColor = "bg-rose-500/10 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.1)]";
    textColor = "text-rose-400";
  } else if (status.overallRisk === "HIGH") {
    icon = <AlertCircle className="w-5 h-5 text-amber-500" />;
    title = "Risk Warning";
    message = worstCourse && worstCourse.facultyStrictness === "STRICT"
      ? `High risk warning. ${worstCourse.courseName} has a STRICT faculty—avoid skipping. Prioritize recovery.`
      : `You are falling below safe limits. Attend continuously for the next week to stabilize.`;
    bgColor = "bg-amber-500/10 border-amber-500/30";
    textColor = "text-amber-400";
  } else if (status.overallRisk === "MEDIUM") {
    icon = <BookOpen className="w-5 h-5 text-blue-400" />;
    title = "Strategic Advisory";
    message = "You are hovering near the safe limit. You can safely bunk 1-2 classes but maintain a buffer for emergencies.";
    bgColor = "bg-blue-500/10 border-blue-500/20";
    textColor = "text-blue-400";
  } else {
    icon = <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    title = "Safe Status";
    message = "You have a solid buffer. You can safely participate in extracurriculars or placement prep this week.";
    bgColor = "bg-emerald-500/10 border-emerald-500/20";
    textColor = "text-emerald-400";
  }

  return (
    <div className={`p-4 rounded-xl border ${bgColor} flex items-start gap-4 transition-all duration-300`}>
      <div className="shrink-0 mt-0.5 p-2 bg-slate-950/50 rounded-lg">
        {icon}
      </div>
      <div>
        <h3 className={`font-bold tracking-wide text-sm ${textColor}`}>
          {title}
        </h3>
        <p className="text-slate-300 text-sm mt-1 leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}
