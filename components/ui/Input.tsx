"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  floating?: boolean;
  error?: string;
  hasError?: boolean;
  isValid?: boolean;
  wrapperClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, floating = false, error, hasError = false, isValid = false, className, wrapperClassName, type = "text", ...props }, ref) => {
    const isError = hasError || !!error;

    return (
      <div className={cn("w-full flex flex-col gap-1.5", wrapperClassName)}>
        {label && !floating && (
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] px-1">
            {label}
          </label>
        )}
        <div className="relative group/input w-full">
          <input
            ref={ref}
            type={type}
            className={cn(
              "premium-input premium-focus",
              floating && "pt-7 pb-2",
              isError && "premium-input-error",
              isValid && !isError && "border-green-500/30 bg-green-500/5 focus:bg-green-500/5 focus:border-green-500",
              className
            )}
            {...props}
          />
          {label && floating && (
            <label className="absolute left-5 top-2 text-[9px] font-black uppercase tracking-[0.3em] text-[var(--color-text-secondary)]/50 pointer-events-none group-focus-within/input:text-[var(--color-primary)] transition-colors">
              {label}
            </label>
          )}
        </div>
        {error && (
          <span className="text-[var(--color-danger)] text-[10px] font-semibold px-1 mt-0.5 animate-fadeIn">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
