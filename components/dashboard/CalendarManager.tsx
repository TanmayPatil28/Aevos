"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useUSMStore, AcademicEvent } from "@/stores/usmStore";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Upload, Copy, CheckCircle2, AlertCircle, Sparkles, Clock, MapPin, Flag, Bot, Database, FileJson, File, FileText, Download, Filter, X, ChevronDown, ChevronUp, Play, Pause, Square } from "lucide-react";
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import { format, differenceInDays, isWithinInterval, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";

const customPrismStyles = `
  .json-editor span.token.property { color: #E5C07B !important; }
  .json-editor span.token.string { color: #98C379 !important; }
  .json-editor span.token.number { color: #D19A66 !important; }
  .json-editor span.token.boolean { color: #56B6C2 !important; }
  .json-editor span.token.punctuation { color: #ABB2BF !important; }
  .json-editor span.token.operator { color: #ABB2BF !important; }
  .json-editor textarea { outline: none !important; color: transparent !important; background: transparent !important; caret-color: white !important; }

  /* Custom scrollbar for Chrome, Safari and Opera */
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.15);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
  /* Custom scrollbar for Firefox */
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
  }
`;

const AI_PROMPT = `I need you to convert my university academic calendar into a JSON format for GradeFlow. Here is the exact JSON schema I need:

{
  "events": [
    {
      "name": "Test T1",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "type": "EXAM"
    },
    {
      "name": "Diwali Vacation",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "type": "HOLIDAY"
    }
  ]
}`;

// Safe local date parsing to avoid UTC offset issues
const parseLocalDate = (dateStr: string) => {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const HyperFocusBanner = ({ event }: { event: AcademicEvent }) => {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const targetDate = parseLocalDate(event.startDate);
    targetDate.setHours(9, 0, 0, 0); // Assume 9 AM start

    const calcTime = () => {
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;

      if (difference > 0) {
        setTimeLeft({
          d: Math.floor(difference / (1000 * 60 * 60 * 24)),
          h: Math.floor((difference / (1000 * 60 * 60)) % 24),
          m: Math.floor((difference / 1000 / 60) % 60),
          s: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
      }
    };

    calcTime();
    const timer = setInterval(calcTime, 1000);
    return () => clearInterval(timer);
  }, [event]);

  const pad = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="w-full bg-[#0A0A0A] border-2 border-red-500/30 rounded-3xl p-6 md:p-8 relative overflow-hidden mb-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-red-500/5 blur-[50px] pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,1)]"></div>
          <span className="text-[10px] font-black tracking-[0.3em] text-red-500 uppercase">Hyper-Focus Mode</span>
        </div>
        <h3 className="text-white font-black text-xl md:text-2xl max-w-sm leading-tight tracking-tight">{event.name}</h3>
        <span className="text-red-500/60 text-xs font-mono font-bold mt-2 uppercase tracking-widest">{format(parseLocalDate(event.startDate), 'MMM do, yyyy')}</span>
      </div>

      <div className="relative z-10 flex items-center gap-2 md:gap-4 text-red-500 font-mono font-black tabular-nums tracking-tighter drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
        <div className="flex flex-col items-center">
          <span className="text-4xl md:text-6xl">{pad(timeLeft.d)}</span>
          <span className="text-[8px] md:text-[10px] tracking-[0.2em] text-red-500/50 uppercase mt-1">Days</span>
        </div>
        <span className="text-3xl md:text-5xl mb-4 md:mb-5 opacity-40 animate-pulse">:</span>
        <div className="flex flex-col items-center">
          <span className="text-4xl md:text-6xl">{pad(timeLeft.h)}</span>
          <span className="text-[8px] md:text-[10px] tracking-[0.2em] text-red-500/50 uppercase mt-1">Hrs</span>
        </div>
        <span className="text-3xl md:text-5xl mb-4 md:mb-5 opacity-40 animate-pulse">:</span>
        <div className="flex flex-col items-center">
          <span className="text-4xl md:text-6xl">{pad(timeLeft.m)}</span>
          <span className="text-[8px] md:text-[10px] tracking-[0.2em] text-red-500/50 uppercase mt-1">Min</span>
        </div>
        <span className="text-3xl md:text-5xl mb-4 md:mb-5 opacity-40 animate-pulse">:</span>
        <div className="flex flex-col items-center w-[4rem] md:w-[5rem]">
          <span className="text-4xl md:text-6xl text-red-400">{pad(timeLeft.s)}</span>
          <span className="text-[8px] md:text-[10px] tracking-[0.2em] text-red-500/50 uppercase mt-1">Sec</span>
        </div>
      </div>
    </div>
  );
};

export default function CalendarManager() {
  const { academicCalendar, setAcademicCalendar, updateEventSubtasks } = useUSMStore();
  const [activeTab, setActiveTab] = useState<"NEXT_UP" | "CALENDAR" | "JSON" | "AI_PROMPT">("NEXT_UP");
  const [jsonInput, setJsonInput] = useState("");
  const [syncStatus, setSyncStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">("IDLE");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [promptCopied, setPromptCopied] = useState(false);
  const [eventFilter, setEventFilter] = useState<"ALL" | "EXAM" | "HOLIDAY" | "OTHER">("ALL");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedDate) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedDate]);

  // Sub-Task & AI Engine State
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [isGeneratingId, setIsGeneratingId] = useState<string | null>(null);

  const handleAIGenerate = (eventId: string, eventName: string) => {
    setIsGeneratingId(eventId);
    setTimeout(() => {
      const mockSubtasks = [
        { id: `st_${Date.now()}_1`, title: `Analyze syllabus & weightage for ${eventName}`, completed: false },
        { id: `st_${Date.now()}_2`, title: `Complete 3 official mock test papers`, completed: false },
        { id: `st_${Date.now()}_3`, title: `Active recall session for weak topics`, completed: false }
      ];
      updateEventSubtasks(eventId, mockSubtasks);
      setIsGeneratingId(null);
    }, 1500);
  };

  const toggleSubtask = (eventId: string, subtaskId: string, currentCompleted: boolean) => {
    const evt = academicCalendar.find(e => e.id === eventId);
    if (!evt || !evt.subtasks) return;
    const updated = evt.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !currentCompleted } : st);
    updateEventSubtasks(eventId, updated);
  };

  // Pomodoro Timer State
  const [activeTimerTaskId, setActiveTimerTaskId] = useState<string | null>(null);
  const [activeTimerTaskName, setActiveTimerTaskName] = useState<string>("");
  const [timerRemaining, setTimerRemaining] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timerRemaining > 0) {
      interval = setInterval(() => {
        setTimerRemaining(prev => prev - 1);
      }, 1000);
    } else if (timerRemaining === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerRemaining]);

  const handleStartTimer = (taskId: string, taskName: string) => {
    setActiveTimerTaskId(taskId);
    setActiveTimerTaskName(taskName);
    setTimerRemaining(25 * 60);
    setIsTimerRunning(true);
  };

  const exportToICS = () => {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//GradeFlow//Academic Timeline//EN\n";
    academicCalendar.forEach(evt => {
      const start = evt.startDate.replace(/-/g, "");
      icsContent += "BEGIN:VEVENT\n";
      icsContent += `DTSTART;VALUE=DATE:${start}\n`;
      if (evt.endDate && evt.endDate !== evt.startDate) {
        const endD = parseLocalDate(evt.endDate);
        endD.setDate(endD.getDate() + 1);
        icsContent += `DTEND;VALUE=DATE:${format(endD, 'yyyyMMdd')}\n`;
      } else {
        const startD = parseLocalDate(evt.startDate);
        startD.setDate(startD.getDate() + 1);
        icsContent += `DTEND;VALUE=DATE:${format(startD, 'yyyyMMdd')}\n`;
      }
      icsContent += `SUMMARY:${evt.name}\n`;
      icsContent += `DESCRIPTION:Type: ${evt.type}\n`;
      icsContent += "END:VEVENT\n";
    });
    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "academic_calendar.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(AI_PROMPT);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

  const handleJsonSubmit = () => {
    try {
      setJsonError(null);
      let parsed;
      try {
        parsed = JSON.parse(jsonInput);
      } catch (e1) {
        // Attempt to sanitize unescaped quotes in AI-generated JSON
        try {
          const sanitizeJsonString = (str: string) => {
            return str.split('\n').map(line => {
              // Match lines that look like "key": "value",
              const match = line.match(/^(\s*"[^"]+"\s*:\s*")(.*)("\s*,?\s*)$/);
              if (match) {
                const prefix = match[1];
                let content = match[2];
                const suffix = match[3];
                // Remove existing escapes and re-escape all quotes
                content = content.replace(/\\"/g, '"').replace(/"/g, '\\"');
                return prefix + content + suffix;
              }
              return line;
            }).join('\n');
          };
          parsed = JSON.parse(sanitizeJsonString(jsonInput));
        } catch (e2) {
          throw new Error("Invalid JSON format.");
        }
      }

      if (!parsed || !Array.isArray(parsed.events)) {
        throw new Error("JSON must have an 'events' array.");
      }

      const events: AcademicEvent[] = parsed.events.map((e: any, idx: number) => {
        if (!e.name) throw new Error(`Event #${idx + 1} is missing a name.`);
        if (!e.startDate) throw new Error(`Event "${e.name}" is missing a startDate.`);
        if (!["EXAM", "HOLIDAY", "EVENT", "FEST", "OTHER"].includes(e.type)) {
          throw new Error(`Event "${e.name}" has invalid type "${e.type}".`);
        }
        return {
          id: Math.random().toString(36).substring(7),
          name: e.name,
          startDate: e.startDate,
          endDate: e.endDate,
          type: e.type
        };
      });

      setAcademicCalendar(events);
      setSyncStatus("SUCCESS");
      setTimeout(() => setSyncStatus("IDLE"), 2000);
      setJsonInput("");
      setActiveTab("NEXT_UP");
    } catch (err: any) {
      setJsonError(err.message);
      setSyncStatus("ERROR");
      setTimeout(() => setSyncStatus("IDLE"), 3000);
    }
  };

  // Next Up Widget Logic
  const criticalEvent = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingExams = academicCalendar
      .filter(evt => evt.type === 'EXAM' && parseLocalDate(evt.startDate) >= today)
      .sort((a, b) => parseLocalDate(a.startDate).getTime() - parseLocalDate(b.startDate).getTime());
    
    if (upcomingExams.length > 0) {
      const daysUntil = Math.ceil((parseLocalDate(upcomingExams[0].startDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntil <= 30) return upcomingExams[0]; // within 30 days to be safe
    }
    return null;
  }, [academicCalendar]);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return academicCalendar
      .filter(evt => {
        if (eventFilter !== "ALL" && evt.type !== eventFilter) return false;
        // Keep events that end in the future, or start in the future
        const evtEnd = evt.endDate ? parseLocalDate(evt.endDate) : parseLocalDate(evt.startDate);
        return evtEnd >= today;
      })
      .sort((a, b) => parseLocalDate(a.startDate).getTime() - parseLocalDate(b.startDate).getTime())
      .slice(0, 3);
  }, [academicCalendar, eventFilter]);

  // Calendar View logic
  const currentMonthDate = new Date(); // In a real app, we'd add state for navigating months. For now, just current month.
  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonthDate)),
    end: endOfWeek(endOfMonth(currentMonthDate))
  });

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = parseLocalDate(dateStr);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customPrismStyles }} />
      <div className="w-full bg-[#1D1D1F] border border-white/5 rounded-[32px] p-6 md:p-8 relative overflow-hidden">
      {/* Header */}
      <div className="relative z-10 flex flex-col items-start gap-5 border-b border-white/[0.05] pb-6 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
              <Calendar className="w-5 h-5 text-white/80" />
              Academic Timeline
            </h3>
            <div className="w-px h-4 bg-white/10" />
            <span className="text-[10px] font-bold tracking-widest text-white/30 uppercase">
              {academicCalendar.length} EVENTS
            </span>
          </div>
        </div>

        {/* Tab Switcher (Exact Timetable UI) */}
        <div className="flex items-center gap-2 overflow-x-auto w-full hide-scrollbar">
          {([
            { key: "NEXT_UP" as const, label: "NEXT UP" },
            { key: "CALENDAR" as const, label: "CALENDAR" },
            { key: "JSON" as const, label: "JSON IMPORT" },
            { key: "AI_PROMPT" as const, label: "AI PROMPT" }
          ]).map(tab => (
            <button 
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-full text-[10px] font-black tracking-widest transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === tab.key 
                  ? "bg-white text-black shadow-lg" 
                  : "bg-white/[0.03] hover:bg-white/[0.06] text-white/40 hover:text-white/80"
              }`}
            >
              {tab.key === "AI_PROMPT" && <Sparkles className="w-3 h-3" />}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          
          {/* ─── NEXT UP WIDGET ─── */}
          {activeTab === "NEXT_UP" && (
            <motion.div
              key="widget"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Hyper-Focus Banner */}
              {criticalEvent && <HyperFocusBanner event={criticalEvent} />}

              {/* Quick Filters and Export Action Bar */}
              {academicCalendar.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/[0.05]">
                  <div className="flex flex-wrap items-center gap-2">
                    <Filter className="w-4 h-4 text-white/40 mr-2" />
                    {(["ALL", "EXAM", "HOLIDAY", "OTHER"] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setEventFilter(f)}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest transition-all ${
                          eventFilter === f 
                            ? "bg-white/10 text-white" 
                            : "bg-transparent text-white/40 hover:bg-white/5 hover:text-white/80"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={exportToICS}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-[10px] font-bold tracking-widest flex items-center gap-2 transition-all shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    EXPORT .ICS
                  </button>
                </div>
              )}
              {academicCalendar.length === 0 ? (
                <div className="p-10 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                  <Calendar className="w-8 h-8 text-white/20 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-white tracking-widest uppercase">No Events Synced</h4>
                  <p className="text-white/40 text-xs mt-2 max-w-sm mx-auto">
                    Use the AI Prompt tab to extract your academic calendar and paste the JSON to activate the countdowns.
                  </p>
                  <button
                    onClick={() => setActiveTab("AI_PROMPT")}
                    className="mt-6 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    SYNC CALENDAR
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {upcomingEvents.length === 0 ? (
                    <div className="col-span-3 p-8 text-center text-white/40 text-xs bg-white/[0.02] rounded-2xl">
                      No upcoming events found.
                    </div>
                  ) : (
                    upcomingEvents.map((evt, idx) => {
                      const daysUntil = getDaysUntil(evt.startDate);
                      const isUrgent = daysUntil <= 7 && daysUntil >= 0;
                      
                      const sDate = parseLocalDate(evt.startDate);
                      const eDate = evt.endDate ? parseLocalDate(evt.endDate) : sDate;
                      eDate.setHours(23, 59, 59, 999);
                      const today = new Date();
                      
                      const isOngoing = isWithinInterval(today, { start: sDate, end: eDate });
                      const totalDuration = differenceInDays(eDate, sDate) + 1;
                      const daysPassed = differenceInDays(today, sDate) + 1;
                      const progressPct = isOngoing ? Math.min(100, Math.max(0, (daysPassed / totalDuration) * 100)) : 0;
                      const isExpanded = expandedEventId === evt.id;
                      
                      return (
                        <div 
                          key={evt.id} 
                          onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                          className={`p-5 rounded-2xl border flex flex-col justify-between relative overflow-hidden group cursor-pointer transition-all ${
                            isUrgent && !isOngoing ? "bg-rose-500/10 border-rose-500/20" : "bg-white/[0.03] border-white/10"
                          } ${isExpanded ? 'col-span-1 md:col-span-3 min-h-[300px]' : ''}`}
                        >
                          {/* Background Icon */}
                          <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
                            {evt.type === "EXAM" ? <FileText className="w-32 h-32" /> :
                             evt.type === "HOLIDAY" ? <Flag className="w-32 h-32" /> :
                             <Calendar className="w-32 h-32" />}
                          </div>
                          
                          <div className="relative z-10 flex justify-between items-start mb-4">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider shadow-sm ${
                              evt.type === "EXAM" ? "bg-[#A855F7]/20 text-[#A855F7] border border-[#A855F7]/20" :
                              evt.type === "HOLIDAY" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" :
                              "bg-[#4F8EF7]/20 text-[#4F8EF7] border border-[#4F8EF7]/20"
                            }`}>
                              {evt.type}
                            </span>
                            {isUrgent && !isOngoing && <span className="flex h-2 w-2 relative">
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                            </span>}
                          </div>
                          <div className="relative z-10">
                            <h4 className={`text-base font-bold ${isUrgent && !isOngoing ? "text-white" : "text-white/90"} leading-snug line-clamp-2`}>{evt.name}</h4>
                            <div className="flex items-center gap-2 mt-3">
                              <span className="text-xl font-black tracking-tighter text-white">
                                {isOngoing ? "ONGOING" : daysUntil === 0 ? "TODAY" : daysUntil}
                              </span>
                              {!isOngoing && daysUntil !== 0 && <span className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">Days</span>}
                            </div>
                            <div className="text-[10px] text-white/40 mt-1.5 font-mono">
                              {format(sDate, 'MMM d, yyyy')} {evt.endDate && evt.endDate !== evt.startDate ? ` \u2192 ${format(eDate, 'MMM d, yyyy')}` : ""}
                            </div>
                          </div>
                          {/* Progress Bar for Ongoing Events */}
                          {isOngoing && (
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
                              <div 
                                className={`h-full ${evt.type === 'EXAM' ? 'bg-[#A855F7]' : evt.type === 'HOLIDAY' ? 'bg-emerald-500' : 'bg-[#4F8EF7]'} shadow-[0_0_10px_rgba(255,255,255,0.5)]`}
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          )}
                          {/* Sub-Task Engine Expansion */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                className="relative z-20 border-t border-white/10 pt-6"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex justify-between items-center mb-4">
                                  <h5 className="text-white font-bold tracking-widest text-xs uppercase flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    Sub-Tasks
                                  </h5>
                                  <button
                                    onClick={() => handleAIGenerate(evt.id, evt.name)}
                                    disabled={isGeneratingId === evt.id}
                                    className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg text-[10px] font-bold tracking-widest flex items-center gap-2 transition-all disabled:opacity-50"
                                  >
                                    <Bot className="w-3 h-3" />
                                    {isGeneratingId === evt.id ? "GENERATING..." : "AI GENERATE"}
                                  </button>
                                </div>
                                
                                <div className="space-y-2">
                                  {evt.subtasks && evt.subtasks.length > 0 ? (
                                    evt.subtasks.map(st => (
                                      <div key={st.id} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-colors">
                                        <button 
                                          onClick={() => toggleSubtask(evt.id, st.id, st.completed)}
                                          className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${st.completed ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-transparent border-white/20 text-transparent'}`}
                                        >
                                          <CheckCircle2 className="w-3 h-3" />
                                        </button>
                                        <span className={`text-sm flex-1 transition-all ${st.completed ? 'text-white/30 line-through' : 'text-white/80'}`}>{st.title}</span>
                                        {!st.completed && (
                                          <button 
                                            onClick={() => handleStartTimer(st.id, st.title)}
                                            className="p-2 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 text-white/40 rounded-lg transition-colors group/timer"
                                          >
                                            <Play className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-center p-6 bg-white/[0.01] border border-white/5 border-dashed rounded-xl">
                                      <p className="text-white/40 text-xs mb-3">No sub-tasks defined. Break this event down to make it manageable.</p>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ─── CALENDAR VIEW ─── */}
          {activeTab === "CALENDAR" && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-bold text-lg tracking-wide capitalize">
                  {format(currentMonthDate, 'MMMM yyyy')}
                </h4>
              </div>

              <div className="bg-[#111] border border-white/[0.05] rounded-2xl overflow-hidden shadow-2xl">
                {/* Days Header */}
                <div className="grid grid-cols-7 border-b border-white/[0.05] bg-[#0A0A0A]">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                    <div key={day} className="py-3 text-center text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Days Grid */}
                <div className="grid grid-cols-7 auto-rows-[100px] sm:auto-rows-[120px] bg-white/[0.02] gap-[1px]">
                  {daysInMonth.map((date, i) => {
                    const isCurrMonth = isSameMonth(date, currentMonthDate);
                    // Find events happening on this date
                    const dayEvents = academicCalendar.filter(evt => {
                      const sDate = parseLocalDate(evt.startDate);
                      const eDate = evt.endDate ? parseLocalDate(evt.endDate) : sDate;
                      eDate.setHours(23, 59, 59, 999);
                      return isWithinInterval(date, { start: sDate, end: eDate });
                    });

                    // Hell Week Calculation
                    const weekStart = startOfWeek(date);
                    const weekEnd = endOfWeek(date);
                    const examsInWeek = academicCalendar.filter(evt => 
                      evt.type === 'EXAM' && isWithinInterval(parseLocalDate(evt.startDate), { start: weekStart, end: weekEnd })
                    ).length;
                    const deadlinesInWeek = academicCalendar.filter(evt => 
                      evt.type === 'DEADLINE' && isWithinInterval(parseLocalDate(evt.startDate), { start: weekStart, end: weekEnd })
                    ).length;
                    const stressScore = (examsInWeek * 3) + (deadlinesInWeek * 2);
                    const isHellWeek = stressScore >= 6; // e.g. 2 exams

                    return (
                      <div 
                        key={date.toISOString()} 
                        onClick={() => setSelectedDate(date)}
                        className={`p-2 relative flex flex-col gap-1 transition-colors hover:bg-white/[0.05] cursor-pointer ${
                          !isCurrMonth ? 'opacity-30' : ''
                        } ${isHellWeek ? 'bg-red-500/[0.02]' : 'bg-[#131313]'}`}
                      >
                        {isHellWeek && (
                          <div className="absolute top-0 left-0 w-full h-full border border-red-500/10 pointer-events-none z-0"></div>
                        )}
                        
                        <div className="relative z-10 flex justify-between items-start mb-1">
                          {isHellWeek && i % 7 === 0 && (
                            <span className="text-[8px] font-black tracking-widest text-red-500/50 uppercase mt-0.5">Hell Week</span>
                          )}
                          <span className={`text-[11px] font-bold self-end ml-auto ${isToday(date) ? 'text-emerald-400 bg-emerald-500/10 w-6 h-6 flex items-center justify-center rounded-full' : 'text-white/60'}`}>
                            {format(date, 'd')}
                          </span>
                        </div>
                        
                        <div className="relative z-10 flex flex-col gap-1 overflow-y-auto hide-scrollbar">
                          {dayEvents.map(evt => (
                            <div key={evt.id} className={`px-1.5 py-0.5 rounded text-[8px] font-bold truncate ${
                              evt.type === 'EXAM' ? 'bg-[#A855F7]/20 text-[#A855F7]' :
                              evt.type === 'HOLIDAY' ? 'bg-emerald-500/20 text-emerald-400' :
                              'bg-[#4F8EF7]/20 text-[#4F8EF7]'
                            }`}>
                              {evt.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Agenda Modal */}
              {isMounted && createPortal(
                <AnimatePresence>
                  {selectedDate && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex justify-center items-end bg-black/60 backdrop-blur-sm"
                    onClick={() => setSelectedDate(null)}
                    onWheel={(e) => e.stopPropagation()}
                  >
                    {(() => {
                      const agendaEvents = academicCalendar.filter(evt => {
                        const sDate = parseLocalDate(evt.startDate);
                        const eDate = evt.endDate ? parseLocalDate(evt.endDate) : sDate;
                        eDate.setHours(23, 59, 59, 999);
                        return isWithinInterval(selectedDate, { start: sDate, end: eDate });
                      });

                      return (
                        <motion.div 
                          initial={{ y: '100%', opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: '100%', opacity: 0 }}
                          transition={{ type: "spring", damping: 25, stiffness: 200 }}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-[#1C1C1E]/95 backdrop-blur-2xl border-t border-x border-white/10 rounded-t-[32px] w-full shadow-[0_-20px_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative h-[85vh]"
                        >
                          {/* iOS Drag Handle */}
                          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-white/20"></div>

                          <button onClick={() => setSelectedDate(null)} className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors z-50">
                            <X className="w-4 h-4 text-white/60" />
                          </button>

                          {/* Header: Date & Intelligence */}
                          <div className="w-full p-8 pt-12 pb-6 flex flex-col">
                            <div>
                              <h3 className="text-3xl font-black tracking-tight text-white leading-none">{format(selectedDate, 'EEEE')}</h3>
                              <p className="text-white/60 font-mono tracking-[0.2em] text-[10px] mt-2 uppercase">{format(selectedDate, 'MMMM do, yyyy')}</p>
                            </div>

                            <div className="mt-6">
                              <div className="text-[9px] font-bold text-white/50 tracking-[0.2em] uppercase mb-3">Market Intelligence</div>
                              
                              <div className="flex gap-4">
                                <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 flex-1">
                                  <div className="text-3xl font-light text-white mb-1">{agendaEvents.length}</div>
                                  <div className="text-[10px] text-white/60">Events</div>
                                </div>
                                <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 flex-1">
                                  <div className="text-lg font-bold text-white mb-1 mt-1">
                                    {agendaEvents.some(e => e.type === 'EXAM') ? 'High' : agendaEvents.length === 0 ? 'Zero' : 'Moderate'}
                                  </div>
                                  <div className="text-[10px] text-white/60 mt-2">Stress Level</div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Body: Scrollable Feed */}
                          <div 
                            className="w-full px-6 md:px-8 pb-8 max-h-[60vh] overflow-y-auto custom-scrollbar overscroll-contain"
                            data-lenis-prevent="true"
                            onWheel={(e) => e.stopPropagation()}
                            onTouchMove={(e) => e.stopPropagation()}
                          >
                            {agendaEvents.length === 0 ? (
                              <div className="h-full flex flex-col items-center justify-center py-10">
                                <Sparkles className="w-6 h-6 text-white/20 mb-4" />
                                <p className="text-white/60 font-bold text-[10px] uppercase tracking-widest">No Events Scheduled</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {agendaEvents.map((evt) => (
                                  <div key={evt.id} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
                                    <div className="flex items-center gap-3 mb-3">
                                      <span className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 px-2 py-1 rounded ${
                                        evt.type === 'EXAM' ? 'bg-[#A855F7]/20 text-[#A855F7]' :
                                        evt.type === 'HOLIDAY' ? 'bg-emerald-400/20 text-emerald-400' :
                                        'bg-[#4F8EF7]/20 text-[#4F8EF7]'
                                      }`}>
                                        {evt.type}
                                      </span>
                                    </div>
                                    <h4 className="text-lg text-white/90 font-bold mb-3">{evt.name}</h4>
                                    
                                    {/* Minimal AI Action Block */}
                                    <div className="mt-4 pt-4 border-t border-white/[0.05]">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Bot className="w-3 h-3 text-white/40" />
                                        <div className="text-[9px] font-bold text-white/50 uppercase tracking-[0.2em]">Auto-Synced AI Context</div>
                                      </div>
                                      <p className="text-[11px] text-white/70 leading-relaxed">
                                        {evt.type === 'EXAM' ? "High priority day. Ensure you have reviewed all mock tests. Aim for 8 hours of sleep the night before." :
                                         evt.type === 'HOLIDAY' ? "Zero stress detected. Disconnect completely to prevent long-term academic burnout." :
                                         "Standard academic event. Review syllabus requirements beforehand."}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>,
              document.body
              )}
            </motion.div>
          )}

          {/* ─── JSON IMPORT TAB ─── */}
          {activeTab === "JSON" && (
            <motion.div
              key="json"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="bg-[#000] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
                {/* Top Bar */}
                <div className="bg-[#0A0A0A] border-b border-white/[0.08] px-3 py-1.5 flex justify-between items-center">
                  <div className="flex gap-1.5 ml-1">
                    <div className="w-3 h-3 rounded-full bg-[#333]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#333]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#333]"></div>
                  </div>
                  <div className="flex items-center gap-2 text-white/30 text-[10px] tracking-wider uppercase font-medium mr-1">
                    <File className="w-3.5 h-3.5 opacity-60" />
                    ACADEMIC_PAYLOAD.JSON
                  </div>
                </div>
                
                {/* Editor Content */}
                <div className="flex w-full h-[240px] bg-transparent relative overflow-y-auto [&::-webkit-scrollbar]:hidden">
                  <div className="w-14 bg-[#050505] py-[24px] flex flex-col items-start pl-4 pr-4 text-[#444] text-xs font-mono select-none shrink-0 h-fit" style={{ lineHeight: '20px' }}>
                    {Array.from({ length: Math.max(12, jsonInput.split('\n').length) }).map((_, i) => <span key={i} className="mb-0">{i + 1}</span>)}
                  </div>
                  <div className="flex-1 w-full relative">
                    <Editor
                      value={jsonInput}
                      onValueChange={code => setJsonInput(code)}
                      highlight={code => Prism.highlight(code, Prism.languages.json, 'json')}
                      padding={24}
                      style={{
                        fontFamily: 'inherit',
                        fontSize: '12px',
                        lineHeight: '20px',
                        backgroundColor: 'transparent',
                        minHeight: '100%',
                      }}
                      textareaProps={{ spellCheck: false, placeholder: "{" }}
                      className="text-xs font-mono outline-none resize-none json-editor text-white"
                    />
                  </div>
                </div>
              </div>

              {jsonError && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start gap-3 text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed font-mono">
                    <strong>Validation Error:</strong> {jsonError}
                  </div>
                </div>
              )}

              {/* PRO TIP Box */}
              <div className="bg-[#181818] border border-white/10 rounded-xl p-4 flex gap-4 items-start">
                <div className="bg-transparent border border-white/[0.15] p-2 rounded-lg shrink-0 shadow-sm">
                  <Bot className="w-4 h-4 text-white/60" />
                </div>
                <div className="text-[11px] leading-relaxed text-white/40">
                  <strong className="text-white">PRO TIP:</strong> Use the <strong className="text-white">AI Prompt</strong> tab to generate a ready-made prompt. Paste it into ChatGPT, Gemini, or Claude along with your university calendar, and copy-paste the output JSON straight into this editor.
                </div>
              </div>

              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-2 text-[11px] text-white/30">
                  <Database className="w-3.5 h-3.5" />
                  Supports: room, batch, faculty, type
                </div>
                <button
                  onClick={handleJsonSubmit}
                  className="px-6 py-3 bg-white text-black rounded-full font-bold text-[11px] tracking-widest hover:bg-white/90 transition-all flex items-center gap-2 shadow-lg"
                >
                  {syncStatus === "SUCCESS" ? <><CheckCircle2 className="w-4 h-4" /> SYNCED</> : 
                   syncStatus === "ERROR" ? <><AlertCircle className="w-4 h-4" /> PARSE ERROR</> :
                   <><Upload className="w-4 h-4" /> IMPORT CALENDAR</>}
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── AI PROMPT TAB ─── */}
          {activeTab === "AI_PROMPT" && (
            <motion.div
              key="prompt"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6"
            >
              {/* Left Column: Terminal shell */}
              <div className="bg-[#000] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[400px]">
                {/* Top Bar */}
                <div className="bg-[#0A0A0A] border-b border-white/[0.08] px-3 py-1.5 flex justify-between items-center shrink-0">
                  <div className="flex gap-1.5 ml-1">
                    <div className="w-3 h-3 rounded-full bg-[#333]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#333]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#333]"></div>
                  </div>
                  <div className="flex items-center gap-2 text-white/20 text-[9px] tracking-widest uppercase font-medium mr-1">
                    <FileText className="w-3.5 h-3.5 opacity-40" />
                    GENERATED_PROMPT.TXT
                  </div>
                </div>
                
                {/* Editor Content */}
                <div className="flex w-full bg-transparent relative overflow-y-auto [&::-webkit-scrollbar]:hidden h-full">
                  <div className="w-14 bg-[#050505] py-[24px] flex flex-col items-start pl-4 pr-4 text-[#444] text-xs font-mono select-none shrink-0 h-fit min-h-full" style={{ lineHeight: '20px' }}>
                    {Array.from({ length: Math.max(13, AI_PROMPT.split('\n').length) }).map((_, i) => <span key={i} className="mb-0">{i + 1}</span>)}
                  </div>
                  <div className="flex-1 w-full relative">
                    <Editor
                      value={AI_PROMPT}
                      onValueChange={() => {}} // Read only
                      highlight={code => Prism.highlight(code, Prism.languages.json, 'json')}
                      padding={24}
                      style={{
                        fontFamily: 'inherit',
                        fontSize: '12px',
                        lineHeight: '20px',
                        backgroundColor: 'transparent',
                        minHeight: '100%',
                      }}
                      readOnly
                      textareaProps={{ spellCheck: false }}
                      className="text-xs font-mono outline-none resize-none json-editor text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Import Steps */}
              <div className="bg-[#131313] border border-white/[0.08] rounded-2xl p-6 flex flex-col justify-between h-[400px]">
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-white" />
                    <h3 className="text-white text-[15px] font-bold tracking-wide">Import Steps</h3>
                  </div>

                  <div className="space-y-5">
                    <div className="flex gap-4 items-start">
                      <div className="w-4 h-4 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[9px] font-bold text-white/40 shrink-0 mt-0.5">1</div>
                      <div className="text-[10px] text-white/40 leading-relaxed tracking-wide">Copy the prompt to your clipboard.</div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="w-4 h-4 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[9px] font-bold text-white/40 shrink-0 mt-0.5">2</div>
                      <div className="text-[10px] text-white/40 leading-relaxed tracking-wide">Paste it into your preferred AI tool with your timetable screenshot.</div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="w-4 h-4 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[9px] font-bold text-white/40 shrink-0 mt-0.5">3</div>
                      <div className="text-[10px] text-white/40 leading-relaxed tracking-wide">Paste the generated JSON into the <strong className="text-white/60 font-bold">JSON Import</strong> tab.</div>
                    </div>
                  </div>

                  <div className="flex items-center w-full justify-between pt-4">
                    <div className="px-4 py-2 rounded-full bg-[#1A1A1A] border border-white/5 flex items-center gap-2 text-[10px] font-bold text-white/40">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> ChatGPT
                    </div>
                    <div className="px-4 py-2 rounded-full bg-[#1A1A1A] border border-white/5 flex items-center gap-2 text-[10px] font-bold text-white/40">
                      <Sparkles className="w-2.5 h-2.5 text-purple-400" /> Gemini
                    </div>
                    <div className="px-4 py-2 rounded-full bg-[#1A1A1A] border border-white/5 flex items-center gap-2 text-[10px] font-bold text-white/40">
                      <div className="w-1.5 h-1.5 rotate-45 bg-amber-500"></div> Claude
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCopyPrompt}
                  className="w-full py-4 bg-white text-black rounded-xl font-extrabold text-[11px] tracking-widest hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-lg mt-4"
                >
                  {promptCopied ? <><CheckCircle2 className="w-4 h-4" /> COPIED</> : <><Copy className="w-4 h-4" /> COPY PROMPT</>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Focus Timer */}
      <AnimatePresence>
        {activeTimerTaskId && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4"
          >
            <div className="bg-[#111]/90 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                  <span className="text-[10px] font-bold text-white/50 tracking-widest uppercase">Focus Session Active</span>
                </div>
                <button 
                  onClick={() => {
                    setIsTimerRunning(false);
                    setActiveTimerTaskId(null);
                  }}
                  className="text-white/40 hover:text-white/80 transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <h4 className="text-white text-xs font-bold truncate max-w-[200px] text-white/80">{activeTimerTaskName}</h4>
                  <div className="text-4xl font-black tracking-tighter text-emerald-400 font-mono mt-1 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                    {Math.floor(timerRemaining / 60).toString().padStart(2, '0')}:{(timerRemaining % 60).toString().padStart(2, '0')}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="w-12 h-12 rounded-xl bg-white text-black flex items-center justify-center hover:bg-white/90 transition-colors shadow-lg"
                  >
                    {isTimerRunning ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-1" />}
                  </button>
                  <button 
                    onClick={() => {
                      setTimerRemaining(25 * 60);
                      setIsTimerRunning(false);
                    }}
                    className="w-12 h-12 rounded-xl bg-white/5 text-white flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10"
                  >
                    <Square className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
