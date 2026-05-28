"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Dashboard render error captured by boundary:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] pt-24 pb-20 px-4 md:px-8 flex items-center justify-center relative overflow-hidden">

      <div className="relative z-10 w-full max-w-2xl text-center">
        <div className="glass-card rounded-[3rem] p-10 md:p-14 border border-white/10 flex flex-col items-center">
          
          {/* Icon HUD */}
          <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-inner">
            <AlertCircle className="text-white/70 w-10 h-10" />
          </div>

          {/* Heading */}
          <h2 className="font-headline font-black text-3xl md:text-4xl text-white mb-4 tracking-tight">
            Dashboard System Interruption
          </h2>

          {/* Subtext */}
          <p className="text-slate-400 font-medium leading-relaxed max-w-md mb-8 text-sm">
            An unexpected mismatch occurred while rendering your academic workspace. Don't worry, your authoritative data is secure.
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-4 justify-center w-full max-w-xs">
            <button
              onClick={() => reset()}
              className="w-full h-14 rounded-xl bg-white text-black font-bold flex items-center justify-center gap-3 transition-all hover:bg-white/90 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              Recover Workspace
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("gradeflow-usm-storage");
                window.location.reload();
              }}
              className="w-full h-14 rounded-xl border border-white/10 hover:border-white/20 text-white/70 font-bold flex items-center justify-center gap-3 transition-all active:scale-95 bg-white/5 hover:text-white"
            >
              Clear Local Cache & Reload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
