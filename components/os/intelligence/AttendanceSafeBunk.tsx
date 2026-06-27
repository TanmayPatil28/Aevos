"use client";

import { useState } from "react";
import { Calculator, ShieldAlert, ShieldCheck } from "lucide-react";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/cn";

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
    <Card variant="default" className="!p-6 border-white/5">
      <div className="flex items-center gap-3 mb-6">
        <Calculator size={16} className="text-foreground-muted" />
        <div className="flex flex-col">
          <h3 className="text-[14px] font-semibold text-foreground tracking-tight leading-tight">Safe Bunk Calculator</h3>
          <p className="text-[11px] text-foreground-muted uppercase tracking-wider font-semibold">Calculate based on DigiCampus %</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground-muted mb-1.5">Conducted</label>
          <input
            type="number"
            min="1"
            value={conducted}
            onChange={(e) => setConducted(e.target.value ? Number(e.target.value) : "")}
            className="w-full bg-[#000000] border border-white/5 rounded-xl px-3 py-2 text-foreground text-xs font-semibold tracking-wide focus:outline-none focus:border-white/20 transition-colors appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
            placeholder="e.g. 40"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground-muted mb-1.5">Attendance %</label>
          <input
            type="number"
            min="0"
            max="100"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value ? Number(e.target.value) : "")}
            className="w-full bg-[#000000] border border-white/5 rounded-xl px-3 py-2 text-foreground text-xs font-semibold tracking-wide focus:outline-none focus:border-white/20 transition-colors appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
            placeholder="e.g. 78"
          />
        </div>
      </div>

      {typeof conducted === "number" && typeof percentage === "number" && conducted > 0 && (
        <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] transition-all duration-300 flex items-center gap-3">
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", isDanger ? "bg-[#ff3b30]/10" : "bg-[#34c759]/10")}>
            {isDanger ? <ShieldAlert size={16} className="text-[#ff3b30]" /> : <ShieldCheck size={16} className="text-[#34c759]" />}
          </div>
          <div className="flex flex-col">
            <span className={cn("text-[13px] tracking-tight font-bold", isDanger ? "text-[#ff3b30]" : "text-[#34c759]")}>
              {isDanger ? `${deficit} Classes Deficit` : `${safeBunks} Safe Bunks`}
            </span>
            <p className="text-[11px] text-foreground-muted leading-none mt-0.5 truncate">
              {attended}/{conducted} classes. {isDanger ? `Need next ${deficit}.` : `Can skip next ${safeBunks}.`}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
