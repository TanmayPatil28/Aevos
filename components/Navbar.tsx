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
import { useDynamicIslandStore } from "@/stores/dynamicIslandStore";
import { MinimalActivity, MinimalSecondaryActivity, ExpandedActivity, IslandAlertView, IslandSpotlightView } from "./dynamic-island/LiveActivities";
import ExamCountdownPill from "./dynamic-island/ExamCountdownPill";
import StreakBadge from "./dynamic-island/StreakBadge";

// --- Navigation Links ---
export const MAIN_LINKS = [
  { name: "Home", href: "/", icon: Home },
  { name: "Command Center", href: "/dashboard", icon: LayoutDashboard },
];

const SPRING_PHYSICS = { type: "spring", stiffness: 400, damping: 30, mass: 0.8 };

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
  
  // Local UI States
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>(null);
  const [isIslandHovered, setIsIslandHovered] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [attentionWake, setAttentionWake] = useState(false);

  // Dynamic Island Global State
  const { activities, activeAlert, expandedId, setExpandedId, removeActivity, dismissAlert, promoteActivity } = useDynamicIslandStore();

  // Island Logic
  const hasAlert = activeAlert !== null;
  const isExpanded = !isScrolled || isIslandHovered || activeMenu !== null || hasAlert || expandedId !== null || attentionWake;
  
  const hasLiveActivity = activities.length > 0;
  const hasSplitActivity = activities.length > 1;
  const primaryActivity = activities[0];
  const secondaryActivity = activities[1];

  // If there's an alert or active menu, the island takes its massive squircle form.
  const isSquircle = activeMenu !== null || hasAlert || expandedId !== null;

  const isDimmed = isScrolled && !isIslandHovered && !isSquircle && !attentionWake;

  // Snap to Attention
  useEffect(() => {
    if (activities.length > 0 || activeAlert) {
      setAttentionWake(true);
      const timer = setTimeout(() => setAttentionWake(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [activities.length, activeAlert]);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleEvents = (e: MouseEvent | globalThis.KeyboardEvent) => {
      if (e instanceof KeyboardEvent) {
        if (e.key === "Escape") {
          setIsMobileOpen(false);
          setActiveMenu(null);
          useDynamicIslandStore.getState().setExpandedId(null);
        }
        // ⌘K / Ctrl+K — Open JARVIS Spotlight
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
          e.preventDefault();
          setActiveMenu(prev => prev === "spotlight" ? null : "spotlight");
        }
      }
    };
    document.addEventListener("keydown", handleEvents);
    return () => document.removeEventListener("keydown", handleEvents);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setActiveMenu(null);
    setExpandedId(null);
  }, [pathname, setExpandedId]);

  if (!mounted) return null;

  return (
    <>
      {/* CINEMATIC BACKDROP */}
      <AnimatePresence>
        {(activeMenu || expandedId) && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} // Apple ease-out
            className="fixed inset-0 z-40 bg-black/40 pointer-events-auto cursor-pointer"
            onClick={() => {
              setActiveMenu(null);
              setExpandedId(null);
            }}
          />
        )}
      </AnimatePresence>

      <header className={cn(
        "fixed left-0 right-0 z-[9999] transition-all duration-700 flex justify-center px-4 antialiased font-body pointer-events-none",
        isScrolled ? "top-4" : "top-6"
      )}>
        {/* MULTITASKING WRAPPER: [ExamPill] — [MainIsland] — [SecondaryBubble] */}
        <div className="flex items-start gap-3 pointer-events-none">
          
          {/* LEFT: EXAM COUNTDOWN PILL */}
          <ExamCountdownPill />

          {/* MAIN DYNAMIC ISLAND PILL */}
          <motion.div
            layout
            layoutRoot
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={(e, { offset, velocity }) => {
              if (Math.abs(offset.x) > 100 || Math.abs(velocity.x) > 500) {
                if (primaryActivity && !isSquircle) removeActivity(primaryActivity.id);
              }
            }}
            whileDrag={{ scale: 0.95 }}
            onMouseEnter={() => setIsIslandHovered(true)}
            onMouseLeave={() => {
              setIsIslandHovered(false);
              setActiveMenu(null);
            }}
            animate={{
              scale: isDimmed ? 0.9 : 1,
              opacity: isDimmed ? 0.6 : 1,
              y: isDimmed ? -8 : 0,
              borderRadius: isSquircle ? 44 : 100,
            }}
            transition={SPRING_PHYSICS}
            className="bg-[#1D1D1F]/90 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-3xl pointer-events-auto relative flex flex-col origin-top"
          >

          {/* STREAK BADGE (hover-reveal) */}
          <StreakBadge isVisible={isIslandHovered} />

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
              <AnimatePresence mode="popLayout">
                {isExpanded && !hasSplitActivity && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={SPRING_PHYSICS}
                    className="font-bold tracking-tight text-white/90 whitespace-nowrap overflow-hidden"
                  >
                    GradeFlow
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
                transition={SPRING_PHYSICS}
                className="hidden md:flex items-center gap-1 shrink-0 px-2"
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

          {/* PRIMARY MINIMAL ACTIVITY */}
          <AnimatePresence mode="popLayout">
            {primaryActivity && !isSquircle && (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
                className="shrink-0 flex items-center pr-2 cursor-pointer hover:bg-white/5 rounded-full px-2 py-1 transition-colors"
                onClick={() => setExpandedId(expandedId === primaryActivity.id ? null : primaryActivity.id)}
              >
                <MinimalActivity activity={primaryActivity} />
              </motion.div>
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
                  transition={SPRING_PHYSICS}
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
                  onClick={() => setActiveMenu(activeMenu === "spotlight" ? null : "spotlight")}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center rounded-full transition-all ml-2",
                    activeMenu === "spotlight" ? "bg-white/20 text-white" : "bg-white/10 text-white hover:bg-white/20"
                  )}
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

        {/* BOTTOM ROW: DYNAMIC MENUS / ALERTS / EXPANDED ACTIVITIES */}
        <AnimatePresence mode="wait">
          {isSquircle && (
              <motion.div
              key={activeAlert ? `alert-${activeAlert.id}` : expandedId ? `exp-${expandedId}` : activeMenu || 'empty'}
              layout
              initial={{ height: 0, opacity: 0, filter: "blur(12px)", scale: 0.98 }}
              animate={{ height: "auto", opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={{ height: 0, opacity: 0, filter: "blur(12px)", scale: 0.98 }}
              transition={SPRING_PHYSICS}
              className={cn(
                "overflow-hidden self-center",
                activeAlert ? "w-auto" : "w-[800px]"
              )}
            >
              {activeAlert && (
                <div className="border-t border-white/5 mt-2">
                  <IslandAlertView alert={activeAlert} />
                </div>
              )}
              
              {!activeAlert && expandedId && (
                <div className="border-t border-white/5 mt-2 flex justify-center">
                  <ExpandedActivity activity={activities.find(a => a.id === expandedId)!} />
                </div>
              )}

              {!activeAlert && !expandedId && activeMenu === "intelligence" && (
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
                <div className=" border-t border-white/20 mt-2 pt-4">
                  <UniversityContent onClose={() => setActiveMenu(null)} />
                </div>
              )}

              {activeMenu === "os" && (
                <div className=" border-t border-white/20 mt-2 pt-4">
                  <OSModeContent onClose={() => setActiveMenu(null)} />
                </div>
              )}

              {activeMenu === "spotlight" && (
                <div className="border-t border-white/20 mt-2">
                  <IslandSpotlightView onClose={() => setActiveMenu(null)} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* SECONDARY DETACHED BUBBLE (SPLIT STATE) */}
      <AnimatePresence>
        {hasSplitActivity && !isSquircle && (
          <motion.div
            layout
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={(e, { offset, velocity }) => {
              if (offset.x < -50 || velocity.x < -500) {
                promoteActivity(secondaryActivity.id);
              }
            }}
            whileDrag={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.5, x: -20 }}
            animate={{ 
              opacity: isDimmed ? 0.6 : 1, 
              scaleX: isDimmed ? 0.9 : [1, 1.05, 0.98, 1],
              scaleY: isDimmed ? 0.9 : [1, 0.95, 1.02, 1],
              x: 0,
              y: isDimmed ? -8 : 0
            }}
            exit={{ opacity: 0, scale: 0.5, x: -20 }}
            transition={SPRING_PHYSICS}
            className="h-[52px] w-[52px] shrink-0 rounded-full bg-[#1D1D1F]/90 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-3xl pointer-events-auto flex items-center justify-center relative cursor-pointer group"
            onClick={() => setExpandedId(expandedId === secondaryActivity.id ? null : secondaryActivity.id)}
          >
            <MinimalSecondaryActivity activity={secondaryActivity} />
            {/* Morphing Glow */}
            <motion.div 
              className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </motion.div>
        )}
      </AnimatePresence>

      </div>
      
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
