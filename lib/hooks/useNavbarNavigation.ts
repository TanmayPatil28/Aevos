import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import {
  Home, Calculator, CalendarDays, LayoutDashboard,
  AlertTriangle, Target, Compass, Flame, Briefcase, BookOpen
} from 'lucide-react';

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

export function useNavbarNavigation() {
  const pathname = usePathname();

  const isLinkActive = useMemo(() => {
    return (href: string) => {
      if (href === '/') return pathname === href || pathname === '/dashboard';
      return pathname?.startsWith(href) ?? false;
    };
  }, [pathname]);

  return {
    pathname,
    isLinkActive,
  };
}
