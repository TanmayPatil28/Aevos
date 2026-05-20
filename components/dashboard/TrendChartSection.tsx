"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine 
} from "recharts";
import { TrendingUp, BarChart2, LineChart as LineChartIcon } from "lucide-react";
import Card from "@/components/ui/Card";

const MotionCard = motion(Card);

interface TrendData {
  name: string;
  gpa: number;
  cgpa: number;
}

interface TrendChartSectionProps {
  data: TrendData[];
}

interface TooltipPayloadItem {
  value: number;
  dataKey: string;
  name: string;
  payload: TrendData;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

export default function TrendChartSection({ data }: TrendChartSectionProps) {
  const [view, setView] = useState<"bar" | "line">("bar");

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card bg-surface-container-low border border-primary/20 p-4 rounded-2xl shadow-2xl backdrop-blur-3xl">
          <p className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-1">{label}</p>
          <div className="space-y-1">
            <p className="text-sm font-bold text-primary flex items-center justify-between gap-4">
              <span>SGPA:</span> <span>{payload[0].value.toFixed(2)}</span>
            </p>
            {payload[1] && (
              <p className="text-sm font-bold text-secondary flex items-center justify-between gap-4">
                <span>CGPA:</span> <span>{payload[1].value.toFixed(2)}</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const avgCgpa = data.length > 0 ? data.reduce((acc, curr) => acc + curr.cgpa, 0) / data.length : 0;

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="h-[520px] flex flex-col group"
    >

      {/* Dynamic Light Sweep */}
      <div className="absolute inset-x-0 top-0 h-full overflow-hidden pointer-events-none opacity-20 transition-opacity duration-700">
        <motion.div 
           animate={{ x: ["-150%", "250%"] }} 
           transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
           className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -skew-x-[45deg] z-0 blur-3xl" 
        />
      </div>
      <div className="flex items-center justify-between mb-8">
        <div className="relative z-10">
          <h3 className="text-2xl font-black font-headline tracking-tighter text-white flex items-center gap-3">
            <TrendingUp size={24} strokeWidth={3} className="text-[#4F8EF7]" /> CGPA Trend Over Semesters
          </h3>
          <p className="text-[11px] text-white/30 font-black mt-2 uppercase tracking-[0.2em]">Atmospheric Trajectory</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Semester GPA</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary" />
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">CGPA Average</span>
            </div>
          </div>

          <div className="bg-surface-container-low p-1 rounded-xl border border-outline-variant/30 flex items-center gap-1">
            <button
              onClick={() => setView("bar")}
              className={`p-2 rounded-lg transition-all ${view === "bar" ? "bg-primary text-white shadow-lg" : "text-on-surface-variant hover:text-white"}`}
            >
              <BarChart2 size={16} />
            </button>
            <button
              onClick={() => setView("line")}
              className={`p-2 rounded-lg transition-all ${view === "line" ? "bg-primary text-white shadow-lg" : "text-on-surface-variant hover:text-white"}`}
            >
              <LineChartIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {view === "bar" ? (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }}
                dy={10}
              />
              <YAxis 
                domain={[0, 10]} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar 
                dataKey="gpa" 
                radius={[8, 8, 0, 0]} 
                fill="url(#barGradient)"
                animationDuration={1500}
                animationEasing="ease-out"
              />
              <ReferenceLine y={avgCgpa} stroke="#fff" strokeDasharray="5 5" label={{ position: 'right', value: 'AVG', fill: '#fff', fontSize: 10, fontWeight: 'bold' }} strokeOpacity={0.3} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F8EF7" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#A855F7" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F8EF7" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#4F8EF7" stopOpacity={0}/>
                </linearGradient>
              </defs>
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }}
                dy={10}
              />
              <YAxis 
                domain={[0, 10]} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Line 
                type="monotone" 
                dataKey="gpa" 
                stroke="#4F8EF7" 
                strokeWidth={4} 
                dot={{ fill: "#4F8EF7", strokeWidth: 2, r: 5, stroke: "#0A0F1E" }}
                activeDot={{ r: 7, strokeWidth: 0, fill: "#fff" }}
                fillOpacity={1}
                fill="url(#colorGpa)"
              />
              <Line 
                type="monotone" 
                dataKey="cgpa" 
                stroke="#A855F7" 
                strokeWidth={3} 
                strokeDasharray="8 6"
                dot={false}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-6 pt-6 border-t border-outline-variant/10 relative z-10">
        <p className="text-sm italic text-on-surface-variant leading-relaxed">
           Trend Detection: Improved trajectory over the last cycle.
        </p>
      </div>
    </MotionCard>
  );
}
