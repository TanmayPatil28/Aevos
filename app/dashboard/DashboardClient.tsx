"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  GraduationCap,
  Trophy,
  Calculator,
  Target,
  TrendingUp,
  AlertTriangle,
  Flag,
  LucideIcon
} from "lucide-react";

// Dashboard Components
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/dashboard/StatCard";
import TrendChartSection from "@/components/dashboard/TrendChartSection";
import HistoryTable from "@/components/dashboard/HistoryTable";
import BreakdownCards from "@/components/dashboard/BreakdownCards";
import QuickActions from "@/components/dashboard/QuickActions";
import SemesterComparison from "@/components/dashboard/SemesterComparison";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";
import InsightsPanel from "@/components/dashboard/InsightsPanel";
import MotivationalBanner from "@/components/dashboard/MotivationalBanner";
import type { Calculation } from "@/types/calculation";

interface Plan {
  id: number | string;
  target_cgpa: number;
  created_at: string;
}

interface Activity {
  id: string | number;
  type: "calculation" | "plan";
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

interface DashboardClientProps {
  userName: string;
  initialCalculations: Calculation[];
  initialPlans: Plan[];
}

function normalizeCalculation(rawCalculation: Calculation): Calculation {
  return {
    ...rawCalculation,
    subjects: Array.isArray(rawCalculation.subjects) ? rawCalculation.subjects : [],
  };
}

export default function DashboardClient({
  userName,
  initialCalculations,
  initialPlans,
}: DashboardClientProps) {
  const [mounted, setMounted] = useState(false);
  const [calculations, setCalculations] = useState<Calculation[]>(
    initialCalculations.map(normalizeCalculation)
  );
  const [plans] = useState<Plan[]>(initialPlans);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/calculations/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      setCalculations((prev) => prev.filter((calc) => calc.id !== id));
      toast.success("Record deleted");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete record");
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to clear all history? This cannot be undone.")) return;

    try {
      const response = await fetch("/api/calculations/clear", {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      setCalculations([]);
      toast.success("All records cleared");
    } catch (error) {
      console.error("Clear all failed:", error);
      toast.error("Failed to clear records");
    }
  };

  const handleExportCSV = async () => {
    window.location.href = "/api/export";
  };

  const handleExportPDF = async () => {
    window.print();
    toast.success("Print dialog opened. Choose Save as PDF to export.");
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
           <Calculator className="animate-spin text-primary" size={48} />
           <p className="text-on-surface-variant font-black uppercase tracking-[0.3em]">Syncing Observatory...</p>
        </div>
      </div>
    );
  }

  // Data Processing
  const currentCgpa = calculations.length > 0 ? calculations[0].cgpa : 8.75;
  const prevCgpa = calculations.length > 1 ? calculations[1].cgpa : 8.55;
  const bestSgpa = calculations.length > 0 ? Math.max(...calculations.map(c => c.sgpa)) : 9.40;
  const totalCalcs = calculations.length || 12;
  const targetCgpa = plans.length > 0 ? plans[0].target_cgpa : 9.0;

  const trendData = calculations.slice().reverse().map(c => ({
    name: c.semester,
    gpa: c.sgpa,
    cgpa: c.cgpa
  }));

  const performanceBreakdown = [
    { name: "S Tier (9+)", value: calculations.filter(c => c.sgpa >= 9).length || 2, color: "#4F8EF7" },
    { name: "A Tier (8-9)", value: calculations.filter(c => c.sgpa >= 8 && c.sgpa < 9).length || 5, color: "#7C3AED" },
    { name: "B Tier (7-8)", value: calculations.filter(c => c.sgpa >= 7 && c.sgpa < 8).length || 3, color: "#A855F7" },
    { name: "Review Session (<7)", value: calculations.filter(c => c.sgpa < 7).length || 1, color: "#FF4D4D" },
  ];

  const totalPerf = performanceBreakdown.reduce((acc, curr) => acc + curr.value, 0);
  const performanceData = performanceBreakdown.map(p => ({
    ...p,
    value: totalPerf > 0 ? Math.round((p.value / totalPerf) * 100) : p.value
  }));

  const allSubjects = calculations.flatMap(c => c.subjects || []);
  const topSubjects = allSubjects
    .sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0))
    .slice(0, 5)
    .map(s => ({ name: s.name, score: Number(s.score) || 0 }));

  const comparisonData = calculations.map((c, i) => {
    const prev = calculations[i + 1];
    return {
      semester: c.semester,
      date: new Date(c.created_at || c.date).toLocaleDateString('en-US', { timeZone: 'UTC' }),
      subjects: c.subjects?.length || 0,
      credits: c.total_credits,
      gpa: c.sgpa,
      cgpa: c.cgpa,
      delta: prev ? c.sgpa - prev.sgpa : 0,
      rank: c.sgpa >= 9.5 ? "1st" : c.sgpa >= 9.2 ? "2nd" : "3rd"
    };
  });

  const activities: Activity[] = [
    ...calculations.map(c => ({
      id: c.id,
      type: "calculation" as const,
      text: `${c.semester} GPA calculated — ${c.sgpa.toFixed(2)}`,
      timestamp: "2 hours ago",
      date: new Date(c.created_at || c.date)
    })),
    ...plans.map(p => ({
      id: `p-${p.id}`,
      type: "plan" as const,
      text: `Semester plan updated — Target ${p.target_cgpa.toFixed(2)}`,
      timestamp: "Yesterday",
      date: new Date(p.created_at)
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  const insights: Insight[] = [
    {
      title: "Trend Analysis",
      text: "Your GPA has been improving consistently over 3 semesters. You are on track to hit 9.0 by Semester 6.",
      icon: TrendingUp,
      color: "#4F8EF7"
    },
    {
      title: "Focus Area",
      text: "Your lowest subject performance is in Mathematics. Improving it by 5 marks can boost your GPA by 0.15.",
      icon: AlertTriangle,
      color: "#A855F7"
    },
    {
      title: "Next Milestone",
      text: `You are ${(targetCgpa - currentCgpa).toFixed(2)} CGPA away from reaching ${targetCgpa.toFixed(2)}. Score above 9.5 this semester to hit your target.`,
      icon: Flag,
      color: "#7C3AED"
    }
  ];

  return (
    <div className="min-h-screen text-foreground selection:bg-primary/20 transition-colors duration-1000">
      <main className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto space-y-16">
        <DashboardHeader
          userName={userName}
          onClearHistory={handleClearAll}
          onExportCSV={handleExportCSV}
          onExportPDF={handleExportPDF}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Current CGPA"
            value={currentCgpa}
            subtext={`${(currentCgpa - prevCgpa) > 0 ? `+${(currentCgpa - prevCgpa).toFixed(2)}` : (currentCgpa - prevCgpa).toFixed(2)} from last session`}
            icon={GraduationCap}
            iconColor="text-[#4F8EF7]"
            glowColor="rgba(79, 142, 247, 0.5)"
            trend={{ value: "+0.20", isUp: true }}
            tooltip="Based on your last saved calculation"
          />
          <StatCard
            label="Best Semester GPA"
            value={bestSgpa}
            subtext="Peak Academic Performance"
            icon={Trophy}
            iconColor="text-[#A855F7]"
            glowColor="rgba(168, 85, 247, 0.5)"
            tooltip="Your highest recorded SGPA"
          />
          <StatCard
            label="Total Frames"
            value={totalCalcs}
            decimals={0}
            subtext="Calculations in History"
            icon={Calculator}
            iconColor="text-[#7C3AED]"
            glowColor="rgba(124, 58, 237, 0.5)"
            tooltip="Total items in your history"
          />
          <StatCard
            label="Target Delta"
            value={targetCgpa}
            suffix={currentCgpa >= targetCgpa ? " OK" : " OFF"}
            subtext={`${(targetCgpa - currentCgpa).toFixed(2)} pts to reach target`}
            icon={Target}
            iconColor="text-white/20"
            glowColor="rgba(255, 255, 255, 0.2)"
            tooltip="Your progress towards the set goal"
          />
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
