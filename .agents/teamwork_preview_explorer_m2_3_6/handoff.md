# Handoff Report: Timeline Component Logic

## 1. Observation
- In `app/(workspace)/timeline/page.tsx`, the timeline derives its nodes by first mapping `store.semesterHistory` to "completed" semesters.
- It then calculates `maxHistorySem` (the highest semester in history) and `maxCourseSem` (the highest semester among all active courses).
- If `maxCourseSem > maxHistorySem`, it blindly pushes a single "current" semester node for `maxCourseSem` (`id: maxCourseSem`, `title: Semester ${maxCourseSem}`).
- `DashboardClient.tsx` injects manual calculations and enrollments into `courses`. It parses `s.semester.match(/\d+/)[0]`, which can yield arbitrarily large numbers if the input string contains large numbers (e.g., from rogue test data or bugs).
- If a rogue course with an inflated semester (e.g., semester 99) is injected, `maxCourseSem` becomes 99, spawning a phantom "Semester 99" node in the timeline and skipping any valid intermediate upcoming semesters.

## 2. Logic Chain
1. `DashboardClient.tsx` processes external/unvalidated calculations from the backend/props and injects courses. If a rogue semester string contains a high number, `parsedSem` is inflated.
2. These courses are saved to `store.courses`.
3. `TimelinePage` calculates `maxCourseSem` by taking `Math.max` across all course semesters.
4. If a single rogue course has `semester = 99`, `maxCourseSem` becomes 99.
5. The timeline then renders a single "current" semester block for Semester 99, completely skipping over legitimate upcoming semesters (like Semester 5 or 6) because it only checks `if (maxCourseSem > maxHistorySem)` and pushes a single node.

## 3. Caveats
- I did not verify the exact structure of the rogue calculations in `DashboardClient` (e.g., what the exact payload of the rogue calculation is), but the logic vulnerability in `TimelinePage` is clear regardless of the source.
- I assumed a standard undergraduate timeline rarely exceeds 12-14 semesters.

## 4. Conclusion
The timeline component is brittle because it relies on a single `Math.max` over unvalidated course data to determine the "current" semester, which causes it to leap to absurd semester numbers if state anomalies occur. 
**Fix Strategy**: 
Update `app/(workspace)/timeline/page.tsx` to:
1. Extract all unique semesters from `activeCourses` that are strictly greater than `maxHistorySem`.
2. Filter out unrealistic semester values (e.g., `sem > 15`).
3. Iterate over the sorted unique upcoming semesters and push them as separate nodes (e.g., the first one as 'current', others as 'upcoming').
4. This ensures all active non-history semesters are visible, and phantom semesters are bounded.

## 5. Verification Method
- Modify `TimelinePage` to use the set of unique filtered semesters instead of just `maxCourseSem`.
- Temporarily inject a dummy course in `usmStore` with `semester: 99`.
- Verify that the timeline component either ignores Semester 99 (if bounded) or correctly displays it without breaking the rendering of intermediate valid semesters.
