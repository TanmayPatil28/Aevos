"use client";

import React, { useState } from "react";
import { Eye, Clock, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";

export default function ProfileSimulator() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(true); // For UI demo purposes, keep it true initially

  return (
    <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-700/50 p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-400" />
            Recruiter View Simulation
          </h3>
          <p className="text-slate-400 text-sm mt-1">What a recruiter sees in 15 seconds.</p>
        </div>
        
        <button 
          onClick={() => {
            setIsSimulating(true);
            setSimulationComplete(false);
            setTimeout(() => {
              setIsSimulating(false);
              setSimulationComplete(true);
            }, 2000);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm font-semibold rounded-xl border border-indigo-500/30 transition-all"
        >
          <Clock className={`w-4 h-4 ${isSimulating ? "animate-spin" : ""}`} />
          {isSimulating ? "Simulating..." : "Run Simulation"}
        </button>
      </div>

      <div className="flex-1">
        {!simulationComplete && isSimulating && (
          <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center text-slate-500">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
            <p className="animate-pulse">Analyzing eye-tracking patterns & keyword density...</p>
          </div>
        )}

        {simulationComplete && !isSimulating && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex gap-4">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-emerald-300">Strong technical depth detected</h4>
                <p className="text-xs text-slate-400 mt-1">Your headline strongly signals your tech stack within the first 3 seconds of reading.</p>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-4">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-amber-300">Looks tutorial-based</h4>
                <p className="text-xs text-slate-400 mt-1">The project "To-Do App" implies a beginner level. We recommend replacing this with a data-driven project.</p>
              </div>
            </div>

            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex gap-4">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-rose-300">Missing measurable impact</h4>
                <p className="text-xs text-slate-400 mt-1">Recruiters scan for numbers (e.g., "reduced load time by 40%"). Your descriptions currently lack metrics.</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 border border-indigo-500/20 bg-indigo-500/5 rounded-xl text-center">
              <p className="text-sm text-indigo-300 font-medium">Simulation Verdict</p>
              <h3 className="text-2xl font-black text-white mt-1">"Good Projects, Weak Branding"</h3>
              <p className="text-xs text-slate-400 mt-2">Adjust your 'About' section to shift from a student tone to an engineer tone.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
