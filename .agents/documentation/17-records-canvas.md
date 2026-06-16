# Component Documentation: RecordsCanvas

## 1. Component Name and Path
- **Component Name**: `RecordsCanvas`
- **File Path**: `components/os/records/RecordsCanvas.tsx`

## 2. Simulated Data/Actions
This component manages transcript imports, showing a faked file repository history log featuring mock import file names, dates, course counts, and validation checks.

### Simulated Data/Actions Code Snippets
Mock import history entries (Lines 161–186):
```tsx
{/* Mock History Item */}
<div className="p-4 flex items-center justify-between group hover:bg-slate-800/30 transition-colors">
  ...
  <div className="text-slate-200 font-medium">Semester 2 Result.pdf</div>
  <div className="text-xs text-slate-500">Imported on May 12, 2026 • 6 Courses</div>
  ...
</div>
{/* Mock History Item 2 */}
<div className="p-4 flex items-center justify-between group hover:bg-slate-800/30 transition-colors">
  ...
  <div className="text-slate-200 font-medium">Semester 1 Result.pdf</div>
  <div className="text-xs text-slate-500">Imported on Dec 10, 2025 • 5 Courses</div>
  ...
</div>
```

## 3. Database/API Migration Plan

### Step 1: Query Database Records
Fetch real import data by joining `Document` and `AcademicSnapshot` models.
- Since `AcademicSnapshot` holds the verified JSON transcript data and `Document` stores file meta details, retrieve both models via the user's ID using Prisma:
```typescript
const uploadHistory = await prisma.academicSnapshot.findMany({
  where: { userId },
  include: {
    user: {
      select: {
        documents: {
          where: { tags: { has: "transcript" } },
          orderBy: { createdAt: "desc" }
        }
      }
    }
  },
  orderBy: { createdAt: "desc" }
});
```

### Step 2: Format Data Endpoint
Expose `/api/academic/history` to process the query:
1. Parse the JSON `academicProfile` in each `AcademicSnapshot` entry to extract the semester courses array length.
2. Return a clean array containing:
   - `id`: Unique snapshot ID.
   - `fileName`: The original PDF name from the matching file record.
   - `importDate`: The `createdAt` date of the snapshot.
   - `courseCount`: Count of courses parsed inside the snapshot JSON.
   - `status`: Verification status (`verified`, `unverified`, `failed`).

### Step 3: Frontend Integration
Modify `RecordsCanvas.tsx` to call `/api/academic/history` on mount using a React hook, mapping the returned array to the history log table component.
