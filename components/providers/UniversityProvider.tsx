"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";

import {
  UniversityPreset,
  GradingScale,
  getScaleMode,
  PRESETS,
  getMaxGradePoint,
  getPassingGradePoint,
} from "@/lib/presets";

export type { UniversityPreset, GradingScale };
export const UNI_PRESETS = PRESETS;

interface UniversityContextType {
  selectedUniId: string;
  setSelectedUniId: (id: string) => void;
  activePreset: UniversityPreset;
  scaleMode: GradingScale;

  // Derived computed values — thin consumers use these instead of
  // manually inspecting preset fields or branching on preset.id
  creditLabel: string;           // "Credits" or "Units"
  isRelativeGrading: boolean;    // true for relative/hybrid evaluation models
  maxGradePoint: number;         // e.g., 10 or 4
  passingGradePoint: number;     // lowest passing grade point in the scale
}

const UniversityContext = createContext<UniversityContextType | undefined>(undefined);

export function UniversityProvider({ children }: { children: ReactNode }) {
  const [selectedUniId, setSelectedUniId] = useState<string>("jspm");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("gradeflow_global_uni");
      if (saved && UNI_PRESETS.find(u => u.id === saved)) {
        setSelectedUniId(saved);
      }
    } catch (e) {
      console.error(e);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem("gradeflow_global_uni", selectedUniId);
      } catch (e) {
        console.error(e);
      }
    }
  }, [selectedUniId, mounted]);

  const activePreset = UNI_PRESETS.find((u) => u.id === selectedUniId) || UNI_PRESETS[0];

  // Derived values computed from activePreset — avoids manual branching in feature modules
  const derived = useMemo(() => ({
    creditLabel: activePreset.creditType === "units" ? "Units" : "Credits",
    isRelativeGrading: activePreset.evaluationModel === "relative" || activePreset.evaluationModel === "hybrid",
    maxGradePoint: getMaxGradePoint(activePreset),
    passingGradePoint: getPassingGradePoint(activePreset),
  }), [activePreset]);

  return (
    <UniversityContext.Provider
      value={{
        selectedUniId,
        setSelectedUniId,
        activePreset,
        scaleMode: getScaleMode(activePreset),
        ...derived,
      }}
    >
      {children}
    </UniversityContext.Provider>
  );
}

export function useUniversity() {
  const context = useContext(UniversityContext);
  if (context === undefined) {
    throw new Error("useUniversity must be used within a UniversityProvider");
  }
  return context;
}
