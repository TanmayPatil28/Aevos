"use client";

import React from "react";
import { X, Sparkles, AlertTriangle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onboardingSlide: number;
  setOnboardingSlide: (val: number) => void;
  metrics: { strategicSkips: number; ruinProbability: number };
  isCurrentlyEmpty: boolean;
}

export function OnboardingModal({
  isOpen,
  onClose,
  onboardingSlide,
  setOnboardingSlide,
  metrics,
  isCurrentlyEmpty
}: OnboardingModalProps) {

  const handleNext = () => {
    if (onboardingSlide < 6) {
      setOnboardingSlide(onboardingSlide + 1);
    } else {
      localStorage.setItem("gradeflow_attendance_optimizer_onboarded", "true");
      onClose();
    }
  };

  const handleBack = () => {
    if (onboardingSlide > 0) {
      setOnboardingSlide(onboardingSlide - 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="w-full max-w-md aevos-glass-overlay border border-[var(--aevos-outline)]/20 rounded-[24px] shadow-2xl p-6 flex flex-col relative overflow-hidden"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-sans text-[var(--aevos-text-tertiary)] uppercase tracking-widest">
                ONBOARDING — STEP {onboardingSlide + 1} OF 7
              </span>
              <button
                onClick={() => {
                  localStorage.setItem("gradeflow_attendance_optimizer_onboarded", "true");
                  onClose();
                }}
                className="text-[var(--aevos-text-tertiary)] hover:text-[var(--aevos-text-primary)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 min-h-[160px] flex flex-col justify-center">
              {onboardingSlide === 0 && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-bold text-[var(--aevos-text-primary)]">Why are you here?</h3>
                  <p className="text-sm text-[var(--aevos-text-secondary)] leading-relaxed font-sans">
                    Your college requires 75% attendance. Miss too many classes and you're barred from exams. But there's slack built in — and most students don't know how to use it intelligently.
                  </p>
                </div>
              )}
              {onboardingSlide === 1 && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-bold text-[var(--aevos-text-primary)]">Set Up Your Schedule</h3>
                  <p className="text-sm text-[var(--aevos-text-secondary)] leading-relaxed font-sans">
                    To get started, you must import your timetable. Without it, the AI cannot calculate anything.
                  </p>
                </div>
              )}
              {onboardingSlide === 2 && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-bold text-[var(--aevos-text-primary)]">Your Current Buffer</h3>
                  <div className="bg-[var(--aevos-surface-dim)] border border-white/5 rounded-[16px] p-4 mt-2 grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-[var(--aevos-text-tertiary)] uppercase tracking-widest font-sans">Safe Skips</span>
                      <span className="text-2xl font-light text-[var(--aevos-text-primary)]">{isCurrentlyEmpty ? "-" : metrics.strategicSkips}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-[var(--aevos-text-tertiary)] uppercase tracking-widest font-sans">Detention Risk</span>
                      <span className={`text-2xl font-light ${metrics.ruinProbability > 20 ? 'text-[var(--aevos-status-critical)]' : metrics.ruinProbability > 10 ? 'text-[var(--aevos-status-warning)]' : 'text-[var(--aevos-status-success)]'}`}>
                        {isCurrentlyEmpty ? "-" : `${metrics.ruinProbability}%`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {onboardingSlide === 3 && (
                <div className="flex flex-col gap-2 w-full">
                  <h3 className="text-lg font-bold text-[var(--aevos-text-primary)]">Interactive Demo</h3>
                  <p className="text-sm text-[var(--aevos-text-secondary)] leading-relaxed mb-2 font-sans">
                    Try asking: "Can I take tomorrow off?" The AI runs thousands of simulations to give you a safe answer.
                  </p>
                  <div className="bg-[var(--aevos-surface)] border border-white/5 rounded-[16px] p-3 flex flex-col gap-2 relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[var(--aevos-primary)]/5 blur-2xl rounded-full"></div>
                    <div className="flex items-center gap-2 text-sm text-[var(--aevos-text-secondary)] bg-[var(--aevos-surface-overlay)] border border-white/5 p-2 rounded-[12px] w-fit max-w-[80%] font-sans">
                      Can I skip tomorrow?
                    </div>
                    <div className="flex items-start gap-2 text-sm text-[var(--aevos-text-primary)] bg-[var(--aevos-surface-overlay)] border border-white/5 p-2 rounded-[12px] w-fit max-w-[90%] ml-auto font-sans">
                      <Sparkles className="w-3 h-3 mt-0.5 shrink-0 text-[var(--aevos-text-tertiary)]" />
                      Yes, you can safely miss all classes tomorrow. Your risk will only rise to 12%.
                    </div>
                  </div>
                </div>
              )}
              {onboardingSlide === 4 && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-bold text-[var(--aevos-text-primary)]">Your Agents</h3>
                  <p className="text-sm text-[var(--aevos-text-secondary)] leading-relaxed font-sans">
                    You have 3 AI modes: Tactical (aggressive optimizer), Compliance (safe enforcer), and Deliverable (deadline-aware). Start with Tactical.
                  </p>
                </div>
              )}
              {onboardingSlide === 5 && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-bold text-[var(--aevos-text-primary)]">Strategy Modes</h3>
                  <p className="text-sm text-[var(--aevos-text-secondary)] leading-relaxed font-sans">
                    Choose a mode that fits your life right now (e.g. Balanced, Exam Sprint). The AI will adjust its risk tolerance automatically based on your choice.
                  </p>
                </div>
              )}
              {onboardingSlide === 6 && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-bold text-[var(--aevos-status-warning)] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> You're Ready
                  </h3>
                  <p className="text-sm text-[var(--aevos-text-secondary)] leading-relaxed font-sans">
                    Remember: All recommendations are <strong>simulations</strong>. Clicking "Preview Plan" simply updates your local planning calendar. Nothing here modifies your official attendance records.
                  </p>
                </div>
              )}
            </div>

            {/* Progress Dots */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-[var(--aevos-outline)]/20">
              <div className="flex gap-1.5">
                {[0, 1, 2, 3, 4, 5, 6].map((idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${onboardingSlide === idx ? 'bg-[var(--aevos-text-primary)] w-4' : 'bg-[var(--aevos-text-tertiary)]/50'}`}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                {onboardingSlide > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleBack}
                    className="h-8 text-xs border-[var(--aevos-outline)]/20 bg-[var(--aevos-surface-overlay)] hover:bg-[var(--aevos-surface-raised)] text-[var(--aevos-text-secondary)] rounded-full font-sans"
                  >
                    Back
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleNext}
                  className="h-8 text-xs bg-white/10 hover:bg-white/20 text-[var(--aevos-text-primary)] border border-white/5 font-semibold rounded-full font-sans transition-colors"
                >
                  {onboardingSlide === 6 ? "Get Started" : "Next"}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
