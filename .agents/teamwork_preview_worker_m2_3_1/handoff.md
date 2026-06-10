# Sub-milestone 2.3 Dashboard & Timeline Audit Fixes

## Observation
1. `app/timeline` and `app/multi-semester` were located outside of `app/(workspace)`, breaking the layout.
2. `UnifiedDashboardView.tsx` contained hardcoded mathematical mock logic for the Placement Readiness Score instead of dynamically utilizing `intelligenceEngine`.
3. `app/(workspace)/timeline/page.tsx` was named `AcademicTimeline`, creating a component naming collision with `components/dashboard/AcademicTimeline.tsx`.
4. `components/dashboard/DashboardHeader.tsx` was an unused, orphaned component.
5. `dashboard/page.tsx` never queried the `AcademicSnapshot` database table, meaning initial authoritative snapshot data wasn't being hydrated on load.
6. `DashboardClient.tsx` used a `startingSemester + i` fallback that corrupted the `Zustand` store, causing infinite duplication of non-numeric manual calculations into the timeline state.
7. `app/timeline/page.tsx` used a `reduce` initialization bug where the initial accumulator was `1`, meaning the empty state was functionally unreachable.
8. `CalendarManager.tsx` parsed `YYYY-MM-DD` strings as UTC, causing "off-by-one" day rendering errors depending on the user's local timezone.
9. `AcademicTimeline.tsx` had a hardcoded `10` max scale, breaking logic for grading systems outside of the 10-point scale.
10. `AcademicTimeline` widget used `height: 100px` mappings combined with a wrapper that didn't specify bounded height properly for mapping.
11. `DashboardClient.tsx` dynamic island toggles lacked `aria-label` attributes.
12. On mobile screens, the timeline's detail viewer in `app/(workspace)/timeline/page.tsx` appeared after a potentially long list, disconnecting it from the interactive elements.

## Logic Chain
1. Moved `app/timeline` and `app/multi-semester` into `app/(workspace)`.
2. Updated `UnifiedDashboardView.tsx` to use `intelligenceEngine.calculatePlacementRisk` to extract `averageEligibility` as the Readiness Score, removing the mock logic.
3. Renamed `AcademicTimeline` to `TimelinePage` in `app/(workspace)/timeline/page.tsx` to avoid collision.
4. Deleted `components/dashboard/DashboardHeader.tsx`.
5. Updated `dashboard/page.tsx` to fetch `rawSnapshot = await prisma.academicSnapshot.findFirst(...)` and pass it down as `initialSnapshot`. Then, updated `DashboardClient.tsx` to hydrate from this snapshot if the store lacked authoritative data.
6. Fixed the infinite duplication in `DashboardClient.tsx` by using `match(/\d+/)` and outright skipping semesters that are non-numeric strings, preventing them from shifting `startingSemester` upward.
7. Updated the `reduce` fallback in `app/(workspace)/timeline/page.tsx` to initialize at `0` instead of `1`, so empty stores correctly trigger the empty state.
8. Added a `parseLocalDate` helper function to `CalendarManager.tsx` that manually parses `YYYY-MM-DD` and feeds it into `new Date(y, m - 1, d)`, avoiding timezone-shift bugs.
9. Imported `useUniversity` in `AcademicTimeline.tsx` and dynamically derived `maxSgpa` using `maxGradePoint`, fixing hardcoded scale bugs.
10. Added `h-[120px]` to the wrapper items in `AcademicTimeline.tsx` and adjusted the connection line to `bottom-[46px]`, properly bounding the visual percentage mappings.
11. Added explicit `aria-label`s to the three UI toggle buttons in `DashboardClient.tsx`.
12. Applied `flex-col-reverse` on mobile views inside `app/(workspace)/timeline/page.tsx` so the selected detail viewer pops to the top of the list, improving mobile UX.

## Caveats
No caveats. All tasks fully implemented.

## Conclusion
All dashboard, component architecture, layout routing, timezone logic, and state duplication issues for Sub-milestone 2.3 have been correctly repaired. The code passes the build and unit tests cleanly. 

## Verification Method
1. Verify the tests pass by running `npm run test:unit`.
2. Verify the application builds without errors via `npm run build`.
3. Inspect `components/dashboard/os-views/UnifiedDashboardView.tsx` to confirm genuine logic via `intelligenceEngine` is in place.
4. Open the dashboard locally and confirm no timeline infinite duplication occurs upon refreshing the page.
