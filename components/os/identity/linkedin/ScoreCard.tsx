"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ScoreCardProps {
  title: string;
  score: number;
  maxScore?: number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "blue" | "emerald" | "amber" | "rose" | "indigo";
}

export default function ScoreCard({
  title,
  score,
  maxScore = 100,
  trend = "neutral",
  trendValue,
  color = "blue",
}: ScoreCardProps) {
  const percentage = (score / maxScore) * 100;
  
  const colorStyles = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  };
  
  const progressColors = {
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    indigo: "bg-indigo-500",
  };

  return (
    <div className={`rounded-2xl border ${colorStyles[color]} p-4 flex flex-col justify-between h-full relative overflow-hidden group`}>
      <div className={`absolute top-0 right-0 w-16 h-16 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${colorStyles[color]} border-0`} />
      
      <div className="relative z-10 flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-slate-300">{title}</h4>
        {trend === "up" && <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded"><TrendingUp className="w-3 h-3" /> {trendValue}</div>}
        {trend === "down" && <div className="flex items-center gap-1 text-rose-400 text-xs font-bold bg-rose-500/10 px-2 py-0.5 rounded"><TrendingDown className="w-3 h-3" /> {trendValue}</div>}
        {trend === "neutral" && <div className="flex items-center gap-1 text-slate-400 text-xs font-bold bg-slate-500/10 px-2 py-0.5 rounded"><Minus className="w-3 h-3" /></div>}
      </div>

      <div className="relative z-10">
        <div className="flex items-end gap-1 mb-2">
          <span className="text-3xl font-black text-white">{score}</span>
          <span className="text-sm font-medium text-slate-500 mb-1">/ {maxScore}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${progressColors[color]} transition-all duration-1000 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
