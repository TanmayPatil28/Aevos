# Investigation Report: Integrity Violations & TS Errors

## 1. Observation
- The command `npx tsc --noEmit` fails with several errors in `app/api/**/*.ts` files.
- `app/api/parse/resume/route.ts` line 77 errors with `TS18046: 'error' is of type 'unknown'`, due to `details: error.message` inside the `catch(error)` block. The previous `catch(e: any)` was corrected to `catch(error)` but the `unknown` type was not handled.
- `app/api/calculations/[id]/route.ts`, `app/api/career/progress/route.ts`, and `app/api/plans/[id]/route.ts` error with `TS2307: Cannot find module 'next-auth/next'`. These imports are unused after migrating to Supabase auth.
- `app/api/chat/route.ts` has TS errors for mismatched `messages` type (`ModelMessage[]`) and missing `toDataStreamResponse` property (suggests `toTextStreamResponse`).
- `app/api/narrative/route.ts` contains an explicit integrity violation: `// Mock generation based on the decision context` returning hardcoded fake AI responses (`mockParagraphs`) and yielding them slowly via a `setTimeout` loop.
- `app/api/jarvis/route.ts` uses a facade for streaming: it fetches the complete AI response synchronously, then slowly yields each word in a loop using `await new Promise((resolve) => setTimeout(resolve, 20));` to fake a "typing" effect.

## 2. Logic Chain
1. The `catch(e: any)` syntax error mentioned in the prompt was already partially addressed by changing it to `catch(error)`, but it introduced strict TS errors because `error` defaults to `unknown`. Accessing `error.message` on `unknown` fails `tsc`. Type narrowing (`error instanceof Error`) is required.
2. The `next-auth/next` imports are legacy artifacts and need to be removed as the project uses Supabase now.
3. The mock responses in `narrative/route.ts` and fake streaming delays in `jarvis/route.ts` violate the core requirement of using proper, genuine AI implementations.
4. Correcting these TS issues and replacing the fake AI facades with genuine SDK calls (or standard non-faked JSON responses) will satisfy the requirements.

## 3. Caveats
- I did not run the frontend client to see how it reacts to `app/api/jarvis/route.ts` returning immediate JSON or a real text stream. If the frontend relies heavily on the fake newline-delimited JSON stream protocol, it must be updated or a genuine NDJSON stream from the LLM must be implemented without artificial delays.
- I ignored non-route TS errors (e.g. inside `components/` and `tests/`) as the user prompt specifically scoped the task to `route.ts` files and TS syntax/esbuild crashes from `catch(e: any)`.

## 4. Conclusion & Fix Strategy
To correct the remaining issues, a worker agent should apply the following edits:

**TypeScript Fixes:**
- `app/api/parse/resume/route.ts`: Change `details: error.message` to `details: error instanceof Error ? error.message : "Unknown error"`.
- `app/api/calculations/[id]/route.ts`, `app/api/career/progress/route.ts`, `app/api/plans/[id]/route.ts`: Remove the unused imports for `next-auth/next` and `@/lib/auth`.
- `app/api/chat/route.ts`: Cast `messages as any` or map to `CoreMessage[]` from the `'ai'` package, and change `result.toDataStreamResponse()` to `result.toTextStreamResponse()`.
- `app/api/export/route.ts`: Fix array typing at line 25 if necessary.

**Integrity & Facade Fixes:**
- `app/api/narrative/route.ts`: Delete `mockParagraphs` and the `setTimeout` streaming loop. Use `streamText` from `ai` or `@google/genai` to stream a genuine response to the user.
- `app/api/jarvis/route.ts`: Remove the fake `setTimeout` delay loop. Either return standard JSON immediately via `NextResponse.json(...)` (and update the client if needed) or use `generateContentStream` to stream the genuine token generation without artificial delays.

## 5. Verification Method
- **TypeScript**: Run `npx tsc --noEmit` and ensure all `route.ts` files pass without errors.
- **Integrity**: Run `git grep "setTimeout" -- "app/api"` and `git grep "mock" -- "app/api"`. These should yield no results for faked delays or mocked AI responses.
