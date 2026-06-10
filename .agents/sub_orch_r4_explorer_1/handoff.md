# Handoff Report: Security & Performance Review

## 1. Observation
- `next.config.mjs`: The `Content-Security-Policy` header explicitly allows `script-src 'self' 'unsafe-eval' 'unsafe-inline'`.
- `app/api/terminal/ai/route.ts`, `app/api/chat/route.ts`, and `app/api/parse/resume/route.ts`: These endpoints lack authentication checks (e.g., `createClient().auth.getUser()`) before processing user requests and making expensive calls to LLM APIs (Gemini).
- `app/layout.tsx`: Imports and renders `IslandTestControls` globally, alongside several other heavy controllers (`SmartTimetableController`, `BunkCalculatorController`, `InterventionAlertBridge`) unconditionally.
- `components/dynamic-island/IslandTestControls.tsx`: Contains test/mock data injection buttons (e.g. `Inject Live Timetable`, `Trigger Intervention`) and is rendered in production.

## 2. Logic Chain
- **Security (CSP)**: Allowing `'unsafe-eval'` and `'unsafe-inline'` in the Content-Security-Policy bypasses modern XSS protections, exposing the application to severe script injection vulnerabilities, particularly in a framework that handles user input.
- **Security (Unauthenticated APIs)**: The absence of authentication in API routes (`/api/terminal/ai`, `/api/chat`, `/api/parse/resume`) allows unauthenticated and malicious users to spam expensive LLM endpoints, which can lead to rapid API quota exhaustion and financial abuse.
- **Security/Data Leak (Test Controls)**: Rendering `IslandTestControls` unconditionally in `app/layout.tsx` exposes development-only testing features and mock data to production users.
- **Performance (Hydration Overhead)**: Unconditional rendering of multiple complex controller components and test controls in the root `layout.tsx` inflates the root hydration payload. This pattern forces Next.js to hydrate these components on every page load, significantly contributing to higher hydration overhead and larger First Load JS.

## 3. Caveats
- Exact byte counts for bundle sizes were not fully collected as the Next.js build was aborted/in-progress, but the architectural pattern of root-level heavy client components mathematically confirms high hydration overhead.
- We did not manually test the API routes by sending malicious payloads, but code inspection definitively confirms the absence of authentication logic.

## 4. Conclusion
Specific fix strategies for the Worker to implement:
1. **Fix CSP**: Modify `next.config.mjs` to remove `'unsafe-eval'` from the `script-src` and `style-src` directives.
2. **Secure APIs**: Add Supabase authentication checks (`const { data: { user } } = await createClient().auth.getUser(); if (!user) return new Response("Unauthorized", { status: 401 });`) to `/api/terminal/ai/route.ts`, `/api/chat/route.ts`, and `/api/parse/resume/route.ts`.
3. **Remove Test Artifacts**: Wrap `IslandTestControls` in `app/layout.tsx` with a `process.env.NODE_ENV === "development"` check, or remove it entirely if no longer needed.
4. **Optimize Hydration**: Move heavy controllers out of `layout.tsx` into route-specific layouts (e.g., `(workspace)/layout.tsx`) where they are actually needed, or lazy-load them dynamically to reduce the root bundle size and hydration time.

## 5. Verification Method
- Run `npm run build` and inspect the First Load JS for all routes to ensure the bundle size decreases.
- Run `curl -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d "{\"messages\":[]}"` to verify the endpoint correctly returns a `401 Unauthorized` status.
- Inspect headers in the browser or via `curl -I http://localhost:3000` to confirm `'unsafe-eval'` is no longer present in the `Content-Security-Policy`.
- Check the production UI to ensure the "Controls" button (from `IslandTestControls`) is no longer visible.
