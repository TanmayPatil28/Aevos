"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { 
  UploadCloud, Send, Sparkles, Loader2, Flame, AlertCircle, 
  Zap, BookOpen, CheckCircle2, CornerDownLeft, Search 
} from "lucide-react";
import toast from "react-hot-toast";

import { uploadToStorage } from "@/lib/supabase/storage";
import { cn } from "@/lib/cn";
import { useRouter } from "next/navigation";

const QUICK_COMMANDS = [
  { id: "cgpa", name: "What's my CGPA?", icon: Flame, color: "text-orange-400", bg: "bg-orange-500/10", query: "What is my current CGPA and SGPA?" },
  { id: "bunk", name: "Can I bunk today?", icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10", query: "How many bunks do I have left in each subject?" },
  { id: "placement", name: "Am I placement ready?", icon: Zap, color: "text-cyan-400", bg: "bg-cyan-500/10", query: "Check my placement eligibility across all companies" },
  { id: "focus", name: "What should I focus on?", icon: BookOpen, color: "text-purple-400", bg: "bg-purple-500/10", query: "Based on my current academic data, what should I focus on this week?" },
  { id: "health", name: "Academic health check", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", query: "Give me a full academic health report" },
  { id: "target", name: "Set my target CGPA", icon: Flame, color: "text-amber-400", bg: "bg-amber-500/10", query: "Set my target CGPA to 8.5" },
];

interface JarvisCommandCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

export default function JarvisCommandCenter({ isOpen, onClose }: JarvisCommandCenterProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [isParsing, setIsParsing] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredCommands = QUICK_COMMANDS.filter(cmd => 
    cmd.name.toLowerCase().includes((input || "").toLowerCase()) || 
    cmd.query.toLowerCase().includes((input || "").toLowerCase())
  );

  const activeMessages = messages.filter(m => m.role !== "system");
  const showChat = activeMessages.length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const executeAction = React.useCallback((action: any) => {
    const { useDynamicIslandStore: islandStore } = require("@/stores/dynamicIslandStore");
    const { useUSMStore: usmStore } = require("@/stores/usmStore");

    switch (action.type) {
      case "navigate":
        if (action.route) {
          setTimeout(() => { router.push(action.route!); onClose(); }, 1500);
        }
        break;

      case "mark_attendance":
        if (action.courseId && action.attendanceAction) {
          const store = usmStore.getState();
          const course = store.courses.find((c: any) => c.id === action.courseId || c.code === action.courseId);
          if (course) {
            if (action.attendanceAction === "BUNKED") {
              store.updateCourse(course.id, { attendanceBunked: course.attendanceBunked + 1 });
            } else {
              store.updateCourse(course.id, { attendanceTotal: course.attendanceTotal + 1 });
            }
            islandStore.getState().showAlert({
              id: `jarvis-att-${Date.now()}`,
              type: action.attendanceAction === "BUNKED" ? "warning" : "success",
              title: action.attendanceAction === "BUNKED" ? "Bunk Recorded" : "Attendance Marked",
              message: `${course.name} marked as ${action.attendanceAction.toLowerCase()}.`,
              duration: 3000,
            });
          }
        }
        break;

      case "set_target_cgpa":
        if (action.value !== undefined) {
          usmStore.getState().setAcademic({ targetCgpa: action.value });
          islandStore.getState().showAlert({
            id: `jarvis-target-${Date.now()}`,
            type: "success",
            title: "Target Updated",
            message: `Target CGPA set to ${action.value}`,
            duration: 3000,
          });
        }
        break;
    }
  }, [router, onClose]);

  const submitQuery = async (query: string) => {
    if (!query.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: query };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const botMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botMessageId, role: "assistant", content: "" }]);

    try {
      const { buildJarvisContext } = await import("@/lib/ai/jarvisContextBuilder");
      const currentRoute = typeof window !== "undefined" ? window.location.pathname : "/";
      const studentContext = buildJarvisContext(currentRoute);

      const res = await fetch("/api/jarvis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, studentContext })
      });

      if (!res.ok) {
        setMessages(prev => prev.map(m => m.id === botMessageId ? { ...m, content: "Could not reach JARVIS. Check your API key in .env.local." } : m));
        setIsLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream reader");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.type === "metadata") {
              if (parsed.action && parsed.action.type !== "none") {
                executeAction(parsed.action);
              }
            } else if (parsed.type === "chunk") {
              setMessages(prev => prev.map(m => m.id === botMessageId ? { ...m, content: m.content + parsed.text } : m));
            }
          } catch (e) {
          }
        }
      }
    } catch (error) {
      console.error("Jarvis streaming error:", error);
      setMessages(prev => prev.map(m => m.id === botMessageId ? { ...m, content: "Connection to JARVIS failed." } : m));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickCommand = useCallback((query: string) => {
    submitQuery(query);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (showChat) {
        if (e.key === "Escape") onClose();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredCommands.length + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + (filteredCommands.length + 1)) % (filteredCommands.length + 1));
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        
        if (input.trim() && filteredCommands.length === 0) {
          submitQuery(input);
        } else {
          if (filteredCommands.length > selectedIndex) {
            handleQuickCommand(filteredCommands[selectedIndex].query);
          } else {
            toast("You can drop files anywhere!", { icon: "📎" });
          }
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, filteredCommands, input, showChat, onClose, handleQuickCommand]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [input]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image for parsing.");
      return;
    }

    setIsParsing(true);
    const { url, error: uploadError } = await uploadToStorage(file, "marksheets");
    if (uploadError) {
      toast.error("Cloud storage failed. Proceeding with local parsing...", { icon: "⚠️" });
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result?.toString().split(",")[1];
      if (!base64) return;

      toast.loading("JARVIS Vision analyzing document...", { id: "vision" });

      try {
        const res = await fetch("/api/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        submitQuery(`I've uploaded my marksheet. Here is the parsed data: ${JSON.stringify(data.data)}. Please analyze it and update my academic profile.`);
        toast.success("Document analyzed successfully", { id: "vision" });
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to parse document via Jarvis Vision.", { id: "vision" });
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsDataURL(file);
  }, [submitQuery]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop, accept: { "image/*": [] }, multiple: false, noClick: true,
  });



  const renderBentoCard = (cmd: any, idx: number, isWide = false) => {
    if (!cmd) return null;
    const isSelected = selectedIndex === idx;
    return (
      <button
        key={cmd.id}
        type="button"
        onClick={(e) => { e.stopPropagation(); handleQuickCommand(cmd.query); }}
        className={cn(
          "rounded-[28px] text-left relative overflow-hidden transition-all duration-300 group outline-none flex w-full h-full",
          isWide ? "flex-row items-center justify-start p-5 gap-5" : "flex-col items-start justify-between p-5",
          isSelected 
            ? "ring-2 ring-white/30 scale-[1.02] bg-gradient-to-b from-white/[0.15] to-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl z-10" 
            : "bg-gradient-to-b from-white/[0.08] to-transparent border border-white/[0.08] hover:from-white/[0.12] hover:to-white/[0.02] hover:scale-[1.01] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl ring-1 ring-inset ring-black/20"
        )}
      >
        <div className={cn("w-12 h-12 rounded-[18px] flex items-center justify-center shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_4px_10px_rgba(0,0,0,0.3)] border border-white/10 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-sm", cmd.bg)}>
          <cmd.icon size={22} strokeWidth={2.5} className={cmd.color} />
        </div>
        <div className={cn(!isWide && "mt-3")}>
          <h4 className="text-[14px] font-bold text-white/90 tracking-tight leading-tight mb-0.5">{cmd.name}</h4>
          {isWide && <p className="text-[12px] text-white/40 truncate max-w-[200px] drop-shadow-md">{cmd.query}</p>}
        </div>
      </button>
    );
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div {...getRootProps()} className="w-full flex flex-col relative bg-transparent">
      <input {...getInputProps()} />

      {/* OVERLAYS */}
      <AnimatePresence>
        {isDragActive && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] bg-primary/20 backdrop-blur-xl flex flex-col items-center justify-center border-2 border-primary border-dashed rounded-[32px] m-2">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-4"><UploadCloud size={40} className="text-primary" /></div>
            <h3 className="text-2xl font-bold text-white mb-2">Drop to Upload</h3>
            <p className="text-white/70 font-medium">Jarvis Vision will instantly analyze this document</p>
          </motion.div>
        )}
        {isParsing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center rounded-[32px] m-2 border border-white/10">
            <div className="w-20 h-20 relative flex items-center justify-center mb-6">
              <div className="absolute inset-0 border-4 border-primary/30 rounded-full animate-ping" />
              <Loader2 size={40} className="text-primary animate-spin relative z-10" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Extracting Intelligence...</h3>
            <p className="text-white/60">Using Jarvis Vision to parse the document</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP INPUT AREA (Dynamic Island Style) */}
      <div className="p-4 md:pt-8 md:pb-6 shrink-0 relative z-20 flex justify-center w-full">
        <motion.form 
          onSubmit={(e) => { e.preventDefault(); submitQuery(input); }} 
          layout
          initial={{ borderRadius: 36 }}
          animate={{ 
            width: "100%",
            maxWidth: "64rem",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="relative flex items-center bg-[#000000] backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] overflow-hidden ring-1 ring-white/5"
        >
          <div className="absolute left-6 flex items-center justify-center pointer-events-none">
            <Search className="text-white/40" size={22} strokeWidth={2.5} />
          </div>
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search GradeFlow or Ask Jarvis"
            className="w-full bg-transparent text-white pl-16 pr-16 py-4 md:py-5 outline-none text-[19px] font-medium placeholder-white/30 transition-all font-body tracking-tight text-left"
          />
          <div className="absolute right-4 flex items-center h-full justify-center">
            <AnimatePresence>
              {input?.trim() && (
                <motion.button 
                  initial={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
                  type="submit" 
                  disabled={isLoading} 
                  className="flex items-center justify-center w-10 h-10 bg-white/10 text-white hover:bg-white/20 rounded-full transition-colors disabled:opacity-50 active:scale-95 shadow-sm"
                >
                  <Send size={16} strokeWidth={2.5} className="mr-0.5 mt-0.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.form>
      </div>

      {/* MAIN CONTENT AREA */}
      <motion.div layout className="flex flex-col pb-8 px-4 md:px-8 max-h-[75vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" ref={listRef}>
        {!showChat ? (
          <div className="w-full flex flex-col items-center">
            <div className="w-full max-w-4xl flex flex-col items-center mt-2">
              
              {!input?.trim() ? (
                /* EMPTY INPUT STATE: Flex-Bento Grid Blueprint */
                <div className="w-full max-w-4xl flex flex-col gap-4">
                  
                  {/* TOP HALF FLEX */}
                  <div className="flex flex-col md:flex-row gap-4 w-full relative">
                    
                    {/* Left Large Card (Vision Drop) - 42% width */}
                    <div className="w-full md:w-[42%] flex shrink-0">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); open(); }}
                        className={cn(
                          "w-full rounded-[32px] p-6 text-left relative overflow-hidden transition-all duration-300 group outline-none flex flex-col justify-between min-h-[220px]",
                          selectedIndex === filteredCommands.length 
                            ? "ring-2 ring-white/40 scale-[1.02] bg-gradient-to-b from-[#007AFF]/30 to-[#007AFF]/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_12px_40px_rgba(0,122,255,0.4)] backdrop-blur-2xl" 
                            : "bg-gradient-to-b from-[#007AFF]/10 to-transparent border border-[#007AFF]/20 hover:from-[#007AFF]/20 hover:to-[#007AFF]/5 hover:scale-[1.01] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl ring-1 ring-inset ring-black/20"
                        )}
                      >
                        <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
                          <UploadCloud size={100} strokeWidth={1} className="text-[#007AFF] rotate-12 translate-x-4 -translate-y-4" />
                        </div>
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center z-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_12px_rgba(0,0,0,0.5)] border border-white/20 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-md mb-4")}>
                          <UploadCloud size={28} strokeWidth={2.5} className="text-[#007AFF]" />
                        </div>
                        <div className="z-10 mt-auto">
                          <h3 className="text-xl font-bold text-white tracking-tight mb-1">Jarvis Vision</h3>
                          <p className="text-[13px] text-white/60 leading-relaxed font-medium max-w-[80%]">Drop a marksheet or document anywhere to instantly extract intelligence.</p>
                        </div>
                      </button>
                    </div>

                    {/* Right Stack - 58% width */}
                    <div className="w-full md:w-[58%] flex flex-col gap-4">
                      {/* Top Row: 2 items */}
                      <div className="flex gap-4 h-1/2">
                        <div className="flex-1">{renderBentoCard(filteredCommands[0], 0)}</div>
                        <div className="flex-1">{renderBentoCard(filteredCommands[1], 1)}</div>
                      </div>
                      {/* Bottom Row: 1 wide item */}
                      <div className="h-1/2">
                        {renderBentoCard(filteredCommands[2], 2, true)}
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM HALF FLEX (3 perfectly equal columns) */}
                  <div className="flex flex-col md:flex-row gap-4 w-full">
                    <div className="flex-1">{renderBentoCard(filteredCommands[3], 3)}</div>
                    <div className="flex-1">{renderBentoCard(filteredCommands[4], 4)}</div>
                    <div className="flex-1">{renderBentoCard(filteredCommands[5], 5)}</div>
                  </div>
                  
                </div>
              ) : (
                /* SEARCH RESULTS STATE */
                <div className="w-full max-w-3xl flex flex-col gap-3 mt-4">
                  <div className="mb-2 px-2 flex justify-start">
                    <h3 className="text-[13px] font-bold tracking-tight text-white/50 uppercase">Search Results</h3>
                  </div>
                  {filteredCommands.map((cmd, idx) => (
                    <div key={cmd.id} className="w-full h-[88px]">{renderBentoCard(cmd, idx, true)}</div>
                  ))}
                  {filteredCommands.length === 0 && (
                    <div className="w-full mt-4 p-8 text-center text-white/40 text-[16px] font-medium bg-white/[0.02] rounded-[32px] border border-white/5 border-dashed">
                      No matching actions for "{input}". Press Enter to ask Jarvis directly.
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        ) : (
          /* CHAT THREAD (iMessage Style) */
          <div className="flex-1 px-4 md:px-8 space-y-4 pt-2 max-w-3xl mx-auto w-full">
            {activeMessages.map((m) => {
              const isUser = m.role === "user";
              const hasJsonData = m.content.includes("```json");
              
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.98 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  key={m.id} 
                  className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-b from-gray-400 to-gray-600 flex items-center justify-center mr-2 shrink-0 self-end mb-1 shadow-sm">
                      <Sparkles size={12} className="text-white" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[75%] px-4 py-2.5 text-[15px] leading-relaxed shadow-sm font-body tracking-tight",
                    isUser 
                      ? "bg-[#007AFF] text-white rounded-[20px] rounded-br-[4px]" 
                      : "bg-[#2C2C2E] text-white rounded-[20px] rounded-bl-[4px]"
                  )}>
                    {hasJsonData ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-1.5 text-emerald-400 opacity-90">
                          <CheckCircle2 size={16} strokeWidth={2.5} />
                          <span className="font-bold text-[13px] tracking-tight uppercase">Document Parsed</span>
                        </div>
                        <p className="opacity-95">{m.content.split("```json")[0]}</p>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
            
            {isLoading && (
              <div className="flex w-full justify-start items-center">
                 <div className="w-6 h-6 rounded-full bg-gradient-to-b from-gray-400 to-gray-600 flex items-center justify-center mr-2 shrink-0 self-end mb-1 shadow-sm">
                    <Sparkles size={12} className="text-white animate-pulse" />
                 </div>
                 <div className="bg-[#2C2C2E] text-white rounded-[20px] rounded-bl-[4px] px-4 py-3.5 flex gap-1.5 items-center shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                 </div>
              </div>
            )}
            <div className="h-4" />
          </div>
        )}
      </motion.div>
    </div>
  );
}
