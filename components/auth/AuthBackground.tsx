"use client";

import { motion } from "framer-motion";
import { AevosWordmark } from "@/components/ui/AevosWordmark";
import { useEffect, useRef } from "react";

export function AuthBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animationFrameId: number;

    const resize = () => {
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth || window.innerWidth;
        canvas.height = canvas.parentElement.clientHeight || 400;
      }
    };
    resize();
    window.addEventListener("resize", resize);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
    }

    const particles: Particle[] = [];
    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * (canvas.height || 400),
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        radius: Math.random() * 1.5 + 0.8,
        alpha: Math.random() * 0.3 + 0.1,
      });
    }

    const draw = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(157, 207, 202, ${p.alpha})`;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative hidden w-full flex-col bg-[#0a0a0c] lg:flex lg:w-1/2 overflow-hidden border-r border-white/[0.04]">
      {/* Subtle Background Elements */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 pointer-events-none mix-blend-screen"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[url('https://noise.npoint.io/noise.svg')] opacity-[0.03] mix-blend-overlay z-0"></div>

      <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white/90">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-center space-x-3"
        >
          <AevosWordmark className="text-[28px] text-white/90" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="max-w-md space-y-6"
        >
          <h1 
            className="text-[48px] lg:text-[56px] font-semibold leading-tight tracking-[-0.5px] z-10"
            style={{
              backgroundImage: "linear-gradient(180deg, #FFFFFF 0%, #A1A1A6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Orchestrate your academic success.
          </h1>
          <p className="text-base leading-[24px] text-foreground-muted mt-6 z-10">
            An intelligent ecosystem designed to synchronize your goals, predict your outcomes, and streamline your entire academic journey.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="flex items-center space-x-4 text-sm font-medium text-white/40"
        >
          <span>© {new Date().getFullYear()} Aevos Inc.</span>
          <span className="h-1 w-1 rounded-full bg-white/20"></span>
          <a href="#" className="hover:text-white/80 transition-colors">Privacy Policy</a>
          <span className="h-1 w-1 rounded-full bg-white/20"></span>
          <a href="#" className="hover:text-white/80 transition-colors">Terms of Service</a>
        </motion.div>
      </div>
    </div>
  );
}
