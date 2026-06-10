# Synthesis Report: Security & Performance Review

## Consensus Findings
1. **Insecure CSP**: `next.config.mjs` allows `unsafe-inline` and `unsafe-eval`, opening up XSS vectors.
2. **Unauthenticated Endpoints**: Several endpoints are making expensive LLM API calls without auth:
   - `app/api/jarvis/route.ts`
   - `app/api/terminal/ai/route.ts`
   - `app/api/chat/route.ts`
   - `app/api/parse/resume/route.ts`
3. **XSS Vectors**: `dangerouslySetInnerHTML` is used in `app/page.tsx` and `app/(workspace)/multi-semester/page.tsx`.
4. **Hydration Overhead / Bundle Size**:
   - `app/page.tsx` has a root `"use client"` that forces the whole landing page into the client bundle.
   - `app/layout.tsx` imports heavy controllers (`SmartTimetableController`, `BunkCalculatorController`, etc.) and `IslandTestControls` unconditionally, adding massive JS payload on every route.

## Plan for Worker
1. **CSP**: Modify `next.config.mjs` to remove `unsafe-eval` and `unsafe-inline` (ensure no UI breakage).
2. **Auth**: Add Supabase auth checks (`const { data: { user } } = await createClient().auth.getUser();`) to the 4 API routes. Return 401 if unauthenticated.
3. **XSS**: Remove `dangerouslySetInnerHTML` from `page.tsx` and `multi-semester/page.tsx`.
4. **Performance**: 
   - Refactor `app/page.tsx` to remove root `"use client"` and extract interactive components.
   - In `app/layout.tsx`, wrap `IslandTestControls` with `process.env.NODE_ENV === 'development'` and use `next/dynamic` for heavy controllers.

## Output
Produce a completion report when done.
