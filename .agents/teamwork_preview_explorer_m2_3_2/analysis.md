# Dashboard & Timeline Audit Analysis

## 1. Scope
Investigated Dashboard and Timeline views for data fetching issues, Prisma interaction logic flaws, and state management bugs.

## 2. Methodology
- Reviewed `app/(workspace)/dashboard/page.tsx` for server-side Prisma data fetching.
- Traced `DashboardClient.tsx` hydration logic and state injection.
- Analyzed `DataSyncEngine.tsx` data import pipeline and persistence.
- Examined `app/timeline/page.tsx` for rendering logic and state dependency flaws.

## 3. Key Findings

### Finding A: Silent Data Sync Failure (Dashboard Data Fetching Flaw)
**Observation:**
When a user imports academic data via `DataSyncEngine`, it successfully POSTs to `/api/academic/snapshots` which creates an `AcademicSnapshot` in the Prisma DB and updates `user.activeSnapshotId`. The engine then forces a page reload (`window.location.href = "/dashboard"`). However, `app/(workspace)/dashboard/page.tsx` only fetches `Calculation`, `Plan`, and `Enrollment` tables from Prisma. It completely ignores the `AcademicSnapshot`.

**Logic Chain:**
Since the `activeSnapshot` is never fetched by the dashboard page, it is never passed to `DashboardClient.tsx` as a prop. The client-side Zustand store (`useUSMStore`) relies on hydration to update its state. Without the snapshot prop, hydration bypasses the newly imported data. As a result, the UI remains entirely unchanged, and the imported data is effectively hidden from the user, causing severe user confusion.

### Finding B: Timeline Infinite Duplication Bug (State Corruption)
**Observation:**
In `DashboardClient.tsx`, there is a block of code that parses server-provided manual calculations and injects them into the state.
If a calculation's `semester` property is a non-numeric string (e.g., "Custom Plan"), the code dynamically assigns a semester ID:
`const parsedSem = s.semester.match(/\d+/) ? parseInt(...) : startingSemester + i;`
Where `startingSemester` is calculated as `Math.max(...store.semesterHistory.map(s => s.semester)) + 1`.

**Logic Chain:**
Every time the page loads, `startingSemester` increments based on the highest existing semester in the store. The non-numeric calculation is assigned this new ID and pushed into `store.semesterHistory`. On the next refresh, the exact same calculation is processed, `startingSemester` is now higher, and it assigns a *new* ID and pushes it *again*. This creates an infinitely growing list of duplicate semesters on every page reload. A developer even left an `// EMERGENCY FIX:` hack to wipe local storage if semesters exceed 12, acknowledging the symptom but missing the root cause.

### Finding C: Unnecessary Re-renders (Timeline Component)
**Observation:**
In `app/timeline/page.tsx`, `useEffect` relies on `dynamicSemesters` to set the initial active semester:
```typescript
  useEffect(() => {
    ...
  }, [dynamicSemesters, selectedSem]);
```
`dynamicSemesters` is constructed natively in the render body using `.map()`.

**Logic Chain:**
Because `dynamicSemesters` is recreated as a brand new array reference on every single render, the `useEffect` continuously fires. While it avoids an infinite loop because `setSelectedSem` is conditionally gated, it causes unnecessary execution and potential performance overhead. `dynamicSemesters` needs to be wrapped in `useMemo`.

## 4. Proposed Fixes
1. **Fetch `activeSnapshot` in Dashboard**: Update `dashboard/page.tsx` to fetch `user.activeSnapshotId` and the corresponding `AcademicSnapshot`, then pass it as `initialSnapshot` to `DashboardClient`. `DashboardClient` should then call `store.hydrateFromSnapshot(initialSnapshot)`.
2. **Fix Semester Deduplication**: Instead of using `startingSemester + i`, use a deterministic hash or specific ID for non-numeric semesters so they don't repeatedly append to the store.
3. **Memoize Timeline Array**: Wrap `dynamicSemesters` in a `useMemo` hook in `app/timeline/page.tsx`.
