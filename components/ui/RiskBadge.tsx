import React from "react";
import { ShieldCheck, AlertTriangle, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/cn";

export interface RiskBadgeProps {
  risk: "LOW" | "MEDIUM" | "HIGH";
  className?: string;
}

export function RiskBadge({ risk, className }: RiskBadgeProps) {
  const config = {
    LOW: {
      color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      icon: ShieldCheck,
      text: "Low Risk",
    },
    MEDIUM: {
      color: "bg-amber-500/10 border-amber-500/20 text-amber-400",
      icon: AlertTriangle,
      text: "Medium Risk",
    },
    HIGH: {
      color: "bg-rose-500/10 border-rose-500/20 text-rose-400",
      icon: AlertOctagon,
      text: "High Risk",
    },
  };

  const current = config[risk] || config.LOW;
  const Icon = current.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
        current.color,
        className
      )}
    >
      <Icon size={12} className="stroke-[2.5]" />
      {current.text}
    </span>
  );
}
