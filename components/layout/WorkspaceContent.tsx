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
    <div className={`mx-auto transition-all duration-500 ease-out ${isPanelOpen ? "max-w-[1000px] lg:mr-[400px]" : "max-w-[1400px]"} px-4 md:px-8 xl:px-12 w-full overflow-hidden ${className}`}>
      {children}
    </div>
  );
}
