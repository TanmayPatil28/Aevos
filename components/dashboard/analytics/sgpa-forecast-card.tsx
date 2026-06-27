'use client';

import { useForecastAnalytics } from '@/lib/hooks/use-analytics';
import { GlassCard } from '@/components/GlassCard';

export function SgpaForecastCard() {
  const { data, error, isLoading } = useForecastAnalytics();

  if (isLoading) {
    return (
      <GlassCard className="animate-pulse p-6 h-48">
        <div className="h-6 bg-white/10 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-white/10 rounded w-full"></div>
          <div className="h-4 bg-white/10 rounded w-3/4"></div>
        </div>
      </GlassCard>
    );
  }

  if (error || !data) {
    return (
      <GlassCard className="p-6 h-48 border-red-500/30">
        <h3 className="text-xl font-semibold text-white/90 mb-2">SGPA Forecast</h3>
        <p className="text-red-400 text-sm">Unable to load forecast data. Please try again later.</p>
      </GlassCard>
    );
  }

  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    stable: 'text-blue-400',
  };

  return (
    <GlassCard className="p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-white/90">SGPA Forecast</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase bg-white/5 border border-white/10 ${trendColors[data.trend]}`}>
          {data.trend} trend
        </span>
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="text-4xl font-bold text-white">
          {data.predictedSgpa.toFixed(2)}
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-white/60 uppercase tracking-wider">Next Sem Prediction</span>
          <span className="text-sm text-emerald-400">{data.confidence}% Confidence</span>
        </div>
      </div>
      
      <div className="bg-white/5 p-3 rounded-lg flex justify-between items-center">
        <span className="text-sm text-white/70">Volatility pattern:</span>
        <span className="text-sm font-medium text-white/90 capitalize">{data.volatility}</span>
      </div>
    </GlassCard>
  );
}
