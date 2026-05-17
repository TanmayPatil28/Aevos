'use client';

import { useEffect } from 'react';
import { useAcademicStore } from '@/lib/stores/academic-store';
import { motion } from 'framer-motion';
import { ReadinessGauge } from '@/components/placement/ReadinessGauge';
import { CareerPathRecommendations } from '@/components/placement/CareerPathRecommendations';
import {
  Building2,
  ChevronRight,
  Trophy,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowUpRight,
} from 'lucide-react';

export default function PlacementPage() {
  const { placement, syncFromDatabase, isLoading } = useAcademicStore();

  useEffect(() => {
    syncFromDatabase();
  }, [syncFromDatabase]);

  if (isLoading || !placement) {
    return (
      <div className="min-h-screen pt-24 px-6 pb-12 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="mt-4 text-on-surface-variant font-medium">
          Analyzing Placement Trajectory...
        </p>
      </div>
    );
  }

  const { readiness, sectorReadiness, overallScore, status } = placement;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'eligible':
        return 'text-success bg-success/10 border-success/20';
      case 'near-threshold':
        return 'text-warning bg-warning/10 border-warning/20';
      case 'at-risk':
        return 'text-error bg-error/10 border-error/20';
      default:
        return 'text-on-surface-variant bg-white/5 border-white/10';
    }
  };

  const categories = ['dream', 'target', 'safe'];

  return (
    <main className="min-h-screen pt-24 px-6 pb-12 bg-surface max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-[10px]">
            <Trophy className="w-3 h-3" />
            Career Intelligence
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-headline text-on-surface tracking-tight">
            Career Mission Control
          </h1>
          <p className="text-on-surface-variant/70 max-w-xl text-sm leading-relaxed">
            Real-time eligibility tracking and predictive analytics based on your current academic
            standing and target career trajectory.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button className="px-6 py-3 rounded-2xl bg-primary text-on-primary font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center gap-2">
            Placement Prep Guide
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Intelligence Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 h-full">
          <ReadinessGauge />
        </div>
        <div className="lg:col-span-2 h-full">
          <CareerPathRecommendations />
        </div>
      </div>

      {/* Eligibility Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black font-headline text-on-surface flex items-center gap-3">
            <Briefcase className="w-6 h-6 text-primary" />
            Eligibility Pipeline
          </h2>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase">
              Total Companies tracked:
            </span>
            <span className="text-xs font-black text-on-surface">{readiness.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {readiness.map((readinessItem: any, index: number) => (
            <motion.div
              key={readinessItem.company.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-5 rounded-[1.5rem] border border-white/5 hover:border-primary/20 transition-all group hover:bg-white/[0.02]"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-on-surface font-black text-xs">
                    {readinessItem.company.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                      {readinessItem.company.name}
                    </h3>
                    <span className="text-[9px] uppercase font-black text-on-surface-variant/40 tracking-widest">
                      {readinessItem.company.sector}
                    </span>
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter border ${getStatusColor(readinessItem.status)}`}
                >
                  {readinessItem.status.replace('-', ' ')}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-bold text-on-surface-variant/50 uppercase">
                      Criteria
                    </p>
                    <p className="text-xs font-black text-on-surface">
                      {readinessItem.company.minCgpa} CGPA
                    </p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <p className="text-[9px] font-bold text-on-surface-variant/50 uppercase">
                      Avg Package
                    </p>
                    <p className="text-xs font-black text-primary">
                      ₹{readinessItem.company.avgPackage} LPA
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <AlertCircle className="w-3 h-3 text-on-surface-variant/40" />
                    <span className="text-[9px] font-bold text-on-surface-variant/60 uppercase">
                      System Insight
                    </span>
                  </div>
                  <p className="text-[10px] text-on-surface-variant/80 leading-relaxed font-medium">
                    {readinessItem.nextBestAction}
                  </p>
                </div>
              </div>

              {/* Hover indicator */}
              <div className="mt-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[9px] font-bold text-primary uppercase">
                  View Detailed Analytics
                </span>
                <ChevronRight className="w-3 h-3 text-primary" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
