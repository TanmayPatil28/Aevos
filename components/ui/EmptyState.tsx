import React from "react";
import { LucideIcon } from "lucide-react";
import GlowButton from "../GlowButton";
import GlassCard from "../GlassCard";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <GlassCard className="flex flex-col items-center justify-center text-center p-8 border-dashed border-white/10 bg-[#000000]/20">
      <div className="p-4 rounded-full bg-white/5 border border-white/10 text-slate-400 mb-4">
        <Icon size={32} className="stroke-[1.5]" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <GlowButton variant="primary" onClick={onAction}>
          {actionLabel}
        </GlowButton>
      )}
    </GlassCard>
  );
}
