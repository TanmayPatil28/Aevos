'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Minus,
  RotateCcw,
  BookOpen,
  TrendingUp,
  Settings2,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Attendance {
  id: string;
  subjectName: string;
  attended: number;
  totalClasses: number;
  minThreshold: number;
  lastUpdated: string;
}

export function AttendanceTracker() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newSubject, setNewSubject] = useState('');

  const fetchAttendance = async () => {
    try {
      const res = await fetch('/api/attendance');
      if (res.ok) {
        const data = await res.json();
        setAttendance(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleUpdate = async (subjectName: string, attended: number, total: number) => {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectName, attended, totalClasses: total }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAttendance((prev) => prev.map((a) => (a.subjectName === subjectName ? updated : a)));
      }
    } catch (err) {
      toast.error('Failed to update attendance');
    }
  };

  const handleAddSubject = async () => {
    if (!newSubject.trim()) return;
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectName: newSubject, attended: 0, totalClasses: 0 }),
      });
      if (res.ok) {
        const added = await res.json();
        setAttendance((prev) => [added, ...prev]);
        setNewSubject('');
        setIsAdding(false);
        toast.success(`${newSubject} added to tracker`);
      }
    } catch (err) {
      toast.error('Failed to add subject');
    }
  };

  const calculateStats = (a: Attendance) => {
    const percentage = a.totalClasses > 0 ? (a.attended / a.totalClasses) * 100 : 0;
    const isSafe = percentage >= a.minThreshold;

    // Bunk Manager Logic
    let safeBunks = 0;
    let requiredClasses = 0;

    if (percentage >= a.minThreshold) {
      // How many classes can we miss?
      // (attended) / (total + x) >= threshold / 100
      // attended * 100 / threshold >= total + x
      // x <= (attended * 100 / threshold) - total
      safeBunks = Math.floor((a.attended * 100) / a.minThreshold - a.totalClasses);
    } else {
      // How many more classes to attend?
      // (attended + x) / (total + x) >= threshold / 100
      // 100a + 100x >= t(total) + tx
      // x(100 - t) >= t(total) - 100a
      // x >= (t * total - 100 * attended) / (100 - t)
      requiredClasses = Math.ceil(
        (a.minThreshold * a.totalClasses - 100 * a.attended) / (100 - a.minThreshold)
      );
    }

    return { percentage, isSafe, safeBunks, requiredClasses };
  };

  if (isLoading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">
          Syncing Attendance...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-on-surface">Attendance Tracker</h2>
            <p className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-wider">
              75% Criteria Monitor
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all text-on-surface"
        >
          <Plus className={`w-5 h-5 transition-transform ${isAdding ? 'rotate-45' : ''}`} />
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex gap-2">
              <input
                type="text"
                placeholder="Subject Name (e.g. Distributed Systems)"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm text-on-surface placeholder:text-on-surface-variant/30"
              />
              <button
                onClick={handleAddSubject}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs"
              >
                Add
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {attendance.map((a) => {
          const stats = calculateStats(a);
          return (
            <motion.div
              key={a.id}
              layout
              className={`p-5 rounded-3xl border transition-all ${
                stats.isSafe ? 'bg-success/5 border-success/10' : 'bg-error/5 border-error/10'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-on-surface">{a.subjectName}</h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-tighter ${
                        stats.isSafe ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                      }`}
                    >
                      {stats.percentage.toFixed(1)}%
                    </span>
                    <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase">
                      {a.attended}/{a.totalClasses} Classes
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      handleUpdate(a.subjectName, Math.max(0, a.attended - 1), a.totalClasses)
                    }
                    className="p-1.5 rounded-lg hover:bg-white/5 text-on-surface-variant/60"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, stats.percentage)}%` }}
                  className={`h-full rounded-full ${stats.isSafe ? 'bg-success' : 'bg-error'}`}
                />
              </div>

              {/* Bunk Manager Insights */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                {stats.isSafe ? (
                  <>
                    <div className="w-8 h-8 rounded-xl bg-success/10 flex items-center justify-center text-success">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-success uppercase">You are Safe</p>
                      <p className="text-[9px] text-on-surface-variant/60 font-medium">
                        You can bunk the next{' '}
                        <span className="text-on-surface font-black">{stats.safeBunks}</span>{' '}
                        classes.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-xl bg-error/10 flex items-center justify-center text-error">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-error uppercase">At Risk</p>
                      <p className="text-[9px] text-on-surface-variant/60 font-medium">
                        Attend the next{' '}
                        <span className="text-on-surface font-black">{stats.requiredClasses}</span>{' '}
                        classes to recover.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleUpdate(a.subjectName, a.attended + 1, a.totalClasses + 1)}
                  className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-success/50 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase text-on-surface"
                >
                  <Plus className="w-3 h-3 text-success" />
                  Present
                </button>
                <button
                  onClick={() => handleUpdate(a.subjectName, a.attended, a.totalClasses + 1)}
                  className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-error/50 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase text-on-surface"
                >
                  <Minus className="w-3 h-3 text-error" />
                  Absent
                </button>
              </div>
            </motion.div>
          );
        })}

        {attendance.length === 0 && (
          <div className="md:col-span-2 p-12 text-center border-2 border-dashed border-white/5 rounded-[2rem] space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-on-surface-variant/30">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-black text-on-surface">No subjects tracked yet</p>
              <p className="text-xs text-on-surface-variant/50 max-w-xs mx-auto">
                Add your current semester subjects to start monitoring your attendance and "bunk
                manager" limits.
              </p>
            </div>
            <button
              onClick={() => setIsAdding(true)}
              className="px-6 py-3 rounded-2xl bg-primary/10 text-primary font-black text-xs hover:bg-primary/20 transition-all"
            >
              Add Your First Subject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
