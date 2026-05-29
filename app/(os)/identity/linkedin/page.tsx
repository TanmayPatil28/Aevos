"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Briefcase, Wand2, Search, FileText } from "lucide-react";
import ScoreCard from "@/components/os/identity/linkedin/ScoreCard";
import ProfileSimulator from "@/components/os/identity/linkedin/ProfileSimulator";

export default function LinkedInOptimizerPage() {
  return (
    <div className="w-full h-full flex flex-col pt-8 pb-12 animate-in fade-in duration-500">
      <Link href="/identity" className="flex items-center text-slate-400 hover:text-white transition-colors w-fit mb-6 text-sm font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Identity OS
      </Link>
      
      <div className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#0A66C2]/20 border border-[#0A66C2]/30 rounded-2xl flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-[#0A66C2]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1">LinkedIn Optimizer Engine</h1>
            <p className="text-slate-400 text-sm">
              Transform your profile for maximum recruiter visibility.
            </p>
          </div>
        </div>
      </div>

      {/* Impression Scores */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <ScoreCard title="Recruiter Attraction" score={68} trend="up" trendValue="+12%" color="indigo" />
        <ScoreCard title="ATS Discoverability" score={45} trend="down" trendValue="-5%" color="amber" />
        <ScoreCard title="Technical Credibility" score={82} trend="up" trendValue="+4%" color="emerald" />
        <ScoreCard title="Fresher Readiness" score={75} trend="neutral" color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Headlines & Weak Profile Detector */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Weak Profile Detector */}
          <div className="bg-[#1D1D1F] rounded-[32px] border border-white/5 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-rose-400" />
              <h3 className="text-lg font-bold text-white">Weak Profile Detector</h3>
            </div>
            
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 mb-4">
              <p className="text-slate-300 text-sm leading-relaxed">
                "I am a <span className="bg-rose-500/20 text-rose-300 px-1 rounded border-b border-rose-500/50 cursor-pointer">passionate developer</span> currently <span className="bg-rose-500/20 text-rose-300 px-1 rounded border-b border-rose-500/50 cursor-pointer">studying at</span> XYZ college. I have <span className="bg-rose-500/20 text-rose-300 px-1 rounded border-b border-rose-500/50 cursor-pointer">worked on an AI project</span> and I am looking for an internship."
              </p>
            </div>
            
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex gap-4">
              <Wand2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-emerald-300">Elite Suggestion</h4>
                <p className="text-sm text-slate-300 mt-1 italic">
                  "AI Engineering Student building predictive models with TensorFlow. Recently developed a computer vision pipeline with 94% accuracy. Actively seeking AI/ML internship opportunities."
                </p>
                <button className="mt-3 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-lg transition-colors">
                  Apply Fixes
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Headline Modes */}
          <div className="bg-[#1D1D1F] rounded-[32px] border border-white/5 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Dynamic Headline Modes</h3>
            
            <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
              {["Internship Hunter", "Research-Oriented", "Startup Founder", "Open Source Developer", "Corporate Placement"].map((mode, i) => (
                <button key={i} className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-colors border ${i === 0 ? "bg-indigo-500/20 border-indigo-500 text-indigo-300" : "bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white"}`}>
                  {mode}
                </button>
              ))}
            </div>

            <div className="mt-2 bg-slate-950 rounded-xl border border-slate-800 p-6 flex flex-col items-center justify-center text-center">
              <h4 className="text-xl font-bold text-white mb-2">AI/ML Engineering Student | Next.js & Python | Seeking Summer Internship 2027</h4>
              <div className="flex gap-2 mt-4">
                <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition-colors">Regenerate</button>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors">Copy to Clipboard</button>
              </div>
            </div>
          </div>

        </div>

        {/* Profile Simulator */}
        <div>
          <ProfileSimulator />
        </div>
      </div>
    </div>
  );
}
