# Handoff: DashboardClient Hydration & Layout Fix Strategy

## 1. Observation
- `DashboardClient.tsx` is imported dynamically with `ssr: false`, but the Zustand store (`usmStore.ts`) uses `persist`, which can cause React hydration issues if accessed before the client is fully mounted.
- `DashboardClient.tsx` owns the main visual wrappers: `div.min-h-screen.bg-black`, ambient background blur divs, and `WorkspaceContent`.
- The current store hydration tracking uses `useState(false)` for `hasHydrated`. In React 18 Strict Mode, `useEffect` executes twice synchronously before `setHasHydrated(true)` commits, resulting in duplicate calls to `store.hydrateFromSnapshot`.
- `usmStore.hydrateFromSnapshot` performs complex array merging. Running it twice consecutively with the same `initialCalculations` overrides and corrupts `semesterHistory` and `courses`.

## 2. Logic Chain
- Adding a `mounted` check is the correct approach to ensure the Zustand store has successfully initialized from `localStorage` before rendering dependent UI components.
- However, if the `!mounted` fallback returns `null`, the entire application wrapper will disappear for a render tick, causing a severe layout flash. To maintain layout stability, the `!mounted` state must replicate the outer DOM structure and return pulsing skeleton boxes for the `AcademicIdentityBar`, `PageHero`, and the main OS View (`h-[600px]`).
- The state corruption on refresh is directly caused by the double-execution of the hydration `useEffect`. Replacing `useState` with `useRef` for tracking the hydration status ensures the block executes exactly once, preventing duplicate merges.

## 3. Caveats
- The skeleton loader heights (`h-20`, `h-24`, `h-[600px]`) are approximations based on the actual components. They might have slight variations from the rendered content depending on the user's viewport, but they are close enough to prevent layout shifts.
- I assumed the double-execution of `useEffect` is strictly due to React 18 Strict Mode in development. If there's another state change triggering it, the `useRef` will still successfully block it.

## 4. Conclusion
To safely implement the hydration mismatch fix without breaking the layout:
1. Implement the `mounted` check with a skeleton fallback that mimics the existing DOM structure (ambient backgrounds + `WorkspaceContent` + skeleton boxes).
2. Refactor the `hasHydrated` state to a `hydrationAttempted` `useRef`.
3. Gate the `hydrateFromSnapshot` effect behind `if (!mounted || hydrationAttempted.current) return;`.

## 5. Verification Method
- Implement the proposed changes in `gradeflow/app/(workspace)/dashboard/DashboardClient.tsx`.
- Start the development server (`npm run dev`) and navigate to `/dashboard`.
- Verify there is no black screen flash on hard refresh (the skeleton should appear seamlessly).
- Verify in the console logs that `[QA Instrumentation] Executing hydrateFromSnapshot` only prints exactly once, and the Academic Timeline/course list does not multiply or corrupt on refresh.
