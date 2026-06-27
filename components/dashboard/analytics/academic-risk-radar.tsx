'use client';

import { useRiskAnalytics } from '@/lib/hooks/use-analytics';
import { GlassCard } from '@/components/GlassCard';

export function AcademicRiskRadar() {
  const { data, error, isLoading } = useRiskAnalytics();

  if (isLoading) {
    return (
      <GlassCard className="animate-pulse p-6 h-48">
        <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-white/10 rounded w-5/6"></div>
          <div className="h-4 bg-white/10 rounded w-4/6"></div>
        </div>
      </GlassCard>
    );
  }

  if (error || !data) {
    return (
      <GlassCard className="p-6 h-48 border-red-500/30">
        <h3 className="text-xl font-semibold text-white/90 mb-2">Academic Risk Radar</h3>
        <p className="text-red-400 text-sm">Failed to load risk analysis.</p>
      </GlassCard>
    );
  }

  const colors = {
    low: 'text-green-400 border-green-400 bg-green-400/10',
    medium: 'text-yellow-400 border-yellow-400 bg-yellow-400/10',
    high: 'text-orange-400 border-orange-400 bg-orange-400/10',
    critical: 'text-red-400 border-red-400 bg-red-400/10'
  };
  
  const riskColor = colors[data.level];

  return (
    <GlassCard className="p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-white/90">Academic Risk Radar</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${riskColor}`}>
          {data.level} Risk
        </span>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-white/60 mb-2 uppercase tracking-wider">Factors</h4>
          <ul className="text-sm text-white/80 space-y-1 list-disc pl-4">
            {data.reasons.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
        
        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
          <h4 className="text-sm font-medium text-emerald-400 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Recovery Action Plan
          </h4>
          <ul className="text-sm text-white/80 space-y-1">
            {data.recoveryTips.map((tip, i) => <li key={i}>→ {tip}</li>)}
          </ul>
        </div>
      </div>
    </GlassCard>
  );
}
