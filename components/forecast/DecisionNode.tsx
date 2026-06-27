"use client";

import React from "react";
import { motion } from "framer-motion";
import { DecisionNode as DecisionNodeType } from "@/lib/forecasting/decisionTypes";
import { cn } from "@/lib/cn";
import { BookOpen, Briefcase, Heart, ChevronRight, Lock } from "lucide-react";
import Card from "@/components/ui/Card";

interface DecisionNodeProps {
  node: DecisionNodeType;
  isActive: boolean;
  isAvailable: boolean;
  onClick: (nodeId: string) => void;
  style?: React.CSSProperties;
}

export default function DecisionNode({ node, isActive, isAvailable, onClick, style }: DecisionNodeProps) {
  const categoryConfigs = {
    academic: { icon: BookOpen, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
    career: { icon: Briefcase, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
    life: { icon: Heart, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" }
  };

  const isPremium = node.isPremium;
  const config = categoryConfigs[node.category];
  const Icon = config.icon;

  return (
    <motion.button
      style={style}
      disabled={!isAvailable && !isActive}
      onClick={() => onClick(node.id)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: isActive || isAvailable ? 1 : 0.4, 
        scale: isActive ? 1.05 : 1,
        filter: isAvailable && !isActive && !isPremium ? "grayscale(40%)" : "grayscale(0%)"
      }}
      whileHover={isAvailable ? { scale: isActive ? 1.05 : 1.02, y: -2 } : {}}
      className={cn(
        "relative w-64 text-left transition-all duration-300 block",
        !isAvailable && !isActive ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      )}
    >
      <Card
        variant="default"
        padding="md"
        className={cn(
          "h-full w-full transition-all duration-300 overflow-hidden",
          isActive 
            ? `ring-1 ring-white/40 shadow-[0_0_30px_-5px_rgba(255,255,255,0.1)] ${config.bg}` 
            : isPremium 
              ? "ring-1 ring-amber-500/40 bg-gradient-to-br from-amber-500/10 to-transparent shadow-[0_0_15px_-5px_rgba(245,158,11,0.2)]"
              : "ring-1 ring-transparent hover:ring-white/20"
        )}
      >
      {/* Background Glow */}
      {isActive && (
        <div className={cn("absolute inset-0 blur-2xl opacity-20", config.bg)} />
      )}
      {isPremium && !isActive && (
        <div className="absolute inset-0 blur-xl opacity-10 bg-amber-500" />
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className={cn("p-2 rounded-xl", isPremium ? "bg-amber-500/20" : config.bg)}>
            <Icon size={16} className={isPremium ? "text-amber-400" : config.color} />
          </div>
          
          <div className="flex items-center gap-2">
            {isPremium && (
              <div className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-[9px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
                PRO <Lock size={8} />
              </div>
            )}
            
            {isActive && (
              <motion.div
                layoutId="active-node-indicator"
                className={cn("w-2 h-2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] bg-white")}
              />
            )}
          </div>
        </div>

        <h4 className={cn("text-sm font-semibold mb-1 leading-tight text-foreground tracking-tight")}>
          {node.title}
        </h4>
        <p className="text-[11px] text-foreground-muted leading-snug line-clamp-2">
          {node.description}
        </p>

        {isActive && node.nextOptions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center text-[10px] text-white/40 font-semibold uppercase tracking-wider">
            <span>Make next choice</span>
            <ChevronRight size={12} />
          </div>
        )}
      </div>
      </Card>
    </motion.button>
  );
}
