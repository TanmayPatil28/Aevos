"use client";

import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageContainer({ children, className }: PageContainerProps) {
  return (
    <main className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 space-y-16 min-h-screen relative z-10", className)}>
      {children}
    </main>
  );
}
