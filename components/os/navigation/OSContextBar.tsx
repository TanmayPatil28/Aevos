"use client";

import { useUIStore } from "@/stores/os/uiStore";
import { AnimatePresence, motion } from "framer-motion";

export default function OSContextBar() {
  const { contextTitle, contextActions } = useUIStore();

  if (!contextTitle && contextActions.length === 0) {
    return null;
  }

  return (
    <div className="w-full border-b border-slate-800/50 bg-slate-900/30 sticky top-[72px] z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        
        {/* Context Title */}
        <div className="flex items-center gap-2">
          <AnimatePresence mode="popLayout">
            <motion.h2
              key={contextTitle}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-semibold text-slate-300"
            >
              {contextTitle}
            </motion.h2>
          </AnimatePresence>
        </div>

        {/* Context Actions */}
        <div className="flex items-center gap-2">
          <AnimatePresence mode="popLayout">
            {contextActions.map((action) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                onClick={action.onClick}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                  ${action.primary 
                    ? "bg-indigo-500 hover:bg-indigo-400 text-white shadow-sm" 
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/50"
                  }
                `}
              >
                <span className="material-symbols-outlined text-[16px]">{action.icon}</span>
                {action.label}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
