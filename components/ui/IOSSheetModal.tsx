import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface IOSSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function IOSSheetModal({ isOpen, onClose, title, children }: IOSSheetModalProps) {
  // Prevent scrolling on body when modal is open
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] cursor-pointer"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[101] flex flex-col items-center justify-end pointer-events-none"
          >
            <div className="w-full max-w-3xl bg-[#1C1C1E] rounded-t-[32px] overflow-hidden pointer-events-auto border-t border-white/10 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] max-h-[90vh] flex flex-col">
              
              {/* Drag Handle & Header */}
              <div className="flex flex-col items-center pt-3 pb-4 px-6 border-b border-white/5 shrink-0">
                <div className="w-12 h-1.5 bg-[#3A3A3C] rounded-full mb-4" />
                <div className="w-full flex items-center justify-between">
                  <h2 className="text-[17px] font-semibold text-white tracking-tight">{title}</h2>
                  <button 
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-[#2C2C2E] flex items-center justify-center text-[#8E8E93] hover:bg-[#3A3A3C] hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
                {children}
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
