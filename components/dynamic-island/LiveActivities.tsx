"use client";
import { useChat } from "@ai-sdk/react";

import React from "react";

import { motion, AnimatePresence } from "framer-motion";
import {
  Timer, TrendingUp, AlertCircle, Play, Pause,
  SkipBack, SkipForward, BookOpen, Clock,
  ClipboardList, Flame, Zap, CheckCircle2,
  Search, Command, Sparkles, ArrowRight, Mail, Coffee,
  Navigation, Check, Phone, X, Bell, AlertTriangle, Info,
  MoreHorizontal, Settings, RotateCcw, Heart, Sliders, Hash, Map, RefreshCw,
  ScanLine, Share2, Users, MapPin
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

function AudioWaveform({ isPlaying, color = "#FF2D55" }: { isPlaying: boolean; color?: string }) {
  return (
    <div className="flex items-center gap-[2px] h-3 px-1">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          animate={{ height: isPlaying ? ["3px", "12px", "3px"] : "3px" }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          className="w-[2px] rounded-full"
          style={{ backgroundColor: color }}
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
      <div className="flex items-center justify-between w-full px-2 text-[#FF9F0A]">
        <div className="flex items-center gap-1.5">
          <Timer size={16} fill="currentColor" className="opacity-80" />
        </div>
        <span className="text-[14px] font-medium tracking-tight tabular-nums" style={{ color: '#FF9F0A' }}>{formatTime(time)}</span>
      </div>
    );
  }

  if (activity.type === 'music') {
    return (
      <div className="flex items-center justify-between w-full px-2">
        <div className="w-5 h-5 rounded-md overflow-hidden bg-white/10 shrink-0 border border-white/5">
          <img src={activity.metadata?.albumArt || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=50&q=80"} alt="Art" className="w-full h-full object-cover" />
        </div>
        <AudioWaveform isPlaying={activity.isActive} color="#FF2D55" />
      </div>
    );
  }

  if (activity.type === 'schedule') {
    return (
      <div className="flex items-center justify-between w-full px-2">
        <div className="w-5 h-5 rounded-full bg-[#007AFF] flex items-center justify-center shrink-0">
          <Navigation size={12} className="text-white fill-white transform rotate-45" />
        </div>
        <span className="text-[14px] font-medium tracking-tight" style={{ color: '#007AFF' }}>{formatTime(time)}</span>
      </div>
    );
  }

  if (activity.type === 'progress') {
    return (
      <div className="flex items-center justify-between w-full px-2">
        <span className="text-[14px] font-medium text-white tracking-tight ml-1">Syncing</span>
        <div className="relative w-5 h-5 ml-2">
           <svg className="w-full h-full transform -rotate-90">
              <circle cx="10" cy="10" r="9" stroke="rgba(255,255,255,0.2)" strokeWidth="2" fill="none" />
              <circle cx="10" cy="10" r="9" stroke="#007AFF" strokeWidth="2" fill="none" strokeDasharray="56.5" strokeDashoffset={56.5 - (56.5 * (activity.progress || 0)) / 100} />
           </svg>
        </div>
      </div>
    );
  }

  if (activity.type === 'exam_countdown' || activity.type === 'bunk_calculator') {
    const isCritical = activity.metadata?.urgency === 'critical' || activity.metadata?.riskiest?.risk === 'CRITICAL';
    const color = isCritical ? '#FF3B30' : '#FF9F0A';
    return (
      <div className="flex items-center justify-between w-full px-2">
        <span className="text-[14px] font-medium tracking-tight ml-1" style={{ color: isCritical ? '#FF3B30' : '#FFFFFF' }}>{activity.type === 'exam_countdown' ? 'Exam' : 'Risk'}</span>
        <div className="flex items-center gap-1.5 ml-2">
           <span className="text-[12px] font-bold" style={{ color }}>{isCritical ? 'Critical' : 'Warning'}</span>
           <div className="w-5 h-2.5 rounded-[3px] border opacity-80 flex items-center p-[1px]" style={{ borderColor: color }}>
             <div className="h-full rounded-[1px]" style={{ width: isCritical ? '20%' : '50%', backgroundColor: color }} />
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between w-full px-2">
      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0">
        <Check size={16} className="text-[#34C759]" />
      </div>
      <span className="text-[14px] font-medium tracking-tight ml-2" style={{ color: '#34C759' }}>{activity.title.substring(0,10)}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  SECONDARY BUBBLE STATES (detached circle)
// ═══════════════════════════════════════════════

export function MinimalSecondaryActivity({ activity }: { activity: LiveActivity }) {
  if (activity.type === 'timer') return <Timer size={18} color="#FF9F0A" fill="currentColor" />;
  if (activity.type === 'music') return <AudioWaveform isPlaying={activity.isActive} color="#FF2D55" />;
  if (activity.type === 'schedule') return <Navigation size={16} color="#007AFF" fill="#007AFF" className="transform rotate-45" />;
  if (activity.type === 'exam_countdown' || activity.type === 'bunk_calculator') return <div className="w-4 h-4 rounded-full bg-[#FF3B30] flex items-center justify-center"><AlertCircle size={10} color="#FFFFFF" /></div>;
  if (activity.type === 'progress') return <Zap size={16} color="#007AFF" fill="#007AFF" />;
  return <Check size={18} color="#34C759" />;
}

// ═══════════════════════════════════════════════
//  EXPANDED STATES (800px dropdown panels)
// ═══════════════════════════════════════════════

const STAGGER_ANIMATION = {
  initial: { opacity: 0, filter: "blur(10px)", scale: 0.95, y: 10 },
  animate: { opacity: 1, filter: "blur(0px)", scale: 1, y: 0 },
  exit: { opacity: 0, filter: "blur(5px)", scale: 0.95, transition: { duration: 0.05 } },
  transition: { type: "spring", stiffness: 350, damping: 28, mass: 1, delay: 0.1 }
};

export function ExpandedActivity({ activity }: { activity: LiveActivity }) {
  const time = useLiveTimer(activity);
  const updateActivity = useDynamicIslandStore((s) => s.updateActivity);
  const [isFlipped, setIsFlipped] = useState(false);

  if (activity.type === 'timer') {
    const isActive = activity.isActive ?? true;
    const handleTogglePause = (e: React.MouseEvent) => {
      e.stopPropagation();
      const now = Date.now();
      if (isActive) {
        const remaining = activity.metadata?.endTime ? Math.max(0, Math.floor((activity.metadata.endTime - now) / 1000)) : activity.timeRemaining || 0;
        updateActivity(activity.id, { isActive: false, timeRemaining: remaining, metadata: { ...activity.metadata, endTime: undefined } });
      } else {
        const newEndTime = now + ((activity.timeRemaining || 0) * 1000);
        updateActivity(activity.id, { isActive: true, metadata: { ...activity.metadata, endTime: newEndTime } });
      }
    };
    
    // Calculate progress for glowing dial
    const total = activity.metadata?.totalTime || 1500; 
    const remaining = time;
    const progress = Math.max(0, Math.min(100, ((total - remaining) / total) * 100));
    const dashOffset = 283 - (283 * progress) / 100;

    return (
      <div className="relative w-full min-h-[160px]" style={{ perspective: '1200px' }}>
        <div className="w-full min-h-[160px] relative transition-transform duration-700 ease-in-out" style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateX(180deg)' : 'rotateX(0deg)' }}>
          
          {/* FRONT */}
          <div className="w-full flex flex-col px-7 py-6 min-h-[160px] justify-between absolute inset-0 rounded-[42px] bg-black shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden" style={{ backfaceVisibility: 'hidden' }}>
            {/* Glowing top ambient light */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-[#FF9F0A] blur-[80px] opacity-20 pointer-events-none" />
            
            <div className="flex items-center justify-between w-full relative z-10 mb-4">
               <span className="text-[#FF9F0A] text-[15px] font-bold tracking-tight">Study Session</span>
               <span className="text-[#FF9F0A] text-[48px] font-medium tracking-tighter tabular-nums leading-none drop-shadow-[0_0_15px_rgba(255,159,10,0.5)]">
                 {formatTime(time)}
               </span>
            </div>

            <div className="flex flex-col gap-2 w-full relative z-10">
              <div className="flex items-center justify-between gap-1 h-8 w-full">
                {Array.from({ length: 40 }).map((_, i) => {
                  const isPast = (i / 40) * 100 < (100 - progress);
                  return (
                    <div 
                      key={i} 
                      className="flex-1 h-full rounded-[1px] transition-all duration-300"
                      style={{ 
                        backgroundColor: isPast ? '#FF9F0A' : 'rgba(255, 255, 255, 0.1)',
                        boxShadow: isPast ? '0 0 8px rgba(255, 159, 10, 0.8)' : 'none',
                        opacity: isPast ? 1 : 0.4
                      }}
                    />
                  );
                })}
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <button onClick={(e) => { e.stopPropagation(); useDynamicIslandStore.getState().removeActivity(activity.id); }} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all text-white/70">
                  <X size={20} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }} className="w-12 h-12 rounded-full bg-[#FF9F0A]/20 text-[#FF9F0A] flex items-center justify-center hover:bg-[#FF9F0A]/30 active:scale-95 transition-all border border-[#FF9F0A]/30">
                  <Settings size={20} />
                </button>
              </div>
            </div>
          </div>
          
          {/* BACK: DEEP UTILITIES */}
          <div className="w-full flex flex-col px-6 py-4 min-h-[160px] justify-between absolute inset-0 rounded-[42px] bg-[#1C1C1E] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}>
            <div className="flex items-center justify-between w-full relative z-10 mb-1">
               <span className="text-[#FF9F0A] text-[14px] font-bold tracking-tight">Focus Utilities</span>
               <button onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 text-white/70">
                 <X size={14} strokeWidth={3} />
               </button>
            </div>

            {/* Session Tagging */}
            <div className="flex gap-2 mb-1">
              <button className="flex-1 py-1 rounded-full bg-[#FF9F0A]/20 border border-[#FF9F0A]/30 text-[#FF9F0A] text-[10px] font-bold tracking-tight active:scale-95 transition-all">Deep Work</button>
              <button className="flex-1 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 text-[10px] font-bold tracking-tight active:scale-95 transition-all">Coding</button>
              <button className="flex-1 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 text-[10px] font-bold tracking-tight active:scale-95 transition-all">Reading</button>
            </div>

            {/* Pomodoro Cycle Tracker & Dial */}
            <div className="flex items-center justify-between w-full mt-1">
              <div className="flex flex-col gap-1">
                <span className="text-white/50 text-[9px] font-bold uppercase tracking-widest">Pomodoro Cycle</span>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF9F0A] shadow-[0_0_8px_rgba(255,159,10,0.6)]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF9F0A] shadow-[0_0_8px_rgba(255,159,10,0.6)]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-white/70 active:scale-95 transition-all border border-white/10">
                  <span className="font-bold text-[11px]">-5</span>
                </button>
                <div className="relative w-12 h-12 rounded-full border-[3px] border-white/10 flex items-center justify-center">
                   <div className="absolute inset-0 rounded-full border-[3px] border-[#FF9F0A] border-t-transparent border-l-transparent transform rotate-45" />
                   <span className="text-white font-bold text-[13px]">25</span>
                </div>
                <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-white/70 active:scale-95 transition-all border border-white/10">
                  <span className="font-bold text-[11px]">+5</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    );
  }

  if (activity.type === 'music') {
    const isActive = activity.isActive ?? true;
    const art = activity.metadata?.albumArt || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80";
    return (
      <div className="relative w-full min-h-[160px]" style={{ perspective: '1200px' }}>
        <div className="w-full min-h-[160px] relative transition-transform duration-700 ease-in-out" style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateX(180deg)' : 'rotateX(0deg)' }}>
          
          {/* FRONT */}
          <div className="w-full flex flex-col px-7 py-6 min-h-[160px] justify-between absolute inset-0 rounded-[42px] bg-black shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden" style={{ backfaceVisibility: 'hidden' }}>
            {/* Vivid Ambient Glassmorphism */}
            <div className="absolute inset-0 opacity-50 blur-3xl saturate-200 pointer-events-none transition-all duration-1000" style={{ backgroundImage: `url(${art})`, backgroundSize: 'cover', transform: 'scale(1.2)' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
            
            <div className="flex justify-between items-start w-full relative z-10">
              <div className="flex gap-5">
                <div className="relative group cursor-pointer">
                   <img src={art} alt="Art" className="w-20 h-20 rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/20 object-cover" />
                </div>
                <div className="flex flex-col flex-1 min-w-0 mt-2">
                  <span className="text-white text-[19px] font-bold tracking-tight truncate drop-shadow-md">{activity.title}</span>
                  <span className="text-white/70 text-[16px] font-medium truncate drop-shadow-md">{activity.subtitle || "Unknown Artist"}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all text-white/90 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  <Sliders size={16} strokeWidth={2.5} />
                </button>
                <div className="mt-3 mr-2 bg-black/20 p-2 rounded-full backdrop-blur-md border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  <AudioWaveform isPlaying={isActive} color="#FFFFFF" />
                </div>
              </div>
            </div>

            <div className="flex flex-col relative z-10 mt-5 w-full">
              <div className="flex items-center gap-4 w-full px-1">
                <span className="text-white/60 text-[12px] tabular-nums font-bold drop-shadow-sm">1:15</span>
                <div className="flex-1 h-2 bg-black/40 backdrop-blur-sm rounded-full overflow-hidden border border-white/10 shadow-inner group cursor-pointer">
                  <div className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] w-1/3 relative group-hover:bg-[#007AFF] transition-colors">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_8px_2px_rgba(255,255,255,0.9)] opacity-0 group-hover:opacity-100 transition-opacity scale-150" />
                  </div>
                </div>
                <span className="text-white/60 text-[12px] tabular-nums font-bold drop-shadow-sm">-1:18</span>
              </div>
              
              <div className="flex items-center justify-center gap-12 mt-6 mb-2">
                <button className="text-white/70 hover:text-white hover:scale-110 active:scale-95 transition-all"><SkipBack size={36} fill="currentColor" className="drop-shadow-lg" /></button>
                <button onClick={(e) => { e.stopPropagation(); updateActivity(activity.id, { isActive: !isActive }); }} className="text-black bg-white/90 backdrop-blur-md border border-white/20 w-16 h-16 rounded-full flex items-center justify-center hover:scale-105 hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] active:scale-95 transition-all">
                  {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                </button>
                <button className="text-white/70 hover:text-white hover:scale-110 active:scale-95 transition-all"><SkipForward size={36} fill="currentColor" className="drop-shadow-lg" /></button>
              </div>
            </div>
          </div>

          {/* BACK: DEEP UTILITIES */}
          <div className="w-full flex flex-col px-6 py-4 min-h-[160px] justify-between absolute inset-0 rounded-[42px] bg-[#1C1C1E] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}>
            <div className="absolute inset-0 opacity-20 blur-3xl saturate-200 pointer-events-none" style={{ backgroundImage: `url(${art})`, backgroundSize: 'cover', transform: 'scale(1.2)' }} />
            
            <div className="flex items-center justify-between w-full relative z-10 mb-1">
               <span className="text-white text-[14px] font-bold tracking-tight">Audio Settings</span>
               <button onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 text-white/70">
                 <X size={14} strokeWidth={3} />
               </button>
            </div>
            
            <div className="flex flex-col gap-2 w-full relative z-10">
              
              {/* Spatial Audio Visualizer & Trivia */}
              <div className="flex items-center gap-3 bg-black/40 rounded-xl p-2 border border-white/5">
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center overflow-hidden relative shrink-0">
                   <div className="absolute inset-0 border-4 border-dashed border-[#0A84FF] rounded-full animate-[spin_4s_linear_infinite] opacity-50" />
                   <div className="absolute inset-1 border-[3px] border-dotted border-[#5E5CE6] rounded-full animate-[spin_3s_linear_infinite_reverse]" />
                   <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[#0A84FF] text-[9px] font-bold uppercase tracking-widest mb-0.5">Spatial Audio</span>
                  <span className="text-white/80 text-[10px] font-medium leading-tight truncate">Playing from "The Weeknd" • Won 4 Grammys</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center w-full mt-1">
                <button className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-[12px] bg-[#5865F2]/20 text-[#5865F2] hover:bg-[#5865F2]/30 active:scale-95 transition-all mr-2">
                  <Users size={14} />
                  <span className="text-[11px] font-bold">Discord</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-[12px] bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-pink-400 hover:from-purple-500/30 hover:to-pink-500/30 active:scale-95 transition-all mr-2">
                  <Share2 size={14} />
                  <span className="text-[11px] font-bold">Insta</span>
                </button>
                <button className="w-9 h-9 rounded-[12px] bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 active:scale-95 transition-all shrink-0">
                  <Settings size={16} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  if (activity.type === 'schedule') {
    return (
      <div className="relative w-full min-h-[160px]" style={{ perspective: '1200px' }}>
        <div className="w-full min-h-[160px] relative transition-transform duration-700 ease-in-out" style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateX(-180deg)' : 'rotateX(0deg)' }}>
          
          {/* FRONT */}
          <div className="w-full flex flex-col px-6 py-5 min-h-[160px] justify-between absolute inset-0 rounded-[42px] bg-black shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden" style={{ backfaceVisibility: 'hidden' }}>
            <div className="flex items-center justify-between relative z-10 mb-2">
              <div className="flex flex-col">
                <span className="text-white/60 text-[13px] font-medium tracking-tight mb-0.5">Current Session</span>
                <span className="text-white text-[20px] font-medium tracking-tight">{activity.title}</span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[#007AFF] text-[13px] font-bold tracking-tight">ETA {formatTime(time)}</span>
                <button onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }} className="w-8 h-8 rounded-full bg-[#007AFF]/20 flex items-center justify-center hover:bg-[#007AFF]/40 active:scale-95 transition-all text-[#007AFF]">
                  <MoreHorizontal size={16} strokeWidth={3} />
                </button>
              </div>
            </div>

            {/* Trajectory Arc Timeline */}
            <div className="relative w-full h-16 flex items-center justify-center mt-1">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-10 bg-[#007AFF] blur-[40px] opacity-30 pointer-events-none" />
              
              <svg className="w-[90%] h-full overflow-visible" viewBox="0 0 200 65">
                <path d="M 10 40 Q 100 -10 190 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" strokeLinecap="round" />
                <path 
                  d="M 10 40 Q 100 -10 190 40" 
                  fill="none" 
                  stroke="url(#blueGradient)" 
                  strokeWidth="6" 
                  strokeLinecap="round" 
                  strokeDasharray="210" 
                  strokeDashoffset={210 - (210 * 0.65)} 
                />
                <defs>
                  <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0A84FF" />
                    <stop offset="100%" stopColor="#5E5CE6" />
                  </linearGradient>
                </defs>

                <circle cx="10" cy="40" r="5" fill="#0A84FF" />
                <text x="10" y="58" fill="rgba(255,255,255,0.5)" fontSize="10" textAnchor="middle" fontWeight="bold">START</text>
                
                <g transform="translate(130, 15)">
                  <circle cx="0" cy="0" r="8" fill="#5E5CE6" />
                  <circle cx="0" cy="0" r="4" fill="white" />
                  <circle cx="0" cy="0" r="14" fill="none" stroke="#5E5CE6" strokeWidth="2" opacity="0.5" className="animate-ping" />
                </g>

                <circle cx="190" cy="40" r="5" fill="rgba(255,255,255,0.2)" />
                <text x="190" y="58" fill="rgba(255,255,255,0.5)" fontSize="10" textAnchor="middle" fontWeight="bold">END</text>
              </svg>
            </div>
          </div>

          {/* BACK: DEEP UTILITIES */}
          <div className="w-full flex flex-col px-6 py-4 min-h-[160px] justify-between absolute inset-0 rounded-[42px] bg-[#1C1C1E] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}>
            <div className="flex items-center justify-between w-full relative z-10 mb-1">
               <span className="text-[#007AFF] text-[14px] font-bold tracking-tight">Class Utilities</span>
               <button onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 text-white/70">
                 <X size={14} strokeWidth={3} />
               </button>
            </div>
            
            {/* Quick Context & Syllabus */}
            <div className="flex items-center justify-between bg-black/30 rounded-xl p-2 mb-2">
              <div className="flex flex-col flex-1 mr-3">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-white text-[11px] font-bold">Syllabus</span>
                  <span className="text-[#007AFF] text-[9px] font-bold">65%</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#007AFF] rounded-full" style={{ width: '65%' }} />
                </div>
              </div>
              <div className="flex items-center gap-2 border-l border-white/10 pl-3">
                <div className="w-6 h-6 rounded-full bg-[#007AFF]/20 flex items-center justify-center border border-[#007AFF]/30">
                  <MapPin size={12} className="text-[#007AFF]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-[10px] font-bold">Rm 402</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="flex justify-between items-center w-full gap-2 mt-auto">
              <button className="flex-1 h-10 rounded-[14px] bg-[#007AFF]/10 flex items-center justify-center gap-1.5 hover:bg-[#007AFF]/20 active:scale-95 transition-all border border-[#007AFF]/20 text-[#007AFF]">
                <ScanLine size={14} strokeWidth={2.5} />
                <span className="text-[11px] font-bold">Attendance</span>
              </button>
              
              <button className="flex-1 h-10 rounded-[14px] bg-white/5 flex items-center justify-center gap-1.5 hover:bg-white/10 active:scale-95 transition-all text-white/80">
                <Share2 size={14} />
                <span className="text-[11px] font-medium">Notes</span>
              </button>
              
              <button className="w-10 h-10 rounded-[14px] bg-[#34C759]/10 flex items-center justify-center hover:bg-[#34C759]/20 active:scale-95 transition-all border border-[#34C759]/30 text-[#34C759]">
                <CheckCircle2 size={16} />
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  if (activity.type === 'progress') {
    return (
      <div className="w-full flex items-center justify-between px-6 py-6 min-h-[84px]">
        <div className="flex flex-col flex-1 pr-6">
          <span className="text-white text-[16px] font-medium tracking-tight mb-2">{activity.title || 'Syncing Data...'}</span>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#007AFF] rounded-full transition-all duration-300" style={{ width: `${activity.progress || 0}%` }} />
          </div>
        </div>
        <div className="w-12 h-12 rounded-full border-[3px] border-[#007AFF] border-t-transparent animate-spin flex items-center justify-center shrink-0">
          <div className="w-8 h-8 rounded-full bg-[#007AFF]/20" />
        </div>
      </div>
    );
  }

  if (activity.type === 'bunk_calculator' || activity.type === 'exam_countdown') {
    const isCritical = activity.metadata?.urgency === 'critical' || activity.metadata?.riskiest?.risk === 'CRITICAL';
    const color = isCritical ? '#FF3B30' : '#FF9F0A';
    const title = activity.subtitle || activity.title;
    
    return (
      <div className="relative w-full min-h-[160px]" style={{ perspective: '1200px' }}>
        <div className="w-full min-h-[160px] relative transition-transform duration-700 ease-in-out" style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateX(-180deg)' : 'rotateX(0deg)' }}>
          
          {/* FRONT */}
          <div className="w-full flex flex-col px-7 py-6 min-h-[160px] justify-between absolute inset-0 rounded-[42px] bg-black shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden" style={{ backfaceVisibility: 'hidden' }}>
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-32 blur-[60px] opacity-20 pointer-events-none" 
              style={{ backgroundColor: color, animation: isCritical ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none' }} 
            />
            
            <div className="flex items-start justify-between w-full relative z-10">
              <div className="flex flex-col">
                <span className="text-[42px] font-bold tracking-tighter leading-none flex items-center gap-2" style={{ color }}>
                  {isCritical ? <Flame size={32} fill="currentColor" className="animate-pulse" /> : <AlertTriangle size={32} />}
                  {isCritical ? 'CRITICAL' : 'WARNING'}
                </span>
                <span className="text-white/80 text-[16px] font-medium tracking-tight mt-1 truncate max-w-[200px]">
                  {title}
                </span>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <div className="flex flex-col items-end">
                  <span className="text-white/50 text-[12px] font-bold uppercase tracking-widest mb-1">
                    {activity.type === 'bunk_calculator' ? 'Attendance' : 'Time Left'}
                  </span>
                  <span className="text-white text-[24px] font-bold tabular-nums leading-none">
                    {activity.type === 'bunk_calculator' ? `${activity.metadata?.riskiest?.percent || 70}%` : formatTime(time)}
                  </span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all text-white/70">
                  <Settings size={16} strokeWidth={3} />
                </button>
              </div>
            </div>

            <div className="flex items-end justify-between h-12 w-full relative z-10 gap-[2px] mt-4">
              {Array.from({ length: 35 }).map((_, i) => {
                const height = 20 + Math.random() * 80;
                const isDangerZone = i > 25;
                return (
                  <div 
                    key={i} 
                    className="flex-1 rounded-t-[2px] opacity-80"
                    style={{ 
                      height: `${height}%`,
                      backgroundColor: isDangerZone ? color : 'rgba(255, 255, 255, 0.15)',
                      boxShadow: isDangerZone ? `0 0 8px ${color}` : 'none'
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* BACK: DEEP UTILITIES */}
          <div className="w-full flex flex-col px-6 py-4 min-h-[160px] justify-between absolute inset-0 rounded-[42px] bg-[#1C1C1E] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}>
            <div className="flex items-center justify-between w-full relative z-10 mb-1">
               <span className="text-[#FF3B30] text-[14px] font-bold tracking-tight">Risk Analysis</span>
               <button onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 text-white/70">
                 <X size={14} strokeWidth={3} />
               </button>
            </div>
            
            {/* Draggable Bunk Slider & Grade Chart */}
            <div className="flex flex-col gap-1 w-full mb-2">
              <div className="flex justify-between items-end mb-1">
                 <span className="text-white/50 text-[9px] font-bold uppercase tracking-widest">Simulate Bunks</span>
                 <span className="text-white font-bold text-[11px] tabular-nums">-1 Class</span>
              </div>
              <div className="relative w-full h-3 bg-white/10 rounded-full flex items-center px-1">
                <motion.div 
                  drag="x" 
                  dragConstraints={{ left: 0, right: 180 }} 
                  dragElastic={0.2}
                  className="w-10 h-2 bg-[#FF3B30] rounded-full shadow-[0_0_15px_rgba(255,59,48,0.6)] cursor-grab active:cursor-grabbing"
                  whileTap={{ scaleY: 0.8, scaleX: 1.2, borderRadius: "8px" }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                />
              </div>
            </div>

            {/* Ask AI for Excuse Button (Apple Intelligence Glow) */}
            <div className="relative w-full group mt-auto">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-orange-500 rounded-[14px] blur opacity-75 group-hover:opacity-100 animate-[pulse_2s_ease-in-out_infinite] transition duration-1000 group-hover:duration-200" />
              <button className="relative w-full h-10 rounded-[14px] bg-[#1C1C1E] flex items-center justify-center gap-2 active:scale-95 transition-all text-white border border-white/5">
                <Sparkles size={14} className="text-fuchsia-400" />
                <span className="text-[12px] font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-orange-500">Ask AI for Excuse</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  if (activity.type === 'academic_status') {
    return (
      <div className="w-full flex flex-col px-7 py-6 min-h-[160px] justify-center relative overflow-hidden rounded-[42px] bg-black">
        <div className="flex items-center justify-between relative z-10 w-full">
          <div className="flex flex-col font-sans">
            <span className="text-white/50 text-[13px] font-semibold uppercase tracking-widest mb-1">Academic Status</span>
            <span className="text-white text-[42px] font-medium tracking-tighter tabular-nums leading-none mb-1">
              {activity.title.replace('SGPA: ', '')}
            </span>
            <span className="text-[#34C759] text-[15px] font-medium tracking-tight">On Track for Distinction</span>
          </div>
          
          <div className="relative w-[84px] h-[84px] flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(52, 199, 89, 0.15)" strokeWidth="12" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="#34C759" strokeWidth="12" strokeDasharray="264" strokeDashoffset={264 - (264 * 0.98)} strokeLinecap="round" className="transition-all duration-1500 ease-out" />
            </svg>
            <div className="flex flex-col items-center justify-center">
              <span className="text-white text-[22px] font-bold tracking-tighter leading-none mt-1">98</span>
              <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest mt-0.5">%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="w-full flex items-center justify-center p-6 text-white text-[16px] font-medium tracking-tight">
      {activity.title}
    </div>
  );
}

// ═══════════════════════════════════════════════
//  ALERTS
// ═══════════════════════════════════════════════

export function IslandAlertView({ alert }: { alert: IslandAlert }) {
  const dismissAlert = useDynamicIslandStore((s) => s.dismissAlert);

  let Icon = Info;
  let colorClass = "bg-[#007AFF]";
  let textColor = "text-[#007AFF]";
  let solidColor = "#007AFF";
  
  if (alert.type === 'success') {
    Icon = CheckCircle2;
    colorClass = "bg-[#34C759]";
    textColor = "text-[#34C759]";
    solidColor = "#34C759";
  } else if (alert.type === 'warning') {
    Icon = AlertTriangle;
    colorClass = "bg-[#FF9F0A]";
    textColor = "text-[#FF9F0A]";
    solidColor = "#FF9F0A";
  } else if (alert.type === 'error') {
    Icon = AlertCircle;
    colorClass = "bg-[#FF3B30]";
    textColor = "text-[#FF3B30]";
    solidColor = "#FF3B30";
  }

  return (
    <div className="w-full flex flex-col px-5 py-4 min-h-[84px] justify-center">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full ${colorClass}/20 flex items-center justify-center shrink-0`}>
           <Icon size={24} color={solidColor} />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className={`text-[12px] font-bold uppercase tracking-widest ${textColor}`}>{alert.type} ALERT</span>
          <span className="text-white text-[18px] font-medium tracking-tight truncate">{alert.title}</span>
        </div>
        <div className="flex gap-2">
          {alert.actions && alert.actions.length > 0 && (
            <button onClick={(e) => { e.stopPropagation(); alert.actions?.[0]?.onClick(); dismissAlert(); }} className="px-4 h-10 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all" style={{ backgroundColor: solidColor }}>
              <span className="text-white text-[14px] font-semibold">{alert.actions[0].label || 'View'}</span>
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); dismissAlert(); }} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 hover:scale-105 active:scale-95 transition-all">
            <X size={18} className="text-white/80" />
          </button>
        </div>
      </div>
    </div>
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
//  JARVIS — Aevos AI Operating System
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
  const isProcessing = useDynamicIslandStore((s) => s.isProcessing);
  const setIsProcessing = useDynamicIslandStore((s) => s.setIsProcessing);

  useEffect(() => {
    return () => {
      useDynamicIslandStore.getState().setIsProcessing(false);
    };
  }, []);
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
              transition={{ type: "spring", stiffness: 350, damping: 28, mass: 1 }}
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

// ═══════════════════════════════════════════════
//  SIRI TOP HALF ACTIVITY (iOS 27)
// ═══════════════════════════════════════════════

export function SiriTopHalfActivity() {
  const setIsAIActive = useDynamicIslandStore((s) => s.setIsAIActive);
  
  const [input, setInput] = useState("");
  const { messages, append, isLoading } = useChat({
    api: '/api/jarvis/mcp',
  });

  const onClose = () => {
    setIsAIActive(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <motion.div className="w-full flex flex-col p-6 gap-4 relative min-h-[40vh] bg-black/95 font-mono overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center justify-between z-10 w-full border-b border-green-500/30 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
          <span className="text-green-500 font-bold text-sm tracking-[0.2em] uppercase">Jarvis OS // Command Center</span>
        </div>
        <div className="w-12 h-1.5 rounded-full bg-green-500/30 hover:bg-green-500/80 transition-colors cursor-pointer" onClick={onClose} />
      </div>

      {/* Terminal Output Area */}
      <div className="flex-1 overflow-y-auto z-10 flex flex-col gap-3 max-h-[45vh] pr-2 custom-scrollbar">
        {messages.map((m) => (
          <div key={m.id} className="text-sm tracking-wide">
            {m.role === 'user' && (
              <div className="text-blue-400">
                <span className="opacity-50">guest@gradeflow:~$ </span>
                {m.parts?.map((part, idx) => part.type === 'text' ? part.text : '').join('')}
              </div>
            )}
            {m.role === 'assistant' && (
              <div className="text-green-400 mt-1">
                {m.parts?.map((part, idx) => {
                  if (part.type === 'text') {
                    return <div key={idx} className="leading-relaxed whitespace-pre-wrap">{part.text}</div>;
                  }
                  if (part.type === 'tool-invocation') {
                    const toolInvocation = part.toolInvocation as any;
                    return (
                      <div key={toolInvocation.toolCallId || idx} className="text-yellow-400/90 ml-4 mt-2 border-l-2 border-yellow-500/30 pl-3 bg-yellow-500/5 py-2 rounded-r">
                        <div className="font-bold flex items-center gap-2">
                          <span className="animate-spin text-xs">⚙</span> 
                          EXECUTING [{toolInvocation.toolName}]...
                        </div>
                        <div className="opacity-60 text-xs mt-1 break-all bg-black/50 p-2 rounded">
                          {JSON.stringify(toolInvocation.args)}
                        </div>
                        {toolInvocation.state === 'result' && (
                          <div className="text-green-400 font-bold mt-2 flex items-center gap-2">
                            <span>✓</span> SUCCESS
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="text-green-500 font-bold animate-pulse mt-2 flex items-center gap-2">
             <span>_</span>
             <span className="text-xs opacity-50 tracking-widest">AWAITING SYSTEM RESPONSE</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={(e) => { e.preventDefault(); append({ role: 'user', content: input }); setInput(""); }} className="relative z-10 flex items-center bg-black border border-green-500/30 rounded-lg px-4 py-3 focus-within:border-green-500 focus-within:shadow-[0_0_20px_rgba(34,197,94,0.15)] transition-all">
        <span className="text-green-500 mr-3 font-bold">{">"}</span>
        <input 
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Enter command directive..." 
          className="bg-transparent border-none outline-none text-green-500 text-[15px] w-full font-mono placeholder-green-500/30 disabled:opacity-50"
        />
      </form>
    </motion.div>
  );
}

