"use client";

import React from "react";
import { useUSMStore } from "@/stores/usmStore";
import { selectActiveCourses, selectDerivedGPA, selectSemesterCredits } from "@/stores/selectors/academic";
import AcademicTimeline from "@/components/dashboard/AcademicTimeline";
import CalendarManager from "@/components/dashboard/CalendarManager";
import { Activity, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[#000000] border border-slate-800 p-6 rounded-xl relative overflow-hidden group hover:border-blue-500/30 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Activity className="w-16 h-16 text-blue-400" /></div>
              <div className="text-sm text-slate-500 uppercase font-bold tracking-wider mb-2">Active CGPA</div>
              <div className="text-4xl font-black text-white">{cgpa.toFixed(2)}</div>
              {percentage > 0 && <div className="text-xs text-indigo-400 mt-2 font-mono">≈ {percentage.toFixed(2)}% Equivalent</div>}
            </div>
            
            <div className="bg-[#000000] border border-slate-800 p-6 rounded-xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><TrendingUp className="w-16 h-16 text-emerald-400" /></div>
              <div className="text-sm text-slate-500 uppercase font-bold tracking-wider mb-2">Sem Credits</div>
              <div className="text-4xl font-black text-white">{credits.totalActiveCredits}</div>
              <div className="text-xs text-slate-400 mt-2">Active Semester Load</div>
            </div>
          </div>
          
          <div className="bg-[#000000] border border-slate-800 p-6 rounded-xl">
            <h3 className="text-lg font-bold text-white mb-6">Active Course Ledger</h3>
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

        <div className="lg:col-span-1">
          <AcademicTimeline history={store.semesterHistory} />
        </div>
      </div>
    </motion.div>
  );
}
