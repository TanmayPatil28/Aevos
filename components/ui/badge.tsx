"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full font-sans font-semibold text-[12px] tracking-[-0.12px] transition-colors select-none border-none",
  {
    variants: {
      variant: {
        default: "bg-[var(--brand-primary)]/15 text-[var(--brand-primary)]",
        secondary: "backdrop-blur-md bg-white/[0.08] border border-white/[0.08] text-white",
        success: "bg-[var(--status-success)]/15 text-[var(--status-success)]",
        warning: "bg-[var(--status-warning)]/15 text-[var(--status-warning)]",
        critical: "bg-[var(--status-critical)]/15 text-[var(--status-critical)]",
        info: "bg-[var(--status-info)]/15 text-[var(--status-info)]",
        brand: "bg-[var(--brand-secondary)]/15 text-[var(--brand-secondary)]",
      },
      size: {
        sm: "h-4 px-2 text-[12px] leading-4",
        md: "h-6 px-2 text-[12px] leading-6",
        lg: "h-8 px-4 text-[12px] leading-8",
      },
      count: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      { count: true, size: "sm", className: "min-w-[16px] px-1 font-mono" },
      { count: true, size: "md", className: "min-w-[24px] px-1 font-mono" },
      { count: true, size: "lg", className: "min-w-[24px] px-1 font-mono" },
    ],
    defaultVariants: {
      variant: "default",
      size: "md",
      count: false,
    },
  }
);

export interface BadgeProps
  extends Omit<HTMLMotionProps<"span">, keyof VariantProps<typeof badgeVariants> | "children">,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  removable?: boolean;
  onRemove?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  staggerIndex?: number;
  children?: React.ReactNode;
}

const dotColors = {
  default: "bg-[var(--brand-primary)]",
  success: "bg-[var(--status-success)]",
  warning: "bg-[var(--status-warning)]",
  critical: "bg-[var(--status-critical)]",
  info: "bg-[var(--status-info)]",
  brand: "bg-[var(--brand-secondary)]",
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      count = false,
      dot = false,
      removable = false,
      onRemove,
      staggerIndex,
      children,
      ...props
    },
    ref
  ) => {
    const delay = staggerIndex !== undefined ? staggerIndex * 0.05 : 0;

    return (
      <motion.span
        ref={ref}
        className={cn(badgeVariants({ variant, size, count }), className)}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 17,
          delay,
        }}
        {...props}
      >
        {dot && !count && (
          <span
            className={cn(
              "w-2 h-2 rounded-full mr-2 shrink-0",
              dotColors[variant || "default"] || dotColors.default
            )}
          />
        )}
        <span>{children}</span>
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-2 hover:bg-foreground/10 p-1 rounded-full transition-colors flex items-center justify-center outline-none focus-visible:ring-1 focus-visible:ring-border-focus relative before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:min-w-[44px] before:min-h-[44px] before:content-['']"
            aria-label="Remove badge"
          >
            <svg
              className="w-2 h-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </motion.span>
    );
  }
);

Badge.displayName = "Badge";

export { Badge, badgeVariants };
export default Badge;
