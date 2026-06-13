"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUSMStore } from "@/stores/usmStore";
import { X, Trash2, AlertTriangle } from "lucide-react";
import { DataSyncEngine } from "./DataSyncEngine";

export function DeleteSemesterButton() {
  const [selectedSemester, setSelectedSemester] = useState<string>("1");
  const [confirmStep, setConfirmStep] = useState(0);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    if (confirmStep === 0) {
      setConfirmStep(1);
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch("/api/academic/reset-semester", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ semester: selectedSemester }),
      });
      if (res.ok) {
        // Optimistically clean the zustand store so it doesn't re-save to disk
        const numSem = parseInt(selectedSemester);
        useUSMStore.setState((state) => ({
          courses: state.courses.filter(c => c.semester !== numSem),
          semesterHistory: state.semesterHistory.filter(s => s.semester !== numSem)
        }));
        
        window.location.reload();
      } else {
        console.error("Failed to reset semester data");
        setIsResetting(false);
        setConfirmStep(0);
      }
    } catch (err) {
      console.error(err);
      setIsResetting(false);
      setConfirmStep(0);
    }
  };

  return (
    <div className="flex gap-2 w-full mt-4">
      <select 
        className="bg-black/50 text-slate-300 rounded-xl px-4 py-3 border border-red-500/20 focus:outline-none focus:border-red-500/50 min-w-[120px] font-bold"
        value={selectedSemester}
        onChange={(e) => { setSelectedSemester(e.target.value); setConfirmStep(0); }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
          <option key={s} value={s}>Sem {s}</option>
        ))}
      </select>
      <button
        onClick={handleReset}
        disabled={isResetting}
        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${
          confirmStep === 1
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
        }`}
      >
        {isResetting ? (
          <span className="animate-pulse">Deleting...</span>
        ) : confirmStep === 1 ? (
          <>
            <AlertTriangle className="w-5 h-5" />
            Confirm Delete Sem {selectedSemester}?
          </>
        ) : (
          <>
            <Trash2 className="w-5 h-5" />
            Delete Sem {selectedSemester}
          </>
        )}
      </button>
    </div>
  );
}

export function ResetDataButton() {
  const [confirmStep, setConfirmStep] = useState(0);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    if (confirmStep === 0) {
      setConfirmStep(1);
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch("/api/academic/reset", {
        method: "POST",
      });
      if (res.ok) {
        // Clear Zustand persist storage properly
        useUSMStore.persist.clearStorage();
        localStorage.removeItem("gradeflow-usm-storage");
        
        // Reset in-memory state to ensure it doesn't flush back to disk
        useUSMStore.getState().resetStore();

        // Hard reload
        window.location.href = "/dashboard";
      } else {
        console.error("Failed to reset academic data");
        setIsResetting(false);
      }
    } catch (err) {
      console.error(err);
      setIsResetting(false);
    }
  };

  return (
    <div className="flex gap-2 w-full">
      <button
        onClick={handleReset}
        disabled={isResetting}
        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${
          confirmStep === 1
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
        }`}
      >
        {isResetting ? (
          <span className="animate-pulse">Resetting...</span>
        ) : confirmStep === 1 ? (
          <>
            <AlertTriangle className="w-5 h-5" />
            Yes, Clear My Data
          </>
        ) : (
          <>
            <Trash2 className="w-5 h-5" />
            Reset Academic Data
          </>
        )}
      </button>

      <button
        onClick={async () => {
          try {
            const res = await fetch("/api/academic/fix", { method: "POST" });
            const data = await res.json();
            alert(data.message || "Fixed SGPA successfully!");
            window.location.reload();
          } catch (err) {
            console.error(err);
            alert("Failed to fix SGPA.");
          }
        }}
        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20"
      >
        <span className="material-symbols-outlined text-[18px]">build</span>
        Fix SGPA 0 Bug
      </button>
    </div>
  );
}

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-2xl bg-[#0B0F19] border-l border-white/20 z-[101] overflow-y-auto shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/20 sticky top-0 bg-[#0B0F19]/80 backdrop-blur-md z-10">
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
            <div className="flex-1 p-6 md:p-8 flex flex-col gap-8">
              {/* Danger Zone */}
              <div className="pb-8 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-red-400">Danger Zone</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Clear corrupted academic data and reset dashboard
                    </p>
                  </div>
                </div>
                <ResetDataButton />
                <DeleteSemesterButton />
              </div>

              <DataSyncEngine onSuccess={onClose} isHero={false} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
