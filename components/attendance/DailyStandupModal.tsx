"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useUSMStore, TimetableState } from "@/stores/usmStore";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarCheck, X, Check, Coffee, MapPin, Clock, AlertTriangle } from "lucide-react";
import { getStudentDayIndex, getStudentDateStr } from "@/lib/dateUtils";

const DAYS_MAP: (keyof TimetableState)[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export default function DailyStandupModal() {
  const { timetable, courses, updateCourse, addAttendanceHistoryEvent, holidays } = useUSMStore();
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [individualStatus, setIndividualStatus] = useState<Record<string, "ATTENDED" | "BUNKED" | "CANCELED" | "LATE" | null>>({});
  const [individualNotes, setIndividualNotes] = useState<Record<string, string>>({});
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);

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

  const handleSaveLog = () => {
    const courseUpdates = new Map<string, { total: number, bunked: number }>();
    const todayStr = getStudentDateStr();
    
    todaysClasses.forEach(entry => {
      const entryStatus = individualStatus[entry.id] || "ATTENDED";
      const note = individualNotes[entry.id];
      const current = courseUpdates.get(entry.courseId) || { total: 0, bunked: 0 };
      
      let newTotal = current.total;
      let newBunked = current.bunked;
      
      if (entryStatus === "ATTENDED" || entryStatus === "LATE") {
        newTotal += 1;
      } else if (entryStatus === "BUNKED") {
        newTotal += 1;
        newBunked += 1;
      }
      
      courseUpdates.set(entry.courseId, { total: newTotal, bunked: newBunked });
      
      // Log each event
      addAttendanceHistoryEvent({
        dateStr: todayStr,
        courseId: entry.courseId,
        action: entryStatus as "ATTENDED" | "BUNKED" | "CANCELED" | "LATE",
        note: note || undefined
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

  const handleMarkAllAttended = () => {
    const updates: Record<string, "ATTENDED"> = {};
    todaysClasses.forEach(c => updates[c.id] = "ATTENDED");
    setIndividualStatus(prev => ({ ...prev, ...updates }));
  };

  const setStatus = (entryId: string, status: "ATTENDED" | "BUNKED" | "CANCELED" | "LATE") => {
    setIndividualStatus(prev => ({ ...prev, [entryId]: status }));
  };

  const toggleExpand = (entryId: string) => {
    setExpandedNoteId(prev => prev === entryId ? null : entryId);
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
          className="fixed bottom-6 right-6 z-50 w-[370px] bg-surface-raised rounded-[2rem] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden border-none"
        >
          
          <button 
            onClick={dismissForToday}
            className="absolute top-4 right-4 p-2 rounded-full text-white/30 hover:bg-surface hover:text-white transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-5 relative z-10">
            <div className="w-10 h-10 rounded-full bg-[#10b981] flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 text-black" />
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
            <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {todaysClasses.map(entry => {
                const status = individualStatus[entry.id];
                const isExpanded = expandedNoteId === entry.id;
                
                // Safe bunk calculation
                const c = courses.find(c => c.id === entry.courseId);
                let dropsBelowSafe = false;
                if (c && status === "BUNKED") {
                   const newTotal = c.attendanceTotal + 1;
                   const newBunked = c.attendanceBunked + 1;
                   if (newTotal > 0 && ((newTotal - newBunked) / newTotal) < 0.75) {
                      dropsBelowSafe = true;
                   }
                }

                return (
                  <div key={entry.id} className="flex flex-col gap-1 w-full">
                    <button
                      onClick={() => toggleExpand(entry.id)}
                      className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-[11px] transition-all border-none ${
                        status === "ATTENDED" 
                          ? "bg-[#10b981] text-black" 
                          : status === "BUNKED"
                          ? dropsBelowSafe ? "bg-red-600 text-white" : "bg-rose-500 text-white"
                          : status === "CANCELED"
                          ? "bg-white/20 text-white"
                          : status === "LATE"
                          ? "bg-amber-500 text-black"
                          : "bg-surface hover:bg-[#2A2A2D] text-white/80 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{courseMap.get(entry.courseId) || "Unknown"}</span>
                        {entry.room && (
                          <span className={`flex items-center gap-0.5 text-[9px] ${status ? "opacity-70" : "text-white/40"}`}>
                            <MapPin className="w-2.5 h-2.5" />{entry.room}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {dropsBelowSafe && status === "BUNKED" && (
                           <span className="text-[10px] font-bold text-red-100 flex items-center gap-1 bg-black/20 px-1.5 py-0.5 rounded">
                              <AlertTriangle className="w-3 h-3" /> RISK
                           </span>
                        )}
                        <span className={`font-mono text-[9px] flex items-center gap-0.5 ${status ? "opacity-70" : "text-white/40"}`}>
                          <Clock className="w-2.5 h-2.5" />{entry.startTime}
                        </span>
                        {status && (
                          <span className="text-[9px] font-bold uppercase tracking-wider">{status}</span>
                        )}
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-3 bg-surface rounded-xl border border-white/5 space-y-3 mt-1">
                            <div className="flex gap-2">
                              {["ATTENDED", "BUNKED", "LATE", "CANCELED"].map(s => (
                                <button
                                  key={s}
                                  onClick={() => setStatus(entry.id, s as any)}
                                  className={`flex-1 py-2 rounded-lg text-[9px] font-bold tracking-wider transition-colors ${
                                    status === s 
                                      ? s === "ATTENDED" ? "bg-[#10b981] text-black" : s === "BUNKED" ? "bg-rose-500 text-white" : s === "LATE" ? "bg-amber-500 text-black" : "bg-white/20 text-white"
                                      : "bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
                                  }`}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                            <input
                              type="text"
                              placeholder="Add a note (optional)..."
                              value={individualNotes[entry.id] || ""}
                              onChange={e => setIndividualNotes(prev => ({ ...prev, [entry.id]: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] text-white placeholder-white/30 focus:outline-none focus:border-[#10b981]/50 focus:bg-white/10 transition-all"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <button
                onClick={handleSaveLog}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand hover:bg-[#E5D51E] text-black rounded-xl transition-all font-bold tracking-widest text-[11px]"
              >
                <Check className="w-4 h-4" />
                SAVE & LOG
              </button>
              <button
                onClick={handleMarkAllAttended}
                className="w-full py-2 bg-transparent text-white/40 hover:text-white transition-colors text-[10px] font-bold tracking-wider uppercase"
              >
                Quick Mark All Attended
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
