"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useUSMStore } from "@/stores/usmStore";
import { AcademicIdentityState } from "@/types/academicProfile";

interface AcademicContextValue {
  identity: AcademicIdentityState;
  hasAuthoritativeData: boolean;
  presetId: string;
}

const AcademicContext = createContext<AcademicContextValue | undefined>(undefined);

export function AcademicStateProvider({ children }: { children: ReactNode }) {
  const store = useUSMStore();

  const value: AcademicContextValue = {
    identity: store.identity,
    hasAuthoritativeData: store.identity?.hasAuthoritativeData || false,
    presetId: store.presetId,
  };

  return (
    <AcademicContext.Provider value={value}>
      {children}
    </AcademicContext.Provider>
  );
}

export function useAcademicContext() {
  const context = useContext(AcademicContext);
  if (context === undefined) {
    throw new Error("useAcademicContext must be used within an AcademicStateProvider");
  }
  return context;
}
