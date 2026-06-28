"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, LogOut } from 'lucide-react';
import { UniversityContent } from "@/components/UniversitySelector";
import { useAuth } from "@/lib/auth/AuthProvider";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Divider } from "@/components/ui/divider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const MotionCard = motion(Card);

export function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, signOut } = useAuth();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center font-sf p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          <MotionCard 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            variant="accent"
            padding="xl"
            className="relative w-full max-w-[1024px] !p-0 overflow-visible flex flex-col z-10 shadow-[0px_20px_50px_0px_rgba(0,0,0,0.5)] border-[0.8px] border-[rgba(255,255,255,0.08)] bg-[#1c1c1e]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-10 py-8 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3a3a3c] border-[0.8px] border-[rgba(255,255,255,0.08)] flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white/50" />
                </div>
                <span className="text-[22px] font-semibold text-[#F5F5F7] tracking-tight">Dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button 
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-[#3a3a3c] border-[0.8px] border-[rgba(255,255,255,0.08)] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="px-10 pb-10 flex flex-col gap-10">
              
              {/* Left Column: Academic & User */}
              <div className="flex flex-col gap-10">
                <UniversityContent onClose={onClose} />

                {/* User / Logout Sector */}
                <Card padding="md" className="mt-auto flex items-center justify-between border-[0.8px] border-[rgba(255,255,255,0.08)] bg-[#3a3a3c]">
                  <div className="flex items-center gap-4">
                    {user?.user_metadata?.avatar_url ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden border-[0.8px] border-[rgba(255,255,255,0.08)] shrink-0">
                        <img src={user.user_metadata.avatar_url} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <Avatar size="md" name={user?.email || 'local developer'} />
                    )}
                    <div className="flex flex-col gap-0.5">
                      <h3 className="text-[16px] text-[#F5F5F7] font-medium tracking-tight">Active Session</h3>
                      <p className="text-[14px] text-[#86868B] font-medium leading-none">{user?.email || 'local@developer.com'}</p>
                    </div>
                  </div>
                  <Button variant="danger" size="md" onClick={() => signOut()}>
                    <LogOut size={16} />
                    Sign Out
                  </Button>
                </Card>
              </div>



            </div>
          </MotionCard>
        </div>
      )}
    </AnimatePresence>
  );
}
