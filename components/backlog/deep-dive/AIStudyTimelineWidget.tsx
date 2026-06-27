"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Loader2, Sparkles, AlertTriangle, CheckCircle } from "lucide-react";
import { CourseState } from "@/stores/usmStore";

interface BacklogPlan {
  courseName: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  weeks: {
    weekNumber: number;
    focus: string;
    tasks: string[];
  }[];
}

interface AIStudyTimelineWidgetProps {
  course: CourseState;
}

export default function AIStudyTimelineWidget({ course }: AIStudyTimelineWidgetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<BacklogPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generatePlan = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/jarvis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `create a study plan for ${course.name} backlog`,
          studentContext: `The student has a backlog in ${course.name} (${course.code}). Credits: ${course.credits}. CIE Marks: ${course.cieMarks}. Bunks: ${course.attendanceBunked}.`
        })
      });

      if (!res.ok) throw new Error("Failed to contact Jarvis");
      const data = await res.json();
      
      if (data.action?.type === "generate_backlog_plan" && data.action.backlogPlan) {
        setPlan(data.action.backlogPlan);
      } else {
        throw new Error("Jarvis returned an unexpected response format.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate plan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-surface-raised rounded-[24px] p-6 border border-white/[0.04] relative overflow-hidden flex flex-col group hover:border-white/[0.08] transition-colors shadow-none">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-surface border border-white/[0.04] rounded-2xl text-white">
          <Calendar size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Jarvis Study Plan</h3>
          <p className="text-white/40 text-sm">AI-generated weekly milestones</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-[250px]">
        <AnimatePresence mode="wait">
          {!plan && !isLoading && (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-center px-4"
            >
              <Sparkles size={40} className="text-white/50 mb-4" />
              <p className="text-white/60 text-sm mb-6">Ask Jarvis to generate a personalized 4-week recovery timeline for {course.name}.</p>
              <button 
                onClick={generatePlan}
                className="px-6 py-3 bg-white text-black font-bold rounded-full hover:brightness-110 transition-all flex items-center gap-2 shadow-none border-none"
              >
                <Sparkles size={18} />
                Generate Timeline
              </button>
              {error && <p className="text-red-400 text-sm mt-4 flex items-center gap-1"><AlertTriangle size={14}/> {error}</p>}
            </motion.div>
          )}

          {isLoading && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-center px-4"
            >
              <Loader2 size={40} className="text-white animate-spin mb-4" />
              <p className="text-white font-bold">Jarvis is formulating...</p>
              <p className="text-white/40 text-sm mt-1">Analyzing difficulty and credit load</p>
            </motion.div>
          )}

          {plan && !isLoading && (
            <motion.div 
              key="plan"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Difficulty: <span className={plan.difficulty === 'HARD' ? 'text-red-400' : plan.difficulty === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}>{plan.difficulty}</span></span>
                <button onClick={() => setPlan(null)} className="text-xs text-white/50 hover:text-white">Reset</button>
              </div>

              {plan.weeks.map((week, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={week.weekNumber} 
                  className="bg-surface border border-white/[0.04] rounded-xl p-4 flex gap-4"
                >
                  <div className="flex flex-col items-center gap-1 min-w-[50px]">
                    <span className="text-xs text-white/40 font-bold uppercase">Week</span>
                    <span className="text-2xl font-black text-white">{week.weekNumber}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-bold mb-2">{week.focus}</h4>
                    <ul className="flex flex-col gap-2">
                      {week.tasks.map((task, i) => (
                        <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                          <CheckCircle size={14} className="text-white/30 mt-0.5 shrink-0" />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
