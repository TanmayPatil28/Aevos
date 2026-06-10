## Forensic Audit Report: Job/Internship Matcher Fixes

### 1. Observation
1. **Build Failure**: The build crashes because the Next.js static generator encounters dynamic behavior (cookie usage) in `/internships`. 
   - Error: `Dynamic server usage: Route /internships couldn't be rendered statically because it used cookies.`
   - `app/internships/page.tsx` was inspected via `view_file` and lacks the `export const dynamic = 'force-dynamic';` directive to opt out of static generation.
2. **Logic Bug in Query Generation**: The Forensic Audit report notes a bug where user skills are ignored if `academicProfile.academic` is present but `programme` or `branch` are empty.
   - Upon inspection of `lib/jobs/matcher.ts` (lines 14-23), the code is:
     ```typescript
     let query = "software engineering tech internships summer";
     if (academicProfile?.academic) {
       const programme = academicProfile.academic.programme || "";
       const branch = academicProfile.academic.branch || "";
       if (programme || branch) {
         query = `${branch} ${programme} internships summer`.trim();
       }
     } else if (academicProfile?.skills && academicProfile?.major) {
       query = `${academicProfile.major} ${academicProfile.skills.slice(0, 2).join(" ")} internships summer`.trim();
     }
     ```

### 2. Logic Chain
1. **Fixing Build Error**: The Next.js `/internships` route imports and runs `matchInternships()` which accesses cookies dynamically. Without a dynamic directive, Next.js defaults to static generation and crashes during `npm run build`. Adding `export const dynamic = 'force-dynamic';` to `app/internships/page.tsx` will explicitly instruct Next.js to render the page dynamically, resolving the `ENOENT` build error.
2. **Fixing Query Logic Bug**: In `lib/jobs/matcher.ts`, the outer `if (academicProfile?.academic)` captures any object with an `academic` property, regardless of whether `programme` or `branch` hold values. If they are empty, it enters the block, fails the inner `if (programme || branch)`, and gracefully completes, entirely bypassing the `else if` fallback that should handle user `skills` and `major`. Refactoring the condition to directly evaluate `programme || branch` at the top level corrects the fallback flow.

### 3. Caveats
- I did not run the build directly to confirm other potential issues, relying instead on the provided Forensic Audit report.
- The `skills` array fallback assumes `skills` exists and is a valid array with a `.slice()` method as per the original design. 

### 4. Conclusion
Both issues can be straightforwardly fixed with localized changes to the source files:

**Proposed Fix for `app/internships/page.tsx`:**
Add the dynamic directive at the top of the file (e.g., around line 7).
```tsx
export const metadata = {
  title: 'Job & Internship Matcher | GradeFlow',
  description: 'Find internships matching your academic profile.',
};

export const dynamic = 'force-dynamic';

export default async function InternshipsPage() {
```

**Proposed Fix for `lib/jobs/matcher.ts` (Lines 14-24):**
Refactor the fallback checks:
```typescript
    let query = "software engineering tech internships summer";
    const programme = academicProfile?.academic?.programme || "";
    const branch = academicProfile?.academic?.branch || "";

    if (programme || branch) {
      query = `${branch} ${programme} internships summer`.trim();
    } else if (academicProfile?.skills && academicProfile?.major) {
      query = `${academicProfile.major} ${academicProfile.skills.slice(0, 2).join(" ")} internships summer`.trim();
    }
```

### 5. Verification Method
- **Verify Logic Fix:** Execute `npx tsx scripts/test-matcher.ts` locally with an academic profile that has an empty `academic.programme` and `academic.branch` but a populated `skills` and `major` array. It should no longer default to the generic "software engineering tech internships summer" query, but rather utilize the provided skills.
- **Verify Build Fix:** Run `npm run build` from the `gradeflow` directory and confirm that the Next.js process completes successfully without the `Dynamic server usage` error for `/internships`.
