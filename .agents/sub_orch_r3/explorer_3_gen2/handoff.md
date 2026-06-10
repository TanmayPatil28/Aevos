# Handoff Report

## 1. Observation
- `app/api/parse/route.ts` (lines 184-247) returns a hardcoded mock JSON block labeled as "ACTUAL JSPM Timetable data" when all Gemini models fail.
- `app/api/jarvis/route.ts` (lines 224-243) exposes the full stack trace to the client when an error occurs: `const message = error instanceof Error ? error.stack || error.message : "JARVIS encountered an unexpected error.";`.
- `app/api/sync/route.ts` (lines 38-49) attempts to process `payload.courses` using `Promise.all` and a `findUnique` + `create` pattern inside a transaction. This can lead to race conditions and unique constraint violations if duplicates exist.
- `app/api/chat/route.ts` lacks a top-level `try/catch` block, potentially causing unhandled rejections if JSON parsing or the `streamText` function throws.

## 2. Logic Chain
1. **Mock Fallback (`parse/route.ts`)**: Stripping the mock block requires handling the error genuinely. To avoid breaking the expected format for genuine failures, we should throw an error with the details so that the outer catch block catches it and returns the standard `{ error: "Internal Server Error" }` with a 500 status. This matches the existing behavior for OCR errors.
2. **Error Sanitation (`jarvis/route.ts`)**: The error handler currently passes `error.stack` into the structured JSON response. We must extract only `error.message` for the client to prevent security leaks (stack traces exposing internal paths/logic). The server should still log the full error object.
3. **Transaction Robustness (`sync/route.ts`)**: Concurrently resolving a mapping of courses with `findUnique` and `create` causes DB unique constraint issues when duplicates are present. The fix is to deduplicate the payload and use sequential processing (e.g., `for...of` loop) along with `upsert` to guarantee robust behavior inside the transaction.
4. **Unhandled Exceptions (`chat/route.ts`)**: Adding a top-level `try/catch` ensures that issues like malformed JSON payloads or network failures during the `streamText` request yield a graceful `500 Internal Server Error` response instead of crashing the Next.js API route.

## 3. Caveats
- Sequential processing of courses in `sync/route.ts` might slightly increase response time, but for typical sync payloads, it is negligible and prioritizes data integrity.
- Removing the mock fallback in `parse/route.ts` means the application will genuinely fail when the API quota is exhausted. The frontend must be equipped to handle 500 errors.

## 4. Conclusion
- **`parse/route.ts`**: Remove the mock data block (lines 184-247) and replace it with `if (!generatedJsonText) throw new Error("All Gemini models failed. Last error: " + lastError);`. This leverages the existing global try/catch block.
- **`jarvis/route.ts`**: Update the error handling to `const message = error instanceof Error ? error.message : "JARVIS encountered an unexpected error.";` and change the console log to output the raw `error` object.
- **`sync/route.ts`**: Refactor the courses processing block to deduplicate the `c.code` array first, then use a `for...of` loop to execute `tx.course.upsert` and `tx.enrollment.upsert` sequentially.
- **`chat/route.ts`**: Wrap the entire POST handler body in a `try...catch` block, returning a JSON `{ error: 'Internal Server Error' }` with status 500 inside the catch.

## 5. Verification Method
- **`parse/route.ts`**: Set a bad Gemini API key; expect a 500 error instead of mock data.
- **`jarvis/route.ts`**: Intentionally throw an error in the jarvis route and inspect the JSON response; `error.stack` should not be present in the output.
- **`sync/route.ts`**: Send a sync payload with duplicate course codes in the same array; expect successful database upserts without unique constraint errors.
- **`chat/route.ts`**: Send malformed JSON to the chat endpoint and ensure it returns a structured 500 JSON error.
