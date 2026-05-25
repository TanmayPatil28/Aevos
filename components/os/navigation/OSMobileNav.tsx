"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { name: "Overview", href: "/overview", icon: "dashboard" },
  { name: "Ledger", href: "/ledger", icon: "table_chart" },
  { name: "Forecast", href: "/forecasting", icon: "timeline" },
  { name: "Records", href: "/records", icon: "inventory_2" },
];

export default function OSMobileNav() {
  const pathname = usePathname();

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950 border-t border-slate-800 pb-safe">
      <nav className="flex justify-around items-center h-16 px-2">
        {NAV_LINKS.map((link) => {
          const isActive = pathname?.startsWith(link.href);
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors
                ${isActive ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"}
              `}
            >
              <span className="material-symbols-outlined text-[20px]">
                {link.icon}
              </span>
              <span className="text-[10px] font-medium leading-none">
                {link.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
