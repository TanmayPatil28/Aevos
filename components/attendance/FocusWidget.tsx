"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Brain, Coffee, Flame, AlertOctagon, X } from "lucide-react";
import { toast } from "sonner";
import { useUSMStore } from "@/stores/usmStore";

const MODE_DURATIONS = {
  WORK: 25 * 60,
  SHORT_BREAK: 5 * 60,
  LONG_BREAK: 15 * 60,
};

export default function FocusWidget({ onClose }: { onClose?: () => void }) {
  const { focusMode, endTime, isFocusActive, focusStreak } = useUSMStore((state) => state.focus);
  const startFocus = useUSMStore((state) => state.startFocus);
  const stopFocus = useUSMStore((state) => state.stopFocus);
  const setFocusMode = useUSMStore((state) => state.setFocusMode);
  const incrementFocusStreak = useUSMStore((state) => state.incrementFocusStreak);

  // Local state for UI updates
  const [timeLeft, setTimeLeft] = useState(MODE_DURATIONS[focusMode]);

  // Sync timeLeft when focusMode changes (and not active)
  useEffect(() => {
    if (!isFocusActive && endTime === null) {
      setTimeLeft(MODE_DURATIONS[focusMode]);
    }
  }, [focusMode, isFocusActive, endTime]);

  // Handle Visibility Change (Strict Mode)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isFocusActive && focusMode === "WORK") {
        toast.error("JARVIS: Unacceptable! You switched tabs during a Focus session. Focus restored, but I am disappointed.", {
          duration: 5000,
          icon: <AlertOctagon className="text-red-500" />,
          style: {
            background: '#1c1c1e',
            color: '#fff',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isFocusActive, focusMode]);

  // High-Accuracy Timestamp Loop
  useEffect(() => {
    if (!isFocusActive || !endTime) return;

    const calculateTimeLeft = () => {
      const now = Date.now();
      const difference = Math.floor((endTime - now) / 1000);
      return Math.max(0, difference);
    };

    const initialTimeLeft = calculateTimeLeft();
    setTimeLeft(initialTimeLeft);

    if (initialTimeLeft === 0) {
      handleTimerComplete();
      return;
    }

    const intervalId = setInterval(() => {
      const currentRemaining = calculateTimeLeft();
      setTimeLeft(currentRemaining);

      if (currentRemaining <= 0) {
        clearInterval(intervalId);
        handleTimerComplete();
      }
    }, 200); 

    return () => clearInterval(intervalId);
  }, [isFocusActive, endTime]);

  const handleTimerComplete = () => {
    stopFocus();
    
    if (focusMode === "WORK") {
      incrementFocusStreak();
      toast.success("JARVIS: Excellent work. Commencing break protocol.", { duration: 4000 });
      const nextStreak = focusStreak + 1;
      const nextMode = nextStreak > 0 && nextStreak % 4 === 0 ? "LONG_BREAK" : "SHORT_BREAK";
      setFocusMode(nextMode);
    } else {
      toast.success("JARVIS: Break concluded. Ready for another session.", { duration: 4000 });
      setFocusMode("WORK");
    }
  };

  const toggleTimer = () => {
    if (isFocusActive) {
      stopFocus();
    } else {
      startFocus(timeLeft);
    }
  };

  const resetTimer = () => {
    setFocusMode(focusMode); 
    setTimeLeft(MODE_DURATIONS[focusMode]);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getModeColor = () => {
    switch (focusMode) {
      case "WORK": return "text-white";
      case "SHORT_BREAK": return "text-white/80";
      case "LONG_BREAK": return "text-white/60";
      default: return "text-white";
    }
  };

  return (
    <div className="w-full h-full bg-[#111] relative overflow-hidden rounded-[32px] shadow-inner ring-1 ring-white/5 p-10 pb-[100px]">
      {/* Refined subtle background glow */}
      <div className="absolute top-1/2 left-[25%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.03] blur-[100px] rounded-full pointer-events-none" />

      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 rounded-full bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors z-30"
        >
          <X size={20} />
        </button>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full h-full flex items-center justify-between gap-12 z-10 relative"
      >
        {/* Left Section: Timer & Controls */}
        <div className="flex-1 flex flex-col items-center justify-center border-r border-white/[0.05] pr-12">
          <div 
            key={timeLeft}
            className={`text-[7rem] md:text-[8rem] leading-none font-sans font-light tracking-[-0.04em] tabular-nums ${getModeColor()}`}
          >
            {formatTime(timeLeft)}
          </div>

          <div className="mt-10 flex items-center gap-6">
            <button 
              onClick={resetTimer}
              className="w-12 h-12 rounded-full bg-white/5 text-white/50 flex items-center justify-center border border-white/[0.05] hover:bg-white/10 hover:text-white active:scale-95 transition-all"
              title="Reset Timer"
            >
              <RotateCcw size={18} />
            </button>
            
            <button 
              onClick={toggleTimer}
              className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md shrink-0"
            >
              {isFocusActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
            </button>
          </div>
        </div>

        {/* Right Section: Focus Settings & Stats */}
        <div className="flex-1 flex flex-col justify-center items-start pl-8 gap-8">
          
          {/* Mode Selection */}
          <div className="w-full">
            <div className="inline-flex gap-1 bg-white/[0.03] p-1 rounded-full border border-white/[0.05] backdrop-blur-xl">
              <button 
                onClick={() => setFocusMode("WORK")}
                className={`px-5 py-2 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 text-[13px] ${focusMode === "WORK" ? "bg-white text-black shadow-sm" : "text-white/50 hover:text-white hover:bg-white/5"}`}
              >
                <Brain size={14} className={focusMode === "WORK" ? "text-black" : "text-white/50"} /> Focus
              </button>
              <button 
                onClick={() => setFocusMode("SHORT_BREAK")}
                className={`px-5 py-2 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 text-[13px] ${focusMode === "SHORT_BREAK" ? "bg-white text-black shadow-sm" : "text-white/50 hover:text-white hover:bg-white/5"}`}
              >
                <Coffee size={14} className={focusMode === "SHORT_BREAK" ? "text-black" : "text-white/50"} /> Short Break
              </button>
              <button 
                onClick={() => setFocusMode("LONG_BREAK")}
                className={`px-5 py-2 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 text-[13px] ${focusMode === "LONG_BREAK" ? "bg-white text-black shadow-sm" : "text-white/50 hover:text-white hover:bg-white/5"}`}
              >
                <Coffee size={14} className={focusMode === "LONG_BREAK" ? "text-black" : "text-white/50"} /> Long Break
              </button>
            </div>
          </div>

          {/* Stats & Info iOS Settings Style */}
          <div className="flex flex-col w-full max-w-[280px] bg-white/[0.02] border border-white/[0.05] rounded-[20px] overflow-hidden backdrop-blur-xl">
            
            {/* Streak Row */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <Flame size={16} className="text-orange-400/80" />
                <span className="text-white/60 text-[13px] font-medium">Focus Streak</span>
              </div>
              <span className="text-white/90 font-semibold text-sm">{focusStreak}</span>
            </div>
            
            <AnimatePresence>
              {focusMode === "WORK" && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: "auto" }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  {/* Divider */}
                  <div className="w-full h-[1px] bg-white/[0.05] ml-5" />
                  
                  {/* Strict Mode Row */}
                  <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <AlertOctagon size={16} className="text-white/40" />
                      <span className="text-white/60 text-[13px] font-medium">Strict Mode</span>
                    </div>
                    <span className="text-white/40 text-[11px] tracking-wider uppercase font-medium">Active</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
          </div>

        </div>
      </motion.div>
    </div>
  );
}
