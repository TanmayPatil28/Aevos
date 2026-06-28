"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, Search, User } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { UniversityTrigger } from "@/components/UniversitySelector";
import { OSModeTrigger } from "@/components/OSModeSwitcher";

import { ActiveMenu } from "@/components/types/navigation";

interface NavbarActionSuiteProps {
  activeMenu: ActiveMenu | string;
  setActiveMenu: (menu: string) => void;
}

export default function NavbarActionSuite({ activeMenu, setActiveMenu }: NavbarActionSuiteProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="hidden md:flex items-center gap-2">
      <OSModeTrigger 
        isOpen={activeMenu === "os"} 
        onClick={() => setActiveMenu(activeMenu === "os" ? "" : "os")} 
      />
      <UniversityTrigger 
        isOpen={activeMenu === "university"} 
        onClick={() => setActiveMenu(activeMenu === "university" ? "" : "university")} 
      />

      <button
        onClick={() => setActiveMenu(activeMenu === "spotlight" ? "" : "spotlight")}
        aria-label="Spotlight Search"
        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-inner border hover:scale-105 ${
          activeMenu === "spotlight" 
            ? "bg-white/20 border-white/30 text-white" 
            : "bg-white/[0.03] border-white/[0.05] text-white hover:bg-white/10 hover:border-white/20"
        }`}
      >
        <Search size={18} strokeWidth={2.5} />
      </button>



      {user ? (
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-1 pr-4 rounded-full shadow-inner transition-all hover:bg-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white overflow-hidden shrink-0">
            {user.user_metadata?.avatar_url ? (
              <img 
                src={user.user_metadata.avatar_url} 
                alt="User Avatar" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <User size={16} className={user.user_metadata?.avatar_url ? "hidden" : "block"} />
          </div>
          <button
             onClick={handleSignOut}
             className="text-[14px] font-bold tracking-tight text-white/80 hover:text-white transition-colors"
          >
            Log Out
          </button>
        </div>
      ) : (
        <Link href="/auth">
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
