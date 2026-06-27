"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";

export interface FeatureSpec {
  id: string;
  title: string;
  description?: React.ReactNode;
  content?: React.ReactNode;
  rightPanelContent?: React.ReactNode;
}

export interface AppleFeatureExplorerProps {
  features: FeatureSpec[];
  className?: string;
  emptyStateContent?: React.ReactNode;
}

export function AppleFeatureExplorer({ features, className, emptyStateContent }: AppleFeatureExplorerProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!features || features.length === 0) return null;

  return (
    <div className={cn("relative w-full bg-[#1d1d1f] rounded-[56px] min-h-[500px] md:min-h-[600px] flex justify-center overflow-hidden", className)}>
      <div className="w-full px-8 md:px-12 py-6 flex flex-col md:flex-row gap-8 relative">
        
        {/* Global Close Button (X) at Top Right */}
        <AnimatePresence>
          {activeIndex !== null && (
            <motion.button 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setActiveIndex(null)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-[#000000] flex items-center justify-center hover:bg-[#111] transition-colors z-50 text-white/60 hover:text-white"
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Left Column: Interactive Pills */}
      <div className="w-full md:w-[424px] shrink-0 flex flex-col items-start justify-center gap-4 relative z-10 py-4 h-full min-h-[400px] md:min-h-full">
        
        {/* Scroll Chevrons */}
        <div className="absolute -left-10 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-6 z-50">
          <button 
            onClick={() => setActiveIndex(prev => prev !== null ? Math.max(0, prev - 1) : null)}
            disabled={activeIndex === 0 || activeIndex === null}
            className={cn(
              "w-8 h-8 rounded-full bg-[#000000] flex items-center justify-center transition-colors text-white",
              (activeIndex === 0 || activeIndex === null) ? "opacity-30 cursor-not-allowed" : "hover:bg-[#111]"
            )}
          >
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 7L6 2L11 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button 
            onClick={() => setActiveIndex(prev => prev !== null ? Math.min(features.length - 1, prev + 1) : null)}
            disabled={activeIndex === features.length - 1 || activeIndex === null}
            className={cn(
              "w-8 h-8 rounded-full bg-[#000000] flex items-center justify-center transition-colors text-white",
              (activeIndex === features.length - 1 || activeIndex === null) ? "opacity-30 cursor-not-allowed" : "hover:bg-[#111]"
            )}
          >
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        {features.map((feature, idx) => {
          const isActive = activeIndex === idx;

          return (
            <motion.div
              key={feature.id}
              layout
              onClick={() => setActiveIndex(isActive ? null : idx)}
              whileHover={!isActive ? "hover" : undefined}
              className={cn(
                "relative cursor-pointer overflow-hidden origin-top",
                isActive 
                  ? "bg-[#000000] p-6 rounded-[24px] w-full" 
                  : "bg-[#000000] h-[56px] pl-4 pr-[32px] rounded-[24px] hover:bg-[#111] flex items-center w-fit"
              )}
              transition={{
                layout: { type: "spring", stiffness: 200, damping: 25, mass: 1 }
              }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {!isActive ? (
                  <motion.div 
                    key="inactive"
                    variants={{
                      initial: { opacity: 0 },
                      animate: { opacity: 1 },
                      exit: { opacity: 0 }
                    }}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-[8px]"
                  >
                    <motion.div 
                      variants={{
                        initial: { rotate: -90, scale: 0.5 },
                        animate: { rotate: 0, scale: 1, borderColor: "rgba(255,255,255,0.2)", backgroundColor: "transparent" },
                        exit: { rotate: 90, scale: 0 },
                        hover: { scale: 1.15, borderColor: "rgba(255,255,255,0.6)", backgroundColor: "rgba(255,255,255,0.1)" }
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="w-[24px] h-[24px] rounded-full border flex items-center justify-center shrink-0"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-white/90">
                        <path d="M5 1V9M1 5H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </motion.div>
                    <span className="text-white font-semibold text-base leading-6 tracking-[0.01em]">
                      {feature.title}
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="active"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 1, 0.5, 1] }}
                    className="w-full flex flex-col mt-2"
                  >
                    {feature.description && (
                      <div className="text-base leading-6 text-[#a1a1a6] font-medium tracking-tight">
                        <span className="text-white font-semibold block mb-1">{feature.title}.</span>
                        {feature.description}
                      </div>
                    )}
                    {feature.content && (
                      <div className="mt-4">
                        {feature.content}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Right Column: Seamless Dynamic Content Presenter */}
      <div className="flex-1 relative w-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          {activeIndex !== null ? (
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.98, filter: "blur(12px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.02, filter: "blur(12px)" }}
              transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
              className="w-full h-full flex flex-col items-center justify-center p-8 md:p-16 text-center"
            >
              {features[activeIndex].rightPanelContent}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 0.6 }}
              className="w-full h-full flex flex-col items-center justify-center text-center"
            >
              {emptyStateContent ? (
                emptyStateContent
              ) : (
                <>
                  <div className="w-24 h-24 rounded-full border border-white/5 bg-white/5 flex items-center justify-center mb-6">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white/20">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 8V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="16" r="1" fill="currentColor"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-white/40 tracking-tight">Select a feature</h3>
                  <p className="text-white/30 max-w-sm mt-2">Click on any of the core platform modules on the left to explore its capabilities.</p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  </div>
  );
}
