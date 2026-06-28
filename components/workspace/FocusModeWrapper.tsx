"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface FocusModeWrapperProps {
  children: React.ReactNode;
  title: string;
}

export default function FocusModeWrapper({ children, title }: FocusModeWrapperProps) {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col font-sans">
      {/* Focus Mode Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-white/20 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard"
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold tracking-tight">Command Center</span>
          </Link>
          <div className="w-[1px] h-4 bg-white/20" />
          <h1 className="text-white font-black tracking-tight">{title}</h1>
        </div>
      </header>

      {/* Main Focus Canvas */}
      <main className="flex-1 relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full h-full max-w-7xl mx-auto p-4 md:p-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
