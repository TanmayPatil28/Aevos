# Scope: GradeFlow Batch 4 IMPL-A (Persistence Reconciler + API Builder)

## Architecture
- **Client-State-First Persistence (Path B)**: The client store (`usmStore.ts`) holds the authoritative academic profile. The server persists this state in `AcademicSnapshot` under the `academic_profile` JSON field.
- **Normalization and Ingestion**: The `normalizationEngine` transforms third-party extractions to the canonical profile. The `diffEngine` computes diffs and merges incoming profiles.
- **CRUD REST API**: High-performance, secure backend routes built with Next.js App Router API routes, query-tuned Postgres access, and auth verification.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Persistence Architecture Audit | Audit client-state-first model, map store structure, identify calendar/timetable/backlog fields, and write handoff.md | None | DONE |
| 2 | Implement Path B | Extend store types, schema validation, normalization/diff engines, sync endpoint | M1 | DONE |
| 3 | Build CRUD API Routes | Build endpoints with strict Supabase auth, validate overlaps, sub-50ms timetables, integration with Jarvis AI | M2 | DONE |
| 4 | Seed Data & E2E Verification | Create Indian student seed data, compile and verify against tests, run final audits | M3 | DONE |

## Interface Contracts
### Sync Endpoint `/api/academic/snapshots`
- **Method**: GET, POST, DELETE
- **Auth**: Strict JWT check via `supabase.auth.getUser()`
- **Schema**: Validated Zod payload containing extended AcademicProfile (with calendar, timetable, backlogs)

### Calendar Endpoint `/api/academic/calendar`
- **GET/POST `/api/academic/calendar`**
- **PUT `/api/academic/calendar/[id]`**
- **GET `/api/academic/calendar/[id]/weeks-remaining`**

### Timetable Endpoint `/api/academic/timetable`
- **GET `/api/academic/timetable`**
- **POST `/api/academic/timetable/entry`** (no overlaps)
- **GET `/api/academic/timetable/today`** (sub-50ms)
- **GET `/api/academic/timetable/[subjectId]/scheduled-count`**

### Backlogs Endpoint `/api/academic/backlogs`
- **GET/POST `/api/academic/backlogs`**
- **POST `/api/academic/backlogs/[id]/start-recovery`**
- **POST `/api/academic/backlogs/[id]/mark-cleared`**
- **POST `/api/academic/backlogs/[id]/withdraw`**
- **GET `/api/academic/backlogs/summary`**

## Code Layout
- **Zustand Store**: `stores/usmStore.ts`
- **Zod Validation Schema**: `lib/academic-intelligence/hydration/hydrationEngine.ts`
- **Sync Route**: `app/api/academic/snapshots/route.ts`
- **Normalization Engine**: `lib/ingestion/normalizationEngine.ts`
- **Diff Engine**: `lib/ingestion/diffEngine.ts`
- **API Routes**: `app/api/academic/calendar/...`, `app/api/academic/timetable/...`, `app/api/academic/backlogs/...`
