"use client";

import { useState, useEffect, useMemo } from "react";
import { useUSMStore } from "@/stores/usmStore";
import { strategyAllocator } from "@/lib/strategy/strategyAllocator";
import StrategyCard from "@/components/strategy/StrategyCard";
import StrategyComparison from "@/components/strategy/StrategyComparison";
import PageContainer from "@/components/layout/PageContainer";
import Link from "next/link";
import { Compass, BookOpen, AlertCircle } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { demoPersonas } from "@/lib/demo/demo-personas";
import toast from "react-hot-toast";

export default function StrategyPage() {
  const [mounted, setMounted] = useState(false);
  const store = useUSMStore();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const { presetId, academic, courses } = store;
  const { currentCgpa, earnedCredits, targetCgpa } = academic;

  // Compute strategies
  const strategies = useMemo(() => {
    if (!mounted || courses.length === 0) return null;
    
    // Map store courses to engine input structure
    const engineInput = {
      currentCgpa,
      earnedCredits,
      targetCgpa,
      presetId,
      courses: courses.map(c => ({
        id: c.id,
        code: c.code,
        name: c.name,
        credits: c.credits,
        grade: c.grade,
        cieMarks: c.cieMarks || 0,
        attendanceTotal: c.attendanceTotal || 0,
        attendanceBunked: c.attendanceBunked || 0,
      }))
    };
    
    try {
      const safe = strategyAllocator.generate(engineInput, 'SAFE');
      const balanced = strategyAllocator.generate(engineInput, 'BALANCED');
      const aggressive = strategyAllocator.generate(engineInput, 'AGGRESSIVE');
      return { safe, balanced, aggressive };
    } catch (err) {
      console.error("Failed to generate strategies:", err);
      return null;
    }
  }, [mounted, presetId, currentCgpa, earnedCredits, targetCgpa, courses]);

  // Loading state during hydration
  if (!mounted) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 text-[#4F8EF7] border-2 border-[#4F8EF7] border-t-transparent rounded-full" />
          <p className="text-white/60 text-sm">Loading academic strategies...</p>
        </div>
      </PageContainer>
    );
  }

  // Handle loading demo persona directly for easy verification
  const loadDemo = (personaId: string) => {
    const persona = demoPersonas[personaId];
    if (!persona) return;
    
    store.stopSimulation();
    store.resetSimulation();
    
    store.setPresetId(persona.presetId);
    store.setAcademic(persona.academic);
    store.setCourses(persona.courses);
    store.setSemesterHistory(persona.semesterHistory);
    store.setCareer(persona.career);
    store.setRisk(persona.risk);
    
    toast.success(`Loaded demo persona: ${persona.name} (${persona.role})`);
  };

  const hasCourses = courses.length > 0;

  return (
    <PageContainer className="relative z-10 space-y-12">
      {/* Background decorations */}
      <div className="fixed top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-emerald-500/5 rounded-full blur-[120px] mix-blend-screen -z-10 pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-indigo-500/5 rounded-full blur-[120px] mix-blend-screen -z-10 pointer-events-none" />

      {/* Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-2">
          <Compass size={14} />
          Strategy Generator
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-sm font-headline">
          Academic Action Strategies
        </h1>
        <p className="text-white/60 text-base md:text-lg leading-relaxed">
          Compare three tailored grade distribution paths designed to hit your target CGPA of <span className="text-emerald-400 font-bold">{targetCgpa}</span> based on your current standing (<span className="text-white font-semibold">{currentCgpa} CGPA</span>).
        </p>
      </div>

      {!hasCourses ? (
        <GlassCard className="max-w-2xl mx-auto border border-white/5 text-center p-8 space-y-6" interactive={false}>
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
            <AlertCircle size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">No Active Course Syllabus</h3>
            <p className="text-sm text-white/50 max-w-md mx-auto">
              Your profile doesn&apos;t have any courses registered for this semester. To generate study strategies, you need to register courses or load a demo profile.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <Link href="/calculator">
              <button className="px-6 py-3 rounded-full bg-gradient-to-r from-[#4F8EF7] to-blue-600 text-white font-bold text-sm hover:shadow-[0_0_20px_rgba(79,142,247,0.4)] transition-all">
                Add Semester Courses
              </button>
            </Link>
            <div className="flex gap-2 justify-center">
              <button 
                onClick={() => loadDemo("arjun")}
                className="px-4 py-3 rounded-full border border-white/10 text-white font-bold text-sm bg-white/5 hover:bg-white/10 transition-colors"
              >
                Load Arjun (High CGPA)
              </button>
              <button 
                onClick={() => loadDemo("rahul")}
                className="px-4 py-3 rounded-full border border-white/10 text-white font-bold text-sm bg-white/5 hover:bg-white/10 transition-colors"
              >
                Load Rahul (Declining/Risk)
              </button>
            </div>
          </div>
        </GlassCard>
      ) : (
        <>
          {/* Quick Metrics Bar */}
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
            <div>
              <span className="text-[10px] text-white/40 uppercase font-semibold">Current CGPA</span>
              <div className="text-xl font-bold text-white mt-0.5">{currentCgpa.toFixed(2)}</div>
            </div>
            <div>
              <span className="text-[10px] text-white/40 uppercase font-semibold">Target CGPA</span>
              <div className="text-xl font-bold text-[#4F8EF7] mt-0.5">{targetCgpa.toFixed(2)}</div>
            </div>
            <div>
              <span className="text-[10px] text-white/40 uppercase font-semibold">Earned Credits</span>
              <div className="text-xl font-bold text-white mt-0.5">{earnedCredits}</div>
            </div>
            <div>
              <span className="text-[10px] text-white/40 uppercase font-semibold">Active Syllabus</span>
              <div className="text-xl font-bold text-white mt-0.5">{courses.length} courses</div>
            </div>
          </div>

          {/* Strategy cards 3-column layout */}
          {strategies && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              <StrategyCard strategy={strategies.safe} />
              <StrategyCard strategy={strategies.balanced} isRecommended={true} />
              <StrategyCard strategy={strategies.aggressive} />
            </div>
          )}

          {/* Side-by-side / Comparison views */}
          {strategies && (
            <div className="pt-4 max-w-5xl mx-auto">
              <h3 className="text-xl font-headline font-bold text-white mb-6 flex items-center gap-2">
                <BookOpen size={20} className="text-[#4F8EF7]" />
                Side-by-Side Target Evaluation
              </h3>
              <StrategyComparison
                safe={strategies.safe}
                balanced={strategies.balanced}
                aggressive={strategies.aggressive}
              />
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
}
