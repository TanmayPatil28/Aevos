import { useRef } from "react";
import { useMotionValue, useSpring } from "framer-motion";
import { Calculator, Calendar, Download, ArrowRight, Loader2, Zap, LucideIcon } from "lucide-react";
import { useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import { motion } from "framer-motion";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Liquid Action Tile ---
function LiquidActionTile({
  href,
  onClick,
  icon: Icon,
  label,
  description,
  variant = "primary"
}: {
  href?: string,
  onClick?: () => void,
  icon: LucideIcon,
  label: string,
  description: string,
  variant?: "primary" | "secondary" | "ghost"
}) {
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

  const content = (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={cn(
        "relative p-6 rounded-2xl border transition-all duration-500 flex items-center justify-between group overflow-hidden shadow-2xl",
        variant === "primary" ? "bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED] border-transparent text-white" :
          variant === "secondary" ? "bg-[#A855F7]/10 border-[#A855F7]/20 text-[#A855F7] hover:bg-[#A855F7]/20" :
            "bg-white/[0.03] border-white/[0.05] text-white hover:bg-white/[0.05]"
      )}
    >
      <div className="flex items-center gap-4 relative z-10">
        <div className={cn(
          "p-3 rounded-2xl transition-transform duration-500 group-hover:scale-110",
          variant === "primary" ? "bg-white/20" : "bg-white/[0.05]"
        )}>
          <Icon size={22} strokeWidth={2.5} />
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-black tracking-tight">{label}</p>
          <p className={cn("text-[10px] font-bold uppercase tracking-widest opacity-40 group-hover:opacity-60 transition-opacity")}>
            {description}
          </p>
        </div>
      </div>
      <ArrowRight size={20} strokeWidth={3} className="relative z-10 group-hover:translate-x-1 transition-transform" />

      {/* Light Sweep */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity duration-700">
        <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white to-transparent -skew-x-[45deg] z-0 blur-xl" />
      </div>
    </motion.div>
  );

  if (href) return <Link href={href} className="block">{content}</Link>;
  return <button onClick={onClick} className="w-full text-left bg-transparent border-none p-0 cursor-pointer">{content}</button>;
}

export default function QuickActions({ onExportPDF }: { onExportPDF: () => void }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    await onExportPDF();
    setTimeout(() => setIsExporting(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="premium-card flex flex-col h-fit group"
    >

      <div className="flex items-center gap-3 mb-8 relative z-10">
        <Zap size={22} strokeWidth={3} className="text-[#4F8EF7]" />
        <h3 className="text-xl font-black font-headline tracking-tighter text-white">Neural Actions</h3>
      </div>

      <div className="flex flex-col gap-5 relative z-10">
        <LiquidActionTile
          href="/calculator"
          label="Initialize Core"
          description="New GPA Calculation"
          icon={Calculator}
          variant="primary"
        />

        <LiquidActionTile
          href="/planner"
          label="Path Optimization"
          description="Update Semester Plan"
          icon={Calendar}
          variant="secondary"
        />

        <LiquidActionTile
          onClick={handleExport}
          label={isExporting ? "Rendering Telemetry..." : "Export Spectrum"}
          description="Generate Full PDF Report"
          icon={isExporting ? Loader2 : Download}
          variant="ghost"
        />
      </div>
    </motion.div>
  );
}
