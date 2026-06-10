# Handoff Report: Job/Internship Matcher Plan

## 1. Observation
- **Supabase & DB Schema:** The database uses Prisma (`prisma/schema.prisma`). Student profiles are stored within the `AcademicSnapshot` model in the `academic_profile` JSON field. Supabase auth utilities exist in `lib/supabase/client.ts` and `lib/supabase/server.ts`.
- **Dependencies:** `package.json` contains required dependencies: `@tavily/core`, `@ai-sdk/google`, `ai` (Vercel AI SDK), and `zod`.
- **Environment & Keys:** API keys (`TAVILY_API_KEY`, `GEMINI_API_KEYS`) are loaded from `.env`. The project already has an excellent key rotation utility in `lib/ai/keys.ts` (`getTavilyKey()`, `getGeminiKey()`).
- **Target Files:** `/app/api/internships/route.ts` (backend matcher), `scripts/test-matcher.ts` (testing script), and `/app/internships/page.tsx` (frontend) do not yet exist and must be created.

## 2. Logic Chain
1. **Backend Matcher (`app/api/internships/route.ts`)**: 
   - Needs to authenticate the user (using `createClient()` from `@supabase/ssr` or via `userId` query parameter).
   - Must fetch the latest `AcademicSnapshot` for the user via `prisma.academicSnapshot.findFirst({ orderBy: { createdAt: 'desc' } })`.
   - Uses `tavily` to perform a real-time search for open roles (e.g., "software engineering internships").
   - Uses Vercel AI SDK's `generateObject` with `google('gemini-1.5-flash')` and a `zod` schema to enforce structured JSON output. The prompt will cross-reference the `academic_profile` (CGPA, courses) with Tavily results to compute a compatibility score and reasoning.
2. **CLI Script (`scripts/test-matcher.ts`)**:
   - A standalone script runnable via `npx tsx`. It will initialize Prisma, fetch a mock user's snapshot, query Tavily, and pipe the result to Gemini to output the scored JSON array directly to the console.
3. **Frontend (`app/internships/page.tsx`)**:
   - A client component (or server component) that fetches the JSON array from `/api/internships` and renders it cleanly, showing job title, company, score out of 100, reasoning, and a link to apply.

## 3. Caveats
- **Mastra Framework:** Although the prompt mentioned Mastra, it is not deeply integrated into the current AI provider setup (which heavily uses raw fetch or Vercel AI SDK). The plan utilizes `@ai-sdk/google` (`generateObject` + `zod`) because it natively handles the required structured JSON output seamlessly.
- **Authentication Mapping:** The Prisma `User` uses a CUID for `id`. If linking with Supabase Auth, ensure you map the Supabase `user.id` or `user.email` correctly to the internal Prisma user when retrieving the `AcademicSnapshot`.
- **API Limits:** Make sure you pass `maxResults: 5` or `10` to Tavily and restrict token sizes to prevent timeouts when Gemini processes the context.

## 4. Conclusion
The implementation is straightforward and well-supported by the existing tech stack. 

**Proposed File Changes / Creations:**
- **`app/api/internships/route.ts`**: Handle `GET` requests, fetch user `AcademicSnapshot`, query Tavily, and return structured Gemini responses using `generateObject`.
- **`scripts/test-matcher.ts`**: Standalone execution script importing `getTavilyKey`, `getGeminiKey`, `prisma`, `@tavily/core`, and `@ai-sdk/google`.
- **`app/internships/page.tsx`**: Next.js React page fetching from the API and rendering the recommendations.

## 5. Verification Method
1. Create `scripts/test-matcher.ts` based on the plan and run `npx tsx scripts/test-matcher.ts`. Verify it outputs a JSON array matching the Zod schema (`{ title, company, url, score, reasoning }`).
2. After creating the frontend and API route, start the dev server (`npm run dev`) and visit `http://localhost:3000/internships`. Ensure it loads and displays the job cards successfully.
