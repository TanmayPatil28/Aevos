## Review Summary

**Verdict**: REQUEST_CHANGES

## Findings

### [Critical] Finding 1: Integrity Violation (Shortcut)
- **What**: The Tavily search query is hardcoded to a specific string: `const query = "software engineering tech internships summer";`.
- **Where**: `lib/jobs/matcher.ts` (line 13)
- **Why**: This is a shortcut that completely bypasses the intended task. The feature is supposed to dynamically match internships based on the user's specific academic profile. Instead, the implementation ignores the profile and just searches for software engineering internships for everyone. The agent left a comment acknowledging this (`// Extract key skills or interests from the profile to form a better query, or default to a general software engineering internship query.`) but skipped implementing the extraction logic entirely.
- **Suggestion**: Use an LLM call or basic string manipulation to extract the user's major and key skills from `academicProfile` and dynamically construct the search query.

### [Major] Finding 2: Incorrect Data Passed to Matcher
- **What**: When reading from the database, the entire `AcademicSnapshot` database row is passed to the matcher instead of the `academicProfile` field.
- **Where**: `app/internships/actions.ts` (line 13) and `scripts/test-matcher.ts` (line 13)
- **Why**: The code uses `profile = recentSnapshot;`. The `recentSnapshot` object contains database metadata (`id`, `userId`, `createdAt`, `checksumHash`, etc.) and the actual profile is nested inside `recentSnapshot.academicProfile`. The fallback mock profile is a flat object. This inconsistency causes the matcher to receive the wrong data structure, and the large database metadata causes the Gemini request to hit rate limits or fail.
- **Suggestion**: Change the assignment to `profile = recentSnapshot.academicProfile;` in both files.

## Verified Claims
- The matcher implementation connects to Tavily and Gemini → verified via code inspection.
- `scripts/test-matcher.ts` executes successfully → failed (Quota exceeded error during Gemini call, largely due to sending the entire DB row).
- `npm run build` succeeds → failed (Unexpected end of JSON input during `/api/parse` compilation, though this appears unrelated to the internship matcher code itself).

## Coverage Gaps
- **Error Handling**: The `app/internships/page.tsx` UI does not gracefully handle errors if the `matchInternships()` action throws an error (e.g. Gemini quota exceeded). It will crash the page instead of showing an error boundary. Risk level: Medium. Recommendation: Wrap the server action call in a try-catch and display an error message on the UI.

## Unverified Items
- The UI presentation of the `app/internships/page.tsx` could not be visually verified, but code inspection shows it correctly maps over the `matches` array and displays the score and rationale.
