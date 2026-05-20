"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring, animate } from "framer-motion";
import React, { useRef } from "react";

interface PremiumButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "expand" | "glow" | "outline";
  icon?: React.ReactNode;
}

export default function PremiumButton({
  children,
  onClick,
  className = "",
  variant = "primary",
  icon = "add",
}: PremiumButtonProps) {
  const containerRef = useRef<HTMLButtonElement>(null);

  // Mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const hoverProgress = useMotionValue(0);

  // Magnetic Pull targets
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);

  // Smooth springs for magnetic pull
  const smoothX = useSpring(targetX, { stiffness: 400, damping: 25, mass: 0.5 });
  const smoothY = useSpring(targetY, { stiffness: 400, damping: 25, mass: 0.5 });

  // Styles based on variant
  const isLight = variant === "outline";
  const circleBg = isLight ? "bg-white text-black" : "bg-primary text-white";
  const bodyBg = isLight 
    ? "bg-white/[0.03] hover:bg-white/[0.06] border-white/20 backdrop-blur-xl" 
    : "bg-surface/60 hover:bg-surface border-white/10 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]";
  const textColor = isLight ? "text-on-surface" : "text-white";

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Absolute mouse pos in button
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    mouseX.set(x);
    mouseY.set(y);

    // Magnetic center calculation
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const distanceX = e.clientX - (rect.left + centerX);
    const distanceY = e.clientY - (rect.top + centerY);

    // Pull the icon slightly depending on mouse proximity
    targetX.set(distanceX * 0.15);
    targetY.set(distanceY * 0.15);
  };

  const handleMouseEnter = () => {
    animate(hoverProgress, 1, { duration: 0.3, ease: "easeOut" });
  };

  const handleMouseLeave = () => {
    animate(hoverProgress, 0, { duration: 0.5, ease: "easeOut" });
    targetX.set(0);
    targetY.set(0);
  };

  // Dynamic Spotlights
  const spotlightBg = useMotionTemplate`radial-gradient(120px circle at ${mouseX}px ${mouseY}px, ${isLight ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'}, transparent 100%)`;
  const borderGlow = useMotionTemplate`radial-gradient(60px circle at ${mouseX}px ${mouseY}px, ${isLight ? 'rgba(255,255,255,0.5)' : 'rgba(0,122,255,0.8)'}, transparent 100%)`;

  return (
    <motion.button
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{ 
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 25 }
      }}
      whileTap={{ 
        scale: 0.96,
        transition: { type: "spring", stiffness: 600, damping: 30 }
      }}
      onClick={onClick}
      className={`group relative flex items-center justify-between pl-6 pr-2 py-2 border rounded-full cursor-pointer overflow-hidden transition-colors duration-300 premium-focus ${bodyBg} ${className}`}
      style={{
        boxShadow: "0 20px 40px -10px rgba(0,0,0,0.4), inset 0 1px 0 0 rgba(255,255,255,0.05)"
      }}
    >
      {/* Inner Hover Spotlight (Ambient Glint) */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: spotlightBg,
          opacity: hoverProgress,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      />

      {/* Reactive Border Shimmer (Top & Bottom pseudo-borders) */}
      <motion.div 
         className="absolute inset-x-0 bottom-0 h-[1px] w-full pointer-events-none z-10 opacity-30"
         style={{ background: borderGlow, opacity: hoverProgress }}
      />
      <motion.div 
         className="absolute inset-x-0 top-0 h-[1px] w-full pointer-events-none z-10 opacity-30"
         style={{ background: borderGlow, opacity: hoverProgress }}
      />
      
      {/* Optional Top Edge ambient reflection */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none opacity-40" />

      {/* Button Text */}
      <span className={`relative font-semibold text-[15px] tracking-tight mr-6 z-10 drop-shadow-sm transition-transform duration-500 group-hover:-translate-x-1 ${textColor}`}>
        {children}
      </span>

      {/* Magnetic Embedded Icon */}
      <motion.div 
        style={{ x: smoothX, y: smoothY }}
        className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 z-10 shadow-[0_4px_12px_rgba(0,0,0,0.2)] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:scale-[1.08] ${circleBg}`}
      >
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300 mix-blend-overlay" />
        
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          {typeof icon === "string" ? (
            <motion.span 
              className="material-symbols-outlined text-[18px]" 
              style={{ fontVariationSettings: "'wght' 600" }}
              animate={{ rotate: 0 }}
              whileHover={{ rotate: 12 }}
              transition={{ type: "spring", stiffness: 350, damping: 15 }}
            >
              {icon}
            </motion.span>
          ) : (
            icon
          )}
        </div>
      </motion.div>
    </motion.button>
  );
}
