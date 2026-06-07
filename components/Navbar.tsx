"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { ErrorBoundary } from "react-error-boundary";
import { GraduationCap, Grip, ChevronDown, Menu, Search, AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import NavbarActionSuite from "./NavbarActionSuite";
import { ActiveMenu } from "@/components/types/navigation";
import { UniversityContent } from "./UniversitySelector";
import { OSModeContent } from "./OSModeSwitcher";
import NavbarMobileDrawer from "./NavbarMobileDrawer";
import JarvisCommandCenter from "./JarvisCommandCenter";
import { useDynamicIslandStore } from "@/stores/dynamicIslandStore";
import { useShallow } from "zustand/react/shallow";
import { MinimalActivity, MinimalSecondaryActivity, ExpandedActivity, IslandAlertView } from "./dynamic-island/LiveActivities";
import ExamCountdownPill from "./dynamic-island/ExamCountdownPill";
import StreakBadge from "./dynamic-island/StreakBadge";
import { useScrollMetrics } from "@/lib/hooks/useScrollMetrics";
import { useGlobalHotkeys } from "@/lib/hooks/useGlobalHotkeys";
import { useNavbarNavigation } from "@/lib/hooks/useNavbarNavigation";

const SPRING_PHYSICS = { type: "spring", stiffness: 400, damping: 30, mass: 0.8 };

function NavbarFallback({ error }: { error: Error }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-400 rounded-full border border-red-500/20 text-xs font-bold">
      <AlertCircle size={14} />
      Module Error
    </div>
  );
}

import { ICONS } from "@/lib/config/navigation";

/**
 * Main application navigation bar.
 * 
 * @param {Object} props
 * @param {Array} props.mainLinks - Array of top-level application links mapped from the server.
 * @param {Array} props.intelligenceModules - Array of categorized application modules, heavily filtered based on user permissions.
 */
export default function Navbar({ mainLinks, intelligenceModules }: { mainLinks: any[], intelligenceModules: any[] }) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { isScrolled } = useScrollMetrics(20);
  const { pathname, isLinkActive } = useNavbarNavigation();
  const shouldReduceMotion = useReducedMotion();
  const transitionProps = shouldReduceMotion ? { duration: 0 } : SPRING_PHYSICS;
  
  // Local UI States
  const [activeMenu, setActiveMenu] = useState<string>("");
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  
  const [isIslandHovered, setIsIslandHovered] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [attentionWake, setAttentionWake] = useState(false);

  // Dynamic Island Global State
  const islandState = useDynamicIslandStore(
    useShallow(state => ({
      activities: state.activities,
      activeAlert: state.activeAlert,
      expandedId: state.expandedId,
      setExpandedId: state.setExpandedId,
      removeActivity: state.removeActivity,
      dismissAlert: state.dismissAlert,
      promoteActivity: state.promoteActivity,
    }))
  );

  const { activities, activeAlert, expandedId, setExpandedId, removeActivity, dismissAlert, promoteActivity } = islandState;

  // Island Logic
  const hasAlert = activeAlert !== null;
  const isExpanded = !isScrolled || isIslandHovered || activeMenu !== null || hasAlert || expandedId !== null || attentionWake;
  
  const hasLiveActivity = activities.length > 0;
  const hasSplitActivity = activities.length > 1;
  const primaryActivity = activities[0];
  const secondaryActivity = activities[1];

  // If there's an alert or active menu, the island takes its massive squircle form.
  const isSquircle = activeMenu !== "" || hasAlert || expandedId !== null;
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
  }, []);

  useGlobalHotkeys('Escape', () => {
    setIsMobileOpen(false);
    setActiveMenu("");
    setExpandedId(null);
  }, false);

  useGlobalHotkeys('k', () => {
    setActiveMenu(prev => prev === "spotlight" ? "" : "spotlight");
  }, true);

  useEffect(() => {
    setIsMobileOpen(false);
    setActiveMenu("");
    setExpandedId(null);
  }, [pathname, setExpandedId, setIsMobileOpen, setActiveMenu]);

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
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-black/40 pointer-events-auto cursor-pointer"
            onClick={() => {
              setActiveMenu("");
              setExpandedId(null);
            }}
          />
        )}
      </AnimatePresence>

      <nav aria-label="Main Navigation" className={cn(
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
            onMouseLeave={() => setIsIslandHovered(false)}
            animate={{
              scale: isDimmed ? 0.9 : 1,
              opacity: isDimmed ? 0.6 : 1,
              y: isDimmed ? -8 : 0,
              borderRadius: isSquircle ? 44 : 100,
            }}
            transition={transitionProps}
            className="bg-[#1D1D1F]/90 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-3xl pointer-events-auto relative flex flex-col origin-top"
          >

          {/* STREAK BADGE (hover-reveal) */}
          <StreakBadge isVisible={isIslandHovered && activeMenu !== "spotlight"} />

          {/* TOP ROW: LOGO, NAV, ACTIONS */}
          <AnimatePresence mode="popLayout">
            {activeMenu !== "spotlight" && (
              <motion.div 
                layout 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                transition={transitionProps}
                className="flex items-center justify-between p-2 gap-4"
              >
          
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
                    transition={transitionProps}
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
              <motion.ul
                layout
                role="menubar"
                initial={{ opacity: 0, filter: "blur(8px)", scale: 0.95 }}
                animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                exit={{ opacity: 0, filter: "blur(8px)", scale: 0.95, transition: { duration: 0.15 } }}
                transition={transitionProps}
                className="hidden md:flex items-center gap-1 shrink-0 px-2 list-none"
              >
                {mainLinks.map((link) => {
                  const Icon = ICONS[link.iconName] || Search;
                  return (
                    <LiquidNavItem
                      key={link.href}
                      href={link.href}
                      icon={Icon}
                      label={link.name}
                      isActive={isLinkActive(link.href)}
                      isHovered={hoveredPath === link.href}
                      hasHoveredItem={hoveredPath !== null}
                      onHover={setHoveredPath}
                    />
                  );
                })}

                {/* Intelligence Trigger */}
                <li role="none">
                  <button
                    role="menuitem"
                    onMouseEnter={() => setActiveMenu("intelligence")}
                    onClick={() => setActiveMenu(activeMenu === "intelligence" ? "" : "intelligence")}
                    aria-expanded={activeMenu === "intelligence"}
                    aria-haspopup="menu"
                    className={cn(
                      "relative z-10 px-4 py-2.5 outline-none group flex items-center gap-2 transition-all rounded-full focus-visible:ring focus-visible:ring-blue-500",
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
                </li>
              </motion.ul>
            )}
          </AnimatePresence>

          {/* PRIMARY MINIMAL ACTIVITY */}
          <AnimatePresence mode="popLayout">
            {primaryActivity && !isSquircle && (
              <motion.button
                layout
                initial={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
                className="shrink-0 flex items-center pr-2 cursor-pointer hover:bg-white/5 rounded-full px-2 py-1 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                onClick={() => setExpandedId(expandedId === primaryActivity.id ? null : primaryActivity.id)}
                aria-expanded={expandedId === primaryActivity.id}
              >
                <MinimalActivity activity={primaryActivity} />
              </motion.button>
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
                  transition={transitionProps}
                >
                  <ErrorBoundary FallbackComponent={NavbarFallback}>
                    <NavbarActionSuite activeMenu={activeMenu as ActiveMenu} setActiveMenu={setActiveMenu as any} />
                  </ErrorBoundary>
                </motion.div>
              ) : (
                <motion.button
                  key="compact-menu"
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.1 } }}
                  onClick={() => setActiveMenu(activeMenu === "spotlight" ? "" : "spotlight")}
                  aria-label="Search or Open JARVIS"
                  aria-expanded={activeMenu === "spotlight"}
                  className={cn(
                    "w-11 h-11 flex items-center justify-center rounded-full transition-all ml-2 outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    activeMenu === "spotlight" ? "bg-white/20 text-white" : "bg-white/10 text-white hover:bg-white/20"
                  )}
                >
                  <Search size={18} strokeWidth={2.5} />
                </motion.button>
              )}
            </AnimatePresence>

            {/* MOBILE TRIGGER */}
            <div className="flex md:hidden items-center group ml-2">
              <button 
                onClick={() => setIsMobileOpen(true)} 
                aria-expanded={isMobileOpen}
                aria-label="Open mobile menu"
                className="w-11 h-11 flex items-center justify-center rounded-full bg-white/5 text-white active:scale-90 transition-all"
              >
                <Menu size={20} className="group-hover:text-blue-500 transition-colors" />
              </button>
            </div>
          </motion.div>

              </motion.div>
            )}
          </AnimatePresence>

        {/* BOTTOM ROW: DYNAMIC MENUS / ALERTS / EXPANDED ACTIVITIES */}
        <AnimatePresence mode="wait">
          {isSquircle && (
              <motion.div
              key={activeAlert ? `alert-${activeAlert.id}` : expandedId ? `exp-${expandedId}` : activeMenu || 'empty'}
              layout
              initial={{ height: 0, opacity: 0, filter: "blur(12px)", scale: 0.98 }}
              animate={{ height: "auto", opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={{ height: 0, opacity: 0, filter: "blur(12px)", scale: 0.98 }}
              transition={transitionProps}
              aria-hidden={!isSquircle}
              className={cn(
                "overflow-hidden self-center outline-none",
                activeAlert ? "w-auto" : activeMenu === "spotlight" ? "w-navbar-spotlight max-w-navbar-spotlight" : "w-navbar-desktop"
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
                <nav aria-label="Intelligence Modules" className="px-6 pb-6 pt-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-white/20 mt-2">
                  {intelligenceModules.map((module) => (
                    <div key={module.category} className="flex flex-col gap-2.5">
                      {/* Category Header with colored dot */}
                      <div className="flex items-center gap-2 px-2 mb-1">
                        <div className={cn("w-1.5 h-1.5 rounded-full", module.accent.headerDot)} />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-white/40">
                          {module.category}
                        </h3>
                      </div>
                      {/* Items */}
                      <ul className="flex flex-col gap-1">
                      {module.items.map((tool: any) => {
                        const ToolIcon = ICONS[tool.iconName] || Search;
                        return (
                          <li key={tool.href}>
                            <Link
                              href={tool.href}
                              prefetch={false}
                              onMouseEnter={() => router.prefetch(tool.href)}
                              onClick={(e) => {
                                if (pathname === tool.href) e.preventDefault();
                                setActiveMenu("");
                              }}
                              className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-white/[0.04] transition-all group outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            >
                              <div className={cn(
                                "flex-shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-300",
                                "bg-white/[0.02] border-white/[0.05] text-white/40",
                                module.accent.hoverIcon
                              )}>
                                <ToolIcon size={16} strokeWidth={2.5} />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[13px] font-bold text-white/80 group-hover:text-white transition-colors tracking-tight">{tool.name}</span>
                                <span className="text-[11px] font-medium text-white/30 group-hover:text-white/50 transition-colors leading-snug">{tool.desc}</span>
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                      </ul>
                    </div>
                  ))}
                </nav>
              )}
              
              {activeMenu === "university" && (
                <div className=" border-t border-white/20 mt-2 pt-4">
                  <ErrorBoundary FallbackComponent={NavbarFallback}>
                    <UniversityContent onClose={() => setActiveMenu("")} />
                  </ErrorBoundary>
                </div>
              )}

              {activeMenu === "os" && (
                <div className=" border-t border-white/20 mt-2 pt-4">
                  <ErrorBoundary FallbackComponent={NavbarFallback}>
                    <OSModeContent onClose={() => setActiveMenu("")} />
                  </ErrorBoundary>
                </div>
              )}

              {activeMenu === "spotlight" && (
                <div className="w-full">
                  <ErrorBoundary FallbackComponent={NavbarFallback}>
                    <JarvisCommandCenter isOpen={activeMenu === "spotlight"} onClose={() => setActiveMenu("")} />
                  </ErrorBoundary>
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
            transition={transitionProps}
            aria-expanded={expandedId === secondaryActivity.id}
            className="h-navbar-bubble w-navbar-bubble shrink-0 rounded-full bg-[#1D1D1F]/90 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-3xl pointer-events-auto flex items-center justify-center relative cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
      
      <NavbarMobileDrawer 
        isOpen={isMobileOpen || false} 
        setIsOpen={setIsMobileOpen} 
        onOpenJarvis={() => setActiveMenu("spotlight")} 
        mainLinks={mainLinks}
        intelligenceModules={intelligenceModules}
      />
      </nav>
    </>
  );
}

const LiquidNavItem = React.memo(function LiquidNavItem({
  href, icon: Icon, label, isActive, isHovered, hasHoveredItem, onHover
}: {
  href: string; icon: React.ElementType; label: string; isActive: boolean; isHovered: boolean; hasHoveredItem: boolean; onHover: (path: string | null) => void
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
    <li role="none">
      <Link
        href={href}
        role="menuitem"
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => onHover(href)}
        onMouseLeave={() => {
          mouseX.set(0);
          mouseY.set(0);
          onHover(null);
        }}
        onClick={(e) => {
          if (isActive) e.preventDefault();
        }}
        className="relative z-10 px-4 py-2.5 outline-none group rounded-full focus-visible:ring-2 focus-visible:ring-blue-500 inline-block"
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
          {(isHovered || (!hasHoveredItem && isActive)) && (
            <motion.div
              layoutId="liquid-pill"
              className="absolute inset-0 bg-[#0071e3] rounded-full z-[1] shadow-[0_0_15px_rgba(0,113,227,0.5),inset_0_1px_0_rgba(255,255,255,0.2)]"
              transition={{ type: "spring", stiffness: 300, damping: 28, mass: 0.8 }}
            />
          )}
        </AnimatePresence>
      </Link>
    </li>
  );
});
