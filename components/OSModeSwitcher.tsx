"use client";

import { useUSMStore, WorkspaceState } from "@/stores/usmStore";
import { motion } from "framer-motion";
import { GraduationCap, Briefcase, LayoutDashboard, ChevronDown, Check, Sparkles, Activity } from "lucide-react";
import { cn } from "@/lib/cn";
import { SegmentedControl } from "@/components/ui/segmented-control";

// We map our visual modes to the internal USM WorkspaceModes
export const OS_MODES = [
  { 
    id: "DEFAULT", 
    label: "Academic", 
    desc: "Grade calculation, attendance tracking, and semester planning tools.",
    icon: GraduationCap, 
    color: "text-blue-400", 
    bg: "bg-blue-500/10", 
    border: "border-blue-500/20",
    gradient: "from-blue-500/20 to-blue-600/5",
    glow: "shadow-[0_0_30px_rgba(59,130,246,0.15)]",
    accentBg: "bg-blue-500",
  },
  { 
    id: "OPTIMIZATION", 
    label: "Unified OS", 
    desc: "Full suite — academic, career, and strategic tools in one unified workspace.",
    icon: LayoutDashboard, 
    color: "text-white", 
    bg: "bg-white/5", 
    border: "border-white/10",
    gradient: "from-white/10 to-white/[0.02]",
    glow: "shadow-[0_0_30px_rgba(255,255,255,0.05)]",
    accentBg: "bg-white",
  },
  { 
    id: "FOCUS", 
    label: "Career", 
    desc: "Placement prediction, skill gap analysis, and career roadmap generation.",
    icon: Briefcase, 
    color: "text-purple-400", 
    bg: "bg-purple-500/10", 
    border: "border-purple-500/20",
    gradient: "from-purple-500/20 to-purple-600/5",
    glow: "shadow-[0_0_30px_rgba(168,85,247,0.15)]",
    accentBg: "bg-purple-500",
  },
  {
    id: "RECOVERY",
    label: "Recovery",
    desc: "Emergency mode triggered by JARVIS for attendance or backlog interventions.",
    icon: Activity,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    gradient: "from-red-500/20 to-red-600/5",
    glow: "shadow-[0_0_30px_rgba(239,68,68,0.15)]",
    accentBg: "bg-red-500",
  }
];

export function OSModeTrigger({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  const mode = useUSMStore(s => s.workspaceUi.mode);
  const active = OS_MODES.find(m => m.id === mode) || OS_MODES[0];
  const ActiveIcon = active.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        "h-10 px-3 md:px-4 rounded-full flex items-center gap-2 border transition-all duration-300 shadow-inner group",
        active.bg, active.border,
        isOpen ? "bg-white/10 border-white/20" : "hover:bg-white/10"
      )}
    >
      <ActiveIcon size={16} className={active.color} />
      <span className={cn("text-[13px] font-bold tracking-tight hidden md:block", active.color)}>
        {active.label}
      </span>
      <ChevronDown size={14} className={cn("text-white/40 transition-transform duration-300", isOpen && "rotate-180")} />
    </button>
  );
}

export function OSModeContent({ onClose }: { onClose: () => void }) {
  const mode = useUSMStore(s => s.workspaceUi.mode);
  const setWorkspaceMode = useUSMStore(s => s.setWorkspaceMode);

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-[16px] font-medium text-[#F5F5F7] tracking-tight">System Architecture</h2>
        <span className="text-[13px] text-[#86868B] font-medium tracking-wide">Core OS Frame</span>
      </div>

      <div className="grid grid-cols-1 gap-6 px-2 pb-2">
        <SegmentedControl
          value={mode}
          onChange={(val) => setWorkspaceMode(val as WorkspaceState["mode"])}
          options={OS_MODES.map((m) => ({
            value: m.id,
            label: (
              <div className="flex items-center gap-2">
                <m.icon size={14} />
                <span>{m.label}</span>
              </div>
            )
          }))}
        />

        {OS_MODES.map((m) => {
          if (m.id !== mode) return null;
          const Icon = m.icon;
          return (
            <div key={m.id} className="p-6 bg-[#3a3a3c] rounded-[24px] border-[0.8px] border-[rgba(255,255,255,0.08)] flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-[12px] flex items-center justify-center bg-[#1c1c1e] border-[0.8px] border-[rgba(255,255,255,0.08)]", m.color)}>
                  <Icon size={18} />
                </div>
                <h3 className="text-[16px] font-medium text-[#F5F5F7] tracking-tight">{m.label} Mode Active</h3>
              </div>
              <p className="text-[14px] text-[#86868B] leading-relaxed font-medium">
                {m.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
