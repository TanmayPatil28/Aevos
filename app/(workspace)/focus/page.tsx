"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Brain, Coffee, Flame, AlertOctagon } from "lucide-react";
import { toast } from "react-hot-toast";
import { useUSMStore } from "@/stores/usmStore";

const MODE_DURATIONS = {
  WORK: 25 * 60,
  SHORT_BREAK: 5 * 60,
  LONG_BREAK: 15 * 60,
};

export default function FocusCommandCenter() {
  const { focusMode, endTime, isFocusActive, focusStreak } = useUSMStore((state) => state.focus);
  const startFocus = useUSMStore((state) => state.startFocus);
  const stopFocus = useUSMStore((state) => state.stopFocus);
  const setFocusMode = useUSMStore((state) => state.setFocusMode);
  const incrementFocusStreak = useUSMStore((state) => state.incrementFocusStreak);
  const resetFocus = useUSMStore((state) => state.resetFocus);

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
    if (!isFocusActive || !endTime) {
      return;
    }

    const calculateTimeLeft = () => {
      const now = Date.now();
      const difference = Math.floor((endTime - now) / 1000);
      return Math.max(0, difference);
    };

    // Initial check in case it's already expired
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
    }, 200); // Check 5 times a second for smooth UI rendering and high accuracy

    return () => clearInterval(intervalId);
  }, [isFocusActive, endTime]);

  const handleTimerComplete = () => {
    stopFocus();
    
    if (focusMode === "WORK") {
      incrementFocusStreak();
      toast.success("JARVIS: Excellent work. Commencing break protocol.", { duration: 4000 });
      // We must calculate the next mode based on the current streak
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
      // "Pausing" isn't explicitly defined in USMStore yet in terms of persisting remaining time perfectly.
      // But we can simulate a pause by calculating what was left, and when they resume, they get a new endTime.
      // For a true Pomodoro, you just reset or let it run. We'll reset it to the full duration for simplicity, or we can just stop it.
      // We will implement pause by resetting to the current time left when it's stopped.
      stopFocus();
    } else {
      startFocus(timeLeft);
    }
  };

  const resetTimer = () => {
    setFocusMode(focusMode); // This resets active and clears endTime
    setTimeLeft(MODE_DURATIONS[focusMode]);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getModeColor = () => {
    switch (focusMode) {
      case "WORK": return "text-indigo-400";
      case "SHORT_BREAK": return "text-emerald-400";
      case "LONG_BREAK": return "text-blue-400";
      default: return "text-white";
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 flex flex-col items-center"
      >
        <div className="flex gap-4 mb-12 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
          <button 
            onClick={() => setFocusMode("WORK")}
            className={`px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${focusMode === "WORK" ? "bg-indigo-500/20 text-indigo-400" : "text-white/50 hover:text-white"}`}
          >
            <Brain size={18} /> Deep Work
          </button>
          <button 
            onClick={() => setFocusMode("SHORT_BREAK")}
            className={`px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${focusMode === "SHORT_BREAK" ? "bg-emerald-500/20 text-emerald-400" : "text-white/50 hover:text-white"}`}
          >
            <Coffee size={18} /> Short Break
          </button>
          <button 
            onClick={() => setFocusMode("LONG_BREAK")}
            className={`px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${focusMode === "LONG_BREAK" ? "bg-blue-500/20 text-blue-400" : "text-white/50 hover:text-white"}`}
          >
            <Coffee size={18} /> Long Break
          </button>
        </div>

        <motion.div 
          key={timeLeft}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className={`text-[12rem] leading-none font-black tracking-tighter tabular-nums ${getModeColor()} drop-shadow-[0_0_40px_rgba(255,255,255,0.1)]`}
          style={{ textShadow: isFocusActive ? '0 0 80px currentColor' : 'none' }}
        >
          {formatTime(timeLeft)}
        </motion.div>

        <div className="mt-16 flex gap-6">
          <button 
            onClick={toggleTimer}
            className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]"
          >
            {isFocusActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-2" />}
          </button>
          <button 
            onClick={resetTimer}
            className="w-20 h-20 rounded-full bg-white/5 text-white flex items-center justify-center border border-white/10 hover:bg-white/10 active:scale-95 transition-all"
          >
            <RotateCcw size={28} />
          </button>
        </div>

        <div className="mt-16 flex items-center gap-3 px-6 py-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-400">
          <Flame size={24} />
          <span className="font-bold text-lg">Streak: {focusStreak}</span>
        </div>
        
        {isFocusActive && focusMode === "WORK" && (
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="mt-8 text-white/30 text-sm tracking-widest uppercase font-bold"
          >
            Strict Mode Active • Do Not Switch Tabs
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
