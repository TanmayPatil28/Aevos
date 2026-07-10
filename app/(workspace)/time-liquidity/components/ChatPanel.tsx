"use client";

import React, { RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, PanelLeftClose, Monitor, AlertTriangle, FileText, ShieldCheck, Search, Paperclip, Mic, Send, Zap } from "lucide-react";

const STRATEGY_INFO: Record<string, { description: string; threshold: string; danger?: boolean }> = {
  'Balanced': { description: 'Conservative planning, safely above 75%', threshold: '75%' },
  'Placement Prep': { description: 'Balances attendance with internship prep', threshold: '70%' },
  'Exam Sprint': { description: 'Focuses on maximizing study time, not skip time', threshold: '78%' },
  'Survival': { description: 'Emergency mode - skips everything skippable immediately', threshold: '60%', danger: true },
  'Burnout Recovery': { description: 'Maximize recovery time when exhausted', threshold: '60%', danger: true },
};

const AGENT_INFO: Record<string, { description: string; threshold: string }> = {
  'Tactical Negotiator': { description: 'Maximizes your free time within safe limits', threshold: '65%' },
  'Compliance Agent': { description: 'Strict enforcer — never approves unsafe absences', threshold: '80%' },
  'Deliverable Agent': { description: 'Checks your deadlines before any recommendation', threshold: '75%' },
  'Recovery Agent': { description: 'Aggressively restores attendance during crisis', threshold: '90%' },
};

const AVAILABLE_AGENTS = [
  { id: 'Tactical Negotiator', icon: Monitor, description: 'Optimizes schedule and handles constraints' },
  { id: 'Compliance Agent', icon: AlertTriangle, description: 'Monitors attendance rules and ruin risks' },
  { id: 'Deliverable Agent', icon: FileText, description: 'Tracks assignments and upcoming deadlines' },
  { id: 'Recovery Agent', icon: ShieldCheck, description: 'Aggressively restores attendance during crisis' }
];

interface Message {
  role: string;
  content: string;
  action?: string;
  isHint?: boolean;
  timestamp?: string;
  isOffline?: boolean;
}

interface ChatPanelProps {
  isChatOpen: boolean;
  setIsChatOpen: (val: boolean) => void;
  showAgentMenu: boolean;
  setShowAgentMenu: (val: boolean) => void;
  selectedAgent: string;
  setSelectedAgent: (val: string) => void;
  showStrategyMenu: boolean;
  setShowStrategyMenu: (val: boolean) => void;
  activeStrategy: string;
  setActiveStrategy: (val: string) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isProcessing: boolean;
  inputValue: string;
  setInputValue: (val: string) => void;
  handleSendMessage: (msg?: string, strategy?: string, isSilentAction?: boolean) => void;
  textareaRef: RefObject<HTMLTextAreaElement>;
  messagesEndRef: RefObject<HTMLDivElement>;
  metrics: { ruinProbability: number; timeCushion: number; strategicSkips: number; gradeDegradationRisk: string; };
  scheduleState: string;
  setScheduleState: (val: string) => void;
  setSkippedClassIds: (val: string[]) => void;
  handleRetry: () => void;
  setIsCmdKOpen: (val: boolean) => void;
  setShowGuide: (val: boolean) => void;
}

export function ChatPanel({
  isChatOpen,
  setIsChatOpen,
  showAgentMenu,
  setShowAgentMenu,
  selectedAgent,
  setSelectedAgent,
  showStrategyMenu,
  setShowStrategyMenu,
  activeStrategy,
  setActiveStrategy,
  messages,
  setMessages,
  isProcessing,
  inputValue,
  setInputValue,
  handleSendMessage,
  textareaRef,
  messagesEndRef,
  scheduleState,
  setScheduleState,
  setSkippedClassIds,
  handleRetry,
  setIsCmdKOpen,
  setShowGuide
}: ChatPanelProps) {
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`border-white/[0.05] flex flex-col aevos-glass overflow-hidden transition-all duration-300 shrink-0 z-50 ${isChatOpen ? 'absolute inset-0 w-full h-full md:relative md:w-[30%] md:min-w-[320px] md:max-w-[400px] border-r opacity-100 pointer-events-auto' : 'absolute md:relative w-0 border-r-0 opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto'}`}>
      <div className={`flex flex-col h-full w-full min-w-[320px] transition-opacity duration-300 ${isChatOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="relative z-50 h-12 px-4 flex items-center justify-between shrink-0">
          <div className="relative">
            <button
              onClick={() => { setShowAgentMenu(!showAgentMenu); setShowStrategyMenu(false); }}
              className="flex items-center gap-2 text-[10px] font-sans uppercase tracking-widest text-[var(--aevos-text-secondary)] hover:text-[var(--aevos-text-primary)] transition-colors group"
            >
              {(() => {
                const AgentIcon = AVAILABLE_AGENTS.find(a => a.id === selectedAgent)?.icon || Monitor;
                return <AgentIcon className="w-3.5 h-3.5" />;
              })()}
              <span>{selectedAgent}</span>
              <ChevronDown className="w-3 h-3 opacity-40 group-hover:opacity-70 transition-opacity" />
            </button>
            <AnimatePresence>
              {showAgentMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute top-full left-0 mt-2 w-64 aevos-glass-overlay rounded-2xl shadow-2xl overflow-hidden z-[100]"
                >
                  <div className="p-1">
                    {AVAILABLE_AGENTS.map(agent => {
                      const AgentIcon = agent.icon;
                      const info = AGENT_INFO[agent.id];
                      return (
                        <button
                          key={agent.id}
                          onClick={() => { setSelectedAgent(agent.id); setShowAgentMenu(false); }}
                          className="w-full text-left px-3 py-2.5 rounded-[12px] hover:bg-[var(--aevos-surface-raised)] transition-colors group"
                        >
                          <div className="flex items-start gap-2.5">
                            <AgentIcon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${selectedAgent === agent.id ? 'text-[var(--aevos-primary)]' : 'text-[var(--aevos-text-tertiary)] group-hover:text-[var(--aevos-text-secondary)]'}`} />
                            <div className="flex flex-col gap-0.5">
                              <span className={`text-[11px] font-semibold font-sans ${selectedAgent === agent.id ? 'text-[var(--aevos-primary)]' : 'text-[var(--aevos-text-secondary)] group-hover:text-[var(--aevos-text-primary)]'}`}>
                                {agent.id}
                              </span>
                              <span className="text-[9px] text-[var(--aevos-text-tertiary)] font-sans">{info?.description}</span>
                              <span className={`text-[9px] font-sans ${agent.id === 'Compliance Agent' ? 'text-[var(--aevos-status-info)]/80' :
                                  agent.id === 'Deliverable Agent' ? 'text-[var(--aevos-tertiary)]' : 'text-[var(--aevos-status-warning)]/80'
                                }`}>
                                Target: {info?.threshold} attendance
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="px-3 py-2 border-t border-white/[0.05] bg-black/20">
                    <p className="text-[9px] text-[var(--aevos-text-tertiary)] font-sans">Switching agents changes how the AI reasons. Your conversation history is preserved.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative h-12 flex items-center select-none">
              <button
                onClick={() => { setShowStrategyMenu(!showStrategyMenu); setShowAgentMenu(false); }}
                className="flex items-center gap-2 text-[10px] font-sans uppercase tracking-widest text-[var(--aevos-text-secondary)] hover:text-[var(--aevos-text-primary)] transition-colors group"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--aevos-primary)] shrink-0"></div>
                <span>{activeStrategy}</span>
                <ChevronDown className="w-3 h-3 opacity-40 group-hover:opacity-70 transition-opacity" />
              </button>
            
              <AnimatePresence>
                {showStrategyMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full right-0 mt-1.5 w-48 aevos-glass-overlay rounded-2xl shadow-2xl overflow-hidden z-[100]"
                  >
                    <div className="p-1">
                      {['Balanced', 'Placement Prep', 'Exam Sprint', 'Survival', 'Burnout Recovery'].map(strategy => (
                        <button
                          key={strategy}
                          onClick={() => {
                            if (activeStrategy !== strategy) {
                              setMessages(prev => [...prev, { role: 'system', content: `Strategy mode changed to ${strategy}. Ask a new question to see updated recommendations.`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
                            }
                            setActiveStrategy(strategy);
                            setShowStrategyMenu(false);
                            if (strategy === "Balanced") {
                              setSkippedClassIds([]);
                            }
                          }}
                          className="w-full text-left px-3 py-2.5 text-xs font-medium font-sans hover:bg-[var(--aevos-surface-raised)] rounded-[12px] transition-colors flex items-center justify-between group"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className={activeStrategy === strategy ? 'text-[var(--aevos-primary)]' : 'text-[var(--aevos-text-secondary)] group-hover:text-[var(--aevos-text-primary)]'}>
                              {strategy}
                            </span>
                            <span className={`text-[9px] font-sans ${STRATEGY_INFO[strategy]?.danger ? 'text-[var(--aevos-status-critical)]/80' : 'text-[var(--aevos-text-tertiary)]'}`}>
                              {STRATEGY_INFO[strategy]?.description} · {STRATEGY_INFO[strategy]?.threshold}
                            </span>
                          </div>
                          {activeStrategy === strategy && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--aevos-primary)] shrink-0"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-[var(--aevos-text-tertiary)] hover:text-[var(--aevos-text-primary)] transition-colors flex items-center shrink-0"
              title="Close sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat History */}
        <div data-lenis-prevent="true" className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 relative">
          
          {messages.map((msg, idx) =>
            msg.isHint ? (
              <div key={idx} className="mx-1 px-3 py-2 rounded-[16px] bg-[var(--aevos-status-info)]/10 text-[10px] text-[var(--aevos-status-info)]/80 flex items-center gap-2">
                <span className="text-[var(--aevos-status-info)] shrink-0 text-xs">ℹ</span>
                <span className="font-sans">{msg.content}</span>
              </div>
            ) : (
              <div key={idx} className={`flex flex-col w-full ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <span className={`text-[9px] font-sans mb-1 uppercase tracking-wider ${msg.role === 'user' ? 'text-[var(--aevos-text-tertiary)] mr-1' : msg.role === 'compliance' ? 'text-[var(--aevos-status-info)] ml-1' : msg.role === 'deliverable' ? 'text-[var(--aevos-tertiary)] ml-1' : msg.role === 'recovery' ? 'text-[var(--aevos-status-warning)] ml-1' : 'text-[var(--aevos-text-tertiary)] ml-1'}`}>
                  {msg.role === 'user' ? (msg.timestamp || 'Just now') : msg.role === 'compliance' ? 'Compliance Agent' : msg.role === 'deliverable' ? 'Deliverable Agent' : msg.role === 'recovery' ? 'Recovery Agent' : 'Jarvis'}
                </span>

                <div className={`text-sm px-4 py-3 max-w-[95%] leading-relaxed font-sans ${msg.role === 'user'
                    ? 'bg-[var(--aevos-surface-overlay)] text-[var(--aevos-text-primary)] rounded-[20px] rounded-tr-[4px]'
                    : msg.role === 'compliance'
                      ? 'bg-[var(--aevos-surface)] text-[var(--aevos-text-secondary)] rounded-[20px] rounded-tl-[4px] shadow-[0_0_15px_rgba(145,180,223,0.05)]'
                      : msg.role === 'deliverable'
                        ? 'bg-[var(--aevos-surface)] text-[var(--aevos-text-secondary)] rounded-[20px] rounded-tl-[4px] shadow-[0_0_15px_rgba(214,213,212,0.05)]'
                        : 'bg-[var(--aevos-surface)] text-[var(--aevos-text-secondary)] rounded-[20px] rounded-tl-[4px]'
                  }`}>
                  {msg.content.split('\n').map((line, i) => {
                    const hasSpecialTerms = /(risk exposure|portfolio balance|time allocation credits?)/i.test(line);
                    return (
                      <p key={i} className={i > 0 ? "mt-3" : ""}>
                        {hasSpecialTerms ? (
                          <span dangerouslySetInnerHTML={{
                            __html: line
                              .replace(/(Risk Exposure(?:\s+(?:to|at|is|of))?\s*\**\d*%?\**)/gi, (match) => `<span class="bg-[var(--aevos-primary)]/10 text-[var(--aevos-primary)] px-1.5 py-0.5 rounded-[4px] text-xs font-sans" title="How close you are to the minimum attendance threshold">${match}</span>`)
                              .replace(/\b(Portfolio Balance)\b/gi, (match) => `<span class="bg-[var(--aevos-status-info)]/10 text-[var(--aevos-status-info)] px-1.5 py-0.5 rounded-[4px] text-xs font-sans" title="Your overall attendance standing across all courses">${match}</span>`)
                              .replace(/\b(Time Allocation [Cc]redits?)\b/gi, (match) => `<span class="bg-[var(--aevos-tertiary)]/10 text-[var(--aevos-tertiary)] px-1.5 py-0.5 rounded-[4px] text-xs font-sans" title="Your remaining safe absences">${match}</span>`)
                          }} />
                        ) : (
                          line
                        )}
                      </p>
                    );
                  })}

                  {msg.action === 'accept_reject' && scheduleState === 'initial' && (
                    <div className="mt-4 flex flex-col gap-3">
                      <p className="text-[10px] text-[var(--aevos-text-tertiary)] leading-normal border-b border-white/[0.03] pb-2 font-sans">
                        This is a simulation. Accepting highlights recommended skips on your timetable but does not modify your official attendance records.
                      </p>
                      <div className="flex gap-2.5">
                        <button
                          onClick={() => setScheduleState('accepted')}
                          className="bg-[var(--aevos-primary)] hover:bg-[var(--aevos-primary-fixed-dim)] text-[var(--aevos-on-primary)] text-[13px] font-semibold font-sans px-8 py-2.5 rounded-full transition-colors"
                        >
                          Preview Plan
                        </button>
                        <button
                          onClick={() => {
                            setScheduleState('rejected');
                            setSkippedClassIds([]);
                          }}
                          className="bg-transparent hover:bg-white/5 text-[var(--aevos-status-critical)] text-[13px] font-semibold font-sans px-8 py-2.5 rounded-full transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                  {msg.action === 'accept_reject' && scheduleState === 'accepted' && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="mt-4 text-xs text-[var(--aevos-primary)] font-medium font-sans flex items-center gap-1"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--aevos-primary)] animate-pulse"></div>
                      Schedule Applied Successfully
                    </motion.div>
                  )}
                  {msg.action === 'retry' && (
                    <button
                      onClick={handleRetry}
                      className="mt-3 bg-[var(--aevos-surface-overlay)] hover:bg-[var(--aevos-surface-raised)] text-[var(--aevos-text-secondary)] hover:text-[var(--aevos-text-primary)] text-xs font-semibold font-sans px-4 py-2 rounded-full transition-colors shadow-sm"
                    >
                      Retry Network Request
                    </button>
                  )}
                  {msg.isOffline && msg.content.includes("What can I do offline") && msg.content.includes("Tap") && (
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => handleSendMessage("What can I do offline?", undefined, true)}
                        className="bg-[var(--aevos-primary)] hover:bg-[var(--aevos-primary-fixed-dim)] text-[var(--aevos-on-primary)] text-[13px] font-semibold font-sans px-8 py-2.5 rounded-full transition-colors w-fit"
                      >
                        What can I do offline?
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          )}
          {isProcessing && (
            <div className="flex items-start">
              <span className="text-[9px] font-sans mb-1 text-[var(--aevos-text-secondary)] font-semibold uppercase ml-1">Jarvis</span>
              <div className="text-sm px-4 py-3 bg-[var(--aevos-surface)] text-[var(--aevos-text-secondary)] rounded-[20px] rounded-tl-[4px] ml-0 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[var(--aevos-text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-1.5 h-1.5 bg-[var(--aevos-text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-1.5 h-1.5 bg-[var(--aevos-text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-4 pb-24 md:pb-4 pt-2 bg-gradient-to-t from-[var(--aevos-surface)]/95 to-transparent shrink-0">
          <div className="relative">
            {messages.length === 1 && (
              <div className="flex gap-2 overflow-x-auto mb-3 scrollbar-hide">
                <button
                  onClick={() => handleSendMessage("Plan a study block for upcoming exams")}
                  className="shrink-0 bg-[var(--aevos-surface-overlay)] hover:bg-[var(--aevos-surface-raised)] text-[var(--aevos-text-secondary)] text-[11px] font-sans px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
                >
                  Plan exam study block
                </button>
                <button
                  onClick={() => handleSendMessage("Can I safely skip classes this Friday?")}
                  className="shrink-0 bg-[var(--aevos-surface-overlay)] hover:bg-[var(--aevos-surface-raised)] text-[var(--aevos-text-secondary)] text-[11px] font-sans px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
                >
                  Skip this Friday?
                </button>
              </div>
            )}

            <div className="relative bg-[var(--aevos-surface-overlay)] focus-within:bg-[var(--aevos-surface-raised)] border border-white/[0.04] focus-within:border-white/[0.08] rounded-[24px] transition-all shadow-sm">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask the Negotiator... (Press / or ⌘K)"
                className="block w-full bg-transparent text-[13px] text-[var(--aevos-text-primary)] placeholder-[var(--aevos-text-tertiary)] resize-none focus:outline-none min-h-[48px] max-h-32 font-sans py-[14px] pl-5 pr-[120px] leading-[20px] rounded-[24px]"
                rows={1}
              />

              <div className="absolute right-2 bottom-2 flex items-center gap-2">
                <button
                  onClick={() => setShowGuide(true)}
                  className="text-[10px] text-[var(--aevos-primary)] hover:text-[var(--aevos-primary-fixed-dim)] transition-colors font-sans font-medium leading-none mt-[1px]"
                >
                  How it works
                </button>
                <button
                  disabled={!inputValue.trim() || isProcessing}
                  onClick={() => handleSendMessage()}
                  className={`p-1.5 rounded-full transition-all duration-200 flex items-center justify-center h-8 w-8 ${inputValue.trim() && !isProcessing
                      ? 'bg-white text-black hover:bg-white/90 scale-100'
                      : 'bg-white/5 text-white/20 cursor-not-allowed scale-95'
                    }`}
                >
                  <Send className="w-3.5 h-3.5 ml-0.5" strokeWidth={2.5} />
                </button>
              </div>
            </div>
            
            <div className="text-center mt-2">
              <span className="text-[9px] text-[var(--aevos-text-tertiary)] font-sans">
                Agents may recommend aggressive scenarios. Verify with college rules.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
