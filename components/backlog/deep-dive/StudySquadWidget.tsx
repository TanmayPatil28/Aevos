import { useState, useRef, useEffect } from "react";
import { Users, FileText, MessageCircle, Check, Download, Send, Loader2 } from "lucide-react";
import { CourseState } from "@/stores/usmStore";
import IOSSheetModal from "@/components/ui/IOSSheetModal";

type Message = { id: string; sender: string; text: string; isSelf: boolean; color: string };

export default function StudySquadWidget({ course }: { course: CourseState }) {
  const [activeModal, setActiveModal] = useState<"NOTES" | "LIVE" | null>(null);
  
  // File Download State
  const [downloadProgress, setDownloadProgress] = useState<{ [key: number]: number }>({});
  
  // Live Chat State
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", sender: "U1", text: "Does anyone know if the third module is heavily weighted?", isSelf: false, color: "#FF9F0A" },
    { id: "2", sender: "U2", text: "Yes, check the historical analytics widget. It's usually 30% of the paper.", isSelf: false, color: "#30D158" },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Mock data for peer networking
  const activePeers = Math.floor(Math.random() * 15) + 3; 

  const handleDownload = (unit: number) => {
    if (downloadProgress[unit] !== undefined) return;
    
    setDownloadProgress(prev => ({ ...prev, [unit]: 0 }));
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setDownloadProgress(prev => ({ ...prev, [unit]: progress }));
    }, 200);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: "You",
      text: chatInput.trim(),
      isSelf: true,
      color: "#0A84FF"
    };
    
    setMessages(prev => [...prev, newMsg]);
    setChatInput("");
    
    // Simulate someone typing a response
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          sender: "U3",
          text: "Yeah I agree with that. The PYQs are a lifesaver.",
          isSelf: false,
          color: "#BF5AF2"
        }]);
      }, 2500);
    }, 1000);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (activeModal === "LIVE") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, activeModal]);

  return (
    <>
      <div className="p-6 rounded-[32px] bg-[#1C1C1E] flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-[17px] font-semibold text-white flex items-center gap-2 tracking-tight">
              <Users className="text-[#0A84FF]" size={20} /> Study Squad
            </h3>
            <p className="text-[15px] text-[#8E8E93] mt-1 tracking-tight">P2P Network</p>
          </div>
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`w-8 h-8 rounded-full border-2 border-[#1C1C1E] flex items-center justify-center text-[11px] font-bold ${
                i === 1 ? "bg-[#0A84FF]/20 text-[#0A84FF]" : 
                i === 2 ? "bg-[#FF9F0A]/20 text-[#FF9F0A]" : "bg-[#30D158]/20 text-[#30D158]"
              }`}>
                U{i}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-[#1C1C1E] bg-[#2C2C2E] flex items-center justify-center text-[11px] font-bold text-[#8E8E93]">
              +{activePeers}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center space-y-3">
          <div 
            onClick={() => setActiveModal("NOTES")}
            className="flex items-center justify-between p-3 rounded-2xl bg-[#2C2C2E] cursor-pointer hover:bg-[#3A3A3C] transition-colors active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-[#0A84FF]/20 text-[#0A84FF]">
                <FileText size={18} />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-white tracking-tight leading-none">Shared Notes</p>
                <p className="text-[13px] text-[#8E8E93] mt-1">Uploaded 2h ago</p>
              </div>
            </div>
          </div>

          <div 
            onClick={() => setActiveModal("LIVE")}
            className="flex items-center justify-between p-3 rounded-2xl bg-[#2C2C2E] cursor-pointer hover:bg-[#3A3A3C] transition-colors active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-[#30D158]/20 text-[#30D158]">
                <MessageCircle size={18} />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-white tracking-tight leading-none">Live Discussion</p>
                <p className="text-[13px] text-[#8E8E93] mt-1">{activePeers} students active</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <IOSSheetModal 
        isOpen={activeModal === "NOTES"} 
        onClose={() => setActiveModal(null)} 
        title={`${course.code} File Directory`}
      >
        <div className="space-y-4 pb-4">
          {[1, 2, 3].map(unit => {
            const progress = downloadProgress[unit];
            const isDownloading = progress !== undefined && progress < 100;
            const isDone = progress === 100;
            
            return (
              <div key={unit} className="flex flex-col p-4 bg-[#2C2C2E] rounded-2xl relative overflow-hidden">
                {isDownloading && (
                  <div className="absolute top-0 left-0 h-1 bg-[#0A84FF] transition-all duration-200" style={{ width: `${progress}%` }} />
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FileText className="text-[#0A84FF]" size={24} />
                    <div>
                      <h4 className="text-[17px] text-white font-semibold tracking-tight">Unit {unit} - Master Notes.pdf</h4>
                      <p className="text-[13px] text-[#8E8E93] mt-1">4.2 MB • Uploaded by Top Scholar</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDownload(unit)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors ${
                      isDone ? "bg-[#30D158] border-none" : 
                      isDownloading ? "bg-transparent border border-[#0A84FF] text-[#0A84FF]" : 
                      "bg-[#3A3A3C] hover:bg-[#4A4A4C] active:scale-[0.98]"
                    }`}
                  >
                    {isDone ? <Check size={18} /> : 
                     isDownloading ? <Loader2 size={18} className="animate-spin" /> : 
                     <Download size={18} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </IOSSheetModal>

      <IOSSheetModal 
        isOpen={activeModal === "LIVE"} 
        onClose={() => setActiveModal(null)} 
        title={`Live Squad (${activePeers})`}
      >
        <div className="flex flex-col h-[60vh]">
          <div className="flex-1 overflow-y-auto space-y-4 pb-4 no-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.isSelf ? "flex-row-reverse" : ""}`}>
                {!msg.isSelf && (
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-auto"
                    style={{ backgroundColor: `${msg.color}33`, color: msg.color }}
                  >
                    {msg.sender}
                  </div>
                )}
                <div className={`p-3 max-w-[80%] ${
                  msg.isSelf 
                  ? "bg-[#0A84FF] rounded-2xl rounded-tr-sm" 
                  : "bg-[#2C2C2E] rounded-2xl rounded-tl-sm"
                }`}>
                  <p className="text-[15px] text-white leading-snug">{msg.text}</p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#BF5AF2]/20 text-[#BF5AF2] flex items-center justify-center text-xs font-bold shrink-0 mt-auto">U3</div>
                <div className="bg-[#2C2C2E] p-3 rounded-2xl rounded-tl-sm max-w-[80%] flex items-center gap-1 h-[44px]">
                  <div className="w-2 h-2 rounded-full bg-[#8E8E93] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[#8E8E93] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[#8E8E93] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          
          <div className="flex gap-2 shrink-0 pt-2 border-t border-white/5">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Message Squad..." 
              className="flex-1 bg-[#2C2C2E] border-none rounded-full px-4 py-3 text-[15px] text-white placeholder:text-[#8E8E93] focus:outline-none" 
            />
            <button 
              onClick={handleSendMessage}
              disabled={!chatInput.trim()}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0 transition-colors ${
                chatInput.trim() ? "bg-[#0A84FF] active:scale-[0.98]" : "bg-[#3A3A3C] text-[#8E8E93]"
              }`}
            >
              <Send size={18} className={chatInput.trim() ? "ml-1" : ""} />
            </button>
          </div>
        </div>
      </IOSSheetModal>
    </>
  );
}
