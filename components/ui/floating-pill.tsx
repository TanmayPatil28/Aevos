"use client";

import React, { useRef, useId, useEffect } from "react";
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";

export interface FloatingPillItem {
  id: string | number;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export interface FloatingPillProps
  extends Omit<HTMLMotionProps<"div">, "children"> {
  items: FloatingPillItem[];
  activeId?: string | number;
  onActiveChange?: (id: string | number) => void;
  isOpen?: boolean;
  isExpanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
  expandable?: boolean;
  expandLabel?: string;
  expandIcon?: React.ReactNode;
  expandedItems?: FloatingPillItem[];
  activeLayoutId?: string;
}

const FloatingPill = React.forwardRef<HTMLDivElement, FloatingPillProps>(
  (
    {
      className,
      items = [],
      activeId,
      onActiveChange,
      isOpen = true,
      isExpanded = false,
      onExpandChange,
      expandable = false,
      expandLabel = "More",
      expandIcon,
      expandedItems = [],
      activeLayoutId,
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const internalId = useId();
    const resolvedLayoutId = activeLayoutId || `active-pill-${internalId}`;

    // Combine external ref with internal ref
    useEffect(() => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(containerRef.current);
      } else {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current =
          containerRef.current;
      }
    }, [ref]);

    // Roving tabIndex / keyboard navigation helper
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;

      // Find all buttons inside that are not disabled
      const focusable = Array.from(
        containerRef.current.querySelectorAll("button:not([disabled])")
      ) as HTMLButtonElement[];

      if (focusable.length === 0) return;

      const active = document.activeElement as HTMLButtonElement;
      const index = focusable.indexOf(active);

      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          if (index === -1) {
            focusable[0].focus();
            focusable[0].click();
          } else {
            const nextIndex = (index + 1) % focusable.length;
            focusable[nextIndex].focus();
            focusable[nextIndex].click();
          }
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          if (index === -1) {
            focusable[focusable.length - 1].focus();
            focusable[focusable.length - 1].click();
          } else {
            const prevIndex = (index - 1 + focusable.length) % focusable.length;
            focusable[prevIndex].focus();
            focusable[prevIndex].click();
          }
          break;
        case "Home":
          e.preventDefault();
          focusable[0].focus();
          focusable[0].click();
          break;
        case "End":
          e.preventDefault();
          focusable[focusable.length - 1].focus();
          focusable[focusable.length - 1].click();
          break;
        case "Escape":
          e.preventDefault();
          if (expandable && isExpanded && onExpandChange) {
            onExpandChange(false);
          }
          break;
      }
    };

    // Helper to determine if button should have tabIndex=0
    const getTabIndex = (itemId: string | number, index: number) => {
      if (activeId !== undefined) {
        return activeId === itemId ? 0 : -1;
      }
      return index === 0 ? 0 : -1;
    };

    const appleSpring = { type: "spring", stiffness: 400, damping: 40, mass: 1 };

    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={appleSpring}
            role="toolbar"
            aria-label={ariaLabel || "Floating Action Pill"}
            onKeyDown={handleKeyDown}
            className={cn(
              "h-12 rounded-full p-1 px-1.5 flex items-center select-none w-fit max-w-full overflow-hidden",
              "bg-[#2c2c2e]/80 backdrop-blur-xl border border-white/10 shadow-lg",
              className
            )}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              ...props.style,
            }}
            {...props}
          >
            {/* Primary Action Items */}
            <div className="flex items-center gap-1.5 z-10 relative">
              {items.map((item, index) => {
                const isActive = activeId !== undefined && item.id === activeId;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.disabled) return;
                      if (item.onClick) item.onClick();
                      if (onActiveChange) onActiveChange(item.id);
                    }}
                    className={cn(
                      "relative h-[40px] px-[16px] rounded-full text-sm whitespace-nowrap tracking-tight transition-colors duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:outline-none flex items-center justify-center min-w-[72px] gap-2",
                      isActive
                        ? "text-black font-semibold"
                        : "text-[#e5e5ea] font-medium hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                    )}
                    tabIndex={getTabIndex(item.id, index)}
                    disabled={item.disabled}
                    aria-current={isActive ? "true" : undefined}
                  >
                    {/* Active sliding background */}
                    {isActive && (
                      <motion.div
                        layoutId={resolvedLayoutId}
                        className="absolute inset-0 bg-white z-0 shadow-sm"
                        initial={{ borderRadius: 20 }}
                        animate={{ borderRadius: 20 }}
                        transition={appleSpring}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      {item.icon}
                      <span>{item.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Expandable Toggle and Menu Items */}
            {expandable && (
              <>
                {/* Visual Separator */}
                <div className="w-px h-[24px] bg-white/[0.08] shrink-0 mx-1" />

                <div className="flex items-center gap-1.5 z-10 relative">
                  {/* Expand Trigger Button */}
                  <button
                    onClick={() => {
                      if (onExpandChange) {
                        onExpandChange(!isExpanded);
                      }
                    }}
                    className={cn(
                      "relative h-[40px] px-[16px] rounded-full text-sm whitespace-nowrap tracking-tight transition-colors duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:outline-none flex items-center justify-center min-w-[72px] gap-2",
                      isExpanded
                        ? "text-black font-semibold"
                        : "text-[#e5e5ea] font-medium hover:text-white"
                    )}
                    tabIndex={-1}
                    aria-expanded={isExpanded}
                    aria-haspopup="menu"
                  >
                    {isExpanded && !activeId && (
                      <motion.div
                        layoutId={resolvedLayoutId}
                        className="absolute inset-0 bg-[#3a3a3c] rounded-full z-0 shadow-sm border border-white/5"
                        transition={appleSpring}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      {expandIcon || (
                        <svg
                          className={cn(
                            "w-4 h-4 transition-transform duration-200",
                            isExpanded ? "rotate-180" : ""
                          )}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      )}
                      <span>{expandLabel}</span>
                    </span>
                  </button>

                  {/* Expanded Menu Items Inline */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "auto", opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={appleSpring}
                        className="flex items-center overflow-hidden shrink-0"
                      >
                        <div className="flex items-center gap-2 pl-2">
                          {expandedItems.map((item) => {
                            const isActive = activeId !== undefined && item.id === activeId;
                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  if (item.disabled) return;
                                  if (item.onClick) item.onClick();
                                  if (onActiveChange) onActiveChange(item.id);
                                }}
                                className={cn(
                                  "shrink-0 relative h-[40px] px-[16px] rounded-full text-sm whitespace-nowrap tracking-tight transition-colors duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:outline-none flex items-center justify-center gap-2 overflow-hidden",
                                  isActive
                                    ? "text-black font-semibold"
                                    : "text-[#e5e5ea] font-medium hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none"
                                )}
                                tabIndex={-1}
                                disabled={item.disabled}
                                aria-current={isActive ? "true" : undefined}
                              >
                                {isActive && (
                                  <motion.div
                                    layoutId={resolvedLayoutId}
                                    className="absolute inset-0 bg-white rounded-full z-0 shadow-sm"
                                    transition={appleSpring}
                                  />
                                )}
                                <span className="relative z-10 flex items-center gap-1.5">
                                  {item.icon}
                                  <span>{item.label}</span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

FloatingPill.displayName = "FloatingPill";

export { FloatingPill };
export default FloatingPill;
