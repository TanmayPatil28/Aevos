"use client";

import React, { useState } from "react";
import NeuralDecisionTree from "@/components/forecast/NeuralDecisionTree";
import ForecastStatusBar from "@/components/forecast/ForecastStatusBar";
import { useUSMStore } from "@/stores/usmStore";
import { StudentState } from "@/lib/forecasting/decisionTypes";
import dynamic from "next/dynamic";
const PredictiveForecastModule = dynamic(() => import("@/components/forecast/PredictiveForecastModule"), { ssr: false });

export default function CalculatorForecast() {
  const currentCgpa = useUSMStore(state => state.academic.currentCgpa) || 7.0;
  const completedSemesters = useUSMStore(state => state.academic.completedSemesters) || 0;
  const targetCgpa = useUSMStore(state => state.workspaceUi.globalTargetCgpa) || 8.0;

  // Initialize state based on current student data
  const [studentState, setStudentState] = useState<StudentState>({
    currentCgpa,
    completedSemesters,
    skillPoints: 10,
    careerReadiness: 20,
    stressLevel: 30,
    logs: ["Started the simulation timeline."]
  });

  return (
    <div className="relative w-full h-fit flex flex-col">
      {/* Sticky Status Bar */}
      <ForecastStatusBar state={studentState} targetCgpa={targetCgpa} />

      {/* Vertical Roadmap Canvas */}
      <div className="relative z-10 w-full min-h-[100vh] flex flex-col items-center pt-8 pb-32">
        <PredictiveForecastModule />
        <div className="w-full h-px bg-white/10 my-16 max-w-4xl" />
        <NeuralDecisionTree 
          initialState={{
            currentCgpa,
            completedSemesters,
            skillPoints: 10,
            careerReadiness: 20,
            stressLevel: 30,
            logs: ["Started the simulation timeline."]
          }}
          onStateChange={setStudentState} 
        />
      </div>
    </div>
  );
}
