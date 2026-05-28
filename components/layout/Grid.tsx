"use client";

import React from "react";
import { cn } from "@/lib/cn";

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | { mobile?: number; tablet?: number; desktop?: number };
  gap?: "sm" | "md" | "lg";
}

export default function Grid({ children, cols = 3, gap = "md", className, ...props }: GridProps) {
  const gapStyles = {
    sm: "gap-4",
    md: "gap-8",
    lg: "gap-12",
  };

  // Convert responsive cols config to grid classes
  let gridColsClass = "grid-cols-1"; // Mobile defaults to 1 column

  if (typeof cols === "number") {
    // If it's a number, enforce standard responsive rules:
    // mobile = 1, tablet (sm/md) = max 2, desktop = max 4 (capped at cols value)
    const tabletCols = Math.min(2, cols);
    const desktopCols = Math.min(4, cols);
    
    gridColsClass = `grid-cols-1 sm:grid-cols-${tabletCols} lg:grid-cols-${desktopCols}`;
  } else {
    // Custom responsive configuration, but still capped under system bounds
    const mobile = cols.mobile || 1;
    const tablet = Math.min(2, cols.tablet || 2);
    const desktop = Math.min(4, cols.desktop || 3);
    
    gridColsClass = `grid-cols-${mobile} sm:grid-cols-${tablet} lg:grid-cols-${desktop}`;
  }

  return (
    <div
      className={cn("grid", gridColsClass, gapStyles[gap], className)}
      {...props}
    >
      {children}
    </div>
  );
}
