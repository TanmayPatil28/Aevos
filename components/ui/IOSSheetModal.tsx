import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface IOSSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function IOSSheetModal({ isOpen, onClose, title, children }: IOSSheetModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  if (!isMounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex justify-center items-end bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          onWheel={(e) => e.stopPropagation()}
        >
          {/* Sheet */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1C1C1E]/95 backdrop-blur-2xl border-t border-x border-white/10 rounded-t-[32px] w-full max-w-[800px] shadow-[0_-20px_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative h-[85vh]"
          >
            {/* iOS Drag Handle */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-white/20"></div>

            <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors z-50">
              <X className="w-4 h-4 text-white/60" />
            </button>
              
            {/* Header */}
            <div className="w-full px-8 pt-12 pb-6 flex flex-col">
              <h2 className="text-[17px] font-semibold text-white tracking-tight">{title}</h2>
            </div>

            {/* Scrollable Content */}
            <div 
              className="w-full px-6 pb-8 md:px-8 max-h-[70vh] overflow-y-auto custom-scrollbar overscroll-contain relative z-10"
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {children}
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
