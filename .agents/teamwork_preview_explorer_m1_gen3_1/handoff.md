# Handoff Report: Job/Internship Matcher Fixes

## 1. Observation
- **Build Failure:** The `npm run build` command failed with the error `Dynamic server usage: Route /internships couldn't be rendered statically because it used cookies.` followed by an `ENOENT` error regarding `500.html`.
- **Query Bug in `lib/jobs/matcher.ts`:** On lines 15-23, the query generation logic is:
  ```typescript
    if (academicProfile?.academic) {
      const programme = academicProfile.academic.programme || "";
      const branch = academicProfile.academic.branch || "";
      if (programme || branch) {
        query = `${branch} ${programme} internships summer`.trim();
      }
    } else if (academicProfile?.skills && academicProfile?.major) {
  ```
  If `academicProfile.academic` exists but `programme` and `branch` are empty strings, the `else if` block is skipped completely, defaulting the query to the initial value.

## 2. Logic Chain
- The Next.js build tries to pre-render the `/internships` route statically by default. Because `matchInternships()` (imported from `./actions`) reads cookies, static generation throws a "dynamic server usage" error which crashes the build. Adding `export const dynamic = 'force-dynamic';` instructs Next.js to skip static generation and render the page dynamically at request time, solving the build error.
- In `lib/jobs/matcher.ts`, the nested `if` structure traps execution in the first branch whenever `academicProfile.academic` is defined, even if its properties are falsy. Refactoring the condition to directly check for `programme || branch` resolves the issue and allows the logic to fall through to checking skills and major.

## 3. Caveats
- I did not verify the contents of `app/internships/actions.ts` since the error specifically pinpointed `/internships` and dynamic usage from `cookies` during static rendering, which is a known Next.js behavior.
- I assumed `academicProfile.skills` is an array when the `else if` branch is reached, as implied by `.slice(0, 2).join(" ")` in the existing code. 

## 4. Conclusion
Two localized code changes will fix both the build issue and the query generation bug:
1. In `app/internships/page.tsx`, export a dynamic route config.
2. In `lib/jobs/matcher.ts`, refactor the query generation logic.

**Proposed Changes:**

**File:** `app/internships/page.tsx`
**Change:** Add the dynamic export at the top of the file, after imports.
```typescript
import { matchInternships } from "./actions";

export const dynamic = 'force-dynamic';

export const metadata = {
```

**File:** `lib/jobs/matcher.ts`
**Change:** Update lines 14-23 to correctly check properties.
```typescript
    // Extract key skills or interests from the profile to form a better query,
    // or default to a general software engineering internship query.
    let query = "software engineering tech internships summer";
    const programme = academicProfile?.academic?.programme || "";
    const branch = academicProfile?.academic?.branch || "";
    
    if (programme || branch) {
      query = `${branch} ${programme} internships summer`.trim();
    } else if (academicProfile?.skills && academicProfile?.major) {
      query = `${academicProfile.major} ${academicProfile.skills.slice(0, 2).join(" ")} internships summer`.trim();
    }
```

## 5. Verification Method
- **To verify the build fix:** Run `npm run build`. The build should complete successfully without dynamic server usage or `ENOENT` errors.
- **To verify the query generation fix:** You can add logging in `lib/jobs/matcher.ts` or write a quick manual test calling `matchInternshipsForProfile({ academic: {}, skills: ["React", "Node"], major: "Computer Science" })`. It should use the query `"Computer Science React Node internships summer"`.
