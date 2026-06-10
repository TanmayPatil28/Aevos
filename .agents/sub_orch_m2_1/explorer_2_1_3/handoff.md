# Handoff Report: Sub-milestone 2.1 (GPA Calculator & Semester Planner Audit)

## 1. Observation
- In `app/(workspace)/calculator/ActiveSimulator.tsx`, the `derivationSubjects` useMemo omitted courses with an `F` grade via `.filter(c => c.grade && c.grade !== "F")`. This means that failed courses did not add their credits to the total denominator for SGPA calculations.
- In `app/(workspace)/planner/page.tsx`, the `MODULES` array omitted the `AcademicOptimizerModule`, making it inaccessible from the UI.
- In `components/planner/AcademicOptimizerModule.tsx`, the `<CalculationBreakdown>` component expected `result.totalCredits`, `result.remainingSems`, and `result.creditsPerSem`, but these were not provided by the `result` object constructed in `app/(workspace)/planner/page.tsx`.

## 2. Logic Chain
- Omitting `F` grades from SGPA/CGPA calculation is mathematically incorrect because the credits for failed courses must still be counted in the denominator while contributing 0 grade points to the numerator. The fix was to remove `&& c.grade !== "F"` from the filter.
- The `AcademicOptimizerModule` is a core module that provides predictive path generation & risk assessment. Adding it to the `MODULES` array makes it render properly in the Apple-style pill explorer UI.
- To prevent 0 credits being rendered in the `CalculationBreakdown` (Statutory Matrix) within `AcademicOptimizerModule`, the missing properties (`totalCredits`, `remainingSems`, `creditsPerSem`) were added to the `result` returned by `useMemo` in `page.tsx`.

## 3. Caveats
- No caveats. The `ManualCalculator.tsx` was also audited and confirmed to correctly calculate SGPA because it doesn't filter out `F` grades, and its form-submission fallback logic is correctly aligned with `presetEngine.ts`. API endpoint `/api/calculations` correctly performs safe server-side validation and fallback.

## 4. Conclusion
- The core SGPA/CGPA mathematical bugs and UI integration omissions for the GPA Calculator and Semester Planner have been fixed. The feature is structurally sound and functionally accurate.

## 5. Verification Method
- **Verify F-Grade logic:** Open ActiveSimulator, add a course with an `F` grade, and verify the denominator increases, effectively lowering the projected CGPA/SGPA as expected.
- **Verify Planner integration:** Open `/planner`, verify `Academic Optimizer` is selectable in the left menu, and the `Calculation Breakdown` component at the bottom of the optimizer displays the correct cumulative and planned credits.
- **Build verification:** Run `npm run build` and ensure the changes compile correctly without type errors.
