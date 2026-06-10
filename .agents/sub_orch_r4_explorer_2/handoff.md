# Handoff Report: Fix Strategy for Security, Performance & Integrity Violations

## Observation
1. **Facade Code / Integrity Violations**: 
   - According to the Auditor report, facade logic was introduced in `app/api/academic/snapshots/route.ts` (POST and GET endpoints) returning mock JSON `mock_snapshot_${Date.now()}` or `{ snapshot: null }` on error.
   - Similarly, in `app/api/career/skill-gap/route.ts`, fallback facade code was used to catch AI generation failures and return hardcoded JSON data.
   - Upon inspection of the current working tree via `git diff` and reading these files, I observed that these modifications are currently **not present** in the working tree. `app/api/career/skill-gap/route.ts` properly catches errors and returns a 500 status (e.g., `return NextResponse.json({ error: 'Failed to analyze skill gap' }, { status: 500 });`). `app/api/academic/snapshots/route.ts` also correctly returns a 500 status on internal errors.
2. **Schema Migration Issues**:
   - The Challenger Report noted that adding `updated_at` without a default value breaks `prisma db push` for existing rows.
   - The report also indicated the `UserMemory` table's `embedding` column had an invalid B-tree index `@@index([embedding])`, and that `Calculation`/`Plan` IDs were changed to `String` while routes used `parseInt(params.id)`.
   - Inspection of `prisma/schema.prisma` shows that `updatedAt` now correctly uses `@default(now())`. The invalid `@@index([embedding])` has been removed, and the `vector` type correctly uses `Unsupported("vector")`.
   - In `app/api/calculations/[id]/route.ts` and `app/api/plans/[id]/route.ts`, the code has been updated from `parseInt(params.id)` to `params.id`.
3. **Security & Performance (R4 Objectives)**:
   - **Security**: 
     - In `app/api/parse/resume/route.ts` (lines 17-26), uploaded files are read entirely into memory using `file.arrayBuffer()` and converted to a `Buffer` without any file size limits or MIME type validation. This is an unbounded memory allocation vulnerability (OOM risk).
     - In `app/api/jarvis/route.ts` (lines 160-163), there is an insecure debug file write: `fs.appendFileSync('jarvis-error.log', ...)` that could lead to file system exhaustion or disk write bottlenecks in production.
     - In `app/api/terminal/ai/route.ts` (line 22), the model requested is `gemini-3.5-flash`, which does not exist and will fail outright. It must be `gemini-2.5-flash` or similar.
   - **Performance**: 
     - Hydration and bundle sizes were not explicitly analyzed with tools here, but reading large PDFs directly in memory and performing synchronous I/O (`appendFileSync`) inside a streaming response loop (`app/api/jarvis/route.ts`) are major performance bottlenecks.

## Logic Chain
- The cheating/facade code described in the Auditor's report was previously present but appears to have been reverted or corrected in the current workspace (likely by the orchestrator prior to Iteration 2).
- The Prisma schema errors and `parseInt` issues have also been corrected in the current tree.
- A true production fix strategy must strictly enforce these corrections and prohibit re-introducing the facade patterns. 
- For the actual R4 objectives, reviewing the core API routes reveals high-priority vulnerabilities: unbounded file uploads (`app/api/parse/resume/route.ts`), unsafe synchronous file system operations (`app/api/jarvis/route.ts`), and incorrect AI model strings (`app/api/terminal/ai/route.ts`).

## Caveats
- I did not test the Prisma migration on an actual remote Postgres database, assuming the corrected `@default(now())` suffices for `db push`.
- I have not run a full `npm run build` to extract exact bundle size metrics due to environment limitations, relying instead on static analysis of the codebase.

## Conclusion
**Recommended Fix Strategy:**
1. **Integrity Enforcement**: Explicitly ban any fallback logic that returns mock data (e.g. `mock_snapshot_${Date.now()}`) during API failures. All AI and DB failures must throw or return standard `500 Internal Server Error` responses. This is currently the case in the codebase, and it must remain this way.
2. **Schema Integrity**: Retain the current `prisma/schema.prisma` configuration which correctly utilizes `@default(now())` for `updatedAt`, drops the invalid `@@index([embedding])`, and retains `String` IDs for `Calculation` and `Plan`. Maintain the updated `params.id` string-usage in the respective API routes.
3. **High-Priority Security & Performance Fixes**:
   - **File Size/Type Limits**: In `app/api/parse/resume/route.ts`, enforce a strict file size limit (e.g., `< 5MB`) and validate the MIME type (`application/pdf`) before calling `file.arrayBuffer()`.
   - **Remove Synchronous Disk Writes**: Remove the `fs.appendFileSync` call in `app/api/jarvis/route.ts` to prevent production disk-locking and security risks. Use proper structured logging instead.
   - **Fix AI Model Config**: Update `gemini-3.5-flash` in `app/api/terminal/ai/route.ts` to a valid model version (e.g., `gemini-2.5-flash`).

## Verification Method
1. **Integrity**: Verify that executing `grep -r "mock_snapshot" app/api` and `grep -r "parseInt(params.id)" app/api` yields zero results.
2. **Schema**: Run `npx prisma db push --accept-data-loss` on a fresh database to ensure the schema successfully migrates.
3. **Security/Perf**: Review `app/api/parse/resume/route.ts` to verify file size checks are implemented, and `app/api/jarvis/route.ts` to ensure `fs.appendFileSync` is removed.
