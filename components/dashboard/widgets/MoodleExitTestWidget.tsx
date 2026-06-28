"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { MagneticWrapper } from "@/components/ui/MagneticWrapper";

export function MoodleExitTestWidget() {
  const [status, setStatus] = useState<"pending" | "passed">("pending");

  return (
    <Card 
      variant="default" 
      className="!p-6 border-white/5 transition-colors"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          {status === "passed" ? (
            <CheckCircle2 size={16} className="text-primary" />
          ) : (
            <AlertTriangle size={16} className="text-red-500" />
          )}
          <div className="flex flex-col">
            <h3 className="text-[14px] font-semibold text-foreground tracking-tight leading-tight">Moodle Exit Test</h3>
            <p className="text-[11px] text-foreground-muted uppercase tracking-wider font-semibold">Weekly Requirement</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        {status === "pending" && (
          <div className="text-[12px] text-foreground-muted leading-snug bg-surface p-3 rounded-lg border border-white/5">
            You must pass the mandatory Moodle exit test for this week's technical track to unlock the upcoming assignments.
          </div>
        )}

        <div className="flex items-center gap-3 w-full">
          {status === "pending" ? (
            <Button
              variant="primary"
              onClick={() => setStatus("passed")}
              className="flex-1 w-full text-[13px]"
            >
              Mark as Passed
            </Button>
          ) : (
            <div className="flex-1 bg-primary/10 text-primary border border-primary/20 py-2 px-4 rounded-full text-[13px] font-bold tracking-tight text-center cursor-default">
              Requirement Met
            </div>
          )}

          <a
            href="https://moodle.university.edu"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 flex items-center justify-center bg-surface border border-white/10 rounded-full hover:bg-white/10 transition-colors text-foreground-muted hover:text-foreground shrink-0"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </Card>
  );
}
