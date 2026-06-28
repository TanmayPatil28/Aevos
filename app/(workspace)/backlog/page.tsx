"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import FocusModeWrapper from "@/components/workspace/FocusModeWrapper";
import { Compass } from "lucide-react";

export default function BacklogRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to the unified Attendance dashboard with Backlogs mode activated
    router.replace("/attendance?mode=backlogs");
  }, [router]);

  return (
    <FocusModeWrapper title="Redirecting...">
      <div className="flex flex-col h-[60vh] items-center justify-center text-center space-y-6">
        <div className="relative flex items-center justify-center w-16 h-16 mb-2">
          <div className="absolute inset-0 bg-brand/10 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-2 bg-brand/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
          <Compass className="w-6 h-6 text-brand animate-pulse" />
        </div>
        <p className="text-foreground-muted text-[11px] font-bold uppercase tracking-widest">Migrating to unified command center...</p>
      </div>
    </FocusModeWrapper>
  );
}
