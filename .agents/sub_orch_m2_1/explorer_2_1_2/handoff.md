# Handoff Report: Milestone 2.1 - GPA Calculator & Semester Planner Audit

## 1. Observation
- In `app/(workspace)/calculator/ActiveSimulator.tsx` (Line 175), `derivationSubjects` is defined as `deferredSimulatedCourses.filter(c => c.grade && c.grade !== "F")`.
- In `app/(workspace)/calculator/ActiveSimulator.tsx` (Line 340), `GradeDropdown` options are generated using `gradeScale.filter(g => g.grade !== "F").map(g => g.grade)`.
- In `app/(workspace)/calculator/ManualCalculator.tsx` (Line 104), when not using percentage mode, `gradePoint` is directly assigned user's raw `score` input, but `matchingScale` correctly derives the `gradeStr`. The `gradePoint` passed to calculation is the raw input rather than the discrete statutory point.
- In `app/(workspace)/planner/page.tsx` (Line 194), the validation constraint for setting a target CGPA is hardcoded as `const isValidTarget = targetCGPA > currentCGPA && targetCGPA > 0;`.
- In `components/planner/ScenarioSimulator.tsx`, scenarios are mock strings with hardcoded descriptions and no functional tie-in to `useUSMStore` or calculations.

## 2. Logic Chain
1. By filtering out `c.grade !== "F"` in `ActiveSimulator.tsx`, failed courses are completely removed from the `derivationSubjects` array. This causes them to be ignored in the `totalCredits` sum in `calculateSGPA` (lib/presets/presetEngine.ts), artificially inflating SGPA/CGPA. Failed courses MUST contribute 0 points but full credits to the denominator.
2. The `GradeDropdown` excludes "F", meaning users cannot voluntarily simulate failing a course to see the CGPA impact, violating the purpose of an active sandbox.
3. In `ManualCalculator.tsx`, mapping a raw `score` input (like 8.5) directly to `gradePoint` bypasses discrete grading scales (which map, for instance, 8.5 to an "A" with 8.0 points). SGPA requires discrete grade point multiplication. Percentage mode behaves correctly, but manual mode does not.
4. The condition `targetCGPA > currentCGPA` in `planner/page.tsx` prevents users from planning defensive strategies (e.g., "What if I get a 7.0 for the rest of my degree, what will my CGPA be?"). A planner must allow maintaining or safely dropping to lower bounds.

## 3. Caveats
- `ScenarioSimulator.tsx` functionality is purely presentational. Rather than rewriting it as part of this bug fix, I recommend either hiding it or treating it as a later feature request to connect to the `useUSMStore` scenario manager.
- I assumed the standard behavior of grading scales is discrete points-based (as derived from presetEngine's percentage converter). If `score` in manual mode is strictly meant for custom 0-10 exact floating inputs, the logic would be fine, but the UI labels it "Statutory Accuracy".

## 4. Conclusion
The GPA Calculator and Semester Planner have logic flaws artificially inflating scores on failures, preventing failure simulation, and restricting realistic target modeling. 
**Fix Strategy:**
- `ActiveSimulator.tsx`: Remove `&& c.grade !== "F"` filters.
- `ManualCalculator.tsx`: Re-assign `gradePoint = matchingScale ? matchingScale.points : 0`.
- `planner/page.tsx`: Change validation to `isValidTarget = targetCGPA > 0;`. Handle `Math.max(0, reqGPA)`.

## 5. Verification Method
- Build project using `npm run build` or `npm run dev`.
- Run tests (e.g., `npx ts-node scripts/test-unit.ts` or similar).
- UI Verification: Add a failed course in the active simulator and verify SGPA drops correctly. Try selecting an "F" grade. Try setting a Target CGPA lower than Current CGPA in the planner.
