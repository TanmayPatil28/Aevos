"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function MultiSemesterChart({ chartData, whatIfMode }: { chartData: any[], whatIfMode: boolean }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--on-surface-variant)" stopOpacity={0.15} />
            <stop offset="95%" stopColor="var(--on-surface-variant)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorWhatIf" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{ fill: "var(--on-surface-variant)", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} dy={15}
          tickFormatter={(val) => val.replace('Semester ', 'Sem ')}
        />
        <YAxis domain={['auto', 'auto']} stroke="rgba(255,255,255,0.2)" tick={{ fill: "var(--on-surface-variant)", fontSize: 10, fontWeight: 700, fontFamily: "monospace" }} axisLine={false} tickLine={false} dx={-15} />
        <Tooltip
          contentStyle={{ backgroundColor: "#111111", borderRadius: "20px", border: "1px solid var(--outline-variant)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)", backdropFilter: "blur(10px)" }}
          labelStyle={{ color: "var(--on-surface-variant)", fontWeight: "black", marginBottom: "12px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.15em" }}
          itemStyle={{ fontWeight: "900", fontSize: "16px", fontFamily: "monospace" }}
        />
        <Area
          type="monotone"
          dataKey="Actual_CGPA"
          stroke="var(--on-surface-variant)"
          fillOpacity={1}
          fill="url(#colorActual)"
          strokeWidth={whatIfMode ? 2 : 4}
          strokeDasharray={whatIfMode ? "6 6" : "0"}
          activeDot={{ r: 6, fill: "var(--background)", stroke: "var(--on-surface-variant)", strokeWidth: 3 }}
          animationDuration={500}
        />
        {whatIfMode && (
          <Area
            type="monotone"
            dataKey="What_If_CGPA"
            stroke="#6366f1"
            fillOpacity={1}
            fill="url(#colorWhatIf)"
            strokeWidth={5}
            activeDot={{ r: 8, fill: "#6366f1", stroke: "var(--background)", strokeWidth: 3 }}
            style={{ filter: "drop-shadow(0px 8px 16px rgba(99,102,241,0.6))" }}
            animationDuration={800}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
