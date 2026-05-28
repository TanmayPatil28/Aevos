"use client";

import React, { useRef, useState } from 'react';

export function DraggableNumberInput({ 
  value, 
  onChange, 
  min = 0, 
  max = 10, 
  step = 0.1, 
  label, 
  decimals = 1,
  colorClass = "text-white",
  error
}: { 
  value: number; 
  onChange: (val: number) => void; 
  min?: number; 
  max?: number; 
  step?: number; 
  label: string; 
  decimals?: number;
  colorClass?: string;
  error?: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startVal = useRef(value);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    startX.current = e.clientX;
    startVal.current = value;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const diffX = e.clientX - startX.current;
    
    // Sensitivity: 150px drag = 100% of the range (max - min)
    const sensitivity = 150;
    const delta = (diffX / sensitivity) * (max - min); 
    let newVal = startVal.current + delta;
    
    // Snap to step
    newVal = Math.round(newVal / step) * step;
    
    // Clamp
    if (newVal < min) newVal = min;
    if (newVal > max) newVal = max;
    
    onChange(Number(newVal.toFixed(decimals)));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
  };

  return (
    <div className={`flex flex-col relative group cursor-ew-resize touch-none select-none p-5 bg-white/[0.02] border ${error ? 'border-red-500/50 bg-red-500/[0.02]' : 'border-white/[0.05]'} rounded-[1.5rem] shadow-inner transition-all hover:bg-white/[0.04]`}
         onPointerDown={handlePointerDown}
         onPointerMove={handlePointerMove}
         onPointerUp={handlePointerUp}
         onPointerCancel={handlePointerUp}>
      <span className={`font-bold tracking-[0.2em] text-[10px] uppercase mb-2 transition-colors flex items-center justify-between ${error ? 'text-red-400' : 'text-white/40 group-hover:text-white/70'}`}>
        {label}
        {error ? (
          <span className="text-red-400 normal-case tracking-normal">{error}</span>
        ) : (
          <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100 transition-opacity">swipe</span>
        )}
      </span>
      <div className={`text-4xl md:text-5xl font-black ${colorClass} tracking-tighter ${isDragging ? 'scale-105 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'scale-100'} transition-transform duration-100 origin-left`}>
        {value.toFixed(decimals)}
      </div>
      
      {/* Visual Track */}
      <div className="absolute bottom-0 left-0 w-full h-1.5 opacity-40 group-hover:opacity-100 transition-opacity rounded-b-[1.5rem] overflow-hidden">
        <div className="absolute top-0 left-0 h-full bg-white/30 pointer-events-none transition-all duration-75 ease-linear" style={{ width: `${((value - min) / (max - min)) * 100}%` }} />
      </div>
    </div>
  );
}
