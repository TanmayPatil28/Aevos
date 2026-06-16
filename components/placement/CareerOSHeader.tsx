"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Target, Cpu, Briefcase } from "lucide-react";
import { cn } from "@/lib/cn";

export default function CareerOSHeader() {
  const pathname = usePathname();

  const tabs = [
    {
      name: "Placement Radar",
      href: "/placement",
      icon: Target,
    },
    {
      name: "Skills Matrix",
      href: "/career",
      icon: Cpu,
    },
    {
      name: "Internship Matcher",
      href: "/internships",
      icon: Briefcase,
    },
  ];

  return (
    <div className="w-full relative z-40 mb-8 mt-4">
      <div className="max-w-[1400px] mx-auto">
        <div className="relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#1c1c1e]/60 backdrop-blur-xl px-4 py-3 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            {/* Logo / Branding */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Cpu className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white tracking-tight leading-none mb-1">
                  Career Intelligence OS
                </h1>
                <p className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase leading-none">
                  Reactive Co-Processor
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1.5 p-1 bg-black/40 rounded-full border border-white/[0.04]">
              {tabs.map((tab) => {
                const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
                const Icon = tab.icon;
                return (
                  <Link
                    key={tab.name}
                    href={tab.href}
                    className={cn(
                      "relative px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center gap-2 outline-none whitespace-nowrap",
                      isActive
                        ? "text-white"
                        : "text-zinc-400 hover:text-zinc-200"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeCareerOSTab"
                        className="absolute inset-0 bg-white/[0.08] rounded-full border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon className={cn("h-3.5 w-3.5", isActive ? "text-indigo-400" : "text-zinc-500")} />
                    <span>{tab.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
