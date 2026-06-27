"use client";

import React, { useRef } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import { cn } from "@/lib/cn";

interface FluidGradientProps {
  colors?: string[];
  className?: string;
}

export function FluidGradient({ 
  colors = ["#10b981", "#059669", "#047857", "#064e3b"], 
  className 
}: FluidGradientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Motion values for mouse coordinates
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Springs for smooth following (parallax layers)
  const smoothX1 = useSpring(mouseX, { damping: 25, stiffness: 150, mass: 1 });
  const smoothY1 = useSpring(mouseY, { damping: 25, stiffness: 150, mass: 1 });

  const smoothX2 = useSpring(mouseX, { damping: 30, stiffness: 100, mass: 1.5 });
  const smoothY2 = useSpring(mouseY, { damping: 30, stiffness: 100, mass: 1.5 });

  const smoothX3 = useSpring(mouseX, { damping: 40, stiffness: 80, mass: 2 });
  const smoothY3 = useSpring(mouseY, { damping: 40, stiffness: 80, mass: 2 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalize to -0.5 to 0.5 relative to center
    const normX = (x / rect.width) - 0.5;
    const normY = (y / rect.height) - 0.5;

    // Movement amplitude in pixels
    mouseX.set(normX * 150); 
    mouseY.set(normY * 150);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const c1 = colors[0] || "#1a1a1a";
  const c2 = colors[1] || c1;
  const c3 = colors[2] || c2;
  const c4 = colors[3] || c3;

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("absolute inset-0 w-full h-full overflow-hidden bg-[#000]", className)}
    >
      {/* Heavy blur overlay to blend the circles into a continuous mesh */}
      <div className="absolute inset-0 z-10 backdrop-blur-[120px] pointer-events-none" />

      {/* Base ambient glow */}
      <motion.div 
        className="absolute inset-0 opacity-100"
        animate={{ backgroundColor: c1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />

      {/* Moving Orb 1 */}
      <motion.div
        className="absolute w-[120%] h-[120%] -top-[10%] -left-[10%] opacity-80 rounded-full mix-blend-screen"
        animate={{ backgroundColor: c2 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        style={{ 
          filter: "blur(100px)",
          x: smoothX1,
          y: smoothY1
        }}
      />

      {/* Moving Orb 2 */}
      <motion.div
        className="absolute w-[130%] h-[130%] -top-[15%] -left-[15%] opacity-70 rounded-full mix-blend-screen"
        animate={{ backgroundColor: c3 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        style={{ 
          filter: "blur(120px)",
          x: smoothX2,
          y: smoothY2
        }}
      />

      {/* Moving Orb 3 */}
      <motion.div
        className="absolute w-[150%] h-[150%] -top-[25%] -left-[25%] opacity-60 rounded-full mix-blend-screen"
        animate={{ backgroundColor: c4 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        style={{ 
          filter: "blur(140px)",
          x: smoothX3,
          y: smoothY3
        }}
      />
    </div>
  );
}
