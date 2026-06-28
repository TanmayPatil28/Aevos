"use client";

import React from "react";
import { useUSMStore } from "@/stores/usmStore";
import { selectActiveCourses, selectDerivedGPA, selectSemesterCredits } from "@/stores/selectors/academic";
import CalendarManager from "@/components/dashboard/CalendarManager";
import { Activity, TrendingUp, Zap, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedCounter from "@/components/AnimatedCounter";
import { MoodleExitTestWidget } from "@/components/dashboard/widgets/MoodleExitTestWidget";
import { AttendanceSafeBunk } from "@/components/dashboard/widgets/AttendanceSafeBunk";
import Card from "@/components/ui/Card";
import FullAcademicTimeline from "@/components/dashboard/FullAcademicTimeline";

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
      className="space-y-8"
    >
      <CalendarManager />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 columns) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card variant="default" className="flex flex-col !p-6 border-white/5 transition-colors hover:bg-surface/50">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={14} className="text-foreground-muted" />
                <div className="text-[11px] text-foreground-muted uppercase tracking-wider font-semibold">Active CGPA</div>
              </div>
              <AnimatedCounter target={cgpa} decimals={2} className="text-4xl font-black text-primary tracking-tighter" />
              {percentage > 0 && <div className="text-[12px] text-foreground-muted mt-2 tracking-tight">≈ {percentage.toFixed(2)}% Equivalent</div>}
            </Card>
            
            <Card variant="default" className="flex flex-col !p-6 border-white/5 transition-colors hover:bg-surface/50">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={14} className="text-foreground-muted" />
                <div className="text-[11px] text-foreground-muted uppercase tracking-wider font-semibold">Sem Credits</div>
              </div>
              <AnimatedCounter target={credits.totalActiveCredits} className="text-4xl font-black text-primary tracking-tighter" />
              <div className="text-[12px] text-foreground-muted mt-2 tracking-tight">Active Semester Load</div>
            </Card>
          </div>
          
          <AttendanceSafeBunk />
          <MoodleExitTestWidget />
        </div>

        {/* Right Column (7 columns) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          <FullAcademicTimeline />

        </div>
      </div>
    </motion.div>
  );
}
