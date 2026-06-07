"use client";

import { useEffect, useState } from "react";
import { FileText, Loader2, Download, Trash2, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

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

  return (
    <div className="glass-card rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
      {/* Decorative gradient orb */}
      <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500"></div>

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
          <ShieldCheck size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-headline font-bold text-white">Document Vault</h2>
          <p className="text-xs text-on-surface-variant">Securely stored & end-to-end encrypted</p>
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
              <div key={doc.id} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-primary" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium text-white truncate">{doc.fileName}</p>
                    <p className="text-xs text-white/50">{new Date(doc.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a 
                    href={doc.fileUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
                  >
                    <Download size={16} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
