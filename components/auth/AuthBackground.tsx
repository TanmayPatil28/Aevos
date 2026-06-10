"use client";

import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";

export function AuthBackground() {
  return (
    <div className="relative hidden w-full flex-col bg-[#0a0a0c] lg:flex lg:w-1/2 overflow-hidden border-r border-white/[0.04]">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 bg-[url('https://noise.npoint.io/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>

      <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white/90">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-center space-x-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/[0.08] shadow-sm">
            <GraduationCap className="h-5 w-5 text-white/90" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-white/90">GradeFlow</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="max-w-md space-y-6"
        >
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white/90">
            Orchestrate your academic success.
          </h1>
          <p className="text-base text-white/50 leading-relaxed font-normal">
            An intelligent ecosystem designed to synchronize your goals, predict your outcomes, and streamline your entire academic journey.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="flex items-center space-x-4 text-sm font-medium text-white/40"
        >
          <span>© {new Date().getFullYear()} GradeFlow Inc.</span>
          <span className="h-1 w-1 rounded-full bg-white/20"></span>
          <a href="#" className="hover:text-white/80 transition-colors">Privacy Policy</a>
          <span className="h-1 w-1 rounded-full bg-white/20"></span>
          <a href="#" className="hover:text-white/80 transition-colors">Terms of Service</a>
        </motion.div>
      </div>
    </div>
  );
}
