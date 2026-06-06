"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCompletion } from "@ai-sdk/react";
import DecisionNode from "./DecisionNode";
import ProUpgradeModal from "./ProUpgradeModal";
import { StudentState } from "@/lib/forecasting/decisionTypes";
import { initialDecisionNodes } from "@/lib/forecasting/scenarioData";
import { decisionEngine } from "@/lib/forecasting/decisionEngine";
import { cn } from "@/lib/cn";
import { Sparkles } from "lucide-react";

interface NeuralDecisionTreeProps {
  initialState: StudentState;
  onStateChange: (newState: StudentState) => void;
}

export default function NeuralDecisionTree({ initialState, onStateChange }: NeuralDecisionTreeProps) {
  const [path, setPath] = useState<string[]>(["start"]);
  const [stateHistory, setStateHistory] = useState<StudentState[]>([initialState]);
  const [activeNarratives, setActiveNarratives] = useState<Record<string, string>>({});
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { complete, completion, isLoading } = useCompletion({
    api: "/api/narrative",
  });

  // Auto-scroll to bottom when path changes or when completion streams
  useEffect(() => {
    if (bottomRef.current) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 100);
    }
  }, [path, completion]);

  const handleNodeClick = async (nodeId: string) => {
    if (isLoading) return; // Prevent clicking while simulating

    // Premium check
    const targetNodeToCheck = initialDecisionNodes[nodeId];
    if (targetNodeToCheck?.isPremium && !path.includes(nodeId)) {
      setIsProModalOpen(true);
      return; // Do not advance the tree
    }

    // Rewinding
    const existingIndex = path.indexOf(nodeId);
    if (existingIndex !== -1) {
      const newPath = path.slice(0, existingIndex + 1);
      const newStateHistory = stateHistory.slice(0, existingIndex + 1);
      setPath(newPath);
      setStateHistory(newStateHistory);
      onStateChange(newStateHistory[newStateHistory.length - 1]);
      return;
    }

    // Making a new choice
    const currentNodeId = path[path.length - 1];
    const currentNode = initialDecisionNodes[currentNodeId];
    
    if (currentNode.nextOptions.includes(nodeId)) {
      const targetNode = initialDecisionNodes[nodeId];
      const currentState = stateHistory[stateHistory.length - 1];
      const newState = decisionEngine.applyDecision(currentState, targetNode);
      
      // Update tree state immediately so it scrolls
      setPath([...path, nodeId]);
      setStateHistory([...stateHistory, newState]);
      onStateChange(newState);

      // Trigger AI narrative generation
      const result = await complete(targetNode.title);
      if (result) {
        setActiveNarratives(prev => ({ ...prev, [nodeId]: result }));
      }
    }
  };

  return (
    <div className="w-full max-w-4xl flex flex-col items-center">
      {path.map((nodeId, index) => {
        const node = initialDecisionNodes[nodeId];
        const isLatestInPath = index === path.length - 1;
        const options = node.nextOptions.map(optId => initialDecisionNodes[optId]).filter(Boolean);
        
        // Is this node currently generating its narrative?
        const isGenerating = isLatestInPath && isLoading;
        // Has it finished generating and has a stored narrative?
        const finishedNarrative = activeNarratives[nodeId];
        // The text to display (either streaming or finished)
        const narrativeText = isGenerating ? completion : finishedNarrative;

        // Show options if we are the latest, AND we are NOT generating
        const showOptions = isLatestInPath && !isGenerating && options.length > 0;

        return (
          <div key={`section-${nodeId}`} className="w-full flex flex-col items-center relative">
            
            {/* The Active Node */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="z-10 relative my-4"
            >
              <DecisionNode
                node={node}
                isActive={true}
                isAvailable={!isLoading}
                onClick={handleNodeClick}
              />
            </motion.div>

            {/* Connecting Vertical Line (only if there are options or if it's not the end) */}
            {(options.length > 0 || index < path.length - 1) && (
              <div className="w-px h-12 bg-primary/40 shadow-[0_0_15px_rgba(10,132,255,0.6)] relative z-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-full bg-primary/10 blur-md" />
              </div>
            )}

            {/* AI Narrative Streaming Box */}
            <AnimatePresence>
              {(isGenerating || finishedNarrative) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="w-full max-w-lg mb-8 relative"
                >
                  <div className="p-5 rounded-2xl bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden">
                    {/* Glowing AI pulse effect when generating */}
                    {isGenerating && (
                      <motion.div 
                        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      />
                    )}
                    
                    <div className="flex gap-3">
                      <Sparkles size={16} className={cn("mt-0.5", isGenerating ? "text-primary animate-pulse" : "text-white/40")} />
                      <p className="text-sm text-white/80 leading-relaxed font-medium">
                        {narrativeText}
                        {isGenerating && <span className="ml-1 inline-block w-1.5 h-4 bg-primary animate-pulse align-middle" />}
                      </p>
                    </div>
                  </div>
                  
                  {/* Connecting line to the next options */}
                  {showOptions && (
                    <div className="w-px h-12 bg-primary/40 shadow-[0_0_15px_rgba(10,132,255,0.6)] absolute -bottom-12 left-1/2 -translate-x-1/2 z-0" />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* The Choices Spawning Below (only visible for the latest active node AFTER generating) */}
            <AnimatePresence>
              {showOptions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="flex gap-8 justify-center relative mt-4 mb-24 w-full px-8"
                >
                  {/* Top horizontal branch lines for choices */}
                  <div className="absolute -top-4 left-[15%] right-[15%] h-px bg-white/20" />
                  
                  {options.map((opt) => (
                    <div key={`choice-${opt.id}`} className="relative flex flex-col items-center pt-8">
                      {/* Connecting line to horizontal bar */}
                      <div className="absolute top-[-1rem] left-1/2 w-px h-8 bg-white/20 -translate-x-1/2" />
                      
                      <DecisionNode
                        node={opt}
                        isActive={false}
                        isAvailable={true}
                        onClick={handleNodeClick}
                      />
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Auto-scroll anchor */}
            {isLatestInPath && <div ref={bottomRef} className="h-32" />}
          </div>
        );
      })}

      {/* Premium Upgrade Modal */}
      <ProUpgradeModal 
        isOpen={isProModalOpen} 
        onClose={() => setIsProModalOpen(false)} 
      />
    </div>
  );
}
