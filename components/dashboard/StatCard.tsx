"use client";

import { memo, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import AnimatedCounter from "../AnimatedCounter";
import { LucideIcon, TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";
import Card from "../ui/Card";

interface StatCardProps {
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  subtext: string;
  icon: LucideIcon;
  iconColor: string;
  glowColor: string;
  trend?: {
    value: string;
    isUp: boolean;
  };
  tooltip?: string;
}

const StatCard = memo(function StatCard({
  label,
  value,
  decimals = 2,
  suffix = "",
  subtext,
  icon: Icon,
  iconColor,
  glowColor,
  trend,
  tooltip
}: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 350, damping: 25, mass: 0.8 });
  const springY = useSpring(mouseY, { stiffness: 350, damping: 25, mass: 0.8 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - (left + width / 2)) * 0.15);
    mouseY.set((e.clientY - (top + height / 2)) * 0.15);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY, rotateX: useTransform(springY, [-10, 10], [5, -5]), rotateY: useTransform(springX, [-10, 10], [-5, 5]) }}
      className="group relative"
      title={tooltip}
    >
      <Card className="relative overflow-hidden">
        {/* Dynamic Light Sweep */}
        <div className="absolute inset-x-0 top-0 h-full overflow-hidden pointer-events-none group-hover:opacity-100 opacity-30 transition-opacity duration-700">
          <motion.div 
             animate={{ x: ["-150%", "250%"] }} 
             transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
             className="absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -skew-x-[45deg] z-0 blur-2xl" 
          />
        </div>

        <div className="flex justify-between items-start mb-6">
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] w-fit shadow-inner relative group-hover:scale-110 transition-transform duration-500">
             <Icon size={24} className={iconColor} strokeWidth={2.5} />
             <div className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity transition-all" style={{ backgroundColor: glowColor }} />
          </div>
          {trend && (
            <div className={cn(
               "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black tracking-tighter italic",
               trend.isUp ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
            )}>
              <TrendingUp size={14} strokeWidth={3} className={trend.isUp ? "" : "rotate-90"} />
              {trend.value}
            </div>
          )}
        </div>

        <div className="space-y-1.5 relative z-10">
          <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] font-body">{label}</p>
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-4xl font-black font-headline tracking-tighter text-white drop-shadow-xl">
              <AnimatedCounter target={value} decimals={decimals} />
              <span className="text-2xl ml-0.5 opacity-60 italic">{suffix}</span>
            </h3>
          </div>
          <p className="text-[12px] text-white/20 font-medium group-hover:text-white/40 transition-colors duration-500">
            {subtext}
          </p>
        </div>
        
        {/* Deep Atmosphere Glow */}
      </Card>
    </motion.div>
  );
});

export default StatCard;
