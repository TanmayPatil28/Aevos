"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, GraduationCap, Home, Calculator, CalendarDays, LayoutDashboard, Compass, Target, Briefcase, Flame, BookOpen } from "lucide-react";
import { cn } from "@/lib/cn";
import UniversitySelector from "@/components/UniversitySelector";
import { MAIN_LINKS, INTELLIGENCE_MODULES } from "./Navbar";
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-[#000000]/80 z-[100000]" />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 w-[300px] h-full bg-[#1D1D1F] border-l border-white/20 z-[100001] p-8 flex flex-col"
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

              <div className="overflow-y-auto pb-20 pr-2">
                {INTELLIGENCE_MODULES.map((module, i) => (
                  <motion.div key={module.category} initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 + i * 0.1 }} className="mb-6">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 mb-3 ml-2">{module.category}</h4>
                    <div className="flex flex-col gap-1">
                      {module.items.map((tool) => (
                        <Link 
                          key={tool.href}
                          href={tool.href}
                          onClick={() => setIsOpen(false)}
                          className="w-full text-left flex items-center gap-4 p-3 rounded-2xl group active:bg-white/5 transition-colors"
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-white/50 transition-all shadow-inner",
                            module.accent.hoverIcon
                          )}>
                            <tool.icon size={18} strokeWidth={2.5} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[14px] font-bold text-white/90 group-hover:text-white transition-colors">{tool.name}</span>
                            <span className="text-[11px] font-medium text-white/40 group-hover:text-white/60 transition-colors leading-tight">{tool.desc}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
