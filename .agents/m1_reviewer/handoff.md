# Review Report: M1 Security & Perf Review

## Verdict: REQUEST_CHANGES

## Findings

### Critical: Build Failure & Broken CSP
- **What**: The application fails to build via `npm run build`. 
- **Where**: Next.js build step throws `unhandledRejection Error [PageNotFoundError]: Cannot find module for page: /_document`. Additionally, the worker's changes to `next.config.mjs` strip `'unsafe-inline'` from `script-src` without implementing nonces. This completely breaks Next.js hydration on the client side, as Next.js relies on inline scripts for App Router data injection.
- **Why**: Broken production builds and broken frontend hydration mean the product cannot be shipped.
- **Suggestion**: Revert the `next.config.mjs` CSP change until a proper nonce architecture is built in `middleware.ts` for Next.js, and investigate the dynamic import / component change that is crashing the Next.js build.

### Major: Uncommitted Changes
- **What**: The worker left all modifications (15+ files) staged/unstaged in the working directory without committing them.
- **Where**: Across the workspace (e.g., `middleware.ts`, API routes, `next.config.mjs`).
- **Why**: Other agents cannot rely on uncommitted code, and it breaks standard Git workflow.
- **Suggestion**: Ensure the worker commits the verified fixes.

### Major: Incomplete XSS Fixes
- **What**: The instruction mentions fixing XSS vulnerabilities, but `dangerouslySetInnerHTML` is still present in the application (e.g., `components/CalculationBreakdown.tsx:54`). No other definitive XSS sanitization (like DOMPurify) was introduced in the unstaged changes.
- **Why**: Security vulnerabilities remain active.
- **Suggestion**: Actively remove or sanitize `dangerouslySetInnerHTML` usage.

### Minor: Confusing Middleware Architecture
- **What**: AI authentication was added individually to the `app/api/...` route handlers (correctly returning 401s), but simultaneously `middleware.ts` was modified to explicitly categorize these AI routes as `isPublicRoute`.
- **Why**: While technically functional, explicitly marking protected endpoints as "public" in the middleware creates cognitive dissonance and architectural inconsistencies.
- **Suggestion**: Use the middleware to protect these API routes centrally, or remove them from `isPublicRoute`.

## Verified Claims
- Hydration Overhead Reduction → Verified (Pass): The worker correctly switched `SmartTimetableController`, `BunkCalculatorController` and others to `dynamic(..., { ssr: false })` in `app/layout.tsx`. Furthermore, expensive `blur-[120px]` CSS effects in `WorkspaceAtmosphere.tsx` and `BackgroundEffects.tsx` were successfully replaced with static gradients, massively improving hydration times.
- AI Endpoint Auth → Verified (Pass): Endpoints now correctly query `supabase.auth.getUser()` and block unauthenticated requests.
- Unit Tests → Verified (Pass): `npm run test:unit` executes correctly and all 29 core logic engines pass.
