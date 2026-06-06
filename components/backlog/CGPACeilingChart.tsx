"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { CGPACeilingData } from "@/lib/backlog-intelligence/engine";
import { TrendingUp, TableProperties, ChevronRight } from "lucide-react";
import IOSSheetModal from "@/components/ui/IOSSheetModal";

export default function CGPACeilingChart({ data }: { data: CGPACeilingData[] }) {
  const [showDataModal, setShowDataModal] = useState(false);

  if (!data || data.length === 0) return null;

  const currentMax = data[data.length - 1].mathematicalCeiling;
  const currentProj = data[data.length - 1].currentTrajectory;
  const gap = (currentMax - currentProj).toFixed(2);

  return (
    <>
      <div className="p-6 rounded-[32px] bg-[#1C1C1E] flex flex-col h-full relative group">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-[17px] font-semibold text-white flex items-center gap-2 tracking-tight">
              <TrendingUp className="text-[#0A84FF]" size={20} /> Dynamic CGPA Ceiling
            </h3>
            <p className="text-[15px] text-[#8E8E93] mt-1 tracking-tight">Mathematical absolute maximum vs Current</p>
          </div>
          <div className="text-right">
            <span className="text-[28px] leading-none font-black text-[#0A84FF] tracking-tight">{currentMax.toFixed(2)}</span>
            <p className="text-[13px] font-semibold uppercase tracking-wider text-[#8E8E93] mt-1">Absolute Max</p>
          </div>
        </div>

        <div className="flex-1 w-full min-h-[200px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCeiling" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0A84FF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0A84FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="semester" 
                stroke="#8E8E93" 
                tick={{fill: '#8E8E93', fontSize: 13, fontWeight: 500}} 
                axisLine={false} 
                tickLine={false} 
              />
              <YAxis 
                domain={['auto', 10]} 
                stroke="#8E8E93" 
                tick={{fill: '#8E8E93', fontSize: 13, fontWeight: 500}} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#2C2C2E', border: 'none', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}
                itemStyle={{ color: 'white', fontWeight: 600, fontSize: '15px' }}
                labelStyle={{ color: '#8E8E93', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}
                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
              />
              <Area type="monotone" dataKey="mathematicalCeiling" stroke="#0A84FF" strokeDasharray="5 5" strokeWidth={2} fillOpacity={1} fill="url(#colorCeiling)" name="Max Ceiling" />
              <Line type="monotone" dataKey="currentTrajectory" stroke="#30D158" strokeWidth={3} dot={{ r: 4, fill: '#30D158', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#30D158' }} name="Trajectory" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div 
          onClick={() => setShowDataModal(true)}
          className="p-4 rounded-2xl bg-[#2C2C2E] flex justify-between items-center cursor-pointer hover:bg-[#3A3A3C] transition-colors active:scale-[0.98]"
        >
          <div>
            <p className="text-[15px] text-[#8E8E93]">Potential Gap Recovery</p>
            <p className="font-mono text-[#0A84FF] font-bold text-[17px] mt-0.5">+{gap} CGPA Points</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#3A3A3C] flex items-center justify-center">
            <TableProperties size={18} className="text-white" />
          </div>
        </div>
      </div>

      <IOSSheetModal 
        isOpen={showDataModal} 
        onClose={() => setShowDataModal(false)} 
        title="Ceiling Data Points"
      >
        <div className="pb-8">
          <div className="bg-[#2C2C2E] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 p-4 border-b border-white/5 bg-[#3A3A3C]">
              <span className="text-[13px] font-bold text-[#8E8E93] uppercase tracking-wider">Sem</span>
              <span className="text-[13px] font-bold text-[#8E8E93] uppercase tracking-wider text-center">Trajectory</span>
              <span className="text-[13px] font-bold text-[#0A84FF] uppercase tracking-wider text-right">Max Ceiling</span>
            </div>
            <div className="divide-y divide-white/5">
              {data.map((point) => (
                <div key={point.semester} className="grid grid-cols-3 p-4 items-center">
                  <span className="text-[15px] font-semibold text-white">Sem {point.semester}</span>
                  <span className="text-[15px] font-mono text-[#30D158] text-center">{point.currentTrajectory.toFixed(2)}</span>
                  <span className="text-[15px] font-mono text-[#0A84FF] font-bold text-right">{point.mathematicalCeiling.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4 p-4 rounded-2xl bg-[#0A84FF]/10 border border-[#0A84FF]/20 flex gap-3 items-start">
            <TrendingUp className="text-[#0A84FF] shrink-0 mt-0.5" size={20} />
            <p className="text-[13px] text-[#0A84FF] leading-relaxed">
              The <strong>Max Ceiling</strong> represents your final CGPA if you score a perfect 'O' (10.0) in every single remaining subject and backlog until graduation.
            </p>
          </div>
        </div>
      </IOSSheetModal>
    </>
  );
}
