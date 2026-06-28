"use client";

import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { generateRoadmapPDF, downloadPDF } from "@/lib/utils/pdfGenerator";
import { toast } from "sonner";

export default function ExportRoadmapButton({ title, tasks }: { title: string, tasks: string[] }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const pdfBytes = await generateRoadmapPDF(title, tasks);
      downloadPDF(pdfBytes, `${title.replace(/\s+/g, "_")}_Roadmap.pdf`);
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="mt-2 flex items-center gap-2 px-4 py-2 text-sm font-semibold text-black bg-brand rounded-lg hover:bg-brand/90 transition-colors disabled:opacity-50"
    >
      {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
      Export PDF
    </button>
  );
}
