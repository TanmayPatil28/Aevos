import { ImportDiff, NormalizedImportPayload } from "@/lib/ingestion/types";
import { CheckCircle2, AlertTriangle, Info, XCircle, ChevronRight, ShieldCheck } from "lucide-react";

interface ImportVerificationModalProps {
  payload: NormalizedImportPayload;
  diff: ImportDiff;
  isPersisting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ImportVerificationModal({
  payload,
  diff,
  isPersisting,
  onConfirm,
  onCancel
}: ImportVerificationModalProps) {

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#000000] border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-[#000000]">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="text-emerald-400" />
              <span>Verify Academic Import</span>
            </h2>
            <p className="text-slate-400 mt-1">
              Please review the extracted data before we create a permanent snapshot.
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Confidence Score</span>
            <div className={`text-2xl font-black ${payload.confidenceScore >= 90 ? "text-emerald-400" : payload.confidenceScore >= 70 ? "text-amber-400" : "text-red-400"}`}>
              {payload.confidenceScore}%
            </div>
            <span className="text-xs text-slate-500 mt-1">Detected: {payload.detectedInstitution.toUpperCase()}</span>
          </div>
        </div>

        {/* Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Validation Warnings */}
          {diff.warnings.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center">
                <AlertTriangle size={16} className="mr-2" />
                Validation Warnings
              </h3>
              <div className="space-y-2">
                {diff.warnings.map((w, i) => (
                  <div key={i} className={`p-3 rounded-lg border flex items-start space-x-3 text-sm
                    ${w.severity === 'error' || w.severity === 'critical' ? 'bg-red-500/10 border-red-500/20 text-red-200' : ''}
                    ${w.severity === 'warning' ? 'bg-orange-500/10 border-orange-500/20 text-orange-200' : ''}
                    ${w.severity === 'info' ? 'bg-blue-500/10 border-blue-500/20 text-blue-200' : ''}
                  `}>
                    {w.severity === 'info' ? <Info size={16} className="mt-0.5 flex-shrink-0" /> : <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />}
                    <div>
                      <strong className="block">{w.message}</strong>
                      {w.affectedEntity && <span className="opacity-70">Entity: {w.affectedEntity}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Diffs & Changes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* New Additions */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 flex items-center">
                <CheckCircle2 size={16} className="mr-2" />
                New Data Added
              </h3>
              <div className="bg-[#000000] rounded-lg p-4 border border-slate-800 min-h-[120px]">
                {diff.newSemestersAdded.length > 0 ? (
                  <ul className="space-y-2">
                    {diff.newSemestersAdded.map(sem => (
                      <li key={sem} className="flex items-center text-sm text-slate-300">
                        <ChevronRight size={14} className="text-emerald-500 mr-2" />
                        Semester {sem} Record
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-slate-500 italic">
                    No new semesters added
                  </div>
                )}
              </div>
            </div>

            {/* Updates & Resolutions */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400 flex items-center">
                <Info size={16} className="mr-2" />
                Updates & Resolutions
              </h3>
              <div className="bg-[#000000] rounded-lg p-4 border border-slate-800 min-h-[120px]">
                <ul className="space-y-2">
                  {diff.backlogsResolved.length > 0 && (
                    <li className="flex items-center text-sm text-emerald-300 font-medium">
                      <CheckCircle2 size={14} className="mr-2" />
                      {diff.backlogsResolved.length} Backlogs Resolved
                    </li>
                  )}
                  {diff.sgpaChanges.length > 0 && (
                    <li className="flex items-center text-sm text-amber-300">
                      <AlertTriangle size={14} className="mr-2" />
                      {diff.sgpaChanges.length} SGPA values corrected
                    </li>
                  )}
                  {diff.coursesUpdated.length > 0 && (
                    <li className="flex items-center text-sm text-blue-300">
                      <Info size={14} className="mr-2" />
                      {diff.coursesUpdated.length} Course grades updated
                    </li>
                  )}
                  {diff.profileUpdated && (
                    <li className="flex items-center text-sm text-emerald-400 font-medium">
                      <ShieldCheck size={14} className="mr-2" />
                      Academic Profile Identity Verified & Updated
                    </li>
                  )}
                  {diff.backlogsResolved.length === 0 && diff.sgpaChanges.length === 0 && diff.coursesUpdated.length === 0 && !diff.profileUpdated && (
                    <div className="flex items-center justify-center h-full text-sm text-slate-500 italic">
                      No existing records modified
                    </div>
                  )}
                </ul>
              </div>
            </div>

          </div>

          {/* Canonical State Preview Summary */}
          <div className="bg-slate-800/30 rounded-lg p-4 flex justify-between items-center text-sm text-slate-300">
            <div>
              <span className="text-slate-500">Resulting CGPA:</span> <strong className="text-white text-lg ml-2">{payload.profile.academic.currentCgpa.toFixed(2)}</strong>
            </div>
            <div>
              <span className="text-slate-500">Total Credits:</span> <strong className="text-white ml-2">{payload.profile.academic.earnedCredits}</strong>
            </div>
            <div>
              <span className="text-slate-500">Active Backlogs:</span> <strong className="text-white ml-2">{payload.profile.academic.activeBacklogsCount}</strong>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-[#000000] flex justify-end space-x-4">
          <button
            onClick={onCancel}
            disabled={isPersisting}
            className="px-6 py-2.5 rounded-lg font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            Cancel Import
          </button>
          
          <button
            onClick={onConfirm}
            disabled={isPersisting || diff.isDuplicate}
            className={`px-6 py-2.5 rounded-lg font-semibold flex items-center space-x-2 transition-colors ${
              diff.isDuplicate 
                ? "bg-slate-700 text-slate-400 cursor-not-allowed" 
                : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}
          >
            {isPersisting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating Snapshot...</span>
              </>
            ) : diff.isDuplicate ? (
              <>
                <CheckCircle2 size={18} />
                <span>Data is already up to date</span>
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>Confirm & Create Snapshot</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
