"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export function MoodleExitTestWidget() {
  const [status, setStatus] = useState<"pending" | "passed">("pending");

  return (
    <div className={`p-6 rounded-2xl border ${status === "passed" ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"} transition-colors relative overflow-hidden`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-300 mb-1">Moodle Exit Test Status</h3>
          <div className="flex items-center gap-2">
            {status === "passed" ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-lg font-black text-emerald-400">Passed</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-lg font-black text-red-400">Pending</span>
              </>
            )}
          </div>
          {status === "pending" && (
            <p className="text-xs text-slate-400 mt-2 max-w-[200px]">
              Failing this test blocks placement activities. Complete it immediately!
            </p>
          )}
        </div>

        <button
          onClick={() => setStatus(status === "passed" ? "pending" : "passed")}
          className={`p-2 rounded-lg text-xs font-bold transition-colors ${status === "passed" ? "bg-slate-800 text-slate-400 hover:bg-slate-700" : "bg-red-500 hover:bg-red-600 text-white"}`}
        >
          {status === "passed" ? "Revert" : "Mark Passed"}
        </button>
      </div>

      {status === "pending" && (
        <a 
          href="https://jspmuni.digiicampus.com/V2/#/home" 
          target="_blank" 
          rel="noreferrer"
          className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-slate-300 transition-colors"
        >
          Open DigiCampus <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}
