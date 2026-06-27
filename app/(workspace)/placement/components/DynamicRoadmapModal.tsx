"use client";

import React, { useState } from "react";
import { Sparkles, X, Target, FileText, Loader2, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createPortal } from "react-dom";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/button";

const MotionCard = motion(Card);

interface DynamicRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  resumeText?: string;
  initialRole?: string;
  inline?: boolean;
}

export function DynamicRoadmapModal({ isOpen, onClose, userId, resumeText = "", initialRole = "", inline = false }: DynamicRoadmapModalProps) {
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
    hidden: { opacity: 0, scale: 0.95, y: 20, filter: "blur(10px)" },
    visible: { 
      opacity: 1, scale: 1, y: 0, filter: "blur(0px)",
      transition: { type: "spring", stiffness: 300, damping: 25, staggerChildren: 0.08, delayChildren: 0.05 }
    },
    exit: { opacity: 0, scale: 0.95, y: 10, filter: "blur(10px)" }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, filter: "blur(5px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 300, damping: 25 } }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className={inline ? "font-sans w-full h-full flex items-center justify-center" : "font-sans fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl p-4 md:p-6"}>
          <style>{`
            @keyframes shimmer {
              100% { transform: translateX(100%); }
            }
          `}</style>
          <MotionCard 
            ref={modalRef as any}
            onMouseMove={handleMouseMove}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            variant="accent"
            padding="xl"
            className={`group flex flex-col md:flex-row !p-0 shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/[0.06] ${inline ? "w-full h-full" : "w-full max-w-4xl"}`}
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
            <div className={`w-full md:w-3/5 flex flex-col relative z-10 ${inline ? "p-6 md:p-8 pb-24 md:pb-24" : "p-8 md:p-12 overflow-y-auto"}`}>
              <motion.div variants={itemVariants} className={`flex items-start justify-between shrink-0 ${inline ? "mb-4" : "mb-10"}`}>
                <div>
                  <h2 className={`${inline ? "text-2xl" : "text-3xl"} font-medium tracking-tight text-brand`}>
                    Generate Roadmap
                  </h2>
                  {!inline && (
                    <p className="mt-3 text-[14px] text-foreground-muted/80 font-medium leading-[1.618] max-w-md">
                      JARVIS will analyze your resume against the target job description to create a personalized, day-by-day upskilling roadmap.
                    </p>
                  )}
                </div>
                {!inline && (
                  <button 
                    onClick={onClose}
                    className="md:hidden text-foreground-muted transition-colors hover:text-foreground"
                  >
                    <X className="h-5 w-5" strokeWidth={1.5} />
                  </button>
                )}
              </motion.div>

              <motion.div variants={itemVariants} className={`flex-grow ${inline ? "space-y-4" : "space-y-8"}`}>
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground-muted/80">
                    Target Role
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., AI/ML Engineer, Full Stack Developer..."
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className={`w-full rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 ${inline ? "py-3" : "py-4"} text-[15px] text-foreground/90 placeholder:text-foreground-tertiary focus:border-white/[0.12] focus:bg-white/[0.04] focus:outline-none focus:ring-4 focus:ring-white/[0.05] transition-all duration-300`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground-muted/80">
                    Target Job Description
                  </label>
                  <textarea
                    placeholder="Paste the full job description here..."
                    value={targetJd}
                    onChange={(e) => setTargetJd(e.target.value)}
                    rows={inline ? 2 : 6}
                    className={`w-full resize-none rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 ${inline ? "py-3" : "py-4"} text-[15px] text-foreground/90 placeholder:text-foreground-tertiary focus:border-white/[0.12] focus:bg-white/[0.04] focus:outline-none focus:ring-4 focus:ring-white/[0.05] transition-all duration-300`}
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className={`flex items-center justify-end gap-5 ${inline ? "mt-4" : "mt-12"}`}>
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="text-sm font-medium text-foreground-muted hover:text-foreground transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <Button
                  variant="primary"
                  onClick={handleGenerate}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    "Generate Roadmap"
                  )}
                </Button>
              </motion.div>
            </div>

            {/* RIGHT COLUMN */}
            <div className={`w-full md:w-2/5 relative border-t md:border-t-0 md:border-l border-white/[0.06] bg-surface flex flex-col overflow-hidden ${inline ? "p-6 md:p-8 pb-24 md:pb-24" : "p-8 md:p-12 overflow-y-auto"}`}>
              {!inline && (
                <div className="hidden md:flex justify-end mb-8 relative z-10">
                  <button 
                    onClick={onClose}
                    className="text-foreground-muted hover:text-foreground transition-colors p-1 rounded-full hover:bg-surface-overlay"
                  >
                    <X className="h-5 w-5" strokeWidth={1.5} />
                  </button>
                </div>
              )}

              <div className={`relative z-10 flex-grow flex flex-col justify-between ${inline ? "space-y-4" : "space-y-10"}`}>
                <motion.div variants={itemVariants}>
                  <h3 className={`text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground-muted/80 ${inline ? "mb-4" : "mb-6"}`}>
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
                        <span className="text-5xl font-light text-white tracking-tighter tabular-nums drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">{displayJobs.toLocaleString()}</span>
                        <span className="text-[13px] text-foreground-muted font-medium mt-2 tracking-wide">Open positions (US)</span>
                      </div>
                      
                      <div className="flex flex-col gap-6 border-t border-white/[0.06] pt-6">
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] text-foreground-muted font-medium tracking-wide">Hiring Trend</span>
                          <span className="text-[14px] font-medium text-foreground/90">{liveData.marketTrend}</span>
                        </div>
                        
                        <div className="flex items-start justify-between">
                          <span className="text-[13px] text-foreground-muted font-medium tracking-wide">Top Hiring</span>
                          <div className="flex flex-col items-end gap-2">
                            {liveData.topHiringCompanies?.slice(0, 3).map((c: string) => (
                              <span key={c} className="text-[14px] font-medium text-foreground/90">{c}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col gap-4 animate-in fade-in duration-500">
                      <div className="text-[13px] text-foreground-muted font-medium tracking-wide">
                        Trending Roles
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {["AI/ML Engineer", "Product Manager", "Data Scientist", "Full Stack Developer", "UX/UI Designer"].map((role) => (
                          <button
                            key={role}
                            onClick={() => setTargetRole(role)}
                            className="text-[12px] font-medium text-foreground/70 bg-surface-raised hover:bg-surface-overlay hover:text-foreground border border-border rounded-full px-4 py-2 transition-all active:scale-95"
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground-muted/80 mb-4">
                    Profile Context
                  </h3>
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-brand tracking-widest uppercase drop-shadow-sm">Auto-synced</span>
                    <p className="text-[13px] text-foreground-muted/80 leading-[1.618] font-medium">
                      {resumeText ? resumeText : "Your current resume and academic skills will be automatically injected by JARVIS for extreme personalization."}
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </MotionCard>
        </div>
      )}
    </AnimatePresence>
  );

  if (!inline && typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}
