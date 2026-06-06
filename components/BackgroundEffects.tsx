"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";

export default function BackgroundEffects() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Kinetic Mouse Tracking for Parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for a "weighty" feel
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  // 2. Parallax Transformations (Hoisted Hooks)
  const star1X = useTransform(springX, (v) => v * -10);
  const star1Y = useTransform(springY, (v) => v * -10);
  
  const star2X = useTransform(springX, (v) => v * -25);
  const star2Y = useTransform(springY, (v) => v * -25);
  
  const cloud1X = useTransform(springX, (v) => v * 60);
  const cloud1Y = useTransform(springY, (v) => v * 60);
  
  const cloud2X = useTransform(springX, (v) => v * -40);
  const cloud2Y = useTransform(springY, (v) => v * -40);

  useEffect(() => {
    setMounted(true);
    let rafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        // Normalize mouse pos (-1 to 1)
        mouseX.set((e.clientX / window.innerWidth) * 2 - 1);
        mouseY.set((e.clientY / window.innerHeight) * 2 - 1);
      });
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]);

  if (!mounted) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 -z-50 overflow-hidden bg-black pointer-events-none select-none" style={{ contain: "layout style paint" }}>
      
      {/* A. DEEP PARALLAX STARFIELD (The infinite void) */}
      
      {/* Layer 1: Distant Stars (Static/Very slow) */}
      <motion.div 
        style={{ x: star1X, y: star1Y }}
        className="absolute inset-[-10%] opacity-[0.2]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(1.5px_1.5px_at_20px_30px,#fff,rgba(0,0,0,0)),radial-gradient(1px_1px_at_40px_70px,#fff,rgba(0,0,0,0)),radial-gradient(1.5px_1.5px_at_50px_160px,#fff,rgba(0,0,0,0))] bg-[length:200px_200px] opacity-40" />
      </motion.div>

      {/* Layer 2: Mid-range Dust (SVG Filter for graininess) */}
      <motion.div 
        style={{ x: star2X, y: star2Y }}
        className="absolute inset-[-15%] opacity-[0.1]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(2px_2px_at_10px_10px,var(--primary),rgba(0,0,0,0))] bg-[length:150px_150px]" />
      </motion.div>

      {/* B. DYNAMIC ATMOSPHERIC NEBULA (The "Vibe" source) */}
      <div className="absolute inset-0 opacity-[0.25] mix-blend-screen pointer-events-none">
        {/* Active Cloud 1: Primary (Mouse Reactive) */}
        <motion.div
           style={{ x: cloud1X, y: cloud1Y, willChange: "transform, opacity" }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[120%] h-[120%] rounded-full bg-[radial-gradient(circle,var(--primary)_0%,transparent_70%)] blur-[64px]"
        />

        {/* Active Cloud 2: Secondary (Drifting) */}
        <motion.div
          style={{ x: cloud2X, y: cloud2Y, willChange: "transform, opacity" }}
          animate={{
            scale: [1.1, 0.9, 1.1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[20%] -right-[15%] w-[110%] h-[110%] rounded-full bg-[radial-gradient(circle,var(--secondary)_0%,transparent_70%)] blur-[64px]"
        />
      </div>

      {/* C. FLOATING ATMOSPHERIC EMBERS (Particle Depth) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%", 
              opacity: 0 
            }}
            animate={{
              y: ["-10%", "110%"],
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 15 + Math.random() * 20,
              repeat: Infinity,
              delay: Math.random() * 20,
              ease: "linear"
            }}
            className="absolute w-1 h-1 bg-white rounded-full blur-[2px] opacity-20"
            style={{ willChange: "transform, opacity" }}
          />
        ))}
      </div>

      {/* D. PREMIUM OPTICS & VIGNETTE (Hardware feel) */}
      
      {/* Triple-Tone Vignette (Normal, Indigo, Black) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_60%,rgba(0,0,0,0.9)_100%)]" />
      
      {/* Prismatic Edge Fringe (Chromatic Aberration mimic) */}
      <div className="absolute inset-0 border-[40px] border-transparent opacity-30 pointer-events-none"
           style={{
             boxShadow: "inset 0 0 100px rgba(59,130,246,0.05), inset 20px 0 60px rgba(236,72,153,0.02), inset -20px 0 60px rgba(16,185,129,0.02)"
           }}
      />

      {/* Subtle Hardware Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.08)_50%),linear-gradient(90deg,rgba(255,0,0,0.005),rgba(0,255,0,0.005),rgba(0,0,255,0.005))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-40" />

      {/* High-Freq Optical Noise */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
             backgroundRepeat: "repeat",
           }}
      />
    </div>
  );
}
