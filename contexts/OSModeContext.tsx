"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

export type OSMode = "unified" | "academic" | "career";

interface OSModeContextProps {
  mode: OSMode;
  setMode: (mode: OSMode) => void;
}

const OSModeContext = createContext<OSModeContextProps | undefined>(undefined);

export function OSModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<OSMode>("unified");
  const router = useRouter();
  const pathname = usePathname();

  // On mount, check if there's a saved mode, otherwise unified
  useEffect(() => {
    const savedMode = localStorage.getItem("gradeflow_os_mode") as OSMode;
    if (savedMode && ["unified", "academic", "career"].includes(savedMode)) {
      setModeState(savedMode);
    }
  }, []);

  const setMode = (newMode: OSMode) => {
    setModeState(newMode);
    localStorage.setItem("gradeflow_os_mode", newMode);
    
    // Auto-route to the dashboard if switching OS modes, to give immediate visual feedback
    if (pathname !== "/dashboard" && pathname !== "/") {
       router.push("/dashboard");
    }
  };

  return (
    <OSModeContext.Provider value={{ mode, setMode }}>
      <div data-os-mode={mode} className="flex min-h-screen flex-col w-full">
        {children}
      </div>
    </OSModeContext.Provider>
  );
}

export function useOSMode() {
  const context = useContext(OSModeContext);
  if (!context) {
    throw new Error("useOSMode must be used within an OSModeProvider");
  }
  return context;
}
