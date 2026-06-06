"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useDragControls, useMotionValue, useSpring, useTransform } from "framer-motion";
import { TerminalSquare, X, Maximize2, Minimize2, Minus, ChevronRight, GripHorizontal } from "lucide-react";
import { cn } from "@/lib/cn";
import { useUSMStore } from "@/stores/usmStore";
import { useRouter } from "next/navigation";
import {
  findCommand,
  getCompletions,
  generateNeofetch,
  COMMANDS,
  type TerminalContext,
} from "./terminal/commandRegistry";
import { TERMINAL_THEMES, type ThemeName } from "./terminal/themes";
import ReactMarkdown from "react-markdown";
import { VirtualFileSystem } from "./terminal/vfs";

// ─── Types ──────────────────────────────────────────────────────────────────

interface TerminalLine {
  id: string;
  type: "command" | "output" | "error" | "success" | "system" | "markdown" | "jsx";
  text?: string;
  node?: React.ReactNode;
  isStreaming?: boolean;
}

const CodeBlock = ({ children, className }: any) => {
  const [copied, setCopied] = useState(false);
  const codeString = String(children).trim();
  
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="relative group my-4">
      <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button 
          onClick={handleCopy}
          className="bg-white/10 hover:bg-white/20 text-xs text-white px-2 py-1 rounded backdrop-blur border border-white/10 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="bg-[#1e1e2e] border border-white/10 rounded-xl p-4 overflow-x-auto shadow-inner text-[13px] font-mono text-[#cdd6f4]">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function GlobalTerminal() {
  // ── Core State ──
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [history, setHistory] = useState<TerminalLine[]>([]);

  // ── V2 State ──
  const [aliases, setAliases] = useState<Record<string, string>>({});
  const [currentTheme, setCurrentTheme] = useState<ThemeName>("default");
  const [ghostText, setGhostText] = useState("");
  const [isReverseSearch, setIsReverseSearch] = useState(false);
  const [reverseSearchQuery, setReverseSearchQuery] = useState("");
  const [reverseSearchResult, setReverseSearchResult] = useState("");
  
  // ── V3 State ──
  const [cwd, setCwd] = useState("/");
  const [jobs, setJobs] = useState<Record<string, { status: "running" | "done" | "error", cmd: string }>>({});
  const vfsRef = useRef<VirtualFileSystem | null>(null);
  useEffect(() => {
    vfsRef.current = new VirtualFileSystem();
  }, []);

  const hasShownNeofetch = useRef(false);
  const sessionStartTime = useRef(Date.now());

  // ── Refs ──
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const constraintsRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);

  // ── Magnetic Physics ──
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const magneticX = useSpring(mouseX, springConfig);
  const magneticY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pillRef.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = pillRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    mouseX.set((clientX - centerX) * 0.3); // Magnetic pull strength
    mouseY.set((clientY - centerY) * 0.3);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // ── External Hooks ──
  const usmState = useUSMStore((state) => state);
  const router = useRouter();

  // ── Theme ──
  const theme = TERMINAL_THEMES[currentTheme];
  const isSandbox = usmState.workspaceUi.mode === "SANDBOX";

  // ─── Line Helpers ─────────────────────────────────────────────────────────

  const addLine = useCallback(
    (type: TerminalLine["type"], text: string, node?: React.ReactNode) => {
      setHistory((prev) => [
        ...prev,
        { id: Math.random().toString(36).substr(2, 9), type, text, node },
      ]);
    },
    []
  );

  const addLineAnimated = useCallback(
    (type: TerminalLine["type"], text: string, delay = 15) => {
      // For simplicity, animated lines add instantly but with a staggered timeout
      const lineId = Math.random().toString(36).substr(2, 9);
      setHistory((prev) => [...prev, { id: lineId, type, text: "" }]);

      let i = 0;
      const interval = setInterval(() => {
        i++;
        if (i > text.length) {
          clearInterval(interval);
          return;
        }
        setHistory((prev) =>
          prev.map((l) =>
            l.id === lineId ? { ...l, text: text.slice(0, i) } : l
          )
        );
      }, delay);
    },
    []
  );

  // ─── Terminal Context ─────────────────────────────────────────────────────

  const ctx: TerminalContext = useMemo(
    () => ({
      usmState,
      router,
      addLine,
      addLineAnimated,
      setHistory,
      aliases,
      setAliases,
      currentTheme,
      setCurrentTheme,
      sessionStartTime: sessionStartTime.current,
      commandHistory,
      cwd,
      setCwd,
      vfs: vfsRef.current,
      jobs,
      setJobs
    }),
    [usmState, router, addLine, addLineAnimated, aliases, currentTheme, commandHistory, cwd, jobs]
  );

  // ─── Effects ──────────────────────────────────────────────────────────────

  // Focus input when terminal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "`" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setHistory([]);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Show neofetch on first open
  useEffect(() => {
    if (isOpen && !hasShownNeofetch.current) {
      hasShownNeofetch.current = true;
      const bootLines: TerminalLine[] = [
        { id: "boot-1", type: "system", text: "GradeFlow Neural OS [Version 0.1.0]" },
        { id: "boot-2", type: "system", text: "Copyright (c) 2026 GradeFlow Corporation. All rights reserved." },
        { id: "boot-3", type: "system", text: "" },
      ];
      const neofetchLines = generateNeofetch(ctx).map((text, i) => ({
        id: `nf-${i}`,
        type: "system" as const,
        text,
      }));
      setHistory([
        ...bootLines,
        ...neofetchLines,
        { id: "boot-tip", type: "output", text: "Type 'help' for commands. Ctrl+` to toggle. Tab to autocomplete." },
      ]);
    }
  }, [isOpen, ctx]);

  // Ghost text auto-suggest
  useEffect(() => {
    if (!input || isReverseSearch) {
      setGhostText("");
      return;
    }
    const completions = getCompletions();
    // Also add aliases
    const allCompletions = [
      ...completions,
      ...Object.keys(aliases),
    ];
    const match = allCompletions.find((c) =>
      c.toLowerCase().startsWith(input.toLowerCase()) && c.toLowerCase() !== input.toLowerCase()
    );
    setGhostText(match ? match.slice(input.length) : "");
  }, [input, aliases, isReverseSearch]);

  // ─── Command Execution ────────────────────────────────────────────────────

  const handleCommand = useCallback(
    (cmd: string) => {
      const trimmed = cmd.trim();
      if (!trimmed) return;

      addLine("command", trimmed);
      setCommandHistory((prev) => [trimmed, ...prev]);
      setHistoryIndex(-1);
      setInput("");
      setGhostText("");

      // Check aliases first
      const parts = trimmed.split(" ");
      const primary = parts[0].toLowerCase();
      let resolvedCmd = trimmed;
      if (aliases[primary]) {
        resolvedCmd = aliases[primary] + (parts.length > 1 ? " " + parts.slice(1).join(" ") : "");
      }

      const resolvedParts = resolvedCmd.split(" ");
      const resolvedPrimary = resolvedParts[0].toLowerCase();

      // Handle export session specially (needs clipboard access)
      if (resolvedPrimary === "export" && resolvedParts[1] === "session") {
        addLine("output", "Exporting session to clipboard...");
        const sessionText = history
          .map((l) => {
            const prefix = l.type === "command" ? `${theme.promptSymbol} ` : "  ";
            return prefix + l.text;
          })
          .join("\n");
        navigator.clipboard.writeText(sessionText).then(() => {
          addLine("success", "[OK] Session copied to clipboard.");
        }).catch(() => {
          addLine("error", "[ERROR] Clipboard access denied.");
        });
        return;
      }

      const isBackground = resolvedCmd.trim().endsWith("&");
      if (isBackground) {
        resolvedCmd = resolvedCmd.replace(/&\s*$/, "").trim();
        resolvedParts.pop(); // remove '&' if it was separated by space, or we just rely on passing the cleaned command down if we re-split
      }
      
      const cleanParts = resolvedCmd.split(" ");
      const cleanPrimary = cleanParts[0].toLowerCase();

      // Find and execute command
      setTimeout(() => {
        const command = findCommand(cleanPrimary);
        if (command) {
          if (isBackground) {
             const jobId = Math.random().toString(36).substr(2, 9);
             setJobs((prev) => ({ ...prev, [jobId]: { status: "running", cmd: resolvedCmd } }));
             addLine("success", `[Job ${jobId}] started in background: ${resolvedCmd}`);
             // We pass a background flag or let the handler run async
             Promise.resolve(command.handler(cleanParts, ctx)).then(() => {
                setJobs((prev) => ({ ...prev, [jobId]: { status: "done", cmd: resolvedCmd } }));
                addLine("success", `[Job ${jobId}] finished: ${resolvedCmd}`);
             }).catch((err) => {
                setJobs((prev) => ({ ...prev, [jobId]: { status: "error", cmd: resolvedCmd } }));
                addLine("error", `[Job ${jobId}] failed: ${err.message}`);
             });
          } else {
             command.handler(cleanParts, ctx);
          }
        } else {
          addLine("error", `Command not found: ${cleanPrimary}. Type 'help' for a list of commands.`);
        }
      }, 80);
    },
    [addLine, aliases, ctx, history, theme.promptSymbol]
  );

  // Listen for custom command execution events from AI
  useEffect(() => {
    const onRunCmd = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        handleCommand(customEvent.detail);
      }
    };
    window.addEventListener("gradeflow-run-cmd", onRunCmd);
    return () => window.removeEventListener("gradeflow-run-cmd", onRunCmd);
  }, [handleCommand]);

  // Cyber typing SFX
  useEffect(() => {
    let audioCtx: AudioContext | null = null;
    const playTick = () => {
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600 + Math.random() * 200, audioCtx.currentTime);
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.015, audioCtx.currentTime + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.03);
      } catch(e) {}
    };

    window.addEventListener("gradeflow-typing-sfx", playTick);
    return () => window.removeEventListener("gradeflow-typing-sfx", playTick);
  }, []);

  // ─── Key Handling ─────────────────────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Reverse search mode
      if (isReverseSearch) {
        if (e.key === "Escape") {
          setIsReverseSearch(false);
          setReverseSearchQuery("");
          setReverseSearchResult("");
          setInput("");
        } else if (e.key === "Enter") {
          setIsReverseSearch(false);
          setInput(reverseSearchResult);
          setReverseSearchQuery("");
          if (reverseSearchResult) {
            handleCommand(reverseSearchResult);
          }
        }
        return;
      }

      if (e.key === "Enter") {
        handleCommand(input);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
          const nextIndex = historyIndex + 1;
          setHistoryIndex(nextIndex);
          setInput(commandHistory[nextIndex]);
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIndex > 0) {
          const prevIndex = historyIndex - 1;
          setHistoryIndex(prevIndex);
          setInput(commandHistory[prevIndex]);
        } else if (historyIndex === 0) {
          setHistoryIndex(-1);
          setInput("");
        }
      } else if (e.key === "Tab") {
        e.preventDefault();
        if (ghostText) {
          setInput(input + ghostText);
          setGhostText("");
        }
      } else if (e.key === "ArrowRight" && ghostText) {
        e.preventDefault();
        setInput(input + ghostText);
        setGhostText("");
      } else if (e.key === "r" && e.ctrlKey) {
        e.preventDefault();
        setIsReverseSearch(true);
        setReverseSearchQuery("");
        setReverseSearchResult("");
      }
    },
    [input, ghostText, commandHistory, historyIndex, handleCommand, isReverseSearch, reverseSearchResult]
  );

  // Reverse search input handler
  const handleReverseSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setReverseSearchQuery(query);
      if (query) {
        const match = commandHistory.find((c) =>
          c.toLowerCase().includes(query.toLowerCase())
        );
        setReverseSearchResult(match || "");
      } else {
        setReverseSearchResult("");
      }
    },
    [commandHistory]
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  const activeBorder = isSandbox ? theme.sandboxBorder : theme.border;
  const activeHeaderBg = isSandbox ? theme.sandboxBg : theme.bgHeader;
  const activeTitleColor = isSandbox ? theme.sandboxText : theme.textMuted;

  const isAnyStreaming = history.some((l) => l.isStreaming);

  return (
    <>
      {/* Drag Constraints Container */}
      <div ref={constraintsRef} className="fixed inset-0 z-[99] pointer-events-none" />

      {/* Cinematic Blur Backdrop & Ambient Glow */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[2147483600] bg-black/40 pointer-events-none flex items-center justify-center overflow-hidden"
          >
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 z-[2147483647] font-mono pointer-events-none">
        <AnimatePresence>
          {!isOpen ? (
            <motion.div
              key="terminal-pill"
              ref={pillRef}
              layoutId="terminal-container"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed bottom-6 right-6 pointer-events-auto"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ x: magneticX, y: magneticY }}
            >
              <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full transition-all shadow-2xl relative overflow-hidden group"
                style={{
                  background: theme.bg,
                  border: `1px solid ${theme.border}`,
                  color: theme.textMuted,
                }}
              >
                {/* Magnetic Hover Aura */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <TerminalSquare size={16} style={{ color: theme.success }} />
                <span className="text-xs">Terminal</span>
                <span className="text-[10px] opacity-50 ml-1">Ctrl+`</span>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="terminal-drag-wrapper"
              drag
              dragControls={dragControls}
              dragMomentum={false}
              dragConstraints={constraintsRef}
              dragListener={false}
              className="fixed bottom-4 left-1/2 pointer-events-auto"
              animate={{
                marginLeft: isMaximized ? "0px" : "-450px",
                left: isMaximized ? "0%" : "50%",
                width: isMaximized ? "100vw" : "min(900px, 90vw)",
                height: isMaximized ? "70vh" : "380px",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <motion.div
                layoutId="terminal-container"
                className="w-full h-full rounded-xl overflow-hidden flex flex-col relative"
                style={{
                  background: theme.bg,
                  border: `1px solid ${activeBorder}`,
                  boxShadow: `0 25px 60px ${theme.shadow}, 0 0 30px ${isSandbox ? "rgba(255,69,58,0.12)" : "rgba(0,0,0,0.3)"}`,
                  backdropFilter: "blur(24px)",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                {/* ── Title Bar (Drag Handle) ── */}
                <div
                  onPointerDown={(e) => dragControls.start(e)}
                  className="h-10 flex items-center justify-between px-4 select-none cursor-grab active:cursor-grabbing transition-colors duration-300"
                  style={{
                    background: activeHeaderBg,
                    borderBottom: `1px solid ${activeBorder}`,
                  }}
                >
                  {/* Traffic Lights */}
                  <div className="flex gap-2" onPointerDown={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-3 h-3 rounded-full bg-[#ff453a] hover:opacity-80 flex items-center justify-center group"
                    >
                      <X size={8} className="opacity-0 group-hover:opacity-100 text-black" />
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-3 h-3 rounded-full bg-[#ffd60a] hover:opacity-80 flex items-center justify-center group"
                    >
                      <Minus size={8} className="opacity-0 group-hover:opacity-100 text-black" />
                    </button>
                    <button
                      onClick={() => setIsMaximized(!isMaximized)}
                      className="w-3 h-3 rounded-full bg-[#32d74b] hover:opacity-80 flex items-center justify-center group"
                    >
                      {isMaximized ? (
                        <Minimize2 size={8} className="opacity-0 group-hover:opacity-100 text-black" />
                      ) : (
                        <Maximize2 size={8} className="opacity-0 group-hover:opacity-100 text-black" />
                      )}
                    </button>
                  </div>

                {/* Title */}
                <div
                  className="text-[11px] font-bold tracking-widest flex gap-2 items-center"
                  style={{ color: activeTitleColor }}
                >
                  <TerminalSquare size={12} />
                  GRADEFLOW // {isSandbox ? "SANDBOX OVERRIDE" : TERMINAL_THEMES[currentTheme].label.toUpperCase()}
                  <GripHorizontal size={12} className="ml-2 opacity-30" />
                </div>

                {/* Spacer */}
                <div className="w-[52px]" />
              </div>

              {/* ── Scrollable History ── */}
              <div
                className="flex-1 overflow-y-auto p-4 flex flex-col gap-0.5 text-[13px] leading-relaxed custom-scrollbar"
                onClick={() => {
                  if (window.getSelection()?.toString()) return;
                  inputRef.current?.focus();
                }}
              >
                {history.map((line) => {
                  const isDimmed = isAnyStreaming && !line.isStreaming;
                  return (
                  <div 
                    key={line.id} 
                    className={cn(
                      "flex items-start min-h-[20px] transition-all duration-700 shrink-0",
                      isDimmed ? "opacity-30 blur-[2px]" : "opacity-100 blur-0"
                    )}
                  >
                    {line.type === "command" && (
                      <span className="mr-2 shrink-0 font-bold" style={{ color: theme.prompt }}>
                        {theme.promptSymbol}
                      </span>
                    )}
                    {line.type === "jsx" ? (
                      line.node
                    ) : line.type === "markdown" ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="w-full flex my-2"
                      >
                        {/* Clean Chat Bubble */}
                        <div 
                          className={cn(
                            "prose prose-invert max-w-none text-[15px] leading-relaxed transition-all duration-300 flex-1 relative overflow-hidden",
                            line.isStreaming ? "opacity-100" : "opacity-90"
                          )}
                          style={{
                            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                          }}
                        >
                          <div className={cn("relative z-10", line.isStreaming && "streaming-cursor")}>
                            {line.isStreaming && (
                              <style>{`
                                .streaming-cursor > *:last-child::after {
                                  content: " . . .";
                                  animation: pulse-ellipsis 1.5s infinite;
                                }
                                @keyframes pulse-ellipsis {
                                  0%, 100% { opacity: 0.3; }
                                  50% { opacity: 1; }
                                }
                              `}</style>
                            )}
                          <ReactMarkdown
                            components={{
                              code({ node, inline, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || "");
                                const isCmd = match && match[1] === "gradeflow-cmd";
                                
                                  if (!inline && isCmd) {
                                    const cmdStr = String(children).trim();
                                    return (
                                      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 my-4 border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.2)] group relative overflow-hidden">
                                        <div className="flex items-center justify-between mb-4">
                                          <div className="text-[11px] text-emerald-400 font-mono tracking-widest flex items-center gap-2 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]">
                                            <TerminalSquare size={12} />
                                            SUGGESTED ACTION
                                          </div>
                                        </div>
                                        <code className="text-[14px] font-mono text-white block mb-5">{cmdStr}</code>
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            window.dispatchEvent(new CustomEvent('gradeflow-run-cmd', { detail: cmdStr }));
                                          }} 
                                          className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl text-[13px] font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] relative overflow-hidden z-20 pointer-events-auto"
                                        >
                                          Execute Command
                                        </button>
                                      </div>
                                    );
                                  }
                                
                                return inline ? (
                                  <code className="bg-white/10 rounded px-1.5 py-0.5 text-[#e06c75] font-mono text-[13px]" {...props}>
                                    {children}
                                  </code>
                                ) : (
                                  <CodeBlock className={className} {...props}>
                                    {children}
                                  </CodeBlock>
                                );
                              },
                              p({ children }) {
                                return <p className="mb-3 last:mb-0 text-gray-100">{children}</p>;
                              },
                              ul({ children }) {
                                return <ul className="list-disc pl-4 mb-3 space-y-1">{children}</ul>;
                              },
                              ol({ children }) {
                                return <ol className="list-decimal pl-4 mb-3 space-y-1">{children}</ol>;
                              },
                              li({ children }) {
                                return <li className="text-gray-200">{children}</li>;
                              },
                              strong({ children }) {
                                return <strong className="font-semibold text-white">{children}</strong>;
                              },
                              blockquote({ children }) {
                                return <blockquote className="border-l-2 border-white/20 pl-4 italic text-gray-400 my-3">{children}</blockquote>;
                              }
                            }}
                          >
                            {line.text || ""}
                          </ReactMarkdown>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <span
                        className="break-all whitespace-pre-wrap"
                        style={{
                          color:
                            line.type === "command"
                              ? theme.command
                              : line.type === "error"
                              ? theme.error
                              : line.type === "success"
                              ? theme.success
                              : line.type === "system"
                              ? theme.system
                              : theme.info,
                          fontWeight: line.type === "command" ? 700 : 400,
                        }}
                      >
                        {line.text}
                      </span>
                    )}
                  </div>
                );
                })}
                <div ref={bottomRef} className="h-2" />
              </div>

              {/* ── Input Line ── */}
              <div
                className="flex items-center px-4 pb-3 pt-2"
                style={{ background: theme.bg }}
              >
                {isReverseSearch ? (
                  <>
                    <span className="mr-2 text-[13px]" style={{ color: theme.error }}>
                      (reverse-i-search)`
                    </span>
                    <input
                      ref={inputRef}
                      type="text"
                      value={reverseSearchQuery}
                      onChange={handleReverseSearchChange}
                      onKeyDown={handleKeyDown}
                      spellCheck={false}
                      autoComplete="off"
                      className="flex-1 bg-transparent outline-none text-[13px]"
                      style={{ color: theme.text, caretColor: theme.caret }}
                      autoFocus
                    />
                    <span className="text-[13px] ml-1" style={{ color: theme.textMuted }}>
                      ': {reverseSearchResult || "—"}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="mr-2 flex items-center gap-1 font-bold" style={{ color: theme.prompt }}>
                      <ChevronRight size={14} style={{ color: theme.prompt }} />
                      {theme.promptSymbol}
                    </span>
                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        spellCheck={false}
                        autoComplete="off"
                        className="w-full bg-transparent outline-none text-[13px] relative z-10"
                        style={{ color: theme.text, caretColor: theme.caret }}
                        placeholder={history.length === 0 ? "Type a command..." : ""}
                      />
                      {/* Ghost Text Overlay */}
                      {ghostText && (
                        <span
                          className="absolute left-0 top-0 text-[13px] pointer-events-none z-0 whitespace-pre"
                          style={{ color: theme.textMuted, opacity: 0.4 }}
                        >
                          {input}
                          <span>{ghostText}</span>
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
