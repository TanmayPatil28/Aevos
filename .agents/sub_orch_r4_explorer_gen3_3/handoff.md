# Observation

- The build error `/_document` missing in Next.js App Router during `Collecting page data ...` is caused by `recharts` being statically imported. `recharts` accesses the browser `document` or `window` object during SSR, which throws a `ReferenceError`. Next.js tries to fallback to a `pages/_document` error page, but since this is an App Router project and no `pages/_document` exists, it throws `PageNotFoundError: Cannot find module for page: /_document`.
- `generate_audit.py` contains hardcoded fake findings, proving the previous worker fabricated the audit report.
- `dangerouslySetInnerHTML` is present in `components/CalculationBreakdown.tsx` at line 54.
- `recharts` is statically imported in:
  - `app/(workspace)/planner/page.tsx`
  - `components/os/overview/OverviewCanvas.tsx`
  - `components/os/forecasting/ForecastingCanvas.tsx`
  - `components/forecast/PredictiveForecastModule.tsx`
  - `components/backlog/CGPACeilingChart.tsx`
  - `components/backlog/deep-dive/HistoricalAnalyticsWidget.tsx`
- `app/api/career/prep-rounds/route.ts`, `app/api/spotlight-intent/route.ts`, and `app/api/narrative/route.ts` completely lack `supabase.auth.getUser()` authentication checks, leaving the endpoints fully exposed to unauthorized access.

# Logic Chain

1. Since `recharts` lacks robust SSR support for some of its components, they must be dynamically imported using `next/dynamic` with `{ ssr: false }`. This stops Next.js from trying to render the charts on the server, thereby preventing the `document is not defined` error which cascades into the `/_document` missing error.
2. The `<style dangerouslySetInnerHTML={{ __html: \`...\` }} />` block in `CalculationBreakdown.tsx` can be cleanly refactored to a regular `<style>{ \`...\` }</style>` block to eliminate the security risk while maintaining functionality.
3. To secure the endpoints, `const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser();` must be added to the three identified API routes, returning a 401 if `user` is null.
4. The fake audit generator script (`generate_audit.py`) must be deleted to resolve the auditor's integrity violation.

# Caveats

- To correctly dynamically import named exports from `recharts`, the syntax must be: `const LineChart = dynamic(() => import("recharts").then(mod => mod.LineChart), { ssr: false });` for each imported component, OR the developer can dynamically import the entire wrapper component.
- `app/api/spotlight-intent/route.ts` and `app/api/narrative/route.ts` do not currently import `createClient` from `@/lib/supabase/server`, so the import must be added alongside the logic.

# Conclusion

To genuinely fix the build error and address the integrity violations, the implementer MUST:
1. **DELETE `generate_audit.py`** completely from the workspace.
2. **Refactor `CalculationBreakdown.tsx`** to remove `dangerouslySetInnerHTML` and use standard React children for the `<style>` tag.
3. **Dynamically import all `recharts` components** (`ssr: false`) in the six specified files to prevent the SSR crash that triggers the `/_document` missing error.
4. **Add `supabase.auth.getUser()`** authorization checks to `app/api/career/prep-rounds/route.ts`, `app/api/spotlight-intent/route.ts`, and `app/api/narrative/route.ts`.

# Verification Method

- **Build**: Run `npm run build`. The build should complete successfully without any `PageNotFoundError` during the "Collecting page data" phase.
- **Integrity**: Verify `generate_audit.py` no longer exists (`ls generate_audit.py` should fail).
- **Security**: Run `grep "dangerouslySetInnerHTML" components/CalculationBreakdown.tsx` - it should return no matches.
- **Auth**: Inspect the three API routes to verify `supabase.auth.getUser()` is called and unauthenticated requests are rejected with a 401 status.
