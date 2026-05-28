"use client";

import React from "react";
import { CheckCircle2, Shield, AlertTriangle } from "lucide-react";

export default function RepoCredibilityMeter() {
  const auditScore = 84;
  
  return (
    <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            Repository Credibility
          </h3>
          <p className="text-slate-400 text-sm mt-1">Audit of your top pinned repositories.</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-black text-white">{auditScore}</span>
          <span className="text-sm font-medium text-slate-500">/100</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Metric 1 */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-300 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Documentation Depth
            </span>
            <span className="text-emerald-400 font-bold">Excellent</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: "90%" }} />
          </div>
        </div>

        {/* Metric 2 */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-300 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Deployment Links
            </span>
            <span className="text-amber-400 font-bold">Missing in 2 Repos</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: "60%" }} />
          </div>
        </div>

        {/* Metric 3 */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-300 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Modular Architecture
            </span>
            <span className="text-emerald-400 font-bold">Strong</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: "85%" }} />
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-slate-800">
           <h4 className="text-sm font-semibold text-white mb-2">Tutorial Project Detector</h4>
           <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 flex items-start gap-3">
             <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
             <div>
               <p className="text-sm font-medium text-slate-300 line-clamp-1">react-todo-app-clone</p>
               <p className="text-xs text-slate-500 mt-1">High probability of being a tutorial clone. Lacks originality. Suggestion: Add a backend database or authentication to increase credibility.</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
