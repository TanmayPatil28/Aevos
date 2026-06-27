"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center rounded-full font-sans transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-30 disabled:!bg-white/[0.08] disabled:!text-white disabled:!border-white/[0.04] disabled:!backdrop-blur-md disabled:pointer-events-none select-none",
  {
    variants: {
      variant: {
        primary: "bg-[#A4C639] text-black font-semibold border-none shadow-none hover:bg-[#A4C639]/90 active:bg-[#A4C639]/80",
        secondary: "backdrop-blur-md bg-white/[0.08] border border-white/[0.08] text-white hover:bg-white/[0.12] active:bg-white/[0.16] shadow-none",
        ghost: "text-foreground-muted hover:bg-white/[0.08] hover:text-white bg-transparent border-none shadow-none",
        danger: "bg-[#FF5252] text-white border-none shadow-none hover:bg-[#FF5252]/90 active:bg-[#FF5252]/80",
        icon: "backdrop-blur-md bg-white/[0.08] text-white hover:bg-white/[0.12] active:bg-white/[0.16] flex items-center justify-center p-0 aspect-square border border-white/[0.08] shadow-none",
      },
      size: {
        sm: "h-8 px-2 text-xs leading-[16px] font-medium relative before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:min-w-[44px] before:min-h-[44px] before:content-['']",
        md: "h-10 px-4 text-sm leading-[20px] font-medium relative before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:min-w-[44px] before:min-h-[44px] before:content-['']",
        lg: "h-12 px-6 text-base leading-[20px] font-medium",
        xl: "h-14 px-8 text-base leading-[24px] font-medium",
      },
    },
    compoundVariants: [
      { variant: "icon", size: "sm", className: "w-8 p-0" },
      { variant: "icon", size: "md", className: "w-10 p-0" },
      { variant: "icon", size: "lg", className: "w-12 p-0" },
      { variant: "icon", size: "xl", className: "w-[var(--space-14)] p-0" },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, keyof VariantProps<typeof buttonVariants> | "children">,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    const isDisabled = disabled || loading;

    const hoverAnimation = {};

    const tapAnimation = isDisabled ? {} : { scale: 0.96 };
    const transition = isDisabled ? {} : { type: "spring", stiffness: 400, damping: 20 };

    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={isDisabled}
        whileHover={hoverAnimation}
        whileTap={tapAnimation}
        transition={transition}
        aria-busy={loading}
        {...props}
      >
        <span
          className={cn(
            "inline-flex items-center justify-center gap-2 w-full h-full",
            loading ? "opacity-0" : "opacity-100"
          )}
        >
          {children}
        </span>
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg
              className="animate-spin h-4 w-4 text-current"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-75"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                d="M12 2C6.47715 2 2 6.47715 2 12"
              />
            </svg>
            <span className="sr-only">Loading</span>
          </span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
