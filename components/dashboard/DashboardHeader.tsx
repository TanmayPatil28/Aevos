import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Download, FileText, Trash2, Sparkles, LucideIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUniversity } from '@/components/providers/UniversityProvider';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Liquid Action Button ---
function LiquidActionButton({
  onClick,
  icon: Icon,
  label,
  variant = 'primary',
}: {
  onClick: () => void;
  icon: LucideIcon;
  label: string;
  variant?: 'primary' | 'secondary' | 'error';
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 400, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 400, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - (left + width / 2)) * 0.25);
    mouseY.set((e.clientY - (top + height / 2)) * 0.25);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const variantStyles = {
    primary: 'border-[#4F8EF7]/30 text-[#4F8EF7] hover:bg-[#4F8EF7]/10',
    secondary: 'border-[#A855F7]/30 text-[#A855F7] hover:bg-[#A855F7]/10',
    error: 'border-red-400/30 text-red-400 hover:bg-red-400/10',
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      onClick={onClick}
      className={cn(
        'relative px-6 py-2.5 rounded-full border bg-white/[0.02] backdrop-blur-xl transition-all duration-500',
        'text-sm font-black tracking-tight flex items-center gap-2.5 group overflow-hidden shadow-2xl',
        variantStyles[variant]
      )}
    >
      <div className="absolute inset-x-0 top-0 h-full overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -skew-x-[45deg] z-0 blur-xl"
        />
      </div>
      <Icon size={16} strokeWidth={2.5} className="relative z-10" />
      <span className="relative z-10">{label}</span>
    </motion.button>
  );
}

interface DashboardHeaderProps {
  userName: string;
  onClearHistory: () => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
}

export default function DashboardHeader({
  userName,
  onClearHistory,
  onExportCSV,
  onExportPDF,
}: DashboardHeaderProps) {
  const { activePreset } = useUniversity();
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20 relative">
      <div className="space-y-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#4F8EF7]/10 border border-[#4F8EF7]/20 text-[#4F8EF7] text-[10px] font-black tracking-[0.2em] uppercase backdrop-blur-md"
        >
          <Sparkles size={14} strokeWidth={3} className="animate-pulse" /> Your Academic Nexus
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tighter text-white leading-tight">
            Welcome Back, <br />
            <span className="bg-gradient-to-r from-[#4F8EF7] via-[#7C3AED] to-[#A855F7] bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent italic">
              {userName}
            </span>
            <motion.span
              animate={{ rotate: [0, 15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block ml-4 drop-shadow-2xl"
            >
              👋
            </motion.span>
          </h1>
          <p className="text-white/40 font-medium text-lg mt-4 max-w-xl leading-relaxed italic">
            Visualizing your academic trajectory with{' '}
            <span className="text-white/60">sub-pixel precision</span>.
          </p>
          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
              <span className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em]">
                System Status: Nominal
              </span>
            </div>
            <div className="w-[1px] h-3 bg-white/[0.05]" />
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              <span className="text-[10px] text-[#4F8EF7] uppercase font-black tracking-[0.2em]">
                Identity: {activePreset.shortName}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-wrap items-center gap-4 relative z-10">
        <LiquidActionButton
          variant="primary"
          onClick={() => {
            onExportCSV();
            toast.success('CSV stream established');
          }}
          icon={Download}
          label="Export CSV"
        />

        <LiquidActionButton
          variant="secondary"
          onClick={() => {
            onExportPDF();
            toast.success('PDF rendered successfully');
          }}
          icon={FileText}
          label="Export PDF Report"
        />

        <LiquidActionButton
          variant="error"
          onClick={onClearHistory}
          icon={Trash2}
          label="Purge Records"
        />
      </div>

      {/* Atmospheric Void Background */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#4F8EF7]/5 blur-[120px] rounded-full pointer-events-none opacity-40 animate-pulse" />
    </div>
  );
}
