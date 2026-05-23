"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { DataSyncEngine } from "./DataSyncEngine";

interface DataSyncDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DataSyncDrawer({ isOpen, onClose }: DataSyncDrawerProps) {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-2xl bg-[#0B0F19] border-l border-white/10 z-50 overflow-y-auto shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 sticky top-0 bg-[#0B0F19]/80 backdrop-blur-md z-10">
              <div>
                <h2 className="text-xl font-bold text-white">Academic Data Sync</h2>
                <p className="text-sm text-slate-400">Import and update your official records</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 md:p-8">
              <DataSyncEngine onSuccess={onClose} isHero={false} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
