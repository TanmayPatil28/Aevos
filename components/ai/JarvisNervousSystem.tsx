// @ts-nocheck
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useUSMStore } from "@/stores/usmStore";
import { useDynamicIslandStore } from "@/stores/dynamicIslandStore";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import Cartesia from "@cartesia/cartesia-js";

// Removed native SpeechRecognition

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
  const [messages, setMessages] = useState<{ id: string; role: 'user' | 'assistant'; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Voice AI Refs
  const dgConnectionRef = useRef<any>(null);
  const cartesiaClientRef = useRef<any>(null);
  const mediaRecorderRef = useRef<any>(null);
  const microphoneRef = useRef<any>(null);
  const cartesiaSourceRef = useRef<any>(null);
  
  const [authTokens, setAuthTokens] = useState<{ deepgramKey: string | null, cartesiaToken: string | null }>({ deepgramKey: null, cartesiaToken: null });

  useEffect(() => {
    fetch('/api/voice/token')
      .then(res => res.json())
      .then(data => {
        setAuthTokens({ deepgramKey: data.deepgramKey, cartesiaToken: data.cartesiaToken });
        if (data.cartesiaToken) {
          cartesiaClientRef.current = new (Cartesia as any)({ apiKey: data.cartesiaToken }); // Depending on version, can be apiKey or token. We'll use cartesiaToken as apiKey. (Cartesia accepts apiKey for tokens as well)
        }
      })
      .catch(err => console.error("Failed to fetch voice tokens:", err));
  }, []);

  const executeAction = (action: any) => {
    switch (action.type) {
      case "navigate":
        if (action.route) {
          setTimeout(() => { router.push(action.route!); }, 1500);
        }
        break;

      case "mark_attendance":
        if (action.courseId && action.attendanceAction) {
          const store = useUSMStore.getState();
          const course = store.courses.find((c: any) => c.id === action.courseId || c.code === action.courseId);
          if (course) {
            if (action.attendanceAction === "BUNKED") {
              store.updateCourse(course.id, { attendanceBunked: course.attendanceBunked + 1 });
            } else {
              store.updateCourse(course.id, { attendanceTotal: course.attendanceTotal + 1 });
            }
            useDynamicIslandStore.getState().showAlert({
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
          useUSMStore.getState().setAcademic({ targetCgpa: action.value });
          useDynamicIslandStore.getState().showAlert({
            id: `jarvis-target-${Date.now()}`,
            type: "success",
            title: "Target Updated",
            message: `Target CGPA set to ${action.value}`,
            duration: 3000,
          });
        }
        break;
    }
  };

  const submitQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsgId = Date.now().toString();
    const newUserMessage = { id: userMsgId, role: 'user' as const, content: queryText };
    
    const assistantMsgId = (Date.now() + 1).toString();
    const newAssistantMessage = { id: assistantMsgId, role: 'assistant' as const, content: "" };

    setMessages(prev => [...prev, newUserMessage, newAssistantMessage]);
    setIsLoading(true);

    try {
      const { buildJarvisContext } = await import("@/lib/ai/jarvisContextBuilder");
      const currentRoute = typeof window !== "undefined" ? window.location.pathname : "/";
      const studentContext = buildJarvisContext(currentRoute);

      const res = await fetch("/api/jarvis/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryText,
          studentContext
        })
      });

      if (!res.ok) {
        // Voice API failed - try to get text response from main Jarvis endpoint as fallback
        let fallbackText = "I'm having trouble connecting right now. Please try again.";
        try {
          const fallbackRes = await fetch("/api/jarvis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: queryText, studentContext })
          });
          if (fallbackRes.ok) {
            const fallbackReader = fallbackRes.body?.getReader();
            if (fallbackReader) {
              const fallbackDecoder = new TextDecoder();
              fallbackText = "";
              while (true) {
                const { done, value } = await fallbackReader.read();
                if (done) break;
                fallbackText += fallbackDecoder.decode(value, { stream: true });
                setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: fallbackText } : m));
              }
            }
          }
        } catch(e) { console.warn("Fallback Jarvis also failed:", e); }
        
        // Speak the fallback text using Web Speech API
        if (fallbackText.trim().length > 0) {
          setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: fallbackText } : m));
          const utterance = new SpeechSynthesisUtterance(fallbackText);
          window.speechSynthesis.speak(utterance);
        }
        setIsLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream reader");

      const decoder = new TextDecoder();
      let completedText = "";
      
      // Initialize Cartesia Player
      let audioQueue: HTMLAudioElement | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (cartesiaSourceRef.current) {
             cartesiaSourceRef.current.close();
          }
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        completedText += chunk;
        setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: completedText } : m));
      }
      
      // Once text generation completes, synthesize speech using Cartesia REST API
      if (authTokens.cartesiaToken && completedText.trim().length > 0) {
        try {
          const ttsRes = await fetch('https://api.cartesia.ai/tts/bytes', {
            method: 'POST',
            headers: {
              'Cartesia-Version': '2026-03-01',
              'X-API-Key': authTokens.cartesiaToken,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model_id: 'sonic-3.5',
              transcript: completedText,
              voice: {
                mode: 'id',
                id: '1259b7e3-cb8a-43df-9446-30971a46b8b0'
              },
              output_format: {
                container: 'wav',
                encoding: 'pcm_s16le',
                sample_rate: 44100
              },
              generation_config: {
                speed: 1,
                volume: 1
              }
            })
          });
          
          if (ttsRes.ok) {
            const blob = await ttsRes.blob();
            const url = URL.createObjectURL(blob);
            audioQueue = new Audio(url);
            audioQueue.play();
          } else {
            console.error("Cartesia TTS API error:", await ttsRes.text());
            // Fallback to native Web Speech API if Cartesia fails
            const utterance = new SpeechSynthesisUtterance(completedText);
            window.speechSynthesis.speak(utterance);
          }
        } catch (e) {
          console.error("Cartesia Audio Error:", e);
          const utterance = new SpeechSynthesisUtterance(completedText);
          window.speechSynthesis.speak(utterance);
        }
      } else if (completedText.trim().length > 0) {
        // Fallback to native Web Speech API if no Cartesia token
        const utterance = new SpeechSynthesisUtterance(completedText);
        window.speechSynthesis.speak(utterance);
      }

    } catch (error) {
      console.error("Jarvis voice streaming error:", error);
      setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: "Connection to JARVIS failed." } : m));
    } finally {
      setIsLoading(false);
    }
  };

  const submitQueryRef = useRef(submitQuery);
  useEffect(() => {
    submitQueryRef.current = submitQuery;
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

  const toggleListen = async () => {
    console.log("Mic button clicked!");
    
    // Unlock Audio and SpeechSynthesis for the session
    try {
      const dummyAudio = new Audio();
      dummyAudio.play().catch(() => {});
      const dummyUtterance = new SpeechSynthesisUtterance('');
      dummyUtterance.volume = 0;
      window.speechSynthesis.speak(dummyUtterance);
    } catch(e) {}
    
    if (isListening) {
      if (dgConnectionRef.current) {
        dgConnectionRef.current.finish();
        dgConnectionRef.current = null;
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }
      if (microphoneRef.current) {
        microphoneRef.current.getTracks().forEach((track: any) => track.stop());
        microphoneRef.current = null;
      }
      setIsListening(false);
    } else {
      if (!authTokens.deepgramKey) {
        console.error("Deepgram API Key not ready.");
        alert("Microphone Error: Voice API Keys are not ready. Please check if the dev server was restarted and tokens are fetching correctly.");
        return;
      }
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        microphoneRef.current = stream;
        
        const deepgram = createClient(authTokens.deepgramKey);
        const connection = deepgram.listen.live({ 
          model: "nova-2", 
          smart_format: true, 
          interim_results: false 
        });

        connection.on(LiveTranscriptionEvents.Open, () => {
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.addEventListener('dataavailable', async (event) => {
            if (event.data.size > 0 && connection.getReadyState() === 1) {
               connection.send(event.data);
            }
          });
          
          mediaRecorder.start(250);
          setIsListening(true);
        });

        connection.on(LiveTranscriptionEvents.Transcript, (data) => {
          const transcript = data.channel.alternatives[0].transcript;
          if (transcript && data.is_final) {
             submitQueryRef.current(transcript);
             toggleListen(); // Auto-stop listening after a sentence to wait for response
          }
        });

        connection.on(LiveTranscriptionEvents.Error, (err) => {
          console.error("Deepgram Error", err);
          setIsListening(false);
        });
        
        dgConnectionRef.current = connection;
        
      } catch (err) {
        console.error("Microphone error:", err);
      }
    }
  };

  return (
    <div className="fixed bottom-[88px] right-6 z-[999999] flex flex-col items-end gap-4 pointer-events-auto">
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
