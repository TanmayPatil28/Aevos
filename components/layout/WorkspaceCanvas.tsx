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
  const isTimeLiquidity = pathname === "/time-liquidity";
  const isAssignments = pathname === "/assignments";
  const isBacklogs = pathname === "/backlogs" || pathname === "/backlog";
  const isPlacement = pathname === "/placement" || pathname === "/career";
  const isCalculator = pathname === "/calculator";
  const isDashboard = pathname === "/dashboard" || pathname === "/";
  const isFullscreenApp = isTimeLiquidity || isAssignments || isBacklogs;

  return (
    <div 
      className={`relative w-full transition-[padding] duration-500 ${
        isFullscreenApp 
          ? 'flex-1 flex flex-col h-full overflow-hidden' 
          : (isOnboarding || isPlacement || isCalculator || isDashboard) ? 'flex-1' : 'pt-28 pb-24 flex-1'
      } ${isPanelOpen ? 'lg:pr-[420px]' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
