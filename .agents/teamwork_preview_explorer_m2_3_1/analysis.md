# Dashboard & Timeline Component Analysis

## Core Findings

1. **Routing Flaws (`app/timeline` & `app/multi-semester`)**
   The application architecture clearly specifies `app/(workspace)` and `app/(os)` routing boundaries. However, both the `timeline` and `multi-semester` modules have been placed at the root `app` directory. This breaks the workspace layout (they don't get the standard canvas and intelligent side panels).

2. **Mock Logic inside `UnifiedDashboardView.tsx`**
   ```javascript
   // components/dashboard/os-views/UnifiedDashboardView.tsx
   const backlogs = store.semesterHistory.reduce((acc, sem) => acc + (sem.credits - sem.earnedCredits), 0);
   let readinessScore = 85;
   if (cgpa < 7) readinessScore -= 20;
   if (backlogs > 0) readinessScore -= 15;
   ```
   This is mock data representing "Placement Score". It should utilize the actual `intelligenceEngine` currently being used inside `CareerDashboardView.tsx`.

3. **Inflexible Scale Hardcoding (`AcademicTimeline.tsx`)**
   ```javascript
   // components/dashboard/AcademicTimeline.tsx
   const maxSgpa = Math.max(...sortedHistory.map(h => h.sgpa), 10);
   ```
   This breaks dynamic rendering for 4.0 scale institutions (where `10` will dwarf all values) and percentage scales (where `maxSgpa` just caps at the student's max percentage, failing to represent absolute percentage progression).

4. **Component Naming Collision**
   Both `app/timeline/page.tsx` and `components/dashboard/AcademicTimeline.tsx` use `export default function AcademicTimeline()`.
