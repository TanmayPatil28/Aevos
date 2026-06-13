"use client";

import { useUSMStore, WorkspaceState } from "@/stores/usmStore";
import { motion } from "framer-motion";
import { GraduationCap, Briefcase, LayoutDashboard, ChevronDown, Check, Sparkles, Activity } from "lucide-react";
import { cn } from "@/lib/cn";

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
    <div className="w-full px-6 pb-6 pt-2">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-5">
        <Sparkles size={14} className="text-white/30" />
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30">
          Operating System Mode
        </span>
      </div>

      {/* 4-Column Card Grid */}
      <div className="grid grid-cols-4 gap-3">
        {OS_MODES.map((m) => {
          const isActive = mode === m.id;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => {
                setWorkspaceMode(m.id as WorkspaceState["mode"]);
                onClose();
              }}
              className={cn(
                "relative flex flex-col items-center text-center p-5 rounded-2xl border transition-all duration-500 group overflow-hidden",
                isActive 
                  ? cn("border-white/15", m.glow, "bg-gradient-to-b", m.gradient)
                  : "border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.08]"
              )}
            >
              {/* Active indicator ring */}
              {isActive && (
                <motion.div 
                  layoutId="os-active-ring"
                  className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              {/* Icon */}
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all duration-500 relative",
                isActive 
                  ? cn(m.bg, "border", m.border)
                  : "bg-white/[0.03] border border-white/[0.05] group-hover:bg-white/[0.06]"
              )}>
                <Icon size={22} className={cn(
                  "transition-colors duration-500",
                  isActive ? m.color : "text-white/40 group-hover:text-white/70"
                )} />
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-lg">
                    <Check size={11} strokeWidth={3} className="text-black" />
                  </div>
                )}
              </div>

              {/* Label */}
              <span className={cn(
                "text-[14px] font-bold tracking-tight mb-1 transition-colors duration-300",
                isActive ? "text-white" : "text-white/60 group-hover:text-white/90"
              )}>
                {m.label}
              </span>

              {/* Description */}
              <span className={cn(
                "text-[11px] leading-relaxed transition-colors duration-300",
                isActive ? "text-white/50" : "text-white/25 group-hover:text-white/40"
              )}>
                {m.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
