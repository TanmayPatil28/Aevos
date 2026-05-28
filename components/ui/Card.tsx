"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "accent" | "warning" | "danger";
  padding?: "sm" | "md" | "lg" | "xl";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, variant = "default", padding = "lg", ...props }, ref) => {
    const paddingStyles = {
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
      xl: "p-8 md:p-12",
    };

    const variantStyles = {
      default: "border-white/[0.06]",
      accent: "border-[var(--color-primary)]/30 shadow-[0_0_20px_rgba(79,142,247,0.1)]",
      warning: "border-amber-500/30 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.15)]",
      danger: "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 shadow-[0_0_20px_rgba(239,68,68,0.15)]",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "premium-card transition-all duration-500",
          paddingStyles[padding],
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;
