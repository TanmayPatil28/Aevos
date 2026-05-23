"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Edit3 } from "lucide-react";
import ActiveSimulator from "./ActiveSimulator";
import ManualCalculator from "./ManualCalculator";

export default function UnifiedCalculatorPage() {
  const [mode, setMode] = useState<"simulator" | "manual">("simulator");

  return (
    <div className="relative min-h-screen bg-[#000000]">
      {/* Global Mode Toggle Floating at Top */}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center p-1.5 bg-[#0F172A]/80 border border-white/10 rounded-full backdrop-blur-xl shadow-2xl">
        <button
          onClick={() => setMode("simulator")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
            mode === "simulator" 
              ? "bg-gradient-to-r from-[#4F8EF7] to-blue-600 text-white shadow-[0_0_20px_rgba(79,142,247,0.4)]" 
              : "text-white/50 hover:text-white hover:bg-white/5"
          }`}
        >
          <Layers size={16} />
          Active Simulator
        </button>
        <button
          onClick={() => setMode("manual")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
            mode === "manual" 
              ? "bg-gradient-to-r from-[#4F8EF7] to-blue-600 text-white shadow-[0_0_20px_rgba(79,142,247,0.4)]" 
              : "text-white/50 hover:text-white hover:bg-white/5"
          }`}
        >
          <Edit3 size={16} />
          Manual Sandbox
        </button>
      </div>

      {/* Animate out the old component and animate in the new one */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          {mode === "simulator" ? <ActiveSimulator /> : <ManualCalculator />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
