"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import GlowButton from "@/components/GlowButton";
import GlassCard from "@/components/GlassCard";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled Next.js Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000000] p-6 text-white selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#000000] to-[#000000] pointer-events-none" />
      
      <GlassCard className="max-w-md w-full p-8 text-center border-red-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-red-500/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="inline-flex p-4 bg-red-500/10 rounded-2xl border border-red-500/20 text-red-400 mb-6 animate-pulse">
          <AlertTriangle size={32} />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          Application Exception
        </h1>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          An unexpected application-level boundary was crossed. We&apos;ve logged this event for our team.
        </p>

        {error && (
          <div className="bg-black/40 border border-white/5 rounded-lg p-3 text-left font-mono text-xs text-red-300 max-h-32 overflow-auto mb-6 select-all scrollbar-thin scrollbar-thumb-white/10">
            {error.name}: {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <GlowButton
            onClick={() => reset()}
            variant="primary"
            className="w-full sm:w-auto animate-pulse"
          >
            <RefreshCw size={16} className="mr-2" />
            Reload Component
          </GlowButton>
          <GlowButton
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = "/dashboard";
              }
            }}
            variant="secondary"
            className="w-full sm:w-auto"
          >
            <Home size={16} className="mr-2" />
            Dashboard
          </GlowButton>
        </div>
      </GlassCard>
    </div>
  );
}
