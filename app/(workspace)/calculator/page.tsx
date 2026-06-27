"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Layers, Edit3 } from "lucide-react";
import dynamic from "next/dynamic";
import { AppleCarousel } from "@/components/ui/apple-carousel";
import { FloatingPill } from "@/components/ui/floating-pill";

const ActiveSimulator = dynamic(() => import("./ActiveSimulator"), { 
  ssr: false,
  loading: () => <div className="h-[500px] w-full rounded-[2rem] bg-white/5 animate-pulse border border-white/10" />
});
const ManualCalculator = dynamic(() => import("./ManualCalculator"), { 
  ssr: false,
  loading: () => <div className="h-[500px] w-full rounded-[2rem] bg-white/5 animate-pulse border border-white/10" />
});
const CalculatorPlanner = dynamic(() => import("./CalculatorPlanner"), { 
  ssr: false,
  loading: () => <div className="h-[500px] w-full rounded-[2rem] bg-white/5 animate-pulse border border-white/10" />
});
const CalculatorForecast = dynamic(() => import("./CalculatorForecast"), { 
  ssr: false,
  loading: () => <div className="h-[500px] w-full rounded-[2rem] bg-white/5 animate-pulse border border-white/10" />
});

export default function UnifiedCalculatorPage() {
  const [mode, setMode] = useState<"simulator" | "manual" | "planner" | "forecast">("simulator");
  const [isPillExpanded, setIsPillExpanded] = useState(false);
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

  const carouselSlides = [
    {
      id: "slide-1",
      headline: (
        <>
          Precise. Powerful. Real-time.<br />
          Compute your exact standing.
        </>
      ),
      colors: ["#1c1c1c", "#1e1e1e", "#181818", "#222222"],
    },
    {
      id: "slide-2",
      headline: (
        <>
          Simulate Your Trajectory.<br />
          Data-driven grade predictions.
        </>
      ),
      colors: ["#1c1c1c", "#1f1f1f", "#191919", "#202020"],
    },
    {
      id: "slide-3",
      headline: (
        <>
          Manual Sandbox Mode.<br />
          What-if grade scenarios.
        </>
      ),
      colors: ["#1c1c1c", "#1a1a1a", "#1b1b1b", "#1f1f1f"],
    },
  ];

  return (
    <div className="w-full relative min-h-screen bg-background overflow-x-hidden font-sans selection:bg-brand/20 selection:text-white pb-32">
      
      {/* Background Ambient Glows */}
      <motion.div 
        style={{ y: glowY, opacity: glowOpacity }}
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] pointer-events-none z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-brand/15 via-transparent to-transparent blur-[160px] rounded-full mix-blend-screen transition-colors duration-1000" />
      </motion.div>

      {/* Premium Apple Carousel Section at Very Top */}
      <div className="relative z-50 pt-16 pb-8 max-w-[1400px] mx-auto flex flex-col gap-6">
        <div className="w-full">
          <div className="w-[100vw] relative left-1/2 -translate-x-1/2">
            <AppleCarousel 
              slides={carouselSlides} 
              leftControls={
                <FloatingPill 
                  id={mode}
                  activeId={mode}
                  onActiveChange={(id) => {
                    const strId = String(id);
                    if (strId === "simulator" || strId === "manual" || strId === "planner" || strId === "forecast") {
                      setMode(strId as any);
                    }
                  }}
                  isExpanded={isPillExpanded}
                  onExpandChange={setIsPillExpanded}
                  items={[
                    { id: "simulator", label: "Current Semester" },
                    { id: "manual", label: "Custom Scenario" },
                    { id: "planner", label: "Goal Planner" },
                    { id: "forecast", label: "Future Trajectory" }
                  ]}
                  expandable={false}
                />
              }
            />
          </div>
        </div>
      </div>

      {/* Desktop Content Area */}
      <div className="relative z-10 w-full px-6 md:px-12 max-w-[1400px] mx-auto mt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            className="flex flex-col w-full mb-6"
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {mode === "simulator" && <ActiveSimulator />}
            {mode === "manual" && <ManualCalculator />}
            {mode === "planner" && <CalculatorPlanner />}
            {mode === "forecast" && <CalculatorForecast />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
