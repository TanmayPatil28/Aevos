import React from "react";
import FocusModeWrapper from "@/components/workspace/FocusModeWrapper";

export default function BacklogPage() {
  return (
    <FocusModeWrapper title="Backlog Recovery Protocol">
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Backlog Scanner & Recovery</h2>
        <p className="text-white/60 max-w-md">
          Analyze fail grade impact and generate a step-by-step recovery plan to clear your backlogs while maintaining your target CGPA.
        </p>
        {/* We will mount the actual Backlog components here */}
        <div className="mt-8 p-6 border border-rose-500/20 bg-rose-500/5 rounded-xl text-rose-400 font-mono text-sm">
          System initializing... Connect to USM store to load backlog data.
        </div>
      </div>
    </FocusModeWrapper>
  );
}
