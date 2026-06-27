"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useVelocity, AnimatePresence } from "framer-motion";

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [clicks, setClicks] = useState<{ id: number; x: number; y: number }[]>([]);

  // Mouse Position & State (Renderless)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const hoverValue = useMotionValue(0); // 0 = default, 1 = hovering

  // Velocity for stretching
  const xVelocity = useVelocity(mouseX);
  const yVelocity = useVelocity(mouseY);
  
  const velocity = useTransform([xVelocity, yVelocity], ([x, y]) => 
    Math.sqrt(Math.pow(Number(x), 2) + Math.pow(Number(y), 2))
  );

  const stretchScale = useTransform(velocity, [0, 3000], [1, 1.6]);
  const angle = useTransform([xVelocity, yVelocity], ([vx, vy]) => 
    Math.atan2(Number(vy), Number(vx)) * (180 / Math.PI)
  );

  // Dynamic Styles (Renderless)
  const ringScale = useTransform(hoverValue, [0, 1], [1, 1.625]); // 40px base -> 65px hover via scale
  const ringBorderColor = useTransform(hoverValue, [0, 1], ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.25)"]);
  const ringBgColor = useTransform(hoverValue, [0, 1], ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.05)"]);
  const dotScale = useTransform(hoverValue, [0, 1], [1, 1.5]);

  // Ultra-fast, zero-inertia spring for buttery smooth, immediate tracking
  const springConfig = { stiffness: 1500, damping: 50, mass: 0.1 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches || "ontouchstart" in window;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isMobile || reduceMotion) return;

    setIsVisible(true);

    let moveRafId: number;
    let hoverRafId: number;

    const moveCursor = (e: MouseEvent) => {
      cancelAnimationFrame(moveRafId);
      moveRafId = requestAnimationFrame(() => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      });
    };

    const handleMouseOver = (e: MouseEvent) => {
      cancelAnimationFrame(hoverRafId);
      hoverRafId = requestAnimationFrame(() => {
        const target = e.target as HTMLElement;
        // Optimized check: avoid deep DOM traversal by checking tag names and immediate classes first
        const isInteractive = 
          target.tagName === 'A' || target.tagName === 'BUTTON' || target.tagName === 'INPUT' || 
          target.tagName === 'SELECT' || target.tagName === 'TEXTAREA' || 
          target.getAttribute('role') === 'button' ||
          target.classList.contains('glass-card') ||
          !!target.closest("a, button, [role='button'], .glass-card");

        if (isInteractive) {
          hoverValue.set(1);
        } else {
          hoverValue.set(0);
        }
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      setClicks(prev => [...prev.slice(-2), { id: Date.now(), x: e.clientX, y: e.clientY }]);
    };

    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    window.addEventListener("mousemove", moveCursor, { passive: true });
    window.addEventListener("mouseover", handleMouseOver, { passive: true });
    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(moveRafId);
      cancelAnimationFrame(hoverRafId);
      clearTimeout(scrollTimeout);
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [mouseX, mouseY, hoverValue]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden">
      <AnimatePresence>
        {clicks.map(click => (
          <motion.div
            key={click.id}
            initial={{ opacity: 0.5, scale: 0 }}
            animate={{ opacity: 0, scale: 3.5 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute rounded-full border-2 border-primary/50"
            style={{ left: click.x - 10, top: click.y - 10, width: 20, height: 20, willChange: "transform, opacity" }}
          />
        ))}
      </AnimatePresence>

      {/* 3-Layer iOS 27 Liquid Glass System */}
      <motion.div
        className="absolute top-0 left-0 rounded-full pointer-events-none z-[9999]"
        animate={{ opacity: isScrolling ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
          scale: ringScale,
          width: 48,
          height: 48,
          willChange: "transform",
          boxShadow: "0px 8px 12px rgba(0, 0, 0, 0.15)", // Using box-shadow instead of filter: drop-shadow stops the GPU flicker
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
      >
        {/* Layer 1: Lens (Refraction) */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            backdropFilter: "blur(1.5px) saturate(150%) brightness(115%) contrast(110%)",
            WebkitBackdropFilter: "blur(1.5px) saturate(150%) brightness(115%) contrast(110%)",
            background: "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.05) 40%, rgba(0, 0, 0, 0.05) 100%)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        />
        
        {/* Layer 2: Shine (Volume & Specular Highlights) */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: "inset 0px 2px 4px 0px rgba(255, 255, 255, 0.9), inset 0px -2px 6px 0px rgba(0, 0, 0, 0.3), inset 4px 4px 10px 0px rgba(255, 255, 255, 0.4)",
          }}
        />
      </motion.div>

      {/* Layer 3: Legibility Dot */}
      <motion.div
        className="absolute top-0 left-0 rounded-full bg-white pointer-events-none z-[10000] mix-blend-exclusion"
        animate={{ opacity: isScrolling ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
          scale: dotScale,
          width: 6,
          height: 6,
          willChange: "transform",
        }}
      />
    </div>
  );
}
