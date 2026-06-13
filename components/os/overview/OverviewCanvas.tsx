"use client";

import { useDomainStore } from "@/stores/os/domainStore";
import { useUIStore } from "@/stores/os/uiStore";
import { useEffect, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
import { COPY } from "@/lib/os/constants/copy";
import { useUSMStore } from "@/stores/usmStore";

import { PageHero } from "@/components/ui/PageHero";

// Placeholders for components that might not exist yet but were specified in the plan
function PlacementHealthWidget() {
  return (
    <div className="p-6 rounded-2xl bg-purple-500/[0.03] border border-purple-500/10 flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-purple-300 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
        Placement Readiness
      </h3>
      <p className="text-slate-300 text-sm leading-relaxed max-w-lg">
        Your current CGPA qualifies you for 85% of Tier 1 companies. However, you have a critical skill gap in "System Design".
      </p>
      <div className="mt-2">
        <Link 
          href="/career" 
          className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
        >
          View Company Eligibility →
        </Link>
      </div>
    </div>
  );
}

function SkillGapWidget() {
  return (
    <div className="p-6 rounded-2xl bg-indigo-500/[0.03] border border-indigo-500/10 flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-indigo-300 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
        Skill Roadmap
      </h3>
      <p className="text-slate-300 text-sm leading-relaxed max-w-lg">
        You are currently on the "Backend Developer" track. Next recommended skill: Kubernetes.
      </p>
      <div className="mt-2">
        <Link 
          href="/career" 
          className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Continue Learning →
        </Link>
      </div>
    </div>
  );
}

export default function OverviewCanvas() {
  const { terms, courses } = useDomainStore();
  const { setContextBar, clearContextBar } = useUIStore();
  const store = useUSMStore();
  const mode = store.workspaceUi.mode;

  useEffect(() => {
    // Context bar must never disappear to preserve visual rhythm
    setContextBar(`${mode.charAt(0).toUpperCase() + mode.slice(1)} Overview`, []);
    return () => clearContextBar();
  }, [setContextBar, clearContextBar, mode]);

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
    <div className="w-full max-w-4xl mx-auto flex flex-col pt-24 pb-32 selection:bg-indigo-500/30 px-6">
      
      <PageHero 
        headline={
          <>Complete Visibility.<br/>Your academic command center.</>
        }
        description="Get an instant pulse on your entire academic and career trajectory. Track current progress, monitor critical alerts, and seamlessly launch your active modules from one central intelligence hub."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Left Column: Academic */}
        {(mode === "DEFAULT" || mode === "OPTIMIZATION") && (
          <div className="flex flex-col gap-10 animate-fade-in duration-700 delay-150 fill-mode-both ease-os-smooth">
            <h2 className="text-xl font-semibold text-slate-100 border-b border-slate-800 pb-2">Academic Trajectory</h2>
            
            {hasData && backlogs.length > 0 && (
              <div className="p-6 rounded-2xl bg-rose-500/[0.03] border border-rose-500/10 flex flex-col gap-3">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-rose-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  {COPY.OVERVIEW.ALERT_HEADER}
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  You have {backlogs.length} subject{backlogs.length > 1 ? 's' : ''} from a previous term that require a recovery plan. 
                  We can help you simulate the impact of clearing {backlogs.length > 1 ? 'these' : 'this'} next semester.
                </p>
                <div className="mt-2 flex gap-4">
                  <Link 
                    href="/planner" 
                    className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Launch Optimizer →
                  </Link>
                  <Link 
                    href="/attendance" 
                    className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Track Safety →
                  </Link>
                </div>
              </div>
            )}

            {sparklineData.length > 1 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-1">
                  {COPY.OVERVIEW.MOMENTUM_LABEL}
                </h3>
                <div className="w-full h-32 opacity-60 hover:opacity-100 transition-opacity duration-500 bg-slate-900/50 rounded-2xl p-4 border border-slate-800/50">
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
              </div>
            )}

            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-1">
                {COPY.OVERVIEW.CONTINUE_LABEL}
              </h3>
              
              {hasData ? (
                <div className="flex flex-col gap-4">
                  <Link 
                    href="/planner" 
                    className="group block p-6 rounded-2xl bg-slate-900 border border-slate-800/60 hover:bg-slate-800/50 hover:border-slate-700 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-slate-200 font-medium mb-1">Academic Optimizer</h4>
                        <p className="text-sm text-slate-400">Run simulations and predict risks.</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-indigo-500/20 flex items-center justify-center transition-colors">
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-indigo-400">arrow_forward</span>
                      </div>
                    </div>
                  </Link>
                  <Link 
                    href="/attendance" 
                    className="group block p-6 rounded-2xl bg-slate-900 border border-slate-800/60 hover:bg-slate-800/50 hover:border-slate-700 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-slate-200 font-medium mb-1">Attendance Tracker</h4>
                        <p className="text-sm text-slate-400">Manage safe bunks and assignment risks.</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-indigo-500/20 flex items-center justify-center transition-colors">
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-indigo-400">arrow_forward</span>
                      </div>
                    </div>
                  </Link>
                </div>
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
            </div>
          </div>
        )}

        {/* Right Column: Career */}
        {(mode === "DEFAULT" || mode === "FOCUS") && (
          <div className="flex flex-col gap-10 animate-fade-in duration-700 delay-300 fill-mode-both ease-os-smooth">
            <h2 className="text-xl font-semibold text-slate-100 border-b border-slate-800 pb-2">Career & Placement</h2>
            
            <div className="p-6 rounded-2xl bg-purple-500/[0.03] border border-purple-500/10 flex flex-col gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-purple-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                Placement Readiness
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed max-w-lg">
                Your current CGPA qualifies you for 85% of Tier 1 companies. However, you have a critical skill gap in "System Design".
              </p>
              <div className="mt-2">
                <Link 
                  href="/placement" 
                  className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
                >
                  View Company Eligibility →
                </Link>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-indigo-500/[0.03] border border-indigo-500/10 flex flex-col gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-indigo-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                Skill Roadmap
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed max-w-lg">
                You are currently on the "Backend Developer" track. Next recommended skill: Kubernetes.
              </p>
              <div className="mt-2">
                <Link 
                  href="/career" 
                  className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Continue Learning →
                </Link>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-1">
                Professional Identity
              </h3>
              <Link 
                href="/identity" 
                className="group block p-6 rounded-2xl bg-slate-900 border border-slate-800/60 hover:bg-slate-800/50 hover:border-slate-700 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-slate-200 font-medium mb-1">Optimize Profile</h4>
                    <p className="text-sm text-slate-400">Sync GitHub & LinkedIn to boost credibility score.</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-purple-500/20 flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-purple-400">arrow_forward</span>
                  </div>
                </div>
              </Link>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
