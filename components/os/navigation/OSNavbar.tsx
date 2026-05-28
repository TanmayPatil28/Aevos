"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { name: "Overview", href: "/overview", icon: "dashboard" },
  { name: "Identity", href: "/identity", icon: "badge" },
  { name: "Ledger", href: "/ledger", icon: "table_chart" },
  { name: "Forecasting", href: "/forecasting", icon: "timeline" },
  { name: "Records", href: "/records", icon: "inventory_2" },
  { name: "Career", href: "/career", icon: "work" },
];

export default function OSNavbar() {
  const pathname = usePathname();

  return (
    <div className="hidden sm:block w-full max-w-2xl mx-auto pointer-events-auto">
      <nav className="flex items-center justify-between p-1.5 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-full shadow-lg shadow-black/20">
        
        {/* Brand / Logo Area */}
        <div className="flex items-center justify-center pl-4 pr-2">
          <div className="w-6 h-6 bg-indigo-500 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.4)]">
            <span className="text-[10px] font-black text-white leading-none">GF</span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-1 flex-1 justify-center">
          {NAV_LINKS.map((link) => {
            const isActive = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2
                  ${isActive 
                    ? "text-white bg-slate-800 shadow-sm border border-slate-700/50" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }
                `}
              >
                <span className="material-symbols-outlined text-[18px] opacity-80">{link.icon}</span>
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Secondary Actions (Profile/Settings) */}
        <div className="flex items-center pr-1.5">
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 transition-colors">
            <span className="material-symbols-outlined text-[18px]">person</span>
          </button>
        </div>

      </nav>
    </div>
  );
}
