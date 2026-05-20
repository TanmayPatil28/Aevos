"use client";

import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  RadialBarChart, RadialBar
} from "recharts";
import { Award } from "lucide-react";

interface Subject {
  name: string;
  score: number;
}

interface BreakdownCardsProps {
  performanceData: { name: string; value: number; color: string }[];
  currentCgpa: number;
  targetCgpa: number;
  topSubjects: Subject[];
}

export default function BreakdownCards({
  performanceData,
  currentCgpa,
  targetCgpa,
  topSubjects
}: BreakdownCardsProps) {

  const radialData = [
    { name: 'Target', value: targetCgpa, fill: '#4F8EF7' },
    { name: 'Current', value: currentCgpa, fill: '#A855F7' },
  ];

  const getSubjectColor = (score: number) => {
    if (score >= 9) return "bg-[#4F8EF7] shadow-[0_0_15px_rgba(79,142,247,0.5)]";
    if (score >= 8) return "bg-[#7C3AED] shadow-[0_0_15px_rgba(124,58,237,0.5)]";
    if (score >= 7) return "bg-[#A855F7] shadow-[0_0_15px_rgba(168,85,247,0.5)]";
    return "bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]";
  };

  return (
    <div className="space-y-8">
      {/* Performance Donut */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="premium-card flex flex-col items-center group"
      >
        <h3 className="text-xl font-black font-headline tracking-tighter text-white self-start mb-8 relative z-10">Performance Breakdown</h3>

        <div className="relative w-64 h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={performanceData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {performanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="glass-card p-3 border border-outline-variant/20 bg-surface-container-low shadow-2xl">
                        <p className="text-sm font-bold text-white">{payload[0].name}: {payload[0].value}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
            <span className="text-4xl font-black font-headline text-white tracking-tighter">85%</span>
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Efficiency</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full mt-6">
          {performanceData.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">{item.name}</span>
              <span className="text-xs font-black text-white ml-auto">{item.value}%</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CGPA Gauge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="premium-card flex flex-col items-center group"
      >
        <h3 className="text-xl font-black font-headline tracking-tighter text-white self-start mb-8 relative z-10">CGPA Progress Gauge</h3>

        <div className="relative w-64 h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="50%"
              outerRadius="90%"
              barSize={12}
              data={radialData}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar
                background
                label={{ position: 'insideStart', fill: '#fff', fontSize: 10, fontWeight: 'bold' }}
                dataKey="value"
                cornerRadius={10}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-2 flex flex-col items-center">
            <span className="text-4xl font-black font-headline text-white tracking-tighter">{currentCgpa.toFixed(2)}</span>
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Current CGPA</span>
          </div>
        </div>

        <div className="w-full flex items-center justify-between text-[11px] font-black text-on-surface-variant/50 uppercase tracking-[0.2em] mt-2">
          <span>0.0</span>
          <span className="text-primary">Target: {targetCgpa.toFixed(2)}</span>
          <span>10.0</span>
        </div>
      </motion.div>

      {/* Top Subjects */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="premium-card group"
      >
        <h3 className="text-xl font-black font-headline tracking-tighter text-white mb-8 flex items-center gap-3 relative z-10">
          <Award size={24} strokeWidth={3} className="text-[#4F8EF7]" /> Top Performance
        </h3>

        <div className="space-y-6">
          {topSubjects.length > 0 ? topSubjects.slice(0, 5).map((subject, i) => (
            <div key={i} className="space-y-2 group">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">{subject.name}</span>
                <span className="text-sm font-black text-gradient bg-gradient-to-r from-primary to-secondary">{subject.score.toFixed(1)}</span>
              </div>
              <div className="h-1.5 w-full bg-surface-container-low rounded-full overflow-hidden border border-outline-variant/10">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(subject.score / 10) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: i * 0.1, ease: "easeOut" }}
                  className={`h-full rounded-full relative ${getSubjectColor(subject.score)}`}
                >
                  <div className="absolute top-0 right-0 h-full w-4 bg-white/30 blur-sm animate-pulse" />
                </motion.div>
              </div>
            </div>
          )) : (
            <p className="text-sm text-on-surface-variant text-center py-4">Add more calculations to see full analysis</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
