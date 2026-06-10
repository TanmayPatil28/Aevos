# BRIEFING — 2026-06-10T13:17:00Z

## Mission
Explore the codebase to plan the implementation of the Job/Internship Matcher feature.

## 🔒 My Identity
- Archetype: Teamwork explorer
- Roles: Read-only investigation, analysis, synthesis
- Working directory: c:/Users/Tanmay/OneDrive/Desktop/GradeFlow/gradeflow/.agents/teamwork_preview_explorer_m1_2
- Original parent: 376614b5-d6bb-44bb-9ce4-454cd07fcf6a
- Milestone: [TBD]

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Explore Supabase integration, student profile schema, environment variables.
- Check package.json for required libraries.
- Write handoff.md containing detailed step-by-step implementation plan.

## Current Parent
- Conversation ID: 376614b5-d6bb-44bb-9ce4-454cd07fcf6a
- Updated: not yet

## Investigation State
- **Explored paths**: `prisma/schema.prisma`, `lib/prisma.ts`, `lib/supabase/server.ts`, `lib/ai/keys.ts`, `package.json`, `types/academicProfile.ts`
- **Key findings**: Supabase is initialized via `lib/supabase/server.ts`, Prisma is configured and holds `User` & `AcademicSnapshot` models. API keys including Tavily and Gemini are managed via `lib/ai/keys.ts`. The `AcademicProfile` interface contains detailed student course and academic data.
- **Unexplored areas**: None required for planning.

## Key Decisions Made
- Use `@ai-sdk/google`'s `generateObject` alongside `@tavily/core` for the matching logic.
- Extract the core matching logic into `lib/jobs/matcher.ts` so it can be reused by both the test script and the Server Action.

## Artifact Index
- `handoff.md` — Detailed step-by-step implementation plan.
