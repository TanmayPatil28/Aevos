# Handoff Report

## 1. Observation
- The Forensic Audit Report indicated a build failure during `npm run build`: `Dynamic server usage: Route /internships couldn't be rendered statically because it used cookies`.
- In `app/internships/page.tsx`, the route defaults to static generation, which fails when cookies are accessed downstream (in `matchInternships()`).
- The Challenger 1 (Gen 2) report noted a bug in `lib/jobs/matcher.ts` where if `academicProfile.academic` is defined but `programme` and `branch` are empty, it ignores the `else if` for `skills` and `major`.
- In `lib/jobs/matcher.ts`, lines 15-23:
  ```typescript
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

## 2. Logic Chain
- To fix the build error, `app/internships/page.tsx` must be explicitly marked as dynamic to allow runtime features like cookies without breaking the static build process. This is done by adding `export const dynamic = 'force-dynamic';` to the file.
- The bug in `lib/jobs/matcher.ts` occurs because the outer `if (academicProfile?.academic)` captures the condition, preventing the fallback `else if` from executing when `programme` and `branch` are empty but `academic` exists.
- Flattening the logic by directly checking `programme || branch` resolves this issue.
  ```typescript
  const programme = academicProfile?.academic?.programme || "";
  const branch = academicProfile?.academic?.branch || "";
  if (programme || branch) {
    query = `${branch} ${programme} internships summer`.trim();
  } else if (academicProfile?.skills && academicProfile?.major) {
    query = `${academicProfile.major} ${academicProfile.skills.slice(0, 2).join(" ")} internships summer`.trim();
  }
  ```

## 3. Caveats
- None. The fixes directly address the identified issues in the audit report.

## 4. Conclusion
We need to apply the following exact modifications:

**File: `app/internships/page.tsx`**
Add `export const dynamic = 'force-dynamic';` near the top of the file:
```tsx
import { matchInternships } from "./actions";

export const dynamic = 'force-dynamic';

export const metadata = {
```

**File: `lib/jobs/matcher.ts`**
Replace lines 15-23 with:
```typescript
    const programme = academicProfile?.academic?.programme || "";
    const branch = academicProfile?.academic?.branch || "";
    if (programme || branch) {
      query = `${branch} ${programme} internships summer`.trim();
    } else if (academicProfile?.skills && academicProfile?.major) {
      query = `${academicProfile.major} ${academicProfile.skills.slice(0, 2).join(" ")} internships summer`.trim();
    }
```

## 5. Verification Method
- Run `npm run build` from `c:/Users/Tanmay/OneDrive/Desktop/GradeFlow/gradeflow` to verify the build succeeds.
- Run `npx tsx scripts/test-matcher.ts` to confirm the code still executes properly and dynamic queries correctly fall back to skills.
