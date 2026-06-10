# Dashboard & Timeline Audit - Handoff

## 1. Observation

- **`app/timeline/page.tsx` line 64-67:** `store.courses.reduce` initializes `maxCourseSem` to `1` when `store.courses` is empty. Because `maxHistorySem` is `0`, `maxCourseSem > maxHistorySem` evaluates to `true`, pushing "Semester 01" to `dynamicSemesters`. This bypasses the `<div ...>No Academic History</div>` UI on line 146.
- **`components/dashboard/AcademicTimeline.tsx` line 53 & 60:** `heightPercent` assigns up to `100px` height to a bar `style={{ height: \`${heightPercent}px\` }}` positioned `bottom-6` inside a short `flex-col` wrapper padding with `pt-8` (32px). This causes the bar to overflow visually outside the timeline component bounds when SGPA is high.
- **`app/(workspace)/dashboard/DashboardClient.tsx` line 363-390:** Dynamic Island toggle buttons hide text with `<span className="hidden md:inline">` without providing `aria-label`s on the `<button>`, violating accessibility guidelines.
- **`app/timeline/page.tsx` line 160:** Layout uses `lg:col-span-5` for timeline and `lg:col-span-7 sticky top-32` for the detail viewer. On mobile (stacked layout), the detail viewer sits far below the interactive list, requiring users to manually scroll to see selected semester details.
- **`components/dashboard/CalendarManager.tsx` line 101:** `const target = new Date(dateStr)` parses `"YYYY-MM-DD"` as UTC midnight, which evaluates to the previous day in timezones west of GMT relative to local midnight `today.setHours(0,0,0,0)`.
- **`components/dashboard/DashboardHeader.tsx`:** Entirely orphaned component. Replaced by `PageHero` in `DashboardClient.tsx`.

## 2. Logic Chain

1. **Timeline Empty State:** Since `Array.reduce(fn, 1)` yields `1` for empty arrays, `1 > 0` always evaluates to `true`, effectively breaking the empty state screen.
2. **Graph Overflow:** An element with absolute bottom positioning and `100px` height inside a flex-container with only `32px` top padding will inevitably bleed upwards into surrounding layout components.
3. **Accessibility:** Hiding text on mobile devices without fallback label attributes prevents screen readers from conveying the button's action.
4. **Mobile UX Flow:** Because there's no programmatic scroll-to-view mechanism on node selection, mobile users experience a disconnect between their tap action and the updated detail UI that is off-screen.
5. **Timezone Evaluation:** `"2026-06-09"` -> `2026-06-09T00:00:00.000Z`. In UTC-5, this becomes `2026-06-08T19:00:00.000-0500`, causing day calculations (`Math.ceil`) to be off by up to 1 day.
6. **Code hygiene:** Orphaned code unnecessarily bloats the repository.

## 3. Caveats

- **Timezone edge case:** It assumes that the app does not intercept `Date` objects globally to force UTC context, but standard JS behavior applies here.
- **Academic Timeline UI:** It was inferred that the component is an upward-growing bar chart on a timeline. Replacing `px` with `%` or scaling down the pixel count are both viable fixes depending on the original design intent.

## 4. Conclusion

The Dashboard and Timeline views are structurally sound but contain critical functional, visual, and UX logic flaws that need addressing:
- The "No History" state in Timeline must be fixed by initializing `maxCourseSem` to `0` when empty.
- The `AcademicTimeline` component's bar height needs scaling (`px` to `%` or multiplied down) to prevent overflow.
- A11y fixes (aria-labels) must be added to the Dynamic Island mode toggle buttons.
- A scroll-into-view behavior is required for mobile devices interacting with the Academic Timeline.
- Date string parsing in `CalendarManager` must be localized (e.g., parsing with `T00:00:00`).
- Remove the orphaned `DashboardHeader.tsx`.

## 5. Verification Method

- **Timeline Empty State:** Run app without existing history/courses; verify "No Academic History" UI renders.
- **Graph Overflow:** Create a 10.0 SGPA entry; visually inspect `AcademicTimeline` widget on the dashboard to ensure the bar stays within the card wrapper.
- **Accessibility:** Inspect the DOM of the dynamic island buttons on a mobile viewport and confirm `aria-label`s are present.
- **Timezone:** Create a calendar event for tomorrow using `JSON` import; verify it says "1 Day" regardless of browser timezone (e.g., using Chrome DevTools sensors set to Pacific Time).
