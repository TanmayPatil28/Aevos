"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { motion } from 'framer-motion';
import { X, Send, Award, Briefcase, Zap, CheckCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'jarvis';
  content: string;
}

interface Scorecard {
  score: number;
  communication?: number;
  technical?: number;
  confidence?: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
}

export default function JarvisInterviewModal() {
  const closeInterview = useUIStore((state) => state.closeInterview);
  const interviewData = useUIStore((state) => state.activeInterviewData);

  const [messages, setMessages] = useState<Message[]>([
    { role: 'jarvis', content: 'Hello. I am JARVIS. I will be conducting your mock interview today for the target role. We will cover 5 questions. Shall we begin?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [scorecard, setScorecard] = useState<Scorecard | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Prevent rendering if not active
  if (!interviewData) return null;

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const newMessages = [...messages, { role: 'user', content: inputValue.trim() }];
    setMessages(newMessages as Message[]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Determine if it's the final question (user has answered 5 times)
      const userAnswersCount = newMessages.filter(m => m.role === 'user').length;
      const isFinalQuestion = userAnswersCount >= 5;

      const response = await fetch('/api/career/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages, 
          detailedAudit: interviewData.detailedAudit,
          targetJD: interviewData.targetJD,
          isFinalQuestion
        })
      });
      
      const data = await response.json();
      
      if (data.isGameOver && data.scorecard) {
        setIsGameOver(true);
        setScorecard(data.scorecard);
      } else {
        setMessages([...newMessages, { role: 'jarvis', content: data.reply }]);
      }

    } catch (error) {
      console.error("Interview API Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isGameOver && scorecard) {
    return (
      <div className="fixed inset-0 z-[9999] bg-neutral-950 flex items-center justify-center p-4 font-sans">
        <div className="absolute top-6 right-6">
          <button onClick={closeInterview} className="text-neutral-400 hover:text-white transition-colors">
            <X size={32} />
          </button>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <Award className="text-emerald-400" size={40} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Interview Complete</h2>
            <p className="text-neutral-400">JARVIS has finished analyzing your performance.</p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="bg-neutral-800/50 p-6 rounded-xl border border-neutral-700/50 text-center w-full max-w-sm">
              <div className="text-5xl font-bold text-white mb-2">{scorecard.score}/100</div>
              <div className="text-sm text-neutral-400 uppercase tracking-wider">Overall Score</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-green-900/20 border border-green-800/50 rounded-xl p-5">
               <h3 className="text-green-400 font-bold mb-3 text-sm uppercase tracking-wide">Strengths</h3>
               <ul className="list-disc pl-4 text-green-100 text-sm space-y-1">
                 {scorecard.strengths.map((s, i) => <li key={i}>{s}</li>)}
               </ul>
            </div>
            <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-5">
               <h3 className="text-red-400 font-bold mb-3 text-sm uppercase tracking-wide">Weaknesses</h3>
               <ul className="list-disc pl-4 text-red-100 text-sm space-y-1">
                 {scorecard.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
               </ul>
            </div>
          </div>

          <div className="bg-neutral-800/30 rounded-xl p-6 border border-neutral-700/50 mb-8">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Zap size={20} className="text-amber-400" />
              Detailed Feedback
            </h3>
            <p className="text-neutral-300 leading-relaxed text-sm">
              {scorecard.feedback}
            </p>
          </div>

          <button 
            onClick={closeInterview}
            className="w-full py-4 bg-white text-black rounded-xl font-semibold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle size={20} />
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-neutral-950 flex flex-col font-sans">
      {/* Header */}
      <header className="h-20 border-b border-neutral-800 flex items-center justify-between px-8 bg-neutral-950/80 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
              <Briefcase className="text-blue-400" size={24} />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-neutral-950"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">JARVIS</h1>
            <p className="text-sm text-neutral-400">Technical Interviewer</p>
          </div>
        </div>
        <button 
          onClick={closeInterview} 
          className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-all"
        >
          <X size={24} />
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
          {messages.map((msg, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-2xl px-6 py-4 text-sm md:text-base shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-neutral-800 text-neutral-200 border border-neutral-700/50 rounded-bl-none'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-neutral-800 border border-neutral-700/50 rounded-2xl rounded-bl-none px-6 py-4 flex gap-2 items-center">
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-4 md:p-8 bg-neutral-950 border-t border-neutral-900">
        <div className="max-w-4xl mx-auto relative">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your response to JARVIS..."
            className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl pl-5 pr-16 py-4 focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-none min-h-[56px] max-h-[200px] text-sm md:text-base"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-2 bottom-2 p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="text-center mt-3 text-xs text-neutral-600">
          Press Enter to send, Shift + Enter for new line.
        </div>
      </footer>
    </div>
  );
}
