import { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, Copy, Sparkles, ExternalLink } from "lucide-react";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RawInputFormProps {
  onAnalyze: (rawInput: string) => void;
  isLoading: boolean;
}

const SCOPES = [
  { id: "student-details", label: "Student Details Profile" },
  { id: "backlog-clearance", label: "Backlog / Summer Term Transcript" },
  { id: "semester-1", label: "Semester 1 Transcript" },
  { id: "semester-2", label: "Semester 2 Transcript" },
  { id: "semester-3", label: "Semester 3 Transcript" },
  { id: "semester-4", label: "Semester 4 Transcript" },
  { id: "semester-5", label: "Semester 5 Transcript" },
  { id: "semester-6", label: "Semester 6 Transcript" },
  { id: "semester-7", label: "Semester 7 Transcript" },
  { id: "semester-8", label: "Semester 8 Transcript" },
];

const AI_TOOLS = [
  { id: "chatgpt", name: "ChatGPT", url: "https://chatgpt.com", color: "bg-[#10a37f]/10 text-[#10a37f] border-[#10a37f]/20 hover:bg-[#10a37f]/20" },
  { id: "claude", name: "Claude", url: "https://claude.ai", color: "bg-[#d97757]/10 text-[#d97757] border-[#d97757]/20 hover:bg-[#d97757]/20" },
  { id: "gemini", name: "Gemini", url: "https://gemini.google.com", color: "bg-[#4285f4]/10 text-[#4285f4] border-[#4285f4]/20 hover:bg-[#4285f4]/20" },
];

export function RawInputForm({ onAnalyze, isLoading }: RawInputFormProps) {
  const [inputText, setInputText] = useState("");
  const [targetScope, setTargetScope] = useState(SCOPES[0].id);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onAnalyze(inputText);
  };

  const getTemplateForScope = (scopeId: string) => {
    if (scopeId === "student-details") {
      return JSON.stringify({
        studentProfile: {
          fullName: "YOUR NAME",
          registrationId: "REG_ID",
          academicDetails: {
            programme: "e.g., B.Tech (Computer Science...)",
            department: "e.g., Department Of...",
            batchYear: 2024,
            currentYear: "2nd Year",
            currentTerm: "4th Semester"
          }
        }
      }, null, 2);
    }
    
    if (scopeId === "backlog-clearance") {
      return JSON.stringify([
        {
          academicTerm: { level: "Backlog Clearance", term: "e.g., July 2025 Summer Term" },
          isBacklogClearance: true,
          performance: { majorSGPA: 0.00 },
          courses: [
            { courseCode: "SUB101", courseName: "Subject Name", credits: 4, grade: "O" }
          ]
        }
      ], null, 2);
    }
    
    const semIndex = parseInt(scopeId.split("-")[1]) || 1;
    return JSON.stringify([
      {
        academicTerm: { level: `Semester ${semIndex}`, term: "e.g., November / December 2024" },
        semesterIndex: semIndex,
        performance: { majorSGPA: 0.00 },
        courses: [
          { courseCode: "SUB101", courseName: "Subject Name", credits: 4, grade: "A+" }
        ]
      }
    ], null, 2);
  };

  const handleScopeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTargetScope(e.target.value);
    setCopiedPrompt(false);
  };

  const generateAIPrompt = () => {
    const template = getTemplateForScope(targetScope);
    const instruction = targetScope === "student-details" 
      ? "Extract the student profile details from the provided image/document. Pay close attention to extract the exact Programme name, Department name, and Batch Year. Return them strictly in the following JSON format. Do not use any markdown formatting or explanation text."
      : targetScope === "backlog-clearance"
      ? "Extract the SGPA (if available), courses, and grades from the provided Backlog/Summer Term transcript image. Since this is a backlog clearance, set the `isBacklogClearance` flag to true. Make sure to accurately extract the course codes and the new passing grades. Return the data strictly in the following JSON format. Do not use any markdown formatting or explanation text."
      : "Extract the SGPA, courses, and grades from the provided transcript image/document. Make sure to accurately extract the SGPA and place it in the `performance.majorSGPA` field. Return the data strictly in the following JSON format. Do not use any markdown formatting or explanation text.";
    
    return `${instruction}\n\n${template}`;
  };

  const handleCopyPromptOnly = async () => {
    const prompt = generateAIPrompt();
    
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 3000);
    } catch (err) {
      console.error("Clipboard API failed:", err);
      // Fallback synchronous copy
      const textArea = document.createElement("textarea");
      textArea.value = prompt;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        setCopiedPrompt(true);
        setTimeout(() => setCopiedPrompt(false), 3000);
      } catch (e) {
        console.error("Fallback failed", e);
      }
      document.body.removeChild(textArea);
    }
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      alert("MVP Note: Native Image/PDF parsing is disabled. Please use the AI Extraction Workflow below.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) setInputText(content);
    };
    reader.readAsText(file);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* 1. Drag & Drop Bento Card */}
      <Card variant="default" padding="lg" className="flex flex-col h-full relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-[80px]" />
        
        <div className="relative z-10 flex flex-col h-full justify-between space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground tracking-tight mb-2">JSON Import</h2>
            <p className="text-foreground-muted text-sm font-medium">
              Directly upload your backend output files for instant syncing.
            </p>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileInput}
            accept=".json,.txt"
          />

          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full flex-1 min-h-[160px] border rounded-[20px] flex flex-col items-center justify-center transition-all cursor-pointer relative group ${isDragging ? 'border-brand/50 bg-brand/10 text-brand' : 'border-white/[0.08] bg-white/[0.02] hover:border-brand/30 hover:bg-white/[0.04] text-foreground-muted'}`}
          >
             <UploadCloud size={32} className={`mb-3 transition-colors ${isDragging ? 'text-brand' : 'text-white/30 group-hover:text-brand'}`} />
             <span className="font-bold text-foreground/70 tracking-tight">Drag & Drop Files</span>
             <span className="text-xs mt-1 font-medium text-foreground-muted/60">or click to browse</span>
          </div>
        </div>
      </Card>

      {/* 2. AI Extraction Bento Card */}
      <Card variant="default" padding="lg" className="flex flex-col h-full space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight mb-2 flex items-center gap-3">
            <Sparkles size={24} className="text-brand"/> AI Extraction
          </h2>
          <p className="text-foreground-muted text-sm font-medium">
            Turn any screenshot or PDF into structured backend data using LLMs.
          </p>
        </div>
        
        <div className="flex flex-col space-y-5 flex-1 justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <Select 
                label="1. Target Scope"
                value={targetScope}
                onChange={(val) => { setTargetScope(val); setCopiedPrompt(false); }}
                options={SCOPES.map(s => ({ value: s.id, label: s.label }))}
              />
            </div>

            <div className="flex-1 w-full">
              <span className="text-[12px] leading-[16px] font-semibold text-foreground-muted uppercase tracking-wider block mb-2">2. Copy Prompt</span>
              <Button 
                type="button"
                variant={copiedPrompt ? "primary" : "secondary"}
                className="w-full"
                onClick={handleCopyPromptOnly}
              >
                {copiedPrompt ? <CheckCircle2 size={16} className="mr-2" /> : <Copy size={16} className="mr-2" />}
                {copiedPrompt ? "Copied!" : "Copy Prompt"}
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            {AI_TOOLS.map(tool => (
              <a 
                key={tool.id}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.06] rounded-xl transition-all text-[11px] font-bold text-white/60 hover:text-white cursor-pointer`}
              >
                {tool.name} <ExternalLink size={10} className="opacity-50" />
              </a>
            ))}
          </div>

          <div className="flex-1 pt-2">
            <Input
              label="3. Paste JSON Result"
              multiline
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              placeholder={'{\n  "semesterIndex": 4,\n  "courses": [...]\n}'}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full text-[15px]"
              disabled={isLoading || !inputText.trim()}
              loading={isLoading}
            >
              <UploadCloud size={20} className="mr-2" />
              Analyze Data
            </Button>
          </div>
        </div>
      </Card>
    </form>
  );
}
