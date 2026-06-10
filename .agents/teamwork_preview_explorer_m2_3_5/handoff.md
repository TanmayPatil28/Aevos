# Observation
1. In `app/(workspace)/dashboard/DashboardClient.tsx:82`, `authoritativeSemesters` only checks `store.semesterHistory` to determine if a semester is locked. It ignores `store.courses`.
2. When a manual calculation for a new semester is first loaded, it passes the `authoritativeSemesters` check, generating courses with random IDs (`manual_${parsedSem}_${Math.random()}`) and injecting them via `store.hydrateFromSnapshot`.
3. In `stores/usmStore.ts:790` within `hydrateFromSnapshot`, the merge logic drops *all* existing courses for any incoming semesters (`const retainedCourses = state.courses.filter(c => !incomingSemesters.has(c.semester || 1))`) and unconditionally replaces them with the incoming courses.
4. Because `authoritativeSemesters` misses semesters that have courses but lack `semesterHistory`, `DashboardClient` constantly generates new random-ID courses for these semesters on every refresh and passes them to `hydrateFromSnapshot`, which drops all local modifications (e.g., custom attendance tracking or manual grade edits) for those semesters.

# Logic Chain
1. The bug's root cause is a two-part failure in how client state handles incoming server data (`initialCalculations` and `initialEnrollments`).
2. First, `DashboardClient` only locks out server updates for a semester if it's found in `store.semesterHistory`. However, a user can have active local modifications in `store.courses` for a current semester without having a completed `semesterHistory` entry for it.
3. Because the semester isn't considered "authoritative", `DashboardClient` re-processes the server props (`initialCalculations`) for it, assigning brand-new random IDs to the subjects every time the dashboard mounts.
4. It then passes these newly generated courses to `store.hydrateFromSnapshot`.
5. Second, `hydrateFromSnapshot` uses a destructive replace algorithm for regular semesters: it drops *all* local courses in the incoming semesters and substitutes them wholesale with the incoming array, completely obliterating any local state modifications (such as attendance tracking on those courses).

# Caveats
- The fix to `authoritativeSemesters` needs to handle the fact that a user's course list might contain semesters that legitimately *should* be updated by the DB snapshot if it has better data. However, the exact bug described specifically involves `initialCalculations` (manual calc history) aggressively converting into random IDs and stomping local courses. 
- Overwriting local changes during `hydrateFromSnapshot` can be mitigated by doing an ID/Code-based merge instead of a semester-wide drop, retaining `attendanceTotal` and other local properties.

# Conclusion
The state corruption bug on refresh is caused by `DashboardClient.tsx` failing to recognize active courses in `authoritativeSemesters`, compounded by `hydrateFromSnapshot` destructively replacing entire semesters of courses instead of merging them. 

**Fix Strategy:**
1. Update `DashboardClient.tsx:82` to include both `semesterHistory` and `courses` when determining `authoritativeSemesters`:
```javascript
const authoritativeSemesters = store.identity.hasAuthoritativeData 
     ? new Set([
         ...store.semesterHistory.map(s => s.semester),
         ...store.courses.map(c => c.semester)
       ])
     : new Set();
```
2. Refactor `hydrateFromSnapshot` in `usmStore.ts` to perform a graceful merge for courses. Instead of filtering out all `incomingSemesters`, find existing courses by `id` or `code + semester`, and selectively merge the incoming server data while preserving local-only properties like `attendanceTotal` and `attendanceBunked`.

# Verification Method
1. Modify a course's attendance in a semester that isn't yet in `semesterHistory`.
2. Refresh the dashboard.
3. Observe that the attendance modification persists instead of being wiped out, and the course ID does not change to a new random string. 
4. Verify by checking `usmStore.ts` `hydrateFromSnapshot` for graceful ID/code-based merging.
