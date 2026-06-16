# Component Documentation: ScenarioSimulator

## 1. Component Name and Path
- **Component Name**: `ScenarioSimulator`
- **File Path**: `components/planner/ScenarioSimulator.tsx`

## 2. Simulated Data/Actions
This component presents hypothetical academic risk scenarios (e.g., "What if I fail one subject?", "What if attendance drops?") and displays hardcoded, non-calculated static descriptions of their potential impacts.

### Simulated Data/Actions Code Snippets
Static scenarios array configuration (Lines 16–45):
```tsx
const SCENARIOS: Scenario[] = [
  {
    id: "fail_one",
    title: "What if I fail one subject?",
    description: "Simulates the impact of an active backlog on your recovery and GPA trend.",
    impactType: "negative",
    icon: <AlertTriangle size={18} />
  },
  {
    id: "attendance_drop",
    title: "What if attendance drops?",
    description: "Assume missing 2 weeks of classes, reducing internal marking buffer.",
    impactType: "negative",
    icon: <TrendingUp size={18} />
  },
  ...
];
```

## 3. Database/API Migration Plan

### Step 1: Real-Time Calculator Setup
Create a dynamic simulator page that binds directly to the student's actual active courses (`Enrollment` joined with `Course`):
- Load the user's active courses list.
- Allow the user to select specific courses to simulate risks on.

### Step 2: Simulation Logic Implementation
1. **Backlog Impact**:
   - Let the user select a course to "Fail".
   - Clone the user's current semester calculations, change the target course's grade points to `0` (representing a grade of 'F').
   - Recalculate the SGPA: `Sum(credits * gradePoints) / Sum(credits)`.
   - Update the CGPA and show the exact delta difference:
     ```typescript
     const mockEnrollments = enrollments.map(e => e.id === selectedId ? { ...e, gradePoints: 0 } : e);
     const simulatedSgpa = calculateSgpa(mockEnrollments);
     ```
2. **Attendance Drop**:
   - Provide a slider for "Missed Hours".
   - Recalculate the attendance percentage: `(attended - missed) / total * 100`.
   - Match this percentage against the college grading policy. If the percentage is below 75%, apply a penalty of 5 marks (or set internals to 0 if debarred) and recalculate the CIE marks and final grade.

### Step 3: Frontend Integration
Modify `ScenarioSimulator.tsx` to include interactive controls (dropdown select menus, slider controls) and bind them to the local gpa calculation utilities to display real-time recalculated values.
