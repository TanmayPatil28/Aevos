"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Target, Award, BookOpen, Sparkles, 
  ArrowUpRight, LayoutDashboard, History
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { useUniversity } from '@/components/providers/UniversityProvider';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/ui/Card';

const MotionCard = motion(Card);

// --- Types ---
interface SemesterNode {
  id: number;
  title: string;
  status: 'completed' | 'current' | 'upcoming';
  sgpa?: string;
  focus: string[];
  achievement?: string;
  color: string;
}

const SEMESTERS: SemesterNode[] = [
  { id: 1, title: "Semester 01", status: 'completed', sgpa: "9.2", focus: ["Engineering Physics", "Calculus"], achievement: "Dean's List", color: "from-blue-500 to-cyan-400" },
  { id: 2, title: "Semester 02", status: 'completed', sgpa: "8.8", focus: ["C Programming", "Engineering Graphics"], color: "from-cyan-400 to-emerald-400" },
  { id: 3, title: "Semester 03", status: 'completed', sgpa: "9.5", focus: ["Data Structures", "Digital Logic"], achievement: "Hackathon Winner", color: "from-emerald-400 to-green-400" },
  { id: 4, title: "Semester 04", status: 'current', sgpa: "TBD", focus: ["Algorithms", "OS", "Database"], color: "from-green-400 to-yellow-400" },
  { id: 5, title: "Semester 05", status: 'upcoming', focus: ["Computer Networks", "AI"], color: "from-yellow-400 to-orange-400" },
  { id: 6, title: "Semester 06", status: 'upcoming', focus: ["Software Engineering", "Security"], color: "from-orange-400 to-red-400" },
  { id: 7, title: "Semester 07", status: 'upcoming', focus: ["Cloud Computing", "Project I"], color: "from-red-400 to-pink-400" },
  { id: 8, title: "Semester 08", status: 'upcoming', focus: ["Industrial Internship"], color: "from-pink-400 to-purple-500" },
];

export default function AcademicTimeline() {
  const { activePreset } = useUniversity();
  const [mounted, setMounted] = useState(false);
  const [selectedSem, setSelectedSem] = useState<number | null>(4);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#050810]">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <PageContainer className="pt-24 pb-32 max-w-[1200px] space-y-0 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/50 text-[10px] font-black uppercase tracking-[0.2em]"
            >
              <History className="w-3.5 h-3.5 text-blue-400" />
              Academic Journey
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none"
            >
              Timeline
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-white/50 font-medium max-w-xl"
            >
               Visualization of your engineering roadmap at <span className="text-white font-bold">{activePreset.name}</span>.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4"
          >
             <Link href="/dashboard" className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-black uppercase tracking-wider transition-all flex items-center gap-2 text-white/70 hover:text-white">
                <LayoutDashboard size={18} />
                Dashboard
             </Link>
          </motion.div>
        </div>

        {/* Timeline Visualization */}
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: The Interactive Line */}
          <div className="lg:col-span-5 space-y-12 relative">
            <div className="absolute left-6 top-8 bottom-8 w-[2px] bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-transparent" />
            
            <div className="space-y-4">
              {SEMESTERS.map((sem, idx) => (
                <motion.button
                  key={sem.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedSem(sem.id)}
                  className={clsx(
                    "w-full flex items-center gap-4 sm:gap-8 p-4 rounded-2xl transition-all duration-500 group relative",
                    selectedSem === sem.id ? "bg-white/5 border border-white/10 shadow-lg" : "hover:bg-white/[0.02]"
                  )}
                >
                  {/* Node Icon */}
                  <div className={clsx(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 z-10 transition-all duration-500 shadow-lg",
                    selectedSem === sem.id ? `bg-gradient-to-br ${sem.color} scale-110` : "bg-[#0A0F1E] border border-white/5 text-white/20 group-hover:text-white/40"
                  )}>
                    <span className={clsx("font-black text-lg", selectedSem === sem.id ? "text-white" : "text-inherit")}>
                      {sem.id}
                    </span>
                  </div>

                  <div className="flex flex-col items-start">
                    <span className={clsx(
                      "text-xs font-black uppercase tracking-widest transition-colors",
                      selectedSem === sem.id ? "text-white" : "text-white/40 group-hover:text-white/60"
                    )}>
                      {sem.status}
                    </span>
                    <span className={clsx(
                      "text-xl font-bold tracking-tight",
                      selectedSem === sem.id ? "text-white" : "text-white/20 group-hover:text-white/40"
                    )}>
                      {sem.title}
                    </span>
                  </div>

                  {selectedSem === sem.id && (
                    <motion.div 
                      layoutId="active-marker"
                      className="absolute right-4 w-2 h-2 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)]"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* RIGHT: Detail Viewer (The Glass Card) */}
          <div className="lg:col-span-7 sticky top-32">
            <AnimatePresence mode="wait">
              {selectedSem && (
                <MotionCard
                  key={selectedSem}
                  initial={{ opacity: 0, scale: 0.95, filter: 'blur(20px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.95, filter: 'blur(20px)' }}
                  className="relative overflow-hidden group"
                >
                  {/* Decorative Gradient Aura */}
                  <div className={clsx(
                    "absolute -top-24 -right-24 w-64 h-64 blur-[80px] opacity-20 transition-all duration-700",
                    `bg-gradient-to-br ${SEMESTERS.find(s => s.id === selectedSem)?.color}`
                  )} />

                  <div className="relative z-10 space-y-10">
                    {/* Card Header */}
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="text-blue-400 w-6 h-6" />
                          <span className="text-blue-400 font-black uppercase tracking-widest text-xs">Academic Profile</span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tighter">
                          {SEMESTERS.find(s => s.id === selectedSem)?.title}
                        </h2>
                      </div>
                      <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/10 text-center">
                        <span className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">GPA</span>
                        <span className="text-3xl font-black text-white">{SEMESTERS.find(s => s.id === selectedSem)?.sgpa || "—"}</span>
                      </div>
                    </div>

                    {/* Content Sections */}
                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                          <BookOpen className="w-3 h-3" /> Core Focus
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {SEMESTERS.find(s => s.id === selectedSem)?.focus.map(item => (
                            <span key={item} className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-sm text-white/70 font-medium">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      {SEMESTERS.find(s => s.id === selectedSem)?.achievement && (
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                            <Award className="w-3 h-3" /> Outcome
                          </h4>
                          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                            <Sparkles className="text-emerald-400 w-5 h-5 flex-shrink-0" />
                            <span className="text-sm font-bold text-emerald-400">
                              {SEMESTERS.find(s => s.id === selectedSem)?.achievement}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Call to Action */}
                    <div className="pt-8 border-t border-white/5 flex gap-4">
                      <Link href="/calculator" className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-white font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2">
                        Calculate Target
                        <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  </div>
                </MotionCard>
              )}
            </AnimatePresence>
            
            {/* Empty Context Notice */}
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.5 }}
               className="mt-8 p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl"
            >
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                   <Target className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-sm text-white/50 leading-relaxed font-medium">
                   This timeline represents your standardized curriculum roadmap.
                </p>
              </div>
            </motion.div>
          </div>

        </div>
      </PageContainer>
    </div>
  );
}
