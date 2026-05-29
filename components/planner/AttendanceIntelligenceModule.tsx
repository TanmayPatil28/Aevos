"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarClock, AlertTriangle, CheckCircle2, Calculator, ChevronDown, ShieldAlert, CalendarHeart } from "lucide-react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
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
  const { courses, holidays, presetId } = useUSMStore(s => ({
    courses: s.courses,
    holidays: s.holidays,
    presetId: s.presetId
  }));

  const estimatedTotal = courses.length > 0 ? (courses.length * 40).toString() : "40";
  const estimatedAttended = courses.length > 0 ? (courses.length * 32).toString() : "32";

  const [isExpanded, setIsExpanded] = useState(false);
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
    <Card className="relative overflow-hidden border border-white/10" padding="xl">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-slate-500/5 opacity-50" />
      
      <div className="relative z-10 space-y-6">
        <div 
          className="flex items-center justify-between cursor-pointer group"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20 group-hover:scale-105 transition-transform">
              <CalendarClock className="text-indigo-400" />
            </div>
            <div>
              <h3 className="font-headline text-xl font-black text-white">Attendance Predictor</h3>
              <p className="text-on-surface-variant text-sm">Calculate safe bunks & recovery thresholds.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isSafe ? (
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hidden md:flex items-center gap-1.5">
                <CheckCircle2 size={12} /> Safe Zone
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-500/20 text-rose-400 border border-rose-500/20 hidden md:flex items-center gap-1.5 animate-pulse">
                <AlertTriangle size={12} /> Detention Risk
              </span>
            )}
            <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
              <ChevronDown className="text-white/50" />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-6 border-t border-white/20 space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Current Status</span>
                    <div className="mt-4 flex items-end gap-2">
                      <span className={`text-5xl font-black font-mono ${isSafe ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {currentPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {isSafe ? (
                    <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col justify-between">
                      <span className="text-xs font-bold uppercase tracking-widest text-emerald-400/70">Safe Bunks Available</span>
                      <div className="mt-4">
                        <span className="text-5xl font-black font-mono text-emerald-400">
                          {safeBunks > 0 ? safeBunks : 0}
                        </span>
                        <span className="text-emerald-400/60 ml-2 font-medium">classes</span>
                      </div>
                      <p className="text-xs text-emerald-400/80 mt-2">You can miss these many upcoming classes and still maintain {target}%.</p>
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col justify-between">
                      <span className="text-xs font-bold uppercase tracking-widest text-rose-400/70">Recovery Required</span>
                      <div className="mt-4">
                        <span className="text-5xl font-black font-mono text-rose-400">
                          {classesToAttend > 0 ? classesToAttend : 0}
                        </span>
                        <span className="text-rose-400/60 ml-2 font-medium">classes</span>
                      </div>
                      <p className="text-xs text-rose-400/80 mt-2">You must attend this many consecutive classes to reach {target}%.</p>
                    </div>
                  )}

                  {holidays && holidays.length > 0 && (
                    <div className="col-span-1 md:col-span-2 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3 mt-2">
                      <CalendarHeart className="text-blue-400 shrink-0" size={20} />
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
