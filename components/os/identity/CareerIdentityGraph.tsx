"use client";

import React from "react";
import { TrendingUp, Award, Target, BrainCircuit, Code2, Cpu } from "lucide-react";

export default function CareerIdentityGraph() {
  return (
    <div className="w-full bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-700/50 p-6 flex flex-col md:flex-row gap-8 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Visual Graph Representation (Simulated Radar/Node) */}
      <div className="w-full md:w-1/2 flex items-center justify-center relative min-h-[300px]">
        <div className="relative w-64 h-64">
          <div className="absolute inset-0 rounded-full border border-slate-700/50 flex items-center justify-center">
            <div className="absolute inset-4 rounded-full border border-slate-700/30 flex items-center justify-center">
              <div className="absolute inset-8 rounded-full border border-slate-700/20" />
            </div>
          </div>
          
          {/* Nodes */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400 mt-2">AI Depth</span>
          </div>

          <div className="absolute bottom-4 right-4 flex flex-col items-center group">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-[0_0_15px_rgba(16,185,129,0.5)]">
              <Code2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400 mt-2">Core Tech</span>
          </div>

          <div className="absolute bottom-4 left-4 flex flex-col items-center group">
            <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-[0_0_15px_rgba(244,63,94,0.5)]">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400 mt-2">Systems</span>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
          
          {/* Connecting lines SVG simulation */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
            <polygon points="50,15 85,85 15,85" fill="rgba(99, 102, 241, 0.15)" stroke="rgba(99, 102, 241, 0.5)" strokeWidth="1" />
          </svg>
        </div>
      </div>

      {/* Positioning Engine Output */}
      <div className="w-full md:w-1/2 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 w-fit mb-4">
          <Target className="w-4 h-4" />
          <span className="text-xs font-semibold tracking-wider uppercase">Current Positioning</span>
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
          AI/ML Engineering Student focused on Computer Vision
        </h3>
        
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          Based on your recent projects and academic trajectory, you are strongest in AI concepts and backend architecture. Your profile indicates high readiness for AI-focused engineering roles.
        </p>

        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">Strongest Signal</h4>
              <p className="text-xs text-slate-400">High consistency in model training epochs and Python data engineering.</p>
            </div>
          </div>
          
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">Recommended Growth</h4>
              <p className="text-xs text-slate-400">Add 1 more Full Stack deployment to balance your AI backend.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
