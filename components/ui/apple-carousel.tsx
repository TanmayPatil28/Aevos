"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import { FluidGradient } from "./fluid-gradient";

export interface CarouselSlide {
  id: string | number;
  content?: React.ReactNode;
  imageUrl?: string;
  imageAlt?: string;
  colors?: string[];
  headline?: React.ReactNode;
  subheadline?: React.ReactNode;
  textPosition?: "top-left" | "bottom-left";
}

export interface AppleCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  slides: CarouselSlide[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  leftControls?: React.ReactNode;
  rightControls?: React.ReactNode;
  activeFeatureId?: string | null;
  features?: { id: string; content: React.ReactNode }[];
  hideCenterControls?: boolean;
  centerControls?: React.ReactNode;
}

export function AppleCarousel({ 
  className, 
  slides = [], 
  autoPlay = true, 
  autoPlayInterval = 8000, 
  leftControls,
  rightControls,
  activeFeatureId = null,
  features = [],
  hideCenterControls = false,
  centerControls,
  ...props 
}: AppleCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [playKey, setPlayKey] = useState(0);

  const appleSpring = { type: "spring", stiffness: 400, damping: 40, mass: 1 };

  const SLIDE_DURATION = autoPlayInterval;

  useEffect(() => {
    if (!autoPlay || isPaused || slides.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % slides.length;
        setPlayKey((prev) => prev + 1);
        return next;
      });
    }, SLIDE_DURATION);

    return () => clearInterval(timer);
  }, [slides.length, isPaused, autoPlay, SLIDE_DURATION]);

  const scrollToSlide = useCallback((index: number) => {
    setActiveIndex(index);
    setPlayKey((prev) => prev + 1);
    setIsPaused(true);
  }, []);

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = swipePower(offset.x, velocity.x);

    // Swiped left (next slide)
    if (swipe < -swipeConfidenceThreshold && activeIndex < slides.length - 1) {
      scrollToSlide(activeIndex + 1);
    } 
    // Swiped right (previous slide)
    else if (swipe > swipeConfidenceThreshold && activeIndex > 0) {
      scrollToSlide(activeIndex - 1);
    }
  };

  const springTransition = {
    ease: [0.32, 0.72, 0, 1],
    duration: 0.8,
  };

  if (!slides || slides.length === 0) return null;

  return (
    <section className="relative w-full pb-6" aria-roledescription="carousel">
      
      <div className="relative w-full max-w-[1200px] mx-auto px-[max(1.5rem,calc((100vw-1200px)/2))] lg:px-0">
        
        {/* Unified Master Background Container */}
        <div 
          className="relative w-full rounded-[32px] overflow-hidden isolate shadow-2xl ring-1 ring-white/10 bg-[#222222]"
          style={{ aspectRatio: '24/9', minHeight: '400px' }}
        >
          {/* Static Gradient Overlay (Seamless background) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-0 pointer-events-none" />

          <AnimatePresence mode="wait">
            {activeFeatureId ? (
              <motion.div
                key="feature-view"
                initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className="absolute inset-0 z-20 flex items-center justify-center overflow-hidden"
              >
                {features.find(f => f.id === activeFeatureId)?.content}
              </motion.div>
            ) : (
              <motion.div
                key="slides-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className="absolute inset-0 z-10 overflow-hidden"
              >
                {/* Hardware-accelerated sliding track with drag physics */}
                <motion.div 
                  className="flex gap-[24px] cursor-grab active:cursor-grabbing relative h-full"
                  animate={{ x: `calc(-${activeIndex * 100}% - ${activeIndex * 24}px)` }}
                  transition={springTransition}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.15}
                  onDragEnd={handleDragEnd}
                >
                  {slides.map((slide, idx) => (
                    <div 
                      key={slide.id} 
                      className="carousel-item relative shrink-0 w-full rounded-[32px] overflow-hidden group isolate bg-transparent"
                      style={{
                        // Match Apple's large cinematic aspect ratio
                        aspectRatio: '24/9',
                        minHeight: '400px'
                      }}
                    >
                      
                      {/* Overlay Text */}
                      {slide.headline && (
                        <div 
                          className={cn(
                            "absolute z-20 max-w-[80%] md:max-w-[50%] pointer-events-none",
                            slide.textPosition === "bottom-left" ? "bottom-[48px] left-[48px]" : "top-[48px] left-[48px]"
                          )}
                        >
                          <h3 className="text-4xl md:text-5xl font-semibold tracking-tight text-white leading-[1.1]">
                            {slide.headline}
                          </h3>
                          {slide.subheadline && (
                            <p className="mt-4 text-xl md:text-2xl font-medium text-white/80">
                              {slide.subheadline}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* ── Apple Style Floating Controls Dock ── */}
        <div className="absolute bottom-4 left-4 right-4 md:bottom-[32px] md:left-[48px] md:right-[48px] z-[250] pointer-events-none">
          <div className="flex items-center gap-3 md:gap-6 w-full overflow-x-auto md:overflow-visible no-scrollbar pointer-events-auto md:pointer-events-none pb-2 md:pb-0 scroll-smooth snap-x">
            
            {/* Left Controls */}
            <div className="flex-shrink-0 snap-start pointer-events-auto max-w-full">
              {leftControls}
            </div>

            {/* Center Dots (Immediately next to tabs) */}
            <div className="hidden md:flex items-center shrink-0 snap-start pointer-events-auto">
              <AnimatePresence>
              {!hideCenterControls && !activeFeatureId && slides.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, width: 0, paddingLeft: 0, paddingRight: 0 }}
                  animate={{ opacity: 1, width: "auto", paddingLeft: 0, paddingRight: 0 }}
                  exit={{ opacity: 0, width: 0, paddingLeft: 0, paddingRight: 0 }}
                  transition={appleSpring}
                  className="flex items-center gap-4 shrink-0 overflow-hidden"
                >
                  {centerControls ? (
                    centerControls
                  ) : (
                    <>
                      <div className="shrink-0 flex items-center gap-[20px] h-12 px-[20px] rounded-full"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.12)',
                          backdropFilter: 'blur(20px)',
                          WebkitBackdropFilter: 'blur(20px)',
                        }}
                      >
                        {slides.map((_, idx) => {
                          const isActive = idx === activeIndex;
                          return (
                          <button
                            key={idx}
                            onClick={() => scrollToSlide(idx)}
                            className="relative flex items-center justify-center focus:outline-none group/dot h-12"
                            aria-label={`Go to slide ${idx + 1}`}
                            aria-current={isActive ? "true" : "false"}
                          >
                            <div 
                              className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] relative h-2 rounded-[4px]"
                              style={{
                                width: isActive ? '40px' : '10px',
                                backgroundColor: '#86868b', // Apple's exact dense grey
                              }}
                            >
                              {/* Active Progress Bar Fill - Pure CSS animation */}
                              {isActive && (
                                <div
                                  key={`progress-${idx}-${playKey}`}
                                  className="absolute top-0 left-0 h-full bg-[#ffffff] rounded-[4px]"
                                  style={{ 
                                    width: '100%',
                                    animation: `progress-fill ${SLIDE_DURATION}ms linear forwards`,
                                    animationPlayState: isPaused ? 'paused' : 'running'
                                  }}
                                />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Play / Pause Button */}
                    <button
                      onClick={() => setIsPaused((p) => !p)}
                      className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none group/btn hover:bg-white/20 active:scale-[0.95]"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.12)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                      }}
                      aria-label={isPaused ? "Play" : "Pause"}
                    >
                      <div className="opacity-100 group-hover/btn:opacity-80 transition-opacity flex items-center justify-center">
                        <svg width="12" height="14" viewBox="0 0 10 12" fill="none" className="text-white">
                          {/* Left Pause Bar <-> Top Play Triangle */}
                          <motion.path
                            fill="currentColor"
                            initial={false}
                            animate={{
                              d: isPaused 
                                ? "M 1 2 L 9 6 L 9 6 L 1 6 Z" // Play Top Half (shifted to center)
                                : "M 1 1 L 3.5 1 L 3.5 11 L 1 11 Z", // Pause Left Bar
                            }}
                            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                          />
                          {/* Right Pause Bar <-> Bottom Play Triangle */}
                          <motion.path
                            fill="currentColor"
                            initial={false}
                            animate={{
                              d: isPaused 
                                ? "M 1 10 L 9 6 L 9 6 L 1 6 Z" // Play Bottom Half
                                : "M 6.5 1 L 9 1 L 9 11 L 6.5 11 Z", // Pause Right Bar
                            }}
                            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                          />
                        </svg>
                      </div>
                    </button>
                  </>
                )}
                </motion.div>
              )}
              </AnimatePresence>
            </div>

            {/* Right Controls */}
            <div className="md:ml-auto shrink-0 flex items-center snap-start pr-4 md:pr-0 pointer-events-auto max-w-full">
              {rightControls}
            </div>
          </div>
        </div>
      </div>

      {/* Pure CSS keyframes for the butter-smooth progress bar fill */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progress-fill {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}} />
    </section>
  );
}
