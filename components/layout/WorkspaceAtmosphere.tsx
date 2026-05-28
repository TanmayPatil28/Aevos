"use client";

import React from "react";
import { useUSMStore } from "@/stores/usmStore";

export default function WorkspaceAtmosphere() {
  const store = useUSMStore();
  
  const isRecovery = store.workspaceContexts.includes("RECOVERY");
  const isOptimization = store.workspaceContexts.includes("OPTIMIZATION");
  const isSandbox = !!store.simulation?.selectedScenarioId;

  // State-driven color resolution
  let glowColor1 = "bg-black/0";
  let glowColor2 = "bg-black/0";

  if (isSandbox) {
    glowColor1 = "bg-[#4F8EF7]/5";
    glowColor2 = "bg-indigo-500/5";
  } else if (isRecovery) {
    glowColor1 = "bg-amber-500/5";
    glowColor2 = "bg-orange-500/5";
  } else if (isOptimization) {
    glowColor1 = "bg-emerald-500/5";
    glowColor2 = "bg-teal-500/5";
  } else {
    // Focus Mode (Default Calm State)
    glowColor1 = "bg-white/[0.01]";
    glowColor2 = "bg-black";
  }

  return (
    <>
      <div 
        className={`fixed top-0 right-0 w-[80vw] h-[80vh] rounded-full blur-[120px] pointer-events-none transition-colors duration-1000 ease-in-out ${glowColor1}`} 
      />
      <div 
        className={`fixed bottom-0 left-0 w-[50vw] h-[50vh] rounded-full blur-[120px] pointer-events-none transition-colors duration-1000 ease-in-out ${glowColor2}`} 
      />
    </>
  );
}
