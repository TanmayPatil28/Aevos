"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useUSMStore } from "@/stores/usmStore";

interface WorkspaceCanvasProps {
  children: React.ReactNode;
  className?: string;
}

export default function WorkspaceCanvas({ children, className = "" }: WorkspaceCanvasProps) {
  const activePanel = useUSMStore(state => state.workspaceUi.activePanel);
  const isPanelOpen = activePanel !== "NONE";
  const pathname = usePathname();
  const isOnboarding = pathname === "/onboarding";

  return (
    <div 
      className={`relative w-full transition-[padding] duration-500 ${!isOnboarding ? 'pt-28 pb-24' : ''} ${isPanelOpen ? 'lg:pr-[420px]' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
