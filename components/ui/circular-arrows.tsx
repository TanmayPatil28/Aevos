"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export interface CircularArrowButtonProps
  extends Omit<HTMLMotionProps<"button">, "children"> {
  direction?: "left" | "right" | "up" | "down";
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
}

const CircularArrowButton = React.forwardRef<HTMLButtonElement, CircularArrowButtonProps>(
  (
    {
      className,
      direction = "left",
      size = "md",
      disabled = false,
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    // Sizing mapping based on 8pt/4pt layout grid
    const sizeClasses = {
      sm: "w-8 h-8 relative before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:min-w-[44px] before:min-h-[44px] before:content-['']",
      md: "w-10 h-10 relative before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:min-w-[44px] before:min-h-[44px] before:content-['']",
      lg: "w-12 h-12",
    };

    const iconSizes = {
      sm: "w-4 h-4",
      md: "w-4 h-4",
      lg: "w-6 h-6",
    };

    // Render default icons based on direction if no children provided
    const defaultIcon = () => {
      const iconClass = iconSizes[size];
      switch (direction) {
        case "right":
          return <ChevronRight className={iconClass} />;
        case "up":
          return <ChevronUp className={iconClass} />;
        case "down":
          return <ChevronDown className={iconClass} />;
        case "left":
        default:
          return <ChevronLeft className={iconClass} />;
      }
    };

    // Animations config
    const hoverAnimation = disabled ? undefined : { scale: 1.05 };
    const tapAnimation = disabled ? undefined : { scale: 0.95 };
    const springTransition = disabled ? undefined : { type: "spring", stiffness: 400, damping: 17 };

    // Default ARIA labels if none provided
    const defaultAriaLabel = () => {
      switch (direction) {
        case "right":
          return "Next";
        case "up":
          return "Go up";
        case "down":
          return "Go down";
        case "left":
        default:
          return "Previous";
      }
    };

    return (
      <motion.button
        ref={ref}
        type="button"
        disabled={disabled}
        onClick={onClick}
        whileHover={hoverAnimation}
        whileTap={tapAnimation}
        transition={springTransition}
        aria-label={props["aria-label"] || defaultAriaLabel()}
        className={cn(
          "rounded-full aspect-square flex items-center justify-center select-none outline-none transition-colors",
          "backdrop-blur-md bg-white/[0.08] border border-white/[0.15] text-white/90 shadow-sm",
          "focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          disabled
            ? "opacity-50 text-white/40 bg-white/[0.02] border-white/[0.05] pointer-events-none"
            : "hover:bg-white/[0.15] hover:text-white active:bg-white/[0.20] cursor-pointer",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children || defaultIcon()}
      </motion.button>
    );
  }
);

CircularArrowButton.displayName = "CircularArrowButton";

export interface CircularArrowsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  onPrev?: () => void;
  onNext?: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  prevAriaLabel?: string;
  nextAriaLabel?: string;
  size?: "sm" | "md" | "lg";
  spacing?: "sm" | "md" | "lg";
  direction?: "horizontal" | "vertical";
  renderPrev?: (props: CircularArrowButtonProps) => React.ReactNode;
  renderNext?: (props: CircularArrowButtonProps) => React.ReactNode;
}

const CircularArrows = React.forwardRef<HTMLDivElement, CircularArrowsProps>(
  (
    {
      className,
      onPrev,
      onNext,
      prevDisabled = false,
      nextDisabled = false,
      prevAriaLabel = "Previous",
      nextAriaLabel = "Next",
      size = "md",
      spacing = "md",
      direction = "horizontal",
      renderPrev,
      renderNext,
      ...props
    },
    ref
  ) => {
    // Spacing classes based on 8pt/4pt layout grid: gap-2 (8px), gap-3 (12px), gap-4 (16px)
    const gapClass = spacing === "sm" ? "gap-2" : spacing === "lg" ? "gap-4" : "gap-4";
    const layoutClass = direction === "vertical" ? "flex-col" : "flex-row";

    // Keyboard navigation helper for Arrow keys
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const isHorizontal = direction === "horizontal";
      const isVertical = direction === "vertical";

      if (
        (isHorizontal && (e.key === "ArrowLeft" || e.key === "ArrowRight")) ||
        (isVertical && (e.key === "ArrowUp" || e.key === "ArrowDown"))
      ) {
        e.preventDefault();
        
        // Query only buttons that are children of this component and not disabled
        const buttons = Array.from(
          e.currentTarget.querySelectorAll("button:not([disabled])")
        ) as HTMLButtonElement[];

        if (buttons.length < 2) return;

        const active = document.activeElement as HTMLButtonElement;
        const index = buttons.indexOf(active);

        if (index === -1) {
          buttons[0].focus();
        } else {
          const nextIndex = (index + 1) % buttons.length;
          buttons[nextIndex].focus();
        }
      }

      if (props.onKeyDown) {
        props.onKeyDown(e);
      }
    };

    return (
      <div
        ref={ref}
        role="group"
        aria-label="Navigation controls"
        onKeyDown={handleKeyDown}
        className={cn("flex items-center", gapClass, layoutClass, className)}
        {...props}
      >
        {renderPrev ? (
          renderPrev({
            direction: direction === "vertical" ? "up" : "left",
            size,
            disabled: prevDisabled,
            onClick: onPrev,
            "aria-label": prevAriaLabel,
          })
        ) : (
          <CircularArrowButton
            direction={direction === "vertical" ? "up" : "left"}
            size={size}
            disabled={prevDisabled}
            onClick={onPrev}
            aria-label={prevAriaLabel}
          />
        )}
        {renderNext ? (
          renderNext({
            direction: direction === "vertical" ? "down" : "right",
            size,
            disabled: nextDisabled,
            onClick: onNext,
            "aria-label": nextAriaLabel,
          })
        ) : (
          <CircularArrowButton
            direction={direction === "vertical" ? "down" : "right"}
            size={size}
            disabled={nextDisabled}
            onClick={onNext}
            aria-label={nextAriaLabel}
          />
        )}
      </div>
    );
  }
);

CircularArrows.displayName = "CircularArrows";

export { CircularArrows, CircularArrowButton };
