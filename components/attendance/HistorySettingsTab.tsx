"use client";

import React, { useState } from "react";
import { useUSMStore } from "@/stores/usmStore";
import { motion, AnimatePresence } from "framer-motion";
import { History, ShieldAlert, Download, Upload, RotateCcw, CalendarOff, Trash2 } from "lucide-react";

export default function HistorySettingsTab() {
  const { attendanceHistory, undoAttendanceHistoryEvent, holidays, addHoliday, removeHoliday, courses } = useUSMStore();
  const [newHoliday, setNewHoliday] = useState("");
  const [importJson, setImportJson] = useState("");
  const [importStatus, setImportStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">("IDLE");

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

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importJson);
      if (!parsed || !parsed.state) throw new Error("Invalid format");
      localStorage.setItem("gradeflow-usm-storage", JSON.stringify(parsed));
      setImportStatus("SUCCESS");
      setTimeout(() => {
        window.location.reload(); // Reload to hydrate zustand
      }, 1000);
    } catch {
      setImportStatus("ERROR");
      setTimeout(() => setImportStatus("IDLE"), 2000);
    }
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
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {/* Undo History Section */}
      <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 flex flex-col h-[400px]">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold text-white tracking-widest uppercase">History Log (Undo)</h4>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          {attendanceHistory.length === 0 ? (
            <div className="text-center text-white/30 text-xs mt-10">No history logged yet.</div>
          ) : (
            attendanceHistory.map(evt => {
              const course = courses.find(c => c.id === evt.courseId);
              return (
                <div key={evt.id} className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${evt.action === "ATTENDED" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                        {evt.action}
                      </span>
                      <span className="text-[11px] font-bold text-white">{course?.code || "Unknown"}</span>
                    </div>
                    <div className="text-[9px] text-white/40 mt-1">{new Date(evt.timestamp).toLocaleString()}</div>
                  </div>
                  <button
                    onClick={() => undoAttendanceHistoryEvent(evt.id)}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                    title="Undo this action"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="space-y-6 flex flex-col">
        {/* Holiday Pause Calendar */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <CalendarOff className="w-4 h-4 text-[#A855F7]" />
            <h4 className="text-xs font-bold text-white tracking-widest uppercase">Holiday Pauses</h4>
          </div>
          <p className="text-[10px] text-white/40 mb-4">
            Add dates when college is closed. The AI will skip these days when calculating Bunk strategies.
          </p>
          <div className="flex gap-2 mb-4">
            <input 
              type="date"
              value={newHoliday}
              onChange={(e) => setNewHoliday(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white outline-none"
            />
            <button 
              onClick={handleAddHoliday}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[11px] font-bold transition-colors"
            >
              ADD
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {holidays.map(h => (
              <div key={h} className="flex items-center gap-1.5 bg-black/40 border border-white/10 px-2.5 py-1 rounded-lg text-[10px] text-white/70 font-mono">
                {h}
                <button onClick={() => removeHoliday(h)} className="hover:text-rose-400 ml-1">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Data Backup */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="w-4 h-4 text-[#4F8EF7]" />
              <h4 className="text-xs font-bold text-white tracking-widest uppercase">Data Backup</h4>
            </div>
            <p className="text-[10px] text-white/40 mb-4">
              Export your entire GradeFlow profile to a JSON file, or restore from a backup.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#4F8EF7]/10 hover:bg-[#4F8EF7]/20 border border-[#4F8EF7]/30 text-[#4F8EF7] rounded-xl text-[11px] font-bold transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> EXPORT JSON
              </button>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/20">
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder="Paste backup JSON here to restore..."
                className="w-full h-16 bg-black/40 border border-white/10 rounded-xl p-2 text-[9px] font-mono text-white/50 outline-none resize-none mb-2"
              />
              <button
                onClick={handleImport}
                disabled={!importJson}
                className="w-full flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white disabled:opacity-50 rounded-xl text-[11px] font-bold transition-colors"
              >
                {importStatus === "SUCCESS" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Upload className="w-3.5 h-3.5" />}
                {importStatus === "SUCCESS" ? "RESTORED!" : importStatus === "ERROR" ? "INVALID JSON" : "RESTORE BACKUP"}
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-rose-500/20">
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to reset ALL your GradeFlow data? This cannot be undone!")) {
                  localStorage.removeItem("gradeflow-usm-storage");
                  window.location.reload();
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl text-[11px] font-bold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> RESET ALL DATA
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
