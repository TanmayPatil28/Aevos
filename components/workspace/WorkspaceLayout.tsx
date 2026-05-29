"use client";

import React, { useEffect } from "react";
import { useUSMStore } from "@/stores/usmStore";
import { X, Calculator, Target, BrainCircuit, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const store = useUSMStore();
  const { activePanel, selectedSubjectId, globalTargetCgpa } = store.workspaceUi;

  // Prevent background scrolling on mobile when panel is open
  useEffect(() => {
    if (activePanel !== "NONE" && window.innerWidth < 1024) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [activePanel]);

  return (
    <div className="relative min-h-screen w-full bg-[#000000]">
      {/* Main Canvas - Shrinks on desktop when panel is open */}
      <div 
        className={`transition-all duration-500 ease-out ${
          activePanel !== "NONE" ? "lg:mr-[420px]" : ""
        }`}
      >
        {children}
      </div>

      {/* Contextual Intelligence Panel (Right Sidebar / Mobile Bottom Sheet) */}
      <AnimatePresence>
        {activePanel !== "NONE" && (
          <>
            {/* Mobile Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => store.closePanel()}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
            />

            <motion.div 
              initial={{ x: "100%", y: "100%", opacity: 0 }}
              animate={{ 
                x: window.innerWidth >= 1024 ? 0 : 0, 
                y: window.innerWidth >= 1024 ? 0 : 0,
                opacity: 1 
              }}
              exit={{ 
                x: window.innerWidth >= 1024 ? "100%" : 0, 
                y: window.innerWidth >= 1024 ? 0 : "100%",
                opacity: 0 
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed lg:right-0 bottom-0 lg:top-0 w-full lg:w-[420px] h-[85vh] lg:h-full bg-[#0A0F1C]/95 backdrop-blur-2xl border-t lg:border-t-0 lg:border-l border-white/20 z-[100] flex flex-col shadow-2xl rounded-t-3xl lg:rounded-none"
            >
              {/* Panel Header */}
              <div className="h-16 border-b border-white/20 flex items-center justify-between px-6 bg-white/[0.02]">
                <div className="flex items-center gap-3 text-white font-bold text-sm tracking-wide">
                  {activePanel === "PREDICTOR" && <><Calculator className="w-4 h-4 text-indigo-400" /> Target Predictor</>}
                  {activePanel === "STRATEGY" && <><Target className="w-4 h-4 text-emerald-400" /> Strategy Allocator</>}
                  {activePanel === "BACKLOG" && <><AlertCircle className="w-4 h-4 text-rose-400" /> Recovery Protocol</>}
                </div>
                <button 
                  onClick={() => store.closePanel()} 
                  className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Panel Content (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                 {/* Placeholders for actual panel content we will build next */}
                 {activePanel === "PREDICTOR" && (
                    <div className="text-white">
                      Predictor Intelligence for Course ID: {selectedSubjectId}
                    </div>
                 )}
                 {activePanel === "STRATEGY" && (
                    <div className="text-white">
                      Strategy allocation to achieve: {globalTargetCgpa} CGPA
                    </div>
                 )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
