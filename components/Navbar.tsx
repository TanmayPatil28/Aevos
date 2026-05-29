"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import {
  GraduationCap, Home, Calculator, CalendarDays,
  LayoutDashboard, Grip, ChevronDown, AlertTriangle,
  Target, Menu, Compass, Flame, Briefcase, BookOpen, Search
} from "lucide-react";
import { cn } from "@/lib/cn";
import NavbarActionSuite, { ActiveMenu } from "./NavbarActionSuite";
import { UniversityContent } from "./UniversitySelector";
import { OSModeContent } from "./OSModeSwitcher";
import NavbarMobileDrawer from "./NavbarMobileDrawer";

// --- Navigation Links ---
export const MAIN_LINKS = [
  { name: "Home", href: "/", icon: Home },
  { name: "Command Center", href: "/dashboard", icon: LayoutDashboard },
];

export const INTELLIGENCE_MODULES = [
  {
    category: "Academic Predictors",
    accent: { headerDot: "bg-blue-400", hoverIcon: "group-hover:bg-blue-500/10 group-hover:border-blue-500/20 group-hover:text-blue-400" },
    items: [
      { name: "Grade Calculator", href: "/calculator", icon: Calculator, desc: "Calculate SGPA & CGPA in real-time" },
      { name: "Target Planner", href: "/planner", icon: CalendarDays, desc: "Set grade targets & simulate scenarios" },
      { name: "Future Forecast", href: "/forecast", icon: Flame, desc: "AI-powered trajectory prediction" }
    ]
  },
  {
    category: "Survival & Recovery",
    accent: { headerDot: "bg-amber-400", hoverIcon: "group-hover:bg-amber-500/10 group-hover:border-amber-500/20 group-hover:text-amber-400" },
    items: [
      { name: "Bunk Calculator", href: "/attendance", icon: AlertTriangle, desc: "Safe-bunk limits & detention risk" },
      { name: "Backlog Recovery", href: "/backlog", icon: Target, desc: "Clearance strategy & marks needed" }
    ]
  },
  {
    category: "Career Intelligence",
    accent: { headerDot: "bg-purple-400", hoverIcon: "group-hover:bg-purple-500/10 group-hover:border-purple-500/20 group-hover:text-purple-400" },
    items: [
      { name: "Placement Radar", href: "/placement", icon: Briefcase, desc: "Eligibility check & skill gap analysis" }
    ]
  },
  {
    category: "Strategic Timelines",
    accent: { headerDot: "bg-emerald-400", hoverIcon: "group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 group-hover:text-emerald-400" },
    items: [
      { name: "Academic Timeline", href: "/timeline", icon: Compass, desc: "Visual semester-by-semester roadmap" },
      { name: "Semester Roadmap", href: "/multi-semester", icon: BookOpen, desc: "Multi-year trajectory overview" }
    ]
  }
];

export default function Navbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Dynamic Island States
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>(null);
  const [isIslandHovered, setIsIslandHovered] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  // The island expands if we are at the top, if we hover it, or if a menu is open
  const isExpanded = !isScrolled || isIslandHovered || activeMenu !== null;

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
        setActiveMenu(null);
      }
    };
    document.addEventListener("keydown", handleEvents);
    return () => document.removeEventListener("keydown", handleEvents);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setActiveMenu(null);
  }, [pathname]);

  if (!mounted) return null;

  return (
    <>
      {/* CINEMATIC BACKDROP */}
      <AnimatePresence>
        {activeMenu && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} // Apple ease-out
            className="fixed inset-0 z-40 bg-black/40 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <header className={cn(
        "fixed left-0 right-0 z-[9999] transition-all duration-700 flex justify-center px-4 antialiased font-body pointer-events-none",
        isScrolled ? "top-4" : "top-6"
      )}>
        <motion.div
          layout
          layoutRoot
          onMouseEnter={() => setIsIslandHovered(true)}
          onMouseLeave={() => {
            setIsIslandHovered(false);
            setActiveMenu(null);
          }}
          transition={{ type: "spring", stiffness: 450, damping: 40, mass: 1 }}
          className={cn(
            "bg-[#1D1D1F]/90 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-3xl pointer-events-auto relative flex flex-col",
            // The island radius shrinks slightly when it stretches down
            activeMenu ? "rounded-[32px]" : "rounded-full"
          )}
        >
        {/* TOP ROW: LOGO, NAV, ACTIONS */}
        <motion.div layout className="flex items-center justify-between p-2 gap-4">
          
          {/* LEFT: LOGO */}
          <motion.div layout className="shrink-0 flex items-center pl-2">
            <Link href="/" className="flex items-center gap-2 group outline-none">
              <motion.div
                layout
                whileHover={{ scale: 1.1, rotate: -3 }}
                className="text-blue-500 flex items-center justify-center p-1 relative"
              >
                <GraduationCap size={24} strokeWidth={2.5} className="z-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                <motion.div initial={{ scale: 0 }} whileHover={{ scale: 1.5 }} className="absolute -z-10 w-full h-full bg-blue-500/10 blur-xl rounded-full" />
              </motion.div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="font-headline text-[18px] font-bold tracking-tight select-none overflow-hidden whitespace-nowrap"
                  >
                    <span className="text-white drop-shadow-sm font-black ml-1">Grade</span>
                    <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent font-black">Flow</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </motion.div>

          {/* CENTER: CONTEXTUAL NAV */}
          <AnimatePresence mode="popLayout">
            {isExpanded && (
              <motion.nav
                layout
                initial={{ opacity: 0, filter: "blur(8px)", scale: 0.95 }}
                animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                exit={{ opacity: 0, filter: "blur(8px)", scale: 0.95, transition: { duration: 0.15 } }}
                transition={{ type: "spring", stiffness: 450, damping: 40, mass: 1 }}
                className="hidden md:flex items-center gap-1 shrink-0"
              >
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

                {/* Intelligence Trigger */}
                <button
                  onMouseEnter={() => setActiveMenu("intelligence")}
                  onClick={() => setActiveMenu(activeMenu === "intelligence" ? null : "intelligence")}
                  className={cn(
                    "relative z-10 px-4 py-2.5 outline-none group flex items-center gap-2 transition-all rounded-full",
                    activeMenu === "intelligence" ? "bg-white/10 text-white shadow-inner" : "text-white/60 hover:text-white"
                  )}
                >
                  <Grip size={18} strokeWidth={activeMenu === "intelligence" ? 2.5 : 2} className={cn("transition-colors duration-500", activeMenu === "intelligence" ? "text-blue-500" : "text-white/30 group-hover:text-white/60")} />
                  <span className={cn(
                    "text-[14px] font-black tracking-tight transition-all duration-500",
                    activeMenu === "intelligence" ? "text-white" : "text-white/50 group-hover:text-white"
                  )}>
                    Intelligence
                  </span>
                  <ChevronDown size={14} className={cn("transition-transform duration-300", activeMenu === "intelligence" && "rotate-180")} />
                </button>
              </motion.nav>
            )}
          </AnimatePresence>

          {/* RIGHT: ACTION SUITE & COMPACT MENU TRIGGER */}
          <motion.div layout className="shrink-0 flex items-center justify-end pr-1">
            <AnimatePresence mode="wait">
              {isExpanded ? (
                <motion.div
                  key="full-actions"
                  layout
                  initial={{ opacity: 0, filter: "blur(8px)", scale: 0.95 }}
                  animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                  exit={{ opacity: 0, filter: "blur(8px)", scale: 0.95, transition: { duration: 0.15 } }}
                  transition={{ type: "spring", stiffness: 450, damping: 40, mass: 1 }}
                >
                  <NavbarActionSuite activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
                </motion.div>
              ) : (
                <motion.button
                  key="compact-menu"
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.1 } }}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all ml-2"
                >
                  <Search size={18} strokeWidth={2.5} />
                </motion.button>
              )}
            </AnimatePresence>

            {/* MOBILE TRIGGER */}
            <div className="flex md:hidden items-center group ml-2">
              <button onClick={() => setIsMobileOpen(true)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white active:scale-90 transition-all">
                <Menu size={20} className="group-hover:text-blue-500 transition-colors" />
              </button>
            </div>
          </motion.div>

        </motion.div>

        {/* BOTTOM ROW: DYNAMIC MENUS (PHYSICAL ENCAPSULATION) */}
        <AnimatePresence mode="wait">
          {activeMenu && (
              <motion.div
              key={activeMenu}
              layout
              initial={{ height: 0, opacity: 0, filter: "blur(12px)", scale: 0.98 }}
              animate={{ height: "auto", opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={{ height: 0, opacity: 0, filter: "blur(12px)", scale: 0.98 }}
              transition={{ type: "spring", stiffness: 450, damping: 40, mass: 1 }} // Apple Dynamic Island Physics
              className="w-[800px] overflow-hidden self-center"
            >
              {activeMenu === "intelligence" && (
                <div className="px-6 pb-6 pt-4 grid grid-cols-4 gap-4 border-t border-white/20 mt-2">
                  {INTELLIGENCE_MODULES.map((module) => (
                    <div key={module.category} className="flex flex-col gap-2.5">
                      {/* Category Header with colored dot */}
                      <div className="flex items-center gap-2 px-2 mb-1">
                        <div className={cn("w-1.5 h-1.5 rounded-full", module.accent.headerDot)} />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-white/40">
                          {module.category}
                        </h3>
                      </div>
                      {/* Items */}
                      <div className="flex flex-col gap-1">
                        {module.items.map((tool) => (
                          <Link
                            key={tool.href}
                            href={tool.href}
                            onClick={() => setActiveMenu(null)}
                            className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-white/[0.04] transition-all group"
                          >
                            <div className={cn(
                              "flex-shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-300",
                              "bg-white/[0.02] border-white/[0.05] text-white/40",
                              module.accent.hoverIcon
                            )}>
                              <tool.icon size={16} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[13px] font-bold text-white/80 group-hover:text-white transition-colors tracking-tight">{tool.name}</span>
                              <span className="text-[11px] font-medium text-white/30 group-hover:text-white/50 transition-colors leading-snug">{tool.desc}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {activeMenu === "university" && (
                <div className="border-t border-white/20 mt-2 pt-4">
                  <UniversityContent onClose={() => setActiveMenu(null)} />
                </div>
              )}

              {activeMenu === "os" && (
                <div className="border-t border-white/20 mt-2 pt-4">
                  <OSModeContent onClose={() => setActiveMenu(null)} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      <NavbarMobileDrawer isOpen={isMobileOpen} setIsOpen={setIsMobileOpen} />
      </header>
    </>
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
      className="relative z-10 px-4 py-2.5 outline-none group rounded-full"
    >
      <motion.div style={{ x: springX, y: springY }} className="flex items-center gap-2.5 relative z-[2]">
        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={cn("transition-colors duration-500", isActive ? "text-white" : "text-white/30 group-hover:text-white/60")} />
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
            className="absolute inset-0 bg-[#0071e3] rounded-full z-[1] shadow-[0_0_15px_rgba(0,113,227,0.5),inset_0_1px_0_rgba(255,255,255,0.2)]"
            transition={{ type: "spring", stiffness: 300, damping: 28, mass: 0.8 }}
          />
        )}
      </AnimatePresence>
    </Link>
  );
}
