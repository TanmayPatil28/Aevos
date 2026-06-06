"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2, Zap, Target, Lock, X } from "lucide-react";
import { cn } from "@/lib/cn";

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProUpgradeModal({ isOpen, onClose }: ProUpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCheckout = () => {
    setIsLoading(true);
    // Dummy Stripe simulation
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[#050505] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(245,158,11,0.15)]"
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
              <motion.div
                animate={{
                  x: ["-100%", "200%"],
                  opacity: [0, 0.5, 0],
                }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
              />
            </div>

            {/* Header */}
            <div className="relative p-8 pb-6 text-center">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors rounded-full hover:bg-white/10"
              >
                <X size={16} />
              </button>
              
              <div className="w-16 h-16 mx-auto bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                <Lock className="text-amber-400" size={32} />
              </div>
              <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Unlock GradeFlow <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">PRO</span></h2>
              <p className="text-white/60">Take control of your academic destiny with the ultimate Neural Engine upgrades.</p>
            </div>

            {/* Features List */}
            <div className="px-8 pb-8">
              <div className="space-y-4 mb-8">
                {[
                  { icon: Sparkles, text: "AI Auto-Apply to 100+ Internships" },
                  { icon: Target, text: "Personalized Grade Recovery Plans" },
                  { icon: Zap, text: "Unlimited Forecasting Steps" },
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                    <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                      <feature.icon size={16} />
                    </div>
                    <span className="text-sm font-medium text-white/90">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* Checkout Action */}
              <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex flex-col items-center">
                <div className="text-center mb-4">
                  <span className="text-3xl font-black text-white">$9.99</span>
                  <span className="text-white/40 text-sm"> / month</span>
                </div>
                
                <button
                  onClick={handleCheckout}
                  disabled={isLoading || isSuccess}
                  className={cn(
                    "w-full py-4 rounded-xl font-bold text-sm transition-all relative overflow-hidden flex items-center justify-center gap-2",
                    isSuccess 
                      ? "bg-emerald-500 text-white" 
                      : "bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:opacity-90"
                  )}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : isSuccess ? (
                    <>
                      <CheckCircle2 size={18} />
                      Upgraded!
                    </>
                  ) : (
                    "Checkout with Stripe"
                  )}
                </button>
                <p className="text-[10px] text-white/30 text-center mt-3 uppercase tracking-widest">Cancel anytime. No lock-in.</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
