"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { useTheme } from "next-themes";
import {
  GraduationCap, Home, Calculator, CalendarDays,
  LayoutDashboard, Grip, ChevronDown, AlertTriangle,
  TrendingUp, Target, Moon, Sun, Menu, X, ArrowRight, School, Check
} from "lucide-react";
import { useUniversity, UNI_PRESETS } from "@/components/providers/UniversityProvider";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useSession, signOut } from "next-auth/react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Navigation Links ---
const MAIN_LINKS = [
  { name: "Home", href: "/", icon: Home },
  { name: "Calculator", href: "/calculator", icon: Calculator },
  { name: "Planner", href: "/planner", icon: CalendarDays },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
];

const ADVANCED_TOOLS = [
  {
    name: "Backlog Scanner",
    href: "/backlog",
    icon: AlertTriangle,
    desc: "Calculate fail grade impact",
    color: "bg-[#4F8EF7]/10 text-[#4F8EF7]"
  },
  {
    name: "Timeline",
    href: "/timeline",
    icon: TrendingUp,
    desc: "View academic journey",
    color: "bg-[#A855F7]/10 text-[#4F8EF7]"
  },
  {
    name: "Marks Predictor",
    href: "/predictor",
    icon: Target,
    desc: "Predict end semester marks",
    color: "bg-[#10B981]/10 text-[#10B981]"
  },
];

// --- Navbar Component ---
export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isUniOpen, setIsUniOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const uniRef = useRef<HTMLDivElement>(null);

  const { activePreset, setSelectedUniId } = useUniversity();
  const { data: session } = useSession();

  const isAnyToolActive = ADVANCED_TOOLS.some(tool => pathname === tool.href);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown/drawer on click outside or escape
  useEffect(() => {
    const handleEvents = (e: MouseEvent | globalThis.KeyboardEvent) => {
      if (e instanceof KeyboardEvent && e.key === "Escape") {
        setIsToolsOpen(false);
        setIsUniOpen(false);
        setIsMobileOpen(false);
      }
      if (e instanceof MouseEvent) {
        if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
          setIsToolsOpen(false);
        }
        if (uniRef.current && !uniRef.current.contains(e.target as Node)) {
          setIsUniOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleEvents);
    document.addEventListener("keydown", handleEvents);
    return () => {
      document.removeEventListener("mousedown", handleEvents);
      document.removeEventListener("keydown", handleEvents);
    };
  }, []);

  // Close dropdown on page change
  useEffect(() => {
    setIsToolsOpen(false);
    setIsUniOpen(false);
    setIsMobileOpen(false);
  }, [pathname]);

  if (!mounted) return null;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-[1000] transition-all duration-700 flex justify-center px-4 md:px-8 antialiased font-body",
        isScrolled
          ? "h-14 mt-0 bg-[#0A0F1E]/95 backdrop-blur-[45px] shadow-[0_15px_50px_-15px_rgba(0,0,0,0.8),0_0_80px_-20px_rgba(79,142,247,0.15)]"
          : "h-16 mt-0 bg-transparent"
      )}
    >
      <div className="absolute inset-x-0 top-0 h-[100%] overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: ["-100%", "200%"],
            opacity: [0, 0.15, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white to-transparent -skew-x-[45deg] z-0 blur-[100px]"
        />
      </div>

      <div className="w-full max-w-7xl flex items-center justify-between relative z-10 border-b border-white/[0.03]">

        {/* LEFT: AUTHORITATIVE LOGO */}
        <Link href="/" className="flex items-center gap-2 group outline-none">
          <motion.div
            whileHover={{ scale: 1.1, rotate: -3 }}
            className="text-[#4F8EF7] flex items-center justify-center p-1 relative"
          >
            <GraduationCap size={24} strokeWidth={2.5} className="z-10 drop-shadow-[0_0_15px_#4F8EF7]" />
            <motion.div initial={{ scale: 0 }} whileHover={{ scale: 1.5 }} className="absolute -z-10 w-full h-full bg-[#4F8EF7]/10 blur-xl rounded-full" />
          </motion.div>
          <span className="font-headline text-[20px] font-bold tracking-tight select-none">
            <span className="text-white drop-shadow-sm font-black">Grade</span>
            <span className="bg-gradient-to-r from-[#A855F7] via-[#7C3AED] to-[#A855F7] bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent font-black">Flow</span>
          </span>
        </Link>

        {/* CENTER: LIQUID PILL */}
        <nav className="hidden md:flex items-center">
          <div className="bg-[#0A0F1E]/40 border border-white/[0.05] rounded-full p-1.5 flex items-center gap-1 shadow-2xl backdrop-blur-3xl relative">
            {MAIN_LINKS.map((link) => (
              <LiquidNavItem
                key={link.href}
                href={link.href}
                icon={link.icon}
                label={link.name}
                isActive={pathname === link.href}
                isHovered={hoveredPath === link.href}
                onHover={setHoveredPath}
              />
            ))}

            <div className="w-[1px] h-4 bg-white/[0.08] mx-1 opacity-50" />

            {/* Tools Refraction HUD */}
            <div
              className="relative"
              ref={toolsRef}
              onMouseEnter={() => setHoveredPath("tools")}
              onMouseLeave={() => setHoveredPath(null)}
            >
              <button
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-500 text-sm font-bold tracking-tight relative z-10",
                  isToolsOpen || isAnyToolActive ? "text-white" : "text-white/60 hover:text-white group"
                )}
              >
                <Grip size={17} className={cn("transition-colors duration-500", (isToolsOpen || isAnyToolActive) ? "text-[#4F8EF7]" : "text-white/30 group-hover:text-[#4F8EF7]")} />
                <span>Tools</span>
                <motion.div animate={{ rotate: isToolsOpen ? 180 : 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
                  <ChevronDown size={15} className="opacity-30" />
                </motion.div>

                {/* Shared Liquid Effects */}
                <AnimatePresence>
                  {((hoveredPath === "tools") || (!hoveredPath && isAnyToolActive)) && (
                    <motion.div
                      layoutId="liquid-pill"
                      className="absolute inset-0 bg-[#4F8EF7]/10 rounded-full z-[-1] shadow-[0_0_20px_rgba(79,142,247,0.1),inset_0_1px_0_rgba(255,255,255,0.05)]"
                      transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    />
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {((hoveredPath === "tools") || (!hoveredPath && isAnyToolActive)) && (
                    <motion.div
                      layoutId="liquid-aura"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-[#4F8EF7] rounded-full blur-[1px] z-[20]"
                    />
                  )}
                </AnimatePresence>
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isToolsOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 15, filter: "blur(20px)" }}
                    animate={{ opacity: 1, scale: 1, y: 12, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.9, y: 15, filter: "blur(20px)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    style={{
                      backgroundColor: "#000000",
                      backdropFilter: "blur(10px)"
                    }}
                    className="absolute top-full left-1/2 -translate-x-1/2 w-[260px] bg-[#0A0F1E]/98 backdrop-blur-[50px] border border-white/[0.08] rounded-[24px] shadow-premium p-2 z-[1001] origin-top"
                  >
                    <div className="absolute inset-0 rounded-[24px] border-[0.5px] border-gradient-to-br from-[#4F8EF7]/30 via-transparent to-[#A855F7]/30 pointer-events-none" />
                    <div className="px-4 pt-3 pb-1 text-[11px] font-black uppercase tracking-[0.2em] text-[#4F8EF7]/50">
                      Academic Nexus
                    </div>
                    <div className="space-y-1 mt-1">
                      {ADVANCED_TOOLS.map((tool) => (
                        <Link
                          key={tool.href}
                          href={tool.href}
                          className={cn(
                            "flex items-center gap-3.5 p-3 rounded-[16px] transition-all duration-500 group relative",
                            pathname === tool.href ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"
                          )}
                        >
                          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500", tool.color)}>
                            <tool.icon size={20} className="drop-shadow-sm" />
                          </div>
                          <div>
                            <div className="text-[14px] font-black text-white/90 group-hover:text-white transition-colors tracking-tight">{tool.name}</div>
                            <div className="text-[12px] font-medium text-white/30 group-hover:text-white/50">{tool.desc}</div>
                          </div>
                          {pathname === tool.href && (
                            <motion.div layoutId="tool-dot" className="absolute right-4 w-1.5 h-1.5 bg-[#4F8EF7] rounded-full shadow-[0_0_10px_#4F8EF7]" />
                          )}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </nav>

        {/* RIGHT: ACTION SUITE */}
        <div className="hidden md:flex items-center gap-4">
          <div className="relative" ref={uniRef}>
            <button
              onClick={() => setIsUniOpen(!isUniOpen)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border transition-all duration-500 text-[13px] font-bold group shadow-inner",
                isUniOpen
                  ? "border-[#4F8EF7] bg-[#4F8EF7]/10 text-white"
                  : "border-white/[0.05] text-white/70 hover:text-white hover:bg-white/[0.06] hover:border-[#4F8EF7]/30"
              )}
            >
              <School size={16} className={cn("transition-transform group-hover:scale-110", isUniOpen ? "text-white" : "text-[#4F8EF7]")} />
              <span>{activePreset.shortName || "Select Identity"}</span>
              <motion.div animate={{ rotate: isUniOpen ? 180 : 0 }} transition={{ duration: 0.5 }}>
                <ChevronDown size={14} className="opacity-30" />
              </motion.div>
            </button>

            {/* University Selection Dropdown */}
            <AnimatePresence>
              {isUniOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 15, filter: "blur(20px)" }}
                  animate={{ opacity: 1, scale: 1, y: 12, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.9, y: 15, filter: "blur(20px)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute top-full right-0 w-[240px] bg-[#0A0F1E]/98 backdrop-blur-[50px] border border-white/[0.08] rounded-[24px] shadow-premium p-2 z-[1001] origin-top-right"
                >
                  <div className="px-4 pt-3 pb-1 text-[11px] font-black uppercase tracking-[0.2em] text-[#4F8EF7]/50">
                    Select Identity
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {UNI_PRESETS.map((uni) => (
                      <button
                        key={uni.id}
                        onClick={() => {
                          setSelectedUniId(uni.id);
                          setIsUniOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-[16px] transition-all duration-300 group",
                          activePreset.id === uni.id ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-black",
                            activePreset.id === uni.id ? "bg-[#4F8EF7] text-white" : "bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white/60"
                          )}>
                            {uni.shortName[0]}
                          </div>
                          <span className={cn(
                            "text-[13px] font-bold tracking-tight",
                            activePreset.id === uni.id ? "text-white" : "text-white/50 group-hover:text-white"
                          )}>
                            {uni.name}
                          </span>
                        </div>
                        {activePreset.id === uni.id && (
                          <Check size={14} className="text-[#4F8EF7]" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center transition-all duration-500 hover:bg-[#4F8EF7]/10 hover:border-[#4F8EF7]/20 text-white hover:text-[#4F8EF7] group shadow-inner"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={theme}
                initial={{ rotate: -180, scale: 0.5, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 180, scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {theme === 'dark' ? <Moon size={18} strokeWidth={2.5} /> : <Sun size={18} strokeWidth={2.5} className="text-yellow-400" />}
              </motion.div>
            </AnimatePresence>
          </button>

          {session ? (
            <button
               onClick={() => signOut()}
               className="bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-full text-[14px] font-bold tracking-tight transition-all border border-white/10 shadow-inner"
            >
              Log Out
            </button>
          ) : (
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05, y: -2, boxShadow: "0 15px 30px rgba(124,58,237,0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-br from-[#4F8EF7] via-[#7C3AED] to-[#A855F7] text-white px-7 py-2.5 rounded-full text-[14px] font-black tracking-tight flex items-center gap-2 shadow-premium"
              >
                Login
                <ArrowRight size={17} strokeWidth={3} />
              </motion.button>
            </Link>
          )}
        </div>

        {/* MOBILE TRIGGER */}
        <div className="flex md:hidden items-center group">
          <button onClick={() => setIsMobileOpen(true)} className="w-11 h-11 flex items-center justify-center rounded-full bg-white/[0.04] text-white active:scale-90 transition-all">
            <Menu size={22} className="group-hover:text-[#4F8EF7] transition-colors" />
          </button>
        </div>

      </div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileOpen(false)} className="fixed inset-0 bg-[#000]/80 backdrop-blur-[15px] z-[1002]" />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 w-[300px] h-full bg-[#0A0F1E]/98 backdrop-blur-[50px] border-l border-white/[0.05] z-[1003] p-8 flex flex-col shadow-[-20px_0_100px_rgba(0,0,0,0.9)]"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-headline font-black text-2xl text-white tracking-widest">GF.OS</span>
                <button onClick={() => setIsMobileOpen(false)} className="w-11 h-11 flex items-center justify-center rounded-full bg-white/5 text-white/60">
                  <X size={26} strokeWidth={3} />
                </button>
              </div>

              {/* Mobile University Selector */}
              <div className="mb-8 p-1 bg-white/[0.02] border border-white/[0.05] rounded-[24px]">
                <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/20">Active Institution</div>
                <div className="flex flex-wrap gap-1 p-1">
                  {UNI_PRESETS.map((uni) => (
                    <button
                      key={uni.id}
                      onClick={() => setSelectedUniId(uni.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-[12px] font-bold transition-all",
                        activePreset.id === uni.id
                          ? "bg-[#4F8EF7] text-white shadow-[0_0_15px_rgba(79,142,247,0.3)]"
                          : "text-white/30 hover:text-white/60"
                      )}
                    >
                      {uni.shortName}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 flex-1">
                {MAIN_LINKS.map((link, i) => (
                  <motion.div key={link.href} initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 + i * 0.05 }}>
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl text-[17px] font-black transition-all",
                        pathname === link.href ? "bg-[#4F8EF7]/10 text-[#4F8EF7]" : "text-white/40 hover:text-white"
                      )}
                    >
                      <link.icon size={22} strokeWidth={3} />
                      {link.name}
                    </Link>
                  </motion.div>
                ))}

                <div className="h-[1px] bg-white/[0.03] my-6" />

                {ADVANCED_TOOLS.map((tool, i) => (
                  <motion.div key={tool.href} initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 + i * 0.05 }}>
                    <Link href={tool.href} className="flex items-center gap-4 p-4 rounded-2xl group active:bg-white/5">
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", tool.color)}>
                        <tool.icon size={22} strokeWidth={3} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[16px] font-black text-white/90">{tool.name}</span>
                        <span className="text-[12px] font-medium text-white/30">{tool.desc}</span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <Link href="/calculator" className="mt-auto">
                <button className="w-full bg-gradient-to-br from-[#4F8EF7] to-[#7C3AED] text-white py-5 rounded-[22px] font-black text-lg flex items-center justify-center gap-3 shadow-premium">
                  Get Started <ArrowRight size={20} strokeWidth={3} />
                </button>
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

// --- LIQUID NAV ITEM ---
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
        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={cn("transition-colors duration-500", isActive ? "text-[#4F8EF7]" : "text-white/30 group-hover:text-white/60")} />
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
            className="absolute inset-0 bg-[#4F8EF7]/10 rounded-full z-[1] shadow-[0_0_20px_rgba(79,142,247,0.1),inset_0_1px_0_rgba(255,255,255,0.05)]"
            transition={{ type: "spring", stiffness: 300, damping: 28, mass: 0.8 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(isActive || isHovered) && (
          <motion.div
            layoutId="liquid-aura"
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-[#4F8EF7] rounded-full blur-[1px] z-[20]"
          />
        )}
      </AnimatePresence>
    </Link>
  );
}
