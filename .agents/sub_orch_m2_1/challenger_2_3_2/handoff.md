# Handoff Report: Sub-milestone 2.3 - Dashboard & Timeline Audit Fixes

## Observation
1. **DashboardClient.tsx (Aggressive Data Wipe)**: In `app/(workspace)/dashboard/DashboardClient.tsx`, lines 56-61 implement an "emergency fix": 
```typescript
    if (store.semesterHistory.length > 12 || store.semesterHistory.some(s => s.semester > 15)) {
      localStorage.removeItem("gradeflow-usm-storage");
      window.location.reload();
      return;
    }
```
2. **Timeline page.tsx (Dead Empty State)**: In `app/timeline/page.tsx`, lines 64-65 compute the maximum semester values:
```typescript
    const maxHistorySem = sortedHistory.length > 0 ? sortedHistory[sortedHistory.length - 1].semester : 0;
    const maxCourseSem = store.courses.reduce((max, c) => Math.max(max, c.semester || 1), 1);
```
Following this, `if (maxCourseSem > maxHistorySem)` pushes a "current" semester to the `sems` array. 

## Logic Chain
1. **Data Deletion Bug**: The heuristic `store.semesterHistory.length > 12` assumes no legitimate user can have more than 12 semesters. This is factually incorrect. Students pursuing a dual degree (typically 5 years/10 semesters), encountering backs/re-evaluations, taking summer terms, or facing academic delays can legitimately exceed 12 semesters. When they do, the dashboard will silently wipe their entire local storage and refresh, permanently destroying their data.
2. **Unreachable Empty State**: When the store has no courses (`store.courses` is `[]`), the `reduce` function initializes and returns `1`. When `store.semesterHistory` is empty, `maxHistorySem` is `0`. Consequently, `1 > 0` is always true. The component then pushes a phantom "Semester 01" to the timeline. Because of this phantom injection, `dynamicSemesters.length` will never evaluate to `0`, making the empty state UI on lines 145-157 mathematically unreachable dead code.

## Caveats
- The timeline route protection (`router.replace('/dashboard')`) does trigger if `hasAuthoritativeData` is false. However, if a user *has* authoritative data but no history (e.g., brand new synced account), they will still see the phantom "Semester 01" instead of the intended empty state.

## Conclusion
The fixes applied by the worker are flawed. The emergency fix is excessively destructive to legitimate edge cases (dual degrees, prolonged study), and the timeline empty state is functionally broken. The worker must replace the aggressive local storage wipe with a safer deduplication strategy on load, and fix the timeline array reduction logic to correctly handle empty course lists.

## Verification Method
- Execute the simulation script created at `c:/Users/Tanmay/OneDrive/Desktop/GradeFlow/gradeflow/.agents/sub_orch_m2_1/challenger_2_3_2/simulate.ts` using `npx tsx <path>` to observe the state outcomes.
- For timeline: Manually set `courses: []` and `semesterHistory: []` in Zustand, and observe that `dynamicSemesters` yields length 1 instead of 0.
- For dashboard: Manually populate 13 valid semesters into the state and observe the client wiping local storage.
