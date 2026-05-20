"use client";

import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  spacing?: "sm" | "md" | "lg";
}

export default function Section({ children, spacing = "md", className, ...props }: SectionProps) {
  const spacingStyles = {
    sm: "space-y-4 mb-6",
    md: "space-y-8 mb-12",
    lg: "space-y-12 mb-16",
  };

  return (
    <section className={cn(spacingStyles[spacing], className)} {...props}>
      {children}
    </section>
  );
}
