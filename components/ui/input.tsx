"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement & HTMLTextAreaElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: "default" | "search" | "password";
  multiline?: boolean;
  wrapperClassName?: string;
}

const Input = React.forwardRef<any, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      variant = "default",
      multiline = false,
      wrapperClassName,
      type = "text",
      disabled,
      onChange,
      value,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const [val, setVal] = React.useState(value || defaultValue || "");
    const [isFocused, setIsFocused] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);

    React.useEffect(() => {
      if (value !== undefined) {
        setVal(value);
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) => {
      setVal(e.target.value);
      if (onChange) {
        onChange(e);
      }
    };

    const isError = !!error;
    const typeToUse = variant === "password" ? (showPassword ? "text" : "password") : type;

    // Accessibility IDs
    const errorId = React.useId();
    const helperId = React.useId();
    const describedBy = isError ? errorId : (helperText ? helperId : undefined);

    const containerClasses = cn(
      "relative flex items-center w-full rounded-xl backdrop-blur-md bg-white/[0.04] border border-white/[0.08] transition-all duration-300",
      multiline ? "h-auto py-3" : "h-12",
      disabled && "opacity-50 pointer-events-none cursor-not-allowed",
      isError
        ? "ring-2 ring-[#FF5252]/50 bg-[#FF5252]/5 border-[#FF5252]/50"
        : isFocused
        ? "ring-2 ring-white/20 bg-white/[0.08]"
        : "hover:bg-white/[0.06]",
      className
    );

    const inputClasses = cn(
      "w-full h-full bg-transparent px-4 outline-none text-base text-white placeholder-white/40",
      multiline && "resize-none min-h-[80px]",
      variant === "search" && "pl-11",
      variant === "password" && "pr-11"
    );

    return (
      <div className={cn("w-full flex flex-col gap-2", wrapperClassName)}>
        {label && (
          <label className="text-xs font-medium text-foreground-muted select-none px-1">
            {label}
          </label>
        )}
        <motion.div
          className={containerClasses}
          animate={isError ? { x: [0, -8, 8, -8, 0] } : undefined}
          transition={isError ? { duration: 0.3 } : undefined}
        >
          {variant === "search" && !multiline && (
            <span className="absolute left-4 flex items-center justify-center pointer-events-none">
              <svg
                className="w-4 h-4 text-white/50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
          )}
          {multiline ? (
            <textarea
              ref={ref}
              className={inputClasses}
              disabled={disabled}
              onFocus={(e) => {
                setIsFocused(true);
                if (props.onFocus) props.onFocus(e as any);
              }}
              onBlur={(e) => {
                setIsFocused(false);
                if (props.onBlur) props.onBlur(e as any);
              }}
              onChange={handleChange}
              value={val}
              aria-describedby={describedBy}
              {...(props as any)}
            />
          ) : (
            <input
              ref={ref}
              type={typeToUse}
              className={inputClasses}
              disabled={disabled}
              onFocus={(e) => {
                setIsFocused(true);
                if (props.onFocus) props.onFocus(e as any);
              }}
              onBlur={(e) => {
                setIsFocused(false);
                if (props.onBlur) props.onBlur(e as any);
              }}
              onChange={handleChange}
              value={val}
              aria-describedby={describedBy}
              {...props}
            />
          )}
          {variant === "password" && !multiline && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 flex items-center justify-center text-white/50 hover:text-white outline-none focus-visible:ring-1 focus-visible:ring-white/20 rounded-sm transition-colors"
              disabled={disabled}
            >
              {showPassword ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                  />
                </svg>
              )}
            </button>
          )}
        </motion.div>
        {isError ? (
          <span id={errorId} className="text-xs font-medium text-status-critical select-none px-1">
            {error}
          </span>
        ) : helperText ? (
          <span id={helperId} className="text-xs font-medium text-foreground-tertiary select-none px-1">
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
export default Input;
