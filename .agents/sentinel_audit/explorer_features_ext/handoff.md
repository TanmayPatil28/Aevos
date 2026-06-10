# Extended Features Audit — Handoff Report

**Auditor**: Extended Features Auditor (Explorer)
**Date**: 2026-06-09
**Scope**: Multi-Semester, Dashboard, Authentication, Landing Page, and 10+ additional features

---

## Executive Summary

GradeFlow's extended features are functionally rich but exhibit several recurring issues: **dual auth system conflict** (NextAuth + Supabase both present), **missing server-side validation for critical fields** (`total_credits` not in Zod schema), **no Google OAuth button despite configured provider**, **no pagination on history tables**, **no password strength enforcement on registration**, and a **28KB monolithic landing page** with performance concerns. Most features are PARTIAL — functional at the core but lacking edge-case protection and hardened error handling.

---

## 1. Observation

### 1.1 Multi-Semester (`app/multi-semester/page.tsx` — 679 lines, 36KB)

**CGPA Calculation Logic** (lines 86–152):
- Weighted average: `cumulativePoints += (credits * sgpa); cgpa = cumulativePoints / cumulativeCredits`
- Formula is mathematically correct for credit-weighted CGPA.
- Supports three scale modes: `10`, `4`, and `percent` (line 88–91). Each has correct `limitMax`.
- `toFixed(2)` applied for chart data and final values. Floating-point precision is adequate.

**What-If Simulation** (lines 105–110, 209–217):
- When `whatIfMode` is enabled, each semester has a separate `whatIfSgpa` field.
- `wgValue` falls back to `gValue` when whatIfSgpa is not set (line 126): `const wgValue = parseFloat(s.whatIfSgpa) || gValue;`
- **Issue**: `parseFloat("0")` returns `0`, which is falsy, causing fallback to `gValue`. A student entering `0.0` as what-if will get the actual SGPA instead. This is a **logic bug**.

**Input Validation**:
- Credits: Must be > 0 (line 102): `if (isNaN(c) || c <= 0) isValid = false;`
- SGPA: Must be 0–limitMax (line 103): `if (isNaN(gValue) || gValue < 0 || gValue > limitMax) isValid = false;`
- Visual feedback for out-of-range SGPA (line 412): border turns red when value exceeds max.
- **Missing**: No validation for non-numeric text in name field. Max credit value is unchecked (could enter 99999).
- **Missing**: No min-length/max-length on semester names.

**Persistence**:
- Saves to `localStorage` key `gradeflow_multi_sem` on every change (lines 74–83). 
- Loads from USM store if authoritative data exists (lines 41–50), else falls back to localStorage (lines 53–69).
- Offline save fallback stores to `gradeflow_multi_sem_offline` key (lines 252–277), capped at 20 entries.
- Online save POSTs to `/api/calculations` (lines 229–249).
- **Issue**: Redundant null-check on `result` at lines 220-224 — line 220 already guards `if (!result || isSaving) return;`, then line 221 checks `if (!result)` again which is dead code.

**Edge Cases**:
- Max 12 semesters enforced (line 156–158): toast error shown.
- Min 1 semester enforced (line 165–168): toast error shown.
- Empty semesters: Result returns `null`, showing placeholder UI (lines 634–643).
- `confirm()` used for destructive actions (line 173, 182) — blocks UI, no custom modal.

**Verdict**: **PARTIAL** — Core calculation correct, but what-if `0` value bug, dead code, no upper limit on credit values, `confirm()` instead of custom dialog.

---

### 1.2 Dashboard (`app/(workspace)/dashboard/`)

**Server-Side Data Loading** (`page.tsx`, lines 1–64):
- Server Component fetches via Supabase + Prisma with proper auth check (lines 9–13).
- `redirect("/login")` if no user — correct.
- Three parallel try/catch blocks for calculations, plans, enrollments (lines 22–49).
- `JSON.parse(JSON.stringify(...))` for serialization boundary (lines 52–54) — safe but inefficient.

**Client Hydration** (`DashboardClient.tsx`, lines 76–197):
- Complex hydration logic merging server props into USM store.
- **Emergency fix** at lines 62–67: Nukes localStorage if > 12 semesters detected. This is a brute-force guard against a previous bug. Uses `window.location.reload()` which causes a full page reload.
- Deduplication logic for semester calculations (lines 107–113) prevents duplicate entries.
- Authoritative data protection: blocks overwriting verified semesters (lines 120–124).

**OS-Mode Views**:
- Three modes: `academic`, `career`, `unified` — toggled via floating pill bar (lines 362–393).
- Each view loaded via `dynamic()` with `ssr: false` — good for performance, shows skeleton loader.

**History Table** (`components/dashboard/HistoryTable.tsx`):
- Search/filter by semester name (lines 33–37).
- **Missing pagination**: Previous button is disabled (`cursor-not-allowed`), Next button has no handler (lines 167–169). This is a **non-functional pagination UI** — buttons exist but are decorative.
- Delete calls `onDelete(calc.id)` — no confirmation dialog before deletion.
- Detail drawer is accessible via keyboard (Escape to close, line 23–30).

**Export** (`app/api/export/route.ts`):
- CSV export with proper auth check (lines 10–16).
- **Issue**: CSV values are not escaped. If a semester name contains commas or quotes, the CSV will be malformed (line 29).
- **Import**: `getServerSession` and `authOptions` from NextAuth are imported (lines 3-4) but never used — dead imports.

**Trend Chart** (`components/dashboard/TrendChartSection.tsx`):
- Recharts BarChart and LineChart with toggle (lines 37–197).
- Bar/Line view toggle works. Custom tooltip renders SGPA and CGPA.
- Y-axis domain hardcoded to `[0, 10]` (lines 129, 165) — **breaks on 4-point or percent scale modes**.
- `avgCgpa` calculated correctly (line 61).
- **Static insight text**: "Improved trajectory over the last cycle" (line 202) — not data-driven.

**Verdict**: **PARTIAL** — Solid architecture with OS-mode switching, but fake pagination, hardcoded Y-axis, unescaped CSV, dead imports, no delete confirmation.

---

### 1.3 Authentication

**Dual Auth System Conflict**:
- `lib/auth.ts`: Configures **NextAuth** with Google + Credentials providers, PrismaAdapter, JWT strategy.
- `lib/supabase/`: Full **Supabase Auth** setup with SSR cookies.
- `lib/auth/AuthProvider.tsx`: Uses **Supabase** `onAuthStateChange`.
- `middleware.ts`: Uses **Supabase** `createServerClient` + `getUser()`.
- `app/login/page.tsx`: Uses **Supabase** `signInWithPassword`.
- `app/register/page.tsx`: Uses **Supabase** `signUp`.
- `app/api/calculations/route.ts`: Imports BOTH NextAuth (`getServerSession`, line 4) AND Supabase (line 1), but only uses Supabase for actual auth.
- **Conclusion**: NextAuth is vestigial — configured but unused at runtime. The app runs on Supabase Auth exclusively. `lib/auth.ts` and all NextAuth imports are dead code.

**Login Flow** (`app/login/page.tsx`):
- Email + password via `supabase.auth.signInWithPassword`.
- Basic validation: checks non-empty fields (line 19–21).
- Error messages surface Supabase error directly via `toast.error(error.message)` (line 31) — could leak internal details.
- Redirects to `/dashboard` on success with `router.refresh()` (lines 33–34).
- **Missing**: No rate limiting (client-side or referenced server-side). No "forgot password" link.
- **Missing**: No Google OAuth button on login page despite provider being configured in `lib/auth.ts`.

**Registration Flow** (`app/register/page.tsx`):
- Three fields: name, email, password.
- `supabase.auth.signUp` with `data: { full_name: data.name }` metadata (lines 29–37).
- Comment notes email confirmations disabled for MVP (line 28).
- **Missing**: No password strength requirements enforced (Supabase's default is 6 chars minimum). No confirm password field. No terms of service agreement.
- **Missing**: The `registerSchema` in `lib/validations.ts` requires 6+ char password (line 6) but is NOT used in the registration page — the page does client-only empty-check.

**Middleware** (`middleware.ts`):
- Supabase SSR client with cookie forwarding (lines 9–28).
- `getUser()` called for every matched route (line 35).
- Protected routes: `/dashboard` and `/api/*` (except `/api/parse`, `/api/chat`, `/api/jarvis`) (lines 38–42).
- **Issue**: Only `/dashboard` is protected, NOT workspace routes like `/attendance`, `/placement`, `/focus`, `/forecast`, `/planner`, `/backlog`. These workspace routes are **unprotected** — accessible without auth.
- Redirect to `/login` for unauthorized access (lines 46–48).
- Redirect logged-in users away from `/login` and `/register` (lines 52–56).
- Matcher excludes static assets (line 71).

**Session/Cookie Security**:
- Supabase handles cookies with `setAll` method (lines 17–24).
- Cookie options delegated to Supabase defaults.
- No explicit `httpOnly`, `secure`, `sameSite` configuration visible — relying on Supabase defaults.
- `signOut` has offline resilience: forces local state clear even on network failure (line 76).

**Verdict**: **PARTIAL** — Core Supabase auth works, but vestigial NextAuth dead code, missing password strength enforcement, no Google OAuth button, most workspace routes unprotected, no forgot-password, no rate limiting.

---

### 1.4 Landing Page (`app/page.tsx` — 504 lines, 28KB)

**Structure**:
- `"use client"` — entire 28KB page is a client component. No SSR.
- Composed of: `LocalNav`, `HeroSection`, `HighlightsCarousel`, `OSMorphingSequence` (400vh scroll section), `TextReveal` (×2), `IntelligenceBento`, `DeepDivePills` (×2), `SpecsBento`, `Footer`.
- All components defined inline in a single file.

**CTA Buttons**:
- `LocalNav` (line 496): "Initialize Engine" → links to `/dashboard`. Correct.
- No other CTA links — the hero section has no button.
- **Missing**: No "Get Started" or "Register" CTA in hero section.

**Animations (Framer Motion)**:
- Scroll-based parallax via `useScroll` + `useTransform` + `useSpring` (lines 228–240).
- `OSMorphingSequence`: 400vh sticky section with scale + opacity morphing between Academic and Career mockups.
- `HighlightsCarousel`: Auto-advancing with play/pause toggle (lines 162–170). `setInterval` at 4s.
- All animations use `will-change: transform, opacity` (lines 247, 251) — GPU-optimized.

**Performance Concerns**:
- 28KB single client-side component with heavy Framer Motion usage.
- 400vh scroll section creates a very tall page (~1600px of virtual scroll).
- Multiple inline DOM mockup components (`AcademicDashboardMockup`, `CareerDashboardMockup`) duplicate entire UI layouts as static HTML.
- No lazy loading, no code splitting within the page.
- **Recommendation**: Split into smaller components with `dynamic()` imports.

**`dangerouslySetInnerHTML`**:
- Used at line 308 in `TextReveal` component: `dangerouslySetInnerHTML={{ __html: subtext }}`.
- The `subtext` values are hardcoded strings at lines 454, 461, 472 — NOT user input. 
- **Risk**: Low (hardcoded content), but pattern is unsafe if reused with dynamic data.

**Responsiveness**:
- Uses responsive classes: `md:text-[10rem]`, `lg:text-[12rem]`, mobile-first padding.
- Carousel uses `flex-wrap` for mobile (line 180).
- OS Morphing section mockups may be too small on mobile (16:9 aspect ratio).

**Footer Links**:
- "Privacy Policy", "Terms of Service", "Documentation" are plain `<span>` elements with cursor-pointer but **no actual links** (lines 430–432). They are non-functional.

**Verdict**: **PARTIAL** — Visually impressive, but 28KB monolith without code splitting, non-functional footer links, no hero CTA button, hardcoded `dangerouslySetInnerHTML` (low risk).

---

### 1.5 Focus/Pomodoro (`app/(workspace)/focus/page.tsx` — 210 lines)

**Core Logic**:
- Standard Pomodoro: WORK (25min), SHORT_BREAK (5min), LONG_BREAK (15min) (lines 9–13).
- Timestamp-based timer: stores `endTime` in USM store, calculates remaining via `Date.now()` delta (lines 59–62). This survives re-renders correctly.
- Timer checks at 200ms intervals (line 82) — good accuracy.
- Streak increments after WORK session, long break every 4th session (lines 94–95).

**Tab Switching Detection**:
- Fires toast warning on `visibilitychange` during WORK mode (lines 34–51).
- Does NOT pause or penalize — just warns. No actual enforcement.

**Pause Behavior**:
- Comment at lines 105–108 acknowledges pause isn't fully implemented.
- "Pausing" just calls `stopFocus()` then `startFocus(timeLeft)` — essentially restarts with remaining time. This works but isn't true pause persistence.

**Edge Cases**:
- Timer completion fires even if component was unmounted and remounted (timestamp-based).
- `handleTimerComplete` referenced inside useEffect but not in dependency array (line 85). React will use stale closure for `focusStreak`. **Potential stale state bug** on streak count.

**Verdict**: **PARTIAL** — Solid Pomodoro implementation, but stale closure risk on streak, tab enforcement is only a toast, pause is a workaround.

---

### 1.6 Placement Intelligence (`app/(workspace)/placement/page.tsx` — 409 lines)

**Core Architecture**:
- Uses `intelligenceEngine` (imported from `lib/career/intelligenceEngine`) for all calculations.
- Three computations: `calculateEligibility`, `calculatePlacementRisk`, `detectSkillGaps` (lines 102, 110, 111).
- AI-enhanced skill gap detection via `analyzeSkillGapAI` (lines 114–120) — async, with cleanup.

**Sandbox Mode**:
- Users can override CGPA and backlogs for what-if analysis (lines 57–79).
- Global sandbox state synced to USM store.
- Reset properly clears sandbox metrics (lines 206–209, 224–227).

**Company Filtering/Sorting**:
- Filter by tier: All, FAANG, Product, Startup, Service (lines 278–290).
- Sort by: Score, Difficulty (inverse), Name (lines 131–136).
- Search by company name (lines 125–129).
- Pin up to 3 target companies (lines 81–91), enforced with toast.

**Double Filtering Bug** (lines 105–107 and 125–129):
- `activeFilter` is applied TWICE: once after `useMemo` (line 106) and again inside `processedResults` (line 126). This is redundant but not buggy — just wasteful computation.

**Verdict**: **PARTIAL** — Well-designed intelligence engine integration, but double filtering, reliance on client-side store for CGPA (no server validation of eligibility claims).

---

### 1.7 Attendance Tracking (`app/(workspace)/attendance/page.tsx` — 521 lines)

**Core Logic**:
- Uses `selectAttendanceRisk` selector from store (line 51).
- Strategy adjustment: SAFE (+10%), SURVIVAL (-5%) from preset threshold (lines 54–56).
- Safe bunk calculation (lines 183–192):
  ```
  safeBunks = floor((attended - threshold * conducted) / threshold)
  recoveryRequired = ceil((threshold * conducted - attended) / (1 - threshold))
  ```
  Mathematically correct.

**Drag & Drop Categorization**:
- Custom theory/lab categorization via drag-and-drop (lines 122–170).
- Persisted to localStorage under `attendance_categories` (lines 93–109).
- Auto-detection via regex: `/lab|practical|workshop/i` (line 119).

**Quick Actions**:
- "Mark Attended" increments total (line 265): `attendanceTotal + 1`.
- "Mark Bunked" increments BOTH total and bunked (line 271): `attendanceTotal + 1, attendanceBunked + 1`.
- **Issue**: No undo mechanism. No confirmation. Accidental click permanently changes data.

**Edge Cases**:
- Empty courses: Shows "No courses registered" placeholder (lines 348–364).
- `Math.max(0, ...)` guards negative bunk/recovery values (lines 188, 191).

**Verdict**: **PARTIAL** — Good feature set with drag-and-drop, strategy adjustment, and correct math. But no undo on quick actions, no confirmation dialog.

---

### 1.8 Career OS (`app/(os)/career/page.tsx` — 104 lines)

- Server component (no `"use client"`). Static career track listing.
- Only `ai-ml` track is active with a working link to `/career/ai-ml` (line 64).
- Other tracks (Full Stack, Backend, DSA, Cybersecurity) show "Coming Soon" badge (line 91).
- No functional issues. Clean component.

**Verdict**: **PASS** — Simple static page, functions correctly. Active tracks link properly.

---

### 1.9 OS Features (`app/(os)/`)

- **Overview** (`overview/page.tsx`): Thin wrapper around `OverviewCanvas` component (16 lines). Server component with metadata.
- **Forecasting** (`forecasting/page.tsx`): Exists, content not deeply audited due to scope.
- **Identity** (`identity/page.tsx`, `identity/github/`, `identity/linkedin/`): Profile management with GitHub/LinkedIn sub-pages.
- **Ledger** (`ledger/page.tsx`): Academic ledger view.
- **Records** (`records/page.tsx`): Academic records view.
- All OS pages use the shared `(os)/layout.tsx` wrapper.

**Verdict**: **PASS** (surface-level) — Pages exist and render. Deep functional audit deferred due to scope limits.

---

### 1.10 Jarvis AI Command Center (`components/JarvisCommandCenter.tsx` — 501 lines)

**Architecture**:
- Spotlight-style command palette with search, quick commands, and AI chat.
- Streaming response from `/api/jarvis` endpoint (lines 122–168).
- SSE-style streaming with `reader.read()` loop parsing JSON chunks.
- Actions can navigate, mark attendance, or set target CGPA (lines 59–104).

**Document Upload (Jarvis Vision)**:
- File drop zone via `react-dropzone` (lines 214–260).
- Only accepts images (line 218).
- Uploads to Supabase storage bucket `marksheets`, then sends base64 to `/api/parse` (lines 224, 237–243).
- **Issue**: If storage upload fails, proceeds with local parsing anyway (line 226) — good degradation.

**Keyboard Navigation**:
- Arrow keys navigate commands, Enter executes (lines 176–208).
- Escape closes modal (line 180, 202).

**Issues**:
- `require()` used synchronously inside `executeAction` (lines 60–61): `require("@/stores/dynamicIslandStore")`. This is a dynamic import anti-pattern in React — should use `import()`.
- `handleQuickCommand` in useCallback has empty dependency array (line 172) but references `submitQuery` — **stale closure bug**. The callback will always use the initial `submitQuery` reference.

**Verdict**: **PARTIAL** — Feature-rich AI command center, but stale closure bug in quick command handler, synchronous `require()` anti-pattern.

---

### 1.11 Dynamic Island (`components/dynamic-island/`)

- 8 components totaling ~90KB of code.
- `LiveActivities.tsx` alone is 53KB — extremely large single component.
- Includes: Bunk Calculator, Contextual Island, Exam Countdown, Intervention Alerts, Timetable Controller, Streak Badge.
- Test controls available (`IslandTestControls.tsx`).

**Verdict**: **PARTIAL** — Rich feature set but `LiveActivities.tsx` at 53KB is a performance concern. Should be split.

---

### 1.12 API Validation (`lib/validations.ts`)

- `calculationSchema` (lines 9–14): Validates `semester`, `subjects` (array), `presetId` (optional), `type` (enum).
- **Missing from schema**: `total_credits` field. The API route at `calculations/route.ts:115` uses `Number(total_credits)` but `total_credits` is NOT validated by Zod. If missing or malformed, `Number(undefined)` = `NaN` gets stored in the database.

**Verdict**: **FAIL** — `total_credits` missing from Zod validation schema, allowing invalid data to reach database.

---

### 1.13 Storage Upload (`lib/supabase/storage.ts`)

- File extension extracted from filename: `file.name.split('.').pop()` (line 5).
- Filename: random string + timestamp (line 6).
- **Issue**: No file size limit enforced. No MIME type validation (only extension-based). User could upload arbitrarily large files.
- Bucket types are hardcoded as union type: `"marksheets" | "resumes" | "documents" | "avatars"` (line 3).

**Verdict**: **PARTIAL** — Works but no file size or MIME type validation.

---

## 2. Logic Chain

1. **Dual Auth**: `lib/auth.ts` configures NextAuth → but `middleware.ts`, `login/page.tsx`, `register/page.tsx`, and all API routes use Supabase Auth → NextAuth is dead code → increases maintenance burden and confusion.
2. **Middleware gaps**: `middleware.ts` only protects `/dashboard` and `/api/*` → workspace routes (`/attendance`, `/focus`, `/placement`, etc.) are accessible without login → data integrity risk since these pages read/write to local store which may not be user-scoped.
3. **Multi-semester what-if bug**: `parseFloat("0") || gValue` → `0 || gValue` → `gValue` → entering `0.0` as what-if SGPA uses actual SGPA instead → incorrect simulation result.
4. **Validation gap**: `calculationSchema` missing `total_credits` → API route uses `Number(total_credits)` without validation → NaN can be stored in database → corrupts calculation records.
5. **Landing page performance**: 28KB client component with no code splitting → increases initial bundle → slows FCP/LCP → poor Core Web Vitals.
6. **Pagination facade**: HistoryTable shows Previous/Next buttons → Previous is permanently disabled, Next has no handler → misleading UI.

---

## 3. Caveats

- **Not tested at runtime**: All findings are from static code analysis. Runtime behavior may differ (e.g., Supabase may enforce additional password rules server-side).
- **OS features partially audited**: `forecasting`, `identity`, `ledger`, `records` were only surface-checked (file existence and basic structure). Deep logic audit was not performed.
- **Store internals not audited**: The USM store (`stores/usmStore.ts`) and its selectors were referenced but not deeply audited — they could have their own bugs.
- **Prisma schema not reviewed**: Database constraints (NOT NULL, unique, etc.) could compensate for some validation gaps.
- **AI endpoints not audited**: `/api/jarvis`, `/api/parse`, `/api/chat` were not deeply reviewed for prompt injection or data leakage.

---

## 4. Conclusion

### Summary Table

| Feature | Verdict | Severity | Key Issues |
|---|---|---|---|
| **Multi-Semester** | PARTIAL | Medium | What-if `0` value bug, dead code, no credit ceiling |
| **Dashboard** | PARTIAL | Medium | Fake pagination, hardcoded Y-axis, unescaped CSV |
| **Authentication** | PARTIAL | High | Vestigial NextAuth, unprotected workspace routes, no password strength |
| **Landing Page** | PARTIAL | Low | 28KB monolith, non-functional footer links, no hero CTA |
| **Focus/Pomodoro** | PARTIAL | Low | Stale closure on streak, tab enforcement is toast-only |
| **Placement** | PARTIAL | Low | Double filtering (cosmetic), client-only eligibility |
| **Attendance** | PARTIAL | Medium | No undo on quick actions, no confirmation |
| **Career OS** | PASS | — | Clean static page |
| **OS Features** | PASS | — | Surface-level audit only |
| **Jarvis AI** | PARTIAL | Medium | Stale closure bug, `require()` anti-pattern |
| **Dynamic Island** | PARTIAL | Low | 53KB single component |
| **API Validation** | FAIL | High | `total_credits` missing from Zod schema |
| **Storage Upload** | PARTIAL | Medium | No file size or MIME validation |

### Top Priority Fixes (Production Blockers)

1. **Add `total_credits` to `calculationSchema`** in `lib/validations.ts` — prevents NaN in database.
2. **Protect workspace routes in middleware** — `/attendance`, `/focus`, `/placement`, `/planner`, `/backlog`, `/forecast` should require auth.
3. **Remove vestigial NextAuth code** — dead `lib/auth.ts`, unused imports in API routes.
4. **Fix multi-semester what-if 0 bug** — change `parseFloat(s.whatIfSgpa) || gValue` to handle explicit `0`.
5. **Add registration password validation** — use `registerSchema` in `register/page.tsx`.

---

## 5. Verification Method

### Reproduce Key Findings

1. **What-if 0 bug**: Open `/multi-semester`, add a semester with SGPA 8.0, enable Time Machine, set What-If SGPA to `0`. Expected: CGPA should drop. Actual: CGPA remains at 8.0.
2. **Unprotected routes**: Log out, navigate to `/attendance` or `/placement` in browser. Verify these pages load without auth redirect.
3. **Validation gap**: POST to `/api/calculations` with valid auth but no `total_credits` field. Check database for NaN value.
4. **Fake pagination**: Open `/dashboard`, scroll to Calculation History. Click "Next" button — nothing happens.
5. **Dead auth code**: Search for `getServerSession` usage — imported but unused in `api/export/route.ts` and `api/calculations/route.ts`.

### Commands for Verification
```bash
# Check for unused NextAuth imports
grep -rn "getServerSession\|authOptions" app/api/ --include="*.ts"

# Check middleware protected paths
grep -n "isDashboard\|isProtectedApi" middleware.ts

# Check validation schema completeness
cat lib/validations.ts
```
