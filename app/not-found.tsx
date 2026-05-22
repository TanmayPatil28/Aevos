import React from "react";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import GlowButton from "@/components/GlowButton";
import GlassCard from "@/components/GlassCard";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090D16] p-6 text-white selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#090D16] to-[#090D16] pointer-events-none" />
      
      <GlassCard className="max-w-md w-full p-8 text-center border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="inline-flex p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 text-indigo-400 mb-6 font-mono text-3xl font-bold tracking-widest relative">
          404
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          Page Not Configured
        </h1>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          The requested path is outside our registered academic domains. Double-check your circular path.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <GlowButton variant="primary" className="w-full">
              <Home size={16} className="mr-2" />
              Go to Dashboard
            </GlowButton>
          </Link>
          <Link href="/" className="w-full sm:w-auto">
            <GlowButton variant="secondary" className="w-full">
              <ArrowLeft size={16} className="mr-2" />
              Home Page
            </GlowButton>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
