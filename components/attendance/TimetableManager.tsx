"use client";

import React, { useState, useMemo } from "react";
import { useUSMStore, TimetableEntry, TimetableState } from "@/stores/usmStore";
import { 
  Calendar, 
  Upload, 
  Plus, 
  Trash2, 
  Clock, 
  CheckCircle2,
  Copy,
  Sparkles,
  MapPin,
  Users,
  AlertCircle,
  Bot,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Database,
  FileJson,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MagneticWrapper } from "@/components/ui/MagneticWrapper";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-json";
import "prismjs/themes/prism-tomorrow.css";
import HistorySettingsTab from "./HistorySettingsTab";

const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
const BATCHES = ["ALL", "H1", "H2", "H3"] as const;

import { CustomSelect } from "@/components/ui/CustomSelect";

const TimePickerPopover = ({ value, onChange, className = "" }: { value: string; onChange: (v: string) => void; className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hoursContainerRef = React.useRef<HTMLDivElement>(null);
  const minsContainerRef = React.useRef<HTMLDivElement>(null);

  const [hh, mm] = value.split(":");
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const minutes = ["00", "15", "30", "45"];

  React.useEffect(() => {
    if (isOpen) {
      if (hoursContainerRef.current) {
        const hBtn = hoursContainerRef.current.querySelector(`[data-val="${hh}"]`);
        if (hBtn) hBtn.scrollIntoView({ block: "center" });
      }
      if (minsContainerRef.current) {
        const mBtn = minsContainerRef.current.querySelector(`[data-val="${mm}"]`);
        if (mBtn) mBtn.scrollIntoView({ block: "center" });
      }
    }
  }, [isOpen, hh, mm]);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-[65px] flex items-center justify-center gap-1 bg-transparent text-[13px] font-mono font-medium text-white/90 hover:text-white outline-none cursor-pointer rounded px-1 border border-transparent hover:border-white/10 hover:bg-white/[0.02] focus:border-brand/50 focus:bg-brand/5 transition-all"
      >
        {value}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-max bg-[#1a1a1c]/95 backdrop-blur-xl border border-white/[0.08] shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-2xl z-50 overflow-hidden flex p-1.5 gap-1"
            >
              {/* Hours */}
              <div ref={hoursContainerRef} className="h-48 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col gap-0.5 px-0.5 scroll-smooth">
                {hours.map(h => (
                  <button
                    key={`h-${h}`}
                    data-val={h}
                    onClick={() => {
                      onChange(`${h}:${mm}`);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-sm font-mono transition-colors ${h === hh ? "bg-white/[0.1] text-white font-bold" : "text-white/60 hover:bg-white/[0.06] hover:text-white"}`}
                  >
                    {h}
                  </button>
                ))}
              </div>
              <div className="w-[1px] bg-white/5 my-2" />
              {/* Minutes */}
              <div ref={minsContainerRef} className="h-48 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col gap-0.5 px-0.5 scroll-smooth">
                {minutes.map(m => (
                  <button
                    key={`m-${m}`}
                    data-val={m}
                    onClick={() => {
                      onChange(`${hh}:${m}`);
                      setIsOpen(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-sm font-mono transition-colors ${m === mm ? "bg-white/[0.1] text-white font-bold" : "text-white/60 hover:bg-white/[0.06] hover:text-white"}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

function generateAIPrompt(courses: { id: string; code: string; name: string }[]): string {
  const courseList = courses.map(c => `  - "${c.code}" (name: "${c.name}")`).join("\n");
  
  return `I need you to convert my university timetable into a JSON format for Aevos. Here is the exact JSON schema I need:

{
  "monday": [
    {
      "courseId": "<use the exact course code from the list below>",
      "type": "LECTURE" | "PRACTICAL" | "LAB" | "TUTORIAL",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "room": "<room number>",
      "batch": "ALL" | "H1" | "H2" | "H3",
      "faculty": "<faculty name>"
    }
  ],
  "tuesday": [...],
  "wednesday": [...],
  "thursday": [...],
  "friday": [...],
  "saturday": [...]
}

My registered courses are:
${courseList}

RULES:
1. Use ONLY the exact Course Codes from the list above for the courseId field.
2. Use 24-hour time format (e.g., "08:15", "14:30").
3. If a class is for ALL batches, set batch to "ALL".
4. If a class is batch-specific (like H1, H2, H3), set the batch field accordingly.
5. Include room numbers exactly as shown.
6. Include faculty names if visible.
7. Skip BREAK periods (SHORT BREAK, LONG BREAK, LIBRARY).
8. Output ONLY the raw JSON, no explanations.

Here is my timetable (paste your timetable text/image below):
`;
}

export default function TimetableManager({ onClose }: { onClose?: () => void }) {
  const { courses, timetable, setTimetable } = useUSMStore();
  const [activeTab, setActiveTab] = useState<"VISUAL" | "JSON" | "AI_PROMPT" | "AI_SCANNER" | "SETTINGS">("VISUAL");
  const [jsonInput, setJsonInput] = useState("");
  const [syncStatus, setSyncStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">("IDLE");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<string>("ALL");
  const [promptCopied, setPromptCopied] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  
  // Split-pane active day state
  const [selectedDay, setSelectedDay] = useState<typeof DAYS_OF_WEEK[number]>("monday");

  const aiPrompt = useMemo(() => generateAIPrompt(courses), [courses]);

  const addEntry = (day: typeof DAYS_OF_WEEK[number]) => {
    if (courses.length === 0) return;
    const newEntry: TimetableEntry = {
      id: Math.random().toString(36).substring(7),
      courseId: courses[0].id,
      type: "LECTURE",
      startTime: "09:00",
      endTime: "10:00",
      room: "",
      batch: "ALL",
      faculty: ""
    };
    setTimetable({
      [day]: [...(timetable[day] || []), newEntry]
    });
  };

  const removeEntry = (day: typeof DAYS_OF_WEEK[number], entryId: string) => {
    setTimetable({
      [day]: (timetable[day] || []).filter(e => e.id !== entryId)
    });
  };

  const updateEntry = (day: typeof DAYS_OF_WEEK[number], entryId: string, updates: Partial<TimetableEntry>) => {
    setTimetable({
      [day]: (timetable[day] || []).map(e => e.id === entryId ? { ...e, ...updates } : e)
    });
  };

  // Filter entries by batch
  const getFilteredEntries = (day: typeof DAYS_OF_WEEK[number]) => {
    const entries = timetable[day] || [];
    if (selectedBatch === "ALL") return entries;
    return entries.filter(e => !e.batch || e.batch === "ALL" || e.batch === selectedBatch);
  };

  const handleAiScan = async (file: File) => {
    if (!file) return;
    setIsScanning(true);
    setScanError(null);
    try {
      // Convert to base64
      const buffer = await file.arrayBuffer();
      const base64String = Buffer.from(buffer).toString('base64');
      const mimeType = file.type;
      const base64Image = `data:${mimeType};base64,${base64String}`;

      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'timetable',
          image: base64Image,
          courses: courses
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to parse timetable.');
      }

      const parsedTimetable = await response.json();
      
      // We assume the schema validation in the API returns the exact structure we need
      const sanitized: Partial<TimetableState> = {};
      for (const day of Object.keys(parsedTimetable)) {
        if (DAYS_OF_WEEK.includes(day as any)) {
          sanitized[day as keyof TimetableState] = parsedTimetable[day].map((e: any) => ({
            id: Math.random().toString(36).substring(7),
            courseId: e.courseId,
            type: e.type || "LECTURE",
            startTime: e.startTime || "09:00",
            endTime: e.endTime || "10:00",
            room: e.room || "",
            batch: e.batch || "ALL",
            faculty: e.faculty || ""
          }));
        }
      }

      setTimetable(sanitized as TimetableState);
      setActiveTab("VISUAL");
    } catch (err: any) {
      setScanError(err.message || 'Unknown error occurred during scanning.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleJsonSubmit = () => {
    try {
      setJsonError(null);
      
      let parsed;
      try {
        const cleanedJson = jsonInput.replace(/```json/gi, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleanedJson) as Partial<TimetableState>;
      } catch (e) {
        throw new Error("Invalid JSON format. Please ensure you pasted raw JSON without markdown formatting errors.");
      }

      if (!parsed || typeof parsed !== 'object') {
        throw new Error("JSON must be an object containing days of the week.");
      }

      const sanitized: Partial<TimetableState> = {};
      
      for (const day of Object.keys(parsed)) {
        if (!DAYS_OF_WEEK.includes(day as any)) {
          throw new Error(`Invalid day key "${day}". Must be lowercase english day names.`);
        }
        
        const dayKey = day as keyof TimetableState;
        const entries = parsed[dayKey];
        
        if (!Array.isArray(entries)) {
          throw new Error(`The value for "${day}" must be an array of classes.`);
        }

        sanitized[dayKey] = entries.map((e: any, index: number) => {
          if (!e.courseId) throw new Error(`Missing "courseId" for class #${index + 1} on ${day}.`);
          
          // Try to find by ID first, then fallback to checking if they pasted a course code by accident
          let matchedCourse = courses.find(c => c.id === e.courseId || c.code === e.courseId);
          
          if (!matchedCourse) {
            // Auto-create missing courses to give users full flexibility to add entire timetables at once
            matchedCourse = {
              id: e.courseId,
              code: e.courseId.length > 10 ? e.courseId.substring(0, 8).toUpperCase() : e.courseId,
              name: "Imported Class",
              semester: 1,
              credits: 3,
              cieMarks: 0,
              attendanceTotal: 0,
              attendanceBunked: 0
            };
            courses.push(matchedCourse);
            useUSMStore.getState().setCourses([...courses]);
          }
          if (e.startTime && !/^([01]\d|2[0-3]):?([0-5]\d)$/.test(e.startTime)) {
            throw new Error(`Invalid startTime "${e.startTime}" on ${day}. Must be HH:MM format.`);
          }
          
          return {
            id: e.id || Math.random().toString(36).substring(7),
            courseId: matchedCourse.id, // always use the actual resolved ID
            type: e.type || "LECTURE",
            startTime: e.startTime || "09:00",
            endTime: e.endTime || "10:00",
            room: e.room || "",
            batch: e.batch || "ALL",
            faculty: e.faculty || ""
          };
        });
      }

      setTimetable(sanitized);
      setSyncStatus("SUCCESS");
      setTimeout(() => setSyncStatus("IDLE"), 2000);
    } catch (err: any) {
      setJsonError(err.message);
      setSyncStatus("ERROR");
      setTimeout(() => setSyncStatus("IDLE"), 3000);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(aiPrompt);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "LECTURE": return "text-[#C084FC]"; // purple-400
      case "PRACTICAL": return "text-[#60A5FA]"; // blue-400
      case "LAB": return "text-[#4ADE80]"; // green-400
      case "TUTORIAL": return "text-[#FACC15]"; // yellow-400
      default: return "text-white";
    }
  };


  // Count total entries
  const totalEntries = DAYS_OF_WEEK.reduce((acc, day) => acc + (timetable[day]?.length || 0), 0);
  const filteredTotal = DAYS_OF_WEEK.reduce((acc, day) => acc + getFilteredEntries(day).length, 0);

  return (
    <div className="w-full h-full flex flex-col bg-surface border border-white/[0.04] rounded-[32px] p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.05)] relative overflow-hidden">
      
      {/* Header */}
      <div className="relative z-10 flex flex-col gap-5 mb-6">
        {/* Top Row: Context & Global Filter */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          
          <div className="flex items-center gap-4 flex-wrap">
            <h3 className="text-xl font-bold text-white/90 tracking-wide flex items-center gap-2">
              <Calendar className="w-5 h-5 text-white/80" />
              Timetable Intelligence
            </h3>
            
            {/* Inline Stats */}
            {totalEntries > 0 && (
              <div className="flex items-center gap-2.5 border-l border-white/10 pl-4 py-1">
                <span className="text-[10px] font-mono text-white/50 tracking-widest uppercase">
                  {totalEntries} Classes
                </span>
                {selectedBatch !== "ALL" && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="text-[10px] font-mono text-brand/80 tracking-widest uppercase font-bold">
                      {filteredTotal} for {selectedBatch}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Batch Selector */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">BATCH</span>
            <div className="flex bg-[#1a1a1c] p-1 rounded-full border border-white/5 mr-2">
              {BATCHES.map(b => (
                <button
                  key={b}
                  onClick={() => setSelectedBatch(b)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest transition-all ${
                    selectedBatch === b 
                      ? "bg-white text-black shadow-lg" 
                      : "text-white/40 hover:text-white/80 hover:bg-white/5"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Row: Navigation */}
        <div className="flex flex-wrap gap-2">
          <div className="flex bg-white/[0.04] p-1 rounded-full border border-white/[0.04] shadow-inner backdrop-blur-md">
            {([
              { key: "VISUAL" as const, label: "VISUAL EDITOR" },
              { key: "AI_SCANNER" as const, label: "AI SCANNER" },
              { key: "AI_PROMPT" as const, label: "AI PROMPT" },
              { key: "JSON" as const, label: "JSON IMPORT" },
              { key: "SETTINGS" as const, label: "SETTINGS & LOGS" }
            ]).map(tab => (
              <button 
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-full text-[10px] font-bold tracking-wider transition-all flex items-center gap-1.5 ${
                  activeTab === tab.key 
                    ? "bg-white text-black shadow-sm" 
                    : "bg-transparent text-white/50 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {(tab.key === "AI_PROMPT" || tab.key === "AI_SCANNER") && (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          
          {/* ─── VISUAL EDITOR TAB (Split-Pane) ─── */}
          {activeTab === "VISUAL" && (
            <motion.div
              key="visual"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative flex-1 flex flex-col min-h-0"
            >
              {courses.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.03]">
                  <p className="text-white/70 text-sm">Please add courses in the Calculator first to build a timetable.</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col md:flex-row gap-6 border-t border-white/[0.06] pt-6 overflow-hidden min-h-0">
                  
                  {/* LEFT PANE: Days List */}
                  <div 
                    className="w-full md:w-[220px] shrink-0 space-y-1 outline-none focus-visible:ring-2 focus-visible:ring-white/20 bg-background p-2 rounded-3xl shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] border-t border-black/60 border-b border-white/5"
                    onKeyDown={(e) => {
                      const currentIndex = DAYS_OF_WEEK.indexOf(selectedDay);
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setSelectedDay(DAYS_OF_WEEK[(currentIndex + 1) % DAYS_OF_WEEK.length]);
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setSelectedDay(DAYS_OF_WEEK[(currentIndex - 1 + DAYS_OF_WEEK.length) % DAYS_OF_WEEK.length]);
                      }
                    }}
                    tabIndex={0}
                    role="tablist"
                    aria-label="Days of the week"
                  >
                    {DAYS_OF_WEEK.map(day => {
                      const count = getFilteredEntries(day).length;
                      const isActive = selectedDay === day;
                      return (
                        <button
                          key={day}
                          role="tab"
                          aria-selected={isActive}
                          onClick={() => setSelectedDay(day)}
                          className={`w-full relative flex items-center justify-between px-4 py-3 rounded-full transition-colors duration-200 outline-none ${
                            isActive 
                              ? "text-black" 
                              : "text-white/60 hover:text-white/90 hover:bg-white/[0.04]"
                          }`}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="activeDayPill"
                              className="absolute inset-0 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,1)]"
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                          <span className="relative z-10 text-[11px] font-bold uppercase tracking-widest">{day}</span>
                          <div className="relative z-10 flex items-center gap-2">
                            {count > 0 && (
                              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded transition-colors duration-200 ${
                                isActive ? "bg-black/10 text-black font-bold" : "bg-white/[0.08] text-white/60"
                              }`}>
                                {count}
                              </span>
                            )}
                            {isActive && <ChevronRight className="w-3.5 h-3.5 text-black opacity-60" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* RIGHT PANE: Day Editor */}
                  <div className="flex-1 overflow-hidden flex flex-col border border-white/[0.04] bg-surface-raised rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.05)]">
                    {/* Right Pane Header */}
                    <div className="flex justify-between items-center mb-4 border-b border-white/[0.04] pb-4">
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-bold text-white uppercase tracking-widest">{selectedDay}</h4>
                        <span className="text-[10px] text-white/60 font-mono tracking-widest uppercase">
                          {getFilteredEntries(selectedDay).length} CLASSES
                        </span>
                      </div>
                      <MagneticWrapper strength={0.4}>
                        <button 
                          onClick={() => addEntry(selectedDay)}
                          className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-white rounded-full font-bold text-[10px] tracking-widest transition-colors flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5 opacity-90" /> ADD CLASS
                        </button>
                      </MagneticWrapper>
                    </div>

                    {/* Spreadsheet Table Wrapper */}
                    <div className="flex-1 overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 pr-2">
                      {getFilteredEntries(selectedDay).length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center py-12 text-center opacity-70">
                          <Calendar className="w-12 h-12 text-white/40 mb-3" />
                          <p className="text-sm text-white font-medium">No classes scheduled</p>
                          <p className="text-xs text-white/80 mt-1">Enjoy your free day!</p>
                        </div>
                      ) : (
                        <table className="w-full text-left border-collapse min-w-[850px]">
                          <thead>
                            <tr className="border-b border-white/[0.04]">
                              <th className="pb-3 px-4 text-[10px] font-bold text-white/40 uppercase tracking-widest w-[35%]">Course Details</th>
                              <th className="pb-3 px-4 text-[10px] font-bold text-white/40 uppercase tracking-widest w-[25%]">Timing</th>
                              <th className="pb-3 px-4 text-[10px] font-bold text-white/40 uppercase tracking-widest w-[20%]">Location</th>
                              <th className="pb-3 px-4 text-[10px] font-bold text-white/40 uppercase tracking-widest w-[15%]">Batch</th>
                              <th className="pb-3 px-4 text-[10px] font-bold text-white/40 uppercase tracking-widest text-center w-[5%]">Act</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...getFilteredEntries(selectedDay)]
                              .sort((a, b) => a.startTime.localeCompare(b.startTime))
                              .map(entry => (
                                <tr 
                                  key={entry.id} 
                                  className="group hover:bg-white/[0.02] border-b border-white/[0.02] transition-all"
                                >
                                  {/* 1. Course Details */}
                                  <td className="px-4 py-4 align-middle">
                                    <div className="flex items-center gap-3 w-full max-w-[340px]">
                                      <div className="font-bold text-white flex-1 min-w-0">
                                        <CustomSelect 
                                          value={entry.courseId}
                                          options={courses.map(c => ({ label: c.name, value: c.id }))}
                                          onChange={(val) => updateEntry(selectedDay, entry.id, { courseId: val })}
                                        />
                                      </div>
                                      <div className="w-[125px] shrink-0">
                                        <CustomSelect 
                                          value={entry.type}
                                          options={[
                                            { label: "LECTURE", value: "LECTURE" },
                                            { label: "PRACTICAL", value: "PRACTICAL" },
                                            { label: "LAB", value: "LAB" },
                                            { label: "TUTORIAL", value: "TUTORIAL" },
                                          ]}
                                          onChange={(val) => updateEntry(selectedDay, entry.id, { type: val as any })}
                                          buttonClassName="w-full flex items-center justify-between gap-2 bg-transparent outline-none truncate text-left hover:bg-white/[0.04] px-1 py-1.5 rounded transition-all"
                                          dropdownClassName="left-0 w-max min-w-[140px]"
                                          renderSelected={(opt) => (
                                            <div className="flex items-center">
                                              <span className={`text-[9px] font-bold uppercase tracking-widest ${getTypeColor(opt?.value || "LECTURE")}`}>{opt?.label}</span>
                                            </div>
                                          )}
                                          renderOption={(opt) => (
                                            <div className="flex items-center py-0.5">
                                              <span className={`text-[9px] font-bold uppercase tracking-widest ${getTypeColor(opt.value)}`}>{opt.label}</span>
                                            </div>
                                          )}
                                        />
                                      </div>
                                    </div>
                                  </td>

                                  {/* 2. Timing */}
                                  <td className="px-4 py-4 align-middle">
                                    <div className="flex items-center gap-2 w-fit">
                                      <TimePickerPopover 
                                        value={entry.startTime} 
                                        onChange={(val) => updateEntry(selectedDay, entry.id, { startTime: val })} 
                                      />
                                      <span className="text-white/20 text-[10px] font-bold">→</span>
                                      <TimePickerPopover 
                                        value={entry.endTime} 
                                        onChange={(val) => updateEntry(selectedDay, entry.id, { endTime: val })} 
                                      />
                                    </div>
                                  </td>

                                  {/* 3. Location */}
                                  <td className="px-4 py-4 align-middle">
                                    <div className="w-full max-w-[140px]">
                                      <input 
                                        type="text" 
                                        value={entry.room || ""} 
                                        onChange={(e) => updateEntry(selectedDay, entry.id, { room: e.target.value })}
                                        placeholder="Add room..."
                                        className="w-full bg-transparent text-[13px] font-medium text-white/90 hover:text-white outline-none placeholder:text-white/20 truncate transition-all cursor-text rounded px-2 py-1 -ml-2 border border-transparent hover:border-white/10 hover:bg-white/[0.02] focus:border-brand/50 focus:bg-brand/5"
                                      />
                                    </div>
                                  </td>

                                  {/* 4. Batch */}
                                  <td className="px-4 py-4 align-middle">
                                    <div className="w-[85px]">
                                      <CustomSelect 
                                        value={entry.batch || "ALL"}
                                        options={[
                                          { label: "ALL", value: "ALL" },
                                          { label: "H1", value: "H1" },
                                          { label: "H2", value: "H2" },
                                          { label: "H3", value: "H3" },
                                        ]}
                                        onChange={(val) => updateEntry(selectedDay, entry.id, { batch: val })}
                                        buttonClassName="w-full flex items-center justify-between gap-1 bg-transparent outline-none truncate text-left rounded hover:bg-white/[0.04] px-2 py-1 transition-all"
                                        dropdownClassName="right-0 w-max min-w-[80px]"
                                        renderSelected={(opt) => (
                                          <span className="text-[13px] font-medium text-white/90 truncate">{opt?.label}</span>
                                        )}
                                      />
                                    </div>
                                  </td>

                                  {/* 5. Actions */}
                                  <td className="px-4 py-4 align-middle text-center">
                                    <button 
                                      onClick={() => removeEntry(selectedDay, entry.id)}
                                      className="p-2.5 text-white/30 hover:text-rose-400 bg-black/0 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 mx-auto block"
                                      title="Delete Class"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ─── AI SCANNER TAB ─── */}
          {activeTab === "AI_SCANNER" && (
            <motion.div
              key="ai_scanner"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="bg-surface-raised shadow-[0_8px_30px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.05)] border border-white/[0.04] rounded-full relative overflow-hidden flex flex-col md:flex-row items-center justify-between py-4 px-5">
                
                <div className="flex items-center gap-4 text-left">
                  {/* Solid Flat Icon */}
                  <div className="w-12 h-12 shrink-0 rounded-full bg-[#EAB308]/10 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-[#EAB308]" />
                  </div>

                  <div>
                    <h4 className="text-white font-bold text-[15px] mb-0.5">AI Timetable Scanner</h4>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                      Drop a screenshot to automatically build schedule
                    </p>
                  </div>
                </div>
                
                <div className="relative shrink-0 mt-4 md:mt-0 w-full md:w-auto">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleAiScan(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-20"
                    disabled={isScanning || courses.length === 0}
                  />
                  <button 
                    disabled={isScanning || courses.length === 0}
                    className="w-full md:w-auto px-6 py-2 bg-gradient-to-b from-[#FDE047] to-[#EAB308] text-black/90 rounded-full font-medium text-[13px] disabled:opacity-50 hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_2px_10px_rgba(234,179,8,0.2)] border border-[#CA8A04]"
                  >
                    {isScanning ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ANALYZING...
                      </>
                    ) : (
                      "Select Image"
                    )}
                  </button>
                </div>

                {courses.length === 0 && (
                  <div className="absolute inset-0 bg-rose-500/10 backdrop-blur-sm z-30 flex items-center justify-center rounded-full">
                    <span className="text-rose-400 text-[11px] font-bold tracking-widest uppercase bg-black/50 px-4 py-2 rounded-full border border-rose-500/20">
                      Please add courses first
                    </span>
                  </div>
                )}
              </div>

              {scanError && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start gap-3 text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed font-mono">
                    <strong>Scan Failed:</strong> {scanError}
                  </div>
                </div>
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
              className="flex-1 flex flex-col space-y-5 min-h-0"
            >
              {/* Code Editor Container */}
              <div className="flex-1 min-h-0 bg-[#09090b] border border-white/[0.08] focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/20 rounded-2xl overflow-hidden transition-all duration-300 shadow-inner group flex flex-col">
                {/* Editor Header */}
                <div className="bg-background border-b border-white/[0.04] px-4 py-2.5 flex items-center justify-between transition-colors group-focus-within:bg-surface-raised">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                      <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                      <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest flex items-center gap-1.5">
                    <FileJson className="w-3.5 h-3.5 opacity-50" />
                    timetable_payload.json
                  </span>
                </div>
                
                {/* Editor Body */}
                <div className="relative flex-1 min-h-0">
                  <div className="absolute left-0 top-0 bottom-0 w-10 bg-background/50 border-r border-white/[0.02] flex flex-col items-center py-4 text-[10px] font-mono text-white/20 select-none pointer-events-none z-10 overflow-hidden">
                    {Array.from({ length: 50 }).map((_, i) => <span key={i} className="leading-[1.4rem]">{i + 1}</span>)}
                  </div>
                  <Editor 
                    value={jsonInput}
                    onValueChange={code => setJsonInput(code)}
                    highlight={code => Prism.highlight(code, Prism.languages.json, 'json')}
                    padding={16}
                    style={{
                      fontFamily: '"Fira Code", "JetBrains Mono", monospace',
                      fontSize: 13,
                      lineHeight: '1.4rem',
                      paddingLeft: 56,
                      height: '100%',
                      overflowY: 'auto',
                    }}
                    className="w-full bg-transparent text-white/90 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    textareaClassName="outline-none"
                  />
                </div>
              </div>

              {/* Minimal Monochrome Pro Tip */}
              <div className="bg-surface-raised shadow-[0_8px_30px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.05)] border border-white/[0.04] rounded-3xl p-4 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-white/[0.03] flex items-center justify-center shrink-0 border border-white/[0.02]">
                  <Bot className="w-4 h-4 text-white/40" />
                </div>
                <div className="text-[12px] text-white/50 leading-relaxed pt-0.5">
                  <strong className="text-white/80 tracking-wide mr-1 font-bold">PRO TIP:</strong> 
                  Use the <button onClick={() => setActiveTab("AI_PROMPT")} className="text-white/80 hover:text-white font-bold underline underline-offset-4 decoration-white/20 transition-colors mx-1">AI Prompt</button> tab to generate a ready-made prompt. 
                  Paste it into ChatGPT, Gemini, or Claude along with your timetable image, and copy-paste the output JSON straight into this editor.
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

              {/* Footer Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
                <div className="flex items-center gap-2 text-[10px] text-white/30 font-mono bg-surface-raised shadow-inner px-3 py-1.5 rounded-md border border-white/[0.04]">
                  <Database className="w-3.5 h-3.5 opacity-40" />
                  <span>Supports: room, batch, faculty, type</span>
                </div>
                
                <MagneticWrapper strength={0.4}>
                  <button
                    onClick={handleJsonSubmit}
                    className="w-full sm:w-auto px-8 py-3.5 bg-white text-black hover:bg-white/90 rounded-full font-bold text-[12px] tracking-widest transition-transform flex items-center justify-center gap-2.5 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {syncStatus === "SUCCESS" ? <><CheckCircle2 className="w-4 h-4" /> SUCCESSFULLY SYNCED</> : 
                     syncStatus === "ERROR" ? <><AlertCircle className="w-4 h-4 text-black" /> PARSE ERROR</> :
                     <><FileJson className="w-4 h-4 opacity-90" /> IMPORT TIMETABLE</>}
                  </button>
                </MagneticWrapper>
              </div>
            </motion.div>
          )}

          {/* ─── AI PROMPT TAB ─── */}
          {activeTab === "AI_PROMPT" && (
            <motion.div
              key="ai_prompt"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 min-h-0"
            >
              {/* Left Column: Prompt Preview Editor */}
              <div className="bg-[#09090b] border border-white/[0.08] focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/20 rounded-2xl overflow-hidden transition-all duration-300 shadow-inner group flex flex-col min-h-0">
                {/* Editor Header */}
                <div className="bg-background border-b border-white/[0.04] px-4 py-2.5 flex items-center justify-between transition-colors group-focus-within:bg-surface-raised">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                      <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                      <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest flex items-center gap-1.5">
                    <FileJson className="w-3.5 h-3.5 opacity-50" />
                    generated_prompt.txt
                  </span>
                </div>
                
                {/* Editor Body */}
                <div className="relative flex-1 bg-transparent">
                  <div className="absolute left-0 top-0 bottom-0 w-10 bg-background/50 border-r border-white/[0.02] flex flex-col items-center py-4 text-[10px] font-mono text-white/20 select-none pointer-events-none z-10 overflow-hidden">
                    {Array.from({ length: 50 }).map((_, i) => <span key={i} className="leading-[1.4rem]">{i + 1}</span>)}
                  </div>
                  <div className="h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <Editor 
                      value={courses.length === 0 ? "⚠️ No courses found. Please add courses in the Calculator first to generate a personalized AI prompt." : aiPrompt}
                      onValueChange={() => {}}
                      highlight={code => Prism.highlight(code, Prism.languages.json, 'json')}
                      padding={16}
                      style={{
                        fontFamily: '"Fira Code", "JetBrains Mono", monospace',
                        fontSize: 13,
                        lineHeight: '1.4rem',
                        paddingLeft: 56,
                        minHeight: '100%',
                      }}
                      className="w-full bg-transparent text-white/90 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                      textareaClassName="outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Instructions, Links, and Copy Button */}
              <div className="flex flex-col gap-5">
                {/* Minimal Instructions */}
                <div className="bg-surface-raised shadow-[0_8px_30px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.05)] border border-white/[0.04] rounded-3xl p-5 flex-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                    <Bot className="w-4 h-4 text-white/50" />
                    Import Steps
                  </h4>
                  <div className="space-y-4 text-[11px] text-white/60 leading-relaxed">
                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-[9px] font-bold text-white shrink-0 mt-0.5">1</span>
                      <span>Copy the prompt to your clipboard.</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-[9px] font-bold text-white shrink-0 mt-0.5">2</span>
                      <span>Paste it into your preferred AI tool with your timetable screenshot.</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-[9px] font-bold text-white shrink-0 mt-0.5">3</span>
                      <span>Paste the generated JSON into the <button onClick={() => setActiveTab("JSON")} className="text-white hover:underline font-bold underline-offset-2">JSON Import</button> tab.</span>
                    </div>
                  </div>
                </div>

                {/* AI Quick Links */}
                <div className="flex gap-2">
                  {[
                    { name: "ChatGPT", url: "https://chatgpt.com", color: "#10A37F", icon: "●" },
                    { name: "Gemini", url: "https://gemini.google.com", color: "#8B5CF6", icon: "✦" },
                    { name: "Claude", url: "https://claude.ai", color: "#D4A574", icon: "⯁" }
                  ].map(tool => (
                    <a
                      key={tool.name}
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-3.5 bg-background hover:bg-surface-raised border border-white/[0.05] hover:border-white/[0.15] rounded-full text-[10px] font-bold tracking-widest text-white/50 hover:text-white transition-all duration-300 group hover:shadow-[0_0_15px_rgba(255,255,255,0.03)]"
                    >
                      <span style={{ color: tool.color }} className="text-[12px] leading-none opacity-80 group-hover:opacity-100 group-hover:scale-125 transition-all drop-shadow-md">
                        {tool.icon}
                      </span>
                      {tool.name}
                    </a>
                  ))}
                </div>

                {/* Copy Button */}
                <MagneticWrapper strength={0.4}>
                  <button
                    onClick={handleCopyPrompt}
                    disabled={courses.length === 0}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white text-black hover:bg-white/90 rounded-2xl font-bold text-[11px] tracking-widest transition-transform disabled:opacity-30 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
                  >
                    {promptCopied ? (
                      <><CheckCircle2 className="w-4 h-4" /> COPIED!</>
                    ) : (
                      <><Copy className="w-4 h-4" /> COPY PROMPT</>
                    )}
                  </button>
                </MagneticWrapper>
              </div>
            </motion.div>
          )}

          {/* ─── SETTINGS & LOGS TAB ─── */}
          {activeTab === "SETTINGS" && (
            <HistorySettingsTab />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
