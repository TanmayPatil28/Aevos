"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import WorkspaceCanvas from "@/components/layout/WorkspaceCanvas";
import WorkspaceAtmosphere from "@/components/layout/WorkspaceAtmosphere";
import WorkspacePanelContainer from "@/components/layout/WorkspacePanelContainer";
import GlobalTerminal from "@/components/ui/GlobalTerminal";

import JarvisNervousSystem from "@/components/ai/JarvisNervousSystem";
import JarvisResumeModal from "@/components/ai/JarvisResumeModal";
import JarvisCommandCenter from "@/components/JarvisCommandCenter";
import { useUIStore } from "@/stores/uiStore";
import { cn } from "@/lib/cn";
import { Sidebar } from "@/components/ui/sidebar";
import { DynamicIsland } from "@/components/ui/dynamic-island";
import dynamic from "next/dynamic";
const SmartTimetableController = dynamic(() => import("@/components/dynamic-island/SmartTimetableController"), { ssr: false });
const BunkCalculatorController = dynamic(() => import("@/components/dynamic-island/BunkCalculatorController"), { ssr: false });
const InterventionAlertBridge = dynamic(() => import("@/components/dynamic-island/InterventionAlertBridge"), { ssr: false });
import IslandTestControls from "@/components/dynamic-island/IslandTestControls";
const ContextualIslandController = dynamic(() => import("@/components/dynamic-island/ContextualIslandController"), { ssr: false });

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { isJarvisCommandCenterOpen, closeJarvisCommandCenter, toggleJarvisCommandCenter } = useUIStore();
  const pathname = usePathname();
  const isTimeLiquidity = pathname === "/time-liquidity";
  const isAssignments = pathname === "/assignments";
  const isBacklogs = pathname === "/backlogs" || pathname === "/backlog";
  const isFullscreenApp = isAssignments || isBacklogs;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle with Cmd+J or Ctrl+J
      if (e.key.toLowerCase() === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleJarvisCommandCenter();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleJarvisCommandCenter]);

  return (
    <Sidebar>
      <div className={cn("bg-[#000000] relative flex flex-col w-full", (isFullscreenApp || isTimeLiquidity) ? "h-[100dvh]" : "min-h-[100dvh]")}>
        <JarvisNervousSystem />
        <JarvisResumeModal />
        <WorkspaceAtmosphere />

        {/* Jarvis Command Center Modal (Cmd+J) */}
        <div className={cn(
          "fixed inset-0 z-[150] transition-opacity duration-300 flex items-start justify-center pt-[10vh]",
          isJarvisCommandCenterOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}>
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md" 
            onClick={closeJarvisCommandCenter} 
          />
          <div className="relative w-full max-w-4xl px-4 z-10">
            <JarvisCommandCenter isOpen={isJarvisCommandCenterOpen} onClose={closeJarvisCommandCenter} />
          </div>
        </div>

        {/* Workspace Canvas Container */}
        <WorkspaceCanvas>
          {children}
        </WorkspaceCanvas>

        {/* Embedded Intelligence Panel Slot */}
        <WorkspacePanelContainer />

        {/* Global AI Action Console */}
        <GlobalTerminal />
        {!isFullscreenApp && <DynamicIsland />}
        <ContextualIslandController />
        <SmartTimetableController />
        <BunkCalculatorController />
        <InterventionAlertBridge />
        {process.env.NODE_ENV === "development" && <IslandTestControls />}
      </div>
    </Sidebar>
  );
}
