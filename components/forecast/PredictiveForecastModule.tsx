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
  const [activeMissions, setActiveMissions] = useState<Set<string>>(new Set());

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
    activeMissions.forEach((missionId) => {
      const m = activeMissionsList.find((x) => x.id === missionId);
      if (m) {
        if (m.impact.cgpa) pCgpa += m.impact.cgpa;
        if (m.impact.backlogs) pBacklogs += m.impact.backlogs;
        if (m.impact.skills) pSkills += m.impact.skills;
        if (m.impact.attendance) pAttendance += m.impact.attendance;
        if (m.impact.projects) pProjects += m.impact.projects;
      }
    });

    // Bound values
    return {
      cgpa: Math.min(10, Math.max(0, pCgpa)),
      backlogs: Math.max(0, pBacklogs),
      skills: Math.max(0, pSkills),
      attendance: Math.min(100, Math.max(0, pAttendance)),
      projects: Math.max(0, pProjects),
    };
  }, [baseCgpa, baseBacklogs, baseSkills, baseAttendance, baseProjects, targetSgpa, targetAttendance, activeMissions, academic.completedSemesters]);

  const toggleMission = (id: string) => {
    setActiveMissions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
    <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 p-4 lg:p-8">
      
      {/* Left Column: Visual Radar */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="bg-[#111113] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Target className="text-indigo-400" size={24} /> 
                Academic & Career Health
              </h2>
              <p className="text-sm text-white/50 mt-1">Holistic view of your trajectory</p>
            </div>
            
            {/* Legend */}
            <div className="flex items-center gap-4 text-[11px] font-bold tracking-widest uppercase">
              <div className="flex items-center gap-2 text-white/50">
                <div className="w-3 h-3 rounded-full bg-white/20" /> Current
              </div>
              <div className="flex items-center gap-2 text-indigo-400">
                <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" /> Projected
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
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="#6366f1"
                  fillOpacity={0.3}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1D1D1F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox label="Proj. CGPA" val={projectedMetrics.cgpa.toFixed(2)} diff={projectedMetrics.cgpa - baseCgpa} />
          <StatBox label="Proj. Attendance" val={`${projectedMetrics.attendance}%`} diff={projectedMetrics.attendance - baseAttendance} />
          <StatBox label="Proj. Backlogs" val={projectedMetrics.backlogs} diff={projectedMetrics.backlogs - baseBacklogs} inverse />
          <StatBox label="Proj. Skills" val={projectedMetrics.skills} diff={projectedMetrics.skills - baseSkills} />
        </div>
      </div>

      {/* Right Column: Controls & Missions */}
      <div className="w-full lg:w-[400px] flex flex-col gap-6">
        
        {/* Sliders */}
        <div className="bg-[#111113] border border-white/10 rounded-3xl p-6 shadow-2xl">
          <h3 className="text-white font-bold mb-6 flex items-center gap-2">
            <Crosshair className="text-pink-400" size={18} />
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
                className="w-full accent-pink-500 bg-white/10 rounded-lg appearance-none h-2 cursor-pointer"
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
        </div>

        {/* AI Missions */}
        <div className="bg-[#111113] border border-white/10 rounded-3xl p-6 shadow-2xl flex-1">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Zap className="text-amber-400" size={18} />
            AI Recommended Missions
          </h3>
          <p className="text-white/40 text-xs mb-6 leading-relaxed">
            Select actionable missions to instantly see their compounded impact on your holistic profile trajectory.
          </p>

          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {activeMissionsList.map((mission) => {
                const isActive = activeMissions.has(mission.id);
                const Icon = mission.icon;
                return (
                  <motion.button
                    key={mission.id}
                    layout
                    onClick={() => toggleMission(mission.id)}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group",
                      isActive 
                        ? "bg-indigo-500/10 border-indigo-500/50" 
                        : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"
                    )}
                  >
                    <div className="flex gap-4 relative z-10">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
                        isActive ? "bg-indigo-500 text-white" : "bg-white/10 text-white/50"
                      )}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <h4 className={cn("text-sm font-bold transition-colors", isActive ? "text-indigo-300" : "text-white")}>
                          {mission.title}
                        </h4>
                        <p className="text-xs text-white/40 mt-1 leading-relaxed">{mission.description}</p>
                        
                        {/* Impact Pills */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {Object.entries(mission.impact).map(([key, val]) => (
                            <div key={key} className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-white/10 text-white/70">
                              {(val as number) > 0 ? '+' : ''}{(val as number)} {key}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}

// Helper
function StatBox({ label, val, diff, inverse = false }: { label: string, val: string | number, diff: number, inverse?: boolean }) {
  const isPositive = inverse ? diff < 0 : diff > 0;
  const isNeutral = diff === 0;

  return (
    <div className="bg-[#111113] border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
      <span className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">{label}</span>
      <span className="text-2xl font-black text-white font-mono">{(val as number)}</span>
      {!isNeutral && (
        <div className={cn(
          "text-[10px] font-bold mt-1",
          isPositive ? "text-emerald-400" : "text-red-400"
        )}>
          {diff > 0 ? "+" : ""}{typeof diff === "number" ? diff.toFixed(1) : diff}
        </div>
      )}
    </div>
  );
}
