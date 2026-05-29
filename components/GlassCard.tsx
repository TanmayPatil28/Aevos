"use client";

import { cn } from "@/lib/cn";
import { HTMLMotionProps, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  interactive?: boolean;
}

export default function GlassCard({ children, className, interactive = true, ...props }: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Mouse tracking for Glint
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for Glint
  const glintX = useSpring(mouseX, { stiffness: 100, damping: 20 });
  const glintY = useSpring(mouseY, { stiffness: 100, damping: 20 });

  // Move useTransform to top level to comply with Rules of Hooks
  const glintBackground = useTransform(
    [glintX, glintY],
    ([x, y]) => `radial-gradient(400px circle at ${x}px ${y}px, rgba(255,255,255,0.06), transparent 80%)`
  );

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <motion.div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      whileHover={interactive ? { 
        y: -10, 
        scale: 1.01,
        transition: { type: "spring", stiffness: 400, damping: 25 } 
      } : {}}
      className={cn(
        "solid-card p-8 relative overflow-hidden transition-all duration-700 bg-[#1D1D1F] rounded-[24px] border border-white/5 group",
        className
      )} 
      {...props}
    >
      {/* 1. Physically-Correct Glint (follows mouse) */}
      {interactive && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: glintBackground,
          }}
        />
      )}

      {/* 2. Top-Edge Machined Highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
      
      {/* 3. Subtle Inner Gradient (Apple Depth) */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

      {/* 4. Content wrapper */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
