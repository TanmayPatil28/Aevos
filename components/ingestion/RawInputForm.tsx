import { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, AlertTriangle, Sparkles, Copy, ChevronDown, ExternalLink } from "lucide-react";

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
    <div className="bg-[#000000] border border-slate-800 rounded-xl p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px]" />
      
      <div className="relative z-10 flex flex-col space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Ingest Academic Data</h2>
          <p className="text-slate-400">
            Upload your transcript files or use our AI Extraction Workflow.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
          
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
            className={`w-full h-28 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-slate-400 transition-colors cursor-pointer relative group ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-blue-500 hover:bg-blue-500/5'}`}
          >
             <UploadCloud size={28} className={`mb-2 transition-colors ${isDragging ? 'text-blue-400' : 'text-slate-500 group-hover:text-blue-400'}`} />
             <span className="font-semibold text-slate-300">Drag & Drop JSON/Text Files</span>
             <span className="text-sm mt-1">or click to browse</span>
          </div>

          <div className="flex items-center gap-4">
             <div className="h-px bg-slate-800 flex-1"></div>
             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">OR USE AI EXTRACTION</span>
             <div className="h-px bg-slate-800 flex-1"></div>
          </div>

          {/* AI Workflow Section */}
          <div className="flex flex-col space-y-5 bg-[#000000]/80 border border-slate-700/80 p-6 rounded-xl shadow-inner">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={16} className="text-purple-400"/> AI Extraction Workflow
            </h3>
            
            <div className="flex flex-col md:flex-row gap-6">
              
              {/* Step 1 */}
              <div className="flex-1 space-y-3">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">1. Select Target Scope</label>
                <div className="relative group">
                  <select 
                    value={targetScope}
                    onChange={handleScopeChange}
                    className="w-full appearance-none bg-[#000000] border border-slate-700 text-slate-200 py-3 pl-4 pr-10 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all hover:border-slate-600 cursor-pointer"
                  >
                    {SCOPES.map(scope => (
                      <option key={scope.id} value={scope.id} className="bg-[#000000] text-slate-200">{scope.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-slate-300 pointer-events-none transition-colors" />
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex-[2] space-y-3">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center justify-between">
                  <span>2. Copy Prompt & Open AI</span>
                </label>
                
                <div className="flex flex-col space-y-3">
                  <button 
                    type="button"
                    onClick={handleCopyPromptOnly}
                    className={`flex items-center justify-center gap-2 py-3 px-4 border rounded-lg transition-all text-sm font-bold shadow-sm hover:shadow-md cursor-pointer ${copiedPrompt ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30'}`}
                  >
                    {copiedPrompt ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                    {copiedPrompt ? "Prompt Copied Successfully!" : "Copy AI Prompt"}
                  </button>

                  <div className="flex flex-wrap md:flex-nowrap gap-2">
                    {AI_TOOLS.map(tool => (
                      <a 
                        key={tool.id}
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border rounded-md transition-all text-xs font-semibold shadow-sm hover:shadow-md cursor-pointer ${tool.color}`}
                      >
                        {tool.name} <ExternalLink size={12} className="opacity-70" />
                      </a>
                    ))}
                  </div>
                </div>
                
                <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                  Click <strong className="text-slate-400">Copy AI Prompt</strong> first, then launch an assistant and paste it along with a screenshot of your transcript!
                </p>
              </div>

            </div>

            {/* Step 3 */}
            <div className="pt-2 border-t border-slate-800/50 space-y-3 mt-2">
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">3. Paste JSON Result</label>
              <textarea
                className="w-full h-40 bg-[#000000] border border-slate-700/80 rounded-lg p-4 text-emerald-400/90 font-mono text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600 shadow-inner resize-y"
                placeholder={'{\n  "semesterIndex": 4,\n  "courses": [...]\n}\n\nPaste the AI generated JSON here...'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isLoading}
              />
            </div>

          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <CheckCircle2 size={16} className="text-emerald-500/80" />
              <span>Secure & deterministic extraction</span>
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center space-x-2 transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing Data...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={20} />
                  <span>Analyze Data</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
