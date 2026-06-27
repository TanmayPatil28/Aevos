"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  error?: string;
  className?: string;
  wrapperClassName?: string;
  placeholder?: string;
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ label, value, onChange, options, error, className, wrapperClassName, placeholder = "Select..." }, ref) => {
    const hasError = !!error;
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const optionsContainerRef = useRef<HTMLDivElement>(null);
    
    const selectedOption = options.find(o => o.value === value);

    const handleOpenKeyDown = (e: React.KeyboardEvent) => {
      if (!isOpen && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")) {
        e.preventDefault();
        setIsOpen(true);
        const currentIndex = options.findIndex(o => o.value === value);
        setHighlightedIndex(currentIndex > -1 ? currentIndex : 0);
      }
    };

    useEffect(() => {
      if (!isOpen) return;
      const handleDocumentKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
          case "Escape":
            e.preventDefault();
            setIsOpen(false);
            break;
          case "ArrowDown":
            e.preventDefault();
            setHighlightedIndex(prev => (prev < options.length - 1 ? prev + 1 : prev));
            break;
          case "ArrowUp":
            e.preventDefault();
            setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
            break;
          case "Enter":
          case " ":
            e.preventDefault();
            if (highlightedIndex >= 0 && highlightedIndex < options.length) {
              onChange(options[highlightedIndex].value);
              setIsOpen(false);
            }
            break;
          case "Tab":
            setIsOpen(false);
            break;
        }
      };
      document.addEventListener("keydown", handleDocumentKeyDown, { capture: true });
      return () => document.removeEventListener("keydown", handleDocumentKeyDown, { capture: true });
    }, [isOpen, highlightedIndex, options, onChange]);

    useEffect(() => {
      if (isOpen && highlightedIndex >= 0 && optionsContainerRef.current) {
        const button = optionsContainerRef.current.children[highlightedIndex] as HTMLElement;
        if (button) {
          button.scrollIntoView({ block: "nearest" });
        }
      }
    }, [highlightedIndex, isOpen]);

    return (
      <div className={cn("w-full flex flex-col gap-2", wrapperClassName)} ref={ref}>
        {label && (
          <label className="text-xs font-medium text-foreground-muted px-1 select-none">
            {label}
          </label>
        )}
        <div className="relative group/select w-full">
          <button
            type="button"
            onKeyDown={handleOpenKeyDown}
            onClick={() => {
              if (!isOpen) {
                 const currentIndex = options.findIndex(o => o.value === value);
                 setHighlightedIndex(currentIndex > -1 ? currentIndex : 0);
              }
              setIsOpen(!isOpen);
            }}
            className={cn(
              "w-full h-12 rounded-xl backdrop-blur-md bg-white/[0.04] border border-white/[0.08] text-base text-white px-4 flex items-center justify-between outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-white/20 hover:bg-white/[0.08]",
              hasError && "ring-2 ring-[#FF5252]/50 bg-[#FF5252]/5 border-[#FF5252]/50",
              className
            )}
          >
            <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
            <svg
              className={cn("w-4 h-4 opacity-60 transition-transform duration-300", isOpen && "rotate-180")}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <AnimatePresence>
            {isOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
                  className="absolute top-full left-0 w-full mt-2 bg-[#1d1d1f]/95 backdrop-blur-3xl border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.5)] rounded-2xl z-50 overflow-hidden"
                >
                  <div 
                    ref={optionsContainerRef}
                    className="max-h-60 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-2 flex flex-col gap-0.5"
                  >
                    {options.map((opt, index) => (
                      <button
                        key={opt.value}
                        type="button"
                        tabIndex={-1}
                        onClick={() => {
                          onChange(opt.value);
                          setIsOpen(false);
                        }}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        className={cn(
                          "w-full text-left px-3 py-2.5 text-base transition-colors rounded-lg flex items-center justify-between outline-none",
                          opt.value === value 
                            ? "bg-white/10 text-white font-medium shadow-sm" 
                            : highlightedIndex === index
                            ? "bg-white/[0.08] text-white"
                            : "text-white/80 hover:bg-white/[0.08] hover:text-white"
                        )}
                      >
                        {opt.label}
                        {opt.value === value && (
                          <svg className="w-4 h-4 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        {error && (
          <span className="text-status-critical text-[11px] font-medium px-1 mt-1 animate-fadeIn">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
export { Select };
export default Select;
