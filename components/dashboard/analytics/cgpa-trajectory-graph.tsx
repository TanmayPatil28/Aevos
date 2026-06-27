'use client';

import { useTrajectoryAnalytics } from '@/lib/hooks/use-analytics';
import { GlassCard } from '@/components/GlassCard';

export function CgpaTrajectoryGraph() {
  const { data, error, isLoading } = useTrajectoryAnalytics();

  if (isLoading) {
    return (
      <GlassCard className="animate-pulse p-6 h-64">
        <div className="h-6 bg-white/10 rounded w-1/3 mb-6"></div>
        <div className="h-32 bg-white/5 rounded w-full flex items-end justify-between p-4">
          {[...Array(6)].map((_, i) => (
             <div key={i} className="w-8 bg-white/10 rounded-t" style={{ height: `${40 + Math.random() * 60}%` }}></div>
          ))}
        </div>
      </GlassCard>
    );
  }

  if (error || !data) {
    return (
      <GlassCard className="p-6 h-64 border-red-500/30">
        <h3 className="text-xl font-semibold text-white/90 mb-2">CGPA Trajectory</h3>
        <p className="text-red-400 text-sm">Failed to load trajectory data.</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-xl font-semibold text-white/90">CGPA Trajectory</h3>
        {data.targetProjection && (
          <div className="text-right">
            <span className="block text-xs uppercase tracking-wider text-white/60">Target</span>
            <span className="text-lg font-bold text-blue-400">{data.targetProjection.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="relative h-32 w-full mt-4 flex items-end justify-between px-2">
        {/* Simple placeholder bar visualization for trajectory */}
        {data.historicalHistory.map((point) => (
          <div key={`hist-${point.semester}`} className="flex flex-col items-center gap-2 group">
            <div 
              className="w-10 bg-white/20 hover:bg-white/40 transition-colors rounded-t relative"
              style={{ height: `${(point.sgpa / 10) * 100}%` }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                {point.sgpa.toFixed(2)}
              </div>
            </div>
            <span className="text-xs text-white/50">Sem {point.semester}</span>
          </div>
        ))}
        
        {data.predictedFuture.map((point) => (
          <div key={`pred-${point.semester}`} className="flex flex-col items-center gap-2 group">
            <div 
              className="w-10 bg-blue-500/30 border border-blue-500/50 hover:bg-blue-500/50 transition-colors rounded-t relative pattern-diagonal-lines-sm text-blue-500/10"
              style={{ height: `${(point.sgpa / 10) * 100}%` }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity">
                {point.sgpa.toFixed(2)}
              </div>
            </div>
            <span className="text-xs text-blue-300/50">Sem {point.semester}</span>
          </div>
        ))}
      </div>
      
      <div className="flex gap-4 mt-6 pt-4 border-t border-white/10 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-white/20"></div>
          <span className="text-xs text-white/60">Historical</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500/30 border border-blue-500/50"></div>
          <span className="text-xs text-white/60">Predicted</span>
        </div>
      </div>
    </GlassCard>
  );
}
