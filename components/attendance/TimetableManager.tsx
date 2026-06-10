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
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import HistorySettingsTab from "./HistorySettingsTab";

const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
const BATCHES = ["ALL", "H1", "H2", "H3"] as const;

function generateAIPrompt(courses: { id: string; code: string; name: string }[]): string {
  const courseList = courses.map(c => `  - "${c.code}" (courseId: "${c.id}", name: "${c.name}")`).join("\n");
  
  return `I need you to convert my university timetable into a JSON format for GradeFlow. Here is the exact JSON schema I need:

{
  "monday": [
    {
      "courseId": "<use the courseId from the list below>",
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
1. Use ONLY the courseId values from the list above.
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

export default function TimetableManager() {
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
        parsed = JSON.parse(jsonInput) as Partial<TimetableState>;
      } catch (e) {
        throw new Error("Invalid JSON format. Please check your syntax.");
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
          if (!courses.find(c => c.id === e.courseId)) {
            throw new Error(`Invalid "courseId" "${e.courseId}" on ${day}. It does not match any of your registered courses.`);
          }
          if (e.startTime && !/^([01]\d|2[0-3]):?([0-5]\d)$/.test(e.startTime)) {
            throw new Error(`Invalid startTime "${e.startTime}" on ${day}. Must be HH:MM format.`);
          }
          
          return {
            id: e.id || Math.random().toString(36).substring(7),
            courseId: e.courseId,
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
      case "LECTURE": return "text-[#A855F7] border-[#A855F7]/30 bg-[#A855F7]/10";
      case "PRACTICAL": return "text-[#4F8EF7] border-[#4F8EF7]/30 bg-[#4F8EF7]/10";
      case "LAB": return "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
      case "TUTORIAL": return "text-amber-400 border-amber-400/30 bg-amber-400/10";
      default: return "text-white border-white/20 bg-white/5";
    }
  };

  // Count total entries
  const totalEntries = DAYS_OF_WEEK.reduce((acc, day) => acc + (timetable[day]?.length || 0), 0);
  const filteredTotal = DAYS_OF_WEEK.reduce((acc, day) => acc + getFilteredEntries(day).length, 0);

  return (
    <div className="w-full bg-[#1D1D1F] border border-white/5 rounded-[2rem] p-6 md:p-8 shadow-none relative overflow-hidden">
      
      {/* Header */}
      <div className="relative z-10 flex flex-col gap-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#A855F7]" />
              Timetable Intelligence
            </h3>
            <p className="text-xs text-white/40 mt-1.5 max-w-lg leading-relaxed">
              Configure your weekly schedule to enable AI Auto-Pilot, daily standup prompts, and smart placement planning. Select your batch to see only your classes.
            </p>
            {totalEntries > 0 && (
              <div className="flex items-center gap-3 mt-3">
                <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                  {totalEntries} TOTAL CLASSES
                </span>
                {selectedBatch !== "ALL" && (
                  <span className="text-[10px] font-mono text-[#A855F7]/80 bg-[#A855F7]/10 border border-[#A855F7]/20 px-2.5 py-1 rounded-lg">
                    {filteredTotal} FOR {selectedBatch}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Batch Selector */}
          <div className="flex flex-col gap-2">
            <span className="text-[9px] uppercase font-bold text-white/40 tracking-widest">Your Batch</span>
            <div className="flex bg-white/[0.04] border border-white/[0.06] p-1 rounded-xl">
              {BATCHES.map(batch => (
                <button
                  key={batch}
                  onClick={() => setSelectedBatch(batch)}
                  className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold tracking-wider transition-all ${
                    selectedBatch === batch 
                      ? "bg-[#A855F7]/20 text-[#A855F7] shadow-[0_0_10px_rgba(168,85,247,0.15)] border border-[#A855F7]/30" 
                      : "text-white/40 hover:text-white/70 border border-transparent"
                  }`}
                >
                  {batch}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/[0.04] border border-white/[0.05] p-1 rounded-xl w-fit">
          {([
            { key: "VISUAL" as const, label: "VISUAL EDITOR" },
            { key: "AI_SCANNER" as const, label: "AI SCANNER" },
            { key: "JSON" as const, label: "JSON IMPORT" },
            { key: "AI_PROMPT" as const, label: "AI PROMPT" },
            { key: "SETTINGS" as const, label: "SETTINGS & LOGS" }
          ]).map(tab => (
            <button 
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-lg text-[11px] font-bold tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === tab.key 
                  ? tab.key === "AI_SCANNER" 
                    ? "bg-gradient-to-r from-[#A855F7]/20 to-[#4F8EF7]/20 text-white shadow-sm border border-white/10" 
                    : "bg-white/10 text-white shadow-sm" 
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {(tab.key === "AI_PROMPT" || tab.key === "AI_SCANNER") && <Sparkles className={`w-3 h-3 ${tab.key === "AI_SCANNER" ? "text-[#A855F7]" : ""}`} />}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          
          {/* ─── VISUAL EDITOR TAB (Split-Pane) ─── */}
          {activeTab === "VISUAL" && (
            <motion.div
              key="visual"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative"
            >
              {courses.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                  <p className="text-white/50 text-sm">Please add courses in the Calculator first to build a timetable.</p>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-6 bg-white/[0.015] border border-white/[0.05] rounded-2xl overflow-hidden min-h-[400px]">
                  
                  {/* LEFT PANE: Days List */}
                  <div className="w-full md:w-[220px] shrink-0 border-b md:border-b-0 md:border-r border-white/20 bg-black/20 p-4 space-y-1">
                    {DAYS_OF_WEEK.map(day => {
                      const count = getFilteredEntries(day).length;
                      const isActive = selectedDay === day;
                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedDay(day)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                            isActive 
                              ? "bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] text-white" 
                              : "hover:bg-white/[0.04] text-white/50 hover:text-white/80"
                          }`}
                        >
                          <span className="text-[11px] font-bold uppercase tracking-widest">{day}</span>
                          <div className="flex items-center gap-2">
                            {count > 0 && (
                              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                isActive ? "bg-[#A855F7]/20 text-[#A855F7]" : "bg-white/[0.05] text-white/40"
                              }`}>
                                {count}
                              </span>
                            )}
                            {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* RIGHT PANE: Day Editor */}
                  <div className="flex-1 p-4 md:p-6 overflow-hidden flex flex-col">
                    {/* Right Pane Header */}
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-bold text-white uppercase tracking-widest">{selectedDay}</h4>
                        <span className="text-xs text-white/40 font-mono bg-white/[0.03] px-2 py-1 rounded-lg">
                          {getFilteredEntries(selectedDay).length} CLASSES
                        </span>
                      </div>
                      <button 
                        onClick={() => addEntry(selectedDay)}
                        className="px-4 py-2 bg-[#A855F7]/10 hover:bg-[#A855F7]/20 text-[#A855F7] border border-[#A855F7]/30 rounded-xl font-bold text-[10px] tracking-wider transition-colors flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> ADD CLASS
                      </button>
                    </div>

                    {/* Classes List */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 space-y-3 pr-2">
                      {getFilteredEntries(selectedDay).length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center py-12 text-center opacity-50">
                          <Calendar className="w-12 h-12 text-white/20 mb-3" />
                          <p className="text-sm text-white font-medium">No classes scheduled</p>
                          <p className="text-xs text-white/60 mt-1">Enjoy your free day!</p>
                        </div>
                      ) : (
                        [...getFilteredEntries(selectedDay)]
                          .sort((a, b) => a.startTime.localeCompare(b.startTime))
                          .map(entry => (
                            <div 
                              key={entry.id} 
                              className="group bg-white/[0.02] border border-white/[0.05] hover:border-white/10 hover:bg-white/[0.04] transition-colors rounded-xl p-3 flex flex-wrap lg:flex-nowrap items-center gap-3 relative"
                            >
                              {/* Type Indicator Line */}
                              <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r bg-white/20 group-hover:bg-white/40 transition-colors" />

                              {/* Course Select */}
                              <div className="w-full lg:w-48 xl:w-64 pl-3">
                                <select 
                                  value={entry.courseId}
                                  onChange={(e) => updateEntry(selectedDay, entry.id, { courseId: e.target.value })}
                                  className="w-full bg-transparent text-sm font-bold text-white outline-none cursor-pointer appearance-none truncate"
                                >
                                  {courses.map(c => (
                                    <option key={c.id} value={c.id} className="bg-[#131C31] text-white">{c.code} — {c.name}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Type Select */}
                              <div className="w-28 shrink-0">
                                <select 
                                  value={entry.type}
                                  onChange={(e) => updateEntry(selectedDay, entry.id, { type: e.target.value as any })}
                                  className={`w-full px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer appearance-none border transition-colors ${getTypeColor(entry.type)}`}
                                >
                                  <option value="LECTURE" className="bg-[#131C31] text-white">LECTURE</option>
                                  <option value="PRACTICAL" className="bg-[#131C31] text-white">PRACTICAL</option>
                                  <option value="LAB" className="bg-[#131C31] text-white">LAB</option>
                                  <option value="TUTORIAL" className="bg-[#131C31] text-white">TUTORIAL</option>
                                </select>
                              </div>

                              {/* Time Input */}
                              <div className="flex items-center gap-1.5 bg-black/20 rounded-lg px-2.5 py-1.5 shrink-0 border border-white/[0.05]">
                                <Clock className="w-3 h-3 text-white/30" />
                                <input 
                                  type="time" 
                                  value={entry.startTime} 
                                  onChange={(e) => updateEntry(selectedDay, entry.id, { startTime: e.target.value })} 
                                  className="bg-transparent text-[11px] font-mono text-white/70 outline-none w-[54px]" 
                                />
                                <span className="text-white/20 text-[10px]">—</span>
                                <input 
                                  type="time" 
                                  value={entry.endTime} 
                                  onChange={(e) => updateEntry(selectedDay, entry.id, { endTime: e.target.value })} 
                                  className="bg-transparent text-[11px] font-mono text-white/70 outline-none w-[54px]" 
                                />
                              </div>

                              {/* Room & Batch (Grow to fill) */}
                              <div className="flex flex-1 items-center gap-2 min-w-[150px]">
                                <div className="flex-1 flex items-center gap-1.5 bg-black/20 rounded-lg px-2.5 py-1.5 border border-white/[0.05]">
                                  <MapPin className="w-3 h-3 text-white/30 shrink-0" />
                                  <input 
                                    type="text" 
                                    value={entry.room || ""} 
                                    onChange={(e) => updateEntry(selectedDay, entry.id, { room: e.target.value })}
                                    placeholder="Room..."
                                    className="w-full bg-transparent text-[11px] text-white/70 outline-none placeholder:text-white/20 truncate"
                                  />
                                </div>
                                <div className="w-20 flex items-center gap-1.5 bg-black/20 rounded-lg px-2.5 py-1.5 border border-white/[0.05]">
                                  <Users className="w-3 h-3 text-white/30 shrink-0" />
                                  <select 
                                    value={entry.batch || "ALL"}
                                    onChange={(e) => updateEntry(selectedDay, entry.id, { batch: e.target.value })}
                                    className="w-full bg-transparent text-[11px] text-white/70 outline-none cursor-pointer appearance-none"
                                  >
                                    <option value="ALL" className="bg-[#131C31]">ALL</option>
                                    <option value="H1" className="bg-[#131C31]">H1</option>
                                    <option value="H2" className="bg-[#131C31]">H2</option>
                                    <option value="H3" className="bg-[#131C31]">H3</option>
                                  </select>
                                </div>
                              </div>

                              {/* Delete Action */}
                              <button 
                                onClick={() => removeEntry(selectedDay, entry.id)}
                                className="p-2 ml-auto text-white/20 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0"
                                title="Delete Class"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                        ))
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
              <div className="bg-gradient-to-br from-[#131C31] to-[#1D1D1F] border border-[#A855F7]/20 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[#A855F7]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="relative z-10 flex flex-col items-center justify-center text-center py-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#A855F7]/20 to-[#4F8EF7]/20 border border-white/10 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(168,85,247,0.15)] relative">
                    <Sparkles className="w-8 h-8 text-[#A855F7] absolute -top-2 -right-2 drop-shadow-md" />
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-white font-bold text-lg mb-2">Upload Timetable Image</h4>
                  <p className="text-white/50 text-sm max-w-sm mb-6">
                    Drop a screenshot of your timetable here. Our AI will automatically parse it and build your visual schedule.
                  </p>
                  
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleAiScan(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      disabled={isScanning || courses.length === 0}
                    />
                    <button 
                      disabled={isScanning || courses.length === 0}
                      className="px-6 py-3 bg-gradient-to-r from-[#A855F7] to-[#4F8EF7] text-white rounded-xl font-bold text-xs tracking-wider disabled:opacity-50 transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center gap-2"
                    >
                      {isScanning ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ANALYZING IMAGE...
                        </>
                      ) : (
                        "SELECT IMAGE"
                      )}
                    </button>
                  </div>
                  
                  {courses.length === 0 && (
                    <div className="mt-4 text-rose-400 text-xs font-bold bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
                      Please add your courses first before scanning a timetable!
                    </div>
                  )}
                </div>
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
              className="space-y-4"
            >
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4">
                <textarea 
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder='Paste your timetable JSON here...

{
  "monday": [
    { "courseId": "...", "type": "LECTURE", "startTime": "08:15", "endTime": "09:15", "room": "B-218", "batch": "ALL", "faculty": "Dr. Name" }
  ],
  "tuesday": [...],
  ...
}'
                  className="w-full h-56 bg-transparent text-xs font-mono text-white/70 outline-none resize-none placeholder:text-white/15 leading-relaxed"
                />
              </div>

              <div className="bg-[#4F8EF7]/5 border border-[#4F8EF7]/10 rounded-xl p-4 flex items-start gap-3">
                <Bot className="w-4 h-4 text-[#4F8EF7] mt-0.5 shrink-0" />
                <div className="text-[11px] text-[#4F8EF7]/80 leading-relaxed">
                  <strong className="text-[#4F8EF7]">Pro Tip:</strong> Use the <button onClick={() => setActiveTab("AI_PROMPT")} className="underline underline-offset-2 font-bold hover:text-white transition-colors">AI Prompt</button> tab to generate a ready-made prompt. Copy it, paste into ChatGPT, Gemini, or Claude along with your timetable image, and paste the output JSON here.
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

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-[10px] text-white/30 font-mono">
                  <span>Supports: room, batch, faculty, type fields</span>
                </div>
                <button
                  onClick={handleJsonSubmit}
                  className="px-6 py-2.5 bg-[#A855F7]/20 text-[#A855F7] border border-[#A855F7]/30 rounded-xl font-bold text-[11px] tracking-wider hover:bg-[#A855F7]/30 transition-all flex items-center gap-2"
                >
                  {syncStatus === "SUCCESS" ? <><CheckCircle2 className="w-4 h-4" /> SYNCED</> : 
                   syncStatus === "ERROR" ? <><AlertCircle className="w-4 h-4 text-rose-400" /> PARSE ERROR</> :
                   <><Upload className="w-4 h-4" /> IMPORT JSON</>}
                </button>
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
              className="space-y-5"
            >
              {/* Instruction Banner */}
              <div className="bg-gradient-to-r from-[#A855F7]/10 to-[#4F8EF7]/10 border border-[#A855F7]/15 rounded-2xl p-5">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-[#A855F7]" />
                  AI-Powered Timetable Import
                </h4>
                <div className="space-y-3 text-[11px] text-white/60 leading-relaxed">
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5">1</span>
                    <span>Click <strong className="text-white">Copy AI Prompt</strong> below to copy the pre-built prompt to your clipboard.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5">2</span>
                    <span>Open your preferred AI tool and paste the prompt along with your timetable screenshot or text.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5">3</span>
                    <span>Copy the generated JSON output and paste it into the <button onClick={() => setActiveTab("JSON")} className="text-[#4F8EF7] underline underline-offset-2 font-bold hover:text-white transition-colors">JSON Import</button> tab.</span>
                  </div>
                </div>
              </div>

              {/* AI Tool Quick Links */}
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "ChatGPT", url: "https://chatgpt.com", color: "#10A37F" },
                  { name: "Gemini", url: "https://gemini.google.com", color: "#4285F4" },
                  { name: "Claude", url: "https://claude.ai", color: "#D4A574" }
                ].map(tool => (
                  <a
                    key={tool.name}
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg text-[10px] font-bold tracking-wider text-white/60 hover:text-white transition-all"
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tool.color }} />
                    {tool.name}
                    <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                  </a>
                ))}
              </div>

              {/* Pre-built Prompt Preview */}
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden">
                <div className="flex justify-between items-center px-4 py-3 border-b border-white/20 bg-white/[0.02]">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Generated Prompt Preview</span>
                  <span className="text-[9px] font-mono text-white/30">{courses.length} courses detected</span>
                </div>
                <pre className="p-4 text-[11px] font-mono text-white/50 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                  {courses.length === 0 
                    ? "⚠️ No courses found. Please add courses in the Calculator first to generate a personalized AI prompt."
                    : aiPrompt
                  }
                </pre>
              </div>

              {/* Copy Button */}
              <button
                onClick={handleCopyPrompt}
                disabled={courses.length === 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#A855F7]/20 to-[#4F8EF7]/20 hover:from-[#A855F7]/30 hover:to-[#4F8EF7]/30 text-white border border-[#A855F7]/30 rounded-xl font-bold text-xs tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(168,85,247,0.1)] hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]"
              >
                {promptCopied ? (
                  <><CheckCircle2 className="w-4 h-4 text-emerald-400" /> COPIED TO CLIPBOARD!</>
                ) : (
                  <><Copy className="w-4 h-4" /> COPY AI PROMPT</>
                )}
              </button>
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
