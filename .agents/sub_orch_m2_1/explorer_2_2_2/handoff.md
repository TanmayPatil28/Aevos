# Handoff: Grade Predictor & Backlog Optimizer Audit

## 1. Observation
- The **Backlog Optimizer** relies on `lib/backlog-intelligence/engine.ts` for calculations.
- Inside `calculateCGPACeiling`, the mathematical ceiling is computed by projecting perfect 10s for future semesters. However, it initially set `rollingCeilingPoints = totalPoints`, without adding points for backlogs that are cleared with a grade of 'O' (10 points). As a result, the ceiling CGPA was mathematically impossible (too low) because the current 'F' grades (0 points) were permanently weighing down the projection, despite the assumption that backlogs are cleared.
- In `app/(workspace)/backlog/page.tsx`, `initialPlan` was updated via a `useEffect` triggered by `selectedPathwayType`. Since `UnifiedSimulator` used `key={selectedPathwayType}` to force a remount, it remounted synchronously before the `useEffect` completed, resulting in the simulator receiving a stale `initialPlan` and permanently getting stuck on the wrong pathway data.
- The **Grade Predictor** (`PredictiveForecastModule.tsx` and `NeuralDecisionTree.tsx`) uses a deterministic math engine combined with AI narrative generation. The components are sound, with safe bounded projections (e.g., `Math.min(10, ...)` for CGPA limits).

## 2. Logic Chain
1. **CGPA Ceiling Bug**: Since a backlog clearance replaces the 0-point 'F' grade with passing grade points, the absolute mathematical ceiling *must* assume the highest possible grade (e.g., 10 points) for all active backlogs. By adding `backlogCredits * 10` to `rollingCeilingPoints`, the ceiling now accurately reflects the true maximum achievable CGPA if a student performs perfectly and clears all backlogs.
2. **React State Race Condition**: `UnifiedSimulator` remounts on `key` change, fetching the `initialPlan` from parent props. Because the parent updated `initialPlan` via `useEffect`, the prop was stale at the exact moment of remount. Bypassing `useEffect` and deriving `currentPlan = pathways ? pathways[selectedPathwayType] : null` directly during the render cycle guarantees the correct initial state.

## 3. Caveats
- The Grade Predictor's deterministic engine uses approximate math (`newCgpaRaw = currentState.currentCgpa + (decision.impact.gpaDelta * semesterWeight)`) instead of exact credit-weighted historical arrays. This is acceptable for a mockup/MVP predictive UI, but will need more precise credit weights for full accuracy in production.
- Some universities cap backlog clearance grades at 'B' or 'C' (e.g., 8 or 6 points), whereas our ceiling assumes 10 points for the absolute best-case scenario.

## 4. Conclusion
The logical bug in CGPA ceiling calculations and the React state race condition in the Unified Simulator were the primary high-priority issues within the Backlog Optimizer and Grade Predictor modules. Both issues have been successfully patched. The UX features (e.g., AI missions, Neural Decision Tree) operate smoothly with bounded limits. 

## 5. Verification Method
- Open the Backlog Optimizer (`/backlog`). View the `CGPACeilingChart` — the absolute ceiling line should now dynamically shift upwards depending on the credits of active backlogs being cleared.
- In the Backlog Optimizer, switch between "SAFE", "BALANCED", and "AGGRESSIVE" tabs in the Recovery Pathways widget. The `UnifiedSimulator` below it should instantly and accurately update to reflect the different strategy layouts without getting stuck on old state.
- Run project build using `npm run build` to ensure no type errors were introduced in the fixes.
