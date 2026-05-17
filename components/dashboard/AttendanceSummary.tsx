'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Attendance {
  subjectName: string;
  attended: number;
  totalClasses: number;
  minThreshold: number;
}

export function AttendanceSummary() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/attendance')
      .then((res) => res.json())
      .then((data) => {
        setAttendance(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;

  const atRisk = attendance.filter((a) => (a.attended / a.totalClasses) * 100 < a.minThreshold);
  if (attendance.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-on-surface flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning" />
          Attendance Alert
        </h3>
        <Link
          href="/productivity"
          className="p-1.5 rounded-lg bg-white/5 text-on-surface-variant/40 hover:text-primary transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {atRisk.length > 0 ? (
          <>
            <p className="text-[10px] font-bold text-error uppercase tracking-widest">
              Action Required
            </p>
            <p className="text-xs font-medium text-on-surface-variant/70 leading-relaxed">
              You are falling below 75% in{' '}
              <span className="text-on-surface font-black">{atRisk.length} subjects</span>.
            </p>
            <div className="flex -space-x-2">
              {atRisk.slice(0, 3).map((a, i) => (
                <div
                  key={i}
                  title={a.subjectName}
                  className="w-8 h-8 rounded-full bg-error/10 border border-error/20 flex items-center justify-center text-[10px] font-black text-error"
                >
                  {a.subjectName[0]}
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="text-[10px] font-bold text-success uppercase tracking-widest">
              Criteria Satisfied
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-on-surface-variant/70">
                Your attendance is safe across all {attendance.length} subjects.
              </p>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
