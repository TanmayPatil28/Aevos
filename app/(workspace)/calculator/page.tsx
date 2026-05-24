"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Edit3 } from "lucide-react";
import ActiveSimulator from "./ActiveSimulator";
import ManualCalculator from "./ManualCalculator";

export default function UnifiedCalculatorPage() {
  const [mode, setMode] = useState<"simulator" | "manual">("simulator");

  return (
    <div className="w-full relative">
      {/* Global Mode Toggle at Top */}
      <div className="flex justify-center mb-8 relative z-50">
        <div className="relative overflow-hidden flex items-center p-1.5 bg-[#0F172A]/90 border border-white/[0.08] rounded-full backdrop-blur-xl shadow-[0_15px_30px_-10px_rgba(0,0,0,0.7)] group">
        <div className="absolute inset-0 bg-[#4F8EF7]/5 rounded-full blur-xl pointer-events-none group-hover:bg-[#4F8EF7]/10 transition-colors duration-500" />
        
        <button
          onClick={() => setMode("simulator")}
          className={`relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
            mode === "simulator" 
              ? "bg-gradient-to-r from-[#4F8EF7] to-blue-500 text-white shadow-[0_0_20px_rgba(79,142,247,0.4)] border border-[#4F8EF7]/50" 
              : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent"
          }`}
        >
          <Layers size={16} />
          Active Simulator
        </button>
        <button
          onClick={() => setMode("manual")}
          className={`relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
            mode === "manual" 
              ? "bg-gradient-to-r from-[#4F8EF7] to-blue-500 text-white shadow-[0_0_20px_rgba(79,142,247,0.4)] border border-[#4F8EF7]/50" 
              : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent"
          }`}
        >
          <Edit3 size={16} />
          Manual Sandbox
        </button>
        </div>
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
