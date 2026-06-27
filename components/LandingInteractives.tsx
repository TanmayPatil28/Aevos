"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { Play, Pause, Cpu, ShieldCheck, Briefcase, RefreshCw } from "lucide-react";

// ─── HIGH-FIDELITY DOM MOCKUPS ──────────────────────────────────────────

export function SidebarMockup() {
  return (
    <div className="w-64 border-r border-white/20 bg-[#0A0A0A] p-6 flex flex-col gap-8 flex-shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-blue-500" />
        <span className="text-white font-semibold text-lg tracking-tight">Aevos</span>
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

export function TopbarMockup() {
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

export function AcademicDashboardMockup() {
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

export function CareerDashboardMockup() {
  return (
    <div className="flex w-full h-full bg-black rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl font-sans">
      <div className="w-64 border-r border-white/20 bg-[#050505] p-6 flex flex-col gap-8 flex-shrink-0">
         <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-blue-500" />
          <span className="text-white font-semibold text-lg tracking-tight">Aevos</span>
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
export function HighlightsCarousel() {
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
export function OSMorphingSequence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const smoothProgress = useSpring(scrollYProgress, { damping: 20, stiffness: 50 });

  const scale = useTransform(smoothProgress, [0, 0.3, 0.6], [1, 0.9, 1]);
  const academicOpacity = useTransform(smoothProgress, [0.3, 0.5], [1, 0]);
  const careerOpacity = useTransform(smoothProgress, [0.4, 0.6], [0, 1]);
  const textY = useTransform(smoothProgress, [0, 0.5, 1], [0, -100, -200]);

  return (
    <section ref={containerRef} className="h-[400vh] bg-black">
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        
        <motion.div style={{ y: textY }} className="absolute top-20 text-center z-20 px-6">
           <h2 className="text-5xl md:text-7xl font-semibold text-white tracking-tight">The ultimate shapeshifter.</h2>
           <p className="text-2xl text-[#86868B] mt-4 font-medium max-w-2xl mx-auto">Aevos natively morphs between Academic and Career modes, ensuring you only see the tools you need.</p>
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

// ─── SCROLLING TEXT REVEAL ────────────────────────────────────────────────
export function TextReveal({ text, subtext }: { text: string; subtext: React.ReactNode }) {
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
      >
        {subtext}
      </motion.p>
    </div>
  );
}

// ─── REUSABLE MINI PILL CAROUSEL FOR DEEP DIVES ───────────────────────────
export function DeepDivePills({ items }: { items: { title: string, desc: string }[] }) {
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
