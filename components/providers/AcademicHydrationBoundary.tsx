"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useUSMStore } from "@/stores/usmStore";
import { Skeleton } from "@/components/ui/Skeleton";
import { Sparkles, Lock, Fingerprint, Database, GraduationCap, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
const BOOT_SEQUENCE = [
  { text: "Establishing secure handshake...", icon: Lock, delay: 0 },
  { text: "Verifying user identity...", icon: Fingerprint, delay: 150 },
  { text: "Accessing GradeFlow vault...", icon: Database, delay: 300 },
  { text: "Synchronizing academic ledger...", icon: GraduationCap, delay: 450 },
  { text: "Validating statutory constraints...", icon: ShieldCheck, delay: 600 },
];

function BootSequence() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const intervals = BOOT_SEQUENCE.map((s, i) => 
      setTimeout(() => setStep(i), s.delay)
    );
    return () => intervals.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Absolute AMOLED black */}
      <div className="absolute inset-0 bg-black z-0" />
      
      {/* Subtle deep blue glow behind the core */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#4F8EF7]/10 rounded-full blur-[100px] pointer-events-none z-0" />
      
      <div className="relative z-10 flex flex-col items-center">
        
        {/* The Arc Reactor / Orbital Core */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-16">
           {/* Outer Ring */}
           <motion.div 
             animate={{ rotate: 360 }} 
             transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
             className="absolute w-full h-full rounded-full border border-white/5 border-t-[#4F8EF7]/50 border-r-[#4F8EF7]/20"
           />
           {/* Middle Ring */}
           <motion.div 
             animate={{ rotate: -360 }} 
             transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
             className="absolute w-48 h-48 rounded-full border border-white/5 border-b-[#4F8EF7]/80 border-l-[#4F8EF7]/30 shadow-[0_0_30px_rgba(79,142,247,0.2)]"
           />
           {/* Inner Pulse Core */}
           <motion.div 
             animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.5, 1, 0.5] }} 
             transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
             className="w-24 h-24 bg-[#0B0F19] border border-[#4F8EF7]/30 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(79,142,247,0.4)] relative overflow-hidden"
           >
              <div className="absolute inset-0 bg-gradient-to-br from-[#4F8EF7]/20 to-transparent" />
              <GraduationCap className="w-12 h-12 text-[#4F8EF7] relative z-10" />
           </motion.div>
        </div>

        {/* Terminal Boot Sequence */}
        <div className="w-[450px] bg-[#050505] border border-white/10 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
           {/* Scanline effect */}
           <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:100%_4px] pointer-events-none" />
           
           <div className="flex justify-between items-center mb-6 border-b border-white/20 pb-4 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4F8EF7] flex items-center gap-3">
                 <div className="w-2 h-2 bg-[#4F8EF7] rounded-full animate-pulse shadow-[0_0_10px_#4F8EF7]" />
                 GradeFlow OS
              </span>
              <span className="text-[10px] font-mono text-white/40">v2.0.4 // INIT</span>
           </div>

           <div className="space-y-4 font-mono text-xs h-[160px] relative z-10">
              <AnimatePresence>
                {BOOT_SEQUENCE.filter((_, i) => i <= step).map((s, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-start gap-3 ${i === step ? 'text-white' : 'text-white/40'}`}
                  >
                    <span className="text-[#4F8EF7] shrink-0 font-bold">{">"}</span>
                    <span className="flex-1 tracking-tight">{s.text}</span>
                    {i < step && <span className="text-emerald-500 font-bold shrink-0 shadow-emerald-500/50 drop-shadow-md">[OK]</span>}
                    {i === step && (
                       <motion.span 
                         animate={{ opacity: [1, 0] }} 
                         transition={{ repeat: Infinity, duration: 0.5 }}
                         className="w-1.5 h-3 bg-white inline-block ml-1 align-middle"
                       />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
           </div>
        </div>

      </div>
    </div>
  );
}

export function AcademicHydrationBoundary({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const store = useUSMStore();
  const [isHydrating, setIsHydrating] = useState(false);
  const [hasAttemptedHydration, setHasAttemptedHydration] = useState(false);

  useEffect(() => {
    // Only attempt hydration once per session when authenticated
    if (status === "authenticated" && !hasAttemptedHydration && !isHydrating) {
      const hydrateAcademics = async () => {
        setIsHydrating(true);
        try {
          // Fetch the canonical active snapshot for this user
          const response = await fetch("/api/academic/snapshots?activeOnly=true");
          
          if (response.ok) {
            const data = await response.json();
            if (data.snapshot) {
              // Valid snapshot found -> Hydrate the Unified Store strictly from DB
              store.hydrateFromSnapshot(data.snapshot);
              console.log("[Hydration Boundary] Successfully hydrated state from Active Snapshot:", data.snapshot.id);
            } else {
              // No snapshot found -> User must import data
              console.log("[Hydration Boundary] No active snapshot found. State remains empty.");
            }
          } else {
            console.warn("[Hydration Boundary] Failed to fetch active snapshot.", response.statusText);
          }
        } catch (error) {
          console.error("[Hydration Boundary] Error hydrating from database:", error);
        } finally {
          // Add a tiny artificial delay so the boot sequence feels deliberate
          setTimeout(() => {
            setHasAttemptedHydration(true);
            setIsHydrating(false);
          }, 200);
        }
      };

      hydrateAcademics();
    } else if (status === "unauthenticated") {
      setHasAttemptedHydration(true);
    }
  }, [status, hasAttemptedHydration, isHydrating, store]);

  // While checking auth status or actively fetching from the database
  if (status === "loading" || isHydrating || (!hasAttemptedHydration && status === "authenticated")) {
    return <BootSequence />;
  }

  // Once hydrated or confirmed empty, render the app
  return <>{children}</>;
}
