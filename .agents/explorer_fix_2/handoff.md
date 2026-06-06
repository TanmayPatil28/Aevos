# Handoff Report

**Work Product**: Dashboard Redesign Fix Strategy
**Profile**: Fix Integrity Violations
**Verdict**: FIX STRATEGY DEVELOPED

### Observation
1. **Failing Test Suites**:
   - `npm run test:unit` fails with a `MODULE_NOT_FOUND` error for `../tests/simulation/engines.test` because the entire `tests/` directory was deleted in a recent commit.
   - `npm run test:presets` fails with an assertion error `Expected 25, found 26`. Investigation of `lib/presets/presetRegistry.ts` shows a 26th preset (`PRESET_JSPM_WAGHOLI`) was added but the `test-presets.ts` assertion on line 76 was not updated.
2. **Invalid Test Script**:
   - `testsprite_tests/TC003_Save_a_calculated_result_to_the_dashboard.py` contains invalid Python syntax on line 78 (a trailing comma `,`) and on line 79 (stray `]}` characters at the end of the string).
3. **Facade Implementation**:
   - `components/dashboard/os-views/CareerDashboardView.tsx` uses a mock mathematical calculation for `readinessScore` (lines 14-21) and hardcoded arrays for the "Skills Matrix" (lines 85-105) and "Internship Roadmap" (lines 114-135).
   - Real, genuine intelligence logic exists in `lib/career/intelligenceEngine.ts` containing functions `calculatePlacementRisk`, `detectSkillGaps`, and `generateTimeline` that calculate these exact metrics based on academic state.

### Logic Chain
1. The missing `tests/` directory must be restored from git history to allow `test-unit.ts` to execute its imported test suites without throwing `MODULE_NOT_FOUND`.
2. The assertion in `test-presets.ts` must be updated from 25 to 26 to account for the newly added JSPM Wagholi preset, restoring the test to a passing state.
3. Removing the stray comma on line 78 and the stray `]}` on line 79 in `TC003_Save_a_calculated_result_to_the_dashboard.py` will fix the Python syntax error, allowing the script to be executed.
4. Replacing the hardcoded values in `CareerDashboardView.tsx` with calls to the existing `intelligenceEngine.ts` functions (`calculatePlacementRisk`, `detectSkillGaps`, and `generateTimeline`) using live data from `useUSMStore()` (`store.academic` and `store.career`) will eliminate the facade and implement genuine functionality without circumventing the audit.

### Caveats
- Restoring the `tests/` directory assumes that the deletion was accidental or part of a faulty refactoring step.
- The `generateTimeline` UI mapping might require slight structural adjustments to match the hardcoded UI's look and feel while using dynamic timeline tasks.

### Conclusion
To resolve the INTEGRITY VIOLATION, we must execute the following fixes:
1. **Fix tests**: Restore the `tests/` directory via `git restore` from the commit prior to deletion, and update `scripts/test-presets.ts` line 76 to expect `26` presets instead of 25.
2. **Fix Python UI Test**: Remove the trailing `,` on line 78 and the stray `]}` on line 79 in `testsprite_tests/TC003_Save_a_calculated_result_to_the_dashboard.py`.
3. **Fix Facade**: In `CareerDashboardView.tsx`, remove the mock score and hardcoded arrays. Import and use `calculatePlacementRisk` for the readiness score, `detectSkillGaps` combined with `ROLE_SKILL_MAP` for the Skills Matrix, and `generateTimeline` based on `store.academic.completedSemesters` for the Internship Roadmap.

### Verification Method
1. Run `npm run test:unit` and verify all tests pass without missing module errors.
2. Run `npm run test:presets` and verify the output indicates 58/58 tests passed successfully.
3. Run `python testsprite_tests/TC003_Save_a_calculated_result_to_the_dashboard.py` to confirm it executes without syntax errors.
4. Inspect `components/dashboard/os-views/CareerDashboardView.tsx` to confirm no hardcoded mock logic remains and that it utilizes functions from `lib/career/intelligenceEngine.ts`.
