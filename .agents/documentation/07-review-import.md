# Component Documentation: ReviewImport

## 1. Component Name and Path
- **Component Name**: `ReviewImport`
- **File Path**: `components/os/records/ReviewImport.tsx`

## 2. Simulated Data/Actions
This component presents a pre-populated list of simulated courses ("Data Structures", "Algorithms", etc.) supposedly extracted from the uploaded transcript, and adds them directly to the local Zustand store on save.

### Simulated Data/Actions Code Snippets
Mock course list added to Zustand store (Lines 27–32):
```tsx
setTermCourses(newTermId, [
  { id: `c_${Date.now()}_1`, termId: newTermId, code: "CS201", name: "Data Structures", credits: 4, grade: "A", gradePoints: 8 },
  { id: `c_${Date.now()}_2`, termId: newTermId, code: "CS202", name: "Algorithms", credits: 4, grade: "B+", gradePoints: 7 },
  { id: `c_${Date.now()}_3`, termId: newTermId, code: "MA201", name: "Linear Algebra", credits: 3, grade: "O", gradePoints: 10 },
  { id: `c_${Date.now()}_4`, termId: newTermId, code: "CS203", name: "Computer Networks", credits: 3, grade: "B", gradePoints: 6 },
]);
```

Matching hardcoded JSX table rows (Lines 66–90).

## 3. Database/API Migration Plan

### Step 1: Render Parsed Snapshot
Instead of hardcoding, the frontend should load the latest unverified snapshot:
1. Fetch the latest `AcademicSnapshot` where `verificationStatus = "unverified"`.
2. Extract the `academicProfile` JSON which contains the semesters and courses:
   ```typescript
   const latestSnapshot = await prisma.academicSnapshot.findFirst({
     where: { userId, verificationStatus: "unverified" },
     orderBy: { createdAt: "desc" }
   });
   ```
3. Load these parsed courses into the component's editing state.

### Step 2: Confirm and Persist Endpoint
Create a POST endpoint `/api/academic/confirm-import` which receives the user's modifications to the parsed courses list:
1. Create `Course` records in the database if they do not exist (matching codes).
2. Create or update `Enrollment` records for the user:
   ```typescript
   const transactions = courses.map(course => 
     prisma.enrollment.upsert({
       where: { userId_courseId: { userId, courseId: course.dbId } },
       update: { grade: course.grade, semester: course.semesterCode },
       create: { userId, courseId: course.dbId, grade: course.grade, semester: course.semesterCode }
     })
   );
   await prisma.$transaction(transactions);
   ```
3. Update `AcademicSnapshot` status to `"verified"` and link it to the user's `activeSnapshotId`:
   ```typescript
   await prisma.academicSnapshot.update({
     where: { id: snapshotId },
     data: { verificationStatus: "verified" }
   });
   await prisma.user.update({
     where: { id: userId },
     data: { activeSnapshotId: snapshotId }
   });
   ```

### Step 3: UI and Zustand Sync
Update `ReviewImport.tsx` to read the database-generated entities. Upon successful API verification, trigger a reload of global Zustand state from the backend.
