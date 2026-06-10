# Handoff Report: Sub-Milestone 2.1 - GPA Calculator & Semester Planner Audit

## 1. Observation
- In `app/(workspace)/calculator/ActiveSimulator.tsx`, the `derivationSubjects` was observed filtering out failed courses: `.filter(c => c.grade && c.grade !== "F")`.
- In `lib/presets/presetEngine.ts`, the `calculateRequiredGPA` function divides `requiredTotalPoints` by `remainingCredits`.
- In `lib/presets/presetEngine.ts`, `getDifficultyLevel` classifies `ratio > 0.95` as "VERY HARD" but does not contain a specific branch for `ratio > 1`.
- In `app/(workspace)/planner/page.tsx`, `result.isImpossible` is correctly evaluated as `reqGPA > maxGradePoint`, but the UI renders `result.difficulty.label` which defaults to "VERY HARD" instead of communicating mathematical impossibility.
- In `app/(workspace)/calculator/ManualCalculator.tsx`, `usePercentage` relies on `convertPercentageToGrade`, which requires `minMarks` in the preset's grade scale.

## 2. Logic Chain
- **Active Simulator F-Grade Omission**: By filtering out `c.grade !== "F"`, failed courses contribute 0 points but their credits are also entirely removed from the denominator of the SGPA weighted average. This mathematically inflates the SGPA calculation by pretending the failed course was never taken.
- **Division by Zero in Planner**: If a user sets `remainingSemesters` to `0` in the Planner sandbox, `remainingCredits` evaluates to `0`. `calculateRequiredGPA` then divides by zero, yielding `Infinity`. 
- **Inaccurate Difficulty Reporting**: When a user inputs a target CGPA that is mathematically impossible (e.g., requires an 11.5 GPA on a 10.0 scale), the ratio becomes `> 1`. Because `getDifficultyLevel` lacks a `> 1` condition, it falls into the `> 0.95` branch, labeling an impossible trajectory as "VERY HARD", which is misleading.
- **Relative Grading Percentage Logic**: If a preset has relative grading (no `minMarks`), `convertPercentageToGrade` will match nothing and default to the last scale entry ("F"). 

## 3. Caveats
- Some modifications appear to have been recently made (e.g. `ActiveSimulator.tsx` diffs show `.filter(c => c.grade)` now exists). The implementer should verify `c.grade !== "F"` is completely eradicated from all calculation pipelines.
- I did not test the actual database storage or API endpoints (`/api/calculations`) for the Manual Calculator's saving logic.

## 4. Conclusion
The core calculation logic is robust, but there are critical edge cases regarding failed course handling and impossible trajectory UX.
**Concrete Fix Strategy:**
1. **presetEngine.ts**: 
   - Add a safety check in `calculateRequiredGPA` to return `Infinity` (or throw an error) cleanly if `remainingCredits <= 0`.
   - Update `getDifficultyLevel` to include: 
     `if (ratio > 1) return { label: "IMPOSSIBLE", color: "text-red-600", borderColor: "border-red-600/60 shadow-[0_0_15px_rgba(220,38,38,0.4)]", bgTint: "bg-red-600/5", subLabel: "Mathematically impossible" };`
2. **ActiveSimulator.tsx**:
   - Ensure `derivationSubjects` purely filters by `c => c.grade` and **does not** filter out "F" grades, ensuring failed credits remain in the denominator.
3. **ManualCalculator.tsx**:
   - For `convertPercentageToGrade`, consider adding a fallback or warning when using Percentage mode on a preset that lacks absolute `minMarks` boundaries.

## 5. Verification Method
- **Test Command**: Run project test suite for unit preset calculations.
- **Manual Verification**: 
  1. Open Semester Planner. Set Remaining Semesters to `0`. Ensure the app doesn't crash and displays "IMPOSSIBLE".
  2. Open Semester Planner. Set Target CGPA to a value requiring > 10.0 SGPA per semester. Ensure the difficulty displays "IMPOSSIBLE" instead of "VERY HARD".
  3. Open Active Simulator. Add a course with an "F" grade. Verify that the simulated SGPA drops (because the denominator increases), rather than remaining unchanged.
