"use client";

import React, { ReactNode, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";

export interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: "top" | "right" | "bottom" | "left" | "bottom-right";
  delay?: number;
  className?: string;
  triggerClassName?: string;
}

const positionStyles = {
  top: "bottom-full left-1/2 -translate-x-1/2 pb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 pt-2",
  left: "right-full top-1/2 -translate-y-1/2 pr-2",
  right: "left-full top-1/2 -translate-y-1/2 pl-2",
  "bottom-right": "top-full right-0 pt-2",
};

const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = "top",
  delay = 150, // Updated default delay to 150ms
  className,
  triggerClassName,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipId = React.useId();

  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      className={cn("relative inline-block", className)}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {/* Trigger wrapper */}
      <div aria-describedby={isVisible ? tooltipId : undefined} tabIndex={0} className={cn("inline-block outline-none transition-all duration-300", isVisible ? "relative z-50" : "", triggerClassName)}>
        {children}
      </div>

      <AnimatePresence>
        {isVisible && (
          <>
            {/* Full screen backdrop blur without dimming */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="fixed inset-0 z-40 bg-transparent backdrop-blur-[4px] pointer-events-none"
            />
            
            {/* Tooltip Content */}
            <div className={cn("absolute z-50 pointer-events-none", positionStyles[position])}>
              <motion.div
                id={tooltipId}
                role="tooltip"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="w-max px-4 py-3 text-xs font-medium text-zinc-300 bg-[#09090b]/95 backdrop-blur-3xl border border-zinc-800/80 shadow-2xl rounded-xl max-w-[320px] text-left whitespace-normal break-words"
              >
                {content}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export { Tooltip };
export default Tooltip;
