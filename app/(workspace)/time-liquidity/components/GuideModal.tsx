"use client";

import React from "react";
import { BookOpen, X, Database, Monitor, Sparkles, AlertTriangle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReplayOnboarding: () => void;
}

export function GuideModal({
  isOpen,
  onClose,
  onReplayOnboarding
}: GuideModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="w-full max-w-2xl max-h-[85vh] aevos-glass-overlay border border-[var(--aevos-outline)]/20 rounded-[24px] shadow-2xl p-8 flex flex-col relative overflow-hidden"
          >
            <div className="flex justify-between items-center mb-6 border-b border-[var(--aevos-outline)]/20 pb-4">
              <span className="text-[12px] font-sans text-[var(--aevos-primary)] uppercase tracking-widest flex items-center gap-2 font-semibold">
                <BookOpen className="w-4 h-4" />
                How the Optimizer Works
              </span>
              <div className="flex items-center gap-4">
                <button
                  onClick={onReplayOnboarding}
                  className="text-[10px] font-sans font-semibold uppercase tracking-widest text-[var(--aevos-primary)] hover:text-[var(--aevos-primary-fixed-dim)] transition-colors bg-[var(--aevos-primary)]/10 px-3 py-1.5 rounded-full"
                >
                  Replay Onboarding
                </button>
                <button
                  onClick={onClose}
                  className="text-[var(--aevos-text-tertiary)] hover:text-[var(--aevos-text-primary)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-4 space-y-8 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              {/* D1: Economics */}
              <section>
                <h3 className="text-lg font-bold text-[var(--aevos-text-primary)] mb-2 flex items-center gap-2">
                  <Database className="w-4 h-4 text-[var(--aevos-text-tertiary)]" />
                  Attendance Economics
                </h3>
                <p className="text-sm text-[var(--aevos-text-secondary)] leading-relaxed font-sans">
                  Think of attendance not as a simple checklist, but as an optimization problem. Every class you attend builds a "buffer", and every class you miss consumes it. Your goal isn't necessarily 100% attendance, but rather managing your buffer to maximize your flexibility without dropping below your college's strict 75% requirement.
                </p>
              </section>

              {/* D2: Buffer/Slack */}
              <section>
                <h3 className="text-lg font-bold text-[var(--aevos-text-primary)] mb-2 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-[var(--aevos-text-tertiary)]" />
                  The Buffer (Safe Skips)
                </h3>
                <p className="text-sm text-[var(--aevos-text-secondary)] leading-relaxed font-sans">
                  A "Safe Skip" is the slack in your schedule. If you have 2 Safe Skips, you can miss 2 classes right now and still remain above 75%. This buffer grows the longer you attend consecutively, giving you more freedom later in the semester.
                </p>
              </section>

              {/* D3: Why AI */}
              <section>
                <h3 className="text-lg font-bold text-[var(--aevos-text-primary)] mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[var(--aevos-text-tertiary)]" />
                  Why AI is Needed
                </h3>
                <p className="text-sm text-[var(--aevos-text-secondary)] leading-relaxed font-sans">
                  With up to 30 classes a week, labs weighting 1.5x, and moving deadlines, calculating exactly when and what you can safely miss is extremely complex. The AI Agents run thousands of simulations (Monte Carlo) behind the scenes, resolving these constraints so you get a safe, verified answer instantly instead of calculating it manually.
                </p>
              </section>

              {/* D6: Workflow */}
              <section>
                <h3 className="text-lg font-bold text-[var(--aevos-text-primary)] mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[var(--aevos-text-tertiary)]" />
                  Ideal Long-Term Workflow
                </h3>
                <div className="space-y-4 font-sans">
                  <div>
                    <h4 className="text-[11px] font-sans text-[var(--aevos-primary)] uppercase tracking-wider mb-1 font-semibold">Weekly Routine (Mondays)</h4>
                    <p className="text-sm text-[var(--aevos-text-secondary)] leading-relaxed">
                      1. Check Detention Risk.<br />
                      2. Select Strategy Mode.<br />
                      3. Ask AI: "Which classes can I safely miss this week?"<br />
                      4. Preview the timetable, then accept/reject.<br />
                      5. Update actual attendance in Calculator.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-sans text-[var(--aevos-status-warning)] uppercase tracking-wider mb-1 font-semibold">Emergency Routine (Day-of)</h4>
                    <p className="text-sm text-[var(--aevos-text-secondary)] leading-relaxed">
                      Use Quick Actions (⌘K) like "I overslept". Switch to Survival mode if needed. Ask: "I missed morning classes — how bad is it?"
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-sans text-[var(--aevos-status-info)] uppercase tracking-wider mb-1 font-semibold">Semester Checkpoints</h4>
                    <p className="text-sm text-[var(--aevos-text-secondary)] leading-relaxed">
                      • <strong className="text-[var(--aevos-text-primary)]">Weeks 1–4</strong>: Balanced mode.<br />
                      • <strong className="text-[var(--aevos-text-primary)]">Weeks 5–8</strong>: Placement Prep.<br />
                      • <strong className="text-[var(--aevos-text-primary)]">Weeks 9–11</strong>: Exam Sprint.<br />
                      • <strong className="text-[var(--aevos-text-primary)]">Finals week</strong>: Compliance Agent.<br />
                      • <strong className="text-[var(--aevos-text-primary)]">Low-energy periods</strong>: Burnout Recovery mode.
                    </p>
                  </div>
                </div>
              </section>

              {/* D5: Sandbox alternative */}
              <div className="bg-[var(--aevos-surface-dim)] border border-white/5 rounded-[16px] p-5 mt-6 font-sans">
                <h4 className="text-sm font-semibold text-[var(--aevos-text-primary)] mb-1">Want to test scenarios?</h4>
                <p className="text-xs text-[var(--aevos-text-secondary)]">
                  Just ask the AI in the chat: <code className="text-[var(--aevos-text-secondary)] bg-black/30 px-1.5 py-0.5 rounded border border-white/5 mx-1">"What if I miss 3 Mondays this month?"</code> or <code className="text-[var(--aevos-text-secondary)] bg-black/30 px-1.5 py-0.5 rounded border border-white/5 mx-1">"Can I take next Friday off?"</code> The system will simulate it for you instantly.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
