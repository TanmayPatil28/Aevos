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
