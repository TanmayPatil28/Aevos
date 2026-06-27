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
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const identity = useUSMStore(s => s.identity);
  const academic = useUSMStore(s => s.academic);
  const career = useUSMStore(s => s.career);
  const currentCgpa = props.currentCgpa || academic.currentCgpa;
  const targetCgpa = props.targetCgpa || 8.5;

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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full h-fit">

      {/* LinkedIn */}
      <div className="col-span-1 lg:col-span-6 flex flex-col h-fit gap-6">
        <div className="flex flex-col h-fit">
          <h4 className="text-sm font-bold uppercase tracking-wider text-[#0077b5] flex items-center gap-2 mb-4 shrink-0">
            <Globe size={16} /> LinkedIn Templates
          </h4>
          
          <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#0077b5]/70">Headline Generator</span>
                <button onClick={() => handleCopy(linkedinHeadline, 'headline')} className="text-[#0077b5] hover:text-[#0077b5]/80 transition-colors">
                  {copiedSection === 'headline' ? <CheckCircle size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <div className="p-4 rounded-card-large bg-white/5 text-xs text-white/80 font-mono leading-relaxed">
                {linkedinHeadline}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#0077b5]/70">About Section Generator</span>
                <button onClick={() => handleCopy(linkedinAbout, 'about')} className="text-[#0077b5] hover:text-[#0077b5]/80 transition-colors">
                  {copiedSection === 'about' ? <CheckCircle size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <div className="p-4 rounded-card-large bg-white/5 text-xs text-white/80 font-mono leading-relaxed whitespace-pre-wrap">
                {linkedinAbout}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GitHub */}
      <div className="col-span-1 lg:col-span-6 flex flex-col h-fit gap-6">
        <div className="flex flex-col h-fit">
          <h4 className="text-sm font-bold uppercase tracking-wider text-white/50 flex items-center gap-2 mb-4 shrink-0">
            <GitBranch size={16} /> GitHub Profile README
          </h4>
          
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Markdown Generator</span>
              <button onClick={() => handleCopy(githubReadme, 'github')} className="text-white/50 hover:text-white/80 transition-colors">
                {copiedSection === 'github' ? <CheckCircle size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <div className="p-4 rounded-card-large bg-white/5 text-xs text-white/80 font-mono leading-relaxed whitespace-pre-wrap flex-1 overflow-y-auto custom-scrollbar">
              {githubReadme}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
