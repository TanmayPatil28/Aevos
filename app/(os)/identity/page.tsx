"use client";

import React from "react";
import CareerIdentityGraph from "@/components/os/identity/CareerIdentityGraph";
import SkillGapAnalyzer from "@/components/os/identity/SkillGapAnalyzer";
import Link from "next/link";
import { Briefcase, Code, ChevronRight, Fingerprint } from "lucide-react";

export default function IdentityDashboardPage() {
  return (
    <div className="w-full h-full flex flex-col pt-8 pb-12 animate-in fade-in duration-500">
      <div className="mb-10 flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center">
          <Fingerprint className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Career Identity OS</h1>
          <p className="text-slate-400 text-sm">
            Continuous intelligence on your market readiness and professional positioning.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <CareerIdentityGraph />
        </div>
        <div>
          <SkillGapAnalyzer />
        </div>
      </div>

      <h2 className="text-xl font-bold text-white mt-8 mb-4">Optimization Engines</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LinkedIn Engine Portal */}
        <Link href="/identity/linkedin" className="block group">
          <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl border border-blue-500/30 p-6 relative overflow-hidden transition-all duration-300 hover:bg-slate-800/80 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="w-12 h-12 bg-[#0A66C2]/20 text-[#0A66C2] rounded-xl flex items-center justify-center border border-[#0A66C2]/30 group-hover:bg-[#0A66C2] group-hover:text-white transition-colors">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">LinkedIn Optimizer</h3>
                <p className="text-xs text-slate-400">Recruiter Impression & ATS Positioning</p>
              </div>
            </div>
            
            <p className="text-sm text-slate-400 mb-6 relative z-10">
              Transform your profile from a generic student to a targeted professional. AI analyzes your text, suggests elite replacements, and simulates a recruiter's 15-second impression.
            </p>
            
            <div className="flex items-center text-blue-400 text-sm font-semibold group-hover:text-blue-300 transition-colors">
              <span>Launch Optimizer</span>
              <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        {/* GitHub Engine Portal */}
        <Link href="/identity/github" className="block group">
          <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-600/50 p-6 relative overflow-hidden transition-all duration-300 hover:bg-slate-800/80 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/10 rounded-full blur-2xl group-hover:bg-slate-500/20 transition-colors" />
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center border border-white/20 group-hover:bg-white group-hover:text-black transition-colors">
                <Code className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">GitHub Optimizer</h3>
                <p className="text-xs text-slate-400">Engineering Signals & Code Credibility</p>
              </div>
            </div>
            
            <p className="text-sm text-slate-400 mb-6 relative z-10">
              Audit your repository health, generate professional READMEs, and identify "tutorial clones" vs portfolio-worthy projects that signal real production readiness.
            </p>
            
            <div className="flex items-center text-slate-300 text-sm font-semibold group-hover:text-white transition-colors">
              <span>Launch Optimizer</span>
              <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
