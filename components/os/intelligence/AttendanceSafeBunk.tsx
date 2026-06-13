"use client";

import { useState } from "react";
import { Calculator, ShieldAlert, ShieldCheck } from "lucide-react";

export function AttendanceSafeBunk() {
  const [conducted, setConducted] = useState<number | "">("");
  const [percentage, setPercentage] = useState<number | "">("");

  // Logic: Attended = (Percentage / 100) * Conducted
  // Safe Bunks = Attended / 0.75 - Conducted
  let safeBunks = 0;
  let attended = 0;
  let isDanger = false;
  let deficit = 0;

  if (typeof conducted === "number" && typeof percentage === "number" && conducted > 0) {
    attended = Math.round((percentage / 100) * conducted);
    const requiredAttendance = 0.75 * conducted;
    
    if (attended >= requiredAttendance) {
      safeBunks = Math.floor((attended / 0.75) - conducted);
    } else {
      isDanger = true;
      deficit = Math.ceil((0.75 * conducted - attended) / 0.25);
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-200">Safe Bunk Calculator</h3>
          <p className="text-xs text-slate-400">Calculate based on DigiCampus %</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Total Conducted Lectures</label>
          <input
            type="number"
            min="1"
            value={conducted}
            onChange={(e) => setConducted(e.target.value ? Number(e.target.value) : "")}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50"
            placeholder="e.g. 40"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Current Attendance %</label>
          <input
            type="number"
            min="0"
            max="100"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value ? Number(e.target.value) : "")}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/50"
            placeholder="e.g. 78"
          />
        </div>
      </div>

      {typeof conducted === "number" && typeof percentage === "number" && conducted > 0 && (
        <div className={`p-4 rounded-xl border ${isDanger ? "bg-red-500/10 border-red-500/20" : "bg-emerald-500/10 border-emerald-500/20"}`}>
          <div className="flex items-start gap-3">
            {isDanger ? <ShieldAlert className="w-6 h-6 text-red-400" /> : <ShieldCheck className="w-6 h-6 text-emerald-400" />}
            <div>
              <div className={`text-xl font-black ${isDanger ? "text-red-400" : "text-emerald-400"}`}>
                {isDanger ? `${deficit} Classes Deficit` : `${safeBunks} Safe Bunks`}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                You have attended approx. {attended} out of {conducted} classes. 
                {isDanger 
                  ? ` You need to attend the next ${deficit} classes to reach 75%.` 
                  : ` You can safely skip the next ${safeBunks} classes.`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
