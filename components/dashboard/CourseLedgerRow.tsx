"use client";

import React from "react";
import { BookOpen, Hash, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

export interface CourseData {
  id: string;
  name: string;
  code: string;
  credits: number;
  grade?: string;
}

interface CourseLedgerRowProps {
  course: CourseData;
  isLast?: boolean;
}

export default function CourseLedgerRow({ course, isLast }: CourseLedgerRowProps) {
  // Determine colors based on grade or active status
  let statusColor = "text-[#0a84ff]";
  let bgColor = "bg-[#0a84ff]/10 border-[#0a84ff]/20";
  
  const displayGrade = course.grade || "IP"; // IP for In Progress

  if (course.grade) {
    if (course.grade.startsWith("A") || course.grade.startsWith("O")) {
      statusColor = "text-[#34c759]";
      bgColor = "bg-[#34c759]/10 border-[#34c759]/20";
    } else if (course.grade.startsWith("B")) {
      statusColor = "text-[#ff9f0a]";
      bgColor = "bg-[#ff9f0a]/10 border-[#ff9f0a]/20";
    } else {
      statusColor = "text-[#ff3b30]";
      bgColor = "bg-[#ff3b30]/10 border-[#ff3b30]/20";
    }
  }

  return (
    <div className={cn(
      "group flex flex-col transition-all duration-300 relative overflow-hidden",
      !isLast && "border-b border-white/[0.05]",
      "bg-transparent hover:bg-surface/50"
    )}>
      {/* Main Row Header */}
      <div 
        className="flex items-center justify-between gap-4 p-4 relative z-10"
      >
        {/* Left Side: Icon & Name */}
        <div className="flex items-center gap-4 flex-1 overflow-hidden">
          <div className={cn(
            "w-10 h-10 rounded-full flex flex-col items-center justify-center shrink-0 border",
            bgColor
          )}>
            <span className={cn(
              "text-[14px] font-bold tracking-tighter",
              statusColor
            )}>{displayGrade}</span>
          </div>
          
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-[14px] font-medium text-foreground truncate">{course.name}</h4>
            </div>
            <div className="flex items-center text-[12px] text-foreground-muted truncate mt-0.5 gap-3">
              <span className="flex items-center gap-1.5 uppercase font-mono tracking-wider">
                <Hash size={12} className="text-foreground-muted/70" />
                {course.code}
              </span>
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <BookOpen size={12} className="text-zinc-500" />
                {course.credits} Credits
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
