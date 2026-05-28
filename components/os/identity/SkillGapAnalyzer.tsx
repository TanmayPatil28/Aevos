"use client";

import React from "react";
import { AlertCircle, CheckCircle2, ChevronRight, Briefcase } from "lucide-react";

export default function SkillGapAnalyzer() {
  const matchPercentage = 42;
  
  return (
    <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Role Readiness</h3>
          <p className="text-slate-400 text-sm">Target: AI Engineering Intern</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-black text-amber-400">{matchPercentage}%</div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Match</div>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-slate-800 relative flex items-center justify-center">
            {/* SVG Circle for progress */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="rgba(251, 191, 36, 0.2)"
                strokeWidth="4"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="4"
                strokeDasharray="175"
                strokeDashoffset={175 - (175 * matchPercentage) / 100}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <Briefcase className="w-5 h-5 text-slate-400" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Acquired Skills */}
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Strong Signals
          </h4>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-300 text-xs rounded-md border border-emerald-500/20">Python</span>
            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-300 text-xs rounded-md border border-emerald-500/20">Data Structures</span>
            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-300 text-xs rounded-md border border-emerald-500/20">TensorFlow Basics</span>
          </div>
        </div>

        {/* Missing Signals */}
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-rose-400 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Missing Signals
          </h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3 group cursor-pointer">
              <div className="w-6 h-6 rounded bg-rose-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">Cloud Deployment</div>
                <div className="text-xs text-slate-500">Deploy at least 1 ML model to AWS or GCP.</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
            </div>
            
            <div className="flex items-start gap-3 group cursor-pointer">
              <div className="w-6 h-6 rounded bg-rose-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">End-to-End Pipeline</div>
                <div className="text-xs text-slate-500">Your GitHub lacks data processing pipelines.</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
