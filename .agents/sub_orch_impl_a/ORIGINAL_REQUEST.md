# Original User Request

## 2026-06-16T14:33:38+05:30

You are the Sub-Orchestrator for GradeFlow Batch 4 IMPL-A (Persistence Reconciler + API Builder).
Your working directory is c:/Users/Tanmay/OneDrive/Desktop/GradeFlow/gradeflow/.agents/sub_orch_impl_a/
Your identity is sub_orch_impl_a.
Your parent is b8af7e2b-29cf-4588-a780-bceb3fa43059 (main agent).

Your mission is to execute the implementation of IMPL-A per the requirements below:
1. **Persistence Architecture Audit**: Confirm Path (B) client-state-first architecture is correct. Map how `usmStore.ts` structures academic data. Identify fields for calendar/timetable/backlog. Document this in your `handoff.md` before coding.
2. **Implement Path B**:
   - Extend `stores/usmStore.ts` types and state for `academicCalendar`, `timetable`, and `backlogs`/`backlogRecoveryPlans` (extend existing structures, don't duplicate).
   - Extend Supabase snapshot sync endpoint (`/api/academic/snapshots`) schema with Zod validation matching new store types.
   - Extend `lib/ingestion/normalizationEngine.ts` and `lib/ingestion/diffEngine.ts` to support the new fields.
3. **Build CRUD API Routes**:
   - EVERY route must perform strict auth checking (extract `userId` from `supabase.auth.getUser()`, return 401 if null). DO NOT trust `userId` inside the request body.
   - Routes to build:
     - `GET/POST /api/academic/calendar`, `PUT /api/academic/calendar/[id]`, `GET /api/academic/calendar/[id]/weeks-remaining`
     - `GET /api/academic/timetable`, `POST /api/academic/timetable/entry` (validate no time overlaps), `GET /api/academic/timetable/today` (sub-50ms responses), `GET /api/academic/timetable/[subjectId]/scheduled-count`
     - `GET/POST /api/academic/backlogs`
     - `POST /api/academic/backlogs/[id]/start-recovery` (triggers AI generation: sends subject + fail reason + calendar context + timetable load + retry days to `/api/jarvis/v2`. Expects study plan, daily hours, recovery probability, resources. Uses fallback with `aiPlanGenerationFailed: true` on failure).
     - `POST /api/academic/backlogs/[id]/mark-cleared`
     - `POST /api/academic/backlogs/[id]/withdraw`
     - `GET /api/academic/backlogs/summary`
4. **Seed Data**: Create a realistic seed for an Indian engineering student: active calendar (even semester Jan-May), full 6-subject Mon-Sat timetable, two backlogs (one PENDING, one IN_RECOVERY with plan).
5. **Verify**:
   - You must spawn workers to implement these. Ensure they run and pass all test suites (`npm run test:unit`, `npm run test:presets`, `npm run test:stability`, and compile checks like `npm run build` / `npx prisma generate` / linting).
   - Use Forensic Auditor to ensure no integrity violations (no dummy mock implementations or hardcoded test checks).

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Set up your BRIEFING.md and progress.md. Run the Explorer -> Worker -> Reviewer -> Auditor cycle. Once complete, write handoff.md and send a completion message with details to b8af7e2b-29cf-4588-a780-bceb3fa43059.
