// @ts-nocheck
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X } from "lucide-react";
import { useDynamicIslandStore } from "@/stores/dynamicIslandStore";
import { useUSMStore } from "@/stores/usmStore";

export default function IslandTestControls() {
  const [isOpen, setIsOpen] = useState(false);
  const { addActivity, removeActivity, showAlert, setExamCountdown, clearExamCountdown, setStreak } = useDynamicIslandStore();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 z-[9999] px-4 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-xl flex items-center gap-2 text-sm font-bold shadow-lg transition-all ${isOpen ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100 scale-100'}`}
      >
        <Settings size={16} /> Controls
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-4 right-4 z-[10000] bg-black/80 backdrop-blur-2xl border border-white/20 p-4 rounded-xl flex flex-col gap-2 text-xs font-mono max-h-[85vh] w-[280px] overflow-y-auto shadow-2xl"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/50 font-bold uppercase tracking-widest">Island Controls</span>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

      {/* === REAL DATA TESTING === */}
      <div className="text-white/30 text-[10px] uppercase tracking-widest mt-1">Real Data Injection</div>

      <button 
        onClick={() => {
          useUSMStore.getState().setCourses([
            { id: 'c1', code: 'CS101', name: 'Data Structures', semester: 1, credits: 4, cieMarks: 0, attendanceTotal: 40, attendanceBunked: 12 },
            { id: 'c2', code: 'CS102', name: 'Algorithms', semester: 1, credits: 4, cieMarks: 0, attendanceTotal: 40, attendanceBunked: 9 },
            { id: 'c3', code: 'EE405', name: 'Signals Lab', semester: 1, credits: 4, cieMarks: 0, attendanceTotal: 40, attendanceBunked: 2 },
            { id: 'c4', code: 'CS103', name: 'Operating Systems', semester: 1, credits: 4, cieMarks: 0, attendanceTotal: 40, attendanceBunked: 0 }
          ]);
          
          useUSMStore.getState().setTimetable({
            monday: [
              { id: 't1', courseId: 'c1', type: 'LECTURE', startTime: '09:00', endTime: '11:00', room: 'Lab 2' },
              { id: 't2', courseId: 'c2', type: 'LECTURE', startTime: '13:00', endTime: '14:00', room: 'A-201' }
            ],
            tuesday: [
              { id: 't3', courseId: 'c3', type: 'LAB', startTime: '10:00', endTime: '13:00', room: 'Hardware Lab' },
              { id: 't4', courseId: 'c4', type: 'LECTURE', startTime: '15:00', endTime: '17:00', room: 'A-204' }
            ],
            wednesday: [
              { id: 't5', courseId: 'c1', type: 'LECTURE', startTime: '09:00', endTime: '10:00', room: 'Lab 2' },
              { id: 't6', courseId: 'c2', type: 'LECTURE', startTime: '13:00', endTime: '15:00', room: 'A-201' }
            ],
            thursday: [
              { id: 't7', courseId: 'c4', type: 'LECTURE', startTime: '10:00', endTime: '12:00', room: 'A-204' }
            ],
            friday: [
              { id: 't8', courseId: 'c1', type: 'LECTURE', startTime: '10:00', endTime: '11:00', room: 'Lab 2' }
            ],
            saturday: [],
            sunday: []
          });
          
          showAlert({
            id: `alert-tt-${Date.now()}`,
            type: 'success',
            title: 'Timetable Synced',
            message: 'Full dense academic schedule injected.',
            duration: 3500,
          });
        }}
        className="px-3 py-1.5 bg-indigo-500/20 text-indigo-400 rounded hover:bg-indigo-500/30 text-left"
      >
        💉 Inject Live Timetable
      </button>

      <button 
        onClick={() => {
          useUSMStore.getState().setCourses([
            { id: 'c1', code: 'CS101', name: 'Data Structures', semester: 1, credits: 4, cieMarks: 0, attendanceTotal: 40, attendanceBunked: 12 }, // 70% CRITICAL
            { id: 'c2', code: 'CS102', name: 'Algorithms', semester: 1, credits: 4, cieMarks: 0, attendanceTotal: 40, attendanceBunked: 9 }, // 77.5% WARNING
            { id: 'c3', code: 'CS103', name: 'Operating Systems', semester: 1, credits: 4, cieMarks: 0, attendanceTotal: 40, attendanceBunked: 2 } // 95% SAFE
          ]);
          
          showAlert({
            id: `alert-bunk-${Date.now()}`,
            type: 'warning',
            title: 'Attendance Risk Updated',
            message: 'Bunk calculations are now active.',
            duration: 3500,
          });
        }}
        className="px-3 py-1.5 bg-indigo-500/20 text-indigo-400 rounded hover:bg-indigo-500/30 text-left"
      >
        💉 Inject Bunk Risk Data
      </button>

      <button 
        onClick={() => {
          const interventions = useUSMStore.getState().interventions;
          useUSMStore.setState({
            interventions: [...interventions, {
              id: `inv_${Date.now()}`,
              type: 'ATTENDANCE_WARNING',
              severity: 'CRITICAL',
              status: 'ACTIVE',
              title: 'Critical Detention Risk',
              description: 'Data Structures attendance has fallen to 70%. You cannot miss another class.',
              context: { courseId: 'c1' },
              createdAt: Date.now()
            }]
          });
          
          showAlert({
            id: `alert-inv-${Date.now()}`,
            type: 'error',
            title: 'Intervention Triggered',
            message: 'Critical detention risk added to system.',
            duration: 4000,
          });
        }}
        className="px-3 py-1.5 bg-indigo-500/20 text-indigo-400 rounded hover:bg-indigo-500/30 text-left"
      >
        💉 Trigger Intervention
      </button>

      {/* === ACTIVITIES === */}
      <div className="h-px bg-white/10 my-1" />
      <div className="text-white/30 text-[10px] uppercase tracking-widest mt-1">Mock Activities</div>

      <button 
        onClick={() => addActivity({ id: 'study', type: 'timer', title: 'Focus Session', timeRemaining: 1500, isActive: true })}
        className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 text-left"
      >
        + Study Timer
      </button>

      <button 
        onClick={() => addActivity({ id: 'grades', type: 'academic_status', title: 'SGPA: 9.8', isActive: true })}
        className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30 text-left"
      >
        + Academic Status
      </button>

      <button 
        onClick={() => addActivity({ 
          id: 'music-player', type: 'music', title: 'lofi hip hop radio', subtitle: 'Lofi Girl',
          isActive: true, metadata: { albumArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80' }
        })}
        className="px-3 py-1.5 bg-pink-500/20 text-pink-400 rounded hover:bg-pink-500/30 text-left"
      >
        + Music Player
      </button>

      <button 
        onClick={() => addActivity({ 
          id: 'live-class', type: 'schedule', title: 'Data Structures', timeRemaining: 1500,
          isActive: true, metadata: { totalTime: 3600, nextClass: 'Physics Lab' }
        })}
        className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 text-left"
      >
        + Live Class
      </button>

      <button 
        onClick={() => addActivity({ 
          id: 'sync-progress', type: 'progress', title: 'Syncing University Data', 
          progress: 0, isActive: true 
        })}
        className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 rounded hover:bg-cyan-500/30 text-left"
      >
        + Sync Progress
      </button>

      <button 
        onClick={() => {
          // Simulate progress
          let p = 0;
          const interval = setInterval(() => {
            p += Math.random() * 15;
            if (p >= 100) {
              p = 100;
              clearInterval(interval);
              setTimeout(() => removeActivity('sync-progress'), 1500);
            }
            useDynamicIslandStore.getState().updateActivity('sync-progress', { progress: p });
          }, 600);
        }}
        className="px-3 py-1.5 bg-cyan-500/10 text-cyan-400/60 rounded hover:bg-cyan-500/20 text-left ml-4"
      >
        ▶ Simulate Sync
      </button>

      <button 
        onClick={() => {
          removeActivity('study'); removeActivity('grades'); removeActivity('music-player');
          removeActivity('live-class'); removeActivity('sync-progress');
        }}
        className="px-3 py-1.5 bg-white/5 text-white/50 rounded hover:bg-white/10 text-left"
      >
        Clear Activities
      </button>

      {/* === EXAM COUNTDOWN === */}
      <div className="h-px bg-white/10 my-1" />
      <div className="text-white/30 text-[10px] uppercase tracking-widest">Exam Countdown</div>

      <button 
        onClick={() => setExamCountdown({
          id: 'exam-ds', subject: 'Data Structures', examDate: new Date(Date.now() + 3 * 86400000),
          daysRemaining: 3, hoursRemaining: 5, minutesRemaining: 20, urgency: 'high'
        })}
        className="px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded hover:bg-orange-500/30 text-left"
      >
        + Exam: 3 days (High)
      </button>

      <button 
        onClick={() => setExamCountdown({
          id: 'exam-critical', subject: 'Physics Final', examDate: new Date(Date.now() + 86400000),
          daysRemaining: 0, hoursRemaining: 18, minutesRemaining: 30, urgency: 'critical'
        })}
        className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-left"
      >
        + Exam: TOMORROW (Critical)
      </button>

      <button 
        onClick={() => clearExamCountdown()}
        className="px-3 py-1.5 bg-white/5 text-white/50 rounded hover:bg-white/10 text-left"
      >
        Clear Exam
      </button>



      {/* === ALERTS === */}
      <div className="h-px bg-white/10 my-1" />
      <div className="text-white/30 text-[10px] uppercase tracking-widest">Alerts</div>

      <button 
        onClick={() => showAlert({ 
          id: Date.now().toString(), 
          type: 'warning', 
          title: 'Attendance Warning', 
          message: 'Physics dropped below 75% minimum.', 
          duration: 3500,
          actions: [
            { label: 'Draft Email', icon: 'mail', onClick: () => console.log('Drafting Email...') },
            { label: 'Find Makeup Class', icon: 'calendar', onClick: () => console.log('Finding Class...') }
          ]
        })}
        className="px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded hover:bg-amber-500/30 text-left"
      >
        ⚠ Attendance Alert
      </button>

      <button 
        onClick={() => showAlert({ id: Date.now().toString(), type: 'success', title: 'Grade Updated', message: 'Data Structures Midsem scores released.', duration: 3500 })}
        className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30 text-left"
      >
        ✅ Grade Alert
      </button>

      <button 
        onClick={() => showAlert({ id: Date.now().toString(), type: 'error', title: 'Assignment Due', message: 'OS Lab Report due in 2 hours.', duration: 3500 })}
        className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-left"
      >
        🔴 Deadline Alert
      </button>

      <button 
        onClick={() => showAlert({ id: Date.now().toString(), type: 'info', title: 'Sync Complete', message: 'University data synced successfully.', duration: 3500 })}
        className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 text-left"
      >
        ℹ Sync Complete
      </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
