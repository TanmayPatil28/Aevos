"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUSMStore } from "@/stores/usmStore";
import dynamic from "next/dynamic";
const Radar = dynamic(() => import('recharts').then(mod => mod.Radar), { ssr: false });
const RadarChart = dynamic(() => import('recharts').then(mod => mod.RadarChart), { ssr: false });
const PolarGrid = dynamic(() => import('recharts').then(mod => mod.PolarGrid), { ssr: false });
const PolarAngleAxis = dynamic(() => import('recharts').then(mod => mod.PolarAngleAxis), { ssr: false });
const PolarRadiusAxis = dynamic(() => import('recharts').then(mod => mod.PolarRadiusAxis), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
import { Crosshair, Target, Zap, BookOpen, CheckCircle, Code, Shield } from "lucide-react";
import { cn } from "@/lib/cn";
import Card from "@/components/ui/Card";
import { FloatingPill } from "@/components/ui/floating-pill";

interface AIMission {
  id: string;
  title: string;
  description: string;
  icon: any;
  impact: {
    cgpa?: number;
    skills?: number;
    backlogs?: number;
    attendance?: number;
    projects?: number;
  };
}

const AI_MISSIONS: AIMission[] = [
  {
    id: "mission-1",
    title: "Clear 1 Backlog",
    description: "Focus purely on clearing the hardest pending subject.",
    icon: Shield,
    impact: { backlogs: -1, cgpa: +0.2, attendance: +5 }
  },
  {
    id: "mission-2",
    title: "Learn React/Next.js",
    description: "Build a full-stack project to boost frontend skills.",
    icon: Code,
    impact: { skills: +2, projects: +1 }
  },
  {
    id: "mission-3",
    title: "75% Attendance Streak",
    description: "Attend all classes for the next 2 weeks.",
    icon: CheckCircle,
    impact: { attendance: +10, cgpa: +0.1 }
  },
  {
    id: "mission-4",
    title: "Hackathon Win",
    description: "Participate and win a regional hackathon.",
    icon: Zap,
    impact: { projects: +2, skills: +1 }
  }
];

export default function PredictiveForecastModule() {
  const academic = useUSMStore((state) => state.academic);
  const courses = useUSMStore((state) => state.courses) || [];
  const career = useUSMStore((state) => state.career);
  const interventions = useUSMStore((state) => state.interventions) || [];

  // Calculate actual base metrics
  const baseCgpa = academic.currentCgpa || 6.5;
  const baseBacklogs = academic.activeBacklogsCount || 0;
  const baseSkills = (career.skills || []).length;
  
  // Base Attendance %
  const totalClasses = courses.reduce((sum, c) => sum + (c.attendanceTotal || 0), 0);
  const attendedClasses = courses.reduce((sum, c) => sum + ((c.attendanceTotal || 0) - (c.attendanceBunked || 0)), 0);
  const baseAttendance = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 75;

  // Base Projects
  const baseProjects = career.projects.length;

  // Local Projection State
  const [targetSgpa, setTargetSgpa] = useState<number>(8.0);
  const [targetAttendance, setTargetAttendance] = useState<number>(80);
  const [activeMissionId, setActiveMissionId] = useState<string | number>("none");

  const activeMissionsList = useMemo(() => {
    if (!interventions || interventions.length === 0) return AI_MISSIONS;
    return interventions.map((inv, idx) => {
      let icon = BookOpen;
      if ((inv as any).category === "ATTENDANCE") icon = CheckCircle;
      else if ((inv as any).category === "BACKLOG") icon = Shield;
      else if ((inv as any).category === "CAREER") icon = Code;
      else if ((inv as any).category === "ACADEMIC") icon = Zap;
      
      let impact: any = {};
      if ((inv as any).category === "ATTENDANCE") impact = { attendance: +10, cgpa: +0.1 };
      else if ((inv as any).category === "BACKLOG") impact = { backlogs: -1, cgpa: +0.2 };
      else if ((inv as any).category === "CAREER") impact = { projects: +1, skills: +2 };
      else impact = { cgpa: +0.1, skills: +1 };

      return {
        id: inv.id || `mission-${idx}`,
        title: inv.title,
        description: inv.description,
        icon,
        impact
      };
    });
  }, [interventions]);

  // Derive Projected Metrics
  const projectedMetrics = useMemo(() => {
    let pCgpa = baseCgpa;
    let pBacklogs = baseBacklogs;
    let pSkills = baseSkills;
    let pAttendance = baseAttendance;
    let pProjects = baseProjects;

    // Apply manual sliders (Target SGPA influences CGPA slightly, Target Attendance directly changes attendance)
    // Formula for target SGPA's impact on CGPA (approximate)
    const totalSemesters = Math.max(1, academic.completedSemesters || 1);
    const projectedCgpa = ((baseCgpa * totalSemesters) + targetSgpa) / (totalSemesters + 1);
    pCgpa = projectedCgpa;
    
    // Apply slider attendance difference
    if (targetAttendance > baseAttendance) {
      pAttendance = targetAttendance;
    }

    // Apply AI Missions
    if (activeMissionId !== "none") {
      const m = activeMissionsList.find((x) => x.id === activeMissionId);
      if (m) {
        if (m.impact.cgpa) pCgpa += m.impact.cgpa;
        if (m.impact.backlogs) pBacklogs += m.impact.backlogs;
        if (m.impact.skills) pSkills += m.impact.skills;
        if (m.impact.attendance) pAttendance += m.impact.attendance;
        if (m.impact.projects) pProjects += m.impact.projects;
      }
    }

    // Bound values
    return {
      cgpa: Math.min(10, Math.max(0, pCgpa)),
      backlogs: Math.max(0, pBacklogs),
      skills: Math.max(0, pSkills),
      attendance: Math.min(100, Math.max(0, pAttendance)),
      projects: Math.max(0, pProjects),
    };
  }, [baseCgpa, baseBacklogs, baseSkills, baseAttendance, baseProjects, targetSgpa, targetAttendance, activeMissionId, academic.completedSemesters]);

  const toggleMission = (id: string | number) => {
    setActiveMissionId(id);
  };

  // Radar Data Transform
  const data = [
    {
      subject: "CGPA",
      current: (baseCgpa / 10) * 100,
      projected: (projectedMetrics.cgpa / 10) * 100,
      fullMark: 100,
    },
    {
      subject: "Skills",
      current: Math.min(100, baseSkills * 20), // 5 skills = 100%
      projected: Math.min(100, projectedMetrics.skills * 20),
      fullMark: 100,
    },
    {
      subject: "Attendance",
      current: baseAttendance,
      projected: projectedMetrics.attendance,
      fullMark: 100,
    },
    {
      subject: "Projects",
      current: Math.min(100, baseProjects * 25), // 4 projects = 100%
      projected: Math.min(100, projectedMetrics.projects * 25),
      fullMark: 100,
    },
    {
      subject: "Clearance", // Inverted Backlogs: 0 backlogs = 100%, 1 backlog = 75%, 2+ = 50%, etc.
      current: Math.max(0, 100 - baseBacklogs * 25),
      projected: Math.max(0, 100 - projectedMetrics.backlogs * 25),
      fullMark: 100,
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-[24px] p-4 lg:p-8">
      
      {/* Left Column: Visual Radar */}
      <div className="col-span-1 lg:col-span-8 flex flex-col gap-[24px]">
        <Card variant="default" padding="xl" className="flex flex-col gap-6">
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Target className="text-cyan-400" size={24} /> 
                Academic & Career Health
              </h2>
              <p className="text-sm text-white/50 mt-1">Holistic view of your trajectory</p>
            </div>
            
            {/* Legend */}
            <div className="flex items-center gap-4 text-[11px] font-bold tracking-widest uppercase">
              <div className="flex items-center gap-2 text-white/50">
                <div className="w-3 h-3 rounded-full bg-white/20" /> Current
              </div>
              <div className="flex items-center gap-2 text-cyan-400">
                <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]" /> Projected
              </div>
            </div>
          </div>

          <div className="w-full h-[400px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Current"
                  dataKey="current"
                  stroke="rgba(255,255,255,0.3)"
                  fill="rgba(255,255,255,0.1)"
                  fillOpacity={0.5}
                />
                <Radar
                  name="Projected"
                  dataKey="projected"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  fill="#22d3ee"
                  fillOpacity={0.3}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1D1D1F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[24px]">
          <StatBox label="Proj. CGPA" val={projectedMetrics.cgpa.toFixed(2)} diff={projectedMetrics.cgpa - baseCgpa} />
          <StatBox label="Proj. Attendance" val={`${projectedMetrics.attendance}%`} diff={projectedMetrics.attendance - baseAttendance} />
          <StatBox label="Proj. Backlogs" val={projectedMetrics.backlogs} diff={projectedMetrics.backlogs - baseBacklogs} inverse />
          <StatBox label="Proj. Skills" val={projectedMetrics.skills} diff={projectedMetrics.skills - baseSkills} />
        </div>
      </div>

      {/* Right Column: Controls & Missions */}
      <div className="col-span-1 lg:col-span-4 flex flex-col gap-[24px]">
        
        {/* Sliders */}
        <Card variant="default" padding="lg">
          <h3 className="text-foreground font-semibold mb-6 flex items-center gap-2 text-lg tracking-tight">
            <Crosshair className="text-foreground-muted" size={18} />
            Target Parameters
          </h3>
          
          <div className="space-y-6">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Next Sem Target SGPA</span>
                <span className="text-white font-mono font-bold">{targetSgpa.toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="4" max="10" step="0.1" 
                value={targetSgpa}
                onChange={(e) => setTargetSgpa(parseFloat(e.target.value))}
                className="w-full accent-purple-500 bg-white/10 rounded-lg appearance-none h-2 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Target Attendance</span>
                <span className="text-white font-mono font-bold">{targetAttendance}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" step="1" 
                value={targetAttendance}
                onChange={(e) => setTargetAttendance(parseInt(e.target.value))}
                className="w-full accent-emerald-500 bg-white/10 rounded-lg appearance-none h-2 cursor-pointer"
              />
            </div>
          </div>
        </Card>

        {/* AI Missions using FloatingPill */}
        <Card variant="default" padding="lg" className="flex flex-col gap-6 flex-1">
          <div>
            <h3 className="text-foreground font-semibold flex items-center gap-2 text-lg tracking-tight">
              <Zap className="text-foreground-muted" size={18} />
              AI Missions
            </h3>
            <p className="text-foreground-muted text-sm mt-2 leading-relaxed">
              Select an actionable mission to instantly see its compounded impact on your profile.
            </p>
          </div>

          <div className="flex justify-center w-full">
            <FloatingPill
              items={[
                { id: "none", label: "None" },
                ...activeMissionsList.map(m => {
                  const Icon = m.icon;
                  return {
                    id: m.id,
                    label: m.title.split(' ')[0] + "...", // Shorten label for pill
                    icon: <Icon size={14} />
                  }
                })
              ]}
              activeId={activeMissionId}
              onActiveChange={toggleMission}
            />
          </div>

          {/* Active Mission Details */}
          {activeMissionId !== "none" && (
            <div className="mt-4 p-4 rounded-xl bg-surface border border-white/5">
              {(() => {
                const activeMission = activeMissionsList.find(m => m.id === activeMissionId);
                if (!activeMission) return null;
                const Icon = activeMission.icon;
                return (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-raised flex items-center justify-center">
                        <Icon size={14} className="text-foreground" />
                      </div>
                      <h4 className="text-sm font-semibold text-foreground">{activeMission.title}</h4>
                    </div>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {activeMission.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(activeMission.impact).map(([key, val]) => (
                        <div key={key} className="px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider bg-surface-raised text-foreground-muted">
                          {(val as number) > 0 ? '+' : ''}{(val as number)} {key}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// Helper
function StatBox({ label, val, diff, inverse = false }: { label: string, val: string | number, diff: number, inverse?: boolean }) {
  const isPositive = inverse ? diff < 0 : diff > 0;
  const isNeutral = diff === 0;

  return (
    <Card variant="default" padding="md" className="flex flex-col items-center justify-center text-center">
      <span className="text-foreground-muted text-[10px] uppercase tracking-[0.12em] font-semibold mb-2">{label}</span>
      <span className="text-2xl font-semibold text-foreground tracking-tight">{(val as number)}</span>
      {!isNeutral && (
        <div className={cn(
          "text-[10px] font-bold mt-2 tracking-wider uppercase",
          isPositive ? "text-green-500" : "text-red-500"
        )}>
          {diff > 0 ? "+" : ""}{typeof diff === "number" ? diff.toFixed(1) : diff}
        </div>
      )}
    </Card>
  );
}
