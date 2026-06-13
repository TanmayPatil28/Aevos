"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useUSMStore, TimetableState } from "@/stores/usmStore";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarCheck, X, Check, Coffee, MapPin, Clock } from "lucide-react";
import { getStudentDayIndex, getStudentDateStr } from "@/lib/dateUtils";

const DAYS_MAP: (keyof TimetableState)[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export default function DailyStandupModal() {
  const { timetable, courses, updateCourse, addAttendanceHistoryEvent, holidays } = useUSMStore();
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [individualStatus, setIndividualStatus] = useState<Record<string, "ATTENDED" | "BUNKED" | null>>({});

  // Determine current day's classes
  const todaysClasses = useMemo(() => {
    const todayIndex = getStudentDayIndex();
    const currentDay = DAYS_MAP[todayIndex];
    return timetable[currentDay] || [];
  }, [timetable]);

  // Map courseId to course name
  const courseMap = useMemo(() => {
    const map = new Map<string, string>();
    courses.forEach(c => map.set(c.id, c.code || c.name));
    return map;
  }, [courses]);

  useEffect(() => {
    const todayDateStr = getStudentDateStr();
    // Do not nag if today is marked as a holiday
    if (holidays.includes(todayDateStr)) return;

    if (todaysClasses.length > 0 && !dismissed) {
      // Check memory to prevent nagging if already logged/dismissed today
      const lastLoggedStr = localStorage.getItem("gradeflow_standup_date");
      
      if (lastLoggedStr !== todayDateStr) {
        const timer = setTimeout(() => setIsVisible(true), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [todaysClasses, dismissed, holidays]);

  const dismissForToday = () => {
    localStorage.setItem("gradeflow_standup_date", getStudentDateStr());
    setIsVisible(false);
    setDismissed(true);
  };

  const handleBulkLog = (status: "ATTENDED" | "BUNKED") => {
    const courseUpdates = new Map<string, { total: number, bunked: number }>();
    const todayStr = getStudentDateStr();
    
    todaysClasses.forEach(entry => {
      const entryStatus = individualStatus[entry.id] || status;
      const current = courseUpdates.get(entry.courseId) || { total: 0, bunked: 0 };
      courseUpdates.set(entry.courseId, {
        total: current.total + 1,
        bunked: current.bunked + (entryStatus === "BUNKED" ? 1 : 0)
      });
      
      // Log each event
      addAttendanceHistoryEvent({
        dateStr: todayStr,
        courseId: entry.courseId,
        action: entryStatus as "ATTENDED" | "BUNKED"
      });
    });

    courseUpdates.forEach((updates, courseId) => {
      const c = courses.find(c => c.id === courseId);
      if (c) {
        updateCourse(courseId, {
          attendanceTotal: c.attendanceTotal + updates.total,
          attendanceBunked: c.attendanceBunked + updates.bunked
        });
      }
    });

    dismissForToday();
  };

  const toggleIndividual = (entryId: string) => {
    setIndividualStatus(prev => {
      const current = prev[entryId];
      if (!current) return { ...prev, [entryId]: "ATTENDED" };
      if (current === "ATTENDED") return { ...prev, [entryId]: "BUNKED" };
      const next = { ...prev };
      delete next[entryId];
      return next;
    });
  };

  const dayName = DAYS_MAP[getStudentDayIndex()];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 right-6 z-50 w-[370px] bg-[#1c1c1e] border border-white/[0.05] rounded-[2rem] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/10 blur-3xl pointer-events-none rounded-full" />
          
          <button 
            onClick={dismissForToday}
            className="absolute top-4 right-4 p-1 rounded-full text-white/30 hover:bg-white/10 hover:text-white transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-10 h-10 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <CalendarCheck className="w-5 h-5 text-[#10b981] drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Daily Standup</h3>
              <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Happy {dayName}!</p>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            <p className="text-xs text-white/70 leading-relaxed">
              You had <strong className="text-white">{todaysClasses.length} classes</strong> scheduled today. Tap each class to set individual status, or use bulk actions below.
            </p>

            {/* Individual Class List */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              {todaysClasses.map(entry => {
                const status = individualStatus[entry.id];
                return (
                  <button
                    key={entry.id}
                    onClick={() => toggleIndividual(entry.id)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-[11px] transition-all border ${
                      status === "ATTENDED" 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                        : status === "BUNKED"
                        ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        : "bg-white/[0.03] border-white/[0.05] text-white/60 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{courseMap.get(entry.courseId) || "Unknown"}</span>
                      {entry.room && (
                        <span className="flex items-center gap-0.5 text-[9px] text-white/30">
                          <MapPin className="w-2.5 h-2.5" />{entry.room}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] text-white/30 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />{entry.startTime}
                      </span>
                      {status && (
                        <span className="text-[9px] font-bold uppercase tracking-wider">{status}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleBulkLog("ATTENDED")}
                className="flex-1 flex flex-col items-center justify-center gap-1.5 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              >
                <Check className="w-4 h-4" />
                <span className="text-[10px] font-bold tracking-wider">YES, ALL</span>
              </button>
              <button
                onClick={() => handleBulkLog("BUNKED")}
                className="flex-1 flex flex-col items-center justify-center gap-1.5 py-3 bg-white/[0.03] hover:bg-white/[0.08] text-white/40 hover:text-white border border-white/5 rounded-xl transition-all"
              >
                <Coffee className="w-4 h-4" />
                <span className="text-[10px] font-bold tracking-wider">BUNKED ALL</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
