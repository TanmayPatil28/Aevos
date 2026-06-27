"use client";

import React from "react";
import { cn } from "@/lib/cn";

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  label?: string;
}

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ className, orientation = "horizontal", label, ...props }, ref) => {
    const isHorizontal = orientation === "horizontal";

    if (isHorizontal) {
      if (label) {
        return (
          <div
            ref={ref}
            className={cn("flex items-center w-full my-4 select-none", className)}
            {...props}
          >
            <div className="flex-grow h-px bg-[var(--border-apple)]/15" />
            <span className="px-3 text-xs font-medium text-foreground-tertiary uppercase tracking-[1px]">
              {label}
            </span>
            <div className="flex-grow h-px bg-[var(--border-apple)]/15" />
          </div>
        );
      }

      return (
        <div
          ref={ref}
          className={cn("w-full h-px bg-[var(--border-apple)]/15 my-4", className)}
          {...props}
        />
      );
    } else {
      // Vertical divider
      if (label) {
        return (
          <div
            ref={ref}
            className={cn("flex flex-col items-center h-full mx-4 select-none", className)}
            {...props}
          >
            <div className="flex-grow w-px bg-[var(--border-apple)]/15" />
            <span className="py-2 text-xs font-medium text-foreground-tertiary uppercase tracking-[1px]">
              {label}
            </span>
            <div className="flex-grow w-px bg-[var(--border-apple)]/15" />
          </div>
        );
      }

      return (
        <div
          ref={ref}
          className={cn("h-full w-px bg-[var(--border-apple)]/15 mx-4 self-stretch", className)}
          {...props}
        />
      );
    }
  }
);

Divider.displayName = "Divider";

export { Divider };
export default Divider;
