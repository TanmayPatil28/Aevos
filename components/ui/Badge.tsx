"use client";

import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "primary" | "neutral";
  size?: "sm" | "md";
}

export default function Badge({
  children,
  variant = "neutral",
  size = "md",
  className,
  ...props
}: BadgeProps) {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[9px] tracking-wider",
    md: "px-2.5 py-1 text-[10px] sm:text-xs tracking-widest",
  };

  const variantStyles = {
    primary: "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20 shadow-[0_0_10px_rgba(59,130,248,0.15)]",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.15)]",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.15)]",
    danger: "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-[var(--color-danger)]/20 shadow-[0_0_10px_rgba(239,68,68,0.15)]",
    neutral: "bg-white/5 text-white/60 border-white/10",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-black uppercase border rounded-full italic transition-all duration-300",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
