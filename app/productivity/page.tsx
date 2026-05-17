'use client';

import { AttendanceTracker } from '@/components/productivity/AttendanceTracker';
import { Rocket, Calendar, Clock, CheckCircle2, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function ProductivityPage() {
  return (
    <main className="min-h-screen pt-24 px-6 pb-12 bg-surface max-w-7xl mx-auto space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-[10px]">
            <Rocket className="w-3 h-3" />
            Execution Suite
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-headline text-on-surface tracking-tight">
            Mission Control
          </h1>
          <p className="text-on-surface-variant/70 max-w-xl text-sm leading-relaxed">
            Manage your daily academic performance, track attendance, and optimize your study
            schedule.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-on-surface font-bold text-xs flex items-center gap-2 hover:bg-white/10 transition-all"
        >
          <LayoutDashboard className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Column: Attendance Tracker */}
        <div className="lg:col-span-8 space-y-8">
          <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <CheckCircle2 size={120} />
            </div>
            <AttendanceTracker />
          </div>
        </div>

        {/* Sidebar: Upcoming Missions & Quick Stats */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass-card p-6 rounded-[2rem] border border-white/5 space-y-6">
            <h3 className="text-sm font-black text-on-surface flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Upcoming Missions
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 opacity-50">
                <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase mb-1">
                  Coming Soon
                </p>
                <p className="text-xs font-bold text-on-surface">Assignment Tracking</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 opacity-50">
                <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase mb-1">
                  Coming Soon
                </p>
                <p className="text-xs font-bold text-on-surface">Lab Exam Schedules</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-[2rem] border border-white/5 space-y-6">
            <h3 className="text-sm font-black text-on-surface flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Focus Stats
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <p className="text-[10px] font-bold text-primary/60 uppercase">Deep Work</p>
                <p className="text-xl font-black text-on-surface">0h</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase">
                  Efficiency
                </p>
                <p className="text-xl font-black text-on-surface">--</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
