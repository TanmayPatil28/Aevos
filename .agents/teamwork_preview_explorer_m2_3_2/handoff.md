# Dashboard & Timeline Handoff Report

## 1. Observation
- **Data Sync Failure**: In `components/dashboard/sync/DataSyncEngine.tsx` (lines 115-144), after a successful import, it posts to `/api/academic/snapshots` and reloads the page (`window.location.href = "/dashboard"`). In `app/(workspace)/dashboard/page.tsx` (lines 18-49), only `Calculation`, `Plan`, and `Enrollment` are fetched via Prisma. `activeSnapshotId` or `AcademicSnapshot` is not fetched or passed to `DashboardClient.tsx`.
- **Timeline State Corruption (Duplication)**: In `app/(workspace)/dashboard/DashboardClient.tsx` (lines 83-86 and 118), `startingSemester` is calculated as `Math.max(...store.semesterHistory) + 1`. Non-numeric semesters fall back to `startingSemester + i`. The developer added an `// EMERGENCY FIX:` at line 56 to nuke local storage if semesters exceed 12.
- **Timeline Effect Flaw**: In `app/timeline/page.tsx` (line 50), `dynamicSemesters` is assigned a new array via `.map()`. At line 74, `useEffect` depends on `[dynamicSemesters, selectedSem]`.

## 2. Logic Chain
- **Sync Failure**: Because `dashboard/page.tsx` doesn't fetch the newly saved `AcademicSnapshot` from Prisma, `DashboardClient.tsx` has no knowledge of it on reload. The Zustand store relies on hydration props. The UI never updates, effectively dropping the user's imported data.
- **State Corruption**: Because `startingSemester` is dynamic and based on the store's current maximum, parsing a non-numeric calculation continually pushes a new, incremented semester ID into the store on every single page refresh. This causes infinite duplication of the same calculation across pseudo-semesters.
- **Effect Flaw**: `dynamicSemesters` creates a new array reference per render. Passing it into `useEffect` without memoization causes the effect to run on every render pass.

## 3. Caveats
- I did not test the actual `DataSyncEngine` parser logic, only the state persistence handoff.
- The UI components (`AcademicDashboardView`, `TrendChartSection`) were skimmed and appear structurally sound; the issues are strictly in data ingestion and state hydration.

## 4. Conclusion
The Dashboard suffers from a critical data loss bug where imported snapshots are saved to Prisma but completely ignored on fetch. Furthermore, a severe hydration logic bug infinitely duplicates non-numeric calculations, corrupting the user's local timeline. Fixing `dashboard/page.tsx` to fetch and pass the snapshot, and fixing the dynamic ID assignment in `DashboardClient.tsx`, will resolve these core issues.

## 5. Verification Method
1. Open Dashboard and run a mock Sync via `DataSyncEngine`. Confirm that the Dashboard updates and displays the new active courses and timeline (verifies Snapshot fetch fix).
2. Create a manual Calculation with a semester named "Mock Semester". Refresh the dashboard 5 times. Check if `store.semesterHistory` grows by 5 identical entries (verifies deduplication fix).
