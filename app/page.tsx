"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Play, Pause, ChevronRight, Zap, Target, Briefcase, RefreshCw, Cpu, Activity, Clock, ShieldCheck, Database, Calendar, GraduationCap, Building, Code2, LineChart, FileText } from "lucide-react";

// ─── HIGH-FIDELITY DOM MOCKUPS ──────────────────────────────────────────

function SidebarMockup() {
  return (
    <div className="w-64 border-r border-white/20 bg-[#0A0A0A] p-6 flex flex-col gap-8 flex-shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-blue-500" />
        <span className="text-white font-semibold text-lg tracking-tight">GradeFlow</span>
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-xs font-bold text-[#86868B] uppercase tracking-wider mb-2">Academic</div>
        {["Dashboard", "Calculator", "Planner", "Attendance", "Backlog"].map(i => (
          <div key={i} className={`px-3 py-2 rounded-lg text-sm font-medium ${i === "Dashboard" ? "bg-white/10 text-white" : "text-[#86868B]"}`}>{i}</div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-xs font-bold text-[#86868B] uppercase tracking-wider mb-2">Career</div>
        {["Placement Predictor", "Skill Roadmap", "Identity"].map(i => (
          <div key={i} className="px-3 py-2 rounded-lg text-sm font-medium text-[#86868B]">{i}</div>
        ))}
      </div>
    </div>
  );
}

function TopbarMockup() {
  return (
    <div className="h-16 border-b border-white/20 bg-[#0A0A0A]/80 backdrop-blur flex items-center justify-between px-8 flex-shrink-0">
      <div className="bg-[#1D1D1F] px-4 py-1.5 rounded-full text-xs font-semibold text-white flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500" /> All systems operational
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm font-medium text-white px-3 py-1 bg-white/5 rounded-lg border border-white/10">Academic Mode</div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400" />
      </div>
    </div>
  );
}

function AcademicDashboardMockup() {
  return (
    <div className="flex w-full h-full bg-black rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl font-sans">
      <SidebarMockup />
      <div className="flex-1 flex flex-col min-w-0 bg-[#000]">
        <TopbarMockup />
        <div className="p-8 flex-1 overflow-hidden flex flex-col gap-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-semibold text-white tracking-tight">Overview</h2>
              <p className="text-[#86868B] mt-1">Semester 6 is looking strong.</p>
            </div>
            <button className="bg-white text-black px-4 py-2 rounded-lg font-semibold text-sm">Download Report</button>
          </div>
          <div className="flex gap-6">
            <div className="flex-1 bg-[#111] border border-white/5 p-6 rounded-2xl">
              <div className="text-[#86868B] text-sm font-medium mb-2">Current CGPA</div>
              <div className="text-5xl font-semibold text-white tracking-tighter">8.42</div>
              <div className="text-emerald-400 text-sm font-medium mt-2">+0.12 from last semester</div>
            </div>
            <div className="flex-1 bg-[#111] border border-white/5 p-6 rounded-2xl">
              <div className="text-[#86868B] text-sm font-medium mb-2">Health Score</div>
              <div className="text-5xl font-semibold text-white tracking-tighter">92<span className="text-2xl text-[#86868B]">/100</span></div>
              <div className="text-emerald-400 text-sm font-medium mt-2">Optimal Standing</div>
            </div>
            <div className="flex-1 bg-[#111] border border-white/5 p-6 rounded-2xl">
              <div className="text-[#86868B] text-sm font-medium mb-2">Active Backlogs</div>
              <div className="text-5xl font-semibold text-white tracking-tighter">0</div>
              <div className="text-[#86868B] text-sm font-medium mt-2">All clear</div>
            </div>
          </div>
          <div className="flex-1 bg-[#111] border border-white/5 rounded-2xl p-6 flex flex-col">
             <div className="text-white font-semibold mb-6">Subject Risk Heatmap</div>
             <div className="flex-1 flex gap-2 items-end">
               {[85, 92, 76, 98, 88, 65].map((h, i) => (
                 <div key={i} className="flex-1 flex flex-col items-center gap-2">
                   <div className={`w-full rounded-t-md transition-all ${h < 75 ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ height: `${h}%` }} />
                   <div className="text-xs text-[#86868B] font-mono">SUB{i+1}</div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CareerDashboardMockup() {
  return (
    <div className="flex w-full h-full bg-black rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl font-sans">
      <div className="w-64 border-r border-white/20 bg-[#050505] p-6 flex flex-col gap-8 flex-shrink-0">
         <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-blue-500" />
          <span className="text-white font-semibold text-lg tracking-tight">GradeFlow</span>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-xs font-bold text-[#86868B] uppercase tracking-wider mb-2">Career Tools</div>
          {["Placement Matrix", "Skill Detector", "Roadmaps", "Resume Engine"].map(i => (
            <div key={i} className={`px-3 py-2 rounded-lg text-sm font-medium ${i === "Placement Matrix" ? "bg-white/10 text-white" : "text-[#86868B]"}`}>{i}</div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0 bg-[#000]">
        <TopbarMockup />
        <div className="p-8 flex-1 overflow-hidden flex flex-col gap-6">
           <div>
              <h2 className="text-3xl font-semibold text-white tracking-tight">Placement Predictor</h2>
              <p className="text-[#86868B] mt-1">Live matching against Tier-1 companies.</p>
           </div>
           <div className="grid grid-cols-2 gap-6 flex-1">
             <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-black font-black text-2xl">G</div>
                   <div>
                     <div className="text-white font-semibold text-lg">Google</div>
                     <div className="text-emerald-400 text-sm">Highly Eligible</div>
                   </div>
                </div>
                <div className="space-y-4">
                   <div className="flex justify-between text-sm"><span className="text-[#86868B]">Req. CGPA</span><span className="text-white">8.0+ (You: 8.42)</span></div>
                   <div className="flex justify-between text-sm"><span className="text-[#86868B]">Req. Skills</span><span className="text-white">React, Node, DSA</span></div>
                   <div className="flex justify-between text-sm"><span className="text-[#86868B]">Backlogs</span><span className="text-white">0 active required</span></div>
                </div>
             </div>
             <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 bg-[#FF9900] rounded-xl flex items-center justify-center text-black font-black text-xl">AWS</div>
                   <div>
                     <div className="text-white font-semibold text-lg">Amazon</div>
                     <div className="text-yellow-400 text-sm">Borderline</div>
                   </div>
                </div>
                <div className="space-y-4">
                   <div className="flex justify-between text-sm"><span className="text-[#86868B]">Req. CGPA</span><span className="text-white">8.5+ (You: 8.42)</span></div>
                   <div className="flex justify-between text-sm"><span className="text-[#86868B]">Req. Skills</span><span className="text-white">AWS, System Design</span></div>
                   <div className="flex justify-between text-sm"><span className="text-[#86868B]">Action</span><span className="text-white">Need +0.08 CGPA</span></div>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

// ─── APPLE PILL CAROUSEL (HIGHLIGHTS) ──────────────────────────────────────
function HighlightsCarousel() {
  const items = [
    { id: "intel", title: "Intelligence Engine", desc: "Calculate, plan, and forecast your exact CGPA trajectory with pinpoint precision.", color: "from-blue-600/40 to-black", icon: <Cpu className="w-8 h-8 text-blue-400" /> },
    { id: "surv", title: "Survival OS", desc: "Never fail an attendance check again. Real-time bunk scheduling and backlog recovery.", color: "from-emerald-600/40 to-black", icon: <ShieldCheck className="w-8 h-8 text-emerald-400" /> },
    { id: "career", title: "Career OS", desc: "Instantly see which FAANG companies you're eligible for, and close your skill gaps.", color: "from-purple-600/40 to-black", icon: <Briefcase className="w-8 h-8 text-purple-400" /> },
    { id: "sync", title: "Cloud Sync Engine", desc: "Offline-first architecture. Edit anywhere, syncs automatically when you go online.", color: "from-orange-600/40 to-black", icon: <RefreshCw className="w-8 h-8 text-orange-400" /> }
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPlaying, items.length]);

  return (
    <section className="py-32 bg-black overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto px-6 mb-16">
        <h2 className="text-5xl md:text-7xl font-semibold text-white tracking-tight">Get the highlights.</h2>
      </div>

      <div className="flex justify-center mb-16 z-20 relative px-6">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center bg-[#1D1D1F]/80 backdrop-blur-xl rounded-full p-2 border border-white/10 shadow-2xl overflow-x-auto max-w-full">
            {items.map((item, i) => (
              <button
                key={item.id}
                onClick={() => { setActiveIndex(i); setIsPlaying(false); }}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${activeIndex === i ? "bg-white text-black" : "text-[#86868B] hover:text-white"}`}
              >
                {item.title}
              </button>
            ))}
          </div>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 rounded-full bg-[#1D1D1F]/80 backdrop-blur-xl flex items-center justify-center border border-white/10 text-white hover:bg-[#2D2D2F] transition-colors flex-shrink-0"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 relative h-[600px] md:h-[600px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute inset-0 mx-6 rounded-[2.5rem] bg-gradient-to-br ${items[activeIndex].color} border border-white/10 p-16 flex flex-col justify-between overflow-hidden shadow-2xl`}
          >
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] opacity-30 pointer-events-none" />
             <div className="relative z-10">
               {items[activeIndex].icon}
             </div>
             <div className="relative z-10 max-w-2xl">
                <h3 className="text-4xl md:text-6xl font-semibold text-white tracking-tight mb-6">{items[activeIndex].title}</h3>
                <p className="text-2xl text-white/70 font-medium leading-relaxed">{items[activeIndex].desc}</p>
             </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

// ─── MASSIVE OS MORPHING SEQUENCE (400vh) ─────────────────────────────────
function OSMorphingSequence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const smoothProgress = useSpring(scrollYProgress, { damping: 20, stiffness: 50 });

  // 0.0 - 0.3: Academic Mode scales down slightly
  // 0.3 - 0.6: Morphs to Career Mode
  // 0.6 - 1.0: Locked Career Mode

  const scale = useTransform(smoothProgress, [0, 0.3, 0.6], [1, 0.9, 1]);
  const academicOpacity = useTransform(smoothProgress, [0.3, 0.5], [1, 0]);
  const careerOpacity = useTransform(smoothProgress, [0.4, 0.6], [0, 1]);
  
  // Parallax Text
  const textY = useTransform(smoothProgress, [0, 0.5, 1], [0, -100, -200]);

  return (
    <section ref={containerRef} className="h-[400vh] bg-black">
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        
        <motion.div style={{ y: textY }} className="absolute top-20 text-center z-20 px-6">
           <h2 className="text-5xl md:text-7xl font-semibold text-white tracking-tight">The ultimate shapeshifter.</h2>
           <p className="text-2xl text-[#86868B] mt-4 font-medium max-w-2xl mx-auto">GradeFlow natively morphs between Academic and Career modes, ensuring you only see the tools you need.</p>
        </motion.div>

        <motion.div style={{ scale }} className="relative w-full max-w-[1400px] aspect-[16/9] mt-32 px-6">
           <motion.div style={{ opacity: academicOpacity }} className="absolute inset-0 px-6 pointer-events-none">
              <AcademicDashboardMockup />
           </motion.div>
           <motion.div style={{ opacity: careerOpacity }} className="absolute inset-0 px-6 pointer-events-none">
              <CareerDashboardMockup />
           </motion.div>
        </motion.div>

      </div>
    </section>
  );
}

// ─── HERO REVEAL ───────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative min-h-[140vh] bg-black pt-32 pb-20 overflow-hidden flex flex-col items-center">
      <div className="text-center z-20 px-6 relative mb-16">
        <h1 className="text-[6rem] md:text-[10rem] lg:text-[12rem] font-semibold text-[#F5F5F7] tracking-tighter leading-[0.9] mb-6">
          GradeFlow OS
        </h1>
        <p className="text-3xl md:text-5xl text-[#86868B] font-medium tracking-tight">
          Mind-blowing intelligence. Head-turning results.
        </p>
      </div>

      <div className="relative z-10 w-full max-w-[1600px] px-6">
         <div className="w-full aspect-[16/9] shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10 rounded-[2rem] overflow-hidden">
            <AcademicDashboardMockup />
         </div>
      </div>
    </section>
  );
}

// ─── SCROLLING TEXT REVEAL ────────────────────────────────────────────────
function TextReveal({ text, subtext }: { text: string; subtext: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "center center"] });
  const bgPosition = useTransform(scrollYProgress, [0, 1], ["0% 100%", "0% 0%"]);

  return (
    <div ref={ref} className="text-center py-40 px-6 bg-black">
      <motion.h2
        style={{ backgroundPosition: bgPosition }}
        className="text-[5rem] md:text-[8rem] lg:text-[10rem] font-semibold tracking-tighter leading-[1.05] bg-[linear-gradient(to_bottom,white_0%,#86868B_50%,transparent_100%)] bg-[length:100%_200%] text-transparent bg-clip-text mb-8"
      >
        {text}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1 }}
        className="text-[#86868B] text-2xl md:text-4xl font-medium max-w-5xl mx-auto tracking-tight leading-snug"
        dangerouslySetInnerHTML={{ __html: subtext }}
      />
    </div>
  );
}

// ─── MASSIVE BENTO GRIDS ──────────────────────────────────────────────────
function IntelligenceBento() {
  return (
    <section className="bg-black pb-40 px-6">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 auto-rows-[600px]">
        {/* Calculator */}
        <div className="md:col-span-8 rounded-[3rem] bg-[#0A0A0A] border border-white/10 p-16 flex flex-col justify-between overflow-hidden relative shadow-2xl">
          <div className="relative z-10 max-w-2xl">
             <h3 className="text-5xl font-semibold text-white tracking-tight mb-6">CGPA Calculator</h3>
             <p className="text-[#86868B] text-2xl font-medium">Toggle between the Active Simulator using your real enrolled courses and the Manual Sandbox for rapid what-if testing.</p>
          </div>
          {/* Detailed DOM Mockup inside the Bento */}
          <div className="absolute bottom-[-10%] right-[-5%] w-3/4 h-3/4 bg-[#111] rounded-[2rem] border border-white/10 p-8 shadow-2xl flex flex-col gap-6">
             <div className="flex items-center justify-between">
                <div className="text-white font-semibold text-xl">Semester 6 Simulation</div>
                <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded text-sm font-semibold">Active Mode</div>
             </div>
             <div className="space-y-4">
               {[
                 { name: "Compiler Design", cred: 4, grade: "A (9.0)" },
                 { name: "Machine Learning", cred: 4, grade: "S (10.0)" },
                 { name: "Web Tech", cred: 3, grade: "B (8.0)" }
               ].map((c, i) => (
                 <div key={i} className="flex justify-between items-center bg-white/5 border border-white/5 p-4 rounded-xl">
                   <div className="text-white font-medium">{c.name} <span className="text-[#86868B] text-sm ml-2">{c.cred} credits</span></div>
                   <div className="text-emerald-400 font-bold">{c.grade}</div>
                 </div>
               ))}
             </div>
          </div>
        </div>
        {/* Forecast */}
        <div className="md:col-span-4 rounded-[3rem] bg-[#0A0A0A] border border-white/10 p-16 flex flex-col justify-between shadow-2xl">
          <div>
            <h3 className="text-5xl font-semibold text-white tracking-tight mb-6">AI Forecast</h3>
            <p className="text-[#86868B] text-2xl font-medium">Multi-scenario trajectory projection.</p>
          </div>
          <div className="w-full h-64 flex items-end gap-3 border-b border-white/20 pb-4 relative">
             <div className="absolute top-10 left-0 right-0 border-t border-dashed border-emerald-500/50" />
             <div className="absolute top-4 right-0 text-emerald-400 text-sm font-semibold">Target: 9.0</div>
            {[6.5, 7.2, 7.8, 8.4, 8.8, 9.2, 9.5].map((v, i) => (
               <div key={i} className="flex-1 bg-gradient-to-t from-blue-500/50 to-blue-400/10 rounded-t border-t border-blue-400" style={{ height: `${(v/10)*100}%` }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SpecsBento() {
  return (
    <section className="bg-black py-40 px-6 border-t border-white/20">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="text-5xl md:text-7xl font-semibold text-white tracking-tight mb-20 text-center">Engineered for dominance.</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Database className="w-10 h-10" />, title: "Offline-First Sync", desc: "IndexedDB local cache. Works without internet. Syncs when back online.", color: "text-emerald-400" },
            { icon: <Calendar className="w-10 h-10" />, title: "Academic Calendar", desc: "Track exams, holidays, and fests natively.", color: "text-orange-400" },
            { icon: <ShieldCheck className="w-10 h-10" />, title: "University Presets", desc: "Built-in grading algorithms for SPPU, VTU, JNTUH, and more.", color: "text-teal-400" },
            { icon: <Cpu className="w-10 h-10" />, title: "Full Explainability", desc: "TraceCards and Regulation Citations provide 100% transparency.", color: "text-indigo-400" },
            { icon: <Code2 className="w-10 h-10" />, title: "PWA Native", desc: "Installable as a native app on iOS and Android. Zero App Store required.", color: "text-pink-400" },
            { icon: <LineChart className="w-10 h-10" />, title: "Real-time Metrics", desc: "Instantly re-calculates 40+ academic health metrics on every edit.", color: "text-blue-400" }
          ].map(spec => (
            <div key={spec.title} className="rounded-[2.5rem] bg-[#0A0A0A] p-12 flex flex-col gap-6 border border-white/5 shadow-xl">
              <div className={`${spec.color}`}>{spec.icon}</div>
              <h3 className="text-3xl font-semibold text-white tracking-tight">{spec.title}</h3>
              <p className="text-[#86868B] text-lg font-medium leading-relaxed">{spec.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── REUSABLE MINI PILL CAROUSEL FOR DEEP DIVES ───────────────────────────
function DeepDivePills({ items }: { items: { title: string, desc: string }[] }) {
  const [active, setActive] = useState(0);
  return (
    <div className="py-24 bg-black flex flex-col items-center text-center px-6 border-b border-white/20">
       <div className="h-40 max-w-4xl mb-12">
         <AnimatePresence mode="wait">
           <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
             <h3 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-6">{items[active].title}</h3>
             <p className="text-2xl text-[#86868B] font-medium leading-snug">{items[active].desc}</p>
           </motion.div>
         </AnimatePresence>
       </div>
       <div className="flex flex-wrap justify-center bg-[#1D1D1F] rounded-full p-2 border border-white/10">
         {items.map((it, i) => (
           <button 
             key={i} 
             onClick={() => setActive(i)} 
             className={`px-8 py-4 rounded-full text-lg font-semibold transition-colors ${active === i ? "bg-white text-black shadow-lg" : "text-[#86868B] hover:text-white"}`}
           >
             {it.title.split(" ")[0]}
           </button>
         ))}
       </div>
    </div>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[#050505] py-20 px-6 text-sm text-[#86868B] font-medium">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
            <span className="text-xs font-black text-white">GF</span>
          </div>
          <span className="font-semibold text-white text-lg tracking-tight">GradeFlow OS</span>
        </div>
        <div className="flex gap-8">
          <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
          <span className="hover:text-white cursor-pointer transition-colors">Documentation</span>
        </div>
        <div className="text-lg">Copyright © 2026 GradeFlow OS. All rights reserved.</div>
      </div>
    </footer>
  );
}

// ─── MAIN ASSEMBLED PAGE ──────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="bg-black min-h-screen font-sans selection:bg-purple-500/30">
      <LocalNav />
      
      <HeroSection />
      
      <HighlightsCarousel />
      
      <OSMorphingSequence />

      <TextReveal 
        text="Calculate. Forecast. Dominate." 
        subtext="Our most advanced intelligence engine ever built. <strong class='text-white'>Giving you the exact target SGPA you need with zero guesswork.</strong>" 
      />
      
      <IntelligenceBento />

      <TextReveal 
        text="Bunk safely. Clear backlogs." 
        subtext="The absolute safety net. <strong class='text-white'>The Attendance Engine tracks your exact safe bunks before detention limits hit.</strong> You will never fail due to bad planning again." 
      />

      <DeepDivePills items={[
        { title: "Risk Heatmap", desc: "Instantly see which courses are in the CRITICAL or WARNING zones based on attendance thresholds." },
        { title: "Bunk Scheduler", desc: "Plan a trip. See exactly how taking 4 days off will impact the safety threshold of every enrolled course." },
        { title: "Backlog Analysis", desc: "See the exact negative drag a failed course has on your CGPA, and how much it will improve once cleared." }
      ]} />

      <TextReveal 
        text="Beyond grades. True readiness." 
        subtext="A revolutionary dual-engine. <strong class='text-white'>The Placement Predictor filters FAANG targets against your live academic standing.</strong> We turn good students into top-tier hires." 
      />

      <DeepDivePills items={[
        { title: "Eligibility Matrix", desc: "A live ledger showing exactly which companies you can apply to right now, and which ones are borderline." },
        { title: "Skill Gap Detector", desc: "Compare your current skills against industry standard roadmaps (AI/ML, Full Stack, Backend)." },
        { title: "Profile Optimizers", desc: "AI-powered tools that rewrite your LinkedIn and audit your GitHub repository health for recruiters." }
      ]} />

      <SpecsBento />
      
      <Footer />
    </div>
  );
}

function LocalNav() {
  return (
    <div className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-3xl border-b border-white/20">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-white/90 font-semibold tracking-tight">GradeFlow OS</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/dashboard" className="bg-white text-black px-6 py-2 rounded-full text-sm font-semibold hover:bg-[#F5F5F7] transition-colors shadow-xl">
            Initialize Engine
          </Link>
        </div>
      </div>
    </div>
  );
}
