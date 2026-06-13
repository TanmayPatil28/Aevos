"use client";

import React from "react";
import { Activity, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface DynamicIslandProps {
  mode: "attendance" | "assignments";
  onModeChange: (mode: "attendance" | "assignments") => void;
}

export default function DynamicIsland({
  mode,
  onModeChange,
}: DynamicIslandProps) {
  return (
    <div className="fixed top-28 right-8 z-[200] flex flex-col items-end gap-0">
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={cn(
          "relative flex items-center bg-[#1a1a1a] rounded-full",
          "border border-white/[0.08]",
          "shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)]",
        )}
      >
        <div className="relative z-10 flex items-center bg-[#1a1a1a] rounded-full">
          {/* ─── Tab Switcher ─── */}
          <div className="flex items-center p-1.5">
            <button
              onClick={() => onModeChange("attendance")}
              className={cn(
                "relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300",
                mode === "attendance" ? "text-black" : "text-white/40 hover:text-white/70"
              )}
            >
              {mode === "attendance" && (
                <motion.div
                  layoutId="activeAttendanceTab"
                  className="absolute inset-0 bg-white rounded-full shadow-md"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <Activity size={15} className="relative z-10" />
              <span className="relative z-10">Attendance</span>
            </button>

            <button
              onClick={() => onModeChange("assignments")}
              className={cn(
                "relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300",
                mode === "assignments" ? "text-black" : "text-white/40 hover:text-white/70"
              )}
            >
              {mode === "assignments" && (
                <motion.div
                  layoutId="activeAttendanceTab"
                  className="absolute inset-0 bg-white rounded-full shadow-md"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <BookOpen size={15} className="relative z-10" />
              <span className="relative z-10">Assignments</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
