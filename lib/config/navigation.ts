import {
  Home, Calculator, CalendarDays, LayoutDashboard,
  AlertTriangle, Target, Compass, Flame, Briefcase, BookOpen
} from 'lucide-react';

export const ICONS: Record<string, any> = {
  Home, Calculator, CalendarDays, LayoutDashboard,
  AlertTriangle, Target, Compass, Flame, Briefcase, BookOpen
};

export const MAIN_LINKS = [
  { name: "Home", href: "/", iconName: "Home" },
  { name: "Command Center", href: "/dashboard", iconName: "LayoutDashboard" },
];

export const INTELLIGENCE_MODULES = [
  {
    category: "Academic Predictors",
    accent: { headerDot: "bg-blue-400", hoverIcon: "group-hover:bg-blue-500/10 group-hover:border-blue-500/20 group-hover:text-blue-400" },
    items: [
      { name: "Grade Calculator", href: "/calculator", iconName: "Calculator", desc: "Calculate SGPA & CGPA in real-time", role: "user" },
      { name: "Target Planner", href: "/planner", iconName: "CalendarDays", desc: "Set grade targets & simulate scenarios", role: "user" },
      { name: "Future Forecast", href: "/forecast", iconName: "Flame", desc: "AI-powered trajectory prediction", role: "user" }
    ]
  },
  {
    category: "Survival & Recovery",
    accent: { headerDot: "bg-amber-400", hoverIcon: "group-hover:bg-amber-500/10 group-hover:border-amber-500/20 group-hover:text-amber-400" },
    items: [
      { name: "Bunk Calculator", href: "/attendance", iconName: "AlertTriangle", desc: "Safe-bunk limits & detention risk", role: "user" },
      { name: "Backlog Recovery", href: "/backlog", iconName: "Target", desc: "Clearance strategy & marks needed", role: "user" }
    ]
  },
  {
    category: "Career Intelligence",
    accent: { headerDot: "bg-purple-400", hoverIcon: "group-hover:bg-purple-500/10 group-hover:border-purple-500/20 group-hover:text-purple-400" },
    items: [
      { name: "Placement Radar", href: "/placement", iconName: "Briefcase", desc: "Eligibility check & skill gap analysis", role: "user" }
    ]
  },
  {
    category: "Strategic Timelines",
    accent: { headerDot: "bg-emerald-400", hoverIcon: "group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 group-hover:text-emerald-400" },
    items: [
      { name: "Academic Timeline", href: "/timeline", iconName: "Compass", desc: "Visual semester-by-semester roadmap", role: "user" },
      { name: "Semester Roadmap", href: "/multi-semester", iconName: "BookOpen", desc: "Multi-year trajectory overview", role: "user" },
      { name: "Admin Dashboard", href: "/admin", iconName: "Target", desc: "System administration", role: "admin" }
    ]
  }
];
