"use client";

import React, { useState } from "react";
import { useUSMStore } from "@/stores/usmStore";
import { motion, AnimatePresence } from "framer-motion";
import { History, ShieldAlert, Download, Upload, RotateCcw, CalendarOff, Trash2, CheckCircle } from "lucide-react";

export default function HistorySettingsTab() {
  const { attendanceHistory, undoAttendanceHistoryEvent, holidays, addHoliday, removeHoliday, courses } = useUSMStore();
  const [newHoliday, setNewHoliday] = useState("");
  const [importStatus, setImportStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">("IDLE");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = localStorage.getItem("gradeflow-usm-storage");
    if (!dataStr) return;
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gradeflow_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed || !parsed.state) throw new Error("Invalid format");
        localStorage.setItem("gradeflow-usm-storage", JSON.stringify(parsed));
        setImportStatus("SUCCESS");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch {
        setImportStatus("ERROR");
        setTimeout(() => setImportStatus("IDLE"), 2000);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleAddHoliday = () => {
    if (newHoliday && /^\d{4}-\d{2}-\d{2}$/.test(newHoliday)) {
      addHoliday(newHoliday);
      setNewHoliday("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10 items-start"
    >
      {/* --- LEFT COLUMN: Dense Utility Widgets --- */}
      <div className="flex flex-col gap-4">
        {/* Data Management Group */}
        <div className="bg-[#121214] border border-white/[0.04] rounded-3xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-white/[0.02] flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-full bg-[#4F8EF7]/10 flex items-center justify-center border border-[#4F8EF7]/20 shrink-0">
               <ShieldAlert className="w-4 h-4 text-[#4F8EF7]" />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-white tracking-wide">Data Management</h4>
              <p className="text-[11px] text-white/40 mt-0.5">Secure your GradeFlow profile.</p>
            </div>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3">
            <button onClick={handleExport} className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold tracking-widest transition-all">
              <Download className="w-3.5 h-3.5" /> EXPORT
            </button>
            <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImportFile} />
            <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold tracking-widest transition-all">
              {importStatus === "SUCCESS" ? <><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> RESTORED</> : importStatus === "ERROR" ? "INVALID" : <><Upload className="w-3.5 h-3.5" /> RESTORE</>}
            </button>
          </div>
        </div>

        {/* Holiday Pauses Group */}
        <div className="bg-[#121214] border border-white/[0.04] rounded-3xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-white/[0.02] flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-full bg-[#A855F7]/10 flex items-center justify-center border border-[#A855F7]/20 shrink-0">
               <CalendarOff className="w-4 h-4 text-[#A855F7]" />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-white tracking-wide">Holiday Pauses</h4>
              <p className="text-[11px] text-white/40 mt-0.5">Skip these dates in Bunk calculation.</p>
            </div>
          </div>
          <div className="p-5 flex flex-col gap-3">
            <div className="flex gap-3">
              <input 
                type="date"
                value={newHoliday}
                onChange={(e) => setNewHoliday(e.target.value)}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-[11px] text-white outline-none"
              />
              <button onClick={handleAddHoliday} className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[11px] font-bold transition-colors tracking-widest">
                ADD
              </button>
            </div>
            {holidays.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {holidays.map(h => (
                  <div key={h} className="flex items-center gap-1.5 bg-black/40 border border-white/10 px-2.5 py-1.5 rounded-lg text-[10px] text-white/70 font-mono">
                    {h}
                    <button onClick={() => removeHoliday(h)} className="hover:text-rose-400 ml-0.5"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone Group */}
        <div className="bg-rose-500/[0.02] border border-rose-500/10 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-rose-500/10 flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shrink-0">
               <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-rose-400 tracking-wide">Danger Zone</h4>
              <p className="text-[11px] text-rose-400/60 mt-0.5">Permanently wipe your schedule.</p>
            </div>
          </div>
          <div className="p-5">
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to reset your timetable schedule? This will clear all your weekly classes.")) {
                  useUSMStore.getState().setTimetable({
                    monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
                  });
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl text-[10px] tracking-widest font-bold transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" /> RESET TIMETABLE
            </button>
          </div>
        </div>
      </div>

      {/* --- RIGHT COLUMN: Dedicated Activity Log --- */}
      <div className="bg-[#121214] border border-white/[0.04] rounded-3xl overflow-hidden shadow-sm flex flex-col max-h-[500px]">
        <div className="flex items-center gap-3.5 p-5 border-b border-white/[0.02] shrink-0">
          <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
             <History className="w-4 h-4 text-white/60" />
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-white tracking-wide">Activity Log</h4>
            <p className="text-[11px] text-white/40 mt-0.5">Recent attendance actions. You can undo mistakes here.</p>
          </div>
        </div>
        <div className="p-3 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {attendanceHistory.length === 0 ? (
            <div className="text-center text-white/30 text-xs py-10 font-mono tracking-widest uppercase">No recent activity</div>
          ) : (
            <div className="flex flex-col gap-1">
              {attendanceHistory.slice(0, 20).map(evt => {
                const course = courses.find(c => c.id === evt.courseId);
                return (
                  <div key={evt.id} className="flex items-center justify-between p-3.5 hover:bg-white/[0.02] rounded-2xl transition-colors group">
                    <div className="flex items-center gap-3.5">
                      <span className={`text-[9px] font-bold px-2 py-1 rounded-md tracking-wider ${evt.action === "ATTENDED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
                        {evt.action}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[12px] font-bold text-white/90">{course?.code || "Unknown"}</span>
                        <span className="text-[9px] text-white/40 font-mono mt-0.5">{new Date(evt.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => undoAttendanceHistoryEvent(evt.id)}
                      className="px-3.5 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white text-[9px] font-bold tracking-wider transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1.5 border border-white/5 shrink-0"
                    >
                      <RotateCcw className="w-3 h-3" /> UNDO
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
