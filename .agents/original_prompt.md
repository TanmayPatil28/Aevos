# Original User Request

## 2026-06-11T04:17:33Z

Build an Advanced Placement Intelligence Engine for the GradeFlow OS. It features a target-aware multi-agent resume parsing pipeline that generates a JD-targeted ATS resume. It uses AI to extrapolate projects based on academic history, provides UI transparency highlights for extrapolated data, and features an interactive action checklist for students to boost their readiness score.

Working directory: c:/Users/Tanmay/OneDrive/Desktop/GradeFlow/gradeflow
Integrity mode: development

## Requirements

### R1. Database Schema
Update `prisma/schema.prisma` to include a `CareerProfile` model linked 1-to-1 with the `User`. It must store `resumeText`, `skills`, `projects`, `atsScore`, and `actionPlan`.

### R2. Mocked API Route
Update `/api/parse/resume/route.ts` to simulate the multi-agent pipeline. It should accept a file and a Target JD, and return a mocked, highly detailed JSON response containing skills, an ATS score, an action plan checklist, and extrapolated projects tagged with `isAIGenerated: true`. It must upsert this mock data into the database.

### R3. UI Integration
Upgrade `ResumeUploadTarget.tsx` to include an input for a Job Description URL/text and show mock multi-step loading states. Upgrade `JarvisResumeModal.tsx` to render the ATS template and visually highlight the mocked extrapolated bullet points.

## Acceptance Criteria

### Backend Verification
- [ ] Running `npx prisma db push` and `npx prisma generate` succeeds without errors.
- [ ] A programmatic test or manual curl to `/api/parse/resume` successfully returns the mock JSON and creates a `CareerProfile` record in the database.

### Frontend Verification
- [ ] The Next.js dev server (`npm run dev`) builds the `Placement Radar` page and `JarvisResumeModal` components without TypeScript errors or build failures.
