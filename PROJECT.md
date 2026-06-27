# Project: Aevos Production Readiness Audit

## Architecture
- React / Next.js based application (likely based on routing and components).
- Prisma used for Database.
- Multiple features: GPA Calculator, Semester Planner, Grade Predictor, Backlog Optimizer, Multi Semester System, Dashboard, Timeline, Landing Page, Authentication.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Discovery and Mapping | R1: Complete map of system, routes, components, data flows. Identify tech debt and dead code. | none | DONE |
| 2 | Feature-by-Feature Audit and Fix | R2: Validate and fix features (GPA Calculator, Semester Planner, Grade Predictor, etc.). Fix bugs, security, UX. | M1 | PLANNED |
| 3 | API & Database Audit | R3: Audit API endpoints for validation, auth, security. Prisma schema for efficiency. Implement fixes. | M1 | PLANNED |
| 4 | Security, Performance & Accessibility | R4: Production security, bundle size, mobile responsiveness, a11y score. Apply high-priority fixes. | M1 | PLANNED |
| 5 | Master Report Generation | R5: Executive summary, launch readiness, feature audit results, fixes, risks, recommendation. | M2, M3, M4 | PLANNED |

## Interface Contracts
- **Workspace Routes**: `/(workspace)/attendance`, `/backlog`, `/calculator`, `/dashboard`, `/focus`, `/forecast`, `/placement`, `/planner`
- **OS Routes**: `/(os)/career`, `/forecasting`, `/identity`, `/ledger`, `/overview`, `/records`
- **Data Models**: User, Calculation, Plan, Course, Enrollment, AttendanceLog, AcademicSnapshot, SkillProgress, UserMemory

## Code Layout
- `app/`: Next.js App Router (contains routes for workspace, os, login, timeline)
- `components/`: UI and feature components (`calculator`, `planner`, `forecast`, `backlog`, etc.)
- `prisma/schema.prisma`: Database schema
- `tests/`: Custom unit tests (`.test.ts`) using `scripts/test-unit.ts`
- `app/api/`: API routes (e.g., `/calculations`, `/plans`, `/jarvis`)
