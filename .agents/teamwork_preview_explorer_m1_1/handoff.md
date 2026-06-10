# Handoff Report: Internship Matcher Implementation Plan

## 1. Observation
- **Database & Profile**: The application uses Supabase for Postgres and Auth (`lib/supabase/server.ts`). Student profiles are stored as `academic_profile` (JSON) within the `AcademicSnapshot` Prisma model. The active profile for a user is referenced by `activeSnapshotId` in the `User` model.
- **Environment & Keys**: API keys for Tavily (`TAVILY_API_KEY`) and Gemini (`GEMINI_API_KEYS`, `GEMINI_API_KEY`) are present in `.env`. Note that `TAVILY_API_KEY` is a comma-separated string of multiple keys.
- **Dependencies**: `package.json` contains the necessary libraries: `@tavily/core`, `@ai-sdk/google`, and `@mastra/core` (v1.41.0).
- **Existing Patterns**: Mastra is already utilized for AI agents (e.g., `lib/ai/agents/jarvis.ts` using `import { Agent } from '@mastra/core/agent'`).

## 2. Logic Chain
- **Step 1 (Testing)**: The `scripts/test-matcher.ts` can be built to run via `npx tsx`. It will initialize Tavily using the first key from the comma-separated `.env` variable, search for internships, and pass the results along with a mock student profile to a Mastra Agent (powered by `gemini-2.5-flash`) to generate a JSON array of scored jobs.
- **Step 2 (Backend)**: The backend API at `app/api/internships/match/route.ts` will authenticate the user via Supabase, fetch their `activeSnapshotId` via Prisma (`lib/prisma.ts`), extract the `academicProfile`, and run the exact same Tavily + Mastra logic to return live, personalized job matches.
- **Step 3 (Frontend)**: The frontend at `app/internships/page.tsx` will fetch from this API route and display the jobs using existing UI components like `Card` and `Badge` from `components/ui`.

## 3. Caveats
- **Routing/Layout**: The prompt asks for `/app/internships/page.tsx`. However, Next.js Route Groups are used in this project (e.g., `app/(workspace)`). If the page is created at `app/internships/page.tsx`, it will lose the dashboard sidebar and layout. It is highly recommended to create it at `app/(workspace)/internships/page.tsx`, which still resolves to the `/internships` URL.
- **Tavily Key Parsing**: Because `TAVILY_API_KEY` has multiple comma-separated keys in `.env`, the implementation must split the string and select one (e.g., `process.env.TAVILY_API_KEY.split(',')[0]`).
- **LLM Structured Output**: To guarantee the Mastra agent returns a strict JSON array of jobs, the prompt should clearly request JSON and we should ideally use Zod validation or `JSON.parse` with a fallback.

## 4. Conclusion
The implementation is fully supported by the current tech stack. Below is the exact step-by-step implementation plan:

### Implementation Plan

**1. Create `scripts/test-matcher.ts`**
- Initialize `@tavily/core` with `process.env.TAVILY_API_KEY?.split(',')[0]`.
- Perform a search (e.g., `tvly.search("software engineering internship", { searchDepth: "basic" })`).
- Initialize a Mastra `Agent` using `google('gemini-2.5-flash')`.
- Feed the job results and a hardcoded mock `academicProfile` to the agent, instructing it to return an array of objects `{ title, company, url, score, rationale }`.
- Run using `npx tsx scripts/test-matcher.ts`.

**2. Create `app/api/internships/match/route.ts`**
- Import `createClient` from `@/lib/supabase/server` and `prisma` from `@/lib/prisma`.
- Retrieve the authenticated user session.
- Query `prisma.user` for `activeSnapshotId`, then fetch `prisma.academicSnapshot` to get `academicProfile`.
- Use the Tavily + Mastra matching logic (similar to the script) dynamically using the user's actual profile.
- Return `NextResponse.json({ matches: parsedJson })`.

**3. Create `app/internships/page.tsx` (or `app/(workspace)/internships/page.tsx`)**
- Create a Next.js Client Component.
- Use a `useEffect` or SWR/React Query to fetch from `/api/internships/match`.
- Display a loading state (using `components/ui/Skeleton.tsx`).
- Map over the results and display each recommended internship inside a `Card.tsx`, showing the match score in a `Badge.tsx`.

## 5. Verification Method
- **Script**: Run `npx tsx scripts/test-matcher.ts` and verify it logs a well-formed JSON array of jobs with `score` (0-100) and `rationale`.
- **Backend API**: Send a GET/POST request to `/api/internships/match` with an authenticated session to verify it successfully fetches the DB profile and returns real job scores.
- **Frontend**: Run `npm run dev`, log in, navigate to `http://localhost:3000/internships`, and ensure the UI renders the job cards correctly.
