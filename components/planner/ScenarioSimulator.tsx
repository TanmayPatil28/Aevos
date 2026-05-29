"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, AlertTriangle, TrendingDown, EyeOff, FileQuestion } from "lucide-react";
import Card from "@/components/ui/Card";

export interface Scenario {
  id: string;
  title: string;
  description: string;
  impactType: "negative" | "neutral" | "positive";
  icon: React.ReactNode;
}

const SCENARIOS: Scenario[] = [
  {
    id: "fail_one",
    title: "What if I fail one subject?",
    description: "Simulates the impact of an active backlog on your recovery and GPA trend.",
    impactType: "negative",
    icon: <AlertTriangle size={18} />
  },
  {
    id: "attendance_drop",
    title: "What if attendance drops?",
    description: "Assume missing 2 weeks of classes, reducing internal marking buffer.",
    impactType: "negative",
    icon: <TrendingDown size={18} />
  },
  {
    id: "focus_internship",
    title: "What if I focus on Placements?",
    description: "Reduces expected SGPA by 0.5 to free up 15 hours/week for DSA & Interviews.",
    impactType: "neutral",
    icon: <EyeOff size={18} />
  },
  {
    id: "skip_semester",
    title: "What if I score low internals?",
    description: "Assumes 20% lower internal scores, requiring higher final exam performance.",
    impactType: "negative",
    icon: <FileQuestion size={18} />
  }
];

interface ScenarioSimulatorProps {
  currentCgpa?: number;
  targetCgpa?: number;
  completedSemesters?: number;
  remainingSemesters?: number;
  result?: any;
  preset?: any;
}

export default function ScenarioSimulator(props: ScenarioSimulatorProps) {
  const [activeScenario, setActiveScenario] = React.useState<string | null>(null);

  const onSelectScenario = (id: string | null) => {
    setActiveScenario(id);
  };
  return (
    <Card padding="lg" className="border border-white/10 bg-[#1D1D1F] relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          <HelpCircle className="text-cyan-400" size={20} />
        </div>
        <div>
          <h3 className="font-headline text-lg font-bold text-white">Future Preview Simulator</h3>
          <p className="text-xs text-on-surface-variant font-medium">Test stress scenarios against your plan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
        {SCENARIOS.map((scenario) => {
          const isActive = activeScenario === scenario.id;
          return (
            <button
              key={scenario.id}
              onClick={() => onSelectScenario(isActive ? null : scenario.id)}
              className={`p-4 rounded-xl text-left border transition-all duration-300 flex flex-col gap-2 ${
                isActive 
                ? "bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)]" 
                : "bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`${isActive ? "text-cyan-400" : "text-white/40"}`}>
                  {scenario.icon}
                </span>
                <span className={`font-bold text-sm ${isActive ? "text-cyan-100" : "text-white/80"}`}>
                  {scenario.title}
                </span>
              </div>
              
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs text-cyan-200/70 mt-1 leading-relaxed">
                      {scenario.description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
