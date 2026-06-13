"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });
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
      <div className="p-6 rounded-[2rem] bg-[#1c1c1e] border border-white/[0.05] flex flex-col h-full relative group">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-[17px] font-bold text-white flex items-center gap-2 tracking-wide">
              <TrendingUp className="text-[#f43f5e] drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" size={20} /> Dynamic CGPA Ceiling
            </h3>
            <p className="text-[15px] text-[#8E8E93] mt-1 tracking-tight">Mathematical absolute maximum vs Current</p>
          </div>
          <div className="text-right">
            <span className="text-[28px] leading-none font-black text-[#f43f5e] tracking-tight">{currentMax.toFixed(2)}</span>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8E8E93] mt-1">Absolute Max</p>
          </div>
        </div>

        <div className="flex-1 w-full min-h-[200px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCeiling" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
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
                contentStyle={{ backgroundColor: '#1c1c1e', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}
                itemStyle={{ color: 'white', fontWeight: 600, fontSize: '15px' }}
                labelStyle={{ color: '#8E8E93', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}
                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
              />
              <Area type="monotone" dataKey="mathematicalCeiling" stroke="#f43f5e" strokeDasharray="5 5" strokeWidth={2} fillOpacity={1} fill="url(#colorCeiling)" name="Max Ceiling" />
              <Line type="monotone" dataKey="currentTrajectory" stroke="#fb923c" strokeWidth={3} dot={{ r: 4, fill: '#fb923c', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#fb923c', stroke: 'white', strokeWidth: 2 }} name="Trajectory" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div 
          onClick={() => setShowDataModal(true)}
          className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex justify-between items-center cursor-pointer hover:bg-white/[0.04] transition-colors active:scale-[0.98]"
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#8E8E93]">Potential Gap Recovery</p>
            <p className="font-mono text-[#f43f5e] font-bold text-[17px] mt-0.5">+{gap} CGPA Points</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#f43f5e]">
            <TableProperties size={18} />
          </div>
        </div>
      </div>

      <IOSSheetModal 
        isOpen={showDataModal} 
        onClose={() => setShowDataModal(false)} 
        title="Ceiling Data Points"
      >
        <div className="pb-8">
          <div className="bg-[#1c1c1e] border border-white/[0.05] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 p-4 border-b border-white/5 bg-white/[0.02]">
              <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider">Sem</span>
              <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider text-center">Trajectory</span>
              <span className="text-[11px] font-bold text-[#f43f5e] uppercase tracking-wider text-right">Max Ceiling</span>
            </div>
            <div className="divide-y divide-white/5">
              {data.map((point) => (
                <div key={point.semester} className="grid grid-cols-3 p-4 items-center">
                  <span className="text-[13px] font-bold text-white">Sem {point.semester}</span>
                  <span className="text-[13px] font-mono text-[#fb923c] text-center">{point.currentTrajectory.toFixed(2)}</span>
                  <span className="text-[13px] font-mono text-[#f43f5e] font-bold text-right">{point.mathematicalCeiling.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4 p-4 rounded-2xl bg-[#f43f5e]/10 border border-[#f43f5e]/20 flex gap-3 items-start">
            <TrendingUp className="text-[#f43f5e] shrink-0 mt-0.5" size={20} />
            <p className="text-[13px] text-[#f43f5e] leading-relaxed">
              The <strong className="font-bold">Max Ceiling</strong> represents your final CGPA if you score a perfect 'O' (10.0) in every single remaining subject and backlog until graduation.
            </p>
          </div>
        </div>
      </IOSSheetModal>
    </>
  );
}
