"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export const CustomSelect = ({ 
  value, 
  options, 
  onChange, 
  className = "",
  buttonClassName = "w-full flex items-center justify-between gap-2 bg-transparent outline-none truncate text-left focus-visible:ring-2 focus-visible:ring-[#10b981]/50 rounded-lg p-1 -m-1",
  dropdownClassName = "left-0 w-max min-w-[200px] max-w-[300px]",
  placeholder = "Select...",
  renderSelected,
  renderOption
}: { 
  value: string; 
  options: { label: string; value: string }[]; 
  onChange: (val: string) => void;
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  placeholder?: string;
  renderSelected?: (option: { label: string; value: string } | undefined) => React.ReactNode;
  renderOption?: (option: { label: string; value: string }) => React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const optionsContainerRef = React.useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(o => o.value === value);

  // Keyboard navigation for opening
  const handleOpenKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")) {
      e.preventDefault();
      setIsOpen(true);
      const currentIndex = options.findIndex(o => o.value === value);
      setHighlightedIndex(currentIndex > -1 ? currentIndex : 0);
    }
  };

  // Global keyboard navigation when open
  React.useEffect(() => {
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
  
  // ensure highlighted item scrolls into view
  React.useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && optionsContainerRef.current) {
      const button = optionsContainerRef.current.children[highlightedIndex] as HTMLElement;
      if (button) {
        button.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  return (
    <div className={`relative ${className}`}>
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
        className={buttonClassName}
      >
        {renderSelected 
          ? renderSelected(selectedOption) 
          : <span className="truncate text-[13px] tracking-tight">{selectedOption ? selectedOption.label : placeholder}</span>
        }
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 opacity-60 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={`absolute top-full mt-2 bg-[#1a1a1c]/95 backdrop-blur-xl border border-white/[0.08] shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-2xl z-50 overflow-hidden ${dropdownClassName}`}
            >
              <div 
                ref={optionsContainerRef}
                className="max-h-60 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-1.5 flex flex-col gap-0.5"
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
                    className={`w-full text-left px-3 py-2 text-sm transition-colors rounded-xl ${
                      opt.value === value 
                        ? "bg-white/[0.1] text-white font-bold" 
                        : highlightedIndex === index
                        ? "bg-white/[0.06] text-white"
                        : "text-white/80 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    {renderOption ? renderOption(opt) : opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
