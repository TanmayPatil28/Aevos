# Component Documentation: JarvisResumeModal

## 1. Component Name and Path
- **Component Name**: `JarvisResumeModal`
- **File Path**: `components/ai/JarvisResumeModal.tsx`

## 2. Simulated Data/Actions
This component shows a modal with simulated resume analysis feedback and an 8-Phase Detailed Audit structure. It contains a hardcoded fallback panel for missing audits, and a mock copy-to-clipboard state timer.

### Simulated Data/Actions Code Snippets
Hardcoded fallback warning for missing `detailedAudit` (Lines 21–29):
```tsx
return (
  <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
    <div className="bg-white p-12 text-black max-w-2xl text-center rounded-lg relative">
      <button onClick={closeResume} className="absolute top-4 right-4"><X size={24} /></button>
      <AlertTriangle className="mx-auto text-yellow-500 mb-4" size={48} />
      <h2 className="text-2xl font-bold mb-2">Legacy Report Format</h2>
      <p>Please re-upload your resume to generate the new 8-Phase Detailed Audit.</p>
    </div>
  </div>
);
```

The 2000ms state reset timeout for copying (Line 36):
```tsx
setTimeout(() => setCopied(false), 2000);
```

## 3. Database/API Migration Plan

### Step 1: Real-Time Audit Generation
Instead of returning a hardcoded panel when `detailedAudit` is null, the component should trigger an automated analysis request.
1. Create a POST API endpoint `/api/career/audit/generate` that pulls the user's `resumeText` from `CareerProfile`.
2. Feed the text to Gemini with a system instruction to output the 8-Phase resume evaluation:
   - Phase 1: Summary Verdict
   - Phase 2: ATS Score Optimization
   - Phase 3: Keyword Alignment
   - Phase 4: Structural Layout Audit
   - Phase 5: Action Verb Quality
   - Phase 6: Quantifiable Metrics Assessment
   - Phase 7: Project Depth & Tutorial Check
   - Phase 8: Strategic Next Steps
3. Update the `CareerProfile` table with the generated JSON using Prisma:
   ```typescript
   await prisma.careerProfile.update({
     where: { userId },
     data: { detailedAudit: auditJSON }
   });
   ```

### Step 2: UI Binding
Bind the modal to read from `CareerProfile.detailedAudit`.
- If `detailedAudit` is null, render an active "Generate 8-Phase Audit" action button that invokes the `/api/career/audit/generate` API, showing a loading indicator, then displaying the retrieved 8-Phase audit data dynamically once complete.
