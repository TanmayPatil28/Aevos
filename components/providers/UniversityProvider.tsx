"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";

import {
  UniversityPreset,
  GradingScale,
  getScaleMode,
  PRESETS,
  getAllPresets,
  getMaxGradePoint,
  getPassingGradePoint,
} from "@/lib/presets";

export type { UniversityPreset, GradingScale };
export const UNI_PRESETS = getAllPresets();

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

  // Isolation telemetry & fallback state
  isIsolatedFallback: boolean;
  isolatedPresetId: string | null;
  isolatedPresetName: string | null;
}

const UniversityContext = createContext<UniversityContextType | undefined>(undefined);

export function UniversityProvider({ children }: { children: ReactNode }) {
  const [selectedUniId, setSelectedUniId] = useState<string>("jspm");
  const [mounted, setMounted] = useState(false);
  const [isIsolatedFallback, setIsIsolatedFallback] = useState<boolean>(false);
  const [isolatedPresetId, setIsolatedPresetId] = useState<string | null>(null);
  const [isolatedPresetName, setIsolatedPresetName] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("gradeflow_global_uni");
      if (saved) {
        const verifiedList = getAllPresets();
        const isVerified = verifiedList.some(u => u.id === saved);
        if (isVerified) {
          setSelectedUniId(saved);
          setIsIsolatedFallback(false);
          setIsolatedPresetId(null);
          setIsolatedPresetName(null);
        } else {
          // If it exists in raw PRESETS, but not in VERIFIED_PRESETS
          const rawPreset = PRESETS.find(u => u.id === saved);
          if (rawPreset) {
            setIsIsolatedFallback(true);
            setIsolatedPresetId(rawPreset.id);
            setIsolatedPresetName(rawPreset.name);
            setSelectedUniId("custom_10");
            console.error(`[GradeFlow Trust Telemetry] Isolated preset loaded as fallback: ${rawPreset.id}`);
          } else {
            setSelectedUniId("jspm");
          }
        }
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

  const activePreset = useMemo(() => {
    return getAllPresets().find((u) => u.id === selectedUniId) || getAllPresets()[0];
  }, [selectedUniId]);

  const handleSelectUni = (id: string) => {
    const verifiedList = getAllPresets();
    const isVerified = verifiedList.some(u => u.id === id);
    if (isVerified) {
      setSelectedUniId(id);
      setIsIsolatedFallback(false);
      setIsolatedPresetId(null);
      setIsolatedPresetName(null);
    } else {
      const rawPreset = PRESETS.find(u => u.id === id);
      if (rawPreset) {
        setIsIsolatedFallback(true);
        setIsolatedPresetId(rawPreset.id);
        setIsolatedPresetName(rawPreset.name);
        setSelectedUniId("custom_10");
        console.error(`[GradeFlow Trust Telemetry] Isolated preset loaded as fallback: ${rawPreset.id}`);
      }
    }
  };

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
        setSelectedUniId: handleSelectUni,
        activePreset,
        scaleMode: getScaleMode(activePreset),
        isIsolatedFallback,
        isolatedPresetId,
        isolatedPresetName,
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
