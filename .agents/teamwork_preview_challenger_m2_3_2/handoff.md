# Handoff Report

## 1. Observation
- In `app/(workspace)/dashboard/DashboardClient.tsx`, the UI reads `store.identity.hasAuthoritativeData` immediately to determine whether to render the Empty State or the full Dashboard. However, the store is hydrated from `localStorage` on the client. 
- `app/(workspace)/dashboard/DashboardClient.tsx` has a `useEffect` that processes `initialCalculations` from server props. For single-semester calculations, it maps subjects and assigns random IDs (`Math.random().toString(36).substr(2, 9)`), then injects them via `store.hydrateFromSnapshot`.
- In `stores/usmStore.ts`, `hydrateFromSnapshot` processes incoming `courses` by entirely replacing the courses for that semester (`const retainedCourses = state.courses.filter(c => !incomingSemesters.has(c.semester || 1));`).
- `app/(workspace)/timeline/page.tsx` implements a proper `mounted` check (`if (!mounted) return null;`), avoiding SSR hydration mismatches. However, it computes `maxCourseSem` using `store.courses`.

## 2. Logic Chain
1. **Hydration Mismatch in Dashboard**: Because Next.js server rendering uses the initial store state (`hasAuthoritativeData: false`), it outputs the Empty State HTML. The client's Zustand `persist` middleware synchronously reads `localStorage` before the first render. If the user has data, the client immediately renders the full dashboard, conflicting with the server's HTML and throwing a React Hydration Error.
2. **State Corruption on Refresh**: When a user navigates to the Dashboard, the `useEffect` fires. It converts `initialCalculations` into courses with random IDs and calls `hydrateFromSnapshot`. `usmStore` completely replaces the user's existing courses for those semesters. This means any manual edits, attendance data, or additions the user made to those courses are irreversibly wiped out and replaced with the raw server calculation every time the page refreshes.
3. **Timeline Corruption**: The Timeline dynamically adds a "Current Semester" if the max semester in `store.courses` exceeds `store.semesterHistory`. Because `DashboardClient.tsx` generates duplicate or rogue courses from `initialCalculations` (even if they lack proper credits or context), it artificially inflates `maxCourseSem`, causing phantom "current" or "upcoming" semesters to appear on the Timeline unexpectedly.

## 3. Caveats
- Next.js server was failing to build properly during my tests due to an internal `turbopack_runtime` caching bug when running `next start`, but static analysis and empirical knowledge of Next.js + Zustand persist middleware confirms these behaviors.
- State corruption relies on the presence of `initialCalculations` server props which trigger the `useEffect` execution flow.

## 4. Conclusion
The Dashboard suffers from a critical React Hydration mismatch due to missing `mounted` gates on UI conditionals. Additionally, both the Dashboard and Timeline suffer from state corruption on refresh because `DashboardClient` repeatedly re-injects `initialCalculations` with random IDs, overwriting local user state in `usmStore` and spawning phantom semesters on the Timeline.

## 5. Verification Method
1. Open the project in dev mode (`npm run dev`).
2. Login and import authoritative data so `hasAuthoritativeData` is `true`. Refresh the page on `/dashboard`. Observe the React Hydration mismatch error in the console.
3. Modify a course's name or attendance in the ledger for a semester that has a manual calculation. Refresh the page. Observe that the course resets/reverts to the server calculation state, wiping out the modifications.
4. Check the Timeline to see if phantom empty semesters have appeared due to rogue course injection.
