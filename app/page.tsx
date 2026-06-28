import Link from "next/link";
import { Database, Calendar, ShieldCheck, Cpu, Code2, LineChart } from "lucide-react";
import { AevosLogo } from "@/components/ui/AevosLogo";
import { AevosWordmark } from "@/components/ui/AevosWordmark";
import { 
  HighlightsCarousel, 
  OSMorphingSequence, 
  TextReveal, 
  DeepDivePills,
  AcademicDashboardMockup
} from "@/components/LandingInteractives";

function HeroSection() {
  return (
    <section className="relative min-h-[140vh] bg-black pt-32 pb-20 overflow-hidden flex flex-col items-center">
      <div className="text-center z-20 px-6 relative mb-16">
        <h1 className="text-[6rem] md:text-[10rem] lg:text-[12rem] text-[#F5F5F7] tracking-tighter leading-[0.9] mb-6 flex justify-center w-full">
          <AevosWordmark />
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

function Footer() {
  return (
    <footer className="bg-[#050505] py-20 px-6 text-sm text-[#86868B] font-medium">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <AevosWordmark className="text-[20px] text-white" />
        <div className="flex gap-8">
          <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
          <span className="hover:text-white cursor-pointer transition-colors">Documentation</span>
        </div>
        <div className="text-lg">Copyright © 2026 Aevos. All rights reserved.</div>
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
        subtext={<>Our most advanced intelligence engine ever built. <strong className="text-white">Giving you the exact target SGPA you need with zero guesswork.</strong></>}
      />
      
      <IntelligenceBento />

      <TextReveal 
        text="Bunk safely. Clear backlogs." 
        subtext={<>The absolute safety net. <strong className="text-white">The Attendance Engine tracks your exact safe bunks before detention limits hit.</strong> You will never fail due to bad planning again.</>} 
      />

      <DeepDivePills items={[
        { title: "Risk Heatmap", desc: "Instantly see which courses are in the CRITICAL or WARNING zones based on attendance thresholds." },
        { title: "Bunk Scheduler", desc: "Plan a trip. See exactly how taking 4 days off will impact the safety threshold of every enrolled course." },
        { title: "Backlog Analysis", desc: "See the exact negative drag a failed course has on your CGPA, and how much it will improve once cleared." }
      ]} />

      <TextReveal 
        text="Beyond grades. True readiness." 
        subtext={<>A revolutionary dual-engine. <strong className="text-white">The Placement Predictor filters FAANG targets against your live academic standing.</strong> We turn good students into top-tier hires.</>} 
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
    <div className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-xl border-b border-white/20">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        <AevosWordmark className="text-[17px] text-white" />
        <div className="flex items-center gap-5">
          <Link href="/auth" className="bg-white text-black px-6 py-2 rounded-full text-sm font-semibold hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}
