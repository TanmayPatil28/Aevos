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
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-8 shadow-inner animate-pulse">
            <AlertCircle className="text-red-500 w-10 h-10" />
          </div>

          {/* Heading */}
          <h2 className="font-headline font-black text-3xl md:text-4xl text-white mb-4 tracking-tight">
            Dashboard System Interruption
          </h2>

          {/* Subtext */}
          <p className="text-on-surface-variant font-medium leading-relaxed max-w-md mb-8">
            An unexpected validation anomaly or engine mismatch occurred while rendering your academic progress workspace.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
            <button
              onClick={() => reset()}
              className="px-8 h-14 rounded-full bg-primary text-white font-black uppercase text-xs flex items-center justify-center gap-3 transition-all hover:bg-primary-hover active:scale-95 shadow-[0_10px_30px_rgba(80,143,248,0.2)]"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Workspace
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-8 h-14 rounded-full border border-white/10 hover:border-white/20 text-white font-black uppercase text-xs flex items-center justify-center gap-3 transition-all active:scale-95 bg-white/5"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
