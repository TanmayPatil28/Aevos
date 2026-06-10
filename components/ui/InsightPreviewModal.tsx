import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, CheckCircle2, ListTodo, Plus, Loader2 } from 'lucide-react';

interface Insight {
  title: string;
  type: string;
  date: string;
  description: string;
}

interface InsightPreviewModalProps {
  insights: Insight[];
  isOpen: boolean;
  onClose: () => void;
  onSync: () => void;
  isSyncing: boolean;
}

export default function InsightPreviewModal({ insights, isOpen, onClose, onSync, isSyncing }: InsightPreviewModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1E1E1E] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh]">
        
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-headline font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="text-primary" size={24} />
              Extracted Insights
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">Review the actionable items found in your document</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {insights.length === 0 ? (
            <div className="text-center py-10 text-on-surface-variant">
              <ListTodo size={48} className="mx-auto opacity-20 mb-4" />
              <p>No actionable dates or tasks found in this document.</p>
            </div>
          ) : (
            insights.map((insight, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                  {insight.type === 'EXAM' ? <CheckCircle2 className="text-primary" size={18} /> :
                   insight.type === 'DEADLINE' ? <Calendar className="text-orange-400" size={18} /> :
                   <ListTodo className="text-blue-400" size={18} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-white">{insight.title}</h3>
                    <span className="text-xs px-2 py-1 rounded-md bg-white/10 text-white/70 font-medium">
                      {insight.date}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant mt-1">{insight.description}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-surface/30">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium text-white hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onSync}
            disabled={insights.length === 0 || isSyncing}
            className="px-4 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Sync to Timeline
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
