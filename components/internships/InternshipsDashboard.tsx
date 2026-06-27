"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { PageHero } from "@/components/ui/PageHero";
import { Filter, Sparkles, Briefcase, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { useUSMStore } from "@/stores/usmStore";
import AgentTerminal from "@/components/internships/AgentTerminal";
import { MagneticWrapper } from "@/components/ui/MagneticWrapper";
import Card from "@/components/ui/Card";
import { Input } from "@/components/ui/input";

import InternshipLedgerRow, { InternshipMatch } from "./InternshipLedgerRow";
import InternshipIntelligenceGuide from "./InternshipIntelligenceGuide";
import CareerOSHeader from "@/components/placement/CareerOSHeader";

interface InternshipsDashboardProps {
  matches: InternshipMatch[];
  isLoading?: boolean;
}

export default function InternshipsDashboard({ matches, isLoading }: InternshipsDashboardProps) {
  const [selectedMatch, setSelectedMatch] = useState<InternshipMatch | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"All" | "High Match" | "Moderate">("All");

  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [hiddenGems, setHiddenGems] = useState<InternshipMatch[]>([]);
  const [showTerminal, setShowTerminal] = useState(false);

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

  if (isLoading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-[#0a84ff] animate-spin" />
        <span className="text-foreground/60 text-sm font-medium tracking-tight">Curating AI Internships...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column */}
                <div className="lg:col-span-5 flex flex-col">
                  
                  {/* Agent Deep Dive Trigger */}
                  <div className="mb-6">
                    <Card variant="default" className="flex flex-col md:flex-row items-center justify-between !p-3 !pl-5 transition-all !border-[#ffd60a]/20 shadow-[0_0_20px_rgba(255,214,10,0.05)]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#ffd60a]/10 flex items-center justify-center shrink-0">
                          <Zap size={16} className="text-[#ffd60a] fill-[#ffd60a]" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-bold text-foreground tracking-tight leading-tight">Deep Dive Agent</span>
                          <span className="text-[11px] text-foreground-muted uppercase tracking-wider font-semibold">Scrapes hidden startup boards</span>
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
                    </Card>
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
                      <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
                        <Briefcase size={24} className="text-[#0a84ff]" /> AI Matched Roles
                      </h2>
                    </div>

                    <div className="mb-4 flex flex-col gap-4 relative z-20">
                      <Input
                        variant="search"
                        placeholder="Search roles or companies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />

                      <div 
                        className="flex items-center gap-2 overflow-x-auto pb-4 -mb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full"
                        style={{ WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)', maskImage: 'linear-gradient(to right, black 85%, transparent 100%)' }}
                        role="tablist"
                      >
                        {["All", "High Match", "Moderate"].map((f) => (
                          <motion.button
                            key={f}
                            onClick={() => setActiveFilter(f as any)}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                              "relative flex items-center justify-center h-10 px-4 text-sm leading-[20px] font-medium rounded-full whitespace-nowrap border outline-none transition-colors duration-300 before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:min-w-[44px] before:min-h-[44px] before:content-['']",
                              activeFilter === f 
                                ? "text-black border-transparent" 
                                : "backdrop-blur-md bg-white/[0.08] border-white/[0.08] text-foreground hover:bg-white/[0.12] active:bg-white/[0.16]"
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
                        <Card variant="accent" className="flex flex-col !p-0 border-[#ffd60a]/20 bg-gradient-to-br from-[#ffd60a]/10 to-surface shadow-[0_0_30px_rgba(255,214,10,0.05)]">
                          {hiddenGems.map((match, i) => (
                            <InternshipLedgerRow 
                              key={`gem-${i}`} 
                              match={match} 
                              isSelected={selectedMatch?.url === match.url} 
                              onSelect={setSelectedMatch}
                              isLast={i === hiddenGems.length - 1} 
                            />
                          ))}
                        </Card>
                      </div>
                    )}

                    {matches.length === 0 ? (
                      <Card variant="default" className="text-center">
                        <p className="text-foreground-muted text-[14px]">No internships matched your profile at this time.</p>
                      </Card>
                    ) : (
                      <>
                        {/* High Matches */}
                        {highMatches.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="text-[13px] font-semibold text-foreground-muted uppercase tracking-wider pl-4">Strong Match ({highMatches.length})</h3>
                            <Card variant="default" className="flex flex-col !p-0">
                              {highMatches.map((match, i) => (
                                <InternshipLedgerRow 
                                  key={i} 
                                  match={match} 
                                  isSelected={selectedMatch?.url === match.url} 
                                  onSelect={setSelectedMatch}
                                  isLast={i === highMatches.length - 1} 
                                />
                              ))}
                            </Card>
                          </div>
                        )}

                        {/* Moderate Matches */}
                        {moderateMatches.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="text-[13px] font-semibold text-foreground-muted uppercase tracking-wider pl-4 mt-2">Moderate Match ({moderateMatches.length})</h3>
                            <Card variant="default" className="flex flex-col !p-0">
                              {moderateMatches.map((match, i) => (
                                <InternshipLedgerRow 
                                  key={i} 
                                  match={match} 
                                  isSelected={selectedMatch?.url === match.url} 
                                  onSelect={setSelectedMatch}
                                  isLast={i === moderateMatches.length - 1} 
                                />
                              ))}
                            </Card>
                          </div>
                        )}

                        {/* Reach Matches */}
                        {reachMatches.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="text-[13px] font-semibold text-foreground-muted uppercase tracking-wider pl-4 mt-2">Reach ({reachMatches.length})</h3>
                            <Card variant="default" className="flex flex-col !p-0">
                              {reachMatches.map((match, i) => (
                                <InternshipLedgerRow 
                                  key={i} 
                                  match={match} 
                                  isSelected={selectedMatch?.url === match.url} 
                                  onSelect={setSelectedMatch}
                                  isLast={i === reachMatches.length - 1} 
                                />
                              ))}
                            </Card>
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
  );
}
