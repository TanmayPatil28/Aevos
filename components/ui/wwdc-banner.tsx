"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";

export interface NotificationItem {
  id: string | number;
  title: string;
  description: string;
  timestamp?: string;
  icon?: React.ReactNode;
  /** Optional colored dot next to the title (e.g., green for "new") */
  dotColor?: string;
}

export interface WwdcBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  notifications: NotificationItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  onNotificationChange?: (index: number) => void;
}

const WwdcBanner = React.forwardRef<HTMLDivElement, WwdcBannerProps>(
  (
    {
      className,
      notifications = [],
      autoPlay = true,
      autoPlayInterval = 5000,
      onNotificationChange,
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(0);
    const progressRef = useRef<number>(0);
    const lastTickRef = useRef<number>(0);
    const rafRef = useRef<number>(0);

    // Sync notification change callback
    useEffect(() => {
      if (onNotificationChange) {
        onNotificationChange(activeIndex);
      }
    }, [activeIndex, onNotificationChange]);

    const goToNext = useCallback(() => {
      if (notifications.length <= 1) return;
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % notifications.length);
      progressRef.current = 0;
      setProgress(0);
    }, [notifications.length]);

    const goToPrev = useCallback(() => {
      if (notifications.length <= 1) return;
      setDirection(-1);
      setActiveIndex((prev) => (prev - 1 + notifications.length) % notifications.length);
      progressRef.current = 0;
      setProgress(0);
    }, [notifications.length]);

    // Progress bar animation + autoplay
    useEffect(() => {
      if (!autoPlay || notifications.length <= 1 || isPaused) {
        return;
      }

      lastTickRef.current = performance.now();

      const tick = (now: number) => {
        const delta = now - lastTickRef.current;
        lastTickRef.current = now;
        progressRef.current += delta;
        const pct = Math.min(progressRef.current / autoPlayInterval, 1);
        setProgress(pct);

        if (pct >= 1) {
          goToNext();
        } else {
          rafRef.current = requestAnimationFrame(tick);
        }
      };

      rafRef.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafRef.current);
    }, [autoPlay, autoPlayInterval, notifications.length, isPaused, activeIndex, goToNext]);

    if (!notifications || notifications.length === 0) {
      return null;
    }

    const handleDotClick = (index: number) => {
      if (index === activeIndex) return;
      setDirection(index > activeIndex ? 1 : -1);
      setActiveIndex(index);
      progressRef.current = 0;
      setProgress(0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (notifications.length <= 1) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
    };

    const currentNotification = notifications[activeIndex];

    const slideVariants = {
      enter: (dir: number) => ({
        y: dir > 0 ? 30 : -30,
        opacity: 0,
        filter: "blur(4px)",
      }),
      center: {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
      },
      exit: (dir: number) => ({
        y: dir < 0 ? 30 : -30,
        opacity: 0,
        filter: "blur(4px)",
      }),
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full flex flex-col items-center gap-5 py-8 select-none focus-visible:outline-none",
          className
        )}
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel || "WWDC Banner"}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {/* ── Centered Text Carousel ── */}
        <div className="relative w-full h-[72px] overflow-hidden">
          <AnimatePresence mode="popLayout" custom={direction} initial={false}>
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="absolute inset-0 w-full flex flex-col items-center justify-center text-center px-4"
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${activeIndex + 1} of ${notifications.length}`}
            >
              <h3 className="text-[17px] leading-[22px] font-semibold text-white flex items-center gap-1.5">
                {currentNotification.title}
                {currentNotification.dotColor && (
                  <span
                    className="inline-block w-[6px] h-[6px] rounded-full"
                    style={{ backgroundColor: currentNotification.dotColor }}
                  />
                )}
              </h3>
              <p className="text-[14px] leading-[20px] text-white/60 mt-1 max-w-md">
                {currentNotification.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Pill-shaped Control Bar ── */}
        {notifications.length > 1 && (
          <div className="flex items-center gap-3">
            {/* Dot Navigation Pill */}
            <div className="flex items-center gap-[6px] bg-white/[0.08] rounded-full px-3 py-[7px]">
              {notifications.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDotClick(idx)}
                  className="relative focus:outline-none"
                  aria-label={`Go to slide ${idx + 1}`}
                  aria-current={idx === activeIndex ? "true" : "false"}
                >
                  {idx === activeIndex ? (
                    /* Active dot with progress track */
                    <div className="relative w-7 h-[5px] rounded-full bg-white/[0.26] overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-white rounded-full"
                        style={{ width: `${progress * 100}%` }}
                      />
                    </div>
                  ) : (
                    /* Inactive dot */
                    <motion.div
                      layout
                      className="w-[5px] h-[5px] rounded-full bg-white/30 hover:bg-white/50 transition-colors"
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Pause / Play Button */}
            <button
              onClick={() => setIsPaused((p) => !p)}
              className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center hover:bg-white/[0.12] transition-colors focus:outline-none"
              aria-label={isPaused ? "Play" : "Pause"}
            >
              {isPaused ? (
                /* Play icon */
                <svg
                  width="10"
                  height="12"
                  viewBox="0 0 10 12"
                  fill="none"
                  className="text-white/80 ml-[1px]"
                >
                  <path d="M1 1L9 6L1 11V1Z" fill="currentColor" />
                </svg>
              ) : (
                /* Pause icon */
                <svg
                  width="10"
                  height="12"
                  viewBox="0 0 10 12"
                  fill="none"
                  className="text-white/80"
                >
                  <rect x="1" y="1" width="3" height="10" rx="1" fill="currentColor" />
                  <rect x="6" y="1" width="3" height="10" rx="1" fill="currentColor" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>
    );
  }
);

WwdcBanner.displayName = "WwdcBanner";

export { WwdcBanner };
export default WwdcBanner;
