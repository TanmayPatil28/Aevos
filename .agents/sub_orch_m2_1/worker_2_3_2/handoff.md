# Handoff Report

## Observation
1. In `app/(workspace)/timeline/page.tsx` (previously `app/timeline/page.tsx`), the bug was that `maxCourseSem` defaulted to `1` because of the reduce function's initial value `reduce((max, c) => Math.max(max, c.semester || 1), 1)`. If `store.courses` was empty, `reduce` would return 1.
2. In `app/(workspace)/dashboard/DashboardClient.tsx`, there was an emergency fix block that cleared `localStorage` unconditionally if `store.semesterHistory.length > 12` or any semester was `> 15`.

## Logic Chain
1. The `reduce` initial value being `1` meant that when there were zero courses, the timeline still thought the user was in semester 1, rendering the empty state unreachable. Modifying it to start at `0` and ignoring empty placeholder courses fixes the bug.
2. The hard limit on semester count in `DashboardClient.tsx` was aggressively wiping local storage for users with prolonged durations or dual degrees. Removing this block prevents legitimate data deletion.

## Caveats
No caveats. The timeline component will now properly render its fallback empty state when no courses/history exist, and the dashboard will no longer nuke valid long-term records.

## Conclusion
The bugs have been addressed by replacing the `reduce` default value logic in `app/(workspace)/timeline/page.tsx` and removing the emergency clear block in `app/(workspace)/dashboard/DashboardClient.tsx`.

## Verification Method
Run `npm run test:unit`. Review the code in both files to confirm the fixes.
