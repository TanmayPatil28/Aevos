# Handoff: Job/Internship Matcher Implementation Plan

## 1. Observation
- The project is a Next.js App Router application with Prisma for database ORM and Supabase for authentication/database hosting.
- The `User` profile and `AcademicSnapshot` models exist in `prisma/schema.prisma`. `AcademicSnapshot` contains an `academicProfile` (JSON) with fields defined in `types/academicProfile.ts` (e.g., `courses`, `academic` details).
- `@tavily/core` (`^0.7.5`), `@ai-sdk/google` (`^3.0.80`), and `@mastra/core` (`^1.41.0`) are already present in `package.json`.
- API keys, including `TAVILY_API_KEY` and `GEMINI_API_KEYS`, are stored in comma-separated strings in `.env` files.
- A utility file `lib/ai/keys.ts` exists and exports `getTavilyKey()` and `getGeminiKey()` to rotate and fetch these keys.
- Supabase client initialization is available via `lib/supabase/server.ts` using `@supabase/ssr`.
- Prisma is instantiated in `lib/prisma.ts`.

## 2. Logic Chain
- **Information Retrieval**: To match internships to a user, the system should first read the user's `AcademicSnapshot` from Prisma to extract their `academicProfile` (which includes courses, CGPA, etc.).
- **Search (Tavily)**: The `academicProfile` keywords (e.g., branch, skills from courses) can be used to form a query for `@tavily/core` (e.g., `tvly.search("software engineering internships...", { searchDepth: "advanced" })`).
- **Matching (Gemini/Mastra)**: The results from Tavily, combined with the student's `academicProfile`, should be fed into a Gemini model (via `generateObject` from `@ai-sdk/google` or a Mastra `Agent`) to score the compatibility of each job and provide a rationale.
- **Scripting**: The `scripts/test-matcher.ts` script should reuse this logic. It can query a specific user's ID or a mocked profile, execute the Tavily search and Gemini evaluation, and log the JSON output. It will be executable via `npx tsx`.
- **Frontend Display**: A new route `app/internships/page.tsx` needs to be created. It will invoke a Server Action (e.g., `matchInternships`) to retrieve the scored jobs and render them as cards.

## 3. Caveats
- Matching internships via LLMs can take several seconds. The frontend should handle loading states gracefully (e.g., using React Suspense or an `isPending` state in a client component).
- The `academicProfile` might be `null` or missing if a student hasn't uploaded a transcript yet. The code should gracefully fallback or prompt the user to upload their data first.
- If using Mastra `Agent`, ensure it is properly configured to output structured JSON, or use `@ai-sdk/google` with `generateObject` and `zod` schema for guaranteed JSON structure.

## 4. Conclusion
The implementation can proceed securely using the existing tools. Below is the detailed, step-by-step implementation plan.

### Step-by-Step Implementation Plan

**Step 1: Create the Core Matching Logic**
- **File**: `lib/jobs/matcher.ts`
- **Action**: Create a new file that exports a `matchInternshipsForProfile(academicProfile)` function.
  - Inside, call `getTavilyKey()` and `getGeminiKey()` from `lib/ai/keys.ts`.
  - Initialize the Tavily client and search for relevant jobs using keywords derived from the profile.
  - Use `generateObject` from `@ai-sdk/google` (or a Mastra Agent) with a `zod` schema (`z.array(z.object({ company, role, url, score, rationale }))`) to evaluate the Tavily results against the `academicProfile`.
  - Return the array of scored jobs.

**Step 2: Create the CLI Testing Script**
- **File**: `scripts/test-matcher.ts`
- **Action**: Create this script to test the core logic.
  - Import `prisma` from `lib/prisma.ts`.
  - Fetch a recent `AcademicSnapshot` from the database to use as a test case.
  - Call `matchInternshipsForProfile(snapshot.academicProfile)`.
  - Output the results using `console.log(JSON.stringify(results, null, 2))`.
  - Run via `npx tsx scripts/test-matcher.ts`.

**Step 3: Create the Server Action**
- **File**: `app/internships/actions.ts`
- **Action**: Create a Server Action `"use server";` to expose the matcher to the frontend.
  - Import `createClient` from `lib/supabase/server.ts` to get the current authenticated user's session.
  - Use the user ID to fetch their `academicProfile` from Prisma.
  - If the profile doesn't exist, throw an error or return a specific status.
  - Invoke `matchInternshipsForProfile` and return the result.

**Step 4: Create the Frontend Route**
- **File**: `app/internships/page.tsx`
- **Action**: Create a Client Component or a Server Component with Suspense.
  - If a Client Component, add a "Find Internships" button that triggers the Server Action. Show a loading spinner during the request.
  - Render the matched jobs using a grid of cards, displaying the company, role, compatibility score (e.g., as a percentage/progress bar), rationale, and a link to apply.

## 5. Verification Method
1. Run `npx tsx scripts/test-matcher.ts` and verify that a JSON array of real jobs (sourced from Tavily) with scores is printed to the console.
2. Navigate to `http://localhost:3000/internships` in the browser, ensure it loads, and trigger the matching process to see the rendered internship cards.
