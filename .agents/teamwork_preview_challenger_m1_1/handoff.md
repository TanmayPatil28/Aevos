# Handoff Report: Internship Matcher Verification

## 1. Observation
1. In `lib/jobs/matcher.ts`, the search query used to find internships via Tavily is completely hardcoded on line 13: 
   `const query = "software engineering tech internships summer";`
   The `academicProfile` is passed in but its contents (`major`, `skills`, `courses`) are never extracted or used to modify the query.
2. In `app/internships/actions.ts`, the server action fetches the profile used for matching via:
   ```typescript
   const recentSnapshot = await prisma.academicSnapshot.findFirst({
     orderBy: { createdAt: "desc" },
   });
   ```
   This query does not filter by any `userId` or current session.
3. Attempting to run a test with Gemini rate limits caused test failure, but static dataflow analysis clearly exposes that Tavily receives `"software engineering tech internships summer"` regardless of `academicProfile` contents.

## 2. Logic Chain
1. **Hardcoded Search Query:** Because the query passed to `tvly.search()` is unconditionally `"software engineering tech internships summer"`, any non-CS student (e.g., Biology or Business major) will have software engineering internship results returned from the web. The subsequent Gemini call will try to evaluate software engineering internships against a non-CS profile, resulting in low match scores or forced/hallucinated rationales.
2. **Data Privacy/Session Bug:** `prisma.academicSnapshot.findFirst({ orderBy: { createdAt: "desc" } })` simply returns the most recently inserted row across the entire `AcademicSnapshot` table. Therefore, a user viewing the `/internships` page will see recommendations based on whoever uploaded their transcript last globally, exposing parts of someone else's academic profile implicitly through the rationale and scores.

## 3. Caveats
- I encountered a Gemini API rate limit error (`RESOURCE_EXHAUSTED` / `429`) when running `npx tsx scripts/stress-test-matcher.ts`. This prevented a full end-to-end execution of a "Biology major" stress test, but the code inspection definitively confirms the hardcoded behavior before Gemini even runs.
- I assumed Next.js/React standard auth practices are meant to be used for personalized views, and that `actions.ts` should enforce user isolation.

## 4. Conclusion
**Verdict: FAIL**
The feature fails both functionally and securely. 
1. The AI search logic is broken because it completely ignores the user's actual academic profile when fetching internship candidates from the web.
2. The Server Action exposes a critical privacy flaw by leaking the most recently uploaded transcript globally instead of scoping data to the authenticated user session.

## 5. Verification Method
- **To Verify Hardcoded Query**: Read `lib/jobs/matcher.ts:13`. Note that `academicProfile` properties are not used to build `query`.
- **To Verify Privacy Flaw**: Read `app/internships/actions.ts:9`. Note the lack of a `where: { userId: ... }` clause. You can verify this by authenticating as User A, uploading a transcript, logging in as User B, and viewing the internships page — User B will see User A's matches.
