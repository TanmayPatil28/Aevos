"use client";

import React, { forwardRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  wrapperClassName?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className, wrapperClassName, ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className={cn("w-full flex flex-col gap-1.5", wrapperClassName)}>
        {label && (
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] px-1">
            {label}
          </label>
        )}
        <div className="relative group/select w-full">
          <select
            ref={ref}
            className={cn(
              "premium-input premium-focus appearance-none cursor-pointer pr-10",
              hasError && "premium-input-error",
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#0a0a0a] text-white">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-secondary)]">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
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

Select.displayName = "Select";

export default Select;
