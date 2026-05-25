"use client";

import { useDomainStore } from "@/stores/os/domainStore";
import { useUIStore } from "@/stores/os/uiStore";
import { useEffect, useMemo } from "react";
import Link from "next/link";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { COPY } from "@/lib/os/constants/copy";

export default function OverviewCanvas() {
  const { terms, courses } = useDomainStore();
  const { setContextBar, clearContextBar } = useUIStore();

  useEffect(() => {
    // Context bar must never disappear to preserve visual rhythm
    setContextBar("Academic Overview", []);
    return () => clearContextBar();
  }, [setContextBar, clearContextBar]);

  // Derived State: The "Vibe Check"
  const totalCredits = courses.reduce((acc, c) => acc + (c.credits || 0), 0);
  const totalPoints = courses.reduce((acc, c) => acc + ((c.credits || 0) * (c.gradePoints || 0)), 0);
  const cgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";

  // Determine emotional tone based on data presence
  const hasData = courses.length > 0;
  
  // Find backlogs (gentle alerts)
  const backlogs = courses.filter(c => c.grade === "F");

  // Generate extremely minimalist sparkline data
  const sparklineData = useMemo(() => {
    if (!hasData) return [];
    
    // Sort terms chronologically for the trendline
    const sortedTerms = [...terms].sort((a, b) => a.order - b.order);
    
    return sortedTerms.map(term => {
      const termCourses = courses.filter(c => c.termId === term.id);
      const tCredits = termCourses.reduce((acc, c) => acc + (c.credits || 0), 0);
      const tPoints = termCourses.reduce((acc, c) => acc + ((c.credits || 0) * (c.gradePoints || 0)), 0);
      const sgpa = tCredits > 0 ? (tPoints / tCredits) : 0;
      
      return {
        name: term.name,
        sgpa: Number(sgpa.toFixed(2))
      };
    }).filter(d => d.sgpa > 0); // Only plot terms with data
  }, [terms, courses, hasData]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col pt-12 pb-32 selection:bg-indigo-500/30">
      
      {/* 1. The Human Header (Am I okay?) */}
      <section className="mb-24 flex flex-col gap-os-component animate-fade-in duration-700 ease-os-smooth">
        <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-slate-100 leading-tight">
          {COPY.OVERVIEW.GREETING}
          <br />
          <span className="text-slate-400">
            {hasData 
              ? `Your CGPA is ${cgpa} ${COPY.OVERVIEW.STATUS_ON_TRACK}` 
              : COPY.OVERVIEW.STATUS_SETUP}
          </span>
        </h1>
      </section>

      {/* 2. The Actionable Inbox (Gentle, Semantic Alerts) - Preserving visual silence if empty */}
      {hasData && backlogs.length > 0 && (
        <section className="mb-24 animate-fade-in duration-700 delay-150 fill-mode-both ease-os-smooth">
          <div className="p-6 rounded-2xl bg-rose-500/[0.03] border border-rose-500/10 flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-rose-300 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              {COPY.OVERVIEW.ALERT_HEADER}
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed max-w-lg">
              You have {backlogs.length} subject{backlogs.length > 1 ? 's' : ''} from a previous term that require a recovery plan. 
              We can help you simulate the impact of clearing {backlogs.length > 1 ? 'these' : 'this'} next semester.
            </p>
            <div className="mt-2">
              <Link 
                href="/forecasting" 
                className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Plan your recovery →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 3. The Sparkline (Invisible elegance, orienting trend) */}
      {sparklineData.length > 1 && (
        <section className="mb-24 flex flex-col gap-os-micro animate-fade-in duration-700 delay-300 fill-mode-both ease-os-smooth">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-1">
            {COPY.OVERVIEW.MOMENTUM_LABEL}
          </h3>
          <div className="w-full h-32 opacity-60 hover:opacity-100 transition-opacity duration-500">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <YAxis domain={['dataMin - 0.5', 10]} hide />
                <Line 
                  type="monotone" 
                  dataKey="sgpa" 
                  stroke="#818cf8" 
                  strokeWidth={2} 
                  dot={{ r: 4, fill: '#1e293b', strokeWidth: 2, stroke: '#818cf8' }}
                  activeDot={{ r: 6, fill: '#818cf8', stroke: '#0f172a', strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* 4. Resume Workflow (Continuity Memory) */}
      <section className="animate-fade-in duration-700 delay-500 fill-mode-both ease-os-smooth">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-1 mb-6">
          {COPY.OVERVIEW.CONTINUE_LABEL}
        </h3>
        
        {hasData ? (
          <Link 
            href="/ledger" 
            className="group block p-6 rounded-2xl bg-slate-900 border border-slate-800/60 hover:bg-slate-800/50 hover:border-slate-700 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-slate-200 font-medium mb-1">Return to Ledger</h4>
                <p className="text-sm text-slate-400">Review your most recent semester grades.</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-indigo-500/20 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-slate-400 group-hover:text-indigo-400">arrow_forward</span>
              </div>
            </div>
          </Link>
        ) : (
          <Link 
            href="/records" 
            className="group block p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-indigo-200 font-medium mb-1">Import your first semester</h4>
                <p className="text-sm text-indigo-300/70">Let's set up your academic timeline automatically.</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-indigo-400">upload_file</span>
              </div>
            </div>
          </Link>
        )}
      </section>

    </div>
  );
}
