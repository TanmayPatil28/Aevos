"use client";

export default function UploadZone({ 
  onUploadStart, 
  onUploadComplete 
}: { 
  onUploadStart: () => void, 
  onUploadComplete: () => void 
}) {

  // Mock upload interaction
  const handleFileSelect = () => {
    onUploadStart();
    // Simulate network parsing delay
    setTimeout(() => {
      onUploadComplete();
    }, 2000);
  };

  return (
    <div 
      onClick={handleFileSelect}
      className="w-full relative group cursor-pointer"
    >
      <div className="absolute inset-0 bg-indigo-500/5 rounded-2xl scale-95 group-hover:scale-100 transition-transform duration-300 pointer-events-none" />
      
      <div className="relative border-2 border-dashed border-slate-700/60 hover:border-indigo-500/50 hover:bg-indigo-500/[0.02] bg-slate-900 rounded-2xl p-10 flex flex-col items-center justify-center transition-all duration-300 min-h-[280px]">
        
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-500/10 transition-all duration-300 shadow-sm">
          <span className="material-symbols-outlined text-4xl text-slate-400 group-hover:text-indigo-400 transition-colors">
            cloud_upload
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-slate-200 mb-2">Upload Result PDF</h3>
        <p className="text-slate-400 text-sm text-center max-w-sm mb-6">
          Drag and drop your official university result PDF here, or click to browse.
        </p>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-[14px]">school</span>
            SPPU Supported
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-[14px]">school</span>
            Digicampus Supported
          </div>
        </div>

      </div>
    </div>
  );
}
