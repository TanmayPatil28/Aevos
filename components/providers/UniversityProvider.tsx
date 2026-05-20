"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type GradingScale = "10" | "4" | "percent";

export interface UniversityPreset {
  id: string;
  name: string;
  scaleMode: GradingScale;
  shortName: string;
  specialFeatures?: {
    isVerified: boolean;
    hasLetterGrades?: boolean;
    defaultCreditsPerSem?: number[];
  };
}

export const UNI_PRESETS: UniversityPreset[] = [
  { 
    id: "jspm", 
    name: "JSPM RSCOE", 
    shortName: "JSPM", 
    scaleMode: "10",
    specialFeatures: {
      isVerified: true,
      hasLetterGrades: true,
      defaultCreditsPerSem: [21, 23, 20, 20, 20, 20, 20, 20] 
    }
  },
  { id: "sppu", name: "SPPU (General)", shortName: "SPPU", scaleMode: "10" },
  { id: "mu", name: "Mumbai University", shortName: "Mumbai Uni", scaleMode: "percent" },
  { id: "vtu", name: "VTU", shortName: "VTU", scaleMode: "10" },
  { id: "us", name: "US / Global Tech", shortName: "Global", scaleMode: "4" },
  { id: "custom_10", name: "Custom (10.0 Scale)", shortName: "Custom 10", scaleMode: "10" },
  { id: "custom_percent", name: "Custom (Percentage)", shortName: "Custom %", scaleMode: "percent" },
];

interface UniversityContextType {
  selectedUniId: string;
  setSelectedUniId: (id: string) => void;
  activePreset: UniversityPreset;
  scaleMode: GradingScale;
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

  return (
    <UniversityContext.Provider
      value={{
        selectedUniId,
        setSelectedUniId,
        activePreset,
        scaleMode: activePreset.scaleMode,
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
