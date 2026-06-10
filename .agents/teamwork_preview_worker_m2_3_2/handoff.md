# Handoff Report

## 1. Observation
- `DashboardClient.tsx` used `hasHydrated` as a React state variable in a `useEffect` hook, which caused double execution in React 18 Strict Mode and re-renders. It also did not provide a skeleton when unmounted (or waiting for hydration state), causing layout flash issues.
- `DashboardClient.tsx`'s `authoritativeSemesters` logic only checked `store.semesterHistory` to decide which semesters were authoritative, ignoring `store.courses`.
- `usmStore.ts`'s `hydrateFromSnapshot` logic overwrote courses for incoming semesters by filtering out all existing local courses for those semesters instead of performing a granular ID/code merge.
- `app/(workspace)/timeline/page.tsx` used a simple `Math.max` over course semesters. If a single course had a rogue high semester (e.g., 99), it would jump to that semester and ignore other intermediate semesters, causing a phantom leap. Also, its `!mounted` fallback returned `null`.

## 2. Logic Chain
- Replaced `hasHydrated` state in `DashboardClient.tsx` with a `hasHydratedRef` (`useRef`) to strictly guarantee single execution of `hydrateFromSnapshot` in Strict Mode without triggering unnecessary re-renders. Added a `mounted` state with a skeleton layout.
- Updated `authoritativeSemesters` initialization to aggregate semesters from both `store.semesterHistory` and `store.courses` using `...store.courses.map(c => c.semester || 1)`.
- Replaced the wholesale filtering in `usmStore.ts` with a `.forEach` and `.findIndex` merge that checks both `c.id === incomingCourse.id` and `c.code === incomingCourse.code && c.semester === incomingCourse.semester`. It conditionally updates existing courses while preserving `attendanceTotal` and `attendanceBunked` using `Math.max`.
- In `timeline/page.tsx`, mapped `activeCourses` to a Set of unique semesters, filtered out those `> maxHistorySem` but bounded to `<= 12`, sorted them, and iterated over them to push multiple nodes safely. Replaced `return null` with a `<div className="animate-pulse...">` skeleton matching the UI structure.

## 3. Caveats
- Max allowed semester in the timeline is hardcoded to 12. This prevents extreme phantom leaps but means valid semesters > 12 won't show. (Most undergrad degrees don't exceed 10 semesters).
- We merge courses based on exact `code` and `semester` or `id` matches.

## 4. Conclusion
- Hydration issues with Strict mode have been resolved by moving to a `useRef`.
- UI flash has been reduced by introducing structural skeletons in both `DashboardClient.tsx` and `timeline/page.tsx`.
- State corruption from server synchronization has been mitigated by graceful data merging that preserves local attendance data and protects existing course entries.
- The timeline now smoothly handles multiple upcoming semesters without generating phantom nodes from stray invalid data.

## 5. Verification Method
- **Commands**: Run `npm run build` to verify type safety and compilation. Run `npm test` if tests exist for the timeline or store.
- **Files to Inspect**:
  - `app/(workspace)/dashboard/DashboardClient.tsx`
  - `stores/usmStore.ts`
  - `app/(workspace)/timeline/page.tsx`
- **Invalidation Conditions**: If timeline fails to render when courses have `semester: 12`, or if attendance data is lost upon page refresh.
