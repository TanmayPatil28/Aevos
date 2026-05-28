"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, GitBranch, ChevronDown, Wand2, Copy, CheckCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import { useUSMStore } from "@/stores/usmStore";

interface ProfileProps {
  currentCgpa?: number;
  targetCgpa?: number;
  completedSemesters?: number;
  remainingSemesters?: number;
  result?: any;
  preset?: any;
}

export default function ProfileOptimizerModule(props: ProfileProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const { identity, academic, career, currentCgpa, targetCgpa } = useUSMStore(s => ({
    identity: s.identity,
    academic: s.academic,
    career: s.career,
    currentCgpa: props.currentCgpa || s.academic.currentCgpa,
    targetCgpa: props.targetCgpa || 8.5
  }));

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const name = identity.studentIdentity?.name || "[Your Name]";
  const university = identity.institution || "[University]";
  const role = career.targetRole || "Software Engineer";
  const techStack = career.skills.length > 0 ? career.skills.join(", ") : "C++, JavaScript/TypeScript, React, Node.js";

  const linkedinHeadline = `CS Student @ ${university} | Aspiring ${role} | Exploring Tech & DSA | Building Next-Gen Apps`;
  const linkedinAbout = `Hi, I'm ${name}, a passionate Computer Science student deeply interested in solving complex problems. Currently, I'm honing my skills and building scalable applications to prepare for a role as a ${role}. I thrive in environments where I can learn rapidly and contribute to meaningful projects.\n\nTech Stack: ${techStack}\nLet's connect!`;
  const githubReadme = `# Hi there, I'm ${name} 👋\n\nI'm a Computer Science student at ${university} passionate about building scalable software and exploring new technologies, aiming to become a ${role}.\n\n## 🛠️ Tech Stack\n- **Skills**: ${techStack}\n\n## 📈 GitHub Stats\n![Your GitHub stats](https://github-readme-stats.vercel.app/api?username=YOUR_USERNAME&show_icons=true&theme=radical)\n\n## 📫 How to reach me\n- LinkedIn: [Your Profile](https://linkedin.com/in/yourprofile)\n- Email: your.email@example.com`;

  return (
    <Card className="relative overflow-hidden border border-white/10" padding="xl">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-slate-500/5 opacity-50" />
      
      <div className="relative z-10 space-y-6">
        <div 
          className="flex items-center justify-between cursor-pointer group"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-500/20 flex items-center justify-center border border-slate-500/20 group-hover:scale-105 transition-transform">
              <Wand2 className="text-slate-400" />
            </div>
            <div>
              <h3 className="font-headline text-xl font-black text-white">Brand Optimizer</h3>
              <p className="text-on-surface-variant text-sm">LinkedIn & GitHub profile generators.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500/20 text-blue-400 border border-blue-500/20 hidden md:block">
              AI Templates
            </span>
            <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
              <ChevronDown className="text-white/50" />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-6 border-t border-white/5 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* LinkedIn Section */}
                  <div className="space-y-4 p-5 rounded-2xl bg-[#0077b5]/10 border border-[#0077b5]/20">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Globe size={18} className="text-[#0077b5]" /> LinkedIn Templates
                    </h4>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#0077b5]/70">Headline Generator</span>
                          <button onClick={() => handleCopy(linkedinHeadline, 'headline')} className="text-[#0077b5] hover:text-[#0077b5]/80 transition-colors">
                            {copiedSection === 'headline' ? <CheckCircle size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                        <div className="p-3 rounded-lg bg-black/40 border border-[#0077b5]/20 text-xs text-white/80 font-mono leading-relaxed">
                          {linkedinHeadline}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#0077b5]/70">About Section Generator</span>
                          <button onClick={() => handleCopy(linkedinAbout, 'about')} className="text-[#0077b5] hover:text-[#0077b5]/80 transition-colors">
                            {copiedSection === 'about' ? <CheckCircle size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                        <div className="p-3 rounded-lg bg-black/40 border border-[#0077b5]/20 text-xs text-white/80 font-mono leading-relaxed whitespace-pre-wrap">
                          {linkedinAbout}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* GitHub Section */}
                  <div className="space-y-4 p-5 rounded-2xl bg-white/5 border border-white/10">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <GitBranch size={18} /> GitHub Profile README
                    </h4>
                    
                    <div className="space-y-3 h-full">
                      <div className="h-full flex flex-col">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Markdown Generator</span>
                          <button onClick={() => handleCopy(githubReadme, 'github')} className="text-white/50 hover:text-white/80 transition-colors">
                            {copiedSection === 'github' ? <CheckCircle size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                        <div className="p-3 rounded-lg bg-black/40 border border-white/10 text-xs text-white/80 font-mono leading-relaxed whitespace-pre-wrap flex-1 overflow-y-auto max-h-[200px]">
                          {githubReadme}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
