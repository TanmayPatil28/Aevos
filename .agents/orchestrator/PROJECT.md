# Project: GradeFlow Job/Internship Matcher

## Architecture
- **Backend/Scripts**: A test script `scripts/test-matcher.ts` and a server action or API route that queries Tavily API and uses Gemini/Mastra to score internships against the student profile in Supabase.
- **Frontend**: A Next.js page/component at `/app/internships/page.tsx` showing the matched jobs sorted by score.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Backend Matcher | Implement Tavily search, Gemini LLM scoring, and the `test-matcher.ts` script. | none | DONE |
| 2 | Frontend UI | Create `/app/internships/page.tsx` displaying fetched jobs with scores. | M1 | PLANNED |
| 3 | Verification | Ensure `npx tsx scripts/test-matcher.ts` and `npm run build` pass. | M1, M2 | PLANNED |

## Interface Contracts
### Backend ↔ Frontend
- Expected Job type: `{ title: string, company: string, location: string, url: string, score: number, reasoning?: string }`
