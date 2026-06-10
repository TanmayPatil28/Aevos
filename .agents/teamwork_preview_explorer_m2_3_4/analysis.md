# DashboardClient UI Layer & Layout Analysis

## Overview
Challenger 2 identified a critical hydration mismatch in `DashboardClient.tsx` and state corruption on refresh. Adding a standard `mounted` check (returning `null` until mounted) will break the UI layout, causing a severe visual flash because `DashboardClient` owns the primary background, `WorkspaceContent` wrapper, and bottom navigation.

## Observations
1. **Layout Structure**: `DashboardClient.tsx` returns a `min-h-screen bg-black` div containing an immersive ambient background and a `WorkspaceContent` container. 
2. **Hydration Mismatch Risk**: If `if (!mounted) return null;` is used, the entire screen will flash black/empty during the initial client render tick before `useEffect` fires.
3. **State Corruption Cause**: The hydration logic uses a React state variable `const [hasHydrated, setHasHydrated] = useState(false)`. In React 18 Strict Mode, `useEffect` runs twice before the state update commits. This causes `store.hydrateFromSnapshot` to be invoked multiple times with the same server props (`initialCalculations`, `initialEnrollments`), leading to duplicate array merges and state corruption in the Zustand store.

## Proposed Fix Strategy

1. **Skeleton Fallback (UI Layout Preservation)**:
   Instead of returning `null`, the `!mounted` state must return the exact outer DOM structure with pulsing skeletons for the interactive components.
   ```tsx
   if (!mounted) {
     return (
       <div className="relative min-h-screen bg-black">
         {/* Ambient Backgrounds */}
         <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
           {/* ... existing blur divs ... */}
         </div>
         
         <WorkspaceContent className="space-y-8 relative z-10 pb-24">
           {/* Identity Bar Skeleton */}
           <div className="h-20 w-full rounded-2xl bg-white/5 animate-pulse border border-white/10" />
           {/* Hero Skeleton */}
           <div className="h-24 w-full max-w-2xl rounded-xl bg-white/5 animate-pulse mb-8" />
           {/* OS View Skeleton */}
           <div className="h-[600px] w-full rounded-[2rem] bg-white/5 animate-pulse border border-white/10" />
         </WorkspaceContent>
       </div>
     );
   }
   ```

2. **Ref-based Hydration Tracking (State Corruption Fix)**:
   Replace the `hasHydrated` state with a mutable `useRef` to guarantee the hydration logic strictly runs only once, surviving React 18 Strict Mode double-invocations.
   ```tsx
   const hydrationAttempted = useRef(false);
   
   useEffect(() => {
     if (!mounted || hydrationAttempted.current) return;
     hydrationAttempted.current = true;
     
     // Execute hydrateFromSnapshot logic...
   }, [mounted, initialCalculations, initialEnrollments, store, initialSnapshot]);
   ```
