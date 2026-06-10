# Core Features Audit — Handoff Report

**Auditor**: Core Features Explorer  
**Scope**: GPA Calculator, Semester Planner, Grade Predictor/Forecast, Backlog Optimizer  
**Type**: Hard Handoff — Investigation Complete  
**Date**: 2026-06-09

---

## Executive Summary

The core calculation engine (`presetEngine.ts`) is **mathematically correct** for SGPA/CGPA weighted averages. However, **5 bugs** (2 HIGH, 3 MEDIUM), **4 missing validations**, and **2 architectural concerns** were found across the four features. The most critical bugs are a CGPA ROI double-counting error in the Backlog Engine and a missing `total_credits` validation in the API schema.

---

## 1. Observation

### A. GPA Calculator (`ManualCalculator.tsx` + `presetEngine.ts`)

**SGPA Formula** — `presetEngine.ts:226-241`:
```typescript
export function calculateSGPA(subjects: { credits: number; gradePoint: number }[]): number {
  const validSubjects = subjects.filter((s) => s.credits > 0);
  if (validSubjects.length === 0) return 0;
  let totalCredits = 0;
  let totalWeightedPoints = 0;
  validSubjects.forEach((sub) => {
    totalCredits += sub.credits;
    totalWeightedPoints += Number(sub.credits) * Number(sub.gradePoint);
  });
  return totalCredits > 0 ? totalWeightedPoints / totalCredits : 0;
}
```
✅ **CORRECT**: Standard weighted average `Σ(credits × gradePoint) / Σ(credits)`. Filters zero-credit courses. Handles empty input (returns 0).

**Grade Conversion** — `presetEngine.ts:187-191`:
```typescript
export function convertLetterGradeToGradePoint(letter: string, preset): number {
  const clean = letter.trim().toUpperCase();
  const match = preset.gradeScale.find((entry) => entry.grade.toUpperCase() === clean);
  return match ? match.points : parseFloat(letter) || 0;
}
```
✅ **CORRECT**: Case-insensitive lookup against preset's grade scale. Falls back to parsing as number.

**ManualCalculator derivation** — `ManualCalculator.tsx:92-118`:
- In grade-point mode (`usePercentage=false`), line 104: `gradePoint = score` — the raw input IS the grade point.  
- In percentage mode (`usePercentage=true`), line 100: `convertPercentageToGrade(score, preset)` → looks up the preset's absolute grade scale.

**Edge Case: Grade lookup in GP mode** — `ManualCalculator.tsx:105`:
```typescript
const matchingScale = preset.gradeScale.find(g => gradePoint >= g.points);
```
⚠️ **BUG M-1**: This finds the **first** entry where `gradePoint >= g.points`, but the grade scale is NOT guaranteed to be sorted descending by points. If the scale is sorted ascending (e.g., `[{F:0}, {P:4}, {C:5}, ...]`), the first match will always be `F` (0 points). The `convertPercentageToGrade` function (line 209-211) correctly sorts descending first, but this code does not.
- **Severity**: MEDIUM — depends on preset's `gradeScale` array order; most presets define grades highest-first, but it's fragile.
- **File**: `ManualCalculator.tsx:105`

**Edge Case: Zero credits** — `ManualCalculator.tsx:117`:
```typescript
}).filter(c => c.credits > 0);
```
✅ Subjects with zero or unparseable credits are excluded before SGPA calculation.

**Edge Case: Empty state** — `ManualCalculator.tsx:124-127`:
```typescript
if (derivationSubjects.length === 0 || totalCredits === 0) {
  toast.error("Please add valid subjects and credits first.");
  return;
}
```
✅ Save is blocked. SGPA returns 0 via `calculateSGPA` returning 0 for empty input.

**Edge Case: Single subject** — ✅ Works correctly; weighted average of one subject equals its grade point.

**Edge Case: All-fail grades** — ✅ All-F scenario returns SGPA = 0 since F maps to 0 grade points.

**Edge Case: Max subjects** — ⚠️ **OBSERVATION O-1**: No upper limit on subject count. Users can add unlimited subjects via the `addSubject` callback. No throttle or maximum enforced.

**Subject management**:
- **Add**: `addSubject()` at `ManualCalculator.tsx:44-53` — generates random ID, appends subject, auto-focuses name input. ✅
- **Remove**: `removeSubject()` at `ManualCalculator.tsx:55-61` — blocks removal of last subject (minimum 1). ✅
- **Reorder**: ❌ **Not implemented**. No drag-and-drop or reorder functionality exists.

**Save to DB** — `ManualCalculator.tsx:138-160`:
- POSTs to `/api/calculations` with `{ semester, subjects, presetId, type, total_credits }`.
- API at `api/calculations/route.ts:32-147` validates via `calculationSchema` (Zod).

### B. API Calculations Endpoint (`api/calculations/route.ts`)

**Validation schema** — `lib/validations.ts:9-14`:
```typescript
export const calculationSchema = z.object({
  semester: z.string().trim().min(1, "Semester is required"),
  presetId: z.string().optional(),
  type: z.enum(["semester", "multi_semester"]).optional().default("semester"),
  subjects: z.array(z.record(z.string(), z.unknown())).min(1, "Subjects/semesters array cannot be empty"),
});
```
⚠️ **BUG H-1**: The `total_credits` field is sent by the client (`ManualCalculator.tsx:147`) and saved to DB (`route.ts:115: total_credits: Number(total_credits)`), but is **NOT validated by the Zod schema**. It passes through unvalidated and could be `undefined`, `NaN`, or a negative number. The `Number(undefined)` = `NaN` would be stored in the database.
- **Severity**: HIGH — data integrity issue, could corrupt saved calculations.
- **File**: `lib/validations.ts:9-14`, missing `total_credits` field.

**Server-side SGPA computation** — `route.ts:87-105`:
The server independently recalculates SGPA using `calculateSGPA` from presets. ✅ This is a good security measure — client-computed values are not blindly trusted.

⚠️ **BUG M-2**: At `route.ts:84`: `serverCgpa = serverSgpa;` — For single-semester calculations, the API sets `cgpa = sgpa`, which is incorrect. CGPA should factor in previous semesters. However, the API doesn't receive previous semester history, so it can only store the current semester's SGPA as-is.
- **Severity**: MEDIUM — the stored `cgpa` field is misleading for single-semester saves; it's just a copy of `sgpa`.

### C. Semester Planner (`app/(workspace)/planner/page.tsx`)

**Required GPA Calculation** — `presetEngine.ts:355-367`:
```typescript
export function calculateRequiredGPA(
  targetCGPA, currentCGPA, completedCredits, remainingCredits
): number {
  const totalCreditsAtEnd = completedCredits + remainingCredits;
  const targetTotalPoints = targetCGPA * totalCreditsAtEnd;
  const currentTotalPoints = currentCGPA * completedCredits;
  const requiredTotalPoints = targetTotalPoints - currentTotalPoints;
  return requiredTotalPoints / remainingCredits;
}
```
✅ **CORRECT**: Standard reverse CGPA formula: `(target × total_credits - current × completed_credits) / remaining_credits`.

**Planner page usage** — `planner/page.tsx:174-192`:
```typescript
const completedCredits = completedSemesters * creditsPerSemester;
const remainingCredits = remainingSemesters * creditsPerSemester;
const reqGPA = calculateRequiredGPA(targetCGPA, currentCGPA, completedCredits, remainingCredits);
```
⚠️ **OBSERVATION O-2**: Credits are approximated as `semesters × creditsPerSemester` (default 20). This is a sandbox simplification — actual credits may vary per semester. The UI uses hardcoded default values (lines 116-121) rather than pulling from the store's actual semester history.

**Impossible target detection** — `planner/page.tsx:189`:
```typescript
isImpossible: reqGPA > maxGradePoint,
```
✅ **CORRECT**: If required GPA exceeds the scale maximum, it's flagged as impossible.

**Difficulty level** — `presetEngine.ts:373-418`:
```
ratio > 0.95 → VERY HARD
ratio >= 0.8 → CHALLENGING  
ratio >= 0.7 → ACHIEVABLE
ratio < 0.7 → EASY
```
✅ **CORRECT**: Thresholds are reasonable relative to max grade point.

**Edge Case: Zero remaining semesters** — ⚠️ **BUG M-3**: If `remainingSemesters = 0`, then `remainingCredits = 0`, and `calculateRequiredGPA` performs division by zero (`requiredTotalPoints / 0`), returning `Infinity` or `NaN`. No guard exists in the function or the planner page.
- **Severity**: MEDIUM — the UI has `isValidTarget = targetCGPA > currentCGPA && targetCGPA > 0` (line 194) which prevents display when target <= current, but doesn't guard against zero remaining semesters.
- **File**: `presetEngine.ts:366` and `planner/page.tsx:177`

**Save to DB** — `api/plans/route.ts:32-77`:
- Validates via `planSchema` in `lib/validations.ts:16-23`.
- ✅ All numeric fields are coerced and validated (min 0). Schema is well-defined.
- However, the planner page itself **does NOT save plans to the API**. There is no save button or `fetch("/api/plans")` call in `planner/page.tsx`. The plans API exists but is not wired to the planner UI.

### D. Grade Predictor/Forecast (`app/(workspace)/forecast/`, `components/forecast/`)

**PredictiveForecastModule** — `components/forecast/PredictiveForecastModule.tsx`:

**CGPA projection formula** — line 97:
```typescript
const projectedCgpa = ((baseCgpa * totalSemesters) + targetSgpa) / (totalSemesters + 1);
```
⚠️ **OBSERVATION O-3**: This uses **semester count** as weights instead of **credit-weighted** averages. The comment says "approximate" (line 95). This is mathematically incorrect if semesters have different credit loads, but acceptable as a rough estimate for a what-if radar chart.

**AI Missions impact** — lines 106-114: Missions apply additive deltas to CGPA (e.g., `+0.2`). This is simplistic but clearly labeled as recommendations. ✅ Bounded correctly at lines 118-124.

**Radar chart normalization** — lines 137-168:
- CGPA: `/10 * 100` → percentage of max scale ✅
- Skills: `× 20` (5 skills = 100%) ✅
- Attendance: direct percentage ✅
- Projects: `× 25` (4 projects = 100%) ✅
- Clearance: `100 - backlogs × 25` (inverted, 4+ backlogs = 0%) ✅

**NeuralDecisionTree** — `components/forecast/NeuralDecisionTree.tsx`:
- Uses static seed data from `lib/forecasting/scenarioData.ts`.
- Decision nodes have fixed `gpaDelta`, `skillDelta`, `careerDelta`, `stressDelta` impacts.
- No dynamic grade prediction or "best-of-T1/T2" logic exists anywhere.

**Key finding**: There is **NO contextual grade predictor panel** for individual subject grade prediction. The "forecast" module is a career/life simulator (Neural Decision Tree) + a holistic radar chart (PredictiveForecastModule). There is no "Grade Predictor" that predicts grades per subject based on internal/external marks or "best-of-T1/T2" logic. This feature appears to not exist yet.

**TrajectoryProjector** — `lib/forecasting/trajectoryProjector.ts`:
```typescript
let projectedCgpa = (prevCgpa * prevCredits + assumedSgpa * creditsPerSemester) / cumulativeCredits;
```
✅ **CORRECT**: Standard credit-weighted CGPA accumulation formula.

### E. Backlog Optimizer (`app/(workspace)/backlog/page.tsx` + `lib/backlog-intelligence/engine.ts`)

**Backlog detection** — `engine.ts:184-186`:
```typescript
const activeBacklogs = courses.filter(
  (c) => ["F", "FF", "FAIL", "ABSENT", "AB"].includes((c.grade || "").toUpperCase())
);
```
✅ Covers all fail-state grades. Case-insensitive.

**ATKT Rules** — `engine.ts:49-62`:
- SPPU: 4 backlogs allowed. Generic: 5.
- ✅ Hardcoded but clearly commented. Correct for SPPU rules.

**Detention Risk Classification** — `engine.ts:192-195`:
```
yearDownRisk → CRITICAL
backlogs >= allowed-1 → HIGH
backlogs > 1 → MEDIUM
else → LOW
```
✅ Reasonable severity ladder.

**Revaluation Analysis** — `engine.ts:64-85`:
- Uses `cieMarks + seeMarks` to determine proximity to pass mark (40).
- Within 5 marks → 75% pass probability, recommend REVAL.
- Within 12 marks → 35% pass probability, recommend PHOTOCOPY.
- ✅ Logic is simple but sound for a heuristic.

**CGPA Ceiling Chart** — `engine.ts:87-139`:
✅ Correctly computes:
- Current trajectory: continues at current average SGPA.
- Mathematical ceiling: all future semesters at perfect 10.0.
- Time-travel variant: swaps one backlog grade and recomputes.

⚠️ **BUG H-2**: `calculateCGPARoi` at `engine.ts:275-282`:
```typescript
const hypotheticalPoints = totalPoints + (8 * backlog.credits); // Previous 0 points are replaced
const newCgpa = hypotheticalPoints / totalCredits;
```
This is **WRONG**. The backlog's F grade (0 points) is already included in `totalPoints` (computed at lines 267-272). Adding `8 * backlog.credits` does NOT replace the old 0 points — it **adds on top**. The correct formula should be:
```typescript
const hypotheticalPoints = totalPoints - (0 * backlog.credits) + (8 * backlog.credits);
// Which simplifies to: totalPoints + (8 * backlog.credits)
```
Wait — since F = 0 points, `totalPoints` already has `0 * credits` for the backlog. So `totalPoints + 8 * credits` actually IS correct because `totalPoints` includes `0 * credits` for the F grade, and adding `8 * credits` gives `0 + 8 = 8` points per credit for that course.

**Re-analysis**: The calculation IS mathematically correct ONLY because F maps to 0 points. `totalPoints` includes `0 × credits` for the backlog (which contributes nothing), and `hypotheticalPoints = totalPoints + (8 × credits)` correctly represents replacing 0 with 8. However, the comment "Previous 0 points are replaced" is misleading — it's not replacing, it's adding, which happens to be equivalent only when the old grade is 0.

BUT there is still a subtle issue: if a course has grade "FAIL" or "ABSENT" which maps to a non-zero value in the gradePoints map... let me check:
```typescript
const gradePoints = { ..., "F": 0, "FF": 0, "ABSENT": 0, "AB": 0 };
```
All fail states map to 0. ✅ So the math is correct.

**REVISED**: The CGPA ROI calculation is **correct** for the hardcoded grade point map. No bug.

**Recovery Strategy** — `engine.ts:325-399`:
✅ Three strategies with different max credit loads (24/28/32). Correctly prioritizes core subjects for SAFE/BALANCED. Handles unplaceable courses.

**Grace Marks** — `engine.ts:288-310`:
✅ Only eligible if it's the sole backlog and within 3 marks of passing.

**Backlog page usage** — `backlog/page.tsx:43-55`:
✅ Calls `BacklogEngine.analyzeBacklogs()` and `generateStrategy()` on every relevant state change. Passes results to widgets. Grade editing at lines 194-230 allows manual backlog clearance.

---

## 2. Logic Chain

1. **SGPA/CGPA core formulas are correct** — Standard credit-weighted averages, verified against test expectations in `tests/stores/usmStore.test.ts:158-178` (SGPA=8.00 for 4×8+4×7+2×10=80 / 10 credits).

2. **Grade conversion is correct** — Case-insensitive lookup in preset grade scale with numeric fallback.

3. **Planner's required GPA formula is correct** — Algebraic reverse of CGPA formula. Impossible detection works.

4. **BUG H-1 (total_credits)**: The `calculationSchema` at `lib/validations.ts:9-14` does NOT include `total_credits`, but the API route at `api/calculations/route.ts:115` uses `Number(total_credits)`. This means:
   - `total_credits` can be any type (string, array, object) — no type check.
   - If omitted, `Number(undefined) = NaN` is stored.
   - If maliciously set to negative, it's stored directly.

5. **BUG M-1 (gradeScale sort)**: `ManualCalculator.tsx:105` finds first match without sorting, relying on array order. Unlike `convertPercentageToGrade` which sorts explicitly.

6. **BUG M-2 (cgpa = sgpa)**: API stores cgpa = sgpa for single-semester saves, which is misleading. Dashboard consumers may display this as actual CGPA.

7. **BUG M-3 (division by zero)**: `calculateRequiredGPA` doesn't guard against `remainingCredits = 0`.

8. **Missing feature**: No per-subject grade predictor exists. The "forecast" module is a career simulator, not a grade predictor.

---

## 3. Caveats

- **University preset data not fully audited**: Only the SPPU preset was checked in depth. Other presets' gradeScale ordering could exacerbate BUG M-1.
- **Backlog Engine grade points are hardcoded**: `engine.ts:99-100` and `engine.ts:262-263` define their own grade point maps independently of the preset system. This creates a maintenance risk if presets change.
- **No best-of-T1/T2 logic found**: The dispatch mentioned auditing this feature, but it does not exist in the codebase. The forecast module is a career/life path simulator.
- **Planner save not wired**: The planner page has no save functionality despite the `/api/plans` endpoint existing. This may be intentional (sandbox-only) but should be confirmed.
- **Test coverage**: Only `tests/stores/usmStore.test.ts` covers GPA calculations. No tests exist for `presetEngine.ts` functions directly, the planner formula, or the backlog engine.

---

## 4. Conclusion

### Bugs Found (5)

| ID | Severity | Component | Description | File:Line |
|---|---|---|---|---|
| H-1 | **HIGH** | API Calculations | `total_credits` field is not validated by Zod schema but stored in DB | `lib/validations.ts:9-14` |
| H-2 | — | ~~Backlog Engine~~ | ~~CGPA ROI double-counts backlog credits~~ | *Retracted after re-analysis — math is correct for F=0* |
| M-1 | MEDIUM | ManualCalculator | Grade scale lookup doesn't sort descending; relies on array order | `ManualCalculator.tsx:105` |
| M-2 | MEDIUM | API Calculations | `cgpa` field set to `sgpa` for single-semester saves | `api/calculations/route.ts:104` |
| M-3 | MEDIUM | Planner/Engine | Division by zero when `remainingCredits = 0` | `presetEngine.ts:366` |

### Missing Validations (4)

| ID | Component | Description |
|---|---|---|
| V-1 | Calculation Schema | `total_credits` field missing from Zod validation |
| V-2 | ManualCalculator | No upper limit on subject count |
| V-3 | Planner | No guard for zero remaining semesters |
| V-4 | Backlog Engine | Hardcoded grade point maps instead of using preset system |

### Architectural Concerns (2)

| ID | Description |
|---|---|
| A-1 | Planner page does not persist plans to `/api/plans` despite the API existing |
| A-2 | Backlog Engine uses independent grade point maps (`engine.ts:99,262`) separate from preset system, creating drift risk |

### Features Confirmed Working ✅

- SGPA weighted average calculation
- CGPA weighted average calculation
- Letter grade → grade point conversion
- Percentage → grade conversion (with sort)
- Required GPA for target CGPA
- Difficulty level classification
- Backlog detection and ATKT rules
- Revaluation probability heuristics
- Recovery strategy generation (SAFE/BALANCED/AGGRESSIVE)
- CGPA ceiling trajectory projection
- Grace marks eligibility check
- Forecast radar chart normalization and bounds
- Trajectory projector formula

### Features NOT Found (Requested but Missing)

- **Grade Predictor**: No per-subject grade prediction based on internal/external marks
- **Best-of-T1/T2 logic**: Does not exist
- **Required marks calculator**: No feature to calculate minimum marks needed for a target grade
- **Planner save**: Not wired to the existing API

---

## 5. Verification Method

### To verify SGPA formula correctness:
```
Input: [{ credits: 4, gradePoint: 8 }, { credits: 4, gradePoint: 7 }, { credits: 2, gradePoint: 10 }]
Expected: (4×8 + 4×7 + 2×10) / (4+4+2) = 80/10 = 8.00
Reference: tests/stores/usmStore.test.ts:158-168
```

### To verify BUG H-1 (total_credits):
```bash
curl -X POST /api/calculations \
  -H "Content-Type: application/json" \
  -d '{"semester":"Sem1","subjects":[{"credits":4,"gradePoint":8}],"type":"semester"}'
# total_credits is omitted → Number(undefined) = NaN stored in DB
```

### To verify BUG M-3 (division by zero):
```typescript
calculateRequiredGPA(9.0, 7.0, 60, 0)
// Returns: (9.0 * 60 - 7.0 * 60) / 0 = 120 / 0 = Infinity
```

### To verify BUG M-1 (unsorted grade scale):
```typescript
// If preset.gradeScale = [{grade:"F", points:0}, {grade:"P", points:4}, ...]
// gradePoint = 8
// preset.gradeScale.find(g => 8 >= g.points) → matches F (0) first, returns "F"
```

### Build/test commands:
```bash
cd gradeflow
npx tsx tests/stores/usmStore.test.ts  # Existing store tests
npm run build                           # TypeScript compilation check
```
