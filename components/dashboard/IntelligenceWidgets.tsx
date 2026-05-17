'use client';

import { motion } from 'framer-motion';
import {
  useForecast,
  useRisk,
  useTrajectory,
  useGraduationProgress,
} from '@/lib/hooks/use-analytics';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  Compass,
  Award,
  HelpCircle,
} from 'lucide-react';
import { useState } from 'react';

// ─── Explainability Tooltip Component ───────────────────────────────────────
function ExplainabilityTooltip({ content }: { content?: readonly string[] }) {
  const [visible, setVisible] = useState(false);
  if (!content || content.length === 0) return null;

  return (
    <div className="relative inline-block ml-1">
      <button
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onClick={() => setVisible(!visible)}
        className="text-white/40 hover:text-white/80 transition-colors p-0.5"
      >
        <HelpCircle size={14} />
      </button>
      {visible && (
        <div className="absolute right-0 bottom-6 z-50 w-64 p-3 bg-neutral-900/95 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl text-[10px] text-white/80 leading-relaxed space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <p className="font-bold text-primary flex items-center gap-1">
            <Sparkles size={10} /> Copilot Explainability
          </p>
          <ul className="list-disc pl-3 space-y-1">
            {content.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────
function CardSkeleton({ title }: { title: string }) {
  return (
    <div className="glass-card p-6 rounded-[2rem] border border-white/10 min-h-[180px] flex flex-col justify-between animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-24 bg-white/10 rounded" />
        <div className="h-2 w-36 bg-white/5 rounded" />
      </div>
      <div className="space-y-2 my-4">
        <div className="h-8 w-16 bg-white/15 rounded" />
        <div className="h-3 w-full bg-white/5 rounded" />
      </div>
      <div className="h-2 w-full bg-white/10 rounded-full" />
    </div>
  );
}

// ─── 1. SGPA Forecast Card ───────────────────────────────────────────────────
export function VelocityGauge() {
  const { forecast, explainability, isLoading, error } = useForecast();

  if (isLoading) return <CardSkeleton title="SGPA Forecast" />;
  if (error || !forecast) {
    // Graceful degradation fallback
    return (
      <div className="glass-card p-6 rounded-[2rem] border border-white/10 min-h-[180px] flex flex-col justify-between">
        <h4 className="text-xs font-bold text-white/60 uppercase tracking-widest">SGPA Forecast</h4>
        <p className="text-xs text-white/40 italic">
          Forecast offline. Please calculate some semesters first.
        </p>
      </div>
    );
  }

  const confidencePercentage = Math.round(forecast.confidence * 100);
  const isPositive = forecast.predictedSgpa >= 8.0;

  return (
    <div className="glass-card p-6 rounded-[2rem] flex flex-col justify-between h-full border border-white/10 shadow-lg relative overflow-hidden group hover:border-white/20 transition-all duration-300">
      {/* Light glow overlay */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />

      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-bold text-white/60 uppercase tracking-widest">
              SGPA Forecast
            </h4>
            <span className="bg-primary/10 text-primary text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles size={8} /> AI
            </span>
          </div>
          <p className="text-[10px] text-white/45 font-medium flex items-center gap-1">
            Predicted upcoming performance
            <ExplainabilityTooltip content={explainability?.factors} />
          </p>
        </div>
      </div>

      <div className="flex items-end justify-between mt-4">
        <div className="space-y-0.5">
          <div className="text-xs text-white/40 font-bold uppercase tracking-widest">
            Expected SGPA
          </div>
          <div className="text-4xl font-black font-headline text-white flex items-baseline gap-1">
            <motion.span initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              {forecast.predictedSgpa.toFixed(2)}
            </motion.span>
          </div>
        </div>

        <div className="text-right space-y-1">
          <div className="text-[10px] text-white/40 font-black uppercase tracking-wider">
            Confidence
          </div>
          <div className="text-sm font-bold text-primary flex items-center justify-end gap-1">
            <Compass size={12} className="animate-spin-slow" />
            {confidencePercentage}%
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidencePercentage}%` }}
            className="h-full rounded-full bg-primary shadow-[0_0_10px_rgba(79,142,247,0.4)]"
          />
        </div>
        <p className="text-[10px] text-primary/80 font-medium leading-relaxed italic">
          {forecast.recommendations[0] ||
            'Maintain standard class attendance to ensure trajectory holds.'}
        </p>
      </div>
    </div>
  );
}

// ─── 2. Academic Risk Radar ─────────────────────────────────────────────────
export function ConsistencyScore() {
  const { risk, explainability, isLoading, error } = useRisk();

  if (isLoading) return <CardSkeleton title="Academic Risk Tracker" />;
  if (error || !risk) {
    return (
      <div className="glass-card p-6 rounded-[2rem] border border-white/10 min-h-[180px] flex flex-col justify-between">
        <h4 className="text-xs font-bold text-white/60 uppercase tracking-widest">Risk Guard</h4>
        <p className="text-xs text-white/40 italic">
          Tracker inactive. Syncing relational records...
        </p>
      </div>
    );
  }

  const levelColors: Record<'low' | 'medium' | 'high' | 'critical', string> = {
    low: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    high: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    critical: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
  };

  const levelBadges: Record<'low' | 'medium' | 'high' | 'critical', string> = {
    low: 'Low Risk',
    medium: 'Moderate Risk',
    high: 'High Risk',
    critical: 'At Risk',
  };

  return (
    <div className="glass-card p-6 rounded-[2rem] flex flex-col justify-between h-full border border-white/10 hover:border-white/20 transition-all duration-300">
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold text-white/60 uppercase tracking-widest">
            Academic Risk Radar
          </h4>
          <span
            className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${levelColors[risk.level]}`}
          >
            {levelBadges[risk.level]}
          </span>
        </div>
        <p className="text-[10px] text-white/45 font-medium">
          Progression and catalog warning classification
          <ExplainabilityTooltip content={explainability?.factors} />
        </p>
      </div>

      <div className="flex items-center gap-4 mt-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="16"
              className="text-white/[0.03]"
              strokeWidth="4"
              stroke="currentColor"
              fill="none"
            />
            <motion.circle
              cx="18"
              cy="18"
              r="16"
              className={
                risk.level === 'low'
                  ? 'text-emerald-500'
                  : risk.level === 'medium'
                    ? 'text-amber-500'
                    : 'text-rose-500'
              }
              strokeWidth="4"
              strokeDasharray="100, 100"
              initial={{ strokeDashoffset: 100 }}
              animate={{ strokeDashoffset: 100 - risk.score }}
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base font-black text-white">{Math.round(risk.score)}</span>
            <span className="text-[6px] text-white/40 uppercase font-bold">Severity</span>
          </div>
        </div>

        <div className="flex-1 space-y-1.5">
          <div className="text-xs font-bold text-white flex items-center gap-1">
            {risk.level === 'low' ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck size={14} /> Trajectory Clear
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-400">
                <AlertTriangle size={14} /> Attention Needed
              </span>
            )}
          </div>
          <p className="text-[9px] text-white/50 leading-relaxed line-clamp-2">
            {explainability?.recommendations?.[0] ||
              'No actions required. Keep attending lectures and labs.'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── 3. Graduation Progress Engine ──────────────────────────────────────────
export function AcademicHeatmap() {
  const { graduation, explainability, isLoading, error } = useGraduationProgress();

  if (isLoading) return <CardSkeleton title="NEP Progress" />;
  if (error || !graduation) {
    return (
      <div className="glass-card p-6 rounded-[2rem] border border-white/10 min-h-[180px] flex flex-col justify-between">
        <h4 className="text-xs font-bold text-white/60 uppercase tracking-widest">
          Graduation Audit
        </h4>
        <p className="text-xs text-white/40 italic">
          Audit inactive. Add academic records to verify exits.
        </p>
      </div>
    );
  }

  const creditTarget = 160;
  const progressPercent = Math.min(
    100,
    Math.round((graduation.earnedCredits / creditTarget) * 100)
  );

  return (
    <div className="glass-card p-6 rounded-[2rem] border border-white/10 flex flex-col justify-between h-full hover:border-white/20 transition-all duration-300">
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold text-white/60 uppercase tracking-widest">
            Graduation Audit
          </h4>
          <span className="bg-purple-500/10 text-purple-400 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-purple-500/20 flex items-center gap-1">
            <Award size={8} /> NEP 2020
          </span>
        </div>
        <p className="text-[10px] text-white/45 font-medium">
          Modular exit point tracking and credits
          <ExplainabilityTooltip content={explainability?.factors} />
        </p>
      </div>

      <div className="my-3 space-y-1">
        <div className="flex justify-between items-baseline text-xs text-white/80">
          <span className="font-bold">Highest Exit Earned:</span>
          <span className="text-primary font-black uppercase text-[10px] tracking-tight">
            {graduation.highestEligibleTitle}
          </span>
        </div>
        <div className="flex justify-between text-[10px] text-white/40">
          <span>Credits Completed</span>
          <span className="font-bold text-white">
            {graduation.earnedCredits} / {creditTarget}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            className="h-full rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]"
          />
        </div>
        <div className="flex justify-between text-[8px] text-white/40 font-bold uppercase tracking-wider">
          <span>Certificate (40)</span>
          <span>Diploma (80)</span>
          <span>Degree (120)</span>
          <span>Honors (160)</span>
        </div>
      </div>
    </div>
  );
}
