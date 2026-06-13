"use client";

import React, { useState } from "react";
import { Sparkles, X, Target, FileText, Loader2, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createPortal } from "react-dom";

interface DynamicRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  resumeText?: string;
  initialRole?: string;
}

export function DynamicRoadmapModal({ isOpen, onClose, userId, resumeText = "", initialRole = "" }: DynamicRoadmapModalProps) {
  const router = useRouter();
  const [targetRole, setTargetRole] = useState(initialRole);
  const [targetJd, setTargetJd] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [liveData, setLiveData] = useState<any>(null);
  const [isFetchingLive, setIsFetchingLive] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setTargetRole(initialRole);
      setLiveData(null);
      if (initialRole) {
        setIsFetchingLive(true);
        fetch(`/api/career/live-market?role=${encodeURIComponent(initialRole)}`)
          .then(res => res.json())
          .then(data => setLiveData(data))
          .catch(console.error)
          .finally(() => setIsFetchingLive(false));
      }
    }
  }, [isOpen, initialRole]);

  const handleGenerate = async () => {
    if (!targetRole || !targetJd) return;
    
    setIsLoading(true);
    try {
      const response = await fetch("/api/career/dynamic-roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetRole,
          targetJd,
          userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate roadmap");
      }

      toast.success("Dynamic Roadmap generated successfully!");
      onClose();
      router.push(`/placement/roadmap/${data.roadmapId}`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to generate roadmap. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const [displayJobs, setDisplayJobs] = useState(0);

  React.useEffect(() => {
    if (liveData?.liveOpenJobs) {
      let start = 0;
      const end = liveData.liveOpenJobs;
      const duration = 1000;
      const startTime = performance.now();
      
      const updateCounter = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4);
        setDisplayJobs(Math.floor(end * ease));
        
        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        }
      };
      requestAnimationFrame(updateCounter);
    }
  }, [liveData?.liveOpenJobs]);

  const modalRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!modalRef.current) return;
    const rect = modalRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    modalRef.current.style.setProperty("--x", `${x}px`);
    modalRef.current.style.setProperty("--y", `${y}px`);
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98, y: 15, filter: "blur(10px)" },
    visible: { 
      opacity: 1, scale: 1, y: 0, filter: "blur(0px)",
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.08, delayChildren: 0.1 }
    },
    exit: { opacity: 0, scale: 0.98, y: 10, filter: "blur(10px)" }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15, filter: "blur(5px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 md:p-6">
          <style>{`
            @keyframes shimmer {
              100% { transform: translateX(100%); }
            }
          `}</style>
          <motion.div 
            ref={modalRef}
            onMouseMove={handleMouseMove}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="group relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/[0.06] bg-[#09090b] shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col md:flex-row"
          >
            {/* Dynamic Cursor Spotlight Effect */}
            <div 
              className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background: `radial-gradient(800px circle at var(--x, 0px) var(--y, 0px), rgba(255,255,255,0.04), transparent 40%)`
              }}
            />

            {/* Subtle Noise Texture Overlay */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-0" 
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
            />

            {/* LEFT COLUMN */}
            <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col relative z-10">
              <motion.div variants={itemVariants} className="flex items-start justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-medium tracking-tight text-white/95">
                    Generate Roadmap
                  </h2>
                  <p className="mt-3 text-[14px] text-zinc-400/80 font-medium leading-[1.618] max-w-md">
                    JARVIS will analyze your resume against the target job description to create a personalized, day-by-day upskilling roadmap.
                  </p>
                </div>
                <button 
                  onClick={onClose}
                  className="md:hidden text-zinc-500 transition-colors hover:text-white"
                >
                  <X className="h-5 w-5" strokeWidth={1.5} />
                </button>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-8 flex-grow">
                <div className="space-y-3">
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500/80">
                    Target Role
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., AI/ML Engineer, Full Stack Developer..."
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 text-[15px] text-white/90 placeholder:text-zinc-600 focus:border-white/20 focus:bg-white/[0.04] focus:outline-none focus:ring-4 focus:ring-white/[0.02] transition-all duration-300"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500/80">
                    Target Job Description
                  </label>
                  <textarea
                    placeholder="Paste the full job description here..."
                    value={targetJd}
                    onChange={(e) => setTargetJd(e.target.value)}
                    rows={6}
                    className="w-full resize-none rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 text-[15px] text-white/90 placeholder:text-zinc-600 focus:border-white/20 focus:bg-white/[0.04] focus:outline-none focus:ring-4 focus:ring-white/[0.02] transition-all duration-300"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-12 flex items-center justify-end gap-5">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="text-sm font-medium text-zinc-500 hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerate}
                  disabled={isLoading || !targetRole || !targetJd}
                  className="flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-[15px] font-semibold tracking-tight text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Roadmap"
                  )}
                </motion.button>
              </motion.div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="w-full md:w-2/5 relative p-8 md:p-12 border-t md:border-t-0 md:border-l border-white/[0.06] bg-[#040405] flex flex-col overflow-hidden">
              <div className="hidden md:flex justify-end mb-8 relative z-10">
                <button 
                  onClick={onClose}
                  className="text-zinc-500 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                >
                  <X className="h-5 w-5" strokeWidth={1.5} />
                </button>
              </div>

              <div className="relative z-10 flex-grow flex flex-col justify-between space-y-10">
                <motion.div variants={itemVariants}>
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500/80 mb-6">
                    Market Intelligence
                  </h3>
                  
                  {isFetchingLive ? (
                    <div className="flex flex-col gap-5">
                      <div className="relative overflow-hidden h-12 w-32 bg-white/[0.03] rounded-xl">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                      </div>
                      <div className="border-t border-white/[0.06] pt-5">
                        <div className="relative overflow-hidden h-5 w-full bg-white/[0.03] rounded-md mb-2">
                          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        </div>
                        <div className="relative overflow-hidden h-5 w-3/4 bg-white/[0.03] rounded-md">
                          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        </div>
                      </div>
                    </div>
                  ) : liveData ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="space-y-8"
                    >
                      <div className="flex flex-col">
                        <span className="text-5xl font-light text-white/95 tracking-tighter tabular-nums">{displayJobs.toLocaleString()}</span>
                        <span className="text-[13px] text-zinc-500 font-medium mt-2 tracking-wide">Open positions (US)</span>
                      </div>
                      
                      <div className="flex flex-col gap-6 border-t border-white/[0.06] pt-6">
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] text-zinc-500 font-medium tracking-wide">Hiring Trend</span>
                          <span className="text-[14px] font-medium text-white/90">{liveData.marketTrend}</span>
                        </div>
                        
                        <div className="flex items-start justify-between">
                          <span className="text-[13px] text-zinc-500 font-medium tracking-wide">Top Hiring</span>
                          <div className="flex flex-col items-end gap-2">
                            {liveData.topHiringCompanies?.slice(0, 3).map((c: string) => (
                              <span key={c} className="text-[14px] font-medium text-white/90">{c}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-[13px] text-zinc-600 font-medium tracking-wide">
                      Select a role to view live market intelligence.
                    </div>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500/80 mb-4">
                    Profile Context
                  </h3>
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-semibold text-white/40 tracking-widest uppercase">Auto-synced</span>
                    <p className="text-[13px] text-zinc-500/80 leading-[1.618] font-medium">
                      {resumeText ? resumeText : "Your current resume and academic skills will be automatically injected by JARVIS for extreme personalization."}
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}
