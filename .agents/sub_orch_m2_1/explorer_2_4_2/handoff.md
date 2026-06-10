# Handoff Report: Sub-milestone 2.4 - Authentication & OS Tools

## Observation
1. **Unprotected Routes**: In `middleware.ts` (lines 38-49), only `/dashboard` and certain `/api` routes are checked for authentication (`const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')`). The entire suite of Workspace and OS routes (`/career`, `/ledger`, `/planner`, `/identity`, etc.) is fully unprotected and accessible by unauthenticated users.
2. **Missing Sync Logic for Auth**: `app/register/page.tsx` states in comments (line 26): "The PostgreSQL trigger will sync their account to Prisma". However, checking the `supabase/` directory and `prisma/schema.prisma` reveals no migrations or trigger definitions. When a user signs up via Supabase, they will not be inserted into the Prisma `users` table, which will break subsequent API calls (like `/api/plans`) that rely on the foreign key `userId`.
3. **Local-Only State in OS Tools**: Components in the OS toolkit like Ledger (`components/os/ledger/LedgerCanvas.tsx`) rely on `useDomainStore` (`stores/os/domainStore.ts`). This store strictly uses Zustand's `persist` middleware to save state in `localStorage` under `os-domain-store`, completely ignoring the Prisma database schema (`Course`, `Enrollment`, `SkillProgress`). Data is not synced across devices.
4. **Minor Routing Race Condition**: In both `app/login/page.tsx` and `app/register/page.tsx`, successful authentication triggers `router.push("/dashboard")` immediately followed by `router.refresh()`. Calling `refresh()` right after a soft navigation can cause cache invalidation conflicts in Next.js.

## Logic Chain
- Because `middleware.ts` explicitly matches only `/dashboard`, all other OS and Workspace routes bypass the Supabase session check, violating the security requirements.
- Because the promised Postgres trigger doesn't exist, new users created via Supabase Auth will be missing in Prisma's `users` table. When they attempt to save calculations or plans, the Prisma foreign key constraint `user_id` will fail.
- Because `domainStore.ts` does not use `fetch` to communicate with Next.js API routes (e.g., `/api/academic`), the comprehensive database schema remains unused, and user progress is lost if they switch browsers.

## Caveats
- I did not verify if the NextAuth `getServerSession` references in `/api/plans/route.ts` are actively used; they might be remnants from a previous NextAuth implementation before migrating to Supabase SSR.
- The UI components for the OS Tools (Career, Identity, etc.) act largely as visual placeholders right now and don't seem to have deep backend logic wired yet, outside of what `domainStore.ts` handles locally.

## Conclusion
The authentication flow contains critical security and logic bugs. We must protect all application routes in middleware, implement the missing PostgreSQL sync trigger to maintain database integrity between Supabase Auth and Prisma, and refactor the OS tools' Zustand store to sync with backend API endpoints rather than relying solely on local storage.

## Verification Method
1. Inspect `middleware.ts` to confirm only `/dashboard` is protected.
2. Look inside the `supabase/` folder to confirm no migrations exist for the database trigger.
3. Review `stores/os/domainStore.ts` to see that it is entirely disconnected from `fetch` or any backend APIs.
4. Run `npm run lint` or `npx tsc` to verify if there are any other underlying TS errors in the UI components.
