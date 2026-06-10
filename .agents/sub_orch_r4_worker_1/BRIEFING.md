# BRIEFING

## Mission
Implement security and performance fixes for R4: add file size/type limits, remove synchronous disk writes, fix AI model config, and run tests.

## 🔒 My Identity
- Archetype: Worker
- Roles: implementer, qa, specialist
- Working directory: c:/Users/Tanmay/OneDrive/Desktop/GradeFlow/gradeflow/.agents/sub_orch_r4_worker_1
- Original parent: d2a25d0b-efa6-4e89-9a33-82065f1fb110
- Milestone: R4 (Security & Perf)

## 🔒 Key Constraints
- DO NOT CHEAT. All implementations must be genuine.
- DO NOT hardcode test results.
- DO NOT modify the prisma schema or add facade fallbacks.
- Write report to handoff.md.

## Current Parent
- Conversation ID: d2a25d0b-efa6-4e89-9a33-82065f1fb110

## Task Summary
1. `app/api/parse/resume/route.ts`: file size limit < 5MB and validate MIME type (`application/pdf`).
2. `app/api/jarvis/route.ts`: remove `fs.appendFileSync`.
3. `app/api/terminal/ai/route.ts`: Update `gemini-3.5-flash` to `gemini-2.5-flash`.
4. Run tests.
