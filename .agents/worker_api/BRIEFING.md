# BRIEFING — 2026-06-11T09:50:47+05:30

## Mission
Implement a mocked API route for the Advanced Placement Intelligence Engine that parses resumes, returns detailed mocked JSON, and upserts data into the `CareerProfile` model.

## 🔒 My Identity
- Archetype: implementer
- Roles: implementer, qa, specialist
- Working directory: c:/Users/Tanmay/OneDrive/Desktop/GradeFlow/gradeflow/.agents/worker_api
- Original parent: 04493bef-22de-4dc6-8d9f-73ce330e7d17
- Milestone: Implement mocked API route

## 🔒 Key Constraints
- Return specific mocked fields: skills, atsScore, actionPlan, projects (some with isAIGenerated: true), resumeText.
- Upsert mock data into CareerProfile model for logged-in user.
- Verify programmatically.
- DO NOT CHEAT.

## Current Parent
- Conversation ID: 04493bef-22de-4dc6-8d9f-73ce330e7d17
- Updated: 2026-06-11T09:50:47+05:30

## Task Summary
- **What to build**: API route `/api/parse/resume` in Next.js.
- **Success criteria**: Route accepts FormData (file, jobDescription), returns specific JSON, upserts to DB.
- **Interface contracts**: DB Prisma schema and NextAuth.
- **Code layout**: `app/api/parse/resume/route.ts`

## Key Decisions Made
- Will check Prisma schema to understand `CareerProfile` model.
- Will create/update the API route.
- Will test using a small script that simulates the DB call or hits the dev server.

## Artifact Index
- [TBD]
