"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { UniversityTrigger } from "@/components/UniversitySelector";
import { OSModeTrigger } from "@/components/OSModeSwitcher";

export type ActiveMenu = "intelligence" | "university" | "os" | "spotlight" | null;

interface NavbarActionSuiteProps {
  activeMenu: ActiveMenu;
  setActiveMenu: (menu: ActiveMenu) => void;
}

export default function NavbarActionSuite({ activeMenu, setActiveMenu }: NavbarActionSuiteProps) {
  const { data: session } = useSession();

  return (
    <div className="hidden md:flex items-center gap-2">
      <OSModeTrigger 
        isOpen={activeMenu === "os"} 
        onClick={() => setActiveMenu(activeMenu === "os" ? null : "os")} 
      />
      <UniversityTrigger 
        isOpen={activeMenu === "university"} 
        onClick={() => setActiveMenu(activeMenu === "university" ? null : "university")} 
      />

      <button
        onClick={() => setActiveMenu(activeMenu === "spotlight" ? null : "spotlight")}
        aria-label="Spotlight Search"
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-inner border hover:scale-105 ${
          activeMenu === "spotlight" 
            ? "bg-white/20 border-white/30 text-white" 
            : "bg-white/[0.03] border-white/[0.05] text-white hover:bg-white/10 hover:border-white/20"
        }`}
      >
        <Search size={18} strokeWidth={2.5} />
      </button>



      {session ? (
        <button
           onClick={() => signOut()}
           className="bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-full text-[14px] font-bold tracking-tight transition-all border border-white/10 shadow-inner"
        >
          Log Out
        </button>
      ) : (
        <Link href="/login">
          <motion.button
            whileHover={{ scale: 1.05, y: -2, boxShadow: "0 15px 30px rgba(124,58,237,0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-br from-[#4F8EF7] via-[#7C3AED] to-[#A855F7] text-white px-7 py-2.5 rounded-full text-[14px] font-black tracking-tight flex items-center gap-2 shadow-premium"
          >
            Login
            <ArrowRight size={17} strokeWidth={3} />
          </motion.button>
        </Link>
      )}
    </div>
  );
}
