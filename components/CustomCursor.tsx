"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useVelocity, AnimatePresence } from "framer-motion";

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
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
  const ringSize = useTransform(hoverValue, [0, 1], [40, 65]);
  const ringBorderColor = useTransform(hoverValue, [0, 1], ["rgba(172, 199, 255, 0.4)", "rgba(214, 186, 255, 0.8)"]);
  const ringBgColor = useTransform(hoverValue, [0, 1], ["rgba(172, 199, 255, 0.05)", "rgba(214, 186, 255, 0.15)"]);
  const dotScale = useTransform(hoverValue, [0, 1], [1, 1.5]);

  // Spring smoothing for the ring
  const springX = useSpring(mouseX, { stiffness: 250, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 250, damping: 25 });

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
      setClicks(prev => [...prev.slice(-4), { id: Date.now(), x: e.clientX, y: e.clientY }]);
    };

    window.addEventListener("mousemove", moveCursor, { passive: true });
    window.addEventListener("mouseover", handleMouseOver, { passive: true });
    window.addEventListener("mousedown", handleMouseDown, { passive: true });

    return () => {
      cancelAnimationFrame(moveRafId);
      cancelAnimationFrame(hoverRafId);
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousedown", handleMouseDown);
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
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute rounded-full border-2 border-primary/50"
            style={{ left: click.x - 10, top: click.y - 10, width: 20, height: 20, willChange: "transform, opacity" }}
          />
        ))}
      </AnimatePresence>

      <motion.div
        className="cursor-ring"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
          scaleX: stretchScale,
          rotate: angle,
          width: ringSize,
          height: ringSize,
          borderColor: ringBorderColor,
          backgroundColor: ringBgColor,
          willChange: "transform, width, height",
          transform: "translateZ(0)",
        }}
      />

      <motion.div
        className="cursor-dot"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
          scale: dotScale,
          willChange: "transform",
          transform: "translateZ(0)",
        }}
      />
    </div>
  );
}
