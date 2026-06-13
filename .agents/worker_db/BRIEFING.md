# BRIEFING — 2026-06-11T09:49:09+05:30

## Mission
Update the database schema for the Advanced Placement Intelligence Engine to include a CareerProfile model.

## 🔒 My Identity
- Archetype: worker subagent
- Roles: implementer, qa, specialist
- Working directory: c:/Users/Tanmay/OneDrive/Desktop/GradeFlow/gradeflow/.agents/worker_db
- Original parent: 04493bef-22de-4dc6-8d9f-73ce330e7d17
- Milestone: [TBD]

## 🔒 Key Constraints
- Must update schema.prisma
- CareerProfile must store specific fields and link 1-to-1 with User
- Must use npx prisma db push and generate
- DO NOT CHEAT

## Current Parent
- Conversation ID: 04493bef-22de-4dc6-8d9f-73ce330e7d17
- Updated: 2026-06-11T09:49:09+05:30

## Task Summary
- **What to build**: Add CareerProfile to schema.prisma
- **Success criteria**: DB push and generate pass without error, handoff.md is written.
- **Interface contracts**: [TBD]
- **Code layout**: [TBD]

## Key Decisions Made
- Updated User to have `careerProfile CareerProfile?` relation.
- Used `replace_file_content` to make exact changes to schema.prisma.

## Artifact Index
- handoff.md — task summary and verification.
