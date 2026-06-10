# Worker Task: 2.3 Dashboard & Timeline Audit Implementation

## Overview
You are Worker 1. Implement the fixes for Sub-milestone 2.3 based on the synthesized findings from 3 Explorers.

## Issues to Fix

### 1. UI, Routing & Component Architecture
- `app/timeline` and `app/multi-semester` are missing from the `(workspace)` layout group, causing a broken UI structure. Move them into `(workspace)`.
- `UnifiedDashboardView.tsx` uses hardcoded mock logic for the "Readiness Score" instead of fetching/computing from `intelligenceEngine`. Fix this integration.
- Component naming collision between the timeline page and the timeline component (e.g. `AcademicTimeline`). Resolve it clearly.
- Delete the orphaned `DashboardHeader.tsx` component if unused.

### 2. State & DB Integration
- `DataSyncEngine` saves imported data to the `AcademicSnapshot` Prisma table, but `dashboard/page.tsx` never fetches this table. Update the dashboard to query it and pass it down.
- **Timeline Infinite Duplication**: `DashboardClient.tsx` uses a dynamic `startingSemester` logic that constantly re-appends non-numeric manual calculations into the Zustand store on every page refresh, corrupting the timeline. Fix the state logic to prevent duplication.
- `app/timeline/page.tsx` has a `useEffect` depending on an unmemoized array `dynamicSemesters`, causing unnecessary re-renders. Memoize or refactor to fix this.
- `CalendarManager.tsx` parses UTC dates without accounting for local timezones, leading to off-by-one errors in countdowns. Fix the date parsing logic to use local timezones safely.

### 3. Visuals & Accessibility
- Timeline "Empty State" UI is functionally unreachable due to a `reduce` initialization bug. Fix the array reduction to correctly trigger the empty state.
- `AcademicTimeline` widget overflows its container due to a `100px` height assignment inside a short wrapper. Fix the CSS/Tailwind classes.
- UI in `AcademicTimeline.tsx` has a hardcoded `10` max scale, breaking visualizations for 4.0 and Percentage grade systems. Make it dynamic based on the grading system.
- Dashboard's dynamic island mode toggles lack `aria-label`s. Add them for mobile accessibility.
- On mobile, the Timeline's detail viewer is disconnected from the interactive list. Update the layout so they work together seamlessly on mobile screens.

## Instructions
1. Implement the fixes in the codebase.
2. Ensure you build and test to verify.
3. Write a handoff report in `handoff.md` in your working directory `c:/Users/Tanmay/OneDrive/Desktop/GradeFlow/gradeflow/.agents/teamwork_preview_worker_m2_3_1/`.
4. Include build and test commands in your report.
5. Message me with a summary when complete.

**MANDATORY INTEGRITY WARNING**: DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
