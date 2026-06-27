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
    <div className="w-full flex flex-col gap-6">
      <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-400/70 flex items-center gap-2 shrink-0">
        <TrendingDown size={16} /> Predictive Analysis
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 h-fit relative z-10">
        {SCENARIOS.map((scenario) => {
          const isActive = activeScenario === scenario.id;
          return (
            <button
              key={scenario.id}
              onClick={() => onSelectScenario(isActive ? null : scenario.id)}
              className={`p-6 rounded-card-large text-left border transition-all duration-300 flex flex-col gap-3 h-full ${
                isActive 
                ? "bg-cyan-500/10 border-cyan-500/40" 
                : "bg-white/5 border-transparent hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isActive ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 text-white/40"}`}>
                  {scenario.icon}
                </span>
                <span className={`font-bold text-base ${isActive ? "text-cyan-100" : "text-white/80"}`}>
                  {scenario.title}
                </span>
              </div>
              
              <p className={`text-xs mt-auto leading-relaxed ${isActive ? "text-cyan-200/70" : "text-white/40"}`}>
                {scenario.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
