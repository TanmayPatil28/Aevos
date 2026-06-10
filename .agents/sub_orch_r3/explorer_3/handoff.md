# R3 API & DB Audit - Explorer 3 Handoff

## 1. Observation
- **`prisma/schema.prisma` Performance & Indexes:**
  - `Enrollment` has a `@@unique([userId, courseId])` constraint, which creates an index starting with `userId`. However, there is no separate `@@index([courseId])` to optimize queries looking up enrollments by course alone.
  - `UserMemory` contains an `Unsupported("vector")` field without an explicit Prisma index, which is standard for `pgvector` but might require raw SQL indexing for scaling.
- **N+1 Query Risks:**
  - In `app/api/sync/route.ts` (lines 37-83), the `POST` handler iterates over `payload.courses` in a `for` loop, executing `await prisma.course.findUnique`, optionally `prisma.course.create`, and `prisma.enrollment.upsert` sequentially for each course. This will cause N+1 query overhead during bulk synchronization.
- **Prisma Error Handling & Leaks:**
  - Most database endpoints (e.g., `app/api/sync/route.ts`, `app/api/academic/snapshots/route.ts`, `app/api/calculations/route.ts`) safely catch `dbError`, log it server-side, and return a generic `{ error: "Internal Server Error" }` without leaking raw Prisma stack traces.
  - `app/api/calculations/route.ts` effectively wraps known connection errors (`P1001`, `P1002`, `P1017`) into a user-friendly `503 Database temporarily unavailable`.
  - However, AI/External routes like `app/api/career/skill-gap/route.ts` (line 100) return raw details: `details: error.message, stack: error.stack`. This exposes internal paths and API failure details to the client.
- **Baseline Test Results:**
  - Executed `npm run test:unit`. The suite runs comprehensive checks across Deterministic Calculation, Zustand Stores, Forecasting, Ingestion, Career, Attendance, UDRE, and AI layers.
  - Output: `ALL MASTER UNIT TESTS PASSED SUCCESSFULLY!` (34/34 Engine, 23/23 Store, 12/12 Forecasting, 10/10 Ingestion, 16/16 Career, 14/14 Attendance, 29/29 UDRE, 8/8 AI Infrastructure).

## 2. Logic Chain
1. Searching for missing DB constraints showed `Enrollment` lacking a standalone `courseId` index, risking slow course-level analytics lookups.
2. Reviewing `app/api/sync/route.ts` revealed sequential DB calls within an array iteration. Batching these inside a transaction reduces latency.
3. Reviewing `catch` blocks in the `app/api` directory showed Prisma errors are securely masked, ensuring no SQL injection details or internal DB schema details reach the client.
4. Reviewing AI endpoints identified that `stack` and `message` properties are sent directly into the JSON response when an error is thrown, posing an information disclosure vulnerability.
5. Running tests validates that current API functionality is stable, providing a strong baseline before any structural edits are implemented.

## 3. Caveats
- I did not refactor `app/api/sync/route.ts` to implement the batching fix, as the scope focused on auditing and recommending strategies. 
- I did not modify `schema.prisma` due to potential migration conflicts; this should be done by an implementer.
- Network endpoints using external APIs (Gemini/OCR) were checked statically; no real traffic was intercepted.

## 4. Conclusion
The API endpoints successfully handle Prisma operations without leaking database schemas or SQL queries, and baseline tests are solid. However, performance can be enhanced by optimizing the sync loop and adding a missing database index. Non-Prisma endpoints currently leak sensitive stack trace information.

**Recommended Fix Strategy:**
1. **Schema:** Add `@@index([courseId])` to the `Enrollment` model in `prisma/schema.prisma`. Generate a migration.
2. **N+1 Queries:** In `app/api/sync/route.ts`, pre-fetch all incoming courses via `findMany`, bulk insert missing ones using `createMany(skipDuplicates: true)`, and execute the `enrollment.upsert` calls collectively within a `prisma.$transaction([...])`.
3. **Security:** Remove `error.stack` and raw `error.message` from the HTTP responses in `app/api/career/skill-gap/route.ts`, `app/api/terminal/ai/route.ts`, and `app/api/parse/route.ts`. Provide safe, generic failure messages instead.

## 5. Verification Method
- **Tests:** Rerun `npm run test:unit` after fixes to ensure regressions aren't introduced.
- **Schema:** Run `npx prisma format` and `npx prisma validate` after adding the index.
- **Error Leaks:** Purposely throw an error in `app/api/career/skill-gap/route.ts` and inspect the network response body to confirm `stack` is absent.
