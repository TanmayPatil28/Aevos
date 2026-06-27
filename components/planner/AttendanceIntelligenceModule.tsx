"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarClock, AlertTriangle, CheckCircle2, Calculator, ChevronDown, ShieldAlert, CalendarHeart } from "lucide-react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/input";
import { useUSMStore } from "@/stores/usmStore";

interface AttendanceProps {
  currentCgpa?: number;
  targetCgpa?: number;
  completedSemesters?: number;
  remainingSemesters?: number;
  result?: any;
  preset?: any;
}

export default function AttendanceIntelligenceModule({ preset }: AttendanceProps) {
  const courses = useUSMStore(s => s.courses);
  const holidays = useUSMStore(s => s.holidays);
  const presetId = useUSMStore(s => s.presetId);

  const estimatedTotal = courses.length > 0 ? (courses.length * 40).toString() : "40";
  const estimatedAttended = courses.length > 0 ? (courses.length * 32).toString() : "32";


  const [totalClasses, setTotalClasses] = useState(estimatedTotal);
  const [attendedClasses, setAttendedClasses] = useState(estimatedAttended);
  const [targetAttendance, setTargetAttendance] = useState(preset?.id === "vtu" || presetId === "vtu" ? "85" : "75");

  React.useEffect(() => {
    setTotalClasses(courses.length > 0 ? (courses.length * 40).toString() : "40");
    setAttendedClasses(courses.length > 0 ? (courses.length * 32).toString() : "32");
  }, [courses]);

  const total = parseInt(totalClasses) || 0;
  const attended = parseInt(attendedClasses) || 0;
  const target = parseInt(targetAttendance) || 75;

  const currentPercentage = total > 0 ? (attended / total) * 100 : 0;
  
  const safeBunks = Math.floor((attended * 100 - target * total) / target);
  const classesToAttend = Math.ceil((target * total - 100 * attended) / (100 - target));

  const isSafe = currentPercentage >= target;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full h-fit">
      {/* Controls (Left) */}
      <div className="col-span-1 lg:col-span-5 flex flex-col h-fit gap-6">
        <div className="relative z-10 flex flex-col h-fit space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/50">Calculate Safe Bunks</h3>

          <div className="space-y-6 flex-1">
            <Input 
              label="Total Conducted" 
              type="number" 
              value={totalClasses} 
              onChange={(e) => setTotalClasses(e.target.value)}
            />
            <Input 
              label="Classes Attended" 
              type="number" 
              value={attendedClasses} 
              onChange={(e) => setAttendedClasses(e.target.value)}
            />
            <Input 
              label="Target % (Ordinance)" 
              type="number" 
              value={targetAttendance} 
              onChange={(e) => setTargetAttendance(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Results (Right) */}
      <div className="col-span-1 lg:col-span-7 flex flex-col h-fit gap-6">
        <div className="flex flex-col h-fit space-y-6">
          
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <span className="text-[12px] leading-[16px] font-bold uppercase tracking-[0.12em] text-foreground-muted">Prediction Results</span>
            {isSafe ? (
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <CheckCircle2 size={12} /> Safe Zone
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-500/20 text-rose-400 border border-rose-500/20 flex items-center gap-1.5 animate-pulse">
                <AlertTriangle size={12} /> Detention Risk
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            <div className="p-6 rounded-card-large bg-white/5 flex flex-col justify-center">
              <span className="text-[12px] leading-[16px] font-bold uppercase tracking-[0.12em] text-foreground-muted">Current Status</span>
              <div className="mt-4 flex items-end gap-2">
                <span className={`text-6xl font-black font-mono tracking-tighter ${isSafe ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {currentPercentage.toFixed(1)}%
                </span>
              </div>
            </div>

            {isSafe ? (
              <div className="p-6 rounded-card-large bg-emerald-500/10 border border-emerald-500/20 flex flex-col justify-center">
                <span className="text-[12px] leading-[16px] font-bold uppercase tracking-[0.12em] text-emerald-400/70">Safe Bunks Available</span>
                <div className="mt-4">
                  <span className="text-6xl font-black font-mono tracking-tighter text-emerald-400">
                    {safeBunks > 0 ? safeBunks : 0}
                  </span>
                  <span className="text-emerald-400/60 ml-2 font-medium">classes</span>
                </div>
                <p className="text-xs text-emerald-400/80 mt-2">You can miss these many upcoming classes and still maintain {target}%.</p>
              </div>
            ) : (
              <div className="p-6 rounded-card-large bg-rose-500/10 border border-rose-500/20 flex flex-col justify-center">
                <span className="text-[12px] leading-[16px] font-bold uppercase tracking-[0.12em] text-rose-400/70">Recovery Required</span>
                <div className="mt-4">
                  <span className="text-6xl font-black font-mono tracking-tighter text-rose-400">
                    {classesToAttend > 0 ? classesToAttend : 0}
                  </span>
                  <span className="text-rose-400/60 ml-2 font-medium">classes</span>
                </div>
                <p className="text-xs text-rose-400/80 mt-2">You must attend this many consecutive classes to reach {target}%.</p>
              </div>
            )}
          </div>

          {holidays && holidays.length > 0 && (
            <div className="p-5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-4 mt-auto">
              <CalendarHeart className="text-blue-400 shrink-0 mt-1" size={20} />
              <div>
                <h5 className="text-sm font-bold text-blue-400">Upcoming Academic Holidays</h5>
                <p className="text-xs text-blue-400/80 mt-1">
                  You have {holidays.length} upcoming holiday(s) in your synced Academic Calendar. 
                  Remember that official holidays do not count towards total conducted classes!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
