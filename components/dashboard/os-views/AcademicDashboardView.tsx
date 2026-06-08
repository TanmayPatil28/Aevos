"use client";

import React from "react";
import { useUSMStore } from "@/stores/usmStore";
import { selectActiveCourses, selectDerivedGPA, selectSemesterCredits } from "@/stores/selectors/academic";
import AcademicTimeline from "@/components/dashboard/AcademicTimeline";
import CalendarManager from "@/components/dashboard/CalendarManager";
import { Activity, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedCounter from "@/components/AnimatedCounter";

export default function AcademicDashboardView() {
  const store = useUSMStore();
  const activeCourses = selectActiveCourses(store);
  const { cgpa, percentage } = selectDerivedGPA(store);
  const credits = selectSemesterCredits(store);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >
      <CalendarManager />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] ring-1 ring-white/5 relative overflow-hidden group hover:bg-white/[0.02] transition-all">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Activity className="w-24 h-24 text-blue-400" /></div>
              <div className="text-sm text-slate-400 uppercase font-bold tracking-wider mb-3 relative z-10">Active CGPA</div>
              <AnimatedCounter target={cgpa} decimals={2} className="text-5xl font-black text-white relative z-10 block" />
              {percentage > 0 && <div className="text-sm text-indigo-400 mt-4 font-mono relative z-10">≈ <AnimatedCounter target={percentage} decimals={2} />% Equivalent</div>}
            </div>
            
            <div className="bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] ring-1 ring-white/5 relative overflow-hidden group hover:bg-white/[0.02] transition-all">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><TrendingUp className="w-24 h-24 text-emerald-400" /></div>
              <div className="text-sm text-slate-400 uppercase font-bold tracking-wider mb-3 relative z-10">Sem Credits</div>
              <AnimatedCounter target={credits.totalActiveCredits} className="text-5xl font-black text-white relative z-10 block" />
              <div className="text-sm text-slate-500 mt-4 relative z-10">Active Semester Load</div>
            </div>
          </div>
          
          <div className="bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] ring-1 ring-white/5">
            <h3 className="text-xl font-bold text-white mb-6">Active Course Ledger</h3>
            <div className="space-y-3">
              {activeCourses.map(course => (
                <div key={course.id} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div>
                    <div className="font-bold text-white text-sm">{course.name}</div>
                    <div className="text-xs font-mono text-slate-400">{course.code}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-indigo-300">{course.credits} Cr</div>
                    {course.grade && <div className="text-xs font-bold text-emerald-400">Grade: {course.grade}</div>}
                  </div>
                </div>
              ))}
              {activeCourses.length === 0 && (
                <div className="flex flex-col items-center justify-center p-8 bg-white/[0.02] border border-dashed border-white/5 rounded-xl text-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-3">
                    <Activity className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="text-sm font-bold text-white mb-1">No Active Courses</div>
                  <div className="text-xs text-slate-400 max-w-[200px] mb-4">
                    Import your past grades to unlock personalized insights.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] ring-1 ring-white/5 h-full">
            <AcademicTimeline history={store.semesterHistory} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
