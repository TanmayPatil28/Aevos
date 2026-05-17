'use client';

import { useAcademicStore } from '@/lib/stores/academic-store';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, TrendingUp, TrendingDown, Minus, ArrowUpRight } from 'lucide-react';

export function ReadinessGauge() {
  const { placement, isLoading } = useAcademicStore();

  if (isLoading || !placement) {
    return (
      <div className="glass-card p-6 rounded-[2rem] h-full flex flex-col items-center justify-center animate-pulse border border-white/5 bg-white/5">
        <div className="w-32 h-32 rounded-full border-4 border-white/10" />
        <div className="mt-4 h-4 w-24 bg-white/10 rounded" />
      </div>
    );
  }

  const { overallScore, status, trajectoryConfidence, nextTarget } = placement;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'eligible':
        return {
          color: 'text-success',
          stroke: 'stroke-success',
          bg: 'bg-success/10',
          label: 'Placement Safe',
        };
      case 'near-threshold':
        return {
          color: 'text-warning',
          stroke: 'stroke-warning',
          bg: 'bg-warning/10',
          label: 'Near Threshold',
        };
      case 'at-risk':
        return { color: 'text-error', stroke: 'stroke-error', bg: 'bg-error/10', label: 'At Risk' };
      default:
        return {
          color: 'text-on-surface-variant',
          stroke: 'stroke-on-surface-variant',
          bg: 'bg-surface/10',
          label: 'Ineligible',
        };
    }
  };

  const getConfidenceIcon = (conf: string) => {
    switch (conf) {
      case 'high':
        return <TrendingUp className="w-3 h-3 text-success" />;
      case 'medium':
        return <Minus className="w-3 h-3 text-warning" />;
      case 'low':
        return <TrendingDown className="w-3 h-3 text-error" />;
      default:
        return null;
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className="glass-card p-6 rounded-[2rem] flex flex-col justify-between h-full border border-white/10 relative overflow-hidden group">
      {/* Decorative Glow */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 ${config.bg} rounded-full -mr-16 -mt-16 blur-2xl transition-colors duration-500`}
      />

      <div className="flex justify-between items-start z-10">
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">insights</span>
            Career Readiness
          </h4>
          <p className="text-[10px] text-primary/80 font-medium">Placement Intelligence Index</p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/[0.03] border border-white/[0.05]">
          <span className="text-[9px] uppercase tracking-tighter font-bold text-on-surface-variant/70">
            Conf:
          </span>
          {getConfidenceIcon(trajectoryConfidence)}
        </div>
      </div>

      <div className="flex flex-col items-center mt-6 z-10">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
            {/* Background Circle */}
            <circle
              className="text-white/[0.03]"
              strokeWidth="2.5"
              stroke="currentColor"
              fill="none"
              cx="18"
              cy="18"
              r="15.9155"
            />
            {/* Progress Arc */}
            <motion.path
              initial={{ strokeDasharray: '0, 100' }}
              animate={{ strokeDasharray: `${overallScore}, 100` }}
              transition={{ duration: 1.5, ease: 'circOut' }}
              className={config.stroke}
              strokeWidth="2.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-black font-headline ${config.color} drop-shadow-sm`}>
              {overallScore}%
            </span>
          </div>
        </div>

        <div className="mt-4 text-center relative group/status">
          <div className={`text-xs font-black uppercase tracking-[0.2em] ${config.color} mb-1`}>
            {config.label}
          </div>
          <div className="text-[10px] text-on-surface-variant/50 font-medium">
            Based on academic trajectory & criteria
          </div>

          <a
            href="/placement"
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 hover:underline"
          >
            Detailed Report
            <ArrowUpRight className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>

      <div className="mt-6 z-10">
        <AnimatePresence mode="wait">
          {nextTarget ? (
            <motion.div
              key="target"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors group/item"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1 rounded-md bg-primary/10">
                  <Info className="w-3 h-3 text-primary" />
                </div>
                <span className="text-[10px] font-bold text-on-surface/80 uppercase tracking-wider">
                  Next Best Action
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-on-surface-variant/90 font-medium">
                Increase CGPA by{' '}
                <span className="text-primary font-bold">+{nextTarget.cgpaGap}</span> to unlock{' '}
                <span className="text-on-surface font-bold">{nextTarget.companyName}</span>{' '}
                eligibility.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="safe"
              className="p-3 rounded-2xl bg-success/5 border border-success/10"
            >
              <p className="text-[11px] text-success/90 font-bold text-center italic">
                "All tracked company thresholds cleared. Stay consistent!"
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Glassy reflection effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent pointer-events-none" />
    </div>
  );
}
