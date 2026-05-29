"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Code, LayoutTemplate, Star, GitCommit } from "lucide-react";
import RepoCredibilityMeter from "@/components/os/identity/github/RepoCredibilityMeter";
import EngineeringSignals from "@/components/os/identity/github/EngineeringSignals";
import ScoreCard from "@/components/os/identity/linkedin/ScoreCard";

export default function GitHubOptimizerPage() {
  return (
    <div className="w-full h-full flex flex-col pt-8 pb-12 animate-in fade-in duration-500">
      <Link href="/identity" className="flex items-center text-slate-400 hover:text-white transition-colors w-fit mb-6 text-sm font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Identity OS
      </Link>
      
      <div className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center">
            <Code className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1">GitHub Optimizer Engine</h1>
            <p className="text-slate-400 text-sm">
              Audit code quality, showcase elite engineering signals, and stand out.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <ScoreCard title="Professionalism Score" score={92} trend="up" trendValue="+8%" color="emerald" />
        <ScoreCard title="Recruiter Confidence" score={78} trend="neutral" color="blue" />
        <ScoreCard title="Open Source Readiness" score={45} trend="down" trendValue="-2%" color="amber" />
        <ScoreCard title="Consistency Factor" score={85} trend="up" trendValue="+15%" color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* README Intelligence Engine */}
          <div className="bg-[#1D1D1F] rounded-[32px] border border-white/5 p-6">
            <div className="flex items-center gap-2 mb-4">
              <LayoutTemplate className="w-5 h-5 text-indigo-400" />
              <h3 className="text-xl font-bold text-white">README Intelligence Engine</h3>
            </div>
            <p className="text-slate-400 text-sm mb-6">
              Generate recruiter-friendly or technical documentation structures instantly.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { name: "Investor/Demo", desc: "Focuses on UI & impact" },
                { name: "Technical", desc: "Focuses on architecture" },
                { name: "Minimal Elite", desc: "Clean & straight to point" },
              ].map((style, i) => (
                <div key={i} className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  i === 1 ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300" : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600"
                }`}>
                  <h4 className="font-semibold text-sm mb-1 text-white">{style.name}</h4>
                  <p className="text-xs opacity-80">{style.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4">
              <h4 className="text-sm font-semibold text-white mb-2 font-mono flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-slate-500" /> Proposed Structure (Technical)
              </h4>
              <ul className="space-y-2 text-sm text-slate-400 font-mono pl-6 border-l border-slate-800 ml-2">
                <li className="relative before:absolute before:-left-6 before:top-2 before:w-4 before:h-px before:bg-slate-800 text-indigo-300">1. System Architecture (Missing)</li>
                <li className="relative before:absolute before:-left-6 before:top-2 before:w-4 before:h-px before:bg-slate-800">2. Tech Stack Justification</li>
                <li className="relative before:absolute before:-left-6 before:top-2 before:w-4 before:h-px before:bg-slate-800 text-indigo-300">3. API Documentation (Missing)</li>
                <li className="relative before:absolute before:-left-6 before:top-2 before:w-4 before:h-px before:bg-slate-800">4. Local Setup</li>
              </ul>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RepoCredibilityMeter />
            
            {/* Portfolio Worthy Detector */}
            <div className="bg-[#1D1D1F] rounded-[32px] border border-white/5 p-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
               <div className="flex items-center gap-2 mb-4">
                 <Star className="w-5 h-5 text-amber-400" />
                 <h3 className="text-lg font-bold text-white">Portfolio-Worthy Projects</h3>
               </div>
               
               <p className="text-slate-400 text-sm mb-4">
                 These 2 projects are strongest for placements based on real-world engineering density:
               </p>
               
               <div className="space-y-3">
                 <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-3 flex justify-between items-center">
                   <span className="font-medium text-slate-200 text-sm">E-commerce API</span>
                   <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] uppercase font-bold rounded">Strong Backend</span>
                 </div>
                 <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-3 flex justify-between items-center">
                   <span className="font-medium text-slate-200 text-sm">Attendance Predictor</span>
                   <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[10px] uppercase font-bold rounded">Full Stack / ML</span>
                 </div>
               </div>
            </div>
          </div>
        </div>

        <div>
          <EngineeringSignals />
        </div>
      </div>
    </div>
  );
}
