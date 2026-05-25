"use client";

import { useDomainStore } from "@/stores/os/domainStore";
import { useUIStore } from "@/stores/os/uiStore";
import { useEffect, useState, useMemo } from "react";
import { LineChart, Line, ResponsiveContainer, YAxis, ReferenceLine } from "recharts";
import { COPY } from "@/lib/os/constants/copy";

export default function ForecastingCanvas() {
  const { courses, terms } = useDomainStore();
  const { setContextBar, clearContextBar } = useUIStore();

  useEffect(() => {
    setContextBar("Academic Planning", []);
    return () => clearContextBar();
  }, [setContextBar, clearContextBar]);

  // Derived current state
  const totalCredits = courses.reduce((acc, c) => acc + (c.credits || 0), 0);
  const totalPoints = courses.reduce((acc, c) => acc + ((c.credits || 0) * (c.gradePoints || 0)), 0);
  const currentCGPA = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
  
  // Forecasting State
  const [targetCGPA, setTargetCGPA] = useState<number>(
    currentCGPA > 0 ? Math.min(10, Math.ceil(currentCGPA * 10 + 2) / 10) : 8.0
  );
  const [futureCredits, setFutureCredits] = useState<number>(20); // standard semester

  // Calculation: What SGPA do they need?
  // (totalPoints + (futureCredits * requiredSGPA)) / (totalCredits + futureCredits) = targetCGPA
  const requiredSGPA = useMemo(() => {
    if (futureCredits === 0) return 0;
    const requiredTotalPoints = targetCGPA * (totalCredits + futureCredits);
    const neededPoints = requiredTotalPoints - totalPoints;
    const sgpa = neededPoints / futureCredits;
    return Math.max(0, Math.min(10, sgpa));
  }, [targetCGPA, futureCredits, totalCredits, totalPoints]);

  const isImpossible = requiredSGPA > 10;
  const isGuaranteed = requiredSGPA <= 0;

  // Generate chart data showing trajectory
  const chartData = useMemo(() => {
    const data = [{ term: "Current", cgpa: currentCGPA }];
    if (!isImpossible && !isGuaranteed) {
      data.push({ term: "Next Semester", cgpa: targetCGPA });
    }
    return data;
  }, [currentCGPA, targetCGPA, isImpossible, isGuaranteed]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col pt-8 pb-32">
      
      {/* 1. Human-Centric Header */}
      <section className="mb-16 text-center sm:text-left space-y-3 animate-fade-in slide-in-from-bottom-4 duration-700 ease-os-smooth">
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-slate-100">
          {COPY.FORECASTING.TITLE}
        </h1>
        <p className="text-slate-400 max-w-lg leading-relaxed">
          {COPY.FORECASTING.SUBTITLE}
        </p>
      </section>

      {/* 2. Scenario Sandbox */}
      <section className="mb-12 animate-fade-in duration-700 delay-150 fill-mode-both ease-os-smooth">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col gap-os-section shadow-sm">
          
          {/* Target Slider Area */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <label className="text-sm font-medium text-slate-300">
                {COPY.FORECASTING.TARGET_PROMPT}
              </label>
              <div className="text-4xl font-bold text-indigo-400 font-mono">
                {targetCGPA.toFixed(2)}
              </div>
            </div>

            <div className="relative pt-4 pb-2 min-h-[60px] flex flex-col justify-center">
              <input 
                type="range" 
                min="5.0" 
                max="10.0" 
                step="0.1" 
                value={targetCGPA}
                onChange={(e) => setTargetCGPA(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:h-3 transition-all"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              />
              <div className="flex justify-between text-xs text-slate-500 mt-4 font-medium px-1">
                <span>Current: {currentCGPA.toFixed(2)}</span>
                <span>Max: 10.0</span>
              </div>
            </div>
          </div>

          {/* Emotional & Actionable Feedback */}
          <div className="p-6 rounded-2xl bg-indigo-500/[0.03] border border-indigo-500/10 transition-all duration-300">
            {isImpossible ? (
              <div className="space-y-2 text-center sm:text-left">
                <h3 className="text-lg font-medium text-slate-200">{COPY.FORECASTING.FEEDBACK_IMPOSSIBLE_TITLE}</h3>
                <p className="text-sm text-slate-400">
                  {COPY.FORECASTING.FEEDBACK_IMPOSSIBLE_SUB}
                </p>
              </div>
            ) : isGuaranteed ? (
              <div className="space-y-2 text-center sm:text-left">
                <h3 className="text-lg font-medium text-slate-200">{COPY.FORECASTING.FEEDBACK_ACHIEVED_TITLE}</h3>
                <p className="text-sm text-slate-400">
                  {COPY.FORECASTING.FEEDBACK_ACHIEVED_SUB}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-slate-200 flex flex-col sm:flex-row sm:items-baseline gap-2">
                  You need an SGPA of 
                  <span className="text-3xl font-bold text-emerald-400 font-mono">
                    {requiredSGPA.toFixed(2)}
                  </span>
                  next semester.
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-md">
                  This is completely achievable. It's roughly equivalent to averaging 
                  <strong className="text-slate-300 font-medium ml-1">
                    {requiredSGPA >= 9 ? "A+" : requiredSGPA >= 8 ? "A" : requiredSGPA >= 7 ? "B+" : "B"}
                  </strong> grades across {futureCredits} credits.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Invisible Trajectory Chart */}
      {!isImpossible && !isGuaranteed && (
        <section className="animate-fade-in duration-700 delay-300 fill-mode-both ease-os-smooth">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-1 mb-6">
            {COPY.FORECASTING.TRAJECTORY_LABEL}
          </h3>
          <div className="w-full h-32 opacity-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <YAxis domain={['dataMin - 0.2', 'dataMax + 0.2']} hide />
                <ReferenceLine y={currentCGPA} stroke="#334155" strokeDasharray="3 3" />
                <Line 
                  type="monotone" 
                  dataKey="cgpa" 
                  stroke="#34d399" 
                  strokeWidth={3} 
                  dot={{ r: 6, fill: '#0f172a', strokeWidth: 2, stroke: '#34d399' }}
                  isAnimationActive={true}
                  animationDuration={800}
                  animationEasing="ease-out"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-xs font-medium text-slate-500 mt-4 px-2">
            <span>Now ({currentCGPA.toFixed(2)})</span>
            <span className="text-emerald-500/70">Target ({targetCGPA.toFixed(2)})</span>
          </div>
        </section>
      )}

    </div>
  );
}
