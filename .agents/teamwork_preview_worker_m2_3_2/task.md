# Worker Task: 2.3 Dashboard & Timeline Audit Implementation (Iteration 2)

## Overview
You are Worker 2. You are fixing critical hydration mismatch and state corruption bugs found in Iteration 1.

## Issues to Fix

### 1. Hydration Mismatch & React Strict Mode Double Execution
- In `DashboardClient.tsx`, the `!mounted` fallback returns `null`, breaking the UI layout. Provide a structural skeleton instead of `null` so the layout doesn't flash.
- `DashboardClient.tsx` uses a React state (`hasHydrated`) to track hydration. In React 18 Strict Mode, `useEffect` double-executes and triggers `hydrateFromSnapshot` twice. Replace the state with a `useRef` to guarantee single execution.

### 2. State Corruption on Refresh (usmStore.ts & DashboardClient.tsx)
- `authoritativeSemesters` in `DashboardClient.tsx` only checks `store.semesterHistory` and completely ignores `store.courses`. If a user has active courses without a history entry, it generates random IDs. Fix `authoritativeSemesters` to check both.
- `hydrateFromSnapshot` in `usmStore.ts` drops all existing courses for incoming semesters. It must perform a graceful ID/code merge approach to preserve local user changes (e.g. attendance).

### 3. Timeline Phantom Semesters
- The logic in `app/(workspace)/timeline/page.tsx` uses a single `Math.max` over course semesters. If a rogue course is injected with a huge semester, it spawns phantom semester nodes. Fix it to bound the semester values and iterate over all unique upcoming semesters safely.

## Instructions
1. Implement the fixes in the codebase.
2. Ensure you build and test to verify.
3. Write a handoff report in `handoff.md` in your working directory `c:/Users/Tanmay/OneDrive/Desktop/GradeFlow/gradeflow/.agents/teamwork_preview_worker_m2_3_2/`.
4. Include build and test commands in your report.
5. Message me with a summary when complete.

**MANDATORY INTEGRITY WARNING**: DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
