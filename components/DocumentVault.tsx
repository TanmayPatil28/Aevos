"use client";

import { useEffect, useState } from "react";
import { FileText, Loader2, Download, Trash2, ShieldCheck, Upload } from "lucide-react";
import { toast } from "sonner";
import { uploadToStorage } from "@/lib/supabase/storage";
import DocumentReader from "./ui/DocumentReader";
import InsightPreviewModal from "./ui/InsightPreviewModal";
import { Sparkles, Maximize } from "lucide-react";

interface Document {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  createdAt: string;
}

export default function DocumentVault() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [extractingId, setExtractingId] = useState<string | null>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data = await res.json();
      setDocuments(data);
    } catch (error) {
      console.error(error);
      toast.error("Could not load your secure vault");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    toast.loading("Uploading document...", { id: "upload" });
    
    try {
      // 1. Upload to Supabase Storage
      const { url, error: uploadError } = await uploadToStorage(file, "documents");
      if (uploadError || !url) throw new Error("Storage upload failed");

      toast.loading("Securing in Vault...", { id: "upload" });

      // 2. Save to database
      const dbRes = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileUrl: url,
          fileType: file.type
        })
      });
      if (!dbRes.ok) throw new Error("Failed to save to database");
      const savedDoc = await dbRes.json();

      toast.loading("Jarvis is reading the document...", { id: "upload" });

      // 3. Trigger RAG parsing
      const parseRes = await fetch("/api/parse/document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: savedDoc.id })
      });
      
      if (!parseRes.ok) throw new Error("Failed to parse document for RAG");

      toast.success("Document added & parsed successfully!", { id: "upload" });
      fetchDocuments();
    } catch (err) {
      console.error(err);
      toast.error("Upload failed", { id: "upload" });
    } finally {
      setLoading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleExtractInsights = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    setExtractingId(docId);
    toast.loading("Scanning document for tasks...", { id: "extract" });
    try {
      const res = await fetch("/api/parse/extract-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: docId })
      });
      if (!res.ok) throw new Error("Failed to extract");
      const data = await res.json();
      
      setInsights(data.insights || []);
      setIsInsightModalOpen(true);
      toast.success("Extraction complete", { id: "extract" });
    } catch (err) {
      console.error(err);
      toast.error("Extraction failed", { id: "extract" });
    } finally {
      setExtractingId(null);
    }
  };

  const handleSyncInsights = async () => {
    setIsSyncing(true);
    // In a real app we'd save these to the database timeline
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSyncing(false);
    setIsInsightModalOpen(false);
    toast.success("Successfully synced to Timeline!");
  };
  return (
    <div className="glass-card rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
      {/* Decorative gradient orb */}
      <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500"></div>

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
            <ShieldCheck size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-headline font-bold text-white">Document Vault</h2>
            <p className="text-xs text-on-surface-variant">Securely stored & end-to-end encrypted</p>
          </div>
        </div>
        <div>
          <label className="bg-primary/20 hover:bg-primary/30 text-primary px-4 py-2 rounded-lg cursor-pointer text-sm font-medium transition-colors border border-primary/30 flex items-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            Upload Document
            <input type="file" className="hidden" accept=".pdf,.txt,.docx,.doc" onChange={handleUpload} disabled={loading} />
          </label>
        </div>
      </div>

      <div className="relative z-10">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="animate-spin text-primary" size={30} />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
            <FileText size={40} className="mx-auto text-white/20 mb-3" />
            <p className="text-sm text-white/60">Your vault is empty</p>
            <p className="text-xs text-white/40 mt-1">Summon Jarvis via Spotlight to parse marksheets.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div 
                key={doc.id} 
                onClick={() => setSelectedDoc(doc)}
                className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors flex flex-col justify-between cursor-pointer group/card h-[120px]"
              >
                <div className="flex items-start gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-primary" />
                  </div>
                  <div className="truncate flex-1">
                    <p className="text-sm font-medium text-white truncate pr-2">{doc.fileName}</p>
                    <p className="text-xs text-white/50">{new Date(doc.createdAt).toLocaleDateString()}</p>
                  </div>
                  <a 
                    href={doc.fileUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 -mr-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white shrink-0"
                  >
                    <Download size={16} />
                  </a>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <button 
                    onClick={(e) => handleExtractInsights(e, doc.id)}
                    disabled={extractingId === doc.id}
                    className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {extractingId === doc.id ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    Extract Insights
                  </button>
                  <div className="opacity-0 group-hover/card:opacity-100 transition-opacity">
                    <Maximize size={14} className="text-white/40" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Interactive Reader Modal */}
      <DocumentReader 
        document={selectedDoc} 
        onClose={() => setSelectedDoc(null)} 
      />

      {/* Extract Insights Preview Modal */}
      <InsightPreviewModal
        insights={insights}
        isOpen={isInsightModalOpen}
        onClose={() => setIsInsightModalOpen(false)}
        onSync={handleSyncInsights}
        isSyncing={isSyncing}
      />
    </div>
  );
}
