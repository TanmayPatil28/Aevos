"use client";

import React from "react";
import { useUSMStore } from "@/stores/usmStore";

interface WorkspaceCanvasProps {
  children: React.ReactNode;
  className?: string;
}

export default function WorkspaceCanvas({ children, className = "" }: WorkspaceCanvasProps) {
  const activePanel = useUSMStore(state => state.workspaceUi.activePanel);
  const isPanelOpen = activePanel !== "NONE";

  return (
    <div 
      className={`relative z-10 w-full pt-28 pb-24 ${className}`}
    >
      {children}
    </div>
  );
}
