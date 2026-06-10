# 1. Observation
- `app/api/documents/route.ts` (POST): Destructures `fileName, fileUrl, fileType` directly from `await req.json()` with NO Zod or manual validation.
- `app/api/chat/route.ts` (POST): Accesses `messages[messages.length - 1]?.content` assuming `messages` is an array. If `messages` is missing or not an array, this throws an unhandled error.
- `app/api/jarvis/route.ts` (POST): Destructures `query, studentContext` directly from `req.json()`. Lacks size limits or type checking for payloads.
- `lib/validations.ts`: `calculationSchema` misses `total_credits`. `app/api/calculations/route.ts` attempts to destructure `total_credits` from `validation.data`. Since Zod strips unknown fields by default, this results in `undefined` and `Number(undefined)` is `NaN`, risking Prisma errors. `planSchema` lacks upper bounds.
- Authentication uses `supabase.auth.getUser()` which correctly verifies identity, but many files have dead NextAuth imports (`getServerSession`, `authOptions`), showing incomplete migration.
- `app/api/calculations/[id]/route.ts` and `app/api/plans/[id]/route.ts` (DELETE) correctly verify database resource ownership before deletion.
- Baseline test suite (`npm run test:unit`) passes (10 test suites, 29+ UDRE tests, 16 Career tests, etc., all passed), but these tests don't cover the API endpoints themselves, hence missing these validation bugs.

# 2. Logic Chain
- Unvalidated inputs in `documents/route.ts`, `chat/route.ts`, and `jarvis/route.ts` can cause TypeErrors (crashing the endpoint) or database insertion of malformed data.
- In `calculations/route.ts`, `validation.data.total_credits` is implicitly `undefined` because `calculationSchema` lacks the property. This breaks database integrity and reliability for storing calculations.
- The dead NextAuth imports are technical debt and can cause confusion. They should be removed for security codebase cleanliness.

# 3. Caveats
- Did not dynamically execute API endpoints via HTTP calls to verify the `NaN` Prisma crash in `calculations`, relying on static code analysis.
- Did not review every single endpoint line by line, but focused on the most critical ones based on domain (calculations, plans, chat, documents, jarvis).
- Assumed `supabase.auth.getUser()` is the standard source of truth for auth given its widespread usage across these endpoints.

# 4. Conclusion
The API endpoints have solid ownership checks but severe input validation flaws. Several endpoints bypass Zod schemas completely, and `lib/validations.ts` is missing fields required by the controllers. The NextAuth code is dead and should be stripped out. 

**Recommended Fix Strategy**:
1. Implement Zod validation schemas for `documents/route.ts`, `chat/route.ts`, and `jarvis/route.ts` payloads.
2. Update `calculationSchema` in `lib/validations.ts` to include `total_credits`.
3. Add upper limits to `planSchema` metrics.
4. Remove all unused `getServerSession` and NextAuth imports from `app/api/**/*.ts`.

# 5. Verification Method
- **Code Inspection**: Review `lib/validations.ts` and the `app/api` route handlers to confirm Zod is enforcing validation strictly.
- **Test suite**: `npm run test:unit` must continue to pass after all fixes.
- **Manual POST check**: A mock POST to `/api/documents` with an invalid payload should return a `400 Bad Request` instead of `500 Internal Server Error`.
