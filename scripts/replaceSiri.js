const fs = require('fs');

const path = 'c:\\Users\\Tanmay\\OneDrive\\Desktop\\GradeFlow\\gradeflow\\components\\dynamic-island\\LiveActivities.tsx';
let content = fs.readFileSync(path, 'utf8');

// Insert import at the top
if (!content.includes("useChat")) {
  content = content.replace('"use client";', '"use client";\nimport { useChat } from "@ai-sdk/react";');
}

const lines = content.split('\n');
const startIdx = lines.findIndex(l => l.includes('export function SiriTopHalfActivity() {'));
let endIdx = -1;

if (startIdx !== -1) {
  let braceCount = 0;
  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    for (const char of line) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
    }
    if (braceCount === 0 && i > startIdx) {
      endIdx = i;
      break;
    }
  }
}

if (startIdx !== -1 && endIdx !== -1) {
  const newFunction = `export function SiriTopHalfActivity() {
  const setIsAIActive = useDynamicIslandStore((s) => s.setIsAIActive);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/jarvis/mcp',
  });

  const onClose = () => {
    setIsAIActive(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <motion.div className="w-full flex flex-col p-6 gap-4 relative min-h-[40vh] bg-black/95 font-mono overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center justify-between z-10 w-full border-b border-green-500/30 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
          <span className="text-green-500 font-bold text-sm tracking-[0.2em] uppercase">Jarvis OS // Command Center</span>
        </div>
        <div className="w-12 h-1.5 rounded-full bg-green-500/30 hover:bg-green-500/80 transition-colors cursor-pointer" onClick={onClose} />
      </div>

      {/* Terminal Output Area */}
      <div className="flex-1 overflow-y-auto z-10 flex flex-col gap-3 max-h-[45vh] pr-2 custom-scrollbar">
        {messages.map((m) => (
          <div key={m.id} className="text-sm tracking-wide">
            {m.role === 'user' && (
              <div className="text-blue-400">
                <span className="opacity-50">guest@gradeflow:~$ </span>
                {m.content}
              </div>
            )}
            {m.role === 'assistant' && (
              <div className="text-green-400 mt-1">
                {m.content && <div className="leading-relaxed whitespace-pre-wrap">{m.content}</div>}
                {m.toolInvocations?.map((toolInvocation) => (
                  <div key={toolInvocation.toolCallId} className="text-yellow-400/90 ml-4 mt-2 border-l-2 border-yellow-500/30 pl-3 bg-yellow-500/5 py-2 rounded-r">
                    <div className="font-bold flex items-center gap-2">
                      <span className="animate-spin text-xs">⚙</span> 
                      EXECUTING [{toolInvocation.toolName}]...
                    </div>
                    <div className="opacity-60 text-xs mt-1 break-all bg-black/50 p-2 rounded">
                      {JSON.stringify(toolInvocation.args)}
                    </div>
                    {toolInvocation.state === 'result' && (
                      <div className="text-green-400 font-bold mt-2 flex items-center gap-2">
                        <span>✓</span> SUCCESS
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="text-green-500 font-bold animate-pulse mt-2 flex items-center gap-2">
             <span>_</span>
             <span className="text-xs opacity-50 tracking-widest">AWAITING SYSTEM RESPONSE</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="relative z-10 flex items-center bg-black border border-green-500/30 rounded-lg px-4 py-3 focus-within:border-green-500 focus-within:shadow-[0_0_20px_rgba(34,197,94,0.15)] transition-all">
        <span className="text-green-500 mr-3 font-bold">{">"}</span>
        <input 
          autoFocus
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Enter command directive..." 
          className="bg-transparent border-none outline-none text-green-500 text-[15px] w-full font-mono placeholder-green-500/30 disabled:opacity-50"
        />
      </form>
    </motion.div>
  );
}`;
  
  lines.splice(startIdx, endIdx - startIdx + 1, newFunction);
  fs.writeFileSync(path, lines.join('\n'));
  console.log("Successfully replaced SiriTopHalfActivity");
} else {
  console.log("Could not find start or end index");
}
