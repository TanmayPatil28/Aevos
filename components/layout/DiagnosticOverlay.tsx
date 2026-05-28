"use client";

import React, { useState, useEffect } from "react";
import { diagnostics, DiagnosticLog } from "@/lib/diagnostics";

export default function DiagnosticOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<DiagnosticLog[]>([]);
  const [clicks, setClicks] = useState(0);

  useEffect(() => {
    if (clicks >= 3) {
      setLogs(diagnostics.getLogs());
      setIsOpen(true);
      setClicks(0);
    }
  }, [clicks]);

  // Also support Ctrl+Shift+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setLogs(diagnostics.getLogs());
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Hidden Triple Click Trigger */}
      <div 
        className="fixed bottom-0 right-0 w-8 h-8 z-[9999] opacity-0 cursor-default"
        onClick={() => setClicks(c => c + 1)}
      />

      {isOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#131C31] border border-white/20 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <h2 className="text-white font-mono font-bold">Diagnostics Dump</h2>
              <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white">✕</button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-2">
              {logs.length === 0 && <div className="text-white/50 font-mono text-sm">No diagnostic logs found.</div>}
              {logs.map(log => (
                <div key={log.id} className={`p-3 rounded-lg border text-sm font-mono ${
                  log.level === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-200' :
                  log.level === 'warn' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-200' :
                  'bg-white/5 border-white/10 text-white/70'
                }`}>
                  <div className="flex justify-between opacity-50 text-xs mb-1">
                    <span>{new Date(log.timestamp).toISOString()}</span>
                    <span>[{log.source}]</span>
                  </div>
                  <div>{log.message}</div>
                  {log.context && <pre className="mt-2 text-xs opacity-70 overflow-x-auto">{log.context}</pre>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
