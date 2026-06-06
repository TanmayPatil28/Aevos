"use client";

import React, { useState } from "react";
import NeuralDecisionTree from "@/components/forecast/NeuralDecisionTree";
import ForecastStatusBar from "@/components/forecast/ForecastStatusBar";
import { useUSMStore } from "@/stores/usmStore";
import { StudentState } from "@/lib/forecasting/decisionTypes";

export default function NeuralDecisionEnginePage() {
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
    <div className="relative w-full h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar bg-black selection:bg-[#0a84ff]/30">
      {/* Background Grid & Ambience */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-black/20 via-transparent to-black pointer-events-none" />

      {/* Sticky Status Bar */}
      <ForecastStatusBar state={studentState} targetCgpa={targetCgpa} />

      {/* Vertical Roadmap Canvas */}
      <div className="relative z-10 w-full min-h-[150vh] flex flex-col items-center pt-16 pb-32">
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
