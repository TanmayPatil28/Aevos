"use client";

import React, { useRef, useId, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

export interface SegmentedControlOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  options: SegmentedControlOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  activeLayoutId?: string;
}

export const SegmentedControl = React.forwardRef<HTMLDivElement, SegmentedControlProps>(
  (
    {
      options = [],
      value,
      defaultValue,
      onChange,
      className,
      activeLayoutId,
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const internalId = useId();
    const resolvedLayoutId = activeLayoutId || `segmented-active-${internalId}`;

    const isControlled = value !== undefined;
    const [localValue, setLocalValue] = React.useState(
      defaultValue !== undefined ? defaultValue : options[0]?.value || ""
    );
    const activeValue = isControlled ? value : localValue;

    // Combine refs
    useEffect(() => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(containerRef.current);
      } else {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current =
          containerRef.current;
      }
    }, [ref]);

    const handleSelect = (newValue: string) => {
      if (!isControlled) {
        setLocalValue(newValue);
      }
      if (onChange) {
        onChange(newValue);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;

      const enabledOptions = options.filter((opt) => !opt.disabled);
      if (enabledOptions.length <= 1) return;

      const currentIndex = enabledOptions.findIndex((opt) => opt.value === activeValue);
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;
      if (e.key === "ArrowRight") {
        nextIndex = (currentIndex + 1) % enabledOptions.length;
      } else if (e.key === "ArrowLeft") {
        nextIndex = (currentIndex - 1 + enabledOptions.length) % enabledOptions.length;
      }

      const nextOption = enabledOptions[nextIndex];
      e.preventDefault();
      handleSelect(nextOption.value);

      // Focus the newly selected tab immediately
      const nextButton = containerRef.current?.querySelector(
        `[data-value="${CSS.escape(nextOption.value)}"]`
      ) as HTMLButtonElement | null;
      nextButton?.focus();
    };

    return (
      <div
        ref={containerRef}
        role="tablist"
        onKeyDown={handleKeyDown}
        className={cn(
          "h-12 rounded-full p-1 px-1.5 flex select-none w-fit max-w-full items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
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
        {options.map((option) => {
          const isActive = option.value === activeValue;
          return (
            <button
              key={option.value}
              role="tab"
              type="button"
              data-value={option.value}
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              disabled={option.disabled}
              onClick={() => {
                if (option.disabled) return;
                handleSelect(option.value);
              }}
              className={cn(
                "relative h-[40px] px-3 sm:px-[24px] rounded-full text-[14px] whitespace-nowrap tracking-tight transition-colors duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] outline-none flex items-center justify-center min-w-[64px] sm:min-w-[80px]",
                isActive
                  ? "text-black font-semibold"
                  : "text-[#e5e5ea] font-medium hover:text-white disabled:opacity-30 disabled:pointer-events-none"
              )}
            >
              {/* Active sliding background capsule */}
              {isActive && (
                <motion.div
                  layoutId={resolvedLayoutId}
                  className="absolute inset-0 bg-white z-0 shadow-sm"
                  initial={{ borderRadius: 20 }}
                  animate={{ borderRadius: 20 }}
                  transition={{
                    type: "tween",
                    ease: [0.32, 0.72, 0, 1],
                    duration: 0.4
                  }}
                />
              )}
              <span className="relative z-10">{option.label}</span>
            </button>
          );
        })}
      </div>
    );
  }
);

SegmentedControl.displayName = "SegmentedControl";
