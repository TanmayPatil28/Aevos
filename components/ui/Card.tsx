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
      sm: "p-3 rounded-2xl", // 20px outer = 16px padding + 4px inner
      md: "p-6 rounded-card-large", // 28px outer = 24px padding + 4px inner
      lg: "p-6 rounded-card-large", // 28px outer
      xl: "p-8 rounded-card-massive", // 48px outer = 32px padding + 16px inner
    };

    const variantStyles = {
      default: "bg-surface-raised border-none shadow-none",
      accent: "bg-surface-raised border-none shadow-none",
      warning: "bg-surface-raised border-none shadow-none",
      danger: "bg-surface-raised border-none shadow-none",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden",
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
