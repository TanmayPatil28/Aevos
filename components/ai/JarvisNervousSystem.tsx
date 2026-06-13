// @ts-nocheck
"use client";

import { useEffect, useRef, useState } from "react";
import { useUSMStore } from "@/stores/usmStore";
import { useDynamicIslandStore } from "@/stores/dynamicIslandStore";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@ai-sdk/react";

const SpeechRecognition = typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

export default function JarvisNervousSystem() {
  const previousState = useRef<{
    bunkedTotals: Record<string, number>;
    completedCoursesCount: number;
    mode: string;
  }>({
    bunkedTotals: {},
    completedCoursesCount: 0,
    mode: "DEFAULT",
  });

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const { messages, isLoading, append } = useChat({
    api: '/api/chat',
    onFinish: (message) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(message.content);
        window.speechSynthesis.speak(utterance);
      }
    }
  });

  useEffect(() => {
    // Subscribe to USMStore for proactive intelligence
    const unsubscribe = useUSMStore.subscribe((state) => {
      const islandStore = useDynamicIslandStore.getState();
      const usmStore = useUSMStore.getState();
      const prev = previousState.current;

      // ─────────────────────────────────────────────────────────────────
      // SUB-ROUTINE 1: OS CONTROL (Proactive mode switching)
      // ─────────────────────────────────────────────────────────────────
      const hasSevereBacklogs = state.academic.activeBacklogsCount >= 3;
      const hasCriticalGpa = state.academic.currentCgpa > 0 && state.academic.currentCgpa < 6.0;
      
      const shouldBeInRecovery = hasSevereBacklogs || hasCriticalGpa;
      const isCurrentlyInRecovery = state.workspaceUi.mode === "RECOVERY";

      if (shouldBeInRecovery && !isCurrentlyInRecovery) {
        usmStore.setWorkspaceMode("RECOVERY");
        islandStore.showAlert({
          id: `jarvis-os-control-${Date.now()}`,
          type: "error",
          title: "JARVIS OVERRIDE",
          message: "Critical academic drop detected. Forcing OS into RECOVERY mode.",
          duration: 6000,
        });
      } else if (!shouldBeInRecovery && isCurrentlyInRecovery) {
        usmStore.setWorkspaceMode("DEFAULT");
        islandStore.showAlert({
          id: `jarvis-os-restore-${Date.now()}`,
          type: "success",
          title: "JARVIS OVERRIDE",
          message: "Academic health stabilized. Restoring DEFAULT OS mode.",
          duration: 4000,
        });
      }

      // ─────────────────────────────────────────────────────────────────
      // SUB-ROUTINE 2: PREDICTIVE MATH (Attendance Monitoring)
      // ─────────────────────────────────────────────────────────────────
      state.courses.forEach((course) => {
        const prevBunked = prev.bunkedTotals[course.id] || 0;
        const currentBunked = course.attendanceBunked || 0;
        
        // Detect a newly logged bunk
        if (currentBunked > prevBunked) {
          const totalClasses = course.attendanceTotal + currentBunked; // Basic approximation
          const attended = course.attendanceTotal;
          const percentage = totalClasses > 0 ? (attended / totalClasses) * 100 : 100;
          
          if (percentage < 75) {
            islandStore.showAlert({
              id: `jarvis-pred-${Date.now()}`,
              type: "warning",
              title: "CRITICAL PREDICTION",
              message: `Your recent bunk in ${course.name} dropped you to ${percentage.toFixed(1)}%. You are now at risk of exam detention.`,
              duration: 5000,
            });
          } else if (percentage < 80) {
            islandStore.showAlert({
              id: `jarvis-pred-${Date.now()}`,
              type: "info",
              title: "ATTENDANCE WARNING",
              message: `You bunked ${course.name}. Attendance is at ${percentage.toFixed(1)}%. Only 1 bunk remaining before 75% limit.`,
              duration: 4000,
            });
          }
        }
        
        prev.bunkedTotals[course.id] = currentBunked;
      });

      // ─────────────────────────────────────────────────────────────────
      // SUB-ROUTINE 3: CAREER ENGINE (Auto-Skill Mapping)
      // ─────────────────────────────────────────────────────────────────
      // Map courses to career skills
      const skillMappings: Record<string, string> = {
        "data structure": "DSA",
        "algorithm": "DSA",
        "web": "Web Development",
        "database": "SQL / Databases",
        "dbms": "SQL / Databases",
        "operating system": "OS",
        "machine learning": "Machine Learning",
        "react": "Frontend",
        "java": "Java",
        "python": "Python",
      };

      const completedCourses = state.courses.filter(c => c.grade && c.grade !== "F");
      if (completedCourses.length !== prev.completedCoursesCount) {
        const currentSkills = new Set(state.career.skills || []);
        let unlockedNewSkill = false;
        const newlyUnlocked: string[] = [];

        completedCourses.forEach(c => {
          const courseNameLower = c.name.toLowerCase();
          Object.entries(skillMappings).forEach(([keyword, skill]) => {
            if (courseNameLower.includes(keyword) && !currentSkills.has(skill)) {
              currentSkills.add(skill);
              unlockedNewSkill = true;
              newlyUnlocked.push(skill);
            }
          });
        });

        if (unlockedNewSkill) {
          usmStore.setCareer({ skills: Array.from(currentSkills) });
          islandStore.showAlert({
            id: `jarvis-career-${Date.now()}`,
            type: "success",
            title: "CAREER NODE UNLOCKED",
            message: `Based on your passed courses, JARVIS unlocked: ${newlyUnlocked.join(", ")}`,
            duration: 5000,
          });
        }
        
        prev.completedCoursesCount = completedCourses.length;
      }

    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        append({ role: 'user', content: transcript });
      };

      recognitionRef.current = recognition;
    }
  }, [append]);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  return (
    <div className="fixed bottom-[88px] right-6 z-50 flex flex-col items-end gap-4 pointer-events-auto">
      <AnimatePresence>
        {messages.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-xl max-w-sm text-sm text-white/90"
          >
            <div className="font-bold mb-1">
              {messages[messages.length - 1].role === 'user' ? (
                <span className="text-white/50">You</span>
              ) : (
                <span className="text-blue-400">Jarvis</span>
              )}
            </div>
            {messages[messages.length - 1].content}
            {isLoading && <Loader2 className="w-4 h-4 mt-2 animate-spin text-white/50" />}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={toggleListen}
        className={`p-4 rounded-full shadow-2xl backdrop-blur-md transition-all ${
          isListening 
            ? "bg-red-500/20 text-red-500 border border-red-500/50 animate-pulse" 
            : "bg-black/50 text-white/80 border border-white/20 hover:bg-black/80"
        }`}
      >
        {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
      </button>
    </div>
  );
}
