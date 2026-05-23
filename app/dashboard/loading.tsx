import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#000000] text-white p-6 md:p-8 space-y-8 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 bg-white/10" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>

      {/* Stats Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Skeleton variant="stat" className="h-28" />
        <Skeleton variant="stat" className="h-28" />
        <Skeleton variant="stat" className="h-28" />
        <Skeleton variant="stat" className="h-28" />
      </div>

      {/* Main Grid: Charts & Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Big sections */}
        <div className="lg:col-span-2 space-y-8">
          {/* Trend Chart Area */}
          <Skeleton variant="card" className="h-96" />
          {/* History / Active Course List */}
          <Skeleton variant="card" className="h-80" />
        </div>

        {/* Right Column: Insights & Timeline */}
        <div className="space-y-8">
          {/* Insights Panel */}
          <Skeleton variant="card" className="h-[28rem]" />
          {/* Activity Timeline */}
          <Skeleton variant="card" className="h-80" />
        </div>
      </div>
    </div>
  );
}
