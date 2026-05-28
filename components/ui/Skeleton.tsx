import React from "react";
import { cn } from "@/lib/cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "card" | "stat" | "circle" | "default";
}

export function Skeleton({ className, variant = "default", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded bg-white/5 relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent",
        {
          "h-4 w-full": variant === "text",
          "h-36 w-full rounded-2xl border border-white/5 bg-[#000000]/50": variant === "card",
          "h-24 w-full rounded-xl border border-white/5 p-4 bg-[#000000]/30": variant === "stat",
          "h-12 w-12 rounded-full": variant === "circle",
        },
        className
      )}
      {...props}
    />
  );
}
