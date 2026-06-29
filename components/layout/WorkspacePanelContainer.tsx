"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useUSMStore } from "@/stores/usmStore";

// Lazy-loaded panel components to prevent initial bundle bloat
import dynamic from "next/dynamic";

const PredictorPanel = dynamic(() => import("@/components/panels/PredictorPanel"), { ssr: false });
const StrategyPanel = dynamic(() => import("@/components/panels/StrategyPanel"), { ssr: false });

export default function WorkspacePanelContainer() {
  const activePanel = useUSMStore((state) => state.workspaceUi.activePanel);
  const closePanel = useUSMStore((state) => state.closePanel);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence mode="wait">
      {activePanel !== "NONE" && (
        <motion.div
          key="workspace-panel"
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
          className="fixed z-[9900] flex flex-col pointer-events-auto font-sans
            inset-x-0 bottom-0 top-[15vh] rounded-t-[32px]
            lg:inset-auto lg:top-[70px] lg:bottom-[20px] lg:w-[400px] lg:rounded-[24px]"
          style={{
            right: "max(20px, calc(50vw - 800px + 20px))"
          }}
        >
          {/* Glass Shell */}
          <div className="absolute inset-0 bg-surface-raised/95 lg:bg-surface-raised/85 backdrop-blur-[40px] rounded-t-[32px] lg:rounded-[24px] border border-white/[0.05] shadow-[0_-20px_100px_rgba(0,0,0,0.5)] lg:shadow-[-20px_0_100px_rgba(0,0,0,0.5)] pointer-events-none" />
          
          {/* Header */}
          <div className="relative z-10 flex items-center justify-between p-4 border-b border-white/20">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50">
              {activePanel === "PREDICTOR" ? "Contextual Predictor" : 
               activePanel === "STRATEGY" ? "Strategy Engine" : 
               "Intelligence Panel"}
            </span>
            <button
              onClick={closePanel}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* Content Area */}
          <div className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-6">
            <AnimatePresence mode="wait">
              {activePanel === "PREDICTOR" && (
                <motion.div
                  key="predictor"
                  initial={{ opacity: 0, filter: "blur(8px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(8px)" }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <PredictorPanel />
                </motion.div>
              )}

              {activePanel === "STRATEGY" && (
                <motion.div
                  key="strategy"
                  initial={{ opacity: 0, filter: "blur(8px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(8px)" }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <StrategyPanel />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
