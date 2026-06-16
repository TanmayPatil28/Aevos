# Project: GradeFlow Batch 4

## Architecture
- **Persistence Path (B)**: academic calendar, timetable, and backlog pathways integrated into client-side Zustand store (gradeflow-usm-storage) and synced periodically to Supabase via snapshot endpoints (`/api/academic/snapshots`), utilizing Zod schema validations.
- **Unified Jarvis CNS**: centralized AI surface at `/api/jarvis/v2` supporting text and voice streaming, action protocols, context injection, and SQLite memory store syncing.
- **Security & DevOps**: branch protection, GitHub Actions CI/CD with SonarQube, security headers, rate limits, and database indexes for hot query paths.
- **Technical Documentation**: 25 comprehensive documents in `.agents/documentation/` capturing the architecture, design systems, schemas, and onboarding guides.

## Milestones
| # | Name | Scope | Dependencies | Status | Conv ID |
|---|------|-------|-------------|--------|---------|
| 1 | Mock-Data Forensic Census | Run complete census of mock data, output to `mock-data-census.md` | none | DONE | c2a34b5d-4639-4c47-96a7-90debba77fee |
| 2 | IMPL-A: Persistence Reconciler | Extend usmStore, snapshot validation, CRUD API routes with session auth, mock seeds | none | DONE | 89932bb7-3ee0-42d5-9259-2c3c0c09cbbe |
| 3 | IMPL-B: Jarvis Unifier | Extend `/api/jarvis/v2` for voice/text, update `JarvisNervousSystem.tsx`, fix errors | M2 | IN_PROGRESS | 2b2298cc-0246-4984-b1e8-0ba065a5b2d4 |
| 4 | IMPL-D: Security & DevOps | CI/CD, SonarQube checks, headers, rate limits, performance DB indexing | M2, M3 | PLANNED | TBD |
| 5 | AGENT-14: Technical Writer | Write all 25 documents to `.agents/documentation/` without placeholders | M1, M2, M3, M4 | PLANNED | TBD |

## Interface Contracts
- **Auth Contract**: Every route extracts `userId` from `supabase.auth.getUser()`. If invalid, returns 401. No requests trust `userId` inside request body.
- **Jarvis Contract**: Input: `{ message, inputType: "text" | "voice", sessionContext }`. Output: SSE NDJSON stream containing text reasoning, final text, and action objects.
- **Snapshot Contract**: `/api/academic/snapshots` syncs usmStore state (courses, calendar, timetable, backlogs).
