'use client';

import { useRef, useState } from 'react';
import { useMotionValue, useSpring, motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  Calendar,
  Download,
  ArrowRight,
  Loader2,
  Zap,
  FileText,
  Upload,
  Sparkles,
  Trash2,
  Plus,
  X,
  LucideIcon,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Link from 'next/link';
import { useAcademicStore } from '@/lib/stores/academic-store';
import { useSWRConfig } from 'swr';
import toast from 'react-hot-toast';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Liquid Action Tile ---
function LiquidActionTile({
  href,
  onClick,
  icon: Icon,
  label,
  description,
  variant = 'primary',
}: {
  href?: string;
  onClick?: () => void;
  icon: LucideIcon;
  label: string;
  description: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 350, damping: 25, mass: 0.8 });
  const springY = useSpring(mouseY, { stiffness: 350, damping: 25, mass: 0.8 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - (left + width / 2)) * 0.15);
    mouseY.set((e.clientY - (top + height / 2)) * 0.15);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const content = (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={cn(
        'relative p-6 rounded-[28px] border transition-all duration-500 flex items-center justify-between group overflow-hidden shadow-2xl cursor-pointer',
        variant === 'primary'
          ? 'bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED] border-transparent text-white'
          : variant === 'secondary'
            ? 'bg-[#A855F7]/10 border-[#A855F7]/20 text-[#A855F7] hover:bg-[#A855F7]/20'
            : 'bg-white/[0.03] border-white/[0.05] text-white hover:bg-white/[0.05]'
      )}
    >
      <div className="flex items-center gap-4 relative z-10">
        <div
          className={cn(
            'p-3 rounded-2xl transition-transform duration-500 group-hover:scale-110',
            variant === 'primary' ? 'bg-white/20' : 'bg-white/[0.05]'
          )}
        >
          <Icon size={22} strokeWidth={2.5} />
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-black tracking-tight">{label}</p>
          <p
            className={cn(
              'text-[10px] font-bold uppercase tracking-widest opacity-40 group-hover:opacity-60 transition-opacity'
            )}
          >
            {description}
          </p>
        </div>
      </div>
      <ArrowRight
        size={20}
        strokeWidth={3}
        className="relative z-10 group-hover:translate-x-1 transition-transform"
      />

      {/* Light Sweep */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity duration-700">
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white to-transparent -skew-x-[45deg] z-0 blur-xl"
        />
      </div>
    </motion.div>
  );

  if (href)
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-transparent border-none p-0 cursor-pointer"
    >
      {content}
    </button>
  );
}

export default function QuickActions({ onExportPDF }: { onExportPDF: () => void }) {
  const [isExporting, setIsExporting] = useState(false);
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResults, setOcrResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { syncFromDatabase } = useAcademicStore();
  const { mutate } = useSWRConfig();

  const handleExport = async () => {
    setIsExporting(true);
    await onExportPDF();
    setTimeout(() => setIsExporting(false), 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/parsing/ocr', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setOcrResults(result.data);
          toast.success('Ocular intelligence parsed successfully!');
        } else {
          toast.error(result.error || 'Failed to parse transcript');
        }
      } else {
        toast.error('Failed to parse transcript');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network interface offline');
    } finally {
      setOcrLoading(false);
    }
  };

  const handleSaveOcr = async () => {
    if (!ocrResults) return;

    try {
      const formattedSubjects = ocrResults.subjects.map((sub: any) => ({
        name: sub.name,
        credits: Number(sub.credits),
        score: Number(sub.gradePoint), // Save GP into score for GradeFlow legacy
      }));

      const res = await fetch('/api/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          semesterNumber: ocrResults.semesterNumber,
          semesterName: `Semester ${ocrResults.semesterNumber}`,
          subjects: formattedSubjects,
          sgpa: ocrResults.sgpa,
          total_credits: ocrResults.totalCredits,
        }),
      });

      if (res.ok) {
        toast.success('Semester logged in relational ledger.');
        // Clear state & close modal
        setOcrResults(null);
        setShowOcrModal(false);

        // Dynamic recoil/updates across whole app
        await syncFromDatabase();
        mutate('/api/analytics/forecast');
        mutate('/api/analytics/risk');
        mutate('/api/analytics/trajectory');
        mutate('/api/graduation/progress');
      } else {
        toast.error('Failed to persist transcript records');
      }
    } catch (err) {
      console.error(err);
      toast.error('Persistence write block');
    }
  };

  const updateSubjectField = (index: number, field: string, value: any) => {
    if (!ocrResults) return;
    const newSubjects = [...ocrResults.subjects];
    newSubjects[index] = { ...newSubjects[index], [field]: value };

    // Recalculate SGPA dynamically
    let weightedPoints = 0;
    let totalCredits = 0;
    newSubjects.forEach((sub: any) => {
      weightedPoints += Number(sub.gradePoint) * Number(sub.credits);
      totalCredits += Number(sub.credits);
    });

    const newSgpa = totalCredits > 0 ? Number((weightedPoints / totalCredits).toFixed(2)) : 0.0;

    setOcrResults({
      ...ocrResults,
      subjects: newSubjects,
      totalCredits,
      sgpa: newSgpa,
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative group p-8 rounded-[32px] bg-[#0A0F1E]/40 backdrop-blur-[50px] border border-white/[0.05] shadow-[0_30px_90px_rgba(0,0,0,0.8)] flex flex-col h-fit"
      >
        <div className="absolute inset-0 rounded-[32px] border-[0.5px] border-white/[0.1] pointer-events-none z-10" />

        <div className="flex items-center gap-3 mb-8 relative z-10">
          <Zap size={22} strokeWidth={3} className="text-[#4F8EF7]" />
          <h3 className="text-xl font-black font-headline tracking-tighter text-white">
            Neural Actions
          </h3>
        </div>

        <div className="flex flex-col gap-5 relative z-10">
          <LiquidActionTile
            href="/calculator"
            label="Initialize Core"
            description="New GPA Calculation"
            icon={Calculator}
            variant="primary"
          />

          <LiquidActionTile
            onClick={() => setShowOcrModal(true)}
            label="Neural OCR Scan"
            description="Auto Import Transcript"
            icon={Upload}
            variant="secondary"
          />

          <LiquidActionTile
            href="/planner"
            label="Path Optimization"
            description="Update Semester Plan"
            icon={Calendar}
            variant="ghost"
          />

          <LiquidActionTile
            onClick={handleExport}
            label={isExporting ? 'Rendering Telemetry...' : 'Export Spectrum'}
            description="Generate Full PDF Report"
            icon={isExporting ? Loader2 : Download}
            variant="ghost"
          />
        </div>
      </motion.div>

      {/* OCR Transcripts Processing Overlay */}
      <AnimatePresence>
        {showOcrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#090D1C]/90 border border-white/10 rounded-[2.5rem] shadow-2xl p-8 max-h-[85vh] overflow-y-auto flex flex-col justify-between"
            >
              <button
                onClick={() => {
                  setShowOcrModal(false);
                  setOcrResults(null);
                }}
                className="absolute top-6 right-6 text-white/40 hover:text-white/80 transition-colors p-1"
              >
                <X size={20} />
              </button>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-black font-headline text-white flex items-center gap-2">
                    <Sparkles size={20} className="text-primary animate-pulse" /> Neural Transcript
                    OCR
                  </h4>
                  <p className="text-xs text-white/50 mt-1">
                    Upload your digital marksheet to extract and populate subjects automatically.
                  </p>
                </div>

                {!ocrResults && !ocrLoading && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/10 hover:border-primary/50 transition-colors duration-300 rounded-[2rem] p-12 flex flex-col items-center justify-center gap-4 cursor-pointer bg-white/[0.01]"
                  >
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Upload size={24} />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-bold text-white">
                        Drag & drop files or click to browse
                      </p>
                      <p className="text-[10px] text-white/40 uppercase font-black">
                        Supports PNG, JPG, or PDF
                      </p>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      accept="image/*,.pdf"
                    />
                  </div>
                )}

                {ocrLoading && (
                  <div className="relative border border-white/10 rounded-[2rem] p-16 flex flex-col items-center justify-center gap-4 bg-white/[0.01] overflow-hidden">
                    {/* Glowing Laser Scan Line */}
                    <motion.div
                      animate={{ y: ['0%', '280%', '0%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_#4F8EF7]"
                    />

                    <FileText size={48} className="text-primary/40 animate-bounce" />
                    <p className="text-sm font-bold text-white flex items-center gap-2">
                      <Loader2 className="animate-spin text-primary" size={16} />
                      Scanning catalog layouts...
                    </p>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">
                      Extracting grade markers
                    </p>
                  </div>
                )}

                {ocrResults && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-2xl p-4">
                      <div>
                        <div className="text-xs text-white/50">Auto-Detected</div>
                        <div className="text-sm font-black text-white">
                          Semester {ocrResults.semesterNumber}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-white/50">Extracted SGPA</div>
                        <div className="text-lg font-black text-primary">
                          {ocrResults.sgpa.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-xs font-black uppercase text-white/40 tracking-widest">
                        Extracted Subjects
                      </div>

                      <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                        {ocrResults.subjects.map((sub: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-3"
                          >
                            <input
                              type="text"
                              value={sub.name}
                              onChange={(e) => updateSubjectField(idx, 'name', e.target.value)}
                              className="flex-1 bg-transparent border-none focus:outline-none text-white text-xs font-bold"
                            />

                            <div className="flex items-center gap-3 flex-shrink-0">
                              <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2 py-1">
                                <span className="text-[9px] text-white/40 uppercase font-black">
                                  Credits
                                </span>
                                <input
                                  type="number"
                                  min="1"
                                  max="8"
                                  value={sub.credits}
                                  onChange={(e) =>
                                    updateSubjectField(idx, 'credits', Number(e.target.value))
                                  }
                                  className="w-6 bg-transparent border-none text-center focus:outline-none text-white text-xs font-black"
                                />
                              </div>

                              <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2 py-1">
                                <span className="text-[9px] text-white/40 uppercase font-black">
                                  GP
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  value={sub.gradePoint}
                                  onChange={(e) =>
                                    updateSubjectField(idx, 'gradePoint', Number(e.target.value))
                                  }
                                  className="w-6 bg-transparent border-none text-center focus:outline-none text-white text-xs font-black"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {ocrResults && (
                <div className="mt-8 flex gap-4">
                  <button
                    onClick={() => setOcrResults(null)}
                    className="flex-1 py-3 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all text-xs font-bold border border-white/10"
                  >
                    Rescan
                  </button>
                  <button
                    onClick={handleSaveOcr}
                    className="flex-[2] py-3 px-6 rounded-2xl bg-gradient-to-r from-primary to-[#7C3AED] hover:from-[#60a5fa] hover:to-[#8b5cf6] text-white transition-all text-xs font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5"
                  >
                    <Sparkles size={14} /> Commit to Academic Log
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
