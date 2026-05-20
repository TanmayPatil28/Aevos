"use client";

import Link from "next/link";
import { motion, useInView, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import { useRef, useEffect, useMemo, useState } from "react";
import AnimatedCounter from "@/components/AnimatedCounter";
import StaggerContainer, { StaggerItem } from "@/components/StaggerContainer";
import ThreeDProgress from "@/components/ThreeDProgress";
import { MAGNETIC_HOVER, SNAPPY_SPRING, FLOATING_SPRING } from "@/lib/animation-constants";
import PremiumButton from "@/components/PremiumButton";

// Floating Particles Component
function FloatingParticles() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const particles = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 15}s`,
    duration: `${15 + Math.random() * 15}s`,
    size: `${1.5 + Math.random() * 2.5}px`,
    opacity: 0.1 + Math.random() * 0.2,
  })), []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle bg-primary/20 blur-[1px]"
          style={{
            left: p.left,
            bottom: "-20px",
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
            opacity: p.opacity,
            borderRadius: "50%",
          }}
        />
      ))}
    </div>
  );
}

// Word-by-word stagger hero
function StaggerHeadline() {
  const words1 = ["Calculate"];
  const words2 = ["Plan"];
  const words3 = ["Score", "Higher."];

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.3 },
    },
  };

  const wordAnim = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.h1
      variants={container}
      initial="hidden"
      animate="visible"
      className="text-5xl md:text-7xl lg:text-8xl font-headline font-extrabold tracking-tighter text-on-surface mb-6 leading-[1.1]"
    >
      {words1.map((w, i) => (
        <motion.span key={i} variants={wordAnim} className="inline-block mr-[0.3em]">{w}</motion.span>
      ))}
      <motion.span variants={wordAnim} className="inline-block text-gradient mr-[0.3em]">Smarter.</motion.span>
      <br />
      {words2.map((w, i) => (
        <motion.span key={i} variants={wordAnim} className="inline-block mr-[0.3em]">{w}</motion.span>
      ))}
      <motion.span variants={wordAnim} className="inline-block text-gradient mr-[0.3em]">Better.</motion.span>
      {" "}
      {words3.map((w, i) => (
        <motion.span key={i} variants={wordAnim} className="inline-block mr-[0.3em]">{w}</motion.span>
      ))}
    </motion.h1>
  );
}

export default function Home() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const howItWorksInView = useInView(howItWorksRef, { once: true, margin: "-100px" });

  // Pre-compute transformed values at the top level (Rules of Hooks)
  const dotGridTranslateX = useTransform(mouseX, [-1, 1], [-12, 12]);
  const dotGridTranslateY = useTransform(mouseY, [-1, 1], [-12, 12]);
  const sphereTranslateX = useTransform(mouseX, [-1, 1], [-20, 20]);
  const sphereTranslateY = useTransform(mouseY, [-1, 1], [-20, 20]);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 2);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [mouseX, mouseY]);

  return (
    <main className="relative pt-20">
      {/* Page-Specific Hero Accents (Subtle) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
        <motion.div
          className="dot-grid absolute inset-0"
          style={{ 
            translateX: dotGridTranslateX,
            translateY: dotGridTranslateY,
          }}
        />
        <FloatingParticles />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative z-10 px-6 pt-24 pb-32 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full glass-card border border-outline-variant scale-90 md:scale-100 mb-10 group hover:-translate-y-1 transition-all duration-300"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_12px_var(--primary)] group-hover:animate-ping" />
          <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-on-surface-variant font-body">Trusted by 500+ Engineering Students</span>
        </motion.div>

        <StaggerHeadline />

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Track your CGPA, plan your semesters, and hit your target score — all in one celestial dashboard designed for high-achieving B.Tech students.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12"
        >
          <Link href="/calculator">
            <PremiumButton variant="expand" icon="arrow_forward" className="w-full sm:w-auto">
              Calculate My CGPA
            </PremiumButton>
          </Link>
          <Link href="#how-it-works">
            <PremiumButton variant="primary" className="w-full sm:w-auto group">
              See How It Works
            </PremiumButton>
          </Link>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <StaggerContainer staggerDelay={0.15} className="relative z-10 px-6 mb-32 max-w-5xl mx-auto">
        <StaggerItem>
          <div className="glass-card rounded-2xl border border-outline-variant/10 p-1 bg-surface-container-low/40">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1 divide-y md:divide-y-0 md:divide-x divide-outline-variant/10">
              <div className="py-8 px-12 text-center">
                <div className="text-4xl font-headline font-extrabold text-on-surface mb-1">
                  <AnimatedCounter target={10000} prefix="" suffix="+" className="" />
                </div>
                <div className="text-sm font-label tracking-widest uppercase text-on-surface-variant opacity-60">Calculations</div>
              </div>
              <div className="py-8 px-12 text-center">
                <div className="text-4xl font-headline font-extrabold text-on-surface mb-1">
                  <AnimatedCounter target={500} suffix="+" className="" />
                </div>
                <div className="text-sm font-label tracking-widest uppercase text-on-surface-variant opacity-60">Active Students</div>
              </div>
              <div className="py-8 px-12 text-center">
                <div className="text-4xl font-headline font-extrabold text-on-surface mb-1">
                  <AnimatedCounter target={4.9} decimals={1} suffix="/5" className="" />
                </div>
                <div className="text-sm font-label tracking-widest uppercase text-on-surface-variant opacity-60">Rating</div>
              </div>
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* Features Bento Grid */}
      <StaggerContainer staggerDelay={0.08} className="relative z-10 px-6 mb-32 max-w-7xl mx-auto">
        <StaggerItem>
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-5xl font-headline font-bold text-on-surface mb-4">Master Your Academic Orbit</h2>
            <p className="text-on-surface-variant max-w-xl mx-auto">Powerful tools designed specifically for the rigorous B.Tech grading systems.</p>
          </div>
        </StaggerItem>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <CalculatorCard />
          <StaggerItem className="md:col-span-4 h-full">
            <motion.div 
              whileHover={MAGNETIC_HOVER}
              className="glass-card h-full rounded-[2rem] p-10 border border-outline-variant/15 flex flex-col justify-between group cursor-default"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-secondary-container/20 flex items-center justify-center mb-8 border border-secondary-container/30 group-hover:shadow-[0_0_20px_rgba(214,186,255,0.3)] transition-shadow duration-500">
                  <span className="material-symbols-outlined text-secondary text-3xl">event_note</span>
                </div>
                <h3 className="text-2xl font-headline font-bold text-on-surface mb-4">Semester Planner</h3>
                <p className="text-on-surface-variant leading-relaxed">
                  Set target CGPAs and map out the grades you need in each subject to maintain your scholarship or hit your goals.
                </p>
              </div>
              <div className="mt-8 flex justify-center py-2 h-44 items-center">
                <ThreeDProgress progress={75} size={150} />
              </div>
            </motion.div>
          </StaggerItem>

          <StaggerItem className="md:col-span-12">
            <motion.div 
              whileHover={MAGNETIC_HOVER}
              className="glass-card rounded-[2rem] p-10 border border-outline-variant/15 flex flex-col md:flex-row items-center gap-10 cursor-default"
            >
              <div className="md:w-1/2">
                <div className="w-14 h-14 rounded-2xl bg-surface-container-highest/20 flex items-center justify-center mb-8 border border-outline-variant/30 group-hover:shadow-[0_0_20px_rgba(172,199,255,0.2)] transition-shadow duration-500">
                  <span className="material-symbols-outlined text-on-surface text-3xl">analytics</span>
                </div>
                <h3 className="text-3xl font-headline font-bold text-on-surface mb-4">History &amp; Analytics</h3>
                <p className="text-on-surface-variant text-lg leading-relaxed">
                  Visualize your progress across all 8 semesters with interactive trend lines. See where you peaked and identify areas for optimization.
                </p>
              </div>
              <div className="md:w-1/2 w-full h-64 bg-surface-container-low/40 rounded-2xl border border-outline-variant/10 p-6 overflow-hidden relative">
                <div className="flex items-end justify-between h-full gap-3 pt-10">
                  {[40, 65, 55, 90].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ ...FLOATING_SPRING, delay: 0.2 + i * 0.15 }}
                      className="w-full rounded-t-lg relative group"
                      style={{
                        backgroundColor: `color-mix(in srgb, var(--primary) ${[20, 35, 55, 80][i]}%, transparent)`,
                        boxShadow: i === 3 ? '0 0 20px color-mix(in srgb, var(--primary) 30%, transparent)' : 'none',
                      }}
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold text-on-surface opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-surface-container px-2 py-0.5 rounded-md border border-outline-variant/20">
                        {[7.2, 8.1, 7.8, 9.5][i]}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </StaggerItem>
        </div>
      </StaggerContainer>

      {/* Animated Sphere (Background) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-20">
        <motion.div
          style={{
            translateX: sphereTranslateX,
            translateY: sphereTranslateY,
          }}
          className="w-full h-full bg-gradient-to-br from-primary-container/40 via-secondary-container/20 to-transparent rounded-full blur-[120px] animate-pulse"
        />
      </div>

      {/* How It Works */}
      <section id="how-it-works" ref={howItWorksRef} className="relative z-10 px-6 mb-32 max-w-7xl mx-auto py-20 bg-surface-container-lowest/30 rounded-[3rem]">
        <StaggerContainer className="text-center mb-20">
          <StaggerItem>
            <h2 className="text-3xl md:text-5xl font-headline font-bold text-on-surface">Three Steps to Clarity</h2>
          </StaggerItem>
        </StaggerContainer>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
          {/* Connecting lines */}
          <div className="hidden md:block absolute top-[40px] left-[18%] right-[18%] h-[2px] z-0">
            <div className="grid grid-cols-2 gap-24 h-full">
              <div>
                <div className={`h-full border-t-2 border-dashed border-outline-variant/30 ${howItWorksInView ? 'animate-draw-line' : 'w-0'}`} />
              </div>
              <div>
                <div className={`h-full border-t-2 border-dashed border-outline-variant/30 ${howItWorksInView ? 'animate-draw-line' : 'w-0'}`} style={{ animationDelay: '0.2s', animationFillMode: 'both' }} />
              </div>
            </div>
          </div>

          {[
            { num: 1, title: "Input Your Grades", desc: "Simple, intuitive forms to enter your credits and grades for each subject.", classes: "border-primary/30 text-primary shadow-[0_0_20px_rgba(172,199,255,0.2)]", delay: 0.2 },
            { num: 2, title: "Instant Processing", desc: "Our observatory engine calculates SGPA and CGPA in real-time with 100% accuracy.", classes: "border-secondary/30 text-secondary shadow-[0_0_20px_rgba(214,186,255,0.2)]", delay: 0.6 },
            { num: 3, title: "Plan Your Future", desc: "See projected results and set academic goals to stay ahead of the curve.", classes: "border-primary/30 text-primary shadow-[0_0_20px_rgba(172,199,255,0.2)]", delay: 1.0 },
          ].map((step) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: step.delay, type: "spring", stiffness: 200, damping: 15 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className={`w-20 h-20 rounded-full glass-card border flex items-center justify-center text-3xl font-headline font-black mb-8 ${step.classes} bg-surface-container-lowest/80 backdrop-blur-md`}>
                {step.num}
              </div>
              <h4 className="text-xl font-bold mb-4">{step.title}</h4>
              <p className="text-on-surface-variant max-w-[280px]">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <StaggerContainer className="relative z-10 px-6 mb-32 max-w-6xl mx-auto">
        <StellarCTA />
      </StaggerContainer>
    </main>
  );
}
function CalculatorCard() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateXRaw = useTransform(mouseY, [-0.5, 0.5], [5, -5]);
  const rotateYRaw = useTransform(mouseX, [-0.5, 0.5], [-5, 5]);
  const rotateX = useSpring(rotateXRaw, SNAPPY_SPRING);
  const rotateY = useSpring(rotateYRaw, SNAPPY_SPRING);

  const spotlightBg = useTransform(
    [mouseX, mouseY],
    ([x, y]) => `radial-gradient(600px circle at ${(Number(x) + 0.5) * 100}% ${(Number(y) + 0.5) * 100}%, var(--primary-container), transparent 40%)`
  );

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    mouseX.set((clientX - left) / width - 0.5);
    mouseY.set((clientY - top) / height - 0.5);
  }

  return (
    <StaggerItem className="md:col-span-8 h-full">
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
        style={{ rotateX, rotateY, perspective: 1000 }}
        className="glass-card h-full rounded-[2rem] p-10 border border-outline-variant/15 flex flex-col justify-between group hover:border-primary/30 transition-all duration-300 relative overflow-hidden"
      >
        {/* Intelligence Glow Spotlight */}
        <motion.div 
          className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100"
          style={{
            background: spotlightBg,
            opacity: 0.1
          }}
        />

        <div className="relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 border border-primary/20 group-hover:shadow-[0_0_20px_var(--primary-container)] transition-all duration-300">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>calculate</span>
          </div>
          <h3 className="text-3xl font-headline font-bold text-on-surface mb-4">Dynamic CGPA Calculator</h3>
          <p className="text-on-surface-variant text-lg max-w-md leading-relaxed mb-8">
            Input current grades or predict future scores with surgical precision and real-time feedback.
          </p>
        </div>

        {/* HUD Data Container */}
        <div className="relative z-10 w-full h-52 bg-surface-container-lowest/40 rounded-2xl overflow-hidden border border-outline-variant/10 p-8 flex flex-col justify-between backdrop-blur-sm group/hud">
          
          {/* Holographic Scanner Beam - Uses Theme Variable */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 bottom-0 w-[100px] bg-gradient-to-r from-transparent via-primary/20 to-transparent blur-xl animate-[scan-hologram_4s_ease-in-out_infinite]" />
          </div>

          {/* HUD Corners */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-primary/20 rounded-tl-sm group-hover/hud:border-primary group-hover/hud:scale-110 transition-all duration-300" />
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-primary/20 rounded-tr-sm group-hover/hud:border-primary group-hover/hud:scale-110 transition-all duration-300" />
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-primary/20 rounded-bl-sm group-hover/hud:border-primary group-hover/hud:scale-110 transition-all duration-300" />
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-primary/20 rounded-br-sm group-hover/hud:border-primary group-hover/hud:scale-110 transition-all duration-300" />

          {/* Data Content */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1.5 w-20 bg-primary/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} 
                  whileInView={{ width: '100%' }} 
                  transition={{ duration: 1.5, delay: 0.5 }} 
                  className="h-full bg-primary/40 shadow-[0_0_10px_var(--primary)]" 
                />
              </div>
              <div className="h-1 w-1 bg-primary/40 rounded-full animate-ping" />
              <div className="h-1.5 w-12 bg-surface-container-highest rounded-full transition-colors" />
            </div>

            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-between"
              >
                <div className="text-sm text-on-surface-variant font-label tracking-wide flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                   Engineering Math II
                </div>
                <div className="px-3 py-1 rounded-md bg-secondary-container/10 border border-secondary/20 text-secondary text-[10px] font-bold uppercase tracking-widest">Grade: A+</div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="flex items-center justify-between"
              >
                <div className="text-sm text-on-surface-variant font-label tracking-wide flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                  Data Structures
                </div>
                <div className="px-3 py-1 rounded-md bg-secondary-container/10 border border-secondary/20 text-secondary text-[10px] font-bold uppercase tracking-widest">Grade: O</div>
              </motion.div>
            </div>
          </div>

          <div className="flex justify-end items-end relative overflow-hidden">
             <div className="text-5xl font-headline font-black text-primary opacity-60 flex items-baseline gap-1 animate-[pulse-soft-glow_3s_ease-in-out_infinite]">
               9.42 <span className="text-sm font-label tracking-widest opacity-60">SGPA</span>
             </div>
          </div>
        </div>
      </motion.div>
    </StaggerItem>
  );
}
function StellarCTA() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // Hover spotlight for the entire CTA
  const spotlightStyle = useMotionTemplate`
    radial-gradient(800px circle at ${mouseX}px ${mouseY}px, color-mix(in srgb, var(--primary) 10%, transparent), transparent 80%)
  `;

  return (
    <StaggerItem className="w-full">
      <div 
        onMouseMove={handleMouseMove}
        className="relative overflow-hidden rounded-[3rem] border border-outline-variant/30 bg-black shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)] group"
      >
        {/* Deep AMOLED Background with Mesh Glares */}
        <div className="absolute inset-0 z-0 bg-surface-container-lowest" />
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
          <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] bg-primary/20 rounded-full blur-[100px] animate-[float-mesh-1_12s_ease-in-out_infinite]" />
          <div className="absolute -bottom-[40%] -right-[10%] w-[60%] h-[80%] bg-secondary/20 rounded-full blur-[120px] animate-[float-mesh-2_14s_ease-in-out_infinite]" style={{ animationDelay: '2s' }} />
        </div>

        {/* Dynamic Grid Background */}
        <div 
          className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
          }}
        />

        {/* Hover Spotlight */}
        <motion.div
          className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100"
          style={{ background: spotlightStyle }}
        />

        {/* Content Layout */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between p-8 md:p-16 lg:p-20 gap-16">
          
          {/* Left Text Content */}
          <div className="flex-1 max-w-xl text-center lg:text-left">
            {/* Holographic Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-card border border-primary/30 mb-10 shadow-[0_0_20px_color-mix(in_srgb,var(--primary)_20%,transparent)]"
            >
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
              </div>
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary drop-shadow-[0_0_8px_var(--primary)]">Sovereign Architecture</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-headline font-black text-white mb-6 tracking-tight leading-[1.05]"
            >
              Transcend Your {" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#b993fa] to-secondary drop-shadow-[0_0_30px_rgba(185,147,250,0.3)] animate-gradient-x">
                Trajectory
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-on-surface-variant/80 text-xl max-w-md mb-12 leading-relaxed font-light mx-auto lg:mx-0"
            >
              Experience the pinnacle of academic forecasting. Join <span className="text-white font-medium drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">Top 1%</span> engineering students optimizing their future.
            </motion.p>

            {/* Premium Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5"
            >
              <Link href="/calculator">
                <PremiumButton icon="arrow_forward" variant="primary" className="w-full sm:w-auto">
                  Initialize Engine
                </PremiumButton>
              </Link>
              <Link href="/planner">
                <PremiumButton icon="calendar_month" variant="outline" className="w-full sm:w-auto">
                  View Planner
                </PremiumButton>
              </Link>
            </motion.div>
          </div>

          {/* Right: The Fluid Trajectory Display */}
          <div className="flex-shrink-0 w-full lg:w-[500px] h-[400px] relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="w-full h-full glass-card rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.6)] inset-0 absolute overflow-hidden p-8 flex flex-col justify-between"
            >
              {/* Inner HUD Glow */}
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-secondary/20 blur-[60px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-primary/20 blur-[50px] rounded-full pointer-events-none" />

              {/* HUD Header */}
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 mb-2">Live Trajectory Projection</div>
                  <div className="text-5xl font-headline font-black text-white flex items-baseline gap-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    9.84 <span className="text-sm font-label tracking-wide text-primary">Target</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full border border-white/10 glass-card flex items-center justify-center animate-[spin_10s_linear_infinite]">
                  <span className="material-symbols-outlined text-white/70" style={{ fontVariationSettings: "'FILL' 1" }}>radar</span>
                </div>
              </div>

              {/* The Live Spline Graph */}
              <div className="relative w-full h-[180px] mt-auto">
                {/* Horizontal Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between opacity-10">
                   <div className="w-full h-px border-b border-dashed border-white" />
                   <div className="w-full h-px border-b border-dashed border-white" />
                   <div className="w-full h-px border-b border-dashed border-white" />
                   <div className="w-full h-px border-b border-dashed border-white" />
                </div>

                {/* SVG Curve */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 180" preserveAspectRatio="none">
                  {/* Glowing shadow path */}
                  <motion.path
                    d="M 0,160 C 100,160 150,110 200,90 C 280,60 320,30 400,20"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="12"
                    className="opacity-20 blur-[8px]"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                  />
                  {/* Actual trajectory line */}
                  <motion.path
                    d="M 0,160 C 100,160 150,110 200,90 C 280,60 320,30 400,20"
                    fill="none"
                    stroke="url(#gradient-line)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
                  />
                  {/* Gradient Definition */}
                  <defs>
                    <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.5" />
                      <stop offset="50%" stopColor="var(--secondary)" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#fff" stopOpacity="1" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Animated Data Nodes */}
                <motion.div 
                   className="absolute w-4 h-4 rounded-full bg-white shadow-[0_0_20px_#fff] border-[3px] border-black z-10"
                   style={{ left: '50%', top: '90px', transform: 'translate(-50%, -50%)' }}
                   initial={{ scale: 0, opacity: 0 }}
                   whileInView={{ scale: 1, opacity: 1 }}
                   viewport={{ once: true }}
                   transition={{ delay: 1.5, type: "spring" }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 glass-card border border-white/20 px-3 py-1 rounded-[8px] text-xs font-bold text-white whitespace-nowrap opacity-0 md:opacity-100">
                    Sem 4: 8.9
                  </div>
                </motion.div>

                <motion.div 
                   className="absolute w-5 h-5 rounded-full bg-white shadow-[0_0_30px_#fff] border-[4px] border-secondary z-10"
                   style={{ left: '100%', top: '20px', transform: 'translate(-50%, -50%)' }}
                   initial={{ scale: 0, opacity: 0 }}
                   whileInView={{ scale: 1, opacity: 1 }}
                   viewport={{ once: true }}
                   transition={{ delay: 2.2, type: "spring" }}
                >
                  {/* Pulse Ring */}
                  <div className="absolute inset-0 border border-white rounded-full animate-ping pointer-events-none" />
                </motion.div>
                
                {/* Fixed tooltip text so it doesn't scale strangely */}
                <motion.div
                  className="absolute z-20 bg-white text-black font-black px-4 py-1.5 rounded-[10px] text-sm whitespace-nowrap shadow-[0_10px_20px_color-mix(in_srgb,var(--secondary)_50%,transparent)]"
                  style={{ left: '100%', top: '-25px', transform: 'translate(-50%, 0)' }}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 2.4, type: "spring" }}
                >
                  Target: 9.8+
                </motion.div>
              </div>

              {/* Bottom Decorative Element */}
              <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </motion.div>

            {/* Orbiting Glass Rings for extra flair outside the glass card */}
            <motion.div 
              className="absolute top-1/2 left-1/2 w-[120%] h-[120%] border-[2px] border-white/5 rounded-full pointer-events-none z-[-1]"
              style={{ transform: 'translate(-50%, -50%) scale(1)' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 60, ease: "linear", repeat: Infinity }}
            >
               <div className="w-1.5 h-1.5 rounded-full bg-primary/50 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_var(--primary)]" />
               <div className="w-3 h-3 rounded-full bg-secondary/50 absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 shadow-[0_0_15px_var(--secondary)]" />
            </motion.div>
          </div>
        </div>
      </div>
    </StaggerItem>
  );
}


