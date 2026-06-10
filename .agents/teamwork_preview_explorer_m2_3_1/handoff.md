# Handoff Report: Dashboard & Timeline Audit

## Observation
1. `app/timeline/page.tsx` and `app/multi-semester/page.tsx` are located at the root `app` folder, completely outside the `app/(workspace)` routing group.
2. In `components/dashboard/os-views/UnifiedDashboardView.tsx` (lines 18-24), `readinessScore` is calculated using hardcoded mock logic (`let readinessScore = 85; if (cgpa < 7) ...`).
3. In `components/dashboard/os-views/CareerDashboardView.tsx`, `readinessScore` is correctly calculated using `intelligenceEngine.calculatePlacementRisk()`.
4. In `components/dashboard/AcademicTimeline.tsx` (line 29), the charting scale is defined as `const maxSgpa = Math.max(...sortedHistory.map(h => h.sgpa), 10);`.
5. The default export for `app/timeline/page.tsx` is named `AcademicTimeline`, which identically matches the component name in `components/dashboard/AcademicTimeline.tsx`.

## Logic Chain
1. The project's architecture mandates that all dashboard and primary app features live within `app/(workspace)` to inherit `WorkspaceCanvas` and side-navigation layouts. `timeline` and `multi-semester` skip this layout wrapper, causing a broken UI frame.
2. Using mock logic for `readinessScore` in `UnifiedDashboardView.tsx` means the user will see a conflicting or fake Placement Score compared to their actual calculated score in the `CareerDashboardView.tsx`.
3. The hardcoded `10` in `Math.max(..., 10)` for `AcademicTimeline.tsx` assumes a 10-point grading scale. For a 4.0 scale preset, a perfect 4.0 will visually render at 40% height. For a 100% scale, the chart will dynamically max out at the student's highest grade instead of a fixed 100%, causing misleading visual variance.
4. Exporting `AcademicTimeline` as the page component in `app/timeline/page.tsx` causes naming collisions and potential fast-refresh confusion with the UI component `components/dashboard/AcademicTimeline.tsx`.

## Caveats
- I did not deeply audit the database syncing mechanisms (`DataSyncEngine`) to confirm if offline saving in `multi-semester` works perfectly, focusing mainly on the UI, logic, and routing aspects.

## Conclusion
- **Routing:** Move `/timeline` and `/multi-semester` directories into `/app/(workspace)/`.
- **UI Consistency:** Update `UnifiedDashboardView.tsx` to compute `readinessScore` via `intelligenceEngine.calculatePlacementRisk()`.
- **Logic Flaw:** Modify `components/dashboard/AcademicTimeline.tsx` to read the scale from `useUniversity()` context and adjust `maxSgpa` dynamically based on `scaleMode` ("10", "4", "percent").
- **Clean Code:** Rename the component in `timeline/page.tsx` to `TimelinePage`.

## Verification Method
- **Routing:** Check if `/timeline` has the full workspace canvas UI via the dev server.
- **UnifiedDashboardView:** Modify the student's branch/skills in `useUSMStore` and verify if the placement score changes accurately without remaining at `~85`.
- **Academic Timeline:** Switch the university context to a 4.0 scale system and ensure the `AcademicTimeline.tsx` visualization bars reach full height for a 4.0 GPA.
