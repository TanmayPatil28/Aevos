"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { PanelLeftOpen } from "lucide-react";
import { useUSMStore } from "@/stores/usmStore";
import TimetableManager from "@/components/attendance/TimetableManager";
import { Tooltip } from "@/components/ui/tooltip";

import { sanitizeAdherenceNeutralText } from "@/lib/time-liquidity/sanitizer";
export { sanitizeAdherenceNeutralText };

import { ChatPanel } from "./components/ChatPanel";
import { MetricsBar } from "./components/MetricsBar";
import { TimetableGrid } from "./components/TimetableGrid";
import { CommandPalette } from "./components/CommandPalette";
import { OnboardingModal } from "./components/OnboardingModal";
import { GuideModal } from "./components/GuideModal";

const ALL_COMMANDS = [
  { id: 'skip-tomorrow', label: 'Can I skip tomorrow?', category: 'Predictive Operations', requiresWeekday: true, requiresSafeSkips: true },
  { id: 'monte-carlo', label: 'Am I at risk of detention?', category: 'Predictive Operations', requiresWeekday: false, requiresSafeSkips: false },
  { id: 'long-weekend', label: 'Plan a long weekend', category: 'Predictive Operations', requiresWeekday: true, requiresSafeSkips: true },
  { id: 'vacation-planning', label: 'How many classes can I miss in a row?', category: 'Predictive Operations', requiresWeekday: false, requiresSafeSkips: true },
  { id: 'overslept', label: 'I overslept this morning - what now?', category: 'Emergency Planning', requiresWeekday: true, requiresSafeSkips: false },
  { id: 'recovery-mode', label: 'Maximize my free time this week', category: 'AI Negotiation', requiresWeekday: true, requiresSafeSkips: true },
  { id: 'grade-risk', label: 'Will this affect my grades?', category: 'AI Negotiation', requiresWeekday: false, requiresSafeSkips: false },
  { id: 'exam-sprint', label: 'Plan study blocks before exams', category: 'AI Negotiation', requiresWeekday: false, requiresSafeSkips: false },
  { id: 'skip-class', label: 'What if I skip a specific class?', category: 'AI Negotiation', requiresWeekday: false, requiresSafeSkips: true }
];

type Message = { role: string; content: string; action?: string; isHint?: boolean; timestamp?: string; isOffline?: boolean; };

const getUniqueTimeSlots = (timetable: Record<string, any[]>) => {
  const slots = new Set<string>();
  Object.values(timetable).forEach(entries => {
    entries.forEach(entry => {
      slots.add(`${entry.startTime}-${entry.endTime}`);
    });
  });

  return Array.from(slots).sort((a, b) => {
    const [startA] = a.split('-');
    const [startB] = b.split('-');
    const [hA, mA] = startA.split(':').map(Number);
    const [hB, mB] = startB.split(':').map(Number);
    if (hA !== hB) return hA - hB;
    return mA - mB;
  });
};

export default function TimeLiquidityClient() {
  const timetable = useUSMStore(state => state.timetable);
  const courses = useUSMStore(state => state.courses);
  const academic = useUSMStore(state => state.academic);
  const setAcademic = useUSMStore(state => state.setAcademic);

  const timeSlots = useMemo(() => getUniqueTimeSlots(timetable), [timetable]);
  const [activeStrategy, setActiveStrategy] = useState<string>("Balanced");

  const { initialRuinProbability, initialStrategicSkips } = useMemo(() => {
    let totalRisk = 0;
    let totalBunks = 0;
    courses.forEach(c => {
      const percentage = c.attendanceTotal > 0 ? ((c.attendanceTotal - c.attendanceBunked) / c.attendanceTotal) * 100 : 100;
      if (percentage < 75) totalRisk += (75 - percentage);
      totalBunks += Math.max(0, Math.floor((c.attendanceTotal * 0.25) - c.attendanceBunked));
    });
    return {
      initialRuinProbability: Math.min(100, Math.round((totalRisk * 2) + 5)),
      initialStrategicSkips: totalBunks
    };
  }, [courses]);

  const [inputValue, setInputValue] = useState("");
  const [showTimetableManager, setShowTimetableManager] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scheduleState, setScheduleState] = useState('initial');
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);
  const [cmdKInput, setCmdKInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isEmptyState, setIsEmptyState] = useState(false);

  const [showAgentMenu, setShowAgentMenu] = useState(false);
  const [showStrategyMenu, setShowStrategyMenu] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('Tactical Negotiator');
  const [skippedClassIds, setSkippedClassIds] = useState<string[]>([]);
  const [activeBatchView, setActiveBatchView] = useState<string>(academic.studentBatch || "ALL");
  const [dimInsteadOfHide, setDimInsteadOfHide] = useState<boolean>(true);
  const [hasShownSanitizerHint, setHasShownSanitizerHint] = useState<boolean>(false);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingSlide, setOnboardingSlide] = useState(0);
  const [showGuide, setShowGuide] = useState(false);

  const lastMessageRef = useRef("");
  const isCurrentlyEmpty = isEmptyState || timeSlots.length === 0;

  useEffect(() => {
    const onboarded = localStorage.getItem("gradeflow_attendance_optimizer_onboarded");
    if (!onboarded) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    if (timeSlots.length > 0 && isEmptyState) {
      setIsEmptyState(false);
    }
  }, [timeSlots.length, isEmptyState]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'system',
          content: `Welcome to the Tactical Negotiator! I am your AI Time Liquidity Assistant. 
          
Here is what I can do for you:
• **Analyze your schedule**: I run simulations to find safe spaces to skip classes without falling below your 75% attendance threshold.
• **Plan your week**: Ask me to plan your week around specific goals like exam prep, interviews, or burnout recovery.
• **Emergency recovery**: Tell me if you overslept, and I'll recalculate your risk and provide a recovery plan.

**What to ask me:**
- "Can I take this Friday off?"
- "What is the safest week to take a break this month?"
- "I missed morning classes, how bad is it?"
- "Help me plan a study block for exams next week."

Click the **Guide** button in the top right to learn more about the optimization mechanics. You currently have ${initialStrategicSkips} safe absences available. What's on your mind?`
        }
      ]);
    }
  }, [initialStrategicSkips, messages.length]);

  useEffect(() => {
    if (activeBatchView !== "ALL" && activeBatchView !== academic.studentBatch) {
      setAcademic({ studentBatch: activeBatchView });
    }
  }, [activeBatchView, academic.studentBatch, setAcademic]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [metrics, setMetrics] = useState({
    ruinProbability: initialRuinProbability,
    timeCushion: 24,
    strategicSkips: initialStrategicSkips,
    gradeDegradationRisk: 'Elevated (μ + 1.5σ)'
  });

  const [cmdKSelectedIndex, setCmdKSelectedIndex] = useState(0);

  const COMMAND_LIST = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const hasNoSafeSkips = metrics.strategicSkips <= 0;
    const isHighRisk = metrics.ruinProbability > 20;

    return ALL_COMMANDS
      .filter(cmd => {
        if (isWeekend && cmd.requiresWeekday) return false;
        if (hasNoSafeSkips && cmd.requiresSafeSkips) return false;
        return true;
      })
      .sort((a, b) => {
        if (isHighRisk) {
          if (!a.requiresSafeSkips && b.requiresSafeSkips) return -1;
          if (a.requiresSafeSkips && !b.requiresSafeSkips) return 1;
        }
        return 0;
      });
  }, [metrics.strategicSkips, metrics.ruinProbability]);

  const filteredCommands = useMemo(() => {
    if (!cmdKInput.trim()) return COMMAND_LIST;
    return COMMAND_LIST.filter(c => c.label.toLowerCase().includes(cmdKInput.toLowerCase()));
  }, [cmdKInput, COMMAND_LIST]);

  useEffect(() => {
    setCmdKSelectedIndex(0);
  }, [cmdKInput]);

  const executeCommand = (commandId: string) => {
    switch (commandId) {
      case 'skip-tomorrow':
        setActiveStrategy("Placement Prep");
        handleSendMessage("Can I reallocate tomorrow?", "Placement Prep");
        break;
      case 'recovery-mode':
        setActiveStrategy("Burnout Recovery");
        handleSendMessage("Optimize my schedule for maximum flexibility", "Burnout Recovery");
        break;
      case 'monte-carlo':
        handleSendMessage("Analyze my risk exposure");
        break;
      case 'grade-risk':
        handleSendMessage("How does reallocation affect my grades?");
        break;
      case 'long-weekend':
        handleSendMessage("Can I free up Friday for a long weekend?");
        break;
      case 'exam-sprint':
        setActiveStrategy("Exam Sprint");
        handleSendMessage("Find study blocks before exams", "Exam Sprint");
        break;
      case 'overslept':
        setActiveStrategy("Survival");
        handleSendMessage("I missed this morning — recovery plan?", "Survival");
        break;
      case 'skip-class':
        handleSendMessage("What's the impact of reallocating a specific session?");
        break;
      case 'vacation-planning':
        handleSendMessage("How many consecutive days can I reallocate?");
        break;
    }
    setIsCmdKOpen(false);
    setCmdKInput("");
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isProcessing, scheduleState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsCmdKOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCmdKOpen(prev => !prev);
      }
      if (isCmdKOpen) {
        const isHighRisk = metrics.ruinProbability > 20;
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setCmdKSelectedIndex(prev => {
            if (filteredCommands.length === 0) return 0;
            let next = (prev + 1) % filteredCommands.length;
            for (let i = 0; i < filteredCommands.length; i++) {
              const cmd = filteredCommands[next];
              const isAggressiveAndDisabled = isHighRisk && cmd.requiresSafeSkips;
              if (!isAggressiveAndDisabled) return next;
              next = (next + 1) % filteredCommands.length;
            }
            return prev;
          });
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setCmdKSelectedIndex(prev => {
            if (filteredCommands.length === 0) return 0;
            let next = (prev - 1 + filteredCommands.length) % filteredCommands.length;
            for (let i = 0; i < filteredCommands.length; i++) {
              const cmd = filteredCommands[next];
              const isAggressiveAndDisabled = isHighRisk && cmd.requiresSafeSkips;
              if (!isAggressiveAndDisabled) return next;
              next = (next - 1 + filteredCommands.length) % filteredCommands.length;
            }
            return prev;
          });
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (filteredCommands.length > 0 && filteredCommands[cmdKSelectedIndex]) {
            const cmd = filteredCommands[cmdKSelectedIndex];
            const isAggressiveAndDisabled = isHighRisk && cmd.requiresSafeSkips;
            if (!isAggressiveAndDisabled) {
              executeCommand(cmd.id);
            }
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCmdKOpen, cmdKSelectedIndex, filteredCommands, executeCommand, metrics.ruinProbability]);

  useEffect(() => {
    if (scheduleState === 'initial') {
      setMetrics(prev => ({
        ...prev,
        ruinProbability: initialRuinProbability,
        strategicSkips: initialStrategicSkips
      }));
    }
  }, [initialRuinProbability, initialStrategicSkips, scheduleState]);

  const handleSendMessage = async (overridePrompt?: string, overrideStrategy?: string, isSilentAction: boolean = false) => {
    const userMessage = overridePrompt || inputValue;
    if (!userMessage.trim()) return;

    lastMessageRef.current = userMessage;
    const sanitizedUserMessage = sanitizeAdherenceNeutralText(userMessage);
    const wasModified = sanitizedUserMessage !== userMessage;
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nextMessages: Message[] = [];
    
    if (!isSilentAction) {
      nextMessages.push({ role: 'user', content: userMessage, timestamp: currentTime });
      if (wasModified && !hasShownSanitizerHint) {
        setHasShownSanitizerHint(true);
        nextMessages.push({
          role: 'system',
          content: 'Note: We use neutral terms like "reallocate" in our analysis — they mean the same as "skip". Your official attendance records are never modified here.',
          isHint: true,
          timestamp: currentTime
        });
      }
      setMessages(prev => [...prev, ...nextMessages]);
    } else {
      // For silent inline actions (like the offline button), remove the message that contained the button
      setMessages(prev => prev.slice(0, -1));
    }
    
    if (!overridePrompt) {
      setInputValue('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
    
    setIsProcessing(true);
    setScheduleState('initial');
    setSkippedClassIds([]);

    try {
      const flatSchedule = Object.entries(timetable).flatMap(([day, entries]) =>
        entries.map(e => {
          const course = courses.find(c => c.id === e.courseId);
          return {
            id: e.id,
            courseCode: course?.code || "UNKNOWN",
            title: course?.name || "Unknown Course",
            type: e.type,
            dayOfWeek: day.charAt(0).toUpperCase() + day.slice(1),
            startTime: e.startTime,
            endTime: e.endTime,
            isMandatory: false,
            penaltyWeight: e.type === 'LAB' || e.type === 'PRACTICAL' ? 1.5 : 1
          };
        })
      );

      const res = await fetch('/api/negotiator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: sanitizedUserMessage,
          currentSchedule: flatSchedule,
          safeBunks: metrics.strategicSkips,
          currentRuinRisk: metrics.ruinProbability,
          agent: selectedAgent,
          strategy: overrideStrategy || activeStrategy
        })
      });

      if (!res.ok) {
        throw new Error("Failed to communicate with the constraint engine");
      }

      const data = await res.json();

      if (data.action === 'empty_state' || data.emptyState) {
        setIsEmptyState(true);
        setMessages(prev => prev.slice(0, -1));
        setIsProcessing(false);
        return;
      }

      const sanitizedContent = sanitizeAdherenceNeutralText(data.content);

      setMessages(prev => [...prev, {
        role: selectedAgent === 'Compliance Agent' ? 'compliance' : selectedAgent === 'Deliverable Agent' ? 'deliverable' : selectedAgent === 'Recovery Agent' ? 'recovery' : 'system',
        content: sanitizedContent,
        action: data.action,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOffline: data.isOffline || false
      }]);

      if (data.metrics) {
        setMetrics(prev => ({
          ...prev,
          ruinProbability: data.metrics.newRuinProbability,
          strategicSkips: data.metrics.newStrategicSkips
        }));
      }

      if (data.proposedSchedule && data.proposedSchedule.classesToSkip) {
        setSkippedClassIds(data.proposedSchedule.classesToSkip);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        role: 'system',
        content: 'Error communicating with the constraint engine.',
        action: 'retry'
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    setMessages(prev => prev.slice(0, -1));
    handleSendMessage(lastMessageRef.current);
  };

  const { activeDays, activeDisplayDays } = useMemo(() => {
    const baseDays = ["monday", "tuesday", "wednesday", "thursday", "friday"] as const;
    const baseDisplay = ["MON", "TUE", "WED", "THU", "FRI"];
    const hasSaturday = timetable.saturday && timetable.saturday.length > 0;
    const hasSunday = timetable.sunday && timetable.sunday.length > 0;

    const finalDays = [...baseDays];
    const finalDisplay = [...baseDisplay];
    if (hasSaturday) {
      finalDays.push("saturday");
      finalDisplay.push("SAT");
    }
    if (hasSunday) {
      finalDays.unshift("sunday");
      finalDisplay.unshift("SUN");
    }
    return { activeDays: finalDays, activeDisplayDays: finalDisplay };
  }, [timetable]);

  return (
    <div className="flex h-full bg-[var(--aevos-background)] text-[var(--aevos-text-primary)] overflow-hidden relative aevos-texture font-sans">
      <ChatPanel
        isChatOpen={isChatOpen}
        setIsChatOpen={setIsChatOpen}
        showAgentMenu={showAgentMenu}
        setShowAgentMenu={setShowAgentMenu}
        selectedAgent={selectedAgent}
        setSelectedAgent={setSelectedAgent}
        showStrategyMenu={showStrategyMenu}
        setShowStrategyMenu={setShowStrategyMenu}
        activeStrategy={activeStrategy}
        setActiveStrategy={setActiveStrategy}
        messages={messages}
        setMessages={setMessages}
        isProcessing={isProcessing}
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSendMessage={handleSendMessage}
        textareaRef={textareaRef}
        messagesEndRef={messagesEndRef}
        metrics={metrics}
        scheduleState={scheduleState}
        setScheduleState={setScheduleState}
        setSkippedClassIds={setSkippedClassIds}
        handleRetry={handleRetry}
        setIsCmdKOpen={setIsCmdKOpen}
        setShowGuide={setShowGuide}
      />

      <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden relative">
        {/* TOP HEADER */}
        <header className="h-14 border-b border-white/[0.05] bg-[var(--aevos-surface-dim)]/90 backdrop-blur flex items-center justify-between px-4 md:px-6 shrink-0 relative z-30">
          <div className="flex flex-col space-y-1 w-auto md:w-[40%]">
            {!isChatOpen && (
              <button
                onClick={() => setIsChatOpen(true)}
                className="flex items-center gap-1.5 text-[var(--aevos-text-secondary)] hover:text-[var(--aevos-text-primary)] transition-colors w-fit group"
                title="Expand AI Sidebar"
              >
                <PanelLeftOpen className="w-4 h-4 opacity-70 group-hover:opacity-100" />
              </button>
            )}
          </div>
          <div className="flex-1 max-w-lg mx-4 hidden md:block"></div>
          <div className="flex items-center justify-end w-auto md:w-[35%] space-x-2 md:space-x-3 shrink-0">
            <Tooltip
              content={
                <div className="flex flex-col gap-2 p-1">
                  <p className="text-[11px] font-semibold text-[var(--aevos-text-primary)] border-b border-[var(--aevos-outline)]/20 pb-1 mb-1">Color Legend</p>
                  <div className="flex flex-col gap-1.5 text-[10px] text-[var(--aevos-text-secondary)] font-sans">
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full border border-[var(--aevos-status-info)] bg-black"></span> Lecture</span>
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full border border-[var(--aevos-tertiary)] bg-black"></span> Practical / Lab</span>
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full border border-[var(--aevos-status-warning)] bg-black"></span> Tutorial</span>
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full border border-[var(--aevos-primary)] bg-black"></span> Safe to Skip</span>
                  </div>
                </div>
              }
              position="bottom-right"
            >
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 text-[var(--aevos-text-secondary)] hover:text-[var(--aevos-text-primary)] hover:bg-[var(--aevos-surface)] rounded-[8px] text-xs transition-colors shrink-0"
                onClick={() => setShowGuide(true)}
              >
                Guide
              </button>
            </Tooltip>
            <button 
              className="flex items-center gap-1.5 px-3 py-1.5 text-[var(--aevos-text-secondary)] hover:text-[var(--aevos-text-primary)] hover:bg-[var(--aevos-surface)] rounded-[8px] text-xs transition-colors shrink-0" 
              onClick={() => setShowTimetableManager(true)}
            >
              Edit Timetable
            </button>
          </div>
        </header>

        <div className="flex-1 min-w-0 min-h-0 bg-[var(--aevos-background)] flex flex-col relative overflow-hidden">
          <MetricsBar 
            activeBatchView={activeBatchView}
            setActiveBatchView={setActiveBatchView}
            dimInsteadOfHide={dimInsteadOfHide}
            setDimInsteadOfHide={setDimInsteadOfHide}
            metrics={metrics}
            isCurrentlyEmpty={isCurrentlyEmpty}
          />
          <TimetableGrid 
            timeSlots={timeSlots}
            isCurrentlyEmpty={isCurrentlyEmpty}
            activeDays={activeDays}
            activeDisplayDays={activeDisplayDays}
            timetable={timetable}
            courses={courses}
            activeBatchView={activeBatchView}
            dimInsteadOfHide={dimInsteadOfHide}
            skippedClassIds={skippedClassIds}
            setShowTimetableManager={setShowTimetableManager}
          />
        </div>
      </main>

      <CommandPalette 
        isOpen={isCmdKOpen}
        onClose={() => setIsCmdKOpen(false)}
        cmdKInput={cmdKInput}
        setCmdKInput={setCmdKInput}
        filteredCommands={filteredCommands}
        cmdKSelectedIndex={cmdKSelectedIndex}
        setCmdKSelectedIndex={setCmdKSelectedIndex}
        executeCommand={executeCommand}
        metrics={metrics}
      />
      <OnboardingModal 
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onboardingSlide={onboardingSlide}
        setOnboardingSlide={setOnboardingSlide}
        metrics={metrics}
        isCurrentlyEmpty={isCurrentlyEmpty}
      />
      <GuideModal 
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        onReplayOnboarding={() => {
          setShowGuide(false);
          setOnboardingSlide(0);
          setShowOnboarding(true);
        }}
      />
      {showTimetableManager && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-7xl h-[90vh] md:h-[85vh]">
            <TimetableManager onClose={() => setShowTimetableManager(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
