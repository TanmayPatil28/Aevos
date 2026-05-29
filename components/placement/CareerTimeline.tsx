import React from "react";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface TimelineStep {
  sem: number;
  title: string;
  tasks: string[];
  status: "COMPLETED" | "CURRENT" | "FUTURE";
}

export default function CareerTimeline({ timeline }: { timeline: TimelineStep[] }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-white mb-4">Your Career GPS</h3>
      <div className="relative border-l border-white/20 ml-3 space-y-6">
        {timeline.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative pl-6"
          >
            {/* Timeline Node Icon */}
            <div className={`absolute -left-3 top-1 bg-[#1D1D1F] rounded-full p-0.5 border ${
              step.status === "COMPLETED" ? "text-emerald-500 border-emerald-500/30" :
              step.status === "CURRENT" ? "text-indigo-400 border-indigo-400 shadow-none" :
              "text-white/40 border-white/20"
            }`}>
              {step.status === "COMPLETED" ? <CheckCircle2 className="w-4 h-4" /> :
               step.status === "CURRENT" ? <Clock className="w-4 h-4 animate-pulse" /> :
               <Circle className="w-4 h-4" />}
            </div>

            <div className={`p-4 rounded-xl border ${
              step.status === "CURRENT" ? "bg-[#1D1D1F] border-indigo-500/30" : "bg-[#1D1D1F] border-white/5"
            }`}>
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  step.status === "CURRENT" ? "text-indigo-300" : "text-white/50"
                }`}>Semester {step.sem}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  step.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-400" :
                  step.status === "CURRENT" ? "bg-indigo-500/20 text-indigo-300" :
                  "bg-[#222224] text-white/40"
                }`}>{step.status}</span>
              </div>
              <h4 className={`font-semibold mb-2 ${
                step.status === "FUTURE" ? "text-white/70" : "text-white"
              }`}>{step.title}</h4>
              <ul className="space-y-1">
                {step.tasks.map((task, i) => (
                  <li key={i} className={`text-xs flex items-center gap-2 ${
                    step.status === "COMPLETED" ? "text-white/40 line-through" : "text-white/70"
                  }`}>
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
