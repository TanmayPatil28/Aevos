"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import FocusModeWrapper from "@/components/workspace/FocusModeWrapper";

export default function BacklogRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to the unified Attendance dashboard with Backlogs mode activated
    router.replace("/attendance?mode=backlogs");
  }, [router]);

  return (
    <FocusModeWrapper title="Redirecting...">
      <div className="flex flex-col h-[60vh] items-center justify-center text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
        <p className="text-white/60 font-medium">Migrating to unified command center...</p>
      </div>
    </FocusModeWrapper>
  );
}
