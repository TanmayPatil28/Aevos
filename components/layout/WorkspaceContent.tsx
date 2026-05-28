import React from "react";
import { useUSMStore } from "@/stores/usmStore";

interface WorkspaceContentProps {
  children: React.ReactNode;
  className?: string;
}

export default function WorkspaceContent({ children, className = "" }: WorkspaceContentProps) {
  const activePanel = useUSMStore(state => state.workspaceUi.activePanel);
  const isPanelOpen = activePanel !== "NONE";
  
  return (
    <div className={`transition-all duration-500 ease-out max-w-[1600px] mx-auto ${isPanelOpen ? "lg:pr-[440px]" : ""} px-4 md:px-8 w-full overflow-hidden ${className}`}>
      {children}
    </div>
  );
}
