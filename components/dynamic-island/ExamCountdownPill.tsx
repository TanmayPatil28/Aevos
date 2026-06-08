"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, BookOpen, X } from "lucide-react";
import { useDynamicIslandStore, ExamCountdown } from "@/stores/dynamicIslandStore";
import { cn } from "@/lib/cn";

const urgencyConfig = {
  low: {
    border: "border-emerald-500/30",
    glow: "shadow-[0_0_20px_rgba(52,211,153,0.2)]",
    bg: "bg-emerald-500/5",
    text: "text-emerald-400",
    dot: "bg-emerald-500",
    gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
  },
  medium: {
    border: "border-yellow-500/30",
    glow: "shadow-[0_0_20px_rgba(234,179,8,0.2)]",
    bg: "bg-yellow-500/5",
    text: "text-yellow-400",
    dot: "bg-yellow-500",
    gradient: "from-yellow-500/20 via-yellow-500/5 to-transparent",
  },
  high: {
    border: "border-orange-500/30",
    glow: "shadow-[0_0_25px_rgba(249,115,22,0.25)]",
    bg: "bg-orange-500/5",
    text: "text-orange-400",
    dot: "bg-orange-500",
    gradient: "from-orange-500/20 via-orange-500/5 to-transparent",
  },
  critical: {
    border: "border-red-500/40",
    glow: "shadow-[0_0_30px_rgba(239,68,68,0.3)]",
    bg: "bg-red-500/5",
    text: "text-red-400",
    dot: "bg-red-500 animate-pulse",
    gradient: "from-red-500/20 via-red-500/5 to-transparent",
  },
};

export default function ExamCountdownPill() {
  const { examCountdown, isExamPillExpanded, setExamPillExpanded, clearExamCountdown, updateExamCountdown } = useDynamicIslandStore();

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    if (!examCountdown?.examDate) return;

    const tick = () => {
      const now = new Date();
      const examDate = new Date(examCountdown.examDate);
      const diffMs = examDate.getTime() - now.getTime();
      
      if (diffMs <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
        return;
      }

      const d = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const h = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeLeft({ days: d, hours: h, minutes: m });
    };

    tick();
    const interval = setInterval(tick, 60000); // tick every minute
    return () => clearInterval(interval);
  }, [examCountdown?.examDate]);

  if (!examCountdown) return null;

  const config = urgencyConfig[examCountdown.urgency];

  return (
    <AnimatePresence>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.5, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.5, x: 20 }}
        transition={{ type: "spring", stiffness: 450, damping: 40, mass: 1 }}
        onClick={() => setExamPillExpanded(!isExamPillExpanded)}
        className={cn(
          "pointer-events-auto relative cursor-pointer group overflow-hidden",
          "bg-[#1D1D1F]/90 backdrop-blur-xl",
          "border",
          config.border,
          config.glow,
          isExamPillExpanded
            ? "rounded-[28px] min-w-[320px]"
            : "rounded-full h-[52px]"
        )}
      >
        {/* Urgency gradient shimmer */}
        <motion.div
          className={cn("absolute inset-0 bg-gradient-to-r opacity-50", config.gradient)}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        <AnimatePresence mode="wait">
          {isExamPillExpanded ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, filter: "blur(8px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(8px)" }}
              className="relative z-10 p-5"
            >
              {/* Close button */}
              <button
                onClick={(e) => { e.stopPropagation(); clearExamCountdown(); }}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X size={14} className="text-white/60" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border", config.border, config.bg)}>
                  <Flame size={20} className={config.text} />
                </div>
                <div className="flex flex-col">
                  <span className={cn("text-[11px] font-bold uppercase tracking-widest", config.text)}>
                    {examCountdown.urgency === 'critical' ? '⚠ EXAM IMMINENT' : 'Upcoming Exam'}
                  </span>
                  <span className="text-white text-[18px] font-bold tracking-tight leading-tight">{examCountdown.subject}</span>
                </div>
              </div>

              {/* Countdown */}
              <div className="flex items-baseline gap-1 mt-2">
                <span className={cn("text-[32px] font-mono font-light tracking-tight", config.text)}>
                  {examCountdown.daysRemaining}d
                </span>
                <span className={cn("text-[24px] font-mono font-light tracking-tight", config.text)}>
                  {examCountdown.hoursRemaining}h
                </span>
                <span className={cn("text-[18px] font-mono font-light tracking-tight", config.text)}>
                  {examCountdown.minutesRemaining}m
                </span>
              </div>

              {/* Stress meter */}
              <div className="mt-4 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className={cn("h-full rounded-full", 
                    examCountdown.urgency === 'low' ? 'bg-emerald-500' :
                    examCountdown.urgency === 'medium' ? 'bg-yellow-500' :
                    examCountdown.urgency === 'high' ? 'bg-orange-500' :
                    'bg-red-500'
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(5, 100 - (examCountdown.daysRemaining * 10))}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <span className="text-white/30 text-[10px] uppercase tracking-widest mt-1 block">Stress Level</span>
            </motion.div>
          ) : (
            <motion.div
              key="minimal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative z-10 flex items-center gap-2.5 px-4 h-full"
            >
              <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", config.dot)} />
              <span className={cn("text-[12px] font-bold whitespace-nowrap", config.text)}>
                {examCountdown.daysRemaining}d {examCountdown.hoursRemaining}h
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hover glow */}
        <motion.div className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </motion.div>
    </AnimatePresence>
  );
}
