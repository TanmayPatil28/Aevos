import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Calendar, AlertTriangle, TrendingDown, BookOpen, FileText, Clock } from "lucide-react";

interface AddAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (assignment: any) => void;
}

export function AddAssignmentModal({ isOpen, onClose, onAdd }: AddAssignmentModalProps) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [impact, setImpact] = useState("");
  const [priority, setPriority] = useState("HIGH");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subject || !dueDate || !impact) return;
    
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      title,
      subject,
      dueDate,
      impact,
      priority
    });
    
    // Reset form
    setTitle("");
    setSubject("");
    setDueDate("");
    setImpact("");
    setPriority("HIGH");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-40%" }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-40%" }}
            className="fixed left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-md max-h-[90vh] bg-[#161618] border border-white/10 rounded-[24px] shadow-2xl z-[9999] overflow-hidden flex flex-col"
          >
            <div className="p-5 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-brand/10 flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5 text-brand" />
                  </div>
                  Add Assignment
                </h2>
                <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Assignment Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. OS Mini Project"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand/50 transition-colors"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Subject</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <FileText className="w-3.5 h-3.5 text-white/30" />
                      </div>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. DBMS Lab"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand/50 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Due Date</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Clock className="w-3.5 h-3.5 text-white/30" />
                      </div>
                      <input
                        type="text"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        placeholder="e.g. Tomorrow"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand/50 transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Impact</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <TrendingDown className="w-3.5 h-3.5 text-white/30" />
                      </div>
                      <input
                        type="text"
                        value={impact}
                        onChange={(e) => setImpact(e.target.value)}
                        placeholder="e.g. None"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Priority</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <AlertTriangle className={`w-3.5 h-3.5 ${priority === 'CRITICAL' ? 'text-rose-500' : priority === 'HIGH' ? 'text-amber-500' : 'text-[#10b981]'}`} />
                      </div>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as "CRITICAL" | "HIGH" | "MEDIUM")}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-sm text-white focus:outline-none focus:border-brand/50 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="HIGH">HIGH</option>
                        <option value="MEDIUM">MEDIUM</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-brand text-black font-bold py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Assignment
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
