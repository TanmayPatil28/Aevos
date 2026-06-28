import { ImportDiff, NormalizedImportPayload } from "@/lib/ingestion/types";
import { CheckCircle2, AlertTriangle, Info, XCircle, ChevronRight, ShieldCheck } from "lucide-react";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

  const confidenceVariant = payload.confidenceScore >= 90 ? "success" : payload.confidenceScore >= 70 ? "warning" : "critical";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 scrollbar-hide rounded-[48px]">
        <Card variant="accent" padding="xl" className="flex flex-col gap-8 min-h-full bg-gradient-to-br from-surface to-surface-raised">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h2 className="text-3xl font-bold text-foreground flex items-center space-x-3 tracking-tight">
                <ShieldCheck className="text-brand w-8 h-8" />
                <span>Verify Academic Import</span>
              </h2>
              <p className="text-foreground-muted mt-2 text-base">
                Please review the extracted data before we create a permanent snapshot.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-xs text-foreground-muted uppercase tracking-[0.12em] font-semibold">Confidence Score</span>
              <Badge variant={confidenceVariant} size="lg">
                {payload.confidenceScore}%
              </Badge>
              <span className="text-[11px] text-foreground-muted/60 mt-1 uppercase tracking-wider font-mono">
                Detected: {payload.detectedInstitution}
              </span>
            </div>
          </div>

          {/* Content Area */}
          <div className="space-y-8">
            
            {/* Validation Warnings */}
            {diff.warnings.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground-muted flex items-center">
                  <AlertTriangle size={14} className="mr-2" />
                  Validation Warnings
                </h3>
                <div className="space-y-2 flex flex-col">
                  {diff.warnings.map((w, i) => (
                    <Badge key={i} variant={w.severity === 'error' || w.severity === 'critical' ? 'critical' : w.severity === 'warning' ? 'warning' : 'info'} size="md" className="w-full justify-start text-left whitespace-normal h-auto py-2">
                      <div className="flex flex-col">
                        <strong className="block">{w.message}</strong>
                        {w.affectedEntity && <span className="opacity-70 text-xs">Entity: {w.affectedEntity}</span>}
                      </div>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Diffs & Changes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* New Additions */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-brand flex items-center">
                  <CheckCircle2 size={14} className="mr-2" />
                  New Data Added
                </h3>
                <Card variant="default" padding="lg" className="min-h-[140px] border border-white/5">
                  {diff.newSemestersAdded.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {diff.newSemestersAdded.map(sem => (
                        <Badge key={sem} variant="success" size="sm">
                          Semester {sem} Record
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-foreground-muted italic">
                      No new semesters added
                    </div>
                  )}
                </Card>
              </div>

              {/* Updates & Resolutions */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-info flex items-center">
                  <Info size={14} className="mr-2" />
                  Updates & Resolutions
                </h3>
                <Card variant="default" padding="lg" className="min-h-[140px] flex flex-col gap-2 items-start border border-white/5">
                  {diff.backlogsResolved.length > 0 && (
                    <Badge variant="success" size="sm">
                      {diff.backlogsResolved.length} Backlogs Resolved
                    </Badge>
                  )}
                  {diff.sgpaChanges.length > 0 && (
                    <Badge variant="warning" size="sm">
                      {diff.sgpaChanges.length} SGPA values corrected
                    </Badge>
                  )}
                  {diff.coursesUpdated.length > 0 && (
                    <Badge variant="info" size="sm">
                      {diff.coursesUpdated.length} Course grades updated
                    </Badge>
                  )}
                  {diff.profileUpdated && (
                    <Badge variant="brand" size="sm">
                      Identity Verified & Updated
                    </Badge>
                  )}
                  {diff.backlogsResolved.length === 0 && diff.sgpaChanges.length === 0 && diff.coursesUpdated.length === 0 && !diff.profileUpdated && (
                    <div className="flex items-center justify-center h-full text-sm text-foreground-muted italic w-full">
                      No existing records modified
                    </div>
                  )}
                </Card>
              </div>

            </div>

            {/* Canonical State Preview Summary */}
            <Card variant="default" padding="lg" className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-[12px] leading-[16px] text-foreground-muted font-semibold uppercase tracking-wider">Resulting CGPA</span>
                <strong className="text-foreground text-xl tracking-tight">{payload.profile.academic.currentCgpa.toFixed(2)}</strong>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] leading-[16px] text-foreground-muted font-semibold uppercase tracking-wider">Total Credits</span>
                <strong className="text-foreground text-lg tracking-tight">{payload.profile.academic.earnedCredits}</strong>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] leading-[16px] text-foreground-muted font-semibold uppercase tracking-wider">Active Backlogs</span>
                <strong className="text-foreground text-lg tracking-tight">{payload.profile.academic.activeBacklogsCount}</strong>
              </div>
            </Card>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end items-center gap-4 pt-4 mt-2 border-t border-white/5">
            <Button
              variant="ghost"
              size="md"
              onClick={onCancel}
              disabled={isPersisting}
            >
              Cancel Import
            </Button>
            
            <Button
              variant="primary"
              size="md"
              onClick={onConfirm}
              disabled={isPersisting || diff.isDuplicate}
              loading={isPersisting}
            >
              {!isPersisting && (
                diff.isDuplicate ? <CheckCircle2 size={16} className="mr-2" /> : <ShieldCheck size={16} className="mr-2" />
              )}
              {diff.isDuplicate ? "Data is up to date" : "Confirm & Create Snapshot"}
            </Button>
          </div>

        </Card>
      </div>
    </div>
  );
}
