import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Bot, FileText, Loader2, Printer, Download, Plus, ArrowUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Document {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
}

interface DocumentReaderProps {
  document: Document | null;
  onClose: () => void;
}

export default function DocumentReader({ document: fileData, onClose }: DocumentReaderProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          documentFilterId: fileData?.id,
          documentContext: (fileData as any)?.extracted_text ? (fileData as any).extracted_text.substring(0, 30000) : undefined
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(`API error: ${errData.details || errData.error || response.status}`);
      }

      const assistantId = Date.now().toString() + '-assistant';
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          assistantText += chunk;
          setMessages(prev => 
            prev.map(m => m.id === assistantId ? { ...m, content: assistantText } : m)
          );
        }
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!fileData || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex bg-[#131314] text-white">
      {/* LEFT: Chat Area (Gemini Style) */}
      <div className="w-[450px] flex flex-col bg-[#131314]">
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
          {messages.length === 0 && (
            <div className="text-center text-white/50 mt-10">
              <Bot size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm">I am ready. Ask me anything about {fileData.fileName}.</p>
            </div>
          )}
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${
                m.role === 'user' 
                  ? 'bg-[#282828] text-white rounded-3xl px-5 py-3' 
                  : 'bg-transparent text-white/90 prose prose-invert max-w-none'
              }`}>
                {m.role === 'user' ? m.content : <ReactMarkdown>{m.content}</ReactMarkdown>}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 text-white/50">
                <Loader2 size={16} className="animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 pb-6 bg-[#131314]">
          <form 
            onSubmit={handleSubmit}
            className="flex items-center bg-[#1e1e1e] rounded-full px-2 py-2 shadow-sm border border-white/5"
          >
            <button type="button" className="p-2 text-white/60 hover:text-white rounded-full hover:bg-white/5 transition-colors">
              <Plus size={22} />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Jarvis..."
              className="flex-1 bg-transparent border-none outline-none text-white px-2 py-2 placeholder:text-white/40"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className={`p-2 rounded-full transition-all flex items-center justify-center ${
                input.trim() && !isLoading ? 'bg-white text-black' : 'bg-[#333] text-white/30'
              }`}
            >
              <ArrowUp size={20} />
            </button>
          </form>
          {error && <p className="text-red-400 text-xs mt-2 text-center">{error.message}</p>}
          <p className="text-center text-[11px] text-white/30 mt-3">Jarvis is AI and can make mistakes.</p>
        </div>
      </div>

      {/* RIGHT: Document Area (Floating Card) */}
      <div className="flex-1 flex flex-col p-4 pl-0 bg-[#131314]">
        <div className="w-full h-full bg-[#1A1A1D] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between p-3 px-4 border-b border-white/5 bg-[#1A1A1D] z-10 relative">
            <div className="flex items-center gap-3">
              <button 
                onClick={onClose} 
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/70"
                title="Close"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-blue-400" />
                <h2 className="text-sm font-medium text-white/90 truncate max-w-md">{fileData.fileName}</h2>
              </div>
            </div>
            <div className="flex items-center gap-1 text-white/60">
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Print">
                <Printer size={18} />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Download">
                <Download size={18} />
              </button>
            </div>
          </div>

          {/* Iframe Wrapper */}
          <div className="flex-1 bg-white relative">
            {fileData.fileType === 'application/pdf' || fileData.fileName.endsWith('.pdf') ? (
              <iframe 
                src={`${fileData.fileUrl}#view=FitH`} 
                className="absolute inset-0 w-full h-full border-none"
                title="PDF Viewer"
              />
            ) : fileData.fileName.endsWith('.docx') || fileData.fileName.endsWith('.doc') || fileData.fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
              <iframe 
                src={`/api/documents/preview?url=${encodeURIComponent(fileData.fileUrl)}`}
                className="absolute inset-0 w-full h-full border-none"
                title="Word Document Viewer"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-gray-50">
                <FileText size={48} className="mb-4 opacity-50" />
                <p>Preview not available for this file type natively.</p>
                <a href={fileData.fileUrl} target="_blank" rel="noreferrer" className="mt-4 text-blue-500 hover:underline">
                  Download to view
                </a>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
