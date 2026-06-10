"use client";

import React, { useState, useMemo } from "react";
import { useUSMStore, AcademicEvent } from "@/stores/usmStore";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Upload, Copy, CheckCircle2, AlertCircle, Sparkles, Clock, MapPin, Flag } from "lucide-react";

const AI_PROMPT = `I am giving you an image/PDF of my university's academic calendar.
Please extract all the events and return them EXACTLY in this JSON format:
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
}

Rules:
1. "type" MUST be one of: "EXAM", "HOLIDAY", "EVENT", "FEST", "OTHER".
2. "endDate" is optional. If it's a single day event, just provide "startDate".
3. Return ONLY valid JSON. Escape any internal double quotes with a backslash (\\"). No markdown formatting or explanations.`;

export default function CalendarManager() {
  const { academicCalendar, setAcademicCalendar } = useUSMStore();
  const [activeTab, setActiveTab] = useState<"WIDGET" | "JSON" | "AI_PROMPT">("WIDGET");
  const [jsonInput, setJsonInput] = useState("");
  const [syncStatus, setSyncStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">("IDLE");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [promptCopied, setPromptCopied] = useState(false);

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
      } catch (e) {
        throw new Error("Invalid JSON format.");
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
      setActiveTab("WIDGET");
    } catch (err: any) {
      setJsonError(err.message);
      setSyncStatus("ERROR");
      setTimeout(() => setSyncStatus("IDLE"), 3000);
    }
  };

  // Safe local date parsing to avoid UTC offset issues
  const parseLocalDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  // Next Up Widget Logic
  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return academicCalendar
      .filter(evt => parseLocalDate(evt.startDate) >= today)
      .sort((a, b) => parseLocalDate(a.startDate).getTime() - parseLocalDate(b.startDate).getTime())
      .slice(0, 3);
  }, [academicCalendar]);

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = parseLocalDate(dateStr);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="w-full bg-[#1D1D1F] border border-white/5 rounded-[32px] p-6 md:p-8 relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#4F8EF7]/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div>
          <h3 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#4F8EF7] drop-shadow-[0_0_8px_rgba(79,142,247,0.5)]" />
            Academic Timeline
          </h3>
          <p className="text-xs text-white/40 mt-1.5 max-w-md leading-relaxed">
            Sync your university's calendar to automatically manage Holiday Pauses and track upcoming exams.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/[0.04] border border-white/[0.05] p-1 rounded-xl w-fit shrink-0">
          {([
            { key: "WIDGET" as const, label: "NEXT UP" },
            { key: "JSON" as const, label: "IMPORT JSON" },
            { key: "AI_PROMPT" as const, label: "AI PROMPT" }
          ]).map(tab => (
            <button 
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-lg text-[11px] font-bold tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === tab.key ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/70"
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
          {activeTab === "WIDGET" && (
            <motion.div
              key="widget"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
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
                      const isUrgent = daysUntil <= 7;
                      return (
                        <div key={evt.id} className={`p-5 rounded-2xl border flex flex-col justify-between ${
                          isUrgent ? "bg-rose-500/10 border-rose-500/20" : "bg-white/[0.03] border-white/10"
                        }`}>
                          <div className="flex justify-between items-start mb-4">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md tracking-wider ${
                              evt.type === "EXAM" ? "bg-[#A855F7]/20 text-[#A855F7]" :
                              evt.type === "HOLIDAY" ? "bg-emerald-500/20 text-emerald-400" :
                              "bg-[#4F8EF7]/20 text-[#4F8EF7]"
                            }`}>
                              {evt.type}
                            </span>
                            {isUrgent && <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                            </span>}
                          </div>
                          <div>
                            <h4 className={`text-base font-bold ${isUrgent ? "text-white" : "text-white/80"}`}>{evt.name}</h4>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xl font-black tracking-tighter text-white">
                                {daysUntil === 0 ? "TODAY" : daysUntil}
                              </span>
                              {daysUntil !== 0 && <span className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">Days</span>}
                            </div>
                            <div className="text-[10px] text-white/40 mt-1 font-mono">
                              {evt.startDate} {evt.endDate ? `→ ${evt.endDate}` : ""}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
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
                  placeholder="Paste your calendar JSON here..."
                  className="w-full h-56 bg-transparent text-xs font-mono text-white/70 outline-none resize-none placeholder:text-white/15 leading-relaxed"
                />
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
                  <span>Automatically syncs holidays to Attendance Engine</span>
                </div>
                <button
                  onClick={handleJsonSubmit}
                  className="px-6 py-2.5 bg-[#4F8EF7]/20 text-[#4F8EF7] border border-[#4F8EF7]/30 rounded-xl font-bold text-[11px] tracking-wider hover:bg-[#4F8EF7]/30 transition-all flex items-center gap-2"
                >
                  {syncStatus === "SUCCESS" ? <><CheckCircle2 className="w-4 h-4" /> SYNCED</> : 
                   syncStatus === "ERROR" ? <><AlertCircle className="w-4 h-4 text-rose-400" /> PARSE ERROR</> :
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
              className="space-y-4"
            >
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 relative group">
                <textarea 
                  value={AI_PROMPT}
                  readOnly
                  className="w-full h-56 bg-transparent text-xs font-mono text-white/70 outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleCopyPrompt}
                  className="px-6 py-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold text-[11px] tracking-wider hover:bg-emerald-500/30 transition-all flex items-center gap-2"
                >
                  {promptCopied ? <><CheckCircle2 className="w-4 h-4" /> COPIED!</> : <><Copy className="w-4 h-4" /> COPY PROMPT</>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
