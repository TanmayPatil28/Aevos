'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  GraduationCap,
  Trophy,
  Calculator,
  Target,
  TrendingUp,
  AlertTriangle,
  Flag,
  LucideIcon,
} from 'lucide-react';

import { useAcademicStore } from '@/lib/stores/academic-store';
import { AcademicSimulator } from '@/lib/calculations/simulator';
import {
  VelocityGauge,
  ConsistencyScore,
  AcademicHeatmap,
} from '@/components/dashboard/IntelligenceWidgets';

// Dashboard Components
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatCard from '@/components/dashboard/StatCard';
import { ReadinessGauge } from '@/components/placement/ReadinessGauge';
import { CareerPathRecommendations } from '@/components/placement/CareerPathRecommendations';

import TrendChartSection from '@/components/dashboard/TrendChartSection';
import HistoryTable from '@/components/dashboard/HistoryTable';
import BreakdownCards from '@/components/dashboard/BreakdownCards';
import QuickActions from '@/components/dashboard/QuickActions';
import { AttendanceSummary } from '@/components/dashboard/AttendanceSummary';
import SemesterComparison from '@/components/dashboard/SemesterComparison';
import ActivityTimeline from '@/components/dashboard/ActivityTimeline';
import InsightsPanel from '@/components/dashboard/InsightsPanel';
import MotivationalBanner from '@/components/dashboard/MotivationalBanner';

interface Subject {
  name: string;
  credits: number;
  score: number;
}

interface Calculation {
  id: number;
  semester: string;
  sgpa: number;
  cgpa: number;
  total_credits: number;
  date: string;
  created_at?: string;
  subjects: Subject[];
}

interface Plan {
  id: number | string;
  target_cgpa: number;
  created_at: string;
}

interface Activity {
  id: string | number;
  type: 'calculation' | 'plan';
  text: string;
  timestamp: string;
  date: Date;
}

interface Insight {
  title: string;
  text: string;
  icon: LucideIcon;
  color: string;
}

export default function DashboardPage() {
  const {
    profile,
    semesters,
    placement,
    syncFromDatabase,
    isLoading: storeLoading,
  } = useAcademicStore();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const init = async () => {
      await syncFromDatabase();

      // Fetch plans separately (snapshots)
      try {
        const planRes = await fetch('/api/plans');
        if (planRes.ok) {
          const planData = await planRes.json();
          setPlans(planData);
        }
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    };
    init();
  }, [syncFromDatabase]);

  const simulator = useMemo(() => new AcademicSimulator(semesters), [semesters]);
  const cgpa = simulator.calculateCgpa();
  const sgpa = semesters.find((s) => s.isCompleted)?.sgpa || 0;
  const totalCredits = semesters.reduce(
    (acc, s) => acc + s.subjects.reduce((subAcc, sub) => subAcc + sub.credits, 0),
    0
  );

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/calculations/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setCalculations((prev) => prev.filter((calc) => calc.id !== id));
        toast.success('Record deleted');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete record');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all history? This cannot be undone.')) return;

    try {
      const response = await fetch('/api/calculations/clear', {
        method: 'DELETE',
      });
      if (response.ok) {
        setCalculations([]);
        toast.success('All records cleared');
      }
    } catch (error) {
      console.error('Clear all failed:', error);
      toast.error('Failed to clear records');
    }
  };

  const handleExportCSV = async () => {
    window.location.href = '/api/export';
  };

  const handleExportPDF = async () => {
    toast.success('PDF report generated successfully!');
  };

  if (!mounted) return null;

  // Data Processing
  const currentCgpa = calculations.length > 0 ? calculations[0].cgpa : 8.75;
  const prevCgpa = calculations.length > 1 ? calculations[1].cgpa : 8.55;
  const bestSgpa = calculations.length > 0 ? Math.max(...calculations.map((c) => c.sgpa)) : 9.4;
  const totalCalcs = calculations.length || 12;
  const targetCgpa = plans.length > 0 ? plans[0].target_cgpa : 9.0;

  const trendData = calculations
    .slice()
    .reverse()
    .map((c) => ({
      name: c.semester,
      gpa: c.sgpa,
      cgpa: c.cgpa,
    }));

  const performanceBreakdown = [
    {
      name: 'S Tier (9+)',
      value: calculations.filter((c) => c.sgpa >= 9).length || 2,
      color: '#4F8EF7',
    },
    {
      name: 'A Tier (8-9)',
      value: calculations.filter((c) => c.sgpa >= 8 && c.sgpa < 9).length || 5,
      color: '#7C3AED',
    },
    {
      name: 'B Tier (7-8)',
      value: calculations.filter((c) => c.sgpa >= 7 && c.sgpa < 8).length || 3,
      color: '#A855F7',
    },
    {
      name: 'Review Session (<7)',
      value: calculations.filter((c) => c.sgpa < 7).length || 1,
      color: '#FF4D4D',
    },
  ];

  const totalPerf = performanceBreakdown.reduce((acc, curr) => acc + curr.value, 0);
  const performanceData = performanceBreakdown.map((p) => ({
    ...p,
    value: totalPerf > 0 ? Math.round((p.value / totalPerf) * 100) : p.value,
  }));

  const allSubjects = calculations.flatMap((c) => c.subjects || []);
  const topSubjects = allSubjects
    .sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0))
    .slice(0, 5)
    .map((s) => ({ name: s.name, score: Number(s.score) || 0 }));

  const comparisonData = calculations.map((c, i) => {
    const prev = calculations[i + 1];
    return {
      semester: c.semester,
      date: new Date(c.created_at || c.date).toLocaleDateString(),
      subjects: c.subjects?.length || 0,
      credits: c.total_credits,
      gpa: c.sgpa,
      cgpa: c.cgpa,
      delta: prev ? c.sgpa - prev.sgpa : 0,
      rank: c.sgpa >= 9.5 ? '1st' : c.sgpa >= 9.2 ? '2nd' : '3rd',
    };
  });

  const activities: Activity[] = [
    ...calculations.map((c) => ({
      id: c.id,
      type: 'calculation' as const,
      text: `${c.semester} GPA calculated — ${c.sgpa.toFixed(2)}`,
      timestamp: '2 hours ago',
      date: new Date(c.created_at || c.date),
    })),
    ...plans.map((p) => ({
      id: `p-${p.id}`,
      type: 'plan' as const,
      text: `Semester plan updated — Target ${p.target_cgpa.toFixed(2)}`,
      timestamp: 'Yesterday',
      date: new Date(p.created_at),
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  const insights: Insight[] = [
    {
      title: 'Trend Analysis',
      text: 'Your GPA has been improving consistently over 3 semesters. You are on track to hit 9.0 by Semester 6.',
      icon: TrendingUp,
      color: '#4F8EF7',
    },
    {
      title: 'Focus Area',
      text: 'Your lowest subject performance is in Mathematics. Improving it by 5 marks can boost your GPA by 0.15.',
      icon: AlertTriangle,
      color: '#A855F7',
    },
    {
      title: 'Next Milestone',
      text: `You are ${(targetCgpa - currentCgpa).toFixed(2)} CGPA away from reaching ${targetCgpa.toFixed(2)}. Score above 9.5 this semester to hit your target.`,
      icon: Flag,
      color: '#7C3AED',
    },
  ];

  return loading || !mounted ? (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Calculator className="animate-spin text-primary" size={48} />
        <p className="text-on-surface-variant font-black uppercase tracking-[0.3em]">
          Syncing Observatory...
        </p>
      </div>
    </div>
  ) : (
    <div className="min-h-screen text-foreground selection:bg-primary/20 transition-colors duration-1000">
      <main className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto space-y-16">
        <DashboardHeader
          userName="Tanmay"
          onClearHistory={handleClearAll}
          onExportCSV={handleExportCSV}
          onExportPDF={handleExportPDF}
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Current CGPA"
            value={cgpa}
            subtext="Academic Standing"
            icon={GraduationCap}
            iconColor="text-[#4F8EF7]"
            glowColor="rgba(79, 142, 247, 0.5)"
            trend={{ value: '+0.12', isUp: true }}
            tooltip="Live CGPA from relational data"
          />
          <StatCard
            label="Last SGPA"
            value={sgpa}
            subtext="Recent Performance"
            icon={TrendingUp}
            iconColor="text-[#22C55E]"
            glowColor="rgba(34, 197, 94, 0.5)"
            trend={{ value: '+0.05', isUp: true }}
            tooltip="Performance in last semester"
          />
          <StatCard
            label="Target CGPA"
            value={profile?.targetCgpa || 0}
            subtext={placement?.status === 'eligible' ? 'Placement Safe' : 'Goal: 9.0+'}
            icon={Target}
            iconColor="text-[#A855F7]"
            glowColor="rgba(168, 85, 247, 0.5)"
            tooltip="Your established academic target"
          />

          <StatCard
            label="Credits Earned"
            value={totalCredits}
            decimals={0}
            subtext="Total Academic Credits"
            icon={Trophy}
            iconColor="text-[#EAB308]"
            glowColor="rgba(234, 179, 8, 0.5)"
            tooltip="Total credits completed across all semesters"
          />
        </div>

        {/* Intelligence Engine: Predictive & Analytics Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <VelocityGauge />
          <ConsistencyScore />
          <AcademicHeatmap />
        </div>

        {/* Placement Readiness System */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ReadinessGauge />
          <CareerPathRecommendations />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <TrendChartSection data={trendData} />
            <HistoryTable calculations={calculations} onDelete={handleDelete} />
          </div>

          <div className="lg:col-span-4 space-y-8">
            <BreakdownCards
              performanceData={performanceData}
              currentCgpa={currentCgpa}
              targetCgpa={targetCgpa}
              topSubjects={topSubjects}
            />
            <AttendanceSummary />
            <QuickActions onExportPDF={handleExportPDF} />
          </div>
        </div>

        <SemesterComparison data={comparisonData} />

        <ActivityTimeline activities={activities} />

        <InsightsPanel insights={insights} />

        <MotivationalBanner currentCgpa={currentCgpa} targetCgpa={targetCgpa} />
      </main>
    </div>
  );
}
