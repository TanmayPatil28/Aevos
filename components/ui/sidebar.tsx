"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Orbit,
  Sigma,
  Crosshair,
  Activity,
  ShieldHalf,
  Hourglass,
  RotateCcw,
  Aperture,
  Layers,
  ScanLine,
  Milestone,
  Database,
  Waypoints,
  Map,
  Search,
  Home,
  Settings,
  Cpu,
  X,
  LogOut
} from 'lucide-react';
import { SettingsModal } from "@/components/ui/SettingsModal";
import { useAuth } from "@/lib/auth/AuthProvider";

const categories = [
  {
    id: "predictors",
    name: "Predictor",
    icon: Orbit,
    color: "text-blue-500",
    href: "/calculator",
    items: []
  },
  {
    id: "survival",
    name: "Academics",
    icon: ShieldHalf,
    color: "text-red-500",
    href: "/attendance",
    items: []
  },
  {
    id: "career",
    name: "Careers",
    icon: Layers,
    color: "text-purple-500",
    href: "/placement",
    items: []
  },
  {
    id: "system",
    name: "System",
    icon: Cpu,
    color: "text-zinc-500",
    items: [
      { id: "home", name: "Home", icon: Home, href: "/dashboard", color: "text-zinc-500" },
      { id: "settings", name: "Settings", icon: Settings, href: "#settings", color: "text-zinc-500" }
    ]
  }
];

const ITEM_HEIGHT = 48;

function SidebarItem({
  item,
  yPos,
  isActiveCategory,
  isExpanded,
  setIsExpanded,
  handleItemClick,
  hoveredId,
  setHoveredId,
  isInactive
}: any) {
  const Icon = item.icon;
  const isHoveredItem = hoveredId === item.id;

  // High contrast pure black icons inside the white bubble
  const iconColor = "text-black";
  const strokeW = (isActiveCategory || isHoveredItem) ? (item.isSubItem ? 2.5 : 2) : (item.isSubItem ? 2 : 1.5);
  // Dim the entire white bubble if inactive and menu is expanded
  const opacityClass = (!isExpanded) ? 'opacity-100' : ((isActiveCategory || isHoveredItem) ? 'opacity-100' : 'opacity-40');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, filter: "blur(10px)", height: 0, y: yPos, x: 0 }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)", height: ITEM_HEIGHT, y: yPos, x: isInactive ? -8 : 0 }}
      exit={{ opacity: 0, scale: 0.5, filter: "blur(10px)", height: 0, y: yPos, x: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 30, mass: 1 }}
      className={`absolute w-full flex flex-col items-center justify-center pointer-events-auto cursor-pointer`}
      onMouseEnter={() => setHoveredId(item.id)}
      onMouseLeave={() => setHoveredId(null)}
      onClick={(e) => {
        e.stopPropagation();
        handleItemClick(item);
        if (!isExpanded) setIsExpanded(true);
      }}
    >
      {/* Pure White Bubble Container */}
      <div className={`relative flex items-center justify-center bg-white rounded-full transition-all duration-300 z-20 ${opacityClass}
        w-10 h-10
        ${(isActiveCategory || isHoveredItem) 
          ? 'scale-105 shadow-none' 
          : (isInactive ? 'scale-90 shadow-none' : 'scale-100 shadow-none hover:scale-105')}
      `}>
        <Icon className={`w-[22px] h-[22px] ${iconColor} transition-colors duration-300`} strokeWidth={strokeW} />
      </div>

      {/* Premium Apple Tooltip Label */}
      <AnimatePresence>
        {isHoveredItem && (
          <motion.div
            initial={{ opacity: 0, x: -5, scale: 0.95, filter: "blur(2px)" }}
            animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -5, scale: 0.95, filter: "blur(2px)" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-[76px] z-[100] pointer-events-none whitespace-nowrap"
          >
            <div 
              className="text-[13px] font-sf font-semibold tracking-wide text-[#e2e2e5]" 
              style={{ textShadow: "-0.5px -0.5px 0 rgba(255,255,255,0.4), 1px 1px 2px rgba(0,0,0,1), 0 4px 16px rgba(0,0,0,0.9)" }}>
              {item.name}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function Sidebar({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { user, signOut } = useAuth();

  // Flatten the list into an accordion based on activeCategoryId
  const activeList = useMemo(() => {
    let list: any[] = [];
    categories.forEach(cat => {
      list.push({ ...cat, isCategory: true });
      if (activeCategoryId === cat.id) {
        cat.items.forEach(item => {
          list.push({ ...item, isSubItem: true, parentId: cat.id });
        });
      }
    });

    return list;
  }, [activeCategoryId]);

  const getSectionId = (itemId: string | null) => {
    if (!itemId) return null;
    const item = activeList.find(i => i.id === itemId);
    if (item?.parentId) return item.parentId;
    if (item?.isCategory) return item.id;
    return itemId;
  };

  const targetSectionId = getSectionId(hoveredId) || activeCategoryId;

  // Dynamically calculate absolute Y positions and inject exact tension physical gaps
  let currentY = 0;
  const GAP = 5; // Pushes inactive items 24px away, creating exactly 4px of vertical padding from the S-curves!

  const positionedList = activeList.map((item, index) => {
    // Add top gap if this is the first item of the active section
    if (targetSectionId && (item.id === targetSectionId || item.parentId === targetSectionId)) {
      const isFirstOfSection = index === 0 || !(activeList[index - 1].id === targetSectionId || activeList[index - 1].parentId === targetSectionId);
      if (isFirstOfSection) {
        currentY += GAP;
      }
    }

    const itemY = currentY;
    currentY += ITEM_HEIGHT;

    // Add bottom gap if this is the last item of the active section
    if (targetSectionId && (item.id === targetSectionId || item.parentId === targetSectionId)) {
      const isLastOfSection = index === activeList.length - 1 || !(activeList[index + 1].id === targetSectionId || activeList[index + 1].parentId === targetSectionId);
      if (isLastOfSection) {
        currentY += GAP;
      }
    }

    return { ...item, targetY: itemY };
  });

  const totalHeight = currentY;

  const sectionItems = positionedList.filter(item => item.id === targetSectionId || item.parentId === targetSectionId);
  const hasTarget = sectionItems.length > 0;

  let sectionTop = 0;
  let sectionTargetH = 0;
  if (hasTarget) {
    sectionTop = sectionItems[0].targetY;
    sectionTargetH = sectionItems.length * ITEM_HEIGHT;
  }
  const sectionCenter = sectionTop + sectionTargetH / 2;

  // --- SVG PATH GENERATOR FOR APPLE TENSION MECHANICS ---
  const canvasW = 260;
  const canvasH = 2400; // Massive canvas to prevent clipping during scrolling/resizing
  const cy = 1200; // Center of screen

  const targetY = hasTarget ? cy - totalHeight / 2 + sectionCenter : cy;

  const wallX = 30; // Creates a permanent 10px anchor bezel on screen

  // When expanded, extend to cover the text labels with a 16px right padding (256 - 16 = 240).
  const expandedW = 280;
  const collapsedW = 90; // 67px perfectly restores the absolute 4px concentric boundary (icon center 43 + 24 radius)
  const w = hasTarget ? (isExpanded ? expandedW : collapsedW) : wallX;

  const s = hasTarget ? 24 : 0; // 24px sweep perfectly spans half the 48px grid distance
  const h = hasTarget ? Math.max(0, sectionTargetH - ITEM_HEIGHT) : 0; // 0 for 1 item, locks caps to icon centers
  const R = hasTarget ? 24 : 0; // 24px radius spans the other half of the 48px grid distance
  const k = 0.5522847; // Mathematical constant for perfect circular Beziers

  const tsY = targetY - h / 2 - R - s;
  const teY = targetY - h / 2;
  const beY = targetY + h / 2;
  const bsY = targetY + h / 2 + R + s;

  // By locking sweep_w to 13, it ends exactly at X=43 (icon center). 
  // This flawlessly fuses the sweep and corner when collapsed, and creates a clean roof when expanded.
  const sweep_w = hasTarget ? 55 : 0;
  const sweep_end_x = wallX + sweep_w; // 54
  const tension = 0.69; // Perfect 50% tension for a mathematically flawless organic S-curve

  // Top Wall Sweep (Vertical to Horizontal)
  const c1x_ts = wallX;
  const c1y_ts = tsY + s * tension;
  const c2x_ts = sweep_end_x - sweep_w * tension;
  const c2y_ts = teY - R;

  // Top Pill Corner (Horizontal to Vertical)
  const c1x_tc = (w - R) + R * k;
  const c1y_tc = teY - R;
  const c2x_tc = w;
  const c2y_tc = teY - R + R * k;

  // Bottom Pill Corner (Vertical to Horizontal)
  const c1x_bc = w;
  const c1y_bc = beY + R * k;
  const c2x_bc = (w - R) + R * k;
  const c2y_bc = beY + R;

  // Bottom Wall Sweep (Horizontal to Vertical)
  const c1x_bs = sweep_end_x - sweep_w * tension;
  const c1y_bs = beY + R;
  const c2x_bs = wallX;
  const c2y_bs = bsY - s * tension;

  const pathString = `
    M 0,0 
    L ${wallX},0 
    L ${wallX},${tsY} 
    C ${c1x_ts},${c1y_ts} ${c2x_ts},${c2y_ts} ${sweep_end_x},${teY - R}
    L ${w - R},${teY - R}
    C ${c1x_tc},${c1y_tc} ${c2x_tc},${c2y_tc} ${w},${teY}
    L ${w},${beY}
    C ${c1x_bc},${c1y_bc} ${c2x_bc},${c2y_bc} ${w - R},${beY + R}
    L ${sweep_end_x},${beY + R}
    C ${c1x_bs},${c1y_bs} ${c2x_bs},${c2y_bs} ${wallX},${bsY}
    L ${wallX},2400
    L 0,2400
    Z
  `;
  // ------------------------------------------------------

  // Initial load logic
  useEffect(() => {
    let foundCategory = null;
    for (let c of categories) {
      if (c.items && c.items.some(item => pathname.startsWith(item.href) && item.href !== "#")) {
        foundCategory = c.id;
        break;
      } else if (c.href && pathname.startsWith(c.href)) {
        foundCategory = c.id;
        break;
      }
    }
    if (foundCategory) {
      setActiveCategoryId(foundCategory);
    }
  }, [pathname]);

  const handleItemClick = (item: any) => {
    if (item.isCategory) {
      if (item.href && item.items.length === 0) {
        if (item.href !== pathname) router.push(item.href);
      } else {
        setActiveCategoryId(activeCategoryId === item.id ? null : item.id);
      }
    } else {
      if (item.href === "#settings") {
        setSettingsOpen(true);
      } else if (item.href && item.href !== pathname) {
        router.push(item.href);
      }
    }
  };

  const isActive = isExpanded || isHovered;

  return (
    <>
      <div className="flex w-full min-h-screen bg-background relative overflow-x-hidden">

        <div
          className="fixed top-0 left-0 h-screen w-20 z-50 flex items-center cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            setIsExpanded(false);
            // Auto reset accordion when mouse leaves
            if (activeCategoryId) {
              setTimeout(() => {
                setActiveCategoryId(null);
              }, 400);
            }
          }}
          onClick={() => !isExpanded && setIsExpanded(true)}
        >
          {/* Bezel / Background Pill (Pure SVG Math) */}
          <div className="absolute inset-0 pointer-events-none overflow-visible">
            <svg
              className="absolute top-1/2 -translate-y-1/2 left-[-20px] pointer-events-none overflow-visible"
              width={canvasW}
              height={canvasH}
              viewBox={`0 0 ${canvasW} ${canvasH}`}
            >
              <motion.path
                initial={false}
                animate={{ d: pathString }}
                transition={{ type: "spring", stiffness: 200, damping: 30, mass: 1 }}
                fill="#18181b"
                className="drop-shadow-[10px_0_20px_rgba(0,0,0,0.5)]"
              />
            </svg>
          </div>

          {/* Icons Carousel - Always Visible */}
          <motion.div
            animate={{ height: totalHeight }}
            transition={{ type: "spring", stiffness: 200, damping: 30, mass: 1 }}
            className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[54px] z-20 pointer-events-none"
          >
            <AnimatePresence>
              {positionedList.map((item) => (
                <SidebarItem
                  key={item.id}
                  item={item}
                  yPos={item.targetY}
                  isActiveCategory={activeCategoryId === item.id && item.isCategory}
                  isExpanded={isActive}
                  setIsExpanded={setIsExpanded}
                  handleItemClick={handleItemClick}
                  hoveredId={hoveredId}
                  setHoveredId={setHoveredId}
                  isInactive={targetSectionId ? !(item.id === targetSectionId || item.parentId === targetSectionId) : false}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="flex-1 w-full min-h-screen bg-background pl-6">
          {children}
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}

