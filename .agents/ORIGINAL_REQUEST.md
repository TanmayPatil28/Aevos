# Original User Request

## Initial Request — 2026-06-08T10:05:02Z

Conduct a comprehensive AI Ecosystem Master Architecture Audit for the GradeFlow platform. Scan the entire codebase to map out every page and component, identify AI opportunities, and design a unified "Nervous System" architecture around Jarvis (the central AI). The final deliverable is a comprehensive Master Architecture Report covering 10 distinct phases of discovery and design.

Working directory: `c:/Users/Tanmay/OneDrive/Desktop/GradeFlow/gradeflow`
Integrity mode: benchmark

## Requirements

### R1. Complete System Discovery (Phase 1 & 2)
Scan the entire GradeFlow codebase to create a complete inventory of all pages and major components. For every page, identify the decisions made, confusion, manual work, and potential for predictions/recommendations. Classify every component as either "No AI Needed", "AI Enhancement Candidate", or "AI Critical".

### R2. Jarvis Brain & Page Level Design (Phase 3 & 4)
Design the architecture for Jarvis's Memory, Context, Event, and Prediction layers. What should Jarvis permanently understand, monitor, and predict? For every single page, outline its current purpose, missing intelligence, recommended AI features, Jarvis integration, user value, and priority (Critical, High, Medium, Low).

### R3. AI Workflows & Shared Intelligence (Phase 5, 6 & 7)
Design end-to-end AI workflows (e.g., Attendance, GPA Recovery, Placement Readiness). Map out the shared intelligence layer, detailing how data (like backlogs) cascades and affects different engines. Define the Agent Architecture—determine if specialized subagents (Academic, Career, Planner, etc.) are needed, what their roles are, and how Jarvis orchestrates them.

### R4. Infrastructure & API Requirements (Phase 8 & 9)
Identify every infrastructure requirement (LLMs, Vector DBs, Background Jobs, etc.) and explain why it is needed and its priority. Detail all required third-party APIs with provider recommendations, usage estimates, and alternatives.

### R5. Final AI Ecosystem Report (Phase 10)
Produce a single, cohesive Markdown file named `ai_ecosystem_master_architecture.md` containing the complete AI Feature Inventory, Missing Opportunities, Architecture designs (Jarvis, Shared Intelligence, Agents, Events, Memory, Prediction, Automation), API Requirements, and a ranked list of the Top 100 Highest Value AI Features.

## Verification Resources
An independent auditor agent will review the final `ai_ecosystem_master_architecture.md` file against the acceptance criteria. 

## Acceptance Criteria

### Content Completeness
- [ ] The report contains all 10 requested Phases with their respective headers.
- [ ] Phase 1 lists at least 10 distinct pages/routes found in the codebase.
- [ ] Phase 5 explicitly defines at least 3 end-to-end AI workflows.
- [ ] Phase 10 contains a strictly numbered list of exactly 100 highest value AI features.
- [ ] The report includes a dedicated "APIs Needed" section.

### Formatting & Output
- [ ] The entire output is contained within a single file named `ai_ecosystem_master_architecture.md`.
- [ ] No code files in the repository were modified, deleted, or created (other than the report itself).

## Follow-up — 2026-06-09T14:20:18+05:30

# Teamwork Project Prompt — Resume Paused Audit

Perform a complete production readiness audit of the entire GradeFlow codebase. The audit must discover and fix flaws, bugs, bad UX, performance issues, and security risks across all routes and components. 

**CRITICAL INSTRUCTION:** This is a continuation of a paused audit. The discovery phase (R1) and the core feature audit (R2) are mostly complete. **You must immediately resume from R3 (API & Database Audit), R4 (Security, Performance & Accessibility), and R5 (Master Report Generation).** 

Working directory: `c:/Users/Tanmay/OneDrive/Desktop/GradeFlow/gradeflow`
Integrity mode: development

## Requirements

### R1. Comprehensive Discovery and Mapping (COMPLETED)
Create a complete map of the system including all routes, components, and data flows. Audit the architecture for technical debt and dead code.

### R2. Feature-by-Feature Audit and Fix (COMPLETED/IN-PROGRESS)
Perform click-by-click validation and code review for all features. Fix all critical bugs, data corruption risks, security vulnerabilities, and UX issues found. 

### R3. API & Database Audit (START HERE)
Audit every API endpoint for validation, auth, and security risks. Audit Prisma schema for efficiency and safety. Implement necessary fixes.

### R4. Security, Performance & Accessibility
Conduct a production security review, check bundle sizes/hydration overhead, test mobile responsiveness, and generate an accessibility score. Apply high-priority fixes.

### R5. Master Report Generation
Generate a comprehensive master report detailing executive summary, launch readiness, feature audit results, fixes applied, remaining risks, and a final launch recommendation.

## Verification Resources
The `tests` directory contains existing test suites.

## Acceptance Criteria

### Testing & Verification
- [ ] Existing tests in the `tests` directory must pass successfully before and after any fixes are applied to ensure no regressions occur.
- [ ] An agent-as-judge script or explicit manual UI/UX verification process must be used to validate UI/UX fixes.

### Audit Completeness
- [ ] The final master report must include all sections requested: Executive Summary, Findings (Critical to Low), Feature Audit Results, API/Database/Security/Performance/Mobile/Accessibility Audit Results, Fixes Applied, Remaining Risks, and Final Recommendation.
- [ ] Every feature listed in the prompt (GPA Calculator, Semester Planner, Grade Predictor, Backlog Optimizer, Multi Semester System, Dashboard, Timeline, Landing Page, Authentication) must have a Pass/Fail record in the report.

## Follow-up - 2026-06-10T13:14:40Z

# Teamwork Project Prompt � Draft

> Status: Launched

Build a Job/Internship Matcher feature. It will use the Tavily API to search the web for entry-level tech roles and use Gemini/Mastra to match these opportunities against the student's existing profile in Supabase.

Working directory: c:/Users/Tanmay/OneDrive/Desktop/GradeFlow/gradeflow
Integrity mode: development

## Requirements

### R1. Internship Fetching Engine
Implement a backend process (API route or server action) that queries the Tavily API for entry-level tech internships and software engineering jobs.

### R2. LLM Matching Logic
Implement a matching function that compares the retrieved internships against a student's profile (skills, constraints) to calculate a compatibility score using the AI SDK or Mastra.

### R3. User Interface
Create a Next.js frontend component to display the recommended internships, sorted by match score.

## Acceptance Criteria

### Backend Verification
- [ ] A test script scripts/test-matcher.ts exists and runs successfully via 
px tsx scripts/test-matcher.ts.
- [ ] The script successfully retrieves real data from the Tavily API using the @tavily/core package.
- [ ] The script calculates and outputs a valid JSON array of jobs, where each job includes a numeric compatibility score generated by Gemini.

### Frontend Verification
- [ ] A new page route (e.g., /app/internships/page.tsx) or component exists.
- [ ] The Next.js application builds successfully (
pm run build) without any TypeScript or routing errors.
- [ ] The UI displays the internships and visually indicates the match score.

## Follow-up — 2026-06-16T09:00:12Z

# GRADEFLOW — BATCH 4 MASTER EXECUTION PROMPT
## Operation: Foundation Complete — Refined & Repo-Grounded Edition

---

## 0. WHAT CHANGED — CRITICAL CORRECTIONS (read first)

| # | Correction | Evidence |
|---|------------|----------|
| 1 | `/api/jarvis/v2` ALREADY EXISTS at `app/api/jarvis/v2/route.ts` (4,899 bytes). `JarvisCommandCenter.tsx` (line 122) already calls it. IMPL-B must EXTEND this endpoint, not create a new one. |
| 2 | `NeuralDecisionTree.tsx` DOES NOT EXIST. `/api/narrative` uses `narrativeAgent` from Mastra but has no confirmed frontend consumer — it is an orphan route. |
| 3 | `IslandSpotlightView` DOES NOT EXIST anywhere in the codebase. The actual exports from `LiveActivities.tsx` are: `MinimalActivity`, `MinimalSecondaryActivity`, `ExpandedActivity`, `IslandAlertView`, `FocusTimerActivity`. |
| 4 | PRN (`prnNumber`) exists ONLY as a TypeScript type field in `usmStore.ts` (line 13). It is NOT in Prisma schema. NOT persisted to Postgres. Step 0 PRN hashing is SKIPPED entirely. |
| 5 | Documentation path is `c:/Users/Tanmay/OneDrive/Desktop/GradeFlow/gradeflow/.agents/documentation/` (root level, NOT nested). |
| 6 | Persistence architecture is CONFIRMED as Path (B): Zustand + localStorage persist (key: `gradeflow-usm-storage`, version 3) + periodic Supabase snapshot sync via `BackgroundSyncWorker` and `AcademicHydrationBoundary`. NOT fully relational Prisma. |
| 7 | Dev server runs on `http://localhost:3000` (NOT 3001). |

---

## 1. OPERATING ENVIRONMENT

**Working directory:** `c:/Users/Tanmay/OneDrive/Desktop/GradeFlow/gradeflow`
**Documentation output:** `c:/Users/Tanmay/OneDrive/Desktop/GradeFlow/gradeflow/.agents/documentation/`
**Integrity mode:** `benchmark`
**Dev server:** `http://localhost:3000`

### Intelligence Load — Read these files BEFORE dispatching any agent:
- Batch 1: `C:\Users\Tanmay\.gemini\antigravity\brain\1184020a-97dd-4005-ae13-bc0e9dcf8f30\batch_1_intelligence_package.md`
- Batch 2: `C:\Users\Tanmay\.gemini\antigravity\brain\1184020a-97dd-4005-ae13-bc0e9dcf8f30\batch_2_completion_package.md`
- Batch 3: `C:\Users\Tanmay\OneDrive\Desktop\GradeFlow\batch_3_completion_package.md`

Retrieve ALL 12 mem0 keys and confirm accessibility:
`gradeflow:architecture:current`, `gradeflow:schema:complete`, `gradeflow:api:complete`, `gradeflow:ai:architecture`, `gradeflow:prompts:*`, `gradeflow:security:audit`, `gradeflow:infrastructure:audit`, `gradeflow:business:strategy`, `gradeflow:testing:strategy`, `gradeflow:ip:innovations`, `gradeflow:gaps:registry`, `gradeflow:roadmap:90day`

Use MCPs aggressively: GitHub, Supabase, Neon, Postgres, Vercel, TestSprite, SonarQube, ESLint, Lighthouse, Stagehand/Browser, Figma Console, Sequential Thinking, mem0, Slack, Tavily.

---

## 2. DECISIONS LOG (authoritative — do not re-litigate)

| Decision | Status |
|----------|--------|
| Step 0 — PRN Protection | ❌ SKIP. Zustand type stub only, not DB-persisted. |
| Emergency Fix 1 — Secrets → Vercel | ❌ SKIP. User handles manually. |
| Emergency Fix 2 — React Hook violations | ❌ SKIP. Already fixed; tests passing. |
| Emergency Fix 3 — Row Level Security | ❌ SKIP. User handles manually. |
| Navbar | KEEP `components/Navbar.tsx` (Dynamic Island). REMOVE `components/os/navigation/OSNavbar.tsx` and `OSMobileNav.tsx`. PRESERVE `OSContextBar.tsx` but re-skin to match Apple Bento system. |
| UI design base | planner, placement, calculator, internships pages are canonical visual reference. |
| Pinterest references | DEFERRED. IMPL-C does NOT launch in this batch. |
| Documentation | All 25 documents, full detail. |
| Active agents this batch | IMPL-A, IMPL-B, IMPL-D, AGENT-14, Mock-Data Forensic Census. |
| HELD | IMPL-C (UX Doctor) — do NOT deploy under any circumstance. |

---

## 3. GROUND-TRUTH APPENDIX — REPO-VERIFIED FACTS

### 3.1 The dual-navbar architecture (confirmed)
- KEEP: `components/Navbar.tsx` (Dynamic Island, 564 lines) with squircle morphing, exam countdown, streak badge, live activities, JarvisCommandCenter spotlight, dynamic island physics. `NavbarServer.tsx` wraps it server-side.
- REMOVE: `components/os/navigation/OSNavbar.tsx` (62 lines, simple pill nav) and `OSMobileNav.tsx`.
- PRESERVE: `OSContextBar.tsx` (page-specific action bar) — re-skin to match Apple Bento.
- RISK: Before removing OSNavbar, confirm every route it served (`/overview`, `/identity`, `/ledger`, `/forecasting`, `/records`, `/career`) is reachable through `Navbar.tsx`'s `INTELLIGENCE_MODULES` in `lib/config/navigation.ts`.

### 3.2 The AI-surface fragmentation (CORRECTED — 5 routes, not 4)

| Endpoint | File | Used by | What it does |
|---|---|---|---|
| `/api/chat` | `app/api/chat/route.ts` (3,958 bytes) | `components/ai/JarvisNervousSystem.tsx` (line 28: `api: '/api/chat'`) | Legacy voice. Plain text streaming via `useChat`. |
| `/api/jarvis/v2` | `app/api/jarvis/v2/route.ts` (4,899 bytes) | `components/JarvisCommandCenter.tsx` (line 122: `fetch("/api/jarvis/v2")`) | **CANONICAL surface.** Returns structured `action` objects + streamed text chunks. |
| `/api/jarvis` | `app/api/jarvis/route.ts` (9,341 bytes) | **Unknown/possibly legacy** | Larger file — may be original version before v2 was created. Explorer must verify if anything still calls it. |
| `/api/terminal/ai` | `app/api/terminal/ai/route.ts` (3,733 bytes) | `components/ui/terminal/commandRegistry.ts` (line 459) | Hacker-terminal AI, own history in localStorage. |
| `/api/narrative` | `app/api/narrative/route.ts` (871 bytes) | **No confirmed consumer** | Orphan route. Uses `narrativeAgent.stream()` from Mastra. Leave alone. |

### 3.3 Persistence architecture — CONFIRMED as Path (B)

`stores/usmStore.ts` uses Zustand `persist` middleware with localStorage key `gradeflow-usm-storage` (version 3, with migrations v0→v1→v2→v3). `BackgroundSyncWorker.tsx` syncs pending actions to `/api/sync`. `AcademicHydrationBoundary.tsx` fetches `/api/academic/snapshots?activeOnly=true` and calls `store.hydrateFromSnapshot()`. 

**Architecture is CLIENT-STATE-FIRST with periodic Supabase snapshot sync.** IMPL-A must extend the Zustand store shape and snapshot sync pipeline — NOT create parallel relational Prisma tables.

### 3.4 Mock-Data Forensic Census — confirmed starting list

These components ship hardcoded/simulated data (verified):
- `components/os/identity/github/EngineeringSignals.tsx` — hardcoded signal list
- `components/os/identity/github/RepoCredibilityMeter.tsx` — hardcoded score (84)
- `components/os/identity/linkedin/ProfileSimulator.tsx` — fully simulated recruiter view
- `components/os/identity/SkillGapAnalyzer.tsx` — hardcoded 42% match
- `components/os/identity/CareerIdentityGraph.tsx` — hardcoded positioning text
- `components/os/records/UploadZone.tsx` — `// Mock upload interaction` with setTimeout
- `components/os/records/ReviewImport.tsx` — hardcoded 4-course mock dataset
- `components/ai/JarvisResumeModal.tsx` — hardcoded resume content
- `components/attendance/AssignmentIntelligence.tsx` — mockAssignments array
- `components/backlog/deep-dive/StudySquadWidget.tsx` — simulated peer chat with setTimeout
- `components/backlog/deep-dive/GraceMarksPredictorWidget.tsx` — fake apply flow
- `components/backlog/RevaluationEngineWidget.tsx` — fake payment flow
- `components/backlog/UnifiedSimulator.tsx` — fake save via setTimeout
- `components/backlog/ResourceMatcherWidget.tsx` — fake video/PDF viewer
- `components/os/inspector/RoadmapNodeContent.tsx` — real API call commented out
- `components/placement/PlacementScannerWidget.tsx` — hardcoded company data

### 3.5 Design system — Two Design Languages (confirmed)

**Apple Bento system** (canonical): `GlassCard.tsx`, `Card.tsx`, `PageHero.tsx`, `AnimatedCounter.tsx`. Tokens: `bg-[#1c1c1e]/60`, `backdrop-blur-3xl`, `border-white/10`, `rounded-[32px]`, accents: blue `#4F8EF7`/`#0a84ff`, purple `#A855F7`, green `#30D158`, red `#FF453A`.

**Slate-Indigo system** (Career OS, to be migrated in IMPL-C): `bg-slate-900`, `border-slate-800`, `text-indigo-400`, `rounded-2xl`. Used across 20+ files in `components/os/`.

### 3.6 Historical integrity violations — zero tolerance

This codebase has produced: (1) test runners with hardcoded `() => true` fake PASS output, (2) assertions rewritten to match broken code, (3) an agent that deleted the entire `app/(os)` route tree to shrink audit scope. Every Forensic Auditor must check for these three patterns and state in their `handoff.md` that they checked.

---

## 4. EXECUTION SEQUENCE — NO STEP 0 (straight to parallel swarm)

Step 0 is SKIPPED (PRN is a Zustand type stub). Go directly to Step 1.

---

## 5. ORCHESTRATION PROTOCOL

Use the existing agent governance pattern from `.agents/`:
- Sentinel → Orchestrator → Explorer → Worker → Reviewer → Forensic Auditor → Victory Auditor
- Each worker gets `.agents/<archetype>_<task>/` with `BRIEFING.md`, `progress.md`, `handoff.md`
- Every claim must be independently re-verified by Reviewer/Forensic Auditor using a tool
- Zero tolerance for fabricated verification (§3.6)

---

## 6. IMPL-A — PERSISTENCE RECONCILER + API BUILDER

### First: Persistence Architecture Audit (Explorer)
Confirm Path (B) is correct. Map how `usmStore.ts` currently structures academic data. Identify which fields already exist for calendar/timetable/backlog concepts. Document in `handoff.md` before any implementation.

### Implementation (Path B confirmed):
1. Extend `usmStore.ts` type definitions and initial state for `academicCalendar`, `timetable`, and properly-typed `backlogs`/`backlogRecoveryPlans` (some fields may already partially exist — confirm and extend, don't duplicate).
2. Extend the Supabase snapshot payload (`/api/academic/snapshots`) schema with Zod validation matching the new store types.
3. Extend `lib/ingestion/normalizationEngine.ts` and `lib/ingestion/diffEngine.ts` for the new fields.
4. Build CRUD API routes (adjust persistence calls for Zustand+snapshot architecture).

### API Routes to build:
**CRITICAL AUTH RULE:** Never trust userId from request body. Always extract from `supabase.auth.getUser()`. Return 401 if null.

- `GET/POST /api/academic/calendar`, `PUT /api/academic/calendar/[id]`, `GET /api/academic/calendar/[id]/weeks-remaining` (fast, feeds AI Forecast Engine)
- `GET /api/academic/timetable`, `POST /api/academic/timetable/entry` (with overlap validation), `GET /api/academic/timetable/today` (sub-50ms, feeds Jarvis), `GET /api/academic/timetable/[subjectId]/scheduled-count` (detention risk denominator)
- `GET/POST /api/academic/backlogs`, `POST /api/academic/backlogs/[id]/start-recovery` (triggers AI), `POST /api/academic/backlogs/[id]/mark-cleared`, `POST /api/academic/backlogs/[id]/withdraw`, `GET /api/academic/backlogs/summary` (feeds dashboard)

### AI Integration for Backlog Recovery:
On `start-recovery`, call `/api/jarvis/v2` (the canonical AI surface confirmed in §3.2). Provide context: subject + fail reason, timetable load, days to retry, historical performance, calendar context. Expect: study plan, daily hours, resources, recovery probability, reasoning. Wrap in try/catch with `aiPlanGenerationFailed: true` fallback.

### Seed Data:
Create realistic seed for an Indian engineering student: one active calendar (even semester Jan-May), full 6-subject Mon-Sat timetable, two backlogs (one PENDING, one IN_RECOVERY with plan).

**Deliverable:** Persistence path documented, all routes built with auth, seed verified. Store: `gradeflow:impl:schemas`.

---

## 7. IMPL-B — JARVIS UNIFIER (audit-first)

### Step 1 — Inventory (Explorer)
1. Confirm which of the 5 endpoints in §3.2 are genuinely live. Start dev server at `http://localhost:3000`, exercise each surface.
2. Verify if `/api/jarvis` (9,341 bytes) is still called by anything or is fully superseded by `/api/jarvis/v2`.
3. Read full `jarvis-error.log` and categorize: crash (A), API/format mismatch (B), state desync (C), tool-call failure (D).
4. Report recommendation: `/api/jarvis/v2` is already canonical — confirm it and extend it for voice.

### Step 2 — Extend `/api/jarvis/v2` for voice
- Input negotiation: `{ message, inputType: "text" | "voice", sessionContext }`
- Voice path: SSE/ReadableStream for TTS. First token target: <800ms.
- Action protocol: preserve existing action vocabulary (`navigate`, `mark_attendance`, `set_target_cgpa`, `set_exam_countdown`, `show_alert`, `set_streak`) — extend, don't replace.
- Context injection: current route, today's timetable (`GET /api/academic/timetable/today`), detention risk, unread alerts.

### Step 3 — Migrate `JarvisNervousSystem.tsx`
Point fetch from `/api/chat` to `/api/jarvis/v2`. Update response parser for action-then-stream. Add friendly voice fallback on error.

### Step 4 — Resolve `jarvis-error.log` entries
Fix every Category A and B error. Common: undefined tool args, missing timeouts, unvalidated response shapes, infinite tool loops.

### Step 5 — Deprecate superseded surfaces
`/api/chat` gets deprecation comment + `console.warn`. Do NOT delete. `/api/narrative` is out of scope — leave untouched. `/api/jarvis` (if confirmed superseded) gets same deprecation treatment.

### Step 6 — Verify (Browser/Stagehand MCP against http://localhost:3000)
5 tests, all must pass:
1. Text command in Spotlight → correct data + UI action, no errors, <2s
2. Voice "open my forecast" → navigation + voice confirms
3. Voice "how many classes today" → uses `/api/academic/timetable/today`
4. Two-turn conversation → context retained
5. Simulated 500 → friendly error, component stays mounted

**Deliverable:** One canonical AI surface documented, `jarvis-error.log` cleared, 5/5 tests. Store: `gradeflow:impl:jarvis`.

---

## 8. IMPL-D — SECURITY HARDENER + DEVOPS ENGINEER

### CI/CD
- doc.github/workflows/ci.yml`: lint, `tsc --noEmit`, test:unit/presets/stability, SonarQube (fail on CRITICAL/HIGH), `next build`.
- `.github/workflows/deploy.yml`: Vercel deploy on push to main, preview-then-promote, Slack notification.
- Branch protection on main: require PR, require CI pass, require ≥1 reviewer.

### Security clearance
Full SonarQube scan post-implementation. Zero CRITICAL, zero HIGH. Document MEDIUM/LOW for post-launch backlog.

### Production hardening
- Security headers in `next.config.js`: strict CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(self)`.
- Rate limiting on AI routes: jarvis 60/hr, roadmap 20/hr, backlog recovery 10/day. Return 429 + Retry-After.
- `vercel.json` function timeouts for AI routes.
- Sentry installed and configured. Filter PII.

### Database performance
`EXPLAIN ANALYZE` four hot queries (user lookup, attendance by user+date, grades by subject, today's timetable). Add indexes for any seq scans.

**Deliverable:** CI/CD live, SonarQube clean, headers/rate-limits/Sentry live, indexes verified. Store: `gradeflow:impl:security-devops`.

---

## 9. MOCK-DATA FORENSIC CENSUS (cross-cutting, standalone auditor)

Dedicated Forensic Auditor mission: produce complete census of every component displaying simulated/hardcoded/setTimeout-faked data. Start from §3.4 list but search full `components/` tree for: literal fake arrays, `setTimeout` simulating async, comments with "mock"/"demo"/"simulate"/"for visual representation".

For each finding: file path, exact lines, what it pretends to be, what real data source could replace it.

This is a REPORT, not a fix. Output: `mock-data-census.md`.

---

## 10. AGENT-14 — TECHNICAL WRITER (25 Documents)

Source of truth: (1) this document, (2) all mem0 keys (12 existing + 3 new from this batch), (3) three batch packages on disk.

Write all 25 to `c:/Users/Tanmay/OneDrive/Desktop/GradeFlow/gradeflow/.agents/documentation/`.

| # | Document | Reader | Must include |
|---|----------|--------|---------------|
| 01 | `01-product-vision.md` | Investors, new hires | Mission, problem, 5-year vision, principles, roadmap, competitive positioning |
| 02 | `02-prd.md` | Product, design, eng | 3 personas, feature specs, MoSCoW matrix, open questions |
| 03 | `03-srs.md` | QA, compliance | Functional + non-functional requirements, constraints, DPDP/FERPA |
| 04 | `04-trd.md` | Engineers, contractors | Stack with versions, constraints, integration contracts, ADRs |
| 05 | `05-brd.md` | Investors, sales | Revenue model, pricing, TAM/SAM/SOM, KPIs, GTM, cost/break-even |
| 06 | `06-frd.md` | QA, backend/AI | Every system behavior by module |
| 07 | `07-app-flow.md` | Designers, engineers | Navigation map, 5 user journeys, state machines |
| 08 | `08-information-architecture.md` | Designers, content | Hierarchy, nav architecture, URL taxonomy |
| 09 | `09-ux-design-brief.md` | Designers | Design philosophy, target aesthetic, Two Design Languages finding, Apple Bento is canonical |
| 10 | `10-design-system.md` | Frontend, designers | Tokens, component inventory, motion system |
| 11 | `11-backend-architecture.md` | Backend, DevOps | API layer, persistence path (B), middleware, caching, errors |
| 12 | `12-database-architecture.md` | Backend, DBAs | ER overview, ownership, indexing, RLS, backup/DR |
| 13 | `13-schema-documentation.md` | Query writers | Every model/field/relation/index, including new schemas |
| 14 | `14-api-documentation.md` | Frontend/mobile | Every endpoint with auth, request, response, errors, examples |
| 15 | `15-ai-architecture.md` | AI engineers, founders | Canonical Jarvis surface, model role map, cost, failure handling |
| 16 | `16-prompt-architecture.md` | AI engineers | Every system prompt verbatim with versioning |
| 17 | `17-data-flow-architecture.md` | Backend, security | Major data flows as numbered sequences |
| 18 | `18-security-architecture.md` | Security, compliance | Auth/authz, RLS, secrets, headers, PII, threat model, DPDP |
| 19 | `19-infrastructure-architecture.md` | DevOps | Vercel/Supabase config, pooling, CI/CD, monitoring, cost |
| 20 | `20-implementation-roadmap.md` | Founder, leads | 90-day roadmap, critical path, mock-data census as backlog |
| 21 | `21-testing-strategy.md` | QA, CI owners | Philosophy, coverage, standards, CI gates |
| 22 | `22-operations-runbook.md` | On-call engineer | Deploy, rollback, incident response, migrations, known issues |
| 23 | `23-decision-log.md` | Future engineers | 15+ ADRs including navbar-unification and Jarvis-consolidation |
| 24 | `24-developer-onboarding.md` | New senior engineer | Read-first overview, environment setup, codebase orientation |
| 25 | `25-product-knowledge-base.md` | Anyone | Executive summary, quick-ref cards, FAQ, glossary, 4 patents |

Store: `gradeflow:documentation:complete`.

---

## 11. VICTORY AGENT CHECKLIST

Sign off only when independently re-verified with tools:

**Implementation:**
- [ ] Persistence path (B) confirmed and documented
- [ ] Calendar/Timetable/Backlog data model live (store-extended per Path B)
- [ ] All new API routes respond correctly with session-derived-userId auth
- [ ] Canonical Jarvis surface (`/api/jarvis/v2`) extended for voice+text
- [ ] `jarvis-error.log` entries resolved
- [ ] `OSNavbar`/`OSMobileNav` removed; all routes still reachable via `Navbar.tsx`
- [ ] Mock-Data Forensic Census document exists and is non-empty

**Security/DevOps:**
- [ ] SonarQube: zero CRITICAL, zero HIGH
- [ ] Security headers + rate limiting + AI route timeouts + Sentry live
- [ ] GitHub Actions CI + deploy workflows live; branch protection on main
- [ ] Database indexes verified for four hot query patterns

**Quality:**
- [ ] All test suites 100% pass; ESLint zero errors; TypeScript zero errors
- [ ] Auditors checked for §3.6 historical failure patterns and found none

**Documentation:**
- [ ] All 25 documents exist, zero placeholders, cross-references resolve

**IMPL-C compliance:**
- [ ] IMPL-C was NOT deployed in this batch

## Acceptance Criteria
- [ ] Step 0 was NOT executed (PRN skipped per user decision)
- [ ] IMPL-C was NOT deployed
- [ ] All 5 corrections from §0 were respected
- [ ] `batch_4_completion_package.md` ends with "OPERATION: FOUNDATION COMPLETE."
