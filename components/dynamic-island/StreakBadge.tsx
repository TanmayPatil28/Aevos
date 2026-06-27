"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Flame } from "lucide-react";
import { useDynamicIslandStore } from "@/stores/dynamicIslandStore";

export default function StreakBadge({ isVisible }: { isVisible: boolean }) {
  const { streak } = useDynamicIslandStore();

  if (!streak || streak.count <= 0) return null;

  const streakColors: Record<string, { bg: string; text: string; glow: string }> = {
    study: { bg: "bg-orange-500/10", text: "text-orange-400", glow: "shadow-[0_4px_20px_rgba(249,115,22,0.3)]" },
    attendance: { bg: "bg-emerald-500/10", text: "text-emerald-400", glow: "shadow-[0_4px_20px_rgba(52,211,153,0.3)]" },
    assignment: { bg: "bg-blue-500/10", text: "text-blue-400", glow: "shadow-[0_4px_20px_rgba(59,130,246,0.3)]" },
  };

  const colors = streakColors[streak.type] || streakColors.study;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 350, damping: 28, mass: 1 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none"
        >
          <div className={`
            flex items-center gap-2 px-4 py-2 rounded-full
            bg-[#1D1D1F]/90 backdrop-blur-xl
            border border-white/10
            ${colors.glow}
          `}>
            <motion.div
              animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
            >
              <Flame size={16} className={colors.text} fill="currentColor" />
            </motion.div>
            <span className={`text-[13px] font-black tracking-tight ${colors.text}`}>
              {streak.count}
            </span>
            <span className="text-white/40 text-[11px] font-medium">
              {streak.label}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
