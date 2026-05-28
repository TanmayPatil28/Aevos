"use client";

import React, { useMemo, useState } from "react";
import FocusModeWrapper from "@/components/workspace/FocusModeWrapper";
import TrajectoryChart from "@/components/forecast/TrajectoryChart";
import ScenarioSelector from "@/components/forecast/ScenarioSelector";
import ProjectionTable from "@/components/forecast/ProjectionTable";
import { useUSMStore } from "@/stores/usmStore";
import { scenarioFactory } from "@/lib/forecasting/scenarioFactory";
import { ForecastEngineInput } from "@/lib/forecasting/types";

export default function ForecastPage() {
  const currentCgpa = useUSMStore(state => state.academic.currentCgpa);
  const completedSemesters = useUSMStore(state => state.academic.completedSemesters);
  const earnedCredits = useUSMStore(state => state.academic.earnedCredits);
  const targetCgpa = useUSMStore(state => state.workspaceUi.globalTargetCgpa) || 8.0;
  const semesterHistory = useUSMStore(state => state.semesterHistory);
  const presetId = useUSMStore(state => state.presetId);
  const cgpaVolatility = useUSMStore(state => 0.1); // Placeholder

  const [activeScenarioId, setActiveScenarioId] = useState("maintain");

  const currentSgpa = semesterHistory.length > 0 
    ? semesterHistory[semesterHistory.length - 1].sgpa 
    : currentCgpa;

  const scenarios = useMemo(() => {
    const input: ForecastEngineInput = {
      currentCgpa,
      completedSemesters,
      earnedCredits,
      targetCgpa,
      totalProgramSemesters: 8,
      creditsPerSemester: 20,
      currentSgpa,
      volatility: cgpaVolatility,
    };
    return scenarioFactory.generateAll(input, presetId);
  }, [
    currentCgpa, completedSemesters, earnedCredits, targetCgpa, 
    currentSgpa, cgpaVolatility, presetId
  ]);

  return (
    <FocusModeWrapper title="Grade Forecaster">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <TrajectoryChart 
            scenarios={scenarios}
            activeScenarioId={activeScenarioId}
            targetCgpa={targetCgpa}
            currentCgpa={currentCgpa}
            completedSemesters={completedSemesters}
          />
          <ProjectionTable 
            projections={scenarios.find(s => s.id === activeScenarioId)?.projections || []}
            targetCgpa={targetCgpa}
          />
        </div>
        <div className="space-y-8">
          <ScenarioSelector 
            scenarios={scenarios}
            activeScenarioId={activeScenarioId}
            setActiveScenarioId={setActiveScenarioId}
          />
        </div>
      </div>
    </FocusModeWrapper>
  );
}
