# GradeFlow — System Capability & Feature Inventory

> **Single Source of Truth — Current Codebase Snapshot**
> Generated: 2026-05-20
> Scope: Factual documentation of existing features, modules, UI systems, and technical capabilities.
> NO suggestions, NO improvements, NO future ideas.

---

## 1. System Overview

GradeFlow is a premium academic CGPA calculator and semester planning web application targeted at B.Tech engineering students in India. It provides:

- SGPA/CGPA calculation from subject-level inputs
- Multi-semester CGPA aggregation with what-if scenario analysis
- Semester planning with target CGPA path projection
- Backlog impact simulation and recovery roadmap
- Grade/marks prediction for individual subjects
- An academic timeline visualization (hardcoded 8-semester roadmap)
- A cloud-synced dashboard showing history, trends, and analytics
- User authentication via Google OAuth and email/password credentials
- University preset system supporting multiple grading scales (10-point, 4-point, percentage)

The application uses a dark-mode-first, glassmorphism design aesthetic with extensive Framer Motion animations, custom cursor effects, and a Material Design 3-inspired color token system.

---

## 2. Feature Inventory (Module-Wise)

### 2.1 GPA Calculator (`/calculator`)

**File:** `app/calculator/page.tsx` (471 lines)

**Inputs:**
- Subject Name (text, per row)
- Credits (number, per row, validated 1–6)
- Score (number, per row)
- Input mode toggle: "Percentage" or "Grade Points"

**Default State:**
- Pre-populated with 4 placeholder subjects: Mathematics, Physics, Computer Science, English (all with empty credits/scores)

**Outputs:**
- Semester SGPA (animated counter)
- Total Earned Credits (animated counter)
- Performance Indicator label: "LEGENDARY" (≥9), "ELITE" (≥8), "STABLE" (≥7), "RECOVERY" (<7)
- Subject Breakdown table (name, credits, score, computed grade point per row)

**Calculation Logic:**
- Uses `getGradePointFromPercentage()` from `lib/calculations.ts` when in percentage mode
- Grade point scale: 90–100→10, 80–89→9, 70–79→8, 60–69→7, 50–59→6, 45–49→5, 40–44→4, <40→0
- When in "Grade Points" mode, raw score (0–10) is used directly
- SGPA = `calculateSGPA()` = `Σ(credits × gradePoint) / Σ(credits)`
- 800ms artificial delay before displaying results

**Save Behavior:**
- POSTs to `/api/calculations` with `{ semester: "Semester", subjects, sgpa, cgpa: sgpa, total_credits }`
- CGPA is set equal to SGPA (no cumulative tracking in this module)
- Requires authentication; shows error toast if unauthenticated

**Validation:**
- Name: must not be empty
- Credits: 1–6 range
- Score: 0–100 (percentage mode) or 0–10 (grade point mode)
- Inline per-field error messages displayed

**UI Features:**
- Animated row add/remove via Framer Motion `AnimatePresence`
- Sliding toggle for Percentage/Grade Points with animated indicator
- Grade Scale Reference sidebar card (sticky positioned)
- Navigation pills: Back to Home, Plan Semester

---

### 2.2 Backlog Optimizer (`/backlog`)

**File:** `app/backlog/page.tsx` (563 lines)

**Inputs:**
- Current CGPA (floating-point, 0–10)
- Credits Earned (completed credits total)
- Semester Credits (credits in current semester, default: 20)
- Target GPA (expected GPA for non-backlog subjects, default: 8.0)
- Backlog list (dynamic):
  - Subject Name
  - Credits
  - Expected Grade (grade if failed, default: 0)

**Outputs:**
- Post-Backlog CGPA (radial bar chart gauge)
- Severity classification: Minor (<0.2 drop), Moderate (0.2–0.5), Severe (0.5–0.8), Catastrophic (≥0.8)
- Optimistic Path CGPA (if all passed)
- Backlog Reality CGPA (with backlogs)
- CGPA drop value
- Impact Delta Analysis bar chart (If Passed vs If Failed)
- Recovery Roadmap:
  - Required GPA next semester to recover
  - Per-backlog "RESIT REQ" indicators
  - "Critical" flag if recovery GPA exceeds 10

**Calculation Logic:**
- `currentPoints = currentCGPA × completedCredits`
- `totalCreditsAtEnd = completedCredits + semesterCredits`
- Pass scenario: `cgpaPass = (currentPoints + semesterCredits × expectedGPA) / totalCreditsAtEnd`
- Fail scenario: safe credits = semester credits − total backlog credits; fail points = safe credits × expected GPA + Σ(backlog credits × backlog expected grade)
- `cgpaFail = (currentPoints + safePoints + backlogPoints) / totalCreditsAtEnd`
- Drop = `cgpaPass − cgpaFail`
- Recovery: `recoveryGPA = (cgpaPass × (totalCreditsAtEnd + nextSemCredits) − failPointsTotal) / nextSemCredits`

**Save Behavior:**
- Saves to `localStorage` under key `gradeflow_backlog_reports` (max 20 entries)
- No cloud/API save

**Charting:**
- Recharts: `RadialBarChart` for gauge, `BarChart` for impact delta
- Gradient fills via SVG `<defs>`

**Validation:**
- Inline field errors stored in `errors` record keyed by field name
- Required: currentCGPA (0–10), completedCredits (>0), semesterCredits (>0), expectedGPA (0–10)
- Per-backlog: name required, credits >0

---

### 2.3 Grade Predictor (`/predictor`)

**File:** `app/predictor/page.tsx` (528 lines)

**Subject Types:**
- Theory (100 marks total): T1/30 + T2/30 + Assignments/40 + End Semester/100
- Theory (50 marks total): T1/30 + T2/30 + Assignments/40 + End Semester/50
- Lab Subject: Assignments/40 + Lab Final Exam/50

**Inputs:**
- Subject type selector (theory100 / theory50 / lab)
- T1 Marks (max 30)
- T2 Marks (max 30)
- Assignment Marks (max 40)
- End Semester / Lab Exam marks
- "Best of T1/T2" toggle (takes higher of two tests)
- Target Grade dropdown (O, A+, A, B+, B, C, P, F)

**Outputs:**
- Required marks in End Semester / Lab Exam to achieve target grade
- Current running percentage
- Current grade classification
- "Target Already Achieved" / "Target Mathematically Impossible" indicators
- Score Distribution donut chart (Scored / Lost / Remaining)
- Stat cards: Internal Base, Total Scored, Running %, Current Grade
- Strategic Insight text (weak/strong internal base)

**Grade Scale (Predictor-specific):**
- O: 10 GPA, ≥90%
- A+: 9 GPA, ≥80%
- A: 8 GPA, ≥70%
- B+: 7 GPA, ≥60%
- B: 6 GPA, ≥55%
- C: 5 GPA, ≥50%
- P: 4 GPA, ≥40%
- F: 0 GPA, <40%

> Note: This grade scale differs from the Calculator's scale (B is 50–59 there, 55+ here; C is 45–49 there, 50+ here; P grade exists here but not in Calculator).

**Calculation Logic (all via `useMemo`):**
- Theory: `totalMax = maxBase + maxEndSem`; `totalScored = scoredBase + endSemScore`
- Best-of mode: `scoredBase = max(T1, T2) + assignments`; `maxBase = 30 + 40 = 70`
- Normal mode: `scoredBase = T1 + T2 + assignments`; `maxBase = 30 + 30 + 40 = 100`
- Lab: `maxBase = 40`; `totalMax = 40 + 50 = 90`
- `percentage = (totalScored / totalMax) × 100`
- `neededInEndSem = (targetMinPercent / 100 × totalMax) − scoredBase`

**Save Behavior:**
- Saves scenarios to `localStorage` under `gradeflow_predictor_scenarios` (max 20)
- No cloud save

**University Integration:**
- Reads `activePreset` from `UniversityProvider`
- Shows "Math standardized" warning if preset is not `jspm` or `sppu`

**Charting:**
- Recharts `PieChart` with 3 cells: Scored (#3b82f6), Lost (#ef4444), Remaining (#cbd5e1)

---

### 2.4 Semester Planner (`/planner`)

**File:** `app/planner/page.tsx` (841 lines)

**Inputs:**
- Current CGPA (0–10)
- Completed Semesters (≥1)
- Total Credits Done (≥1)
- Target CGPA (0–10, must be > current)
- Remaining Semesters (1–8)
- Credits Per Semester (1–30, default: 20)

**Outputs:**
- CGPA Gap (target − current)
- Required GPA per remaining semester (animated counter)
- Difficulty Level classification:
  - >9.5: "VERY HARD" (red)
  - 8.0–9.5: "CHALLENGING" (yellow)
  - 7.0–8.0: "ACHIEVABLE" (blue)
  - <7.0: "EASY" (green)
- Semester Plan Breakdown table with per-semester: credits, required GPA, percentage needed, animated difficulty bar
- CGPA Projection line chart (Target Path vs Current Trend)
- Expert Insight text (contextual advice based on required GPA)
- CGPA Journey progress bar (current vs target on 0–10 scale)
- "Target Cannot Be Achieved" warning if required GPA > 10

**Calculation Logic:**
- `calculateRequiredGPA(target, current, completedCredits, remainingCredits)` from `lib/calculations.ts`
- Formula: `(targetCGPA × totalCredits − currentCGPA × completedCredits) / remainingCredits`
- Chart data: linear interpolation from current CGPA to target across remaining semesters
- `gpaToPercentage()`: piecewise linear mapping (10→95%, 9→85%, etc.)
- `getDifficultyLevel()`: returns label, color, border styling, sublabel based on required GPA thresholds

**Save Behavior:**
- POSTs to `/api/plans` with `{ current_cgpa, target_cgpa, completed_semesters, remaining_semesters, required_gpa, plan_data }`
- Fallback: saves to `localStorage` under `gradeflow_offline_plans` if API fails (max 20)
- Requires authentication

**Validation:**
- Live validation with green glow on valid fields (`isValid` prop on Input)
- Touched-field tracking (errors only show after interaction)
- Full validation on generate

**Charting:**
- Recharts `LineChart` with two `Line` series: Target_Path (solid #4F8EF7) and Current_Trend (dashed white/30%)

---

### 2.5 Multi-Semester Aggregator (`/multi-semester`)

**File:** `app/multi-semester/page.tsx` (662 lines)

**Inputs:**
- Dynamic semester list (add/remove, max 12):
  - Semester Name (text)
  - Credits (number)
  - SGPA (number, validated against scale)
  - What-If SGPA (number, visible only in What-If mode)
- "Time Machine" toggle for What-If mode

**Outputs:**
- Actual CGPA (animated counter)
- What-If CGPA (shown only in What-If mode)
- Trajectory diff indicator (Ascension/Decline Detected with absolute point change)
- Chronological Trajectory area chart (Actual vs What-If)
- Total Credits

**Calculation Logic (via `useMemo`):**
- Iterates semesters sequentially, accumulating `cumulativeCredits` and `cumulativePoints`
- `cgpa = cumulativePoints / cumulativeCredits` at each step
- What-If uses separate accumulator with `whatIfSgpa` values
- Scale-aware validation: max 10 (10-point), max 4 (4-point), max 100 (percentage)

**State Persistence:**
- Auto-saves to `localStorage` under `gradeflow_multi_sem` on every change
- Loads from localStorage on mount with fallback defaults (3 sample semesters)

**Save Behavior:**
- POSTs to `/api/calculations` as "Multi-Sem Timeline ({scaleMode} Scale)"
- Offline fallback to `gradeflow_multi_sem_offline` in localStorage
- Requires authentication

**University Integration:**
- Reads `scaleMode` and `activePreset` from `UniversityProvider`
- "Auto-Load {shortName} Structure" button (visible only for presets with `defaultCreditsPerSem`)
- Loads JSPM 8-semester B.Tech credit structure: [21, 23, 20, 20, 20, 20, 20, 20]

**Charting:**
- Recharts `AreaChart` with gradient fills
- Two areas: `Actual_CGPA` (neutral stroke) and `What_If_CGPA` (indigo, shown only in What-If mode)

---

### 2.6 Timeline / Academic Journey (`/timeline`)

**File:** `app/timeline/page.tsx` (257 lines)

**Nature:** Static/hardcoded visualization. No user input processing.

**Content:**
- 8 hardcoded semester nodes with:
  - Title (Semester 01–08)
  - Status: completed (1–3), current (4), upcoming (5–8)
  - Hardcoded SGPA: 9.2, 8.8, 9.5, "TBD" for current, "—" for upcoming
  - Focus subjects (hardcoded list per semester)
  - Achievements (hardcoded: "Dean's List" for Sem 1, "Hackathon Winner" for Sem 3)
  - Color gradient per semester

**UI Layout:**
- Left panel: interactive clickable timeline with vertical gradient line and numbered nodes
- Right panel: detail card viewer (glass card with blur animation on select)
- Shows: Academic Profile, GPA, Core Focus tags, Outcome badge
- CTA: "Calculate Target" link to `/calculator`
- Info notice: "This timeline represents your standardized curriculum roadmap."

**University Integration:**
- Displays `activePreset.name` in header subtitle

---

### 2.7 Dashboard (`/dashboard`)

**Files:** `app/dashboard/page.tsx` (server component, 54 lines) + `app/dashboard/DashboardClient.tsx` (client component, 302 lines) + `app/dashboard/error.tsx`

**Server Component:**
- Requires authentication (redirects to `/login` if no session)
- Fetches `Calculation[]` and `Plan[]` from Prisma for authenticated user
- Serializes data via `JSON.parse(JSON.stringify())` for hydration boundary
- Passes `userName`, `initialCalculations`, `initialPlans`, `dbError` to client

**Client Component — Data Processing:**
- `currentCgpa`: from most recent calculation, fallback 8.75
- `prevCgpa`: from second most recent, fallback 8.55
- `bestSgpa`: max SGPA across all calculations, fallback 9.40
- `totalCalcs`: count of calculations, fallback 12
- `targetCgpa`: from most recent plan, fallback 9.0
- Performance breakdown: S Tier (9+), A Tier (8–9), B Tier (7–8), Review Session (<7) — with hardcoded fallback values when no data
- Top 5 subjects by score (flattened from all calculations)
- Activity timeline: merged calculations + plans, sorted by date, top 5
- Insights: 3 hardcoded insight objects (Trend Analysis, Focus Area, Next Milestone)

**Dashboard Sub-Components (in `components/dashboard/`):**
| Component | File | Purpose |
|---|---|---|
| `DashboardHeader` | `DashboardHeader.tsx` (6KB) | Username greeting, Clear History / Export CSV / Export PDF buttons |
| `StatCard` | `StatCard.tsx` (4.3KB) | Animated stat display with icon, glow, tooltip |
| `TrendChartSection` | `TrendChartSection.tsx` (8.6KB) | GPA trend line chart (Recharts) |
| `HistoryTable` | `HistoryTable.tsx` (15.6KB) | Paginated calculation history with expand/delete |
| `BreakdownCards` | `BreakdownCards.tsx` (7.6KB) | Performance distribution, top subjects |
| `QuickActions` | `QuickActions.tsx` (5.1KB) | Navigation shortcuts to other modules |
| `SemesterComparison` | `SemesterComparison.tsx` (5.3KB) | Side-by-side semester comparison table |
| `ActivityTimeline` | `ActivityTimeline.tsx` (3.7KB) | Recent activity feed |
| `InsightsPanel` | `InsightsPanel.tsx` (1.5KB) | Static insight cards |
| `MotivationalBanner` | `MotivationalBanner.tsx` (3KB) | Motivational message based on progress |
| `analytics/` | Empty directory | No analytics sub-components exist |

**Actions:**
- Delete individual calculation: `DELETE /api/calculations/{id}`
- Clear all history: `DELETE /api/calculations/clear`
- Export CSV: `GET /api/export` (triggers browser download)
- Export PDF: `window.print()` (browser print dialog)

---

### 2.8 Landing Page (`/`)

**File:** `app/page.tsx` (690 lines)

**Sections:**
1. **Hero**: Word-by-word staggered headline ("Calculate Smarter. Plan Better. Score Higher."), subtitle, CTA buttons (Calculate My CGPA → /calculator, See How It Works → #anchor)
2. **Stats Bar**: Animated counters (10,000+ Calculations, 500+ Active Students, 4.9/5 Rating) — all hardcoded values
3. **Features Bento Grid**: 3 feature cards:
   - Dynamic CGPA Calculator (8-col wide, with 3D tilt via mouse tracking, HUD holographic scanner beam animation, spotlight glare effect)
   - Semester Planner (4-col, with ThreeDProgress component)
   - History & Analytics (12-col full-width, with animated bar chart demo)
4. **Animated Sphere**: Parallax-tracked gradient sphere background element
5. **How It Works**: 3-step process (Input Your Grades → Instant Processing → Plan Your Future) with animated connecting dashed lines
6. **CTA Banner (StellarCTA)**: Premium dark card with mesh gradient backgrounds, animated SVG trajectory curve, orbiting glass rings, spotlight hover effect

**Interactive Effects:**
- Mouse-tracked parallax on dot grid and sphere
- 3D card rotation on CalculatorCard via `useMotionValue` + `useTransform` + `useSpring`
- Floating particles component (12 random particles with CSS animation)
- Holographic scanner beam on HUD container

---

### 2.9 Authentication Pages

**Login (`/login`):** `app/login/page.tsx` (5.6KB)
- Email/password credentials login
- Google OAuth login button
- Link to register page

**Register (`/register`):** `app/register/page.tsx` (5KB)
- Name, email, password fields
- Validated with `registerSchema` (Zod)
- POSTs to `/api/register`
- Auto-signs in after successful registration

---

## 3. UI System Capabilities

### 3.1 Component System (`/components/ui/`)

#### Card (`Card.tsx`, 53 lines)
- `forwardRef` component wrapping a `<div>` with `premium-card` base class
- **Variants:** `default` (white/6% border), `accent` (primary border + glow), `warning` (amber border + tint), `danger` (red border + tint)
- **Padding sizes:** `sm` (p-4), `md` (p-6), `lg` (p-8), `xl` (p-8 md:p-12)
- Uses `cn()` (clsx + tailwind-merge) for class merging
- Compatible with `motion()` wrapping (used as `MotionCard = motion(Card)` in multiple pages)

#### Input (`Input.tsx`, 63 lines)
- `forwardRef` component extending native `<input>` attributes
- **Props:** `label`, `floating` (boolean for floating label mode), `error` (string), `hasError` (boolean), `isValid` (boolean), `wrapperClassName`
- **Floating label:** absolute positioned, tiny uppercase label above input; transitions color on focus
- **Error state:** `premium-input-error` class (red border, red tint, red glow)
- **Valid state:** green border/tint/glow when `isValid && !isError`
- Base class: `premium-input` + `premium-focus`
- Focus ring: 2px primary ring with black offset

#### Select (`Select.tsx`, 75 lines)
- `forwardRef` component extending native `<select>` attributes
- **Props:** `label`, `options: SelectOption[]`, `error`, `wrapperClassName`
- Custom dropdown chevron icon (SVG)
- `appearance-none` for cross-browser styling
- Uses `premium-input` + `premium-focus` base classes
- Option elements: hardcoded dark background (`bg-[#0a0a0a]`) for dropdown

#### Badge (`Badge.tsx`, 51 lines)
- Inline `<span>` component
- **Variants:** `primary`, `success`, `warning`, `danger`, `neutral`
- **Sizes:** `sm` (px-2 py-0.5 text-9px), `md` (px-2.5 py-1 text-10px/xs)
- Styling: uppercase, italic, font-black, tracking-widest, rounded-full with semantic border + glow

### 3.2 Layout System (`/components/layout/`)

#### PageContainer (`PageContainer.tsx`, 23 lines)
- `<main>` wrapper with: `max-w-7xl mx-auto`, responsive padding (`px-4 sm:px-6 lg:px-8`), `pt-32 pb-20`, `space-y-16`, `min-h-screen`, `relative z-10`
- Accepts `className` for overrides

#### Section (`Section.tsx`, 29 lines)
- `<section>` wrapper with configurable vertical spacing
- **Spacing:** `sm` (space-y-4 mb-6), `md` (space-y-8 mb-12), `lg` (space-y-12 mb-16)

#### Grid (`Grid.tsx`, 52 lines)
- CSS Grid wrapper with responsive column configuration
- **Cols:** number (1–4) or object `{ mobile?, tablet?, desktop? }`
- Responsive rules: mobile defaults to 1, tablet capped at 2, desktop capped at 4
- **Gap:** `sm` (gap-4), `md` (gap-8), `lg` (gap-12)
- Uses Tailwind dynamic class generation (e.g., `sm:grid-cols-2 lg:grid-cols-3`)

### 3.3 Shared Components (`/components/`)

| Component | File | Purpose |
|---|---|---|
| `AnimatedCounter` | `AnimatedCounter.tsx` (1.4KB) | Spring-animated number counter using Framer Motion `useSpring` + `useTransform` |
| `BackgroundEffects` | `BackgroundEffects.tsx` (6KB) | Global ambient background (aurora orbs, grain texture) |
| `CustomCursor` | `CustomCursor.tsx` (4.4KB) | Custom dot + ring cursor following mouse; hidden on mobile/touch; responds to hover states |
| `Footer` | `Footer.tsx` (1.4KB) | Minimal footer |
| `GlassCard` | `GlassCard.tsx` (2.8KB) | Standalone glass card (separate from `ui/Card`) |
| `GlowButton` | `GlowButton.tsx` (1.8KB) | Button with glow effect |
| `Navbar` | `Navbar.tsx` (25KB) | Full navigation bar with: nebula-glass styling, hamburger menu, auth status display, university selector dropdown, theme toggle, responsive drawer, mobile touch support |
| `PageTransition` | `PageTransition.tsx` (629B) | Wraps children with Framer Motion fade-in transition |
| `PremiumButton` | `PremiumButton.tsx` (5.8KB) | Multi-variant button: `primary`, `outline`, `expand`; supports Material Symbols icon or custom ReactNode icon; spring animations on hover/tap |
| `StaggerContainer` | `StaggerContainer.tsx` (1.6KB) | Framer Motion stagger-children animation container + `StaggerItem` child wrapper |
| `ThemeProvider` | `ThemeProvider.tsx` (321B) | Re-exports `next-themes` `ThemeProvider` |
| `ThemeToggle` | `ThemeToggle.tsx` (1.7KB) | Sun/Moon toggle button for dark/light mode |
| `ThreeDProgress` | `ThreeDProgress.tsx` (5.6KB) | SVG-based circular progress ring with 3D parallax tilt effect via mouse tracking |

### 3.4 Providers (`/components/providers/`)

#### AuthProvider (`AuthProvider.tsx`, 201B)
- Re-exports `next-auth/react` `SessionProvider`

#### UniversityProvider (`UniversityProvider.tsx`, 2.8KB)
- React Context provider for university preset system
- **Presets defined:**

| ID | Name | Scale Mode |
|---|---|---|
| `jspm` | JSPM RSCOE | 10-point |
| `sppu` | SPPU (General) | 10-point |
| `mu` | Mumbai University | Percentage |
| `vtu` | VTU | 10-point |
| `us` | US / Global Tech | 4-point |
| `custom_10` | Custom (10.0 Scale) | 10-point |
| `custom_percent` | Custom (Percentage) | Percentage |

- JSPM has `specialFeatures`: `isVerified: true`, `hasLetterGrades: true`, `defaultCreditsPerSem: [21, 23, 20, 20, 20, 20, 20, 20]`
- Selected university persisted to `localStorage` key `gradeflow_global_uni`
- Exposes `useUniversity()` hook with: `selectedUniId`, `setSelectedUniId`, `activePreset`, `scaleMode`

### 3.5 UI Showcase / Dev Page (`/dev/ui-showcase`)

**File:** `app/dev/ui-showcase/page.tsx` (319 lines)

**Purpose:** Developer-facing regression testing page for the design system.

**Sections:**
1. **Design Tokens:** Color System (Primary/Secondary/Background/Surface swatches), Typography Scale (Headline/Body/Data examples), Refraction & Shadow (glass specs)
2. **UI Components:** Card Primitives (all 4 variants: default, accent, warning, danger), Form Inputs (Input with validation, Select with validation), Badge Indicators (all 5 variants in both sizes)
3. **Layout Primitives:** 4-column responsive Grid demo, Section Spacer documentation

### 3.6 Design Token System (`globals.css`)

**File:** `app/globals.css` (490 lines)

**CSS Custom Properties (Design Tokens):**

- **Semantic aliases:** `--color-bg`, `--color-surface`, `--color-surface-2`, `--color-border`, `--color-text-primary`, `--color-text-secondary`, `--color-primary`, `--color-primary-hover`, `--color-danger`, `--color-success`, `--color-warning`
- **Fonts:** `--font-headline` and `--font-body` (both Inter / system-ui stack)
- **Spacing scale:** `--space-xs` (0.25rem) through `--space-xxxl` (4.5rem)
- **Type scale:** `--text-xs` (0.75rem) through `--text-6xl` (3.75rem)
- **Border radii:** `--radius-sm` (0.375rem) through `--radius-full` (9999px)
- **Z-index layers:** `--z-deep` (-50), `--z-behind` (-10), `--z-base` (0), `--z-nav` (50), `--z-modal` (100), `--z-cursor` (99999)
- **Easing functions:** `--ease-snappy`, `--ease-floating`, `--ease-bouncy`

**Light Mode Palette:**
- Background: #fdfdfd, Primary: #4f46e5 (Indigo-600), Secondary: #7c3aed (Violet-600)
- Success: #059669, Error: #e11d48, Warning: #d97706

**Dark Mode Palette (`.dark`):**
- Background: #000000, Primary: #3b82f6 (Blue-500), Secondary: #a855f7 (Purple-500)
- Success: #34d399, Error: #fb7185, Warning: #fbbf24

**Utility Classes Defined:**
- `.dot-grid` — radial dot pattern background
- `.glass-card` — glassmorphism card (blur-40px, gradient bg, shadow)
- `.text-gradient` — animated shimmer gradient text
- `.nebula-glass` — navigation glass with grain overlay
- `.hud-pill` — navigation pill styling
- `.aura-glow` — ambient radial glow
- `.premium-input` — standardized input (56px height, 1.5rem border-radius, hover/focus/disabled/error states)
- `.premium-card` — standardized card (blur-32px, gradient bg, 2rem radius, premium shadow)
- `.premium-focus` — focus-visible ring (2px primary ring, black offset)
- `.magnetic-glare` — hover spotlight effect
- `.gpu-accelerated` — will-change + translateZ(0)
- `.custom-scrollbar` — thin 6px scrollbar with themed thumb

**Keyframe Animations:**
- `shimmer`, `float-y`, `holographic-shift`, `aurora`, `float-mesh-1/2/3`, `float-card`, `bounce-soft`

**Accessibility:**
- `@media (prefers-reduced-motion: reduce)` — disables all animations
- Custom cursor hidden on mobile (`max-width: 768px`)
- Custom cursor hidden for non-hover/coarse-pointer devices

**Custom Cursor Styles:**
- `.cursor-dot` — 8px primary-colored dot, mix-blend-mode: difference
- `.cursor-ring` — 44px ring with backdrop-blur, separate dark mode styling

**Grain Texture:**
- `body::before` pseudo-element with SVG noise filter, 3% opacity, overlay blend

### 3.7 Responsiveness Rules

- PageContainer: `px-4 sm:px-6 lg:px-8` with `max-w-7xl`
- Grid system: 1 col on mobile, max 2 on tablet (sm), max 4 on desktop (lg)
- Navbar: full hamburger drawer on mobile
- Calculator table: `min-w-[500px]` with `overflow-x-auto`
- Planner table: `min-w-[700px]` with `overflow-x-auto`
- Custom cursor: hidden below 768px
- Font sizes scale via Tailwind responsive prefixes (md:, lg:)
- Hero headline: `text-5xl md:text-7xl lg:text-8xl`

---

## 4. Data Flow Overview

### 4.1 User Input Flow

```
User enters data in page form
  → React state (useState) updated on every keystroke
  → Validation runs (inline or on submit)
  → Calculate button triggers processing function
  → setTimeout (artificial 800–1000ms delay) simulates processing
  → Results stored in local React state
  → UI re-renders with AnimatePresence transitions
```

### 4.2 Calculation Trigger Pattern

All calculations are **frontend-only** (no server-side computation):

| Module | Trigger | Engine |
|---|---|---|
| Calculator | "Calculate Results" button click | `handleCalculate()` → `calculateSGPA()` from `lib/calculations.ts` |
| Backlog | "Start Impact Analysis" button click | `handleCalculate()` → inline math |
| Predictor | Reactive (every input change) | `useMemo` with all inputs as dependencies |
| Planner | "Generate My Plan" button click | `handleGenerate()` → `calculateRequiredGPA()` from `lib/calculations.ts` |
| Multi-Semester | Reactive (every input change) | `useMemo` with semesters as dependency |

### 4.3 Save/Persist Flow

```
[Save Button Click]
  ├── Authenticated Users:
  │     POST /api/calculations (or /api/plans)
  │       → API validates with Zod schema (lib/validations.ts)
  │       → Prisma creates record in PostgreSQL
  │       → Returns 201 with created record
  │       → Toast success
  │     On API failure:
  │       → Some modules fall back to localStorage
  │       → Toast error/success accordingly
  │
  ├── Unauthenticated Users:
  │     → 401 response
  │     → Toast "Please log in"
  │
  └── Local-Only Modules (Backlog, Predictor):
        → localStorage.setItem() directly
        → No API call
```

### 4.4 Dashboard Data Read Flow

```
[Server Component: /dashboard/page.tsx]
  → getServerSession() checks auth (redirects to /login if none)
  → prisma.calculation.findMany({ where: { userId }, orderBy: desc })
  → prisma.plan.findMany({ where: { userId }, orderBy: desc })
  → JSON serialize for hydration
  → Pass as props to DashboardClient

[Client Component: DashboardClient.tsx]
  → Normalizes calculations (ensures subjects is array)
  → Computes derived data: currentCgpa, bestSgpa, trendData, performanceBreakdown, topSubjects, comparisonData, activities, insights
  → Renders dashboard sub-components with processed data
```

### 4.5 State Management

**No global state management library** is used. State is managed via:

- **React `useState`** — all page-level state (inputs, results, loading, errors)
- **React `useMemo`** — derived calculations (Predictor, Multi-Semester)
- **React Context** — `UniversityProvider` (selected university, scale mode)
- **NextAuth Session** — authentication state via `SessionProvider`
- **next-themes** — theme state (dark/light)
- **localStorage** — university selection persistence, offline data backup, module-specific saves

**localStorage Keys Used:**

| Key | Module | Purpose |
|---|---|---|
| `gradeflow_global_uni` | UniversityProvider | Selected university preset ID |
| `gradeflow_backlog_reports` | Backlog | Saved backlog simulation reports (max 20) |
| `gradeflow_predictor_scenarios` | Predictor | Saved predictor scenarios (max 20) |
| `gradeflow_offline_plans` | Planner | Offline-cached plans (max 20) |
| `gradeflow_multi_sem` | Multi-Semester | Live semester data (auto-saved) |
| `gradeflow_multi_sem_offline` | Multi-Semester | Offline-cached timeline saves (max 20) |

---

## 5. Technical Stack Snapshot

### 5.1 Framework & Runtime

| Technology | Version | Usage |
|---|---|---|
| Next.js | 14.2.35 | App Router (no pages directory) |
| React | ^18 | UI rendering |
| TypeScript | ^5 | Used across all source files |

### 5.2 App Router Structure

```
app/
├── page.tsx              (Landing page — client component)
├── layout.tsx            (Root layout — server component)
├── globals.css           (Global styles + design tokens)
├── calculator/page.tsx   (Client component)
├── backlog/page.tsx      (Client component)
├── predictor/page.tsx    (Client component)
├── planner/page.tsx      (Client component)
├── multi-semester/page.tsx (Client component)
├── timeline/page.tsx     (Client component)
├── dashboard/
│   ├── page.tsx          (Server component — auth-gated)
│   ├── DashboardClient.tsx (Client component)
│   └── error.tsx         (Error boundary)
├── login/page.tsx        (Client component)
├── register/page.tsx     (Client component)
├── dev/ui-showcase/page.tsx (Client component)
└── api/
    ├── auth/[...nextauth]/route.ts
    ├── calculations/
    │   ├── route.ts      (GET, POST)
    │   ├── [id]/route.ts (DELETE)
    │   └── clear/route.ts (DELETE)
    ├── plans/
    │   ├── route.ts      (GET, POST)
    │   └── [id]/route.ts
    ├── export/route.ts   (GET — CSV download)
    └── register/route.ts (POST)
```

### 5.3 TypeScript Usage

- All source files are `.tsx` or `.ts`
- Interfaces defined locally per page/component (not centralized except `types/calculation.ts`)
- `types/calculation.ts`: `Subject { name, credits, score }`, `Calculation { id, date, semester, subjects, sgpa, cgpa, total_credits, created_at? }`
- `types/next-auth.d.ts`: extends Session user with `id` field
- No strict mode configuration visible in `tsconfig.json`

### 5.4 Component Architecture

- **Pattern:** Monolithic page components with inline logic (no custom hooks extracted)
- **State:** `useState` + `useMemo` per page; no state lifting between modules
- **Composition:** `forwardRef` pattern on UI primitives (Card, Input, Select)
- **Styling:** Tailwind utility classes + CSS custom properties; `cn()` helper (clsx + tailwind-merge) used in all UI components
- **Animation:** Framer Motion throughout (motion.div, AnimatePresence, useMotionValue, useSpring, useTransform)

### 5.5 API Routes

| Route | Method | Auth Required | Validation | Purpose |
|---|---|---|---|---|
| `/api/auth/[...nextauth]` | * | N/A | NextAuth | Authentication endpoints |
| `/api/register` | POST | No | `registerSchema` (Zod) | User registration (bcrypt hash) |
| `/api/calculations` | GET | Yes | — | Fetch user calculations |
| `/api/calculations` | POST | Yes | `calculationSchema` (Zod) | Save calculation |
| `/api/calculations/[id]` | DELETE | Yes | — | Delete single calculation |
| `/api/calculations/clear` | DELETE | Yes | — | Delete all user calculations |
| `/api/plans` | GET | Yes | — | Fetch user plans |
| `/api/plans` | POST | Yes | `planSchema` (Zod) | Save plan |
| `/api/plans/[id]` | DELETE/GET | Yes | — | Individual plan operations |
| `/api/export` | GET | Yes | — | Export calculations as CSV |

### 5.6 Database (Prisma + PostgreSQL)

**ORM:** Prisma v7.6.0 with `@prisma/adapter-pg` (PostgreSQL driver adapter with `pg` Pool)

**Models:**

| Model | Key Fields | Relationships |
|---|---|---|
| `User` | id (cuid), name, email, password, university (default "jspm"), createdAt | → Account[], Session[], Calculation[], Plan[] |
| `Account` | OAuth account data (provider, tokens) | → User |
| `Session` | session token, expiry | → User |
| `VerificationToken` | identifier, token, expires | — |
| `Calculation` | id (autoincrement), semester, subjects (JSON), sgpa, cgpa, total_credits, date, created_at | → User (optional) |
| `Plan` | id (autoincrement), current_cgpa, target_cgpa, completed_semesters, remaining_semesters, required_gpa, plan_data (JSON), current_semester (optional), created_at | → User (optional) |

### 5.7 Authentication

- **NextAuth v4** with JWT strategy
- **Providers:** Google OAuth, Credentials (email/password)
- **Adapter:** PrismaAdapter
- **Password hashing:** bcryptjs (10 rounds)
- **Custom pages:** `/login` for sign-in
- **Session callback:** injects `user.id` from JWT token

### 5.8 Key Dependencies

| Package | Version | Purpose |
|---|---|---|
| `recharts` | ^3.8.1 | All charting (Line, Bar, Area, Pie, RadialBar) |
| `framer-motion` | ^12.38.0 | Page transitions, stagger animations, spring physics, layout animations |
| `lucide-react` | ^1.7.0 | Icon library (used alongside Material Symbols) |
| `next-themes` | ^0.4.6 | Dark/light mode with class strategy |
| `react-hot-toast` | ^2.6.0 | Toast notifications |
| `clsx` + `tailwind-merge` | ^2.1.1 / ^3.5.0 | Class name merging |
| `zod` | ^4.4.3 | Schema validation (API routes) |
| `tailwindcss` | ^3.4.1 | Styling framework |
| `tailwindcss-animate` | ^1.0.7 | Animation utilities plugin |
| `lottie-react` | ^2.4.1 | Listed in dependencies, not observed in use |

### 5.9 Icon Systems

Two icon systems are used simultaneously:
1. **Google Material Symbols Outlined** — loaded via Google Fonts CDN link in `layout.tsx` `<head>`; used as `<span className="material-symbols-outlined">icon_name</span>`
2. **Lucide React** — imported as components (e.g., `<Zap />`, `<Save />`); used primarily in Backlog, Predictor, Timeline, Dashboard

### 5.10 Animation Constants (`lib/animation-constants.ts`)

Pre-defined spring physics:
- `SNAPPY_SPRING`: stiffness 600, damping 38, mass 0.5
- `FLOATING_SPRING`: stiffness 300, damping 30, mass 0.6
- `SOFT_SPRING`: stiffness 150, damping 25, mass 0.6
- `BOUNCY_SPRING`: stiffness 231, damping 18, mass 1, bounce 0.5
- `MAGNETIC_HOVER`: scale 1.05, y −8, snappy spring
- `STAGGER_TRANSITION(delay)`: staggerChildren + delayChildren

---

## 6. Constraints / Limitations (As-Is Only)

### 6.1 Grade Scale Inconsistency
- The Calculator uses one grade scale: B = 50–59 (6 pts), C = 45–49 (5 pts), D = 40–44 (4 pts), F = <40 (0 pts)
- The Predictor uses a different scale: B = ≥55 (6 pts), C = ≥50 (5 pts), P = ≥40 (4 pts), F = <40 (0 pts)
- These two scales are defined separately (one in `lib/calculations.ts`, one inline in `predictor/page.tsx`) and do not reference each other.

### 6.2 CGPA ≡ SGPA in Calculator
- When saving from the Calculator, `cgpa` is set equal to `sgpa` (`cgpa: result.sgpa`). The system does not track cumulative CGPA across sessions within this module.

### 6.3 Hardcoded Timeline Data
- The Timeline page (`/timeline`) uses entirely hardcoded semester data (SGPAs, subjects, achievements). It does not read from the database or any user input.

### 6.4 Hardcoded Dashboard Insights
- The insights panel in the Dashboard contains 3 static insight objects with hardcoded text. The text references specific subjects ("Mathematics") and specific projections ("9.0 by Semester 6") regardless of actual user data.

### 6.5 Fallback Values in Dashboard
- When no calculations exist, the dashboard falls back to hardcoded demo values (currentCgpa: 8.75, prevCgpa: 8.55, bestSgpa: 9.40, totalCalcs: 12, targetCgpa: 9.0, performance tier counts: 2/5/3/1). These may mislead users who have no saved data.

### 6.6 Duplicate `cn()` Utility
- The `cn(clsx(...), tailwind-merge)` helper function is defined identically at the top of every UI component file (`Card.tsx`, `Input.tsx`, `Select.tsx`, `Badge.tsx`, `Grid.tsx`, `PageContainer.tsx`, `Section.tsx`). It is not centralized.

### 6.7 No Shared Calculation Abstraction
- Each module re-implements its own calculation logic inline. The Backlog, Predictor, and Multi-Semester modules do not use the shared `lib/calculations.ts` functions.

### 6.8 Predictor Uses Local InputField Component
- The Predictor defines its own `InputField`, `StatCard`, and `LegendItem` components inline (not using the shared `ui/Input` or any shared stat card). These are not reusable by other modules.

### 6.9 Empty Analytics Directory
- `components/dashboard/analytics/` exists as an empty directory with no files.

### 6.10 `lottie-react` Dependency Unused
- `lottie-react` is listed in `package.json` dependencies but is not imported or used anywhere in the codebase.

### 6.11 Multi-Semester Uses Inline Styles
- The Multi-Semester page uses inline `<style dangerouslySetInnerHTML>` for custom scrollbar and gradient animation keyframes, duplicating styles already defined in `globals.css`.

### 6.12 `GlassCard` vs `Card` Overlap
- Both `components/GlassCard.tsx` and `components/ui/Card.tsx` exist. The landing page uses the `.glass-card` CSS utility class directly, while other pages use the `Card` component. `GlassCard` is a separate standalone component.

### 6.13 Mixed Icon Systems
- Google Material Symbols (loaded via CDN font link) and Lucide React (npm package) are used simultaneously across the application. Some pages mix both (e.g., Planner uses Material Symbols for some icons and the CSS-only approach).

### 6.14 Semester Label in Calculator Save
- The calculator hardcodes `semester: "Semester"` as a string literal when saving, rather than allowing the user to specify which semester the calculation represents.

### 6.15 Artificial Delays
- Calculator: 800ms `setTimeout` before showing results
- Backlog: 1000ms `setTimeout` before showing results
- Planner: 1000ms `setTimeout` before showing results
- Backlog save: 500ms `setTimeout`
- These are intentional UX delays, not performance issues.
