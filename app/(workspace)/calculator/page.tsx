"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Layers, Edit3 } from "lucide-react";
import ActiveSimulator from "./ActiveSimulator";
import ManualCalculator from "./ManualCalculator";

// Apple-style fade-in text component
function FadeText({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.span>
  );
}

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

      {/* Cinematic Hero Section */}
      <section className="relative z-10 w-full min-h-[70vh] flex flex-col items-center justify-center pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-8"
          >
            <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-white/50 border border-white/10 rounded-full px-4 py-1.5 bg-white/5 backdrop-blur-md">
              GradeFlow Engine Pro
            </span>
          </motion.div>
          
          <h1 className="text-7xl md:text-8xl lg:text-[9rem] font-bold tracking-[-0.05em] leading-[1.05] mb-8 text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(to right, #3b82f6, #93c5fd, #e0f2fe, #93c5fd, #3b82f6)", backgroundSize: "200% auto" }}>
            <motion.span animate={{ backgroundPosition: ["0% center", "200% center"] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="inline-block w-full">
              <FadeText delay={0.1} className="text-transparent">Precise.</FadeText> <FadeText delay={0.3} className="text-transparent">Powerful.</FadeText> <FadeText delay={0.5} className="text-transparent">Pro.</FadeText>
            </motion.span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/60 font-medium max-w-2xl mx-auto leading-relaxed">
            <FadeText delay={0.7}>
              Experience the pinnacle of academic forecasting. Calculates SGPA and CGPA in real-time, instantly.
            </FadeText>
          </p>
        </div>
      </section>

      {/* Sticky Dynamic Island Navigation */}
      <div className={`sticky top-6 z-[100] flex justify-center mb-16 transition-all duration-500 ${isScrolled ? 'px-4' : 'px-6'}`}>
        <motion.div 
          layout
          className="relative overflow-hidden flex items-center p-1.5 bg-black/60 border border-white/[0.08] rounded-full backdrop-blur-3xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)]"
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

      {/* Calculator Content Area */}
      <div className="relative z-10 w-full px-4 md:px-8 max-w-[1400px] mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            {mode === "simulator" ? <ActiveSimulator /> : <ManualCalculator />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
