"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, GraduationCap, Home, Calculator, CalendarDays, LayoutDashboard, Compass, Target, Briefcase, Flame, BookOpen } from "lucide-react";
import { cn } from "@/lib/cn";
import UniversitySelector from "@/components/UniversitySelector";
import { MAIN_LINKS, ADVANCED_TOOLS } from "./Navbar";
import { useUSMStore } from "@/stores/usmStore";

interface NavbarMobileDrawerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function NavbarMobileDrawer({ isOpen, setIsOpen }: NavbarMobileDrawerProps) {
  const pathname = usePathname();
  const openPanel = useUSMStore(state => state.openPanel);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-[15px] z-[100000]" />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 w-[300px] h-full bg-black/98 backdrop-blur-[50px] border-l border-white/5 z-[100001] p-8 flex flex-col shadow-[-20px_0_100px_rgba(0,0,0,0.9)]"
          >
            <div className="flex items-center justify-between mb-8">
              <span className="font-headline font-black text-2xl text-white tracking-widest">GF.OS</span>
              <button onClick={() => setIsOpen(false)} aria-label="Close navigation menu" className="w-11 h-11 flex items-center justify-center rounded-full bg-white/5 text-white/60">
                <X size={26} strokeWidth={3} />
              </button>
            </div>

            {/* Mobile University Selector */}
            <UniversitySelector variant="mobile" />

            <div className="flex flex-col gap-2 flex-1 mt-6">
              {MAIN_LINKS.map((link, i) => (
                <motion.div key={link.href} initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 + i * 0.05 }}>
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl text-[17px] font-black transition-all",
                      pathname === link.href ? "bg-blue-500/10 text-blue-500" : "text-white/40 hover:text-white"
                    )}
                  >
                    <link.icon size={22} strokeWidth={3} />
                    {link.name}
                  </Link>
                </motion.div>
              ))}

              <div className="h-[1px] bg-white/5 my-6" />

              {ADVANCED_TOOLS.map((tool, i) => (
                <motion.div key={tool.panelKey} initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 + i * 0.05 }}>
                  <button 
                    onClick={() => {
                      openPanel(tool.panelKey);
                      setIsOpen(false);
                    }}
                    className="w-full text-left flex items-center gap-4 p-4 rounded-2xl group active:bg-white/5"
                  >
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", tool.color)}>
                      <tool.icon size={22} strokeWidth={3} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[16px] font-black text-white/90">{tool.name}</span>
                      <span className="text-[12px] font-medium text-white/30">{tool.desc}</span>
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
