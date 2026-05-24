import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto px-4 md:px-8 xl:px-12 w-full max-w-[1400px] space-y-8 min-h-[100dvh] bg-[#000000] selection:bg-indigo-500/30 selection:text-indigo-200 pt-8">
      
      {/* 1. Identity Layer Skeleton */}
      <div className="w-full h-16 rounded-2xl bg-white/[0.03] border border-white/5 animate-pulse" />

      {/* 2. Intelligence Layer Header Skeleton */}
      <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] flex justify-between items-start animate-pulse">
        <div className="space-y-3">
          <div className="w-32 h-3 bg-white/10 rounded" />
          <div className="w-64 h-8 bg-white/20 rounded" />
          <div className="w-96 h-4 bg-white/10 rounded mt-2" />
        </div>
        <div className="hidden md:flex flex-col items-end p-4 rounded-xl border border-white/5 bg-white/[0.01]">
          <div className="w-20 h-3 bg-white/10 rounded mb-2" />
          <div className="w-24 h-10 bg-white/20 rounded" />
        </div>
      </div>

      {/* KPI Grid & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Boxes */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[#000000] border border-slate-800 p-6 rounded-xl animate-pulse">
              <div className="w-24 h-4 bg-white/10 rounded mb-4" />
              <div className="w-20 h-10 bg-white/20 rounded mb-2" />
              <div className="w-32 h-3 bg-white/5 rounded" />
            </div>
            <div className="bg-[#000000] border border-slate-800 p-6 rounded-xl animate-pulse">
              <div className="w-24 h-4 bg-white/10 rounded mb-4" />
              <div className="w-20 h-10 bg-white/20 rounded mb-2" />
              <div className="w-32 h-3 bg-white/5 rounded" />
            </div>
          </div>
          
          {/* Active Course Ledger Skeleton */}
          <div className="bg-[#000000] border border-slate-800 p-6 rounded-xl space-y-4">
            <div className="w-48 h-6 bg-white/20 rounded mb-6 animate-pulse" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/5 animate-pulse">
                <div className="space-y-2">
                  <div className="w-32 h-4 bg-white/20 rounded" />
                  <div className="w-16 h-3 bg-white/10 rounded" />
                </div>
                <div className="space-y-2 text-right flex flex-col items-end">
                  <div className="w-12 h-4 bg-white/20 rounded" />
                  <div className="w-16 h-3 bg-white/10 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-[#000000] border border-slate-800 p-6 rounded-xl h-[500px] flex flex-col items-center justify-center animate-pulse">
            <div className="w-3/4 h-64 bg-white/5 rounded-xl mb-4" />
            <div className="w-1/2 h-4 bg-white/10 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
