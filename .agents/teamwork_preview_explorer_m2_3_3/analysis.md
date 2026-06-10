# Dashboard & Timeline Analysis

## 1. Timeline Empty State Unreachable Bug
**File:** `app/timeline/page.tsx`
**Observation:**
```typescript
const maxHistorySem = sortedHistory.length > 0 ? sortedHistory[sortedHistory.length - 1].semester : 0;
const maxCourseSem = store.courses.reduce((max, c) => Math.max(max, c.semester || 1), 1);
if (maxCourseSem > maxHistorySem) {
  sems.push({ ... title: `Semester ${String(maxCourseSem).padStart(2, '0')}`, status: 'current' ... });
}
```
**Logic Flaw:** If the user has zero courses (`store.courses.length === 0`), `reduce` evaluates to its initial value `1`. Thus `maxCourseSem` becomes `1`. Because `maxHistorySem` is `0`, `1 > 0` is true, and it pushes a placeholder "Semester 01" to the timeline.
As a result, `dynamicSemesters.length` will be at least `1`, rendering the empty state (`dynamicSemesters.length === 0`) completely unreachable.
**Fix Proposal:** Initialize `maxCourseSem` safely: 
`const maxCourseSem = store.courses.length > 0 ? store.courses.reduce(...) : 0;`

## 2. Academic Timeline Bar Graph Overflow (Visual Bug)
**File:** `components/dashboard/AcademicTimeline.tsx`
**Observation:** 
```typescript
const heightPercent = (entry.sgpa / maxSgpa) * 100;
<div style={{ height: `${heightPercent}px` }} className="absolute bottom-6 w-1 bg-indigo-500/20 rounded-t transition-all duration-500" />
```
**Logic Flaw:** The calculated `heightPercent` maps a 0-100 value to absolute `px`. A 10.0 SGPA yields `100px`. The wrapper column has `bottom-6` (24px). Thus, the bar shoots up by 100px from a point 24px above the bottom of the flex column (which itself is ~58px tall). This means the bar reaches up to 66px above the column. Since the parent wrapper padding-top (`pt-8`) is only 32px, the 100px bar visually overflows and overlaps elements above it (like the title "Academic Timeline").
**Fix Proposal:** Change the unit from `px` to `%` so it scales relative to the parent column, or apply a scaling factor (e.g. `height: ${heightPercent * 0.4}px`).

## 3. Dynamic Island Accessibility Violation
**File:** `app/(workspace)/dashboard/DashboardClient.tsx`
**Observation:**
```typescript
<button onClick={() => setMode("academic")} className="...">
  <Activity className="w-4 h-4" />
  <span className="hidden md:inline">Academic</span>
</button>
```
**Logic Flaw:** On mobile views (`< md`), the text span is hidden via `hidden md:inline`. There is no `aria-label` or `title` on the `<button>`. Screen readers will announce this as an empty or unlabelled button, creating a significant accessibility blocker for the primary dashboard navigation.
**Fix Proposal:** Add `aria-label="Academic View"` to the button, or use `.sr-only` instead of hiding the text completely.

## 4. Mobile UX - Detail Viewer Out of Viewport
**File:** `app/timeline/page.tsx`
**Observation:** The timeline view splits the interactive timeline nodes (left, `lg:col-span-5`) and the detail glass card (right, `lg:col-span-7 sticky top-32`).
**Logic Flaw:** On small screens (mobile), these stack vertically. If a user has 8 semesters, clicking "Semester 1" at the top of the screen changes the selected state, but the detail viewer is rendered far below the timeline list. There is no automatic scroll into view, forcing the user to scroll down manually to see the result of their click.
**Fix Proposal:** Implement a `useEffect` or click handler to scroll the detail viewer into view on mobile screens when a selection is made.

## 5. Calendar Date Parsing Timezone Bug
**File:** `components/dashboard/CalendarManager.tsx`
**Observation:**
```typescript
const target = new Date(dateStr); // dateStr is "YYYY-MM-DD"
```
**Logic Flaw:** Parsing `"YYYY-MM-DD"` via `new Date()` parses it as UTC midnight. When compared with `today` which is set to local midnight (`today.setHours(0, 0, 0, 0)`), timezone differences for users west of UTC (e.g., EST) will cause the event to evaluate to the day *before* the intended local date.
**Fix Proposal:** Parse as local time by replacing dashes with slashes (`new Date(dateStr.replace(/-/g, '/'))`) or appending local time `T00:00:00`.

## 6. Orphaned Component (Dead Code)
**File:** `components/dashboard/DashboardHeader.tsx`
**Observation:** The component is fully implemented but entirely unused across the project. `DashboardClient.tsx` explicitly notes `{/* Contextual Header replaced with PageHero */}`.
**Fix Proposal:** Delete `DashboardHeader.tsx` to reduce tech debt and bundle size, or preserve it if intended for future use.
