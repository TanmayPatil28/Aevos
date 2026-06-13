# Plan for Advanced Placement Intelligence Engine

## Milestones

1. **Database Schema Update**
   - Add `CareerProfile` model to `prisma/schema.prisma` linked 1-to-1 with `User`.
   - Store `resumeText`, `skills`, `projects`, `atsScore`, and `actionPlan`.
   - Run `npx prisma db push` and `npx prisma generate` to verify.

2. **Mock API Implementation**
   - Update `/api/parse/resume/route.ts` to mock the multi-agent pipeline response.
   - Parse input JD and resume file.
   - Return mock JSON containing skills, atsScore, actionPlan, and extrapolated projects (with `isAIGenerated: true`).
   - Upsert mock data into `CareerProfile`.

3. **UI Integration**
   - Modify `ResumeUploadTarget.tsx` to include JD input and multi-step loading states.
   - Modify `JarvisResumeModal.tsx` to display ATS template and highlight extrapolated bullet points.
   - Build frontend components to verify.

## Strategy
I will dispatch 3 worker subagents in sequence or parallel depending on dependencies.
First, I'll dispatch a worker for Milestone 1.
Then, I'll dispatch workers for Milestone 2 and Milestone 3 (they can run in parallel since the schema is already pushed).
