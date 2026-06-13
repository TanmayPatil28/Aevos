"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { PageHero } from "@/components/ui/PageHero";
import { Filter, Sparkles, Briefcase, Zap } from "lucide-react";
import { cn } from "@/lib/cn";
import { useUSMStore } from "@/stores/usmStore";
import AgentTerminal from "@/components/internships/AgentTerminal";
import { MagneticWrapper } from "@/components/ui/MagneticWrapper";

import InternshipLedgerRow, { InternshipMatch } from "./InternshipLedgerRow";
import InternshipIntelligenceGuide from "./InternshipIntelligenceGuide";

interface InternshipsDashboardProps {
  matches: InternshipMatch[];
}

export default function InternshipsDashboard({ matches }: InternshipsDashboardProps) {
  const [selectedMatch, setSelectedMatch] = useState<InternshipMatch | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"All" | "High Match" | "Moderate">("All");

  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [hiddenGems, setHiddenGems] = useState<InternshipMatch[]>([]);
  const [showTerminal, setShowTerminal] = useState(false);

  const { scrollY } = useScroll();
  const glowY = useTransform(scrollY, [0, 500], [0, 150]);
  const glowOpacity = useTransform(scrollY, [0, 300], [0.8, 0]);

  const userSkills = useUSMStore((state) => state.career.skills) || [];

  // Filter matches
  let processedMatches = matches.filter(m => {
    if (activeFilter === "High Match" && m.score < 80) return false;
    if (activeFilter === "Moderate" && (m.score >= 80 || m.score < 50)) return false;
    if (searchQuery.trim() !== "" && !m.title.toLowerCase().includes(searchQuery.toLowerCase()) && !m.company.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Sort by score
  processedMatches.sort((a, b) => b.score - a.score);

  const highMatches = processedMatches.filter(m => m.score >= 80);
  const moderateMatches = processedMatches.filter(m => m.score >= 50 && m.score < 80);
  const reachMatches = processedMatches.filter(m => m.score < 50);

  return (
    <div className="w-full relative min-h-screen bg-black overflow-x-hidden selection:bg-[#0a84ff]/30 selection:text-white pb-40 font-sans">
      
      {/* Background Ambient Glows */}
      <motion.div 
        style={{ y: glowY, opacity: glowOpacity }}
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] pointer-events-none z-0"
      >
        <div className={cn("absolute inset-0 blur-[160px] rounded-full mix-blend-screen transition-colors duration-1000", "bg-gradient-to-b from-white/[0.02] via-transparent to-transparent")} />
      </motion.div>

      {/* Hero Section */}
      <section className="relative z-10 w-full flex flex-col items-start justify-center pt-36 pb-8 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="w-full max-w-2xl flex flex-col items-start text-left">
          <PageHero 
            headline={<motion.span 
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(to right, #a1a1aa, #ffffff, #a1a1aa)', backgroundSize: '200% auto', display: 'inline-block' }}
              animate={{ backgroundPosition: ['0% center', '200% center'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >Internship Intelligence.<br/>Curated by AI.</motion.span>}
            description="Our matchmaking engine analyzes your current academic profile and live tech stacks to surface the most optimal internship opportunities for you."
          />
        </div>
      </section>

      {/* Desktop Content Area */}
      <div className="relative z-10 w-full px-6 md:px-12 max-w-[1400px] mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            <div className="flex flex-col gap-10">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column */}
                <div className="lg:col-span-5 flex flex-col">
                  
                  {/* Agent Deep Dive Trigger */}
                  <div className="mb-6">
                    <div className="flex flex-col md:flex-row items-center justify-between p-3 pl-5 rounded-full bg-[#1c1c1e] border border-[#ffd60a]/20 shadow-[0_0_20px_rgba(255,214,10,0.05)] transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#ffd60a]/10 flex items-center justify-center shrink-0">
                          <Zap size={16} className="text-[#ffd60a] fill-[#ffd60a]" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-bold text-white tracking-tight leading-tight">Deep Dive Agent</span>
                          <span className="text-[11px] text-[#86868b] uppercase tracking-wider font-semibold">Scrapes hidden startup boards</span>
                        </div>
                      </div>
                      <MagneticWrapper strength={0.4}>
                        <button
                          onClick={async () => {
                            setShowTerminal(true);
                            setIsAgentRunning(true);
                            try {
                              const res = await fetch("/api/internships/agent", { method: "POST" });
                              const data = await res.json();
                              setHiddenGems(data.gems || []);
                            } catch (e) {
                              console.error(e);
                            }
                            setIsAgentRunning(false);
                          }}
                          disabled={isAgentRunning || hiddenGems.length > 0}
                          className="mt-3 md:mt-0 px-5 py-2 rounded-full bg-[#ffd60a] hover:bg-[#ffd60a]/90 text-black text-[13px] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
                        >
                          {isAgentRunning ? "Agent Searching..." : hiddenGems.length > 0 ? "Search Complete" : "Launch Agent"}
                        </button>
                      </MagneticWrapper>
                    </div>
                  </div>

                  {/* Terminal Display */}
                  <AnimatePresence>
                    {showTerminal && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 overflow-hidden"
                      >
                        <AgentTerminal />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Smart Filters and Utility Bar */}
                  <div className="flex flex-col gap-4 mb-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Briefcase size={24} className="text-[#0a84ff]" /> AI Matched Roles
                      </h2>
                    </div>

                    <div className="mb-4 flex flex-col gap-4 relative z-20">
                      <div className="relative w-full group">
                        <Filter size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors duration-300" />
                        <input 
                          type="text" 
                          placeholder="Search roles or companies..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-[#111111] border border-white/[0.1] hover:border-white/20 rounded-full py-2.5 pl-11 pr-5 text-[13px] text-white/90 placeholder:text-zinc-500/80 focus:outline-none focus:border-white/60 focus:bg-[#1A1A1A] focus:ring-[2px] focus:ring-white/10 transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                        />
                      </div>

                      <div 
                        className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full"
                        style={{ WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)', maskImage: 'linear-gradient(to right, black 85%, transparent 100%)' }}
                      >
                        {["All", "High Match", "Moderate"].map((f) => (
                          <motion.button
                            key={f}
                            onClick={() => setActiveFilter(f as any)}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                              "relative px-4 py-2 rounded-full text-[12px] font-medium transition-colors duration-300 whitespace-nowrap border outline-none",
                              activeFilter === f 
                                ? "text-black border-transparent" 
                                : "bg-[#111111] text-zinc-400 hover:text-white/90 hover:bg-[#1A1A1A] border-white/[0.04]"
                            )}
                          >
                            {activeFilter === f && (
                              <motion.div
                                layoutId="activeInternshipFilterBg"
                                className="absolute inset-0 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                                transition={{ type: "spring", stiffness: 500, damping: 35, mass: 1 }}
                              />
                            )}
                            <span className="relative z-10">{f}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Apple Style Unified List Cards */}
                  <div className="flex flex-col gap-6">
                    {/* VIP Hidden Gems Section */}
                    {hiddenGems.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-[13px] font-semibold text-[#ffd60a] uppercase tracking-wider pl-4 flex items-center gap-2">
                          <Sparkles size={14} className="fill-[#ffd60a]" /> VIP Hidden Gems
                        </h3>
                        <div className="flex flex-col rounded-[20px] bg-[#1c1c1e] overflow-hidden border border-[#ffd60a]/20 shadow-[0_0_30px_rgba(255,214,10,0.05)]">
                          {hiddenGems.map((match, i) => (
                            <InternshipLedgerRow 
                              key={`gem-${i}`} 
                              match={match} 
                              isSelected={selectedMatch?.url === match.url} 
                              onSelect={setSelectedMatch}
                              isLast={i === hiddenGems.length - 1} 
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {matches.length === 0 ? (
                      <div className="text-center py-12 rounded-[20px] bg-[#1c1c1e] border border-white/[0.05]">
                        <p className="text-[#86868b] text-[14px]">No internships matched your profile at this time.</p>
                      </div>
                    ) : (
                      <>
                        {/* High Matches */}
                        {highMatches.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="text-[13px] font-semibold text-[#86868b] uppercase tracking-wider pl-4">Strong Match ({highMatches.length})</h3>
                            <div className="flex flex-col rounded-[20px] bg-[#1c1c1e] overflow-hidden">
                              {highMatches.map((match, i) => (
                                <InternshipLedgerRow 
                                  key={i} 
                                  match={match} 
                                  isSelected={selectedMatch?.url === match.url} 
                                  onSelect={setSelectedMatch}
                                  isLast={i === highMatches.length - 1} 
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Moderate Matches */}
                        {moderateMatches.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="text-[13px] font-semibold text-[#86868b] uppercase tracking-wider pl-4 mt-2">Moderate Match ({moderateMatches.length})</h3>
                            <div className="flex flex-col rounded-[20px] bg-[#1c1c1e] overflow-hidden">
                              {moderateMatches.map((match, i) => (
                                <InternshipLedgerRow 
                                  key={i} 
                                  match={match} 
                                  isSelected={selectedMatch?.url === match.url} 
                                  onSelect={setSelectedMatch}
                                  isLast={i === moderateMatches.length - 1} 
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Reach Matches */}
                        {reachMatches.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="text-[13px] font-semibold text-[#86868b] uppercase tracking-wider pl-4 mt-2">Reach ({reachMatches.length})</h3>
                            <div className="flex flex-col rounded-[20px] bg-[#1c1c1e] overflow-hidden">
                              {reachMatches.map((match, i) => (
                                <InternshipLedgerRow 
                                  key={i} 
                                  match={match} 
                                  isSelected={selectedMatch?.url === match.url} 
                                  onSelect={setSelectedMatch}
                                  isLast={i === reachMatches.length - 1} 
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-7 flex flex-col gap-6 sticky top-32">
                  <InternshipIntelligenceGuide 
                    match={selectedMatch} 
                    userSkills={userSkills}
                  />
                </div>
                
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
