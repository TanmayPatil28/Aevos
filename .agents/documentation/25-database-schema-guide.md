# Database Schema Reference Guide

This document outlines the database model schema for GradeFlow, built using PostgreSQL and Prisma ORM.

---

## 1. Newly Migrated Models
The database schema includes four new models designed to support academic scheduling, backlog recovery tracking, and university grace marks rules:

### A. AcademicCalendarEvent
Tracks institutional dates, exam windows, and holidays.
- **Table Name**: `academic_calendar_events`
- **Fields**:
  - `id` (String, Primary Key, CUID)
  - `university` (String, Default: `"jspm"`)
  - `title` (String)
  - `description` (String, Nullable)
  - `eventType` (String, mapped to `event_type`)
  - `startDate` (DateTime, mapped to `start_date`)
  - `endDate` (DateTime, mapped to `end_date`)
  - `academicYear` (String, mapped to `academic_year`)
  - `semester` (String, Nullable)
  - `createdAt` (DateTime, Default: `now`)
  - `updatedAt` (DateTime, Default: `now`, UpdatedAt)
- **Indexing Strategies**:
  - `@@index([university])`: Optimizes event retrieval based on the student's university.
  - `@@index([startDate, endDate])`: Accelerates queries filtering events within specific range boundaries.

### B. TimetableSlot
Schedules weekly lectures, labs, and tutorials for courses.
- **Table Name**: `timetable_slots`
- **Fields**:
  - `id` (String, Primary Key, CUID)
  - `courseId` (String, mapped to `course_id`)
  - `dayOfWeek` (Int, mapped to `day_of_week`)
  - `startTime` (String, mapped to `start_time`)
  - `endTime` (String, mapped to `end_time`)
  - `room` (String)
  - `instructor` (String, Nullable)
  - `section` (String, Nullable)
  - `semester` (String)
  - `academicYear` (String, mapped to `academic_year`)
  - `createdAt` (DateTime, Default: `now`)
  - `updatedAt` (DateTime, Default: `now`, UpdatedAt)
- **Relations**:
  - `course`: References the `Course` model via foreign key `courseId` (`onDelete: Cascade`).
- **Indexing Strategies**:
  - `@@index([courseId])`: Accelerates lookups for all schedule blocks belonging to a given course.
  - `@@index([dayOfWeek])`: Speeds up weekly scheduling renders by indexing days.

### C. BacklogRecord
Tracks active and cleared backlogs for students, managing retry status.
- **Table Name**: `backlog_records`
- **Fields**:
  - `id` (String, Primary Key, CUID)
  - `userId` (String, mapped to `user_id`)
  - `courseId` (String, mapped to `course_id`)
  - `originalSemester` (String, mapped to `original_semester`)
  - `originalGrade` (String, mapped to `original_grade`)
  - `status` (Enum `BacklogStatus`, Default: `PENDING`)
  - `attemptsCount` (Int, Default: `0`, mapped to `attempts_count`)
  - `nextExamDate` (DateTime, Nullable, mapped to `next_exam_date`)
  - `recoveryPathway` (String, Nullable, mapped to `recovery_pathway`)
  - `createdAt` (DateTime, Default: `now`)
  - `updatedAt` (DateTime, Default: `now`, UpdatedAt)
- **Relations**:
  - `user`: References `User` model via foreign key `userId` (`onDelete: Cascade`).
  - `course`: References `Course` model via foreign key `courseId` (`onDelete: Cascade`).
- **Indexing Strategies**:
  - `@@unique([userId, courseId])`: Ensures a student can only have one backlog record per course.
  - `@@index([userId])`: Optimizes backlog queries filtered by user ID.
  - `@@index([courseId])`: Optimizes lookups of backlog rates across specific courses.

### D. ATKTRule
Defines Allowed To Keep Terms (ATKT) regulations and grace mark limitations for universities.
- **Table Name**: `atkt_rules`
- **Fields**:
  - `id` (String, Primary Key, CUID)
  - `university` (String, Unique)
  - `maxBacklogsAllowed` (Int, mapped to `max_backlogs_allowed`)
  - `recoveryWindowMonths` (Int, mapped to `recovery_window_months`)
  - `allowSummerTerm` (Boolean, Default: `true`, mapped to `allow_summer_term`)
  - `minGpaToRecover` (Float, mapped to `min_gpa_to_recover`)
  - `description` (String, Nullable)
  - `createdAt` (DateTime, Default: `now`)
  - `updatedAt` (DateTime, Default: `now`, UpdatedAt)
- **Indexing Strategies**:
  - `@unique` constraint on the `university` field guarantees only one policy rulebook can be active per university.

---

## 2. Core Model Schemas Summary

| Model Name | Primary Key | Key Relationships | Index / Constraints |
|---|---|---|---|
| **User** | `id` (CUID) | `academicSnapshots`, `documents`, `calculations` | `@@index([activeSnapshotId])` |
| **Course** | `id` (CUID) | `enrollments`, `timetableSlots`, `backlogRecords` | `@unique` on `code` |
| **Enrollment** | `id` (CUID) | References `User` & `Course` | `@@unique([userId, courseId])` |
| **AcademicSnapshot**| `id` (CUID) | References `User` | `@@index([userId, createdAt(sort: Desc)])` |
| **CareerProfile** | `id` (CUID) | References `User` | `@unique` on `userId` |
| **SkillProgress** | `id` (CUID) | References `User` & `MilestoneProgress` | `@@unique([userId, roadmapId, nodeId])` |
| **MilestoneProgress**| `id` (CUID)| References `SkillProgress` | `@@unique([skillProgressId, milestoneId])` |
