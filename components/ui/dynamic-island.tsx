"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDynamicIslandStore } from "@/stores/dynamicIslandStore";
import { AlertCircle } from "lucide-react";
import {
  MinimalActivity,
  MinimalSecondaryActivity,
  ExpandedActivity,
  IslandAlertView,
  SiriTopHalfActivity,
} from "../dynamic-island/LiveActivities";
import { cn } from "@/lib/cn";

// --- APPLE EXACT PHYSICS & DIMENSIONS ---
// Spring Physics
const APPLE_SPRING = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 1,
};

// Dimensions (Responsive up to max-widths)
const DIMENSIONS = {
  idle: { width: 126, height: 37, borderRadius: 19 },
  compact: { width: "auto", minWidth: 160, height: 37, borderRadius: 19 },
  split: { width: "auto", minWidth: 160, height: 37, borderRadius: 19 },
  expanded: { width: "min(363px, 90vw)", minHeight: 160, borderRadius: 42 },
  topHalf: { width: "min(400px, 95vw)", minHeight: "35vh", borderRadius: 46 }, // iOS 27 Siri / Top Third Modal
};

export function DynamicIsland() {
  const activities = useDynamicIslandStore((s) => s.activities);
  const activeAlert = useDynamicIslandStore((s) => s.activeAlert);
  const expandedId = useDynamicIslandStore((s) => s.expandedId);
  const examCountdown = useDynamicIslandStore((s) => s.examCountdown);
  const setExpandedId = useDynamicIslandStore((s) => s.setExpandedId);
  const isExamPillExpanded = useDynamicIslandStore((s) => s.isExamPillExpanded);
  const isProcessing = useDynamicIslandStore((s) => s.isProcessing);
  const isAIActive = useDynamicIslandStore((s) => s.isAIActive);
  const setIsAIActive = useDynamicIslandStore((s) => s.setIsAIActive);

  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close island on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setExpandedId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setExpandedId]);

  // Handle active activities (Top 2 priority)
  const primaryActivity = activities[0];
  const secondaryActivity = activities[1];

  // Determine Current State Layout
  const isExpanded = expandedId !== null || activeAlert !== null;
  const isTopHalf = isAIActive;
  const isSplit = activities.length > 1 && !isExpanded && !isTopHalf;
  const isCompact = activities.length === 1 && !isExpanded && !isTopHalf;
  const isIdle = activities.length === 0 && activeAlert === null && !isExpanded && !isTopHalf;

  let currentDimensions = DIMENSIONS.idle;
  if (isTopHalf) {
    currentDimensions = DIMENSIONS.topHalf as any;
  } else if (isExpanded) {
    currentDimensions = {
      ...DIMENSIONS.expanded,
      width: activeAlert ? "min(363px, 90vw)" : DIMENSIONS.expanded.width,
    } as any;
  } else if (isSplit) {
    currentDimensions = DIMENSIONS.split as any;
  } else if (isCompact) {
    currentDimensions = DIMENSIONS.compact as any;
  }

  // Determine what to show in Expanded View
  const expandedContent = () => {
    if (isTopHalf) return <SiriTopHalfActivity />;
    if (activeAlert) return <IslandAlertView alert={activeAlert} />;
    
    const activityToExpand =
      activities.find((a) => a.id === expandedId) || primaryActivity;
    
    if (activityToExpand) {
      return <ExpandedActivity activity={activityToExpand} />;
    }
    return null;
  };

  return (
    <div className="fixed top-4 left-0 right-0 z-[100] flex justify-center items-start pointer-events-none font-sans">
      <div className="pointer-events-auto flex justify-center">
        <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <filter id="liquid-glass" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="30" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feGaussianBlur in="displaced" stdDeviation="10" result="blurred" />
            <feMerge>
              <feMergeNode in="blurred" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="squircle" clipPathUnits="objectBoundingBox">
            <path d="M 0.5,0 C 0.05,0 0,0.05 0,0.5 C 0,0.95 0.05,1 0.5,1 C 0.95,1 1,0.95 1,0.5 C 1,0.05 0.95,0 0.5,0 Z" />
          </clipPath>
        </defs>
      </svg>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes jarvis-gradient-glow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-jarvis-glow {
          background-size: 200% 200%;
          animation: jarvis-gradient-glow 3s linear infinite;
        }
      `}} />
      <div
        ref={containerRef}
        className="relative flex items-center justify-center gap-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* --- GLOW WRAPPER FOR APPLE INTELLIGENCE AMBIENT GLOW --- */}
        <motion.div
          layout
          className={cn(
            "relative transition-all duration-300",
            isProcessing && "p-[2.0px] bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-cyan-500 animate-jarvis-glow shadow-[0_0_25px_rgba(59,130,246,0.5)]"
          )}
          style={{
            borderRadius: typeof currentDimensions.borderRadius === 'number' 
              ? currentDimensions.borderRadius + 2 
              : currentDimensions.borderRadius,
          }}
          transition={APPLE_SPRING}
        >
          {/* --- MAIN PILL --- */}
          <div>
            <motion.div
              layout
              initial={false}
              animate={{
                width: currentDimensions.width,
                height: (isExpanded || isTopHalf) ? "auto" : currentDimensions.height,
                minHeight: (isExpanded || isTopHalf) ? currentDimensions.minHeight : currentDimensions.height,
                scale: isHovered && !isExpanded && !isTopHalf && !isIdle ? 1.02 : 1,
              }}
              transition={APPLE_SPRING}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, info) => {
                if (info.offset.y > 50 && !isTopHalf) {
                  setIsAIActive(true);
                } else if (info.offset.y < -50 && isTopHalf) {
                  setIsAIActive(false);
                }
              }}
              onClick={() => {
                if (!isExpanded && !isTopHalf && primaryActivity) {
                  setExpandedId(primaryActivity.id);
                } else if (isExpanded && !activeAlert) {
                  setExpandedId(null);
                }
              }}
              className={cn(
                "bg-black backdrop-blur-3xl relative overflow-hidden flex items-center cursor-pointer",
                (isExpanded || isTopHalf) ? "p-0" : "px-3"
              )}
              style={{ 
                borderRadius: currentDimensions.borderRadius,
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08), 0 20px 50px rgba(0,0,0,0.5)",
                filter: isTopHalf ? "url(#liquid-glass)" : "none",
                willChange: "width, height, transform, border-radius"
              }}
            >
            {/* HARDWARE CUTOUT EMULATION (Pure Black Core) removed to prevent text blocking */}

            <AnimatePresence mode="popLayout">
              {isExpanded && (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }}
                  animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                  exit={{ opacity: 0, filter: "blur(5px)", scale: 0.95 }}
                  transition={APPLE_SPRING}
                  className="w-full h-full flex items-center justify-center"
                >
                  {expandedContent()}
                </motion.div>
              )}

              {!isExpanded && primaryActivity && (
                <motion.div
                  key="compact"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full flex items-center justify-between"
                >
                  <MinimalActivity activity={primaryActivity} />
                </motion.div>
              )}

              {/* Idle state (just the camera pill) */}
              {isIdle && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full flex items-center justify-between px-2"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-[#111111] shadow-[inset_0_1px_3px_rgba(255,255,255,0.1)]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#111111] shadow-[inset_0_1px_3px_rgba(255,255,255,0.1)]" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          </div>
        </motion.div>

        {/* --- SECONDARY BUBBLE (SPLIT STATE) --- */}
        <AnimatePresence>
          {isSplit && secondaryActivity && (
            <motion.div
              key="split-bubble"
              initial={{ scale: 0, x: -20, opacity: 0 }}
              animate={{ scale: 1, x: 0, opacity: 1 }}
              exit={{ scale: 0, x: -20, opacity: 0 }}
              transition={APPLE_SPRING}
              onClick={(e) => {
                e.stopPropagation();
                setExpandedId(secondaryActivity.id);
              }}
              className="h-[37px] w-[37px] rounded-[19px] bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
            >
              <MinimalSecondaryActivity activity={secondaryActivity} />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* --- EXAM COUNTDOWN DOCKED PILL --- */}
        <AnimatePresence>
          {examCountdown && !isExpanded && !isTopHalf && (
            <motion.div
              key="exam-pill"
              initial={{ scale: 0, x: -20, opacity: 0 }}
              animate={{ scale: 1, x: 0, opacity: 1 }}
              exit={{ scale: 0, x: -20, opacity: 0 }}
              transition={APPLE_SPRING}
              className="h-[37px] px-3 rounded-full bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform gap-2"
            >
              <div className="w-5 h-5 rounded-full bg-[#FF9F0A] flex items-center justify-center">
                <AlertCircle size={12} color="#FFFFFF" strokeWidth={3} />
              </div>
              <span className="text-[#FF9F0A] text-[13px] font-bold tracking-tight">
                {examCountdown.daysRemaining}d {examCountdown.hoursRemaining}h
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </div>
  );
}
