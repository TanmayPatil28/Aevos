"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import {
  GraduationCap, Home, Calculator, CalendarDays,
  LayoutDashboard, Grip, ChevronDown, AlertTriangle,
  Target, Menu, Compass, Flame, Briefcase, Calendar, BookOpen
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useUSMStore } from "@/stores/usmStore";
import NavbarActionSuite from "./NavbarActionSuite";
import NavbarMobileDrawer from "./NavbarMobileDrawer";

// --- Navigation Links ---
export const MAIN_LINKS = [
  { name: "Home", href: "/", icon: Home },
  { name: "Command Center", href: "/dashboard", icon: LayoutDashboard },
  { name: "Calculator", href: "/calculator", icon: Calculator },
  { name: "Planner", href: "/planner", icon: CalendarDays },
  { name: "Timeline", href: "/timeline", icon: Compass },
  { name: "Multi-Semester", href: "/multi-semester", icon: Target },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleEvents = (e: MouseEvent | globalThis.KeyboardEvent) => {
      if (e instanceof KeyboardEvent && e.key === "Escape") {
        setIsMobileOpen(false);
      }
    };
    document.addEventListener("keydown", handleEvents);
    return () => {
      document.removeEventListener("keydown", handleEvents);
    };
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  if (!mounted) return null;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-[9999] transition-all duration-700 flex justify-center px-4 md:px-8 antialiased font-body",
        isScrolled
          ? "h-14 mt-0 bg-black/50 backdrop-blur-[45px] shadow-[0_15px_50px_-15px_rgba(0,0,0,0.8),0_0_80px_-20px_rgba(79,142,247,0.15)]"
          : "h-16 mt-0 bg-transparent"
      )}
    >
      <div className="w-full max-w-[1600px] flex items-center justify-between relative z-[9999] border-b border-white/[0.03]">

        {/* LEFT: LOGO */}
        <Link href="/" className="flex items-center gap-2 group outline-none">
          <motion.div
            whileHover={{ scale: 1.1, rotate: -3 }}
            className="text-blue-500 flex items-center justify-center p-1 relative"
          >
            <GraduationCap size={24} strokeWidth={2.5} className="z-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
            <motion.div initial={{ scale: 0 }} whileHover={{ scale: 1.5 }} className="absolute -z-10 w-full h-full bg-blue-500/10 blur-xl rounded-full" />
          </motion.div>
          <span className="font-headline text-[20px] font-bold tracking-tight select-none">
            <span className="text-white drop-shadow-sm font-black">Grade</span>
            <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent font-black">Flow</span>
          </span>
        </Link>

        {/* CENTER: CONTEXTUAL NAV */}
        <nav className="hidden md:flex items-center">
          <div className="bg-black/40 border border-white/5 rounded-full p-1.5 flex items-center gap-1 shadow-2xl backdrop-blur-3xl relative transition-all duration-500">
            {MAIN_LINKS.map((link) => (
              <LiquidNavItem
                key={link.href}
                href={link.href}
                icon={link.icon}
                label={link.name}
                isActive={pathname === link.href || (pathname === '/' && link.href === '/overview')}
                isHovered={hoveredPath === link.href}
                onHover={setHoveredPath}
              />
            ))}

            {/* Tools dropdown has been deprecated in favor of Focus Workflows */}
          </div>
        </nav>

        {/* RIGHT: ACTION SUITE */}
        <NavbarActionSuite />

        {/* MOBILE TRIGGER */}
        <div className="flex md:hidden items-center group">
          <button onClick={() => setIsMobileOpen(true)} className="w-11 h-11 flex items-center justify-center rounded-full bg-white/5 text-white active:scale-90 transition-all">
            <Menu size={22} className="group-hover:text-blue-500 transition-colors" />
          </button>
        </div>
      </div>
      
      <NavbarMobileDrawer isOpen={isMobileOpen} setIsOpen={setIsMobileOpen} />
    </header>
  );
}

function LiquidNavItem({
  href, icon: Icon, label, isActive, isHovered, onHover
}: {
  href: string; icon: React.ElementType; label: string; isActive: boolean; isHovered: boolean; onHover: (path: string | null) => void
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 350, damping: 25, mass: 0.8 });
  const springY = useSpring(mouseY, { stiffness: 350, damping: 25, mass: 0.8 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - (left + width / 2)) * 0.25);
    mouseY.set((e.clientY - (top + height / 2)) * 0.25);
  };

  return (
    <Link
      href={href}
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => onHover(href)}
      onMouseLeave={() => {
        mouseX.set(0);
        mouseY.set(0);
        onHover(null);
      }}
      className="relative z-10 px-4 py-2.5 outline-none group"
    >
      <motion.div style={{ x: springX, y: springY }} className="flex items-center gap-2.5 relative z-[2]">
        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={cn("transition-colors duration-500", isActive ? "text-blue-500" : "text-white/30 group-hover:text-white/60")} />
        <span className={cn(
          "text-[14px] font-black tracking-tight transition-all duration-500",
          isActive ? "text-white" : "text-white/50 group-hover:text-white"
        )}>
          {label}
        </span>
      </motion.div>
      <AnimatePresence>
        {(isActive || isHovered) && (
          <motion.div
            layoutId="liquid-pill"
            className="absolute inset-0 bg-blue-500/10 rounded-full z-[1] shadow-[0_0_20px_rgba(59,130,246,0.1),inset_0_1px_0_rgba(255,255,255,0.05)]"
            transition={{ type: "spring", stiffness: 300, damping: 28, mass: 0.8 }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {(isActive || isHovered) && (
          <motion.div
            layoutId="liquid-aura"
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-blue-500 rounded-full blur-[1px] z-[20]"
          />
        )}
      </AnimatePresence>
    </Link>
  );
}

