# Sub-Milestone 2.2 Handoff: Grade Predictor & Backlog Optimizer Audit

## 1. Observation
- Investigated `app/(workspace)/forecast` and `app/(workspace)/backlog` pages, along with their components and the intelligence engine `lib/backlog-intelligence/engine.ts`.
- **Grade Predictor:** Uses `PredictiveForecastModule` and `NeuralDecisionTree`. The UI correctly computes hypothetical trajectory using target parameters, although next semester credits are approximated because actual future courses are unknown. The AI simulation calls a mock `/api/narrative` endpoint which streams responses for the neural decision tree.
- **Backlog Optimizer:** Uses `BacklogEngine` to compute recovery strategies, time travel CGPA, and ROI.
- Found logical bugs in `BacklogEngine` calculation:
  - `calculateTimeTravelCGPA` and `calculateCGPARoi` used only the current active `courses` list rather than the full `semesterHistory`. This resulted in incorrect base credit/point totals, which would skew ROI and projected CGPA values.
  - The `generateStrategy` and `calculateCGPACeiling` loops were hardcoded to stop at semester `8`. This would prevent generating recovery plans for students who required a year down (9th, 10th semesters).
- In the `UnifiedSimulator` component, moving a course to "UNPLANNED" and saving it did not properly unset its recovery semester in the central `usmStore` because `handleSavePlan` only iterated over `finalPlan` properties, skipping removed courses.

## 2. Logic Chain
1. Using the full `semesterHistory` provides the true total credits and SGPA points, resolving the discrepancy where `BacklogEngine` returned wildly inflated/deflated ROIs for Time Travel.
2. Replacing the hardcoded `8` limit with `Math.max(8, currentSemester + 4)` allows the optimizer to smoothly handle extension students (up to 12 semesters) when placing backlogs.
3. Modifying `handleSavePlan` in `app/(workspace)/backlog/page.tsx` to iterate over all active backlogs ensures that courses excluded from `finalPlan` (unplanned courses) correctly receive a `null` recovery semester in the store.

## 3. Caveats
- Grade Predictor's future semester assumption treats all remaining semesters as one aggregated term for calculating projected CGPA. This is mathematically standard without exact course-credit mappings for future semesters.
- The `/api/narrative` uses a mock placeholder stream. Integrating it with an actual AI model is left for production (the `AI_SDK` setup is correct, so replacing the mock text with a real completion call is straightforward).

## 4. Conclusion
The Grade Predictor is robust as a UI and forecasting module. The Backlog Optimizer's logic flaws in calculating true academic totals and handling edge cases (semesters > 8, unplanning courses) have been fixed. Both modules are now production-ready for their respective features.

## 5. Verification Method
- Open the `/backlog` route in the application. Ensure that selecting a deep-dive course and viewing its ROI correctly references the global CGPA rather than a course-subset CGPA.
- If current semester is simulated to be 8 and a backlog is present, the simulator should allow placing it into semester 9 or 10.
- Unplan a backlog in the Simulator, click "Commit Strategy," and verify it is not assigned to any recovery semester in the application state.
