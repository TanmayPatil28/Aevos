'use client';

import { useAcademicStore } from '@/lib/stores/academic-store';
import { motion } from 'framer-motion';
import { Rocket, Target, ShieldCheck, TrendingUp, Sparkles, LayoutGrid } from 'lucide-react';

export function CareerPathRecommendations() {
  const { placement, isLoading } = useAcademicStore();

  if (isLoading || !placement) {
    return (
      <div className="glass-card p-6 rounded-[2rem] h-64 animate-pulse col-span-2 border border-white/5 bg-white/5" />
    );
  }

  const { sectorReadiness, nextTarget } = placement;

  const getSectorIcon = (sector: string) => {
    switch (sector.toLowerCase()) {
      case 'product':
        return <Rocket className="w-4 h-4" />;
      case 'finance':
        return <Target className="w-4 h-4" />;
      case 'consulting':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <LayoutGrid className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'eligible':
        return 'text-success bg-success/10 border-success/20';
      case 'near-threshold':
        return 'text-warning bg-warning/10 border-warning/20';
      case 'at-risk':
        return 'text-error bg-error/10 border-error/20';
      default:
        return 'text-on-surface-variant bg-surface/10 border-white/5';
    }
  };

  return (
    <div className="glass-card p-6 rounded-[2rem] border border-white/10 relative overflow-hidden h-full flex flex-col group lg:col-span-2">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors pointer-events-none" />

      <div className="flex justify-between items-start mb-6 z-10">
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">explore</span>
            Career Pathway Engine
          </h4>
          <p className="text-[10px] text-primary/80 font-medium">
            Sector-specific readiness mapping
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 z-10 flex-1">
        {/* Sector Readiness Grid */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.15em] mb-4">
            Market Sector Analysis
          </p>
          <div className="grid grid-cols-2 gap-3">
            {sectorReadiness.slice(0, 4).map((sector: any, index: number) => (
              <motion.div
                key={sector.sector}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-2xl border transition-all hover:scale-[1.02] ${getStatusColor(sector.status)}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {getSectorIcon(sector.sector)}
                  <span className="text-[10px] font-bold truncate">{sector.sector}</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-lg font-black leading-none">{sector.readinessScore}%</span>
                  <span className="text-[8px] uppercase font-bold opacity-70">
                    {sector.status.replace('-', ' ')}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Actionable Recommendations */}
        <div className="flex flex-col justify-center">
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-5 space-y-4">
            {nextTarget ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-on-surface">Target Milestone</h3>
                    <p className="text-[10px] text-on-surface-variant/60">
                      Immediate academic goal
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-on-surface-variant">
                      Unlock{' '}
                      <span className="text-on-surface font-bold">{nextTarget.companyName}</span>
                    </span>
                    <span className="font-black text-primary">+{nextTarget.cgpaGap} CGPA</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(20, 100 - nextTarget.cgpaGap * 20)}%` }}
                      className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(var(--color-primary),0.5)]"
                    />
                  </div>
                  <p className="text-[10px] leading-relaxed text-on-surface-variant/80 italic">
                    "Pushing your SGPA by 0.2-0.3 in the next semester will statistically unlock
                    this and other companies in the sector."
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success border border-success/20 mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-success uppercase tracking-widest">
                    A-List Eligibility
                  </h3>
                  <p className="text-[10px] text-on-surface-variant/70 mt-1">
                    You currently meet criteria for all tracked dream companies. Focus on skill
                    specialization.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
