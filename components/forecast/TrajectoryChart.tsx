"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend
} from "recharts";
import { ForecastScenario } from "@/lib/forecasting/types";

interface TrajectoryChartProps {
  scenarios: ForecastScenario[];
  activeScenarioId: string;
  targetCgpa: number;
  currentCgpa: number;
  completedSemesters: number;
}

export default function TrajectoryChart({
  scenarios,
  activeScenarioId,
  targetCgpa,
  currentCgpa,
  completedSemesters
}: TrajectoryChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = useMemo(() => {
    if (scenarios.length === 0) return [];

    // Prepend the current semester as the starting anchor for all curves
    const startPoint = {
      semester: `Sem ${completedSemesters}`,
      semNum: completedSemesters,
      "Maintain Performance": currentCgpa,
      "Steady Improvement": currentCgpa,
      "Decline Risk": currentCgpa,
      "Upper Bound": currentCgpa,
      "Lower Bound": currentCgpa,
    };

    const maintain = scenarios.find(s => s.id === "maintain")?.projections || [];
    const improve = scenarios.find(s => s.id === "improve")?.projections || [];
    const decline = scenarios.find(s => s.id === "decline")?.projections || [];

    const activeScenario = scenarios.find(s => s.id === activeScenarioId);
    const activeProjections = activeScenario?.projections || [];

    const points = [startPoint];

    // Align projection index
    const length = activeProjections.length;
    for (let i = 0; i < length; i++) {
      const sem = activeProjections[i].semester;
      points.push({
        semester: `Sem ${sem}`,
        semNum: sem,
        "Maintain Performance": maintain[i]?.projectedCgpa ?? null,
        "Steady Improvement": improve[i]?.projectedCgpa ?? null,
        "Decline Risk": decline[i]?.projectedCgpa ?? null,
        "Upper Bound": activeProjections[i]?.upper ?? null,
        "Lower Bound": activeProjections[i]?.lower ?? null,
      });
    }

    return points;
  }, [scenarios, activeScenarioId, currentCgpa, completedSemesters]);

  if (!mounted) {
    return (
      <div className="h-80 w-full animate-pulse bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center">
        <span className="text-white/40 text-sm">Initializing visual projector...</span>
      </div>
    );
  }

  // Active scenario style helper
  const colors = {
    maintain: "#4F8EF7", // Blue
    improve: "#10B981",  // Emerald
    decline: "#EF4444",  // Red
    target: "#F59E0B",   // Amber
    bounds: "#818CF8",   // Indigo
  };

  const getOpacity = (id: string) => {
    return activeScenarioId === id ? 1.0 : 0.25;
  };

  const getStrokeWidth = (id: string) => {
    return activeScenarioId === id ? 3 : 1.5;
  };

  // Determine bounds of Y-axis
  const allValues = chartData.flatMap(d => [
    d["Maintain Performance"],
    d["Steady Improvement"],
    d["Decline Risk"],
    d["Upper Bound"],
    d["Lower Bound"],
    targetCgpa
  ]).filter(v => v !== null && v !== undefined) as number[];

  const minY = Math.max(0, Math.floor(Math.min(...allValues) * 0.95 * 2) / 2);
  const maxY = Math.min(10, Math.ceil(Math.max(...allValues) * 1.02 * 2) / 2);

  return (
    <div className="w-full h-[320px] md:h-[380px] p-4 bg-white/[0.02] border border-white/5 rounded-2xl relative">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 16, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
          
          <XAxis
            dataKey="semester"
            stroke="rgba(255,255,255,0.4)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          
          <YAxis
            domain={[minY, maxY]}
            stroke="rgba(255,255,255,0.4)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickCount={6}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(14, 20, 35, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              backdropFilter: "blur(8px)",
            }}
            labelStyle={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 600 }}
            itemStyle={{ color: "#fff", fontSize: "12px" }}
          />

          <Legend
            verticalAlign="top"
            height={40}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}
          />

          {/* Target CGPA Reference Line */}
          <ReferenceLine
            y={targetCgpa}
            stroke={colors.target}
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{
              value: `Target: ${targetCgpa.toFixed(2)}`,
              fill: colors.target,
              fontSize: 10,
              position: "top",
              offset: 5,
              fontWeight: "bold",
            }}
          />

          {/* Projections Lines */}
          <Line
            type="monotone"
            dataKey="Steady Improvement"
            stroke={colors.improve}
            strokeWidth={getStrokeWidth("improve")}
            opacity={getOpacity("improve")}
            dot={{ r: activeScenarioId === "improve" ? 4 : 2, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />

          <Line
            type="monotone"
            dataKey="Maintain Performance"
            stroke={colors.maintain}
            strokeWidth={getStrokeWidth("maintain")}
            opacity={getOpacity("maintain")}
            dot={{ r: activeScenarioId === "maintain" ? 4 : 2, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />

          <Line
            type="monotone"
            dataKey="Decline Risk"
            stroke={colors.decline}
            strokeWidth={getStrokeWidth("decline")}
            opacity={getOpacity("decline")}
            dot={{ r: activeScenarioId === "decline" ? 4 : 2, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />

          {/* Active Scenario Confidence Bounds (Dashed Lines) */}
          <Line
            type="monotone"
            dataKey="Upper Bound"
            stroke={colors.bounds}
            strokeWidth={1.5}
            strokeDasharray="3 3"
            dot={false}
            activeDot={false}
            name="Volatility Upper Limit"
          />

          <Line
            type="monotone"
            dataKey="Lower Bound"
            stroke={colors.bounds}
            strokeWidth={1.5}
            strokeDasharray="3 3"
            dot={false}
            activeDot={false}
            name="Volatility Lower Limit"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
