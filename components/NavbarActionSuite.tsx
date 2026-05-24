"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, ArrowRight } from "lucide-react";
import UniversitySelector from "@/components/UniversitySelector";

export default function NavbarActionSuite() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  return (
    <div className="hidden md:flex items-center gap-4">
      <UniversitySelector variant="navbar" />

      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center transition-all duration-500 hover:bg-[#4F8EF7]/10 hover:border-[#4F8EF7]/20 text-white hover:text-[#4F8EF7] group shadow-inner"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ rotate: -180, scale: 0.5, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 180, scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {theme === 'dark' ? <Moon size={18} strokeWidth={2.5} /> : <Sun size={18} strokeWidth={2.5} className="text-yellow-400" />}
          </motion.div>
        </AnimatePresence>
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
