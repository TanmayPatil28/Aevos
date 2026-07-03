"use client";

import React from "react";
import { Command } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  cmdKInput: string;
  setCmdKInput: (val: string) => void;
  filteredCommands: any[];
  cmdKSelectedIndex: number;
  setCmdKSelectedIndex: (idx: number) => void;
  executeCommand: (id: string) => void;
  metrics: { ruinProbability: number };
}

export function CommandPalette({
  isOpen,
  onClose,
  cmdKInput,
  setCmdKInput,
  filteredCommands,
  cmdKSelectedIndex,
  setCmdKSelectedIndex,
  executeCommand,
  metrics
}: CommandPaletteProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 backdrop-blur-md pt-[10vh] px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="w-full max-w-lg aevos-glass-overlay rounded-[24px] shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--aevos-outline)]/20 bg-black/20">
              <Command className="w-4 h-4 text-[var(--aevos-text-secondary)]" />
              <input
                type="text"
                placeholder="Type a command to search..."
                value={cmdKInput}
                onChange={(e) => setCmdKInput(e.target.value)}
                className="flex-1 bg-transparent text-sm text-[var(--aevos-text-primary)] placeholder-[var(--aevos-text-tertiary)] focus:outline-none font-sans"
                autoFocus
              />
              <span className="text-[10px] bg-[var(--aevos-surface)] border border-[var(--aevos-outline)]/20 text-[var(--aevos-text-secondary)] px-1.5 py-0.5 rounded font-sans uppercase tracking-wider">
                ESC
              </span>
            </div>

            {/* Commands List */}
            <div className="max-h-[320px] overflow-y-auto p-2 flex flex-col gap-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              {filteredCommands.length === 0 ? (
                <div className="text-center py-8 text-[var(--aevos-text-tertiary)] text-xs font-sans uppercase tracking-wider">
                  No matching commands
                </div>
              ) : (
                filteredCommands.map((cmd, idx) => {
                  const isSelected = idx === cmdKSelectedIndex;
                  const isHighRisk = metrics.ruinProbability > 20;
                  const isAggressiveAndDisabled = isHighRisk && cmd.requiresSafeSkips;
                  
                  return (
                    <button
                      key={cmd.id}
                      disabled={isAggressiveAndDisabled}
                      onClick={() => !isAggressiveAndDisabled && executeCommand(cmd.id)}
                      onMouseEnter={() => !isAggressiveAndDisabled && setCmdKSelectedIndex(idx)}
                      className={`w-full text-left px-3 py-2.5 rounded-[12px] transition-colors flex items-center justify-between group ${
                        isAggressiveAndDisabled
                          ? 'opacity-40 cursor-not-allowed text-[var(--aevos-text-tertiary)]'
                          : isSelected
                            ? 'bg-[var(--aevos-primary)] text-[var(--aevos-on-primary)]'
                            : 'hover:bg-[var(--aevos-surface)] text-[var(--aevos-text-secondary)] hover:text-[var(--aevos-text-primary)]'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-medium font-sans">
                          {cmd.label}
                        </span>
                        <span className={`text-[9px] mt-0.5 font-sans ${
                            isAggressiveAndDisabled
                            ? 'text-[var(--aevos-text-tertiary)]'
                            : isSelected
                              ? 'text-[var(--aevos-on-primary)]/70'
                              : 'text-[var(--aevos-text-tertiary)]'
                          }`}>
                          {cmd.category} {isAggressiveAndDisabled && '(Disabled - Risk too high)'}
                        </span>
                      </div>
                      {isSelected && !isAggressiveAndDisabled && (
                        <span className="text-[10px] bg-black/10 text-[var(--aevos-on-primary)] px-1.5 py-0.5 rounded font-sans uppercase tracking-wider">
                          ENTER
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
