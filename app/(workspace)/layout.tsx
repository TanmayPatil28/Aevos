"use client";

import React, { useState, useEffect } from "react";
import WorkspaceCanvas from "@/components/layout/WorkspaceCanvas";
import WorkspaceAtmosphere from "@/components/layout/WorkspaceAtmosphere";
import WorkspacePanelContainer from "@/components/layout/WorkspacePanelContainer";
import GlobalTerminal from "@/components/ui/GlobalTerminal";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-[#000000] relative">
      <WorkspaceAtmosphere />

      {/* Workspace Canvas Container */}
      <WorkspaceCanvas>
        {children}
      </WorkspaceCanvas>

      {/* Embedded Intelligence Panel Slot */}
      <WorkspacePanelContainer />

      {/* Global AI Action Console */}
      <GlobalTerminal />
    </div>
  );
}
