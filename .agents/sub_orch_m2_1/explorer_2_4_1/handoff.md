# Handoff Report: Sub-milestone 2.4 (Authentication & Other OS tools)

## 1. Observation
- **Middleware Security Gap:** In `middleware.ts` (lines 38-49), authentication is only enforced for the `/dashboard` and `/api` paths:
  ```typescript
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')
  const isProtectedApi = request.nextUrl.pathname.startsWith('/api') && ...
  if (!user && (isDashboard || isProtectedApi)) { ... redirect ... }
  ```
  Routes like `/ledger`, `/career`, `/calculator`, and `/records` are not checked, allowing unauthenticated access.
- **Missing Auth-to-Prisma Sync:** Registration (`app/register/page.tsx`) uses `supabase.auth.signUp()`. However, neither `prisma/migrations` nor `supabase/migrations` exist. A search for `.sql` files (`find_by_name`) returned 0 results. There is no PostgreSQL trigger or API webhook to insert the created Supabase user into the Prisma `public.users` table (`prisma/schema.prisma` lines 40-61).
- **Incomplete UI Logic in OS Tools:** In `components/os/ledger/LedgerCanvas.tsx` (lines 20-25), the "Add Semester" context bar action has an empty `onClick: () => {}` handler. The "Manual Import" button (line 57) has no `onClick` handler. In `components/os/records/RecordsCanvas.tsx`, the flow relies on static mock data and states (`flowState`).

## 2. Logic Chain
1. **Security Vulnerability:** Because `middleware.ts` explicitly scopes protection to `/dashboard` and `/api`, Next.js will serve the React Server Components for `/(os)/*` and `/(workspace)/*` routes to anyone. If these pages attempt to fetch user data using Supabase server clients on load, they will crash; if they don't, they will show an invalid UI state to unauthenticated visitors.
2. **Data Integrity Failure:** Since Prisma relies on the `public.users` table for relational data (e.g., `Course`, `Plan`, `Calculation` have foreign keys to `userId`), any attempt by a newly registered user to save data will throw a foreign key constraint violation because their ID only exists in `auth.users`, not `public.users`.
3. **UX Deficits:** The missing `onClick` handlers in the Ledger and Records tools indicate that these features are only partially implemented shells. Users cannot manually add semesters or import manual records.

## 3. Caveats
- I did not test the actual crash behavior of the unprotected routes in a running server environment.
- The `career`, `identity`, and `forecasting` pages were observed to contain largely static or mocked data arrays. It is assumed these are placeholders pending full integration with the backend `SkillProgress` and `AcademicSnapshot` models.

## 4. Conclusion
The authentication and OS tools section suffers from two critical, launch-blocking bugs and several UX gaps:
1. **Critical:** Missing route protection in `middleware.ts`. **Fix Strategy:** Update `middleware.ts` to protect an explicit list of all application routes, or invert the logic to protect everything except a known `publicRoutes` array (`['/', '/login', '/register']`).
2. **Critical:** Missing user synchronization. **Fix Strategy:** Implement a Supabase PostgreSQL Trigger to auto-insert users into `public.users` upon signup, or build an `/api/auth/callback` route that validates the session and provisions the Prisma record before redirecting to `/dashboard`.
3. **UX/Logic:** Implement the missing modal/form state interactions for the `onClick` handlers in `LedgerCanvas.tsx` and connect `RecordsCanvas.tsx` to the `UploadZone` real API calls.

## 5. Verification Method
1. **Middleware Fix:** Start the dev server without being logged in and manually navigate to `http://localhost:3000/ledger`. You should be redirected to `/login`.
2. **Auth Sync Fix:** Register a new user via `/register`. Open the Prisma Studio (`npx prisma studio`) and verify that the newly created user ID appears in the `User` table.
3. **UI Fixes:** Click "Add Semester" in the Ledger tool and verify that an interactive modal or inline form opens.
