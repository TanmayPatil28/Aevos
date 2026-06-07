# Original User Request

## Initial Request — 2026-06-06T15:41:12+05:30

# Teamwork Project Prompt

Redesign the GradeFlow Dashboard page (`app/(workspace)/dashboard/page.tsx` and related components) to act as the central hub for the entire application. The dashboard must match the premium "Apple-tier" aesthetics, layouts, glassmorphic cards, and fluid animations of the `planner`, `placement`, and `calculator` pages.

Working directory: `c:\Users\Tanmay\OneDrive\Desktop\GradeFlow\gradeflow`
Integrity mode: development

## Requirements

### R1. Central Hub Architecture
The dashboard must act as a central hub displaying high-level summaries and quick-access points for all major GradeFlow features (Planner, Attendance, Career, Backlog).

### R2. Perfect UI Consistency
The team must aggressively re-use existing UI components (e.g., `Card`, `AnimatedCounter`, `FadeText`, `StaggerContainer`, Framer Motion variants) found in the `planner` and `calculator` pages. Do not introduce new design languages or third-party component libraries; rely strictly on the established Tailwind and Framer Motion glassmorphic design system.

### R3. Visual Auditing
The team must launch the local Next.js development server and use the `browser` subagent to visually inspect the redesigned dashboard. The page must render without React hydration errors or layout breaks.

## Acceptance Criteria

### Visual & Functional Quality
- [ ] The dashboard successfully renders a "Bento box" style layout using the existing `Card` components.
- [ ] Information from different modules (e.g., current CGPA, attendance status) is represented in visually distinct sections of the hub.
- [ ] Running `npx tsc --noEmit` on the dashboard components produces no new TypeScript errors.
- [ ] A visual screenshot taken by the `browser` agent confirms that the dashboard matches the dark-mode glassmorphic aesthetic of the `planner` page.

## Follow-up — 2026-06-07T10:05:56+05:30

# Teamwork Project Prompt — Final

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview

Conduct a ruthless, exhaustive 15-section "Destruction Audit" of the GradeFlow Navbar and Information Architecture to identify 100+ critical flaws, UX issues, frontend/backend technical debt, and scalability bottlenecks as it transitions to a Student Intelligence OS.

Working directory: c:\Users\Tanmay\OneDrive\Desktop\GradeFlow\gradeflow
Integrity mode: development

## Requirements

### R1. Comprehensive UX/IA & Technical Audit
Analyze the navbar's structure (`Navbar.tsx`, `NavbarActionSuite.tsx`, `NavbarMobileDrawer.tsx`, etc.), user journeys, feature overlap, mobile usability, accessibility, and alignment with student psychology based on the 15 provided sections. Inspect the frontend architecture, backend implications, and database model. Act as an elite audit team trying to reject a $10M VC investment.

### R2. Output Formatting
Produce a professional audit report (`navbar_destruction_audit.md`). The report must contain exactly 100 or more findings. Every single finding MUST follow this exact schema:
- Issue ID
- Severity (Critical/High/Medium/Low)
- Category (UX/IA/Frontend/Backend/Product/Accessibility/Performance/Growth/Security)
- Problem
- Why It Is A Problem
- User Impact
- Technical Impact
- Future Scale Impact
- Evidence
- Confidence Level (%)

### R3. Verification Script
Write a programmatic verification script (e.g., `verify_audit.js` or `verify_audit.py`) that parses the generated markdown report. The script must confirm:
1. All 15 sections requested are present.
2. The total number of findings is >= 100.
3. Every finding strictly adheres to the required schema fields.

## Acceptance Criteria

### Audit Report Quality
- [ ] The markdown report exists at `navbar_destruction_audit.md`.
- [ ] The verification script runs successfully and passes, outputting that 100+ items and all 15 sections are present.
- [ ] The findings are extremely critical and not mere suggestions; they must frame the current navbar architecture as critically flawed for a future "Student Intelligence Operating System".
- [ ] The audit explicitly calls out failures in `Navbar.tsx` and related components in the GradeFlow codebase.
