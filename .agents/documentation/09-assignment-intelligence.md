# Component Documentation: AssignmentIntelligence

## 1. Component Name and Path
- **Component Name**: `AssignmentIntelligence`
- **File Path**: `components/attendance/AssignmentIntelligence.tsx`

## 2. Simulated Data/Actions
This component showcases upcoming school tasks and calculates a faked priority risk index by showing mock assignments, due dates, priority markers, and estimated impact values on SGPA or internal marks.

### Simulated Data/Actions Code Snippets
The mock assignments list (Lines 8–33):
```tsx
const mockAssignments = [
  {
    id: "a1",
    title: "DBMS Mini Project Phase 1",
    subject: "DBMS Lab",
    dueDate: "Tomorrow",
    impact: "-0.18 SGPA",
    priority: "CRITICAL",
  },
  {
    id: "a2",
    title: "CN Lab Manual Submission",
    subject: "CN Lab",
    dueDate: "In 3 Days",
    impact: "-4 Internal Marks",
    priority: "HIGH",
  },
  {
    id: "a3",
    title: "OS Assignment 2",
    subject: "OS Theory",
    dueDate: "Next Week",
    impact: "-2 Internal Marks",
    priority: "MEDIUM",
  }
];
```

## 3. Database/API Migration Plan

### Step 1: Database Model Extension
Add an `Assignment` model in `schema.prisma` associated with `Enrollment` or `Course` to hold assignments metadata:
```prisma
model Assignment {
  id           String     @id @default(cuid())
  courseId     String     @map("course_id")
  title        String
  description  String?
  dueDate      DateTime   @map("due_date")
  weightage    Float      @default(0) // Percentage of total course marks
  priority     String     @default("MEDIUM") // CRITICAL, HIGH, MEDIUM, LOW
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @updatedAt @map("updated_at")

  course       Course     @relation(fields: [courseId], references: [id], onDelete: Cascade)
}
```

### Step 2: GPA Impact Forecasting Engine
Write a calculator utility in the backend `/api/academic/assignments` that:
1. Queries assignments belonging to the user's active enrollments.
2. Extracts their weightage. If an assignment is missed (marks = 0):
   - Calculate the lost CIE (Continuous Internal Evaluation) marks.
   - Project the resulting downgrade in the final grade letter (e.g. from 'A' to 'B').
   - Calculate the new SGPA by modifying the grade points of the corresponding course and running the standard SGPA formula: `Sum(GradePoints * Credits) / Sum(Credits)`.
   - Output the exact delta value (e.g., `-0.18 SGPA` or `-4 Internal Marks`).

### Step 3: API Integration
Modify the frontend component to load assignments list and calculated impact values from `/api/academic/assignments` via server actions or a `fetch` query.
