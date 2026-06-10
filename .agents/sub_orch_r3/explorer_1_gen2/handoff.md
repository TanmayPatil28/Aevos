# Forensic Analysis & Remediation Strategy

## Observation
1. **`app/api/parse/route.ts`**: The codebase returns hardcoded, explicit data labeled "ACTUAL JSPM Timetable data" when the AI extraction fails (lines 184-247), constituting an INTEGRITY VIOLATION by bypassing the parsing functionality.
2. **`app/api/jarvis/route.ts`**: The route catches exceptions but explicitly leaks the stack trace to the frontend (`error.stack || error.message`).
3. **`app/api/sync/route.ts`**: The transaction iterates through courses with `Promise.all` and performs sequential `findUnique` and `create` operations. Since `Promise.all` executes them concurrently, duplicate course codes in the payload cause race conditions, resulting in a Prisma Unique Constraint Violation that aborts the transaction.
4. **`app/api/chat/route.ts`**: The main request lifecycle in the `POST` handler is not wrapped in a top-level `try/catch` block, allowing unhandled exceptions (like JSON parsing errors or DB connection failures) to crash the endpoint abruptly.

## Logic Chain
1. By removing the mock fallback in `parse/route.ts` and replacing it with a hard error throw, we respect the original intent of the logic and gracefully handle API quota exhaustion without violating integrity.
2. `jarvis/route.ts` leaks sensitive internal application paths when returning `error.stack`. Modifying the catch block to return a generic "JARVIS encountered an unexpected error" masks the backend internals.
3. The Prisma N+1 unique constraint in `sync/route.ts` occurs because concurrent `findUnique` operations resolve to `null` before any `create` commits. Executing these check-and-create operations sequentially via a `for...of` loop (or utilizing a single sequential upsert) guarantees atomicity inside the transaction.
4. Wrapping `chat/route.ts` in a `try/catch` block establishes a robust fallback, returning a structured HTTP 500 response instead of terminating the Node process abruptly.

## Caveats
- Using a `for...of` loop in `sync/route.ts` executes database queries sequentially, which may slightly increase transaction time compared to parallel execution. However, this is negligible for small payloads and is required for data integrity.

## Conclusion
The INTEGRITY VIOLATION and reviewer feedback can be fully resolved with the following remediation strategy:
1. **`app/api/parse/route.ts`**: Delete lines 184-247. Replace it with `throw new Error("Failed to parse document. All AI models exhausted.");`
2. **`app/api/jarvis/route.ts`**: In the `catch` block (line 225), remove `error.stack` and hardcode a safe, generic message for the client.
3. **`app/api/sync/route.ts`**: Refactor the `Promise.all(payload.courses.map(...))` to an IIFE containing a `for (const c of payload.courses)` loop to enforce sequential `findUnique` and `create` operations.
4. **`app/api/chat/route.ts`**: Wrap the entire body of `export async function POST` within a `try { ... } catch (error) { ... }` block that returns a generic JSON 500 error.

## Verification Method
1. Inspect `app/api/parse/route.ts` to ensure no mock fallback exists.
2. Induce an error in Jarvis (e.g., throw a dummy error) and observe that the response contains no stack trace.
3. Push a sync payload with duplicate course codes and verify that the sync transaction succeeds without crashing Prisma.
4. Supply invalid JSON to `/api/chat` and ensure it responds gracefully with an HTTP 500.
