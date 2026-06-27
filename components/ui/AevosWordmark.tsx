import React from "react";
import { cn } from "@/lib/cn";
import { AevosLogo } from "./AevosLogo";

interface AevosWordmarkProps {
  className?: string;
  inverted?: boolean;
}

export function AevosWordmark({ className, inverted = false }: AevosWordmarkProps) {
  return (
    <div className={cn("flex items-center group outline-none leading-none", className)}>
      <AevosLogo 
        inverted={inverted} 
        className="h-[1.15em] w-auto shrink-0 z-0" 
      />
      <span className={cn(
        "font-aevos font-thin tracking-tighter whitespace-nowrap -ml-[0.3em] relative z-10",
        "mix-blend-difference text-white"
      )}>
        evos
      </span>
    </div>
  );
}
