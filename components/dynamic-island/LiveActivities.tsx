"use client";

import React from "react";

import { motion, AnimatePresence } from "framer-motion";
import {
  Timer, TrendingUp, AlertCircle, Play, Pause,
  SkipBack, SkipForward, BookOpen, Clock,
  ClipboardList, Flame, Zap, CheckCircle2,
  Search, Command, Sparkles, ArrowRight, Mail, Coffee
} from "lucide-react";
import { LiveActivity, IslandAlert, useDynamicIslandStore } from "@/stores/dynamicIslandStore";
import { useUSMStore } from "@/stores/usmStore";
import { cn } from "@/lib/cn";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { INTENT_REGISTRY, IntentCategory } from "@/lib/ai/intentRegistry";

// ═══════════════════════════════════════════════
//  ABSOLUTE SYNC TIMER HOOK
// ═══════════════════════════════════════════════

export function useLiveTimer(activity: LiveActivity) {
  const endTime = activity.metadata?.endTime;
  const timeRemaining = activity.timeRemaining || 0;
  const isActive = activity.isActive ?? true;
  const [time, setTime] = useState(timeRemaining);

  useEffect(() => {
    if (!isActive || !endTime) {
      setTime(timeRemaining);
      return;
    }
    
    // Initial sync
    const initialNow = Date.now();
    setTime(Math.max(0, Math.floor((endTime - initialNow) / 1000)));

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      setTime(remaining);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [endTime, isActive, timeRemaining]);

  return time;
}

// ═══════════════════════════════════════════════
//  ANIMATED ICONS
// ═══════════════════════════════════════════════

function AudioWaveform({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-center gap-[2px] h-3 px-1">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          animate={{ height: isPlaying ? ["3px", "12px", "3px"] : "3px" }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          className="w-[2px] bg-pink-500 rounded-full"
        />
      ))}
    </div>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="flex items-center gap-2 px-1">
      <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-cyan-400"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <span className="text-[10px] font-mono font-bold text-cyan-400">{Math.round(progress)}%</span>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  MINIMAL STATES (inside the top pill)
// ═══════════════════════════════════════════════

export function MinimalActivity({ activity }: { activity: LiveActivity }) {
  const time = useLiveTimer(activity);

  if (activity.type === 'timer') {
    return (
      <div className="flex items-center gap-2 px-1 text-[#4F8EF7]">
        <Timer size={14} className="animate-pulse" />
        <span className="text-[12px] font-mono font-bold">{formatTime(time)}</span>
      </div>
    );
  }

  if (activity.type === 'academic_status') {
    return (
      <div className="flex items-center gap-2 px-1 text-emerald-400">
        <TrendingUp size={14} />
        <span className="text-[12px] font-bold">{activity.title}</span>
      </div>
    );
  }

  if (activity.type === 'music') {
    return (
      <div className="flex items-center gap-2 pr-1">
        <AudioWaveform isPlaying={activity.isActive} />
      </div>
    );
  }

  if (activity.type === 'schedule') {
    return (
      <div className="flex items-center gap-2 px-1 text-purple-400">
        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
        <span className="text-[12px] font-mono font-bold tracking-tight">{formatTime(time)}</span>
      </div>
    );
  }

  if (activity.type === 'exam_countdown') {
    const urgencyColors: Record<string, string> = {
      low: 'text-emerald-400',
      medium: 'text-yellow-400',
      high: 'text-orange-400',
      critical: 'text-red-400',
    };
    const dotColors: Record<string, string> = {
      low: 'bg-emerald-500',
      medium: 'bg-yellow-500',
      high: 'bg-orange-500',
      critical: 'bg-red-500 animate-pulse',
    };
    const urgency = activity.metadata?.urgency || 'medium';
    return (
      <div className={cn("flex items-center gap-2 px-1", urgencyColors[urgency])}>
        <div className={cn("w-2 h-2 rounded-full", dotColors[urgency])} />
        <span className="text-[12px] font-bold tracking-tight">{activity.title}</span>
      </div>
    );
  }

  if (activity.type === 'bunk_calculator') {
    const riskiest = activity.metadata?.riskiest;
    const isCritical = riskiest?.risk === 'CRITICAL';
    const isWarning = riskiest?.risk === 'WARNING';
    
    return (
      <div className={cn("flex items-center gap-2 px-1", isCritical ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-emerald-400')}>
        <AlertCircle size={14} className={isCritical ? 'animate-pulse' : ''} />
        <span className="text-[12px] font-bold tracking-tight">
          {riskiest?.bunksRemaining < 0 ? 'Danger' : `${riskiest?.bunksRemaining} bunks`}
        </span>
      </div>
    );
  }

  if (activity.type === 'progress') {
    return <ProgressBar progress={activity.progress || 0} />;
  }

  if (activity.type === 'time_context') {
    const iconMap: Record<string, React.ReactNode> = {
      calendar: <BookOpen size={13} />,
      clipboard: <ClipboardList size={13} />,
      clock: <Clock size={13} />,
      check: <CheckCircle2 size={13} />,
      trending: <TrendingUp size={13} />,
    };
    return (
      <div className="flex items-center gap-2 px-1 text-sky-400">
        {iconMap[activity.metadata?.icon] || <Clock size={13} />}
        <span className="text-[12px] font-bold">{activity.title}</span>
      </div>
    );
  }

  return null;
}

// ═══════════════════════════════════════════════
//  SECONDARY BUBBLE STATES (detached circle)
// ═══════════════════════════════════════════════

export function MinimalSecondaryActivity({ activity }: { activity: LiveActivity }) {
  if (activity.type === 'timer') return <Timer size={14} className="text-[#4F8EF7]" />;
  if (activity.type === 'music') return <AudioWaveform isPlaying={activity.isActive} />;
  if (activity.type === 'schedule') return <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />;
  if (activity.type === 'exam_countdown') {
    const dotColors: Record<string, string> = { low: 'bg-emerald-500', medium: 'bg-yellow-500', high: 'bg-orange-500', critical: 'bg-red-500 animate-pulse' };
    return <div className={cn("w-3 h-3 rounded-full", dotColors[activity.metadata?.urgency || 'medium'])} />;
  }
  if (activity.type === 'progress') return <Zap size={14} className="text-cyan-400" />;
  if (activity.type === 'time_context') return <Clock size={14} className="text-sky-400" />;
  if (activity.type === 'academic_status') return <TrendingUp size={14} className="text-emerald-400" />;
  return <div className="w-2 h-2 rounded-full bg-white/50" />;
}

// ═══════════════════════════════════════════════
//  EXPANDED STATES (800px dropdown panels)
// ═══════════════════════════════════════════════

const STAGGER_ANIMATION = {
  initial: { opacity: 0, filter: "blur(10px)", scale: 0.95, y: 10 },
  animate: { opacity: 1, filter: "blur(0px)", scale: 1, y: 0 },
  exit: { opacity: 0, filter: "blur(5px)", scale: 0.95, transition: { duration: 0.05 } },
  transition: { type: "spring", stiffness: 400, damping: 30, delay: 0.1 }
};

export function ExpandedActivity({ activity }: { activity: LiveActivity }) {
  const time = useLiveTimer(activity);
  const updateActivity = useDynamicIslandStore((s) => s.updateActivity);
  const updateCourse = useUSMStore(s => s.updateCourse);
  const addAttendanceHistoryEvent = useUSMStore(s => s.addAttendanceHistoryEvent);

  // --- TIMER ---
  if (activity.type === 'timer') {
    const isActive = activity.isActive ?? true;

    const handleTogglePause = (e: React.MouseEvent) => {
      e.stopPropagation();
      const now = Date.now();
      if (isActive) {
        // Pausing: Calculate exact remaining time, clear endTime
        const remaining = activity.metadata?.endTime 
          ? Math.max(0, Math.floor((activity.metadata.endTime - now) / 1000))
          : activity.timeRemaining || 0;
          
        updateActivity(activity.id, { 
          isActive: false, 
          timeRemaining: remaining,
          metadata: { ...activity.metadata, endTime: undefined } 
        });
      } else {
        // Resuming: Project new endTime
        const newEndTime = now + ((activity.timeRemaining || 0) * 1000);
        updateActivity(activity.id, { 
          isActive: true, 
          metadata: { ...activity.metadata, endTime: newEndTime } 
        });
      }
    };

    return (
      <motion.div {...STAGGER_ANIMATION} className="w-full flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-[#4F8EF7]/10 flex items-center justify-center border border-[#4F8EF7]/20 shadow-[0_0_20px_rgba(79,142,247,0.2)]">
            <Timer size={32} className="text-[#4F8EF7]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[#4F8EF7] text-[13px] font-bold uppercase tracking-widest">{activity.title}</span>
            <span className="text-white text-[40px] font-mono font-light tracking-tight leading-none mt-1">{formatTime(time)}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleTogglePause}
            className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors border border-white/5 shadow-lg active:scale-95"
          >
            {isActive ? <Pause size={24} className="text-white" fill="currentColor" /> : <Play size={24} className="text-white ml-1" fill="currentColor" />}
          </button>
        </div>
      </motion.div>
    );
  }

  // --- ACADEMIC STATUS ---
  if (activity.type === 'academic_status') {
    return (
      <motion.div {...STAGGER_ANIMATION} className="w-full flex flex-col items-center justify-center px-8 py-8 gap-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_20px_rgba(52,211,153,0.2)]">
          <TrendingUp size={32} className="text-emerald-400" />
        </div>
        <div className="flex flex-col items-center text-center">
          <span className="text-emerald-400 text-[13px] font-bold uppercase tracking-widest mb-2">Live Academic Status</span>
          <span className="text-white text-[48px] font-black tracking-tighter leading-none">{activity.title}</span>
        </div>
      </motion.div>
    );
  }

  // --- MUSIC PLAYER ---
  if (activity.type === 'music') {
    const isActive = activity.isActive ?? true;
    const art = activity.metadata?.albumArt || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80";
    
    const handleTogglePlay = (e: React.MouseEvent) => {
      e.stopPropagation();
      updateActivity(activity.id, { isActive: !isActive });
    };

    return (
      <motion.div {...STAGGER_ANIMATION} className="w-full relative overflow-hidden flex items-center justify-between px-8 py-6 rounded-[44px]">
        <div
          className="absolute inset-0 opacity-40 blur-3xl saturate-200"
          style={{ backgroundImage: `url(${art})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-2xl" />
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-2xl relative border border-white/10">
            <img src={art} alt="Album Art" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-white text-[24px] font-bold tracking-tight leading-tight">{activity.title}</span>
            <span className="text-white/60 text-[16px] font-medium mt-1">{activity.subtitle || "Lofi Girl"}</span>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-6">
          <button className="text-white/50 hover:text-white transition-colors active:scale-95"><SkipBack size={24} fill="currentColor" /></button>
          <button 
            onClick={handleTogglePlay}
            className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.3)]"
          >
            {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
          </button>
          <button className="text-white/50 hover:text-white transition-colors active:scale-95"><SkipForward size={24} fill="currentColor" /></button>
        </div>
      </motion.div>
    );
  }

  // --- SCHEDULE ---
  if (activity.type === 'schedule') {
    const totalTime = activity.metadata?.totalTime || 3600;
    const progress = ((1 - time / totalTime) * 100);
    return (
      <motion.div {...STAGGER_ANIMATION} className="w-full flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-6">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="30" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
              <circle cx="32" cy="32" r="30" stroke="#a855f7" strokeWidth="4" fill="none" strokeDasharray="188.5" strokeDashoffset={188.5 - (188.5 * progress) / 100} className="transition-all duration-1000 ease-linear" />
            </svg>
            <BookOpen size={24} className="text-purple-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-purple-400 text-[13px] font-bold uppercase tracking-widest">Ongoing Class</span>
            <span className="text-white text-[28px] font-bold tracking-tight leading-none mt-1">{activity.title}</span>
          </div>
        </div>
        <div className="flex flex-col items-end text-right">
          <span className="text-white text-[32px] font-mono font-light tracking-tight leading-none">{formatTime(time)}</span>
          {activity.metadata?.nextClass && (
            <span className="text-white/40 text-[13px] font-medium mt-2">Up next: <span className="text-white/80">{activity.metadata.nextClass}</span></span>
          )}
        </div>
      </motion.div>
    );
  }

  // --- EXAM COUNTDOWN ---
  if (activity.type === 'exam_countdown') {
    const urgencyGradients: Record<string, string> = {
      low: 'from-emerald-500/20 to-emerald-500/5',
      medium: 'from-yellow-500/20 to-yellow-500/5',
      high: 'from-orange-500/20 to-orange-500/5',
      critical: 'from-red-500/20 to-red-500/5',
    };
    const urgencyText: Record<string, string> = {
      low: 'text-emerald-400',
      medium: 'text-yellow-400',
      high: 'text-orange-400',
      critical: 'text-red-400',
    };
    const urgency = activity.metadata?.urgency || 'medium';

    return (
      <motion.div {...STAGGER_ANIMATION} className={cn("w-full flex items-center justify-between px-8 py-6 bg-gradient-to-r rounded-[44px]", urgencyGradients[urgency])}>
        <div className="flex items-center gap-6">
          <div className={cn("w-16 h-16 rounded-full flex items-center justify-center border shadow-lg", 
            urgency === 'critical' ? 'bg-red-500/20 border-red-500/30' : 'bg-white/5 border-white/10'
          )}>
            <Flame size={32} className={urgencyText[urgency]} />
          </div>
          <div className="flex flex-col">
            <span className={cn("text-[13px] font-bold uppercase tracking-widest", urgencyText[urgency])}>
              {urgency === 'critical' ? '⚠ EXAM IMMINENT' : 'Upcoming Exam'}
            </span>
            <span className="text-white text-[28px] font-bold tracking-tight leading-none mt-1">{activity.title}</span>
            {activity.subtitle && <span className="text-white/40 text-[13px] mt-1">{activity.subtitle}</span>}
          </div>
        </div>
        <div className="flex flex-col items-end text-right">
          <span className={cn("text-[36px] font-mono font-light tracking-tight leading-none", urgencyText[urgency])}>
            {activity.metadata?.daysRemaining || 0}d {activity.metadata?.hoursRemaining || 0}h
          </span>
          <span className="text-white/30 text-[12px] font-medium mt-1 uppercase tracking-widest">remaining</span>
        </div>
      </motion.div>
    );
  }

  // --- PROGRESS ---
  if (activity.type === 'progress') {
    const prog = activity.progress || 0;
    return (
      <motion.div {...STAGGER_ANIMATION} className="w-full flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
            <Zap size={32} className="text-cyan-400" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-cyan-400 text-[13px] font-bold uppercase tracking-widest">{activity.title}</span>
            <div className="w-64 h-2 rounded-full bg-white/10 overflow-hidden mt-3">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${prog}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
        <span className="text-white text-[36px] font-mono font-light tracking-tight">{Math.round(prog)}%</span>
      </motion.div>
    );
  }

  // --- BUNK CALCULATOR ---
  if (activity.type === 'bunk_calculator') {
    const stats = activity.metadata?.allStats || [];
    
    const handleLogAttendance = (e: React.MouseEvent, courseId: string, bunkedCount: number, totalCount: number, isBunk: boolean, courseName: string) => {
      e.stopPropagation();
      updateCourse(courseId, { attendanceBunked: bunkedCount, attendanceTotal: totalCount });
      addAttendanceHistoryEvent({
        courseId,
        dateStr: new Date().toISOString().split("T")[0],
        action: isBunk ? "BUNKED" : "ATTENDED",
      });
      // The BunkCalculatorController automatically syncs and updates the UI!
    };
    
    return (
      <motion.div {...STAGGER_ANIMATION} className="w-full flex flex-col px-6 py-6 max-h-[300px] overflow-y-auto no-scrollbar">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <AlertCircle size={24} className="text-red-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-red-400 text-[11px] font-bold uppercase tracking-widest">Attendance Risk</span>
            <span className="text-white text-[24px] font-bold tracking-tight leading-none">{activity.subtitle}</span>
          </div>
        </div>

        <div className="w-full space-y-2 mt-2">
          {stats.slice(0, 4).map((s: any) => {
            const isCritical = s.risk === 'CRITICAL';
            const isWarning = s.risk === 'WARNING';
            const color = isCritical ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-emerald-400';
            const bg = isCritical ? 'bg-red-500/10 border-red-500/20' : isWarning ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-white/5 border-white/5';
            
            return (
              <div key={s.id} className={cn("group flex items-center justify-between p-3 rounded-2xl border transition-all hover:bg-white/10 cursor-default", bg)}>
                <div className="flex flex-col flex-1">
                  <span className="text-white font-medium text-[14px] truncate max-w-[150px]">{s.name}</span>
                  <div className="flex items-center gap-2 mt-1 h-5">
                    <span className="text-white/40 text-[11px]">{Math.round(s.percentage)}% • {s.total - s.bunked}/{s.total}</span>
                    <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => handleLogAttendance(e, s.id, s.bunked + 1, s.total + 1, true, s.name)}
                        className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-md text-[9px] font-black uppercase tracking-wider hover:bg-red-500/30 transition-colors"
                      >Bunk</button>
                      <button 
                        onClick={(e) => handleLogAttendance(e, s.id, s.bunked, s.total + 1, false, s.name)}
                        className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-md text-[9px] font-black uppercase tracking-wider hover:bg-emerald-500/30 transition-colors"
                      >Attend</button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className={cn("font-black text-[18px]", color)}>
                    {s.bunksRemaining < 0 ? s.bunksRemaining : `+${s.bunksRemaining}`}
                  </span>
                  <span className={cn("text-[10px] uppercase tracking-wider font-bold", color)}>
                    {s.bunksRemaining < 0 ? 'Deficit' : 'Safe'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  // --- TIME CONTEXT ---
  if (activity.type === 'time_context') {
    return (
      <motion.div {...STAGGER_ANIMATION} className="w-full flex items-center justify-center px-8 py-6 gap-4">
        <div className="w-14 h-14 rounded-full bg-sky-500/10 flex items-center justify-center border border-sky-500/20 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
          <Clock size={28} className="text-sky-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-sky-400 text-[13px] font-bold uppercase tracking-widest mb-1">Today&apos;s Context</span>
          <span className="text-white text-[32px] font-bold tracking-tight leading-none">{activity.title}</span>
        </div>
      </motion.div>
    );
  }

  // --- FALLBACK ---
  return (
    <motion.div {...STAGGER_ANIMATION} className="w-full p-8 text-center">
      <span className="text-white/50">{activity.title}</span>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════
//  ALERTS
// ═══════════════════════════════════════════════

export function IslandAlertView({ alert }: { alert: IslandAlert }) {
  const colors = {
    success: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10 shadow-[0_0_20px_rgba(52,211,153,0.15)]",
    warning: "text-amber-400 border-amber-500/20 bg-amber-500/10 shadow-[0_0_20px_rgba(251,191,36,0.15)]",
    error: "text-red-400 border-red-500/20 bg-red-500/10 shadow-[0_0_20px_rgba(248,113,113,0.15)]",
    info: "text-blue-400 border-blue-500/20 bg-blue-500/10 shadow-[0_0_20px_rgba(96,165,250,0.15)]",
  };
  const iconColors = {
    success: "text-emerald-400",
    warning: "text-amber-400",
    error: "text-red-400",
    info: "text-blue-400",
  };

  const dismissAlert = useDynamicIslandStore((s) => s.dismissAlert);

  return (
    <motion.div 
      {...STAGGER_ANIMATION} 
      className="w-full flex flex-col px-6 py-5 gap-3"
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDragEnd={(e, { offset, velocity }) => {
        if (offset.y < -50 || velocity.y < -500) {
          dismissAlert();
        }
      }}
      whileDrag={{ scale: 0.95 }}
    >
      <div className="flex items-center gap-4">
        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center border shrink-0", colors[alert.type])}>
          <AlertCircle size={24} className={iconColors[alert.type]} />
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-white font-bold text-[16px] tracking-tight">{alert.title}</span>
          <span className="text-white/60 text-[14px] leading-tight mt-0.5">{alert.message}</span>
        </div>
      </div>

      {alert.actions && alert.actions.length > 0 && (
        <div className="flex items-center gap-2 mt-2">
          {alert.actions.map((action, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
                dismissAlert();
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-[13px] font-bold tracking-tight hover:scale-[1.02] active:scale-[0.98]",
                colors[alert.type]
              )}
            >
              {action.icon === 'mail' && <Mail size={14} />}
              {action.icon === 'calendar' && <BookOpen size={14} />}
              {action.icon === 'zap' && <Zap size={14} />}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ═══════════════════════════════════════════════
//  JARVIS — GradeFlow AI Operating System
// ═══════════════════════════════════════════════

interface JarvisHighlight {
  label: string;
  value: string;
  color: "blue" | "green" | "amber" | "red" | "purple" | "cyan";
}

interface JarvisSuggestedAction {
  label: string;
  query: string;
}

interface JarvisAction {
  type: "navigate" | "mark_attendance" | "set_target_cgpa" | "set_exam_countdown" | "show_alert" | "set_streak" | "none";
  route?: string;
  courseId?: string;
  attendanceAction?: "ATTENDED" | "BUNKED";
  value?: number;
  subject?: string;
  examDate?: string;
  alertType?: "success" | "warning" | "error" | "info";
  alertTitle?: string;
  alertMessage?: string;
  streakCount?: number;
  streakType?: "study" | "attendance" | "assignment";
  streakLabel?: string;
}

interface JarvisMetadata {
  responseType: string;
  title: string;
  highlights?: JarvisHighlight[];
  action?: JarvisAction;
  followUp?: string | null;
  suggestedActions?: JarvisSuggestedAction[];
}

const HIGHLIGHT_COLORS: Record<string, string> = {
  blue: "bg-blue-500/15 border-blue-500/30 text-blue-300",
  green: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
  amber: "bg-amber-500/15 border-amber-500/30 text-amber-300",
  red: "bg-red-500/15 border-red-500/30 text-red-300",
  purple: "bg-purple-500/15 border-purple-500/30 text-purple-300",
  cyan: "bg-cyan-500/15 border-cyan-500/30 text-cyan-300",
};

const RESPONSE_ICONS: Record<string, string> = {
  data_card: "📊",
  action: "⚡",
  advice: "🧠",
  navigation: "🧭",
  error: "⚠️",
};

const QUICK_COMMANDS = [
  { name: "What's my CGPA?", icon: Flame, color: "text-orange-400", query: "What is my current CGPA and SGPA?" },
  { name: "Can I bunk today?", icon: AlertCircle, color: "text-red-400", query: "How many bunks do I have left in each subject?" },
  { name: "Am I placement ready?", icon: Zap, color: "text-cyan-400", query: "Check my placement eligibility across all companies" },
  { name: "What should I focus on?", icon: BookOpen, color: "text-purple-400", query: "Based on my current academic data, what should I focus on this week?" },
  { name: "Academic health check", icon: CheckCircle2, color: "text-emerald-400", query: "Give me a full academic health report" },
  { name: "Set my target CGPA", icon: Flame, color: "text-amber-400", query: "Set my target CGPA to 8.5" },
];

export function IslandSpotlightView({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [streamedMessage, setStreamedMessage] = useState("");
  const [metadata, setMetadata] = useState<JarvisMetadata | null>(null);
  const [isDoneStreaming, setIsDoneStreaming] = useState(false);
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Execute JARVIS actions on stores
  const executeAction = React.useCallback((action: JarvisAction) => {
    const { useDynamicIslandStore: islandStore } = require("@/stores/dynamicIslandStore");
    const { useUSMStore: usmStore } = require("@/stores/usmStore");

    switch (action.type) {
      case "navigate":
        if (action.route) {
          setTimeout(() => { router.push(action.route!); onClose(); }, 1500);
        }
        break;

      case "mark_attendance":
        if (action.courseId && action.attendanceAction) {
          const store = usmStore.getState();
          const course = store.courses.find((c: any) => c.id === action.courseId || c.code === action.courseId);
          if (course) {
            if (action.attendanceAction === "BUNKED") {
              store.updateCourse(course.id, { attendanceBunked: course.attendanceBunked + 1 });
            } else {
              store.updateCourse(course.id, { attendanceTotal: course.attendanceTotal + 1 });
            }
            islandStore.getState().showAlert({
              id: `jarvis-att-${Date.now()}`,
              type: action.attendanceAction === "BUNKED" ? "warning" : "success",
              title: action.attendanceAction === "BUNKED" ? "Bunk Recorded" : "Attendance Marked",
              message: `${course.name} marked as ${action.attendanceAction.toLowerCase()}.`,
              duration: 3000,
            });
          }
        }
        break;

      case "set_target_cgpa":
        if (action.value !== undefined) {
          usmStore.getState().setAcademic({ targetCgpa: action.value });
          islandStore.getState().showAlert({
            id: `jarvis-target-${Date.now()}`,
            type: "success",
            title: "Target Updated",
            message: `Target CGPA set to ${action.value}`,
            duration: 3000,
          });
        }
        break;

      case "set_exam_countdown":
        if (action.subject && action.examDate) {
          const examDate = new Date(action.examDate);
          const now = new Date();
          const diffMs = examDate.getTime() - now.getTime();
          const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
          const hours = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));

          islandStore.getState().setExamCountdown({
            id: `jarvis-exam-${Date.now()}`,
            subject: action.subject,
            examDate,
            daysRemaining: days,
            hoursRemaining: hours,
            minutesRemaining: 0,
            urgency: days <= 3 ? "critical" : days <= 7 ? "high" : days <= 14 ? "medium" : "low",
          });
        }
        break;

      case "show_alert":
        if (action.alertTitle) {
          islandStore.getState().showAlert({
            id: `jarvis-alert-${Date.now()}`,
            type: action.alertType || "info",
            title: action.alertTitle,
            message: action.alertMessage || "",
            duration: 4000,
          });
        }
        break;

      case "set_streak":
        if (action.streakCount) {
          islandStore.getState().setStreak({
            count: action.streakCount,
            type: action.streakType || "study",
            label: action.streakLabel || `${action.streakCount} Day Streak`,
          });
        }
        break;
    }
  }, [router, onClose]);

  const executeQuery = async (userQuery: string) => {
    if (!userQuery.trim()) return;

    setIsProcessing(true);
    setMetadata(null);
    setStreamedMessage("");
    setIsDoneStreaming(false);

    const command = userQuery.trim();

    // Layer 1: Instant Local Routing (slash commands)
    const localRoutes: Record<string, string> = {
      "/open placement": "/placement",
      "/open attendance": "/attendance",
      "/open calculator": "/calculator",
      "/open dashboard": "/dashboard",
      "/open timeline": "/timeline",
      "/open backlog": "/backlog",
      "/open forecast": "/forecast",
      "/open planner": "/planner",
    };

    for (const [cmd, route] of Object.entries(localRoutes)) {
      if (command.toLowerCase().startsWith(cmd)) {
        router.push(route);
        onClose();
        return;
      }
    }

    // Layer 2: JARVIS AI — Full context streaming query
    try {
      const { buildJarvisContext } = await import("@/lib/ai/jarvisContextBuilder");
      const currentRoute = typeof window !== "undefined" ? window.location.pathname : "/";
      const studentContext = buildJarvisContext(currentRoute);

      const res = await fetch("/api/jarvis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: command, studentContext })
      });

      if (!res.ok) {
        setMetadata({
          responseType: "error",
          title: "Connection Error",
          highlights: [],
          action: { type: "none" },
        });
        setStreamedMessage("Could not reach JARVIS. Check your API key in .env.local.");
        setIsDoneStreaming(true);
        setIsProcessing(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream reader");

      const decoder = new TextDecoder();
      let buffer = "";
      let metadataReceived = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.type === "metadata") {
              setMetadata(parsed);
              metadataReceived = true;
              setIsProcessing(false);
              // Execute action immediately
              if (parsed.action && parsed.action.type !== "none") {
                executeAction(parsed.action);
              }
            } else if (parsed.type === "chunk") {
              setStreamedMessage(prev => prev + parsed.text);
            } else if (parsed.type === "done") {
              setIsDoneStreaming(true);
            }
          } catch {
            // Skip malformed JSON lines
          }
        }
      }

      // Handle non-streaming responses (fallback)
      if (!metadataReceived && buffer.trim()) {
        try {
          const data = JSON.parse(buffer);
          setMetadata({
            responseType: data.responseType || "advice",
            title: data.title || "JARVIS",
            highlights: data.highlights || [],
            action: data.action || { type: "none" },
            followUp: data.followUp,
            suggestedActions: data.suggestedActions,
          });
          setStreamedMessage(data.message || buffer);
          if (data.action && data.action.type !== "none") {
            executeAction(data.action);
          }
        } catch {
          setMetadata({ responseType: "advice", title: "JARVIS", highlights: [] });
          setStreamedMessage(buffer);
        }
        setIsDoneStreaming(true);
      }

    } catch (err) {
      console.error("JARVIS Error:", err);
      setMetadata({
        responseType: "error",
        title: "System Failure",
        highlights: [],
        action: { type: "none" },
      });
      setStreamedMessage("JARVIS encountered an internal error. Please try again.");
      setIsDoneStreaming(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      executeQuery(query);
    }
    if (e.key === "Escape") {
      if (metadata) {
        setMetadata(null);
        setStreamedMessage("");
        setQuery("");
      } else {
        onClose();
      }
    }
  };

  const hasResponse = metadata !== null;

  return (
    <motion.div {...STAGGER_ANIMATION} className="w-full flex flex-col p-4 gap-3">
      {/* JARVIS Input Bar */}
      <div className="relative flex items-center bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 focus-within:bg-white/[0.06] focus-within:border-blue-500/50 transition-all duration-300 shadow-inner group">
        <motion.div
          animate={isProcessing ? { rotate: 360 } : { rotate: 0 }}
          transition={isProcessing ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
        >
          <Sparkles size={20} className={cn("mr-3 shrink-0 transition-colors", isProcessing ? "text-cyan-400" : "text-blue-400")} />
        </motion.div>
        <input 
          ref={inputRef}
          autoFocus
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isProcessing}
          placeholder="Ask JARVIS anything..." 
          className="bg-transparent border-none outline-none text-white text-[16px] w-full font-medium placeholder-white/30 disabled:opacity-50"
        />
        {!isProcessing && !hasResponse && (
          <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-md ml-3 border border-white/5 shrink-0">
            <Command size={12} className="text-white/50" />
            <span className="text-white/50 text-[10px] font-bold">K</span>
          </div>
        )}
        {hasResponse && (
          <button
            onClick={() => { setMetadata(null); setStreamedMessage(""); setQuery(""); inputRef.current?.focus(); }}
            className="ml-2 text-white/40 hover:text-white/80 transition-colors shrink-0 text-xs font-bold uppercase tracking-widest"
          >
            Clear
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="min-h-[120px] relative">
        <AnimatePresence mode="wait">
          {/* STATE 1: Processing (Google Assistant Dots) */}
          {isProcessing && (
            <motion.div 
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4"
            >
              <div className="flex items-center justify-center gap-3">
                {[
                  { color: "bg-[#4285F4]" },
                  { color: "bg-[#EA4335]" },
                  { color: "bg-[#FBBC05]" },
                  { color: "bg-[#34A853]" }
                ].map((dot, i) => (
                  <motion.div
                    key={i}
                    animate={{ y: ["0%", "-100%", "0%"] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
                    className={cn("w-3.5 h-3.5 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.2)]", dot.color)}
                  />
                ))}
              </div>
              <span className="text-white/50 text-xs font-mono tracking-widest uppercase animate-pulse">
                JARVIS is thinking...
              </span>
            </motion.div>
          )}

          {/* STATE 2: JARVIS Streaming Response */}
          {!isProcessing && hasResponse && (
            <motion.div
              key="response"
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1"
            >
              {/* Response Header */}
              <div className="flex items-center gap-2">
                <span className="text-lg">{RESPONSE_ICONS[metadata!.responseType] || "🤖"}</span>
                <span className="text-white font-bold text-[15px] tracking-tight">{metadata!.title}</span>
                <span className="ml-auto text-[10px] text-white/30 font-mono uppercase tracking-widest">JARVIS</span>
              </div>

              {/* Streamed Message */}
              <p className="text-white/75 text-[14px] leading-relaxed">
                {streamedMessage}
                {!isDoneStreaming && <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} className="inline-block w-[2px] h-[14px] bg-cyan-400 ml-0.5 align-text-bottom" />}
              </p>

              {/* Stat Highlight Chips */}
              {metadata!.highlights && metadata!.highlights.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {metadata!.highlights.map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.08 }}
                      className={cn("px-3 py-1.5 rounded-lg border text-[12px] font-bold flex items-center gap-2", HIGHLIGHT_COLORS[h.color] || HIGHLIGHT_COLORS.blue)}
                    >
                      <span className="opacity-70">{h.label}</span>
                      <span className="font-extrabold">{h.value}</span>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Navigate Button */}
              {metadata!.action?.type === "navigate" && metadata!.action.route && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  onClick={() => { router.push(metadata!.action!.route!); onClose(); }}
                  className="mt-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[13px] font-bold hover:bg-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] w-fit"
                >
                  Go deeper <ArrowRight size={14} />
                </motion.button>
              )}

              {/* Suggested Action Buttons */}
              {isDoneStreaming && metadata!.suggestedActions && metadata!.suggestedActions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap gap-2 mt-2"
                >
                  {metadata!.suggestedActions.map((sa, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setQuery(sa.query);
                        setMetadata(null);
                        setStreamedMessage("");
                        setIsDoneStreaming(false);
                        executeQuery(sa.query);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white/60 text-[12px] font-semibold hover:bg-white/[0.08] hover:text-white/90 hover:border-white/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Sparkles size={12} className="text-cyan-400/60" />
                      {sa.label}
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Follow-up (text) */}
              {isDoneStreaming && metadata!.followUp && !metadata!.suggestedActions?.length && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  onClick={() => {
                    const fq = metadata!.followUp!;
                    setQuery(fq);
                    setMetadata(null);
                    setStreamedMessage("");
                    executeQuery(fq);
                  }}
                  className="flex items-center gap-2 text-[12px] text-white/40 hover:text-white/70 transition-colors mt-1 group"
                >
                  <Sparkles size={12} className="group-hover:text-cyan-400 transition-colors" />
                  <span className="italic">{metadata!.followUp}</span>
                  <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              )}
            </motion.div>
          )}

          {/* STATE 3: Quick Commands (Default Idle State) */}
          {!isProcessing && !hasResponse && (
            <motion.div 
              key="suggestions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-2 px-1"
            >
              {QUICK_COMMANDS.map((cmd, i) => (
                <button 
                  key={i}
                  onClick={() => {
                    setQuery(cmd.query);
                    executeQuery(cmd.query);
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                    <cmd.icon size={16} className={cmd.color} />
                  </div>
                  <span className="text-white/80 text-[13px] font-medium group-hover:text-white transition-colors truncate">{cmd.name}</span>
                  <ArrowRight size={14} className="text-white/20 ml-auto group-hover:text-white/60 group-hover:translate-x-1 transition-all shrink-0" />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════
//  FOCUS TIMER EXPANDED VIEW
// ═══════════════════════════════════════════════

export function FocusTimerActivity() {
  const { focusMode, endTime, isFocusActive, focusStreak } = useUSMStore((state) => state.focus);
  const stopFocus = useUSMStore((state) => state.stopFocus);
  const resetFocus = useUSMStore((state) => state.resetFocus);
  
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!isFocusActive || !endTime) {
      return;
    }
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);
    }, 200);
    return () => clearInterval(interval);
  }, [endTime, isFocusActive]);

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

  const getBgColor = () => {
    switch (focusMode) {
      case "WORK": return "bg-indigo-500/20";
      case "SHORT_BREAK": return "bg-emerald-500/20";
      case "LONG_BREAK": return "bg-blue-500/20";
      default: return "bg-white/10";
    }
  };

  if (!isFocusActive) return null;

  // Assume total time is 25 minutes for WORK, 5 for SHORT, 15 for LONG
  const totalSeconds = focusMode === "WORK" ? 25 * 60 : focusMode === "SHORT_BREAK" ? 5 * 60 : 15 * 60;
  const progress = Math.min(100, Math.max(0, 100 - (timeLeft / totalSeconds) * 100));

  return (
    <motion.div {...STAGGER_ANIMATION} className="w-full px-6 py-6 min-w-[320px]">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-lg", getBgColor(), getModeColor())}>
            {focusMode === "WORK" ? <Flame size={16} /> : <Coffee size={16} />}
          </div>
          <span className="font-bold text-white/80 uppercase tracking-wider text-xs">
            {focusMode.replace("_", " ")}
          </span>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-md border border-white/10">
          <span className="text-xs text-white/40">Streak</span>
          <span className="text-xs font-bold text-orange-400">{focusStreak}</span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-4">
        <div className={cn("text-6xl font-black tabular-nums tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]", getModeColor())}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-2 mb-6">
        <div 
          className={cn("h-full transition-all duration-200", getBgColor().replace('/20', '/80'))}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-center gap-4 border-t border-white/10 pt-4">
        <button 
          onClick={stopFocus}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-semibold transition-all text-sm"
        >
          <Pause size={16} /> Pause
        </button>
        <button 
          onClick={resetFocus}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-semibold transition-all text-sm"
        >
          <AlertCircle size={16} /> Stop
        </button>
      </div>
    </motion.div>
  );
}

