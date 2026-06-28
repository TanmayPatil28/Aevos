"use client";

import React, { useState, useEffect } from "react";
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

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { isJarvisCommandCenterOpen, closeJarvisCommandCenter, toggleJarvisCommandCenter } = useUIStore();

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
      <div className="min-h-[100dvh] bg-[#000000] relative">
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
      </div>
    </Sidebar>
  );
}
