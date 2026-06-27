"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Target, Award, BookOpen, Sparkles, 
  ArrowUpRight, History, Zap, Briefcase
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { useUniversity } from '@/components/providers/UniversityProvider';
import Card from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUSMStore } from '@/stores/usmStore';
import { cn } from '@/lib/cn';

const MotionCard = motion(Card);

interface SemesterNode {
  id: number;
  title: string;
  status: 'completed' | 'current' | 'upcoming';
  sgpa?: string;
}

// Client-Side Static Mapping for Skills
const SKILL_MAP: Record<string, { name: string, weight: number }> = {
  "web": { name: "Web Development", weight: 5 },
  "algorithm": { name: "Algorithms", weight: 6 },
  "data struct": { name: "Data Structures", weight: 6 },
  "dsa": { name: "DSA", weight: 6 },
  "data": { name: "Data Science", weight: 5 },
  "database": { name: "SQL & Databases", weight: 4 },
  "network": { name: "Networking", weight: 3 },
  "os": { name: "Operating Systems", weight: 4 },
  "operating": { name: "Operating Systems", weight: 4 },
  "math": { name: "Applied Math", weight: 2 },
  "physics": { name: "Physics", weight: 1 },
  "python": { name: "Python", weight: 5 },
  "java": { name: "Java", weight: 5 },
  "c++": { name: "C++", weight: 5 },
  "machine learning": { name: "Machine Learning", weight: 6 },
  "ml": { name: "Machine Learning", weight: 6 },
  "ai": { name: "Artificial Intelligence", weight: 6 },
  "artificial": { name: "Artificial Intelligence", weight: 6 },
  "cloud": { name: "Cloud Computing", weight: 5 },
  "security": { name: "Cybersecurity", weight: 5 },
  "hardware": { name: "Hardware", weight: 2 },
  "electronics": { name: "Electronics", weight: 2 },
  "mechanics": { name: "Mechanics", weight: 1 },
  "communication": { name: "Soft Skills", weight: 2 },
  "project": { name: "Project Management", weight: 3 },
  "software": { name: "Software Engineering", weight: 5 },
  "compiler": { name: "Compilers", weight: 4 },
  "design": { name: "System Design", weight: 4 },
};

function inferSkillsFromCourses(courses: any[]) {
  const extractedSkills: { name: string, weight: number }[] = [];
  const addedNames = new Set<string>();

  courses.forEach(c => {
    const nameLower = (c.name || "").toLowerCase();
    Object.keys(SKILL_MAP).forEach(keyword => {
      if (nameLower.includes(keyword)) {
        const skill = SKILL_MAP[keyword];
        if (!addedNames.has(skill.name)) {
          addedNames.add(skill.name);
          extractedSkills.push(skill);
        }
      }
    });
  });

  if (extractedSkills.length === 0 && courses.length > 0) {
    extractedSkills.push({ name: "Core Engineering", weight: 2 });
  }

  return extractedSkills;
}

export default function FullAcademicTimeline() {
  const { activePreset } = useUniversity();
  const store = useUSMStore();
  const [mounted, setMounted] = useState(false);
  const [selectedSem, setSelectedSem] = useState<number | null>(null);

  const dynamicSemesters = React.useMemo(() => {
    const sortedHistory = [...store.semesterHistory].sort((a, b) => a.semester - b.semester);

    const sems: SemesterNode[] = sortedHistory.map((sh, idx) => ({
      id: sh.semester,
      title: `Semester ${String(sh.semester).padStart(2, '0')}`,
      status: 'completed',
      sgpa: sh.sgpa.toFixed(2),
    }));
    
    const maxHistorySem = sortedHistory.length > 0 ? sortedHistory[sortedHistory.length - 1].semester : 0;
    const activeCourses = store.courses.filter(c => (c.name && c.name.trim() !== "") || (c.code && c.code.trim() !== ""));
    
    const upcomingSems = Array.from(new Set(activeCourses.map(c => c.semester || 1)))
      .filter(s => s > maxHistorySem && s <= 12)
      .sort((a, b) => a - b);
    
    upcomingSems.forEach((semId, idx) => {
      sems.push({
        id: semId,
        title: `Semester ${String(semId).padStart(2, '0')}`,
        status: idx === 0 ? 'current' : 'upcoming',
        sgpa: 'TBD',
      });
    });
    
    return sems;
  }, [store.semesterHistory, store.courses]);

  useEffect(() => {
    setMounted(true);
    if (dynamicSemesters.length > 0 && selectedSem === null) {
       setSelectedSem(dynamicSemesters[dynamicSemesters.length - 1].id);
    }
  }, [dynamicSemesters, selectedSem]);

  const currentSemesterCourses = useMemo(() => {
    if (!selectedSem) return [];
    return store.courses.filter(c => (c.semester || 1) === selectedSem);
  }, [store.courses, selectedSem]);

  const semesterSkills = useMemo(() => {
    return inferSkillsFromCourses(currentSemesterCourses);
  }, [currentSemesterCourses]);

  const internshipsUnlocked = useMemo(() => {
    const skillValue = semesterSkills.reduce((sum, skill) => sum + skill.weight, 0);
    const baseValue = currentSemesterCourses.length > 0 ? 3 : 0; // Baseline for taking courses
    return skillValue + baseValue;
  }, [semesterSkills, currentSemesterCourses]);

  if (!mounted) return null;

  if (dynamicSemesters.length === 0) {
    return (
      <Card variant="default" className="w-full flex flex-col items-center justify-center py-16 text-center border-white/5">
        <div className="w-12 h-12 rounded-full bg-surface border border-white/5 flex items-center justify-center mb-4">
          <History className="w-6 h-6 text-foreground-muted" />
        </div>
        <h3 className="text-[14px] font-semibold text-foreground mb-2">No Academic History</h3>
        <p className="text-[12px] text-foreground-muted max-w-xs">
          Your timeline will automatically build itself as you complete semesters and register courses.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* TOP: Timeline Node Selection List */}
      <Card variant="default" className="!p-6 border-white/5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <History size={16} className="text-foreground-muted" />
            <div className="flex flex-col">
              <h3 className="text-[14px] font-semibold text-foreground tracking-tight leading-tight">Academic Timeline</h3>
              <p className="text-[11px] text-foreground-muted uppercase tracking-wider font-semibold">Semester progression trajectory</p>
            </div>
          </div>
        </div>

        {/* Horizontal scrollable stepper */}
        <div className="relative flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 pt-2 snap-x snap-mandatory">
          {dynamicSemesters.map((sem, idx) => {
            const isSelected = selectedSem === sem.id;
            const isCompleted = sem.status === 'completed';
            
            return (
              <button
                key={sem.id}
                onClick={() => setSelectedSem(sem.id)}
                className={cn(
                  "snap-start shrink-0 relative flex flex-col items-center justify-center gap-3 p-4 rounded-xl transition-all duration-300 w-[120px] border",
                  isSelected 
                    ? "bg-surface border-white/10 shadow-lg" 
                    : "bg-transparent border-transparent hover:bg-surface/50"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold z-10 transition-colors",
                  isSelected 
                    ? "bg-white/10 text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
                    : isCompleted 
                      ? "bg-surface border border-white/10 text-foreground-muted"
                      : "bg-transparent border border-white/5 text-foreground-muted/30 border-dashed"
                )}>
                  {sem.id}
                </div>

                <div className="text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted">{sem.status}</div>
                  <div className={cn(
                    "text-[13px] font-semibold tracking-tight mt-0.5",
                    isSelected ? "text-foreground" : "text-foreground-muted"
                  )}>
                    {sem.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* BOTTOM: Detail Panel */}
      <AnimatePresence mode="wait">
        {selectedSem && (
          <MotionCard
            key={selectedSem}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            variant="default"
            className="!p-0 border-white/5 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/[0.05] flex justify-between items-start bg-surface/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap size={14} className="text-foreground-muted" />
                  <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest">Academic Profile</span>
                </div>
                <h2 className="text-[20px] font-black text-foreground tracking-tight">
                  {dynamicSemesters.find(s => s.id === selectedSem)?.title}
                </h2>
              </div>
              
              <div className="flex flex-col items-end text-right">
                <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest mb-1">GPA</span>
                <span className={cn(
                  "text-[24px] font-black tracking-tighter",
                  dynamicSemesters.find(s => s.id === selectedSem)?.sgpa !== "TBD" ? "text-primary" : "text-foreground-muted"
                )}>
                  {dynamicSemesters.find(s => s.id === selectedSem)?.sgpa || "—"}
                </span>
              </div>
            </div>

            <div className="p-6 flex flex-col gap-8">
              
              {/* Core Focus (Courses) */}
              <div className="flex flex-col gap-4">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-foreground-muted flex items-center gap-2">
                  <BookOpen size={12} /> Core Focus
                </h4>
                
                <div className="flex flex-col rounded-xl overflow-hidden border border-white/5 bg-surface/30">
                  {currentSemesterCourses.map((course, idx) => (
                    <div key={course.id + idx} className="flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <span className="text-[11px] font-mono text-foreground-muted uppercase tracking-wider w-24 shrink-0">{course.code}</span>
                        <span className="text-[13px] text-foreground font-semibold leading-tight truncate">{course.name}</span>
                      </div>
                      <span className={cn(
                        "text-[13px] font-black shrink-0 ml-4", 
                        ["F", "FF", "FAIL", "ABSENT", "AB", "NP"].includes((course.grade || "").toUpperCase()) ? 'text-[#ff3b30]' : 'text-primary'
                      )}>
                        {course.grade || '-'}
                      </span>
                    </div>
                  ))}
                  {currentSemesterCourses.length === 0 && (
                    <div className="py-6 text-center text-[12px] text-foreground-muted border border-dashed border-white/5 rounded-xl bg-transparent">
                      No courses registered for this semester.
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                {/* NEW: Skills Acquired Section */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-foreground-muted flex items-center gap-2">
                    <Zap size={12} /> Skills Acquired
                  </h4>
                  {semesterSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {semesterSkills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary" size="md" className="flex items-center gap-1.5 uppercase font-bold tracking-widest px-3 py-1.5">
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[11px] text-foreground-muted italic">No new skills recorded.</div>
                  )}
                </div>

                {/* NEW: Career Impact Section */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-foreground-muted flex items-center gap-2">
                    <Target size={12} /> Career Impact
                  </h4>
                  
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between gap-4 h-full">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Briefcase className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[20px] font-black text-foreground tracking-tighter leading-none">
                          +{internshipsUnlocked}
                        </span>
                        <span className="text-[11px] text-foreground-muted font-medium mt-1">
                          Opportunities
                        </span>
                      </div>
                    </div>
                    
                    <Link href="/internships">
                      <Button variant="ghost" size="sm" className="flex items-center gap-1.5 uppercase font-bold text-white shrink-0">
                        View
                        <ArrowUpRight size={12} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </MotionCard>
        )}
      </AnimatePresence>
    </div>
  );
}
