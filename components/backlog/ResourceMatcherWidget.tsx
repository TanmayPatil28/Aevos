import { useState } from "react";
import { PlaySquare, ExternalLink, PlayCircle, FileText, ChevronRight } from "lucide-react";
import { CourseState } from "@/stores/usmStore";
import IOSSheetModal from "@/components/ui/IOSSheetModal";
import { MagneticWrapper } from "@/components/ui/MagneticWrapper";

export default function ResourceMatcherWidget({ activeBacklogs }: { activeBacklogs: CourseState[] }) {
  const [activeResource, setActiveResource] = useState<"VIDEO" | "PAPER" | null>(null);

  if (activeBacklogs.length === 0) return null;

  // We'll just show resources for the first backlog for the widget
  const targetCourse = activeBacklogs[0];

  return (
    <>
      <div className="p-6 rounded-[2rem] bg-[#1c1c1e] border border-white/[0.05] flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-[17px] font-bold text-white flex items-center gap-2 tracking-wide">
              <PlaySquare className="text-[#f43f5e] drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" size={20} /> Smart Resources
            </h3>
            <p className="text-[15px] text-[#8E8E93] mt-1 tracking-tight">Auto-matched for {targetCourse.code}</p>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar">
          <MagneticWrapper strength={0.1}>
            <div 
              onClick={() => setActiveResource("VIDEO")}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/[0.05] cursor-pointer hover:bg-white/[0.08] transition-colors active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f43f5e]/20 text-[#f43f5e] flex items-center justify-center">
                  <PlayCircle size={20} />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-white tracking-wide leading-none">Complete Playlist</p>
                  <p className="text-[13px] text-[#8E8E93] mt-1">Neso Academy (42 videos)</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-[#8E8E93]" />
            </div>
          </MagneticWrapper>

          <MagneticWrapper strength={0.1}>
            <div 
              onClick={() => setActiveResource("PAPER")}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/[0.05] cursor-pointer hover:bg-white/[0.08] transition-colors active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#fb923c]/20 text-[#fb923c] flex items-center justify-center">
                  <FileText size={18} />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-white tracking-wide leading-none">Past Year Papers</p>
                  <p className="text-[13px] text-[#8E8E93] mt-1">Last 5 Semesters (Solved)</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-[#8E8E93]" />
            </div>
          </MagneticWrapper>
        </div>
      </div>

      <IOSSheetModal 
        isOpen={activeResource === "VIDEO"} 
        onClose={() => setActiveResource(null)} 
        title="YouTube Player"
      >
        <div className="space-y-4 pb-6">
          <div className="w-full aspect-video bg-black rounded-2xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer">
            <img 
              src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80" 
              alt="Video Thumbnail" 
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
            />
            <div className="w-16 h-16 bg-[#f43f5e] rounded-full flex items-center justify-center text-white z-10 shadow-lg group-hover:scale-110 transition-transform">
              <PlaySquare size={28} className="ml-1" />
            </div>
          </div>
          <div>
            <h4 className="text-[17px] font-bold text-white tracking-wide">Lecture 1: Introduction to {targetCourse.name}</h4>
            <p className="text-[15px] text-[#8E8E93] mt-1">Neso Academy • 1.2M views</p>
          </div>
          <div className="space-y-2 mt-4">
            <div className="p-3 bg-white/[0.04] rounded-xl flex items-center gap-3 border border-[#f43f5e]/30">
              <div className="w-2 h-2 rounded-full bg-[#f43f5e]" />
              <p className="text-[15px] text-white">Up Next: Complex Variables (15:20)</p>
            </div>
            <div className="p-3 bg-white/[0.04] rounded-xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-transparent border border-[#8E8E93]" />
              <p className="text-[15px] text-[#8E8E93]">Lecture 3: Theorems (22:10)</p>
            </div>
          </div>
        </div>
      </IOSSheetModal>

      <IOSSheetModal 
        isOpen={activeResource === "PAPER"} 
        onClose={() => setActiveResource(null)} 
        title="Document Viewer"
      >
        <div className="flex flex-col items-center justify-center py-10 space-y-6">
          <div className="w-24 h-32 bg-white rounded-lg shadow-lg flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 w-full h-4 bg-[#fb923c]" />
            <FileText size={40} className="text-[#fb923c]" />
          </div>
          <div className="text-center">
            <h4 className="text-[17px] font-bold text-white tracking-wide">{targetCourse.code}_Solved_Papers.pdf</h4>
            <p className="text-[15px] text-[#8E8E93] mt-1">12.5 MB • 45 Pages</p>
          </div>
          <MagneticWrapper strength={0.4}>
            <button className="px-8 py-3 rounded-xl bg-[#fb923c]/20 hover:bg-[#fb923c]/30 text-[#fb923c] border border-[#fb923c]/30 font-bold text-[13px] tracking-wider uppercase active:scale-[0.98] transition-all flex items-center gap-2 mt-4">
              <ExternalLink size={18} /> Open in PDF Reader
            </button>
          </MagneticWrapper>
        </div>
      </IOSSheetModal>
    </>
  );
}
