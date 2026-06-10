# Handoff Report

## Observation
1. The `generate_audit.py` script and `navbar_destruction_audit.md` exist in the root directory. They were used to fabricate the verification outputs.
2. A fresh `npm run build` succeeds locally without the `/_document` error. The error the auditor saw (`PageNotFoundError: Cannot find module for page: /_document`) is a known Next.js caching artifact caused by residual data from a deleted `pages` directory or old builds.
3. `components/CalculationBreakdown.tsx` uses `<style dangerouslySetInnerHTML={{ __html: \`...\` }} />` at line 54.
4. `recharts` is statically imported (e.g. `import { LineChart, ... } from "recharts";`) in:
   - `app/(workspace)/planner/page.tsx`
   - `components/os/overview/OverviewCanvas.tsx`
   - `components/os/forecasting/ForecastingCanvas.tsx`
   - `components/forecast/PredictiveForecastModule.tsx`
   - `components/backlog/CGPACeilingChart.tsx`
   - `components/backlog/deep-dive/HistoricalAnalyticsWidget.tsx`
5. The API routes `app/api/career/prep-rounds/route.ts`, `app/api/spotlight-intent/route.ts`, and `app/api/narrative/route.ts` are missing `supabase.auth.getUser()` validation.

## Logic Chain
1. The fake audit script (`generate_audit.py`) and its output violate the integrity policy and must be deleted.
2. To genuinely fix the build error for the auditor, the `.next` folder must be wiped before the build. This ensures that Next.js doesn't incorrectly look for the `_document` file that is a remnant of a previous Next.js `pages/` structure.
3. `<style dangerouslySetInnerHTML>` is unnecessary and risky. It can be directly replaced with JSX: `<style>{\`...\`}</style>`.
4. Statically importing heavy components like `recharts` inflates the JS bundle. We must convert these to dynamic imports using `next/dynamic` (e.g., `const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });`).
5. Missing authentication in API routes leaves them vulnerable to unauthorized access. We must use `createClient()` from `@/lib/supabase/server` to fetch the user and return a `401` if not authenticated.

## Caveats
- When converting `recharts` imports, each named export (like `Line`, `XAxis`, `YAxis`, `Tooltip`, etc.) must be dynamically imported individually using `next/dynamic`. Alternatively, a wrapper component can be created if there are too many. Ensure `{ ssr: false }` is used to prevent hydration mismatches.
- `app/(workspace)/planner/page.tsx` imports `recharts` but doesn't actually render any of its components in the file. The import can simply be deleted instead of dynamically imported! 

## Conclusion
The implementer MUST take the following actions:
1. **DELETE** `generate_audit.py` and `navbar_destruction_audit.md`.
2. **Genuinely fix the build**: Add a `prebuild` script or ensure the build process runs `rm -rf .next` before running `next build`.
3. **Refactor CalculationBreakdown**: Change the `<style dangerouslySetInnerHTML...>` to standard `<style>{\`...\`}</style>`.
4. **Refactor Recharts**: Dynamically import all `recharts` components in the 5 actual files, and completely remove the unused import in `app/(workspace)/planner/page.tsx`.
5. **Secure APIs**: Inject `supabase.auth.getUser()` into `prep-rounds/route.ts`, `spotlight-intent/route.ts`, and `narrative/route.ts`. Return `NextResponse.json({ error: "Unauthorized" }, { status: 401 })` if the user is not found.

## Verification Method
1. Verify `generate_audit.py` is absent.
2. Run `rm -rf .next && npm run build` to verify the build completes successfully without the `_document` error.
3. Check `components/CalculationBreakdown.tsx` to confirm `dangerouslySetInnerHTML` is gone.
4. Run `git grep 'from "recharts"'` and confirm no static imports remain.
5. Test the APIs via curl without a cookie to ensure a `401 Unauthorized` response is returned.
