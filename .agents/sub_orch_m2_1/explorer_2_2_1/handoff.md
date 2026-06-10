# Handoff Report: Grade Predictor & Backlog Optimizer Audit

## Observation

1. **Grade Predictor Hardcoding**: 
   - In `components/forecast/PredictiveForecastModule.tsx` (lines 32-61), `AI_MISSIONS` is a hardcoded constant list of dummy missions (e.g., "Clear 1 Backlog", "Learn React/Next.js") with arbitrary impact integers.
   - At line 79, `const baseProjects = 1;` is hardcoded because `CareerState` in `stores/usmStore.ts` does not track project metrics.
   - The radar's clearance metric at line 163 (`Math.max(0, 100 - baseBacklogs * 25)`) artificially forces clearance to 0% if backlogs ≥ 4, which is an arbitrary hardcoded visual constraint.

2. **Backlog Deep-Dive Procedural Fake Logic**:
   - `lib/backlog-intelligence/historical.ts` uses static procedural if-blocks (`if (name.includes("data structure"))`) to generate fake syllabus weights.
   - `components/backlog/ResourceMatcherWidget.tsx` (line 62) uses static youtube thumbnails and hardcoded text ("Neso Academy") for resources.
   - `components/backlog/deep-dive/TimeTravelSimulatorWidget.tsx` (line 43) and `GraceMarksPredictorWidget.tsx` (line 17) use fake `setTimeout` cascades to simulate calculation and backend API submission times.

3. **UX Layout Clutter**:
   - `app/(workspace)/backlog/page.tsx` renders all Deep Dive intelligence widgets simultaneously inside a masonry grid (`grid-cols-1 md:grid-cols-12 auto-rows-min`), resulting in an overwhelming, endlessly long scrolling page.

## Logic Chain

- **Dummy Logic Degradation**: The Grade Predictor (`PredictiveForecastModule`) is functionally an interactive mockup rather than a working feature because its inputs (`AI_MISSIONS`) do not utilize the existing `InterventionEngine` or `AcademicHealthScore`. This needs integration with real state vectors.
- **Inaccurate Base Metrics**: Without a `projects` attribute in `CareerState` (verified in `stores/usmStore.ts`), the radar chart invents a static metric, invalidating holistic trajectory accuracy.
- **Artificial Limitations**: The Backlog logic (like `historical.ts`) scales poorly to unseen subject names since it relies on procedural strings, meaning any subject without a hardcoded match defaults to generic mock data.
- **Information Overload UX**: The continuous vertical mounting of all backlog widgets violates the "Focus Mode" objective. Users need a tabbed or conditionally expanded UI for the deep-dive intelligence widgets.

## Caveats

- I did not test the NeuralDecisionTree API route `/api/narrative` as I operate in a read-only local code context.
- Assume that extending `CareerState` in `usmStore.ts` to include an array of projects or an integer will not break downstream resume parsers.

## Conclusion

The Grade Predictor & Backlog Optimizer rely heavily on frontend dummy logic, procedural mock data, fake timeouts, and hardcoded variables. 

**Concrete Fix Strategy:**
1. **Grade Predictor**: Remove static `AI_MISSIONS` and map actual user `interventions` from `useUSMStore(state => state.interventions)`. Add `projects` to `CareerState` to correctly power the radar chart.
2. **Backlog Intelligence**: Strip out fake `setTimeout` delays in `TimeTravelSimulatorWidget` and `GraceMarksPredictorWidget`. Refactor `historical.ts` to fetch syllabus logic from an actual endpoint or structured database rather than regex matching.
3. **UX Optimization**: Refactor `app/(workspace)/backlog/page.tsx` to group the Deep Dive Intelligence widgets into a horizontally scrolling or tabbed interface instead of a vertical masonry column stack.

## Verification Method

1. **Verify State Expansion**: Ensure `CareerState` has been updated in `stores/usmStore.ts` and correctly hydrated.
2. **Review Forecast Code**: `view_file` on `PredictiveForecastModule.tsx` to confirm `AI_MISSIONS` is generated dynamically from `interventions`.
3. **UX Verification**: Start the Next.js server locally, navigate to `/backlog`, select a backlog course, and verify the deep dive section uses tabs or horizontal carousels instead of rendering 6 deep dive widgets consecutively down the page.
