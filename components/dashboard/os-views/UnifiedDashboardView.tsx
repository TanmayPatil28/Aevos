"use client";

import React from "react";
import { motion } from "framer-motion";
import { useUSMStore } from "@/stores/usmStore";
import { selectDerivedGPA } from "@/stores/selectors/academic";
import { intelligenceEngine } from "@/lib/career/intelligenceEngine";
import { Activity, Briefcase, GraduationCap, LayoutDashboard, ArrowRight } from "lucide-react";
import Link from "next/link";
import AnimatedCounter from "@/components/AnimatedCounter";
import DocumentVault from "@/components/DocumentVault";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/button";

export default function UnifiedDashboardView() {
  const store = useUSMStore();
  const { cgpa } = selectDerivedGPA(store);
  const setMode = store.setWorkspaceMode;

  // Fetch Readiness Score via Intelligence Engine
  const backlogs = store.semesterHistory.reduce((acc, sem) => acc + (sem.credits - sem.earnedCredits), 0);
  const earnedCredits = store.semesterHistory.reduce((acc, sem) => acc + sem.earnedCredits, 0);
  
  const placementRisk = intelligenceEngine.calculatePlacementRisk({
    cgpa,
    backlogs,
    earnedCredits,
    branch: "Computer Science", // Default fallback if not in store
    skills: store.career?.skills || [],
    targetRole: store.career?.targetRole || "Frontend Developer"
  });
  
  const readinessScore = Math.round(placementRisk.averageEligibility);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Academic Half */}
        <Card variant="default" className="lg:col-span-6 !p-6 border-white/5 flex flex-col justify-between min-h-[280px]">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Activity size={16} className="text-primary" />
              <div className="flex flex-col">
                <h3 className="text-[14px] font-semibold text-foreground tracking-tight leading-tight">Academic Standing</h3>
                <p className="text-[11px] text-foreground-muted uppercase tracking-wider font-semibold">Active CGPA</p>
              </div>
            </div>
            
            <AnimatedCounter target={cgpa} decimals={2} className="text-5xl font-black text-white block tracking-tighter" />
            
            <div className="text-[13px] text-foreground-muted mt-3 max-w-[250px] leading-snug">
              {backlogs > 0 ? `Attention required: ${backlogs} backlogs pending.` : "You are on track. Maintain consistency."}
            </div>
          </div>

          <Button 
            variant="primary"
            onClick={() => setMode("OPTIMIZATION")}
            className="mt-8 w-full flex justify-between items-center"
          >
            <span>Enter Academic OS</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Card>

        {/* Career Half */}
        <Card variant="default" className="lg:col-span-6 !p-6 border-white/5 flex flex-col justify-between min-h-[280px]">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Briefcase size={16} className="text-primary" />
              <div className="flex flex-col">
                <h3 className="text-[14px] font-semibold text-foreground tracking-tight leading-tight">Career Readiness</h3>
                <p className="text-[11px] text-foreground-muted uppercase tracking-wider font-semibold">Placement Score</p>
              </div>
            </div>
            
            <div className="flex items-baseline gap-2">
              <AnimatedCounter target={readinessScore} className="text-5xl font-black text-white block tracking-tighter" />
              <span className="text-xl text-foreground-muted font-bold">/ 100</span>
            </div>
            
            <div className="text-[13px] text-foreground-muted mt-3 max-w-[250px] leading-snug">
              Your academic profile is strong. Focus on DSA and Projects.
            </div>
          </div>

          <Button 
            variant="primary"
            onClick={() => setMode("FOCUS")}
            className="mt-8 w-full flex justify-between items-center"
          >
            <span>Enter Career OS</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-8">
        <Card variant="default" className="lg:col-span-12 !p-6 border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LayoutDashboard size={16} className="text-primary" />
            <div className="flex flex-col">
              <h3 className="text-[14px] font-semibold text-foreground tracking-tight leading-tight">Explore all modules</h3>
              <p className="text-[11px] text-foreground-muted uppercase tracking-wider font-semibold">Use the Dynamic Island toggle below to morph this dashboard to your current goals.</p>
            </div>
          </div>
        </Card>

        {/* Smart Documents / RAG Integration */}
        <div className="lg:col-span-12">
          <DocumentVault />
        </div>
      </div>
    </motion.div>
  );
}


