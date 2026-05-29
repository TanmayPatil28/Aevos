"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Layers, Edit3 } from "lucide-react";
import ActiveSimulator from "./ActiveSimulator";
import ManualCalculator from "./ManualCalculator";

import { PageHero } from "@/components/ui/PageHero";

export default function UnifiedCalculatorPage() {
  const [mode, setMode] = useState<"simulator" | "manual">("simulator");
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  
  // Transform background element on scroll
  const glowY = useTransform(scrollY, [0, 500], [0, 150]);
  const glowOpacity = useTransform(scrollY, [0, 300], [0.6, 0]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="w-full relative min-h-screen bg-black overflow-x-hidden selection:bg-white/20 selection:text-white pb-32">
      
      {/* Background Ambient Glows */}
      <motion.div 
        style={{ y: glowY, opacity: glowOpacity }}
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] pointer-events-none z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#2a4365]/30 via-transparent to-transparent blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#4F8EF7]/15 blur-[100px] rounded-full mix-blend-screen" />
      </motion.div>

      {/* Header and Content Container */}
      <div className="relative z-10 w-full px-4 md:px-8 max-w-[1400px] mx-auto pt-12 md:pt-16 pb-4 flex flex-col xl:flex-row justify-between items-start gap-8">
        
        {/* Left Side: Hero Text */}
        <div className="flex-1 max-w-4xl z-10">
          <PageHero 
            headline={<>Precise. Powerful. Real-time.<br/>Compute your exact standing.</>}
            description="The ultimate grade calculation engine. Instantly simulate SGPA and CGPA outcomes using live university algorithms, or manually sandbox what-if grade scenarios to see exactly where you stand."
          />
        </div>
      </div>

      {/* Sticky Dynamic Island Navigation - Right Aligned on Desktop */}
      <div className="sticky top-6 z-[100] w-full px-4 md:px-8 max-w-[1400px] mx-auto flex justify-center xl:justify-end pointer-events-none xl:-mt-36 mb-10">
        <div className="pointer-events-auto">
          <motion.div 
            layout
            className="relative overflow-hidden flex items-center p-1.5 bg-[#1D1D1F] border border-white/5 rounded-full"
          >
            {/* Active Highlight Background */}
            <div 
              className="absolute top-1.5 bottom-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 transition-all duration-500 ease-in-out z-0"
              style={{
                left: mode === "simulator" ? "6px" : "50%",
                width: "calc(50% - 6px)",
              }}
            />
            
            <button
              onClick={() => setMode("simulator")}
              className={`relative z-10 flex items-center justify-center gap-2 px-6 py-3 md:py-2.5 rounded-full text-[13px] md:text-sm font-bold transition-colors duration-300 w-40 md:w-48 ${
                mode === "simulator" 
                  ? "text-white drop-shadow-md" 
                  : "text-white/50 hover:text-white"
              }`}
            >
              <Layers size={16} className={mode === "simulator" ? "text-white" : "text-white/50"} />
              Active Simulator
            </button>
            
            <button
              onClick={() => setMode("manual")}
              className={`relative z-10 flex items-center justify-center gap-2 px-6 py-3 md:py-2.5 rounded-full text-[13px] md:text-sm font-bold transition-colors duration-300 w-40 md:w-48 ${
                mode === "manual" 
                  ? "text-white drop-shadow-md" 
                  : "text-white/50 hover:text-white"
              }`}
            >
              <Edit3 size={16} className={mode === "manual" ? "text-white" : "text-white/50"} />
              Manual Sandbox
            </button>
          </motion.div>
        </div>
      </div>

      {/* Calculator Content Area */}
      <div className="relative z-10 w-full px-4 md:px-8 max-w-[1400px] mx-auto mt-8 xl:mt-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            className="flex flex-col w-full mb-6"
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {mode === "simulator" ? <ActiveSimulator /> : <ManualCalculator />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
