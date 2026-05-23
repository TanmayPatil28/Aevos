"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useUSMStore } from "@/stores/usmStore";
import { Skeleton } from "@/components/ui/Skeleton";
import { Sparkles, Lock, Fingerprint, Database, GraduationCap, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
const BOOT_SEQUENCE = [
  { text: "Establishing secure handshake...", icon: Lock, delay: 0 },
  { text: "Verifying user identity...", icon: Fingerprint, delay: 400 },
  { text: "Accessing GradeFlow vault...", icon: Database, delay: 800 },
  { text: "Synchronizing academic ledger...", icon: GraduationCap, delay: 1200 },
  { text: "Validating statutory constraints...", icon: ShieldCheck, delay: 1600 },
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
    <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#4F8EF7]/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-20 h-20 bg-[#0B0F19] border border-white/10 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(79,142,247,0.2)] mb-8"
        >
          <GraduationCap className="w-10 h-10 text-[#4F8EF7]" />
        </motion.div>

        <div className="w-full bg-[#0B0F19]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4F8EF7]">System Boot</span>
            <span className="text-[10px] font-mono text-white/30">{((step + 1) / BOOT_SEQUENCE.length * 100).toFixed(0)}%</span>
          </div>

          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mb-6">
            <motion.div 
              className="h-full bg-[#4F8EF7]"
              initial={{ width: "0%" }}
              animate={{ width: `${((step + 1) / BOOT_SEQUENCE.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="space-y-3">
            {BOOT_SEQUENCE.map((s, i) => {
              const isActive = i === step;
              const isPast = i < step;
              const Icon = s.icon;
              
              if (i > step) return null;

              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-3 text-xs font-mono ${isActive ? 'text-white' : 'text-white/30'}`}
                >
                  <Icon size={14} className={isActive ? 'text-[#4F8EF7] animate-pulse' : 'text-white/20'} />
                  <span>{s.text}</span>
                  {isPast && <span className="ml-auto text-emerald-500 font-bold">OK</span>}
                </motion.div>
              );
            })}
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
          }, 800);
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
