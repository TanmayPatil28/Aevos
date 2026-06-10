## 2026-06-09T06:52:42Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview

Perform a complete production readiness audit of the entire GradeFlow codebase. The audit must discover and fix flaws, bugs, bad UX, performance issues, and security risks across all routes and components. 

Working directory: `c:/Users/Tanmay/OneDrive/Desktop/GradeFlow/gradeflow`
Integrity mode: development

## Requirements

### R1. Comprehensive Discovery and Mapping
Create a complete map of the system including all routes, components, and data flows. Audit the architecture for technical debt and dead code.

### R2. Feature-by-Feature Audit and Fix
Perform click-by-click validation and code review for all features (GPA Calculator, Semester Planner, Grade Predictor, etc.). Fix all critical bugs, data corruption risks, security vulnerabilities, and UX issues found.

### R3. API & Database Audit
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
