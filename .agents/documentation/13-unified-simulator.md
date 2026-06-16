# Component Documentation: UnifiedSimulator

## 1. Component Name and Path
- **Component Name**: `UnifiedSimulator`
- **File Path**: `components/backlog/UnifiedSimulator.tsx`

## 2. Simulated Data/Actions
This component simulates the database persistence action for the student's backlog recovery plan. It implements a mock network transmission latency delay of 1500ms and displays save status confirmation.

### Simulated Data/Actions Code Snippets
The mock timeline save handler (Lines 43–50):
```tsx
const executeSave = () => {
  setIsSaving(true);
  setTimeout(() => {
    onSave(plan);
    setIsSaving(false);
    setIsSaved(true);
  }, 1500);
};
```

## 3. Database/API Migration Plan

### Step 1: Target Database Model
We can persist the recovery plan data inside the `Plan` model (`plan_data` JSON field) or directly inside the `BacklogRecord.recoveryPathway` field:
- `BacklogRecord.recoveryPathway` is a nullable string which can store a serialized JSON structure containing the planned exam date, study schedule segments, and resource checklist.

### Step 2: Persistence Server Action / API
Create an API route `POST /api/backlog/timeline` that receives the user's configured timeline parameters:
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId, courseId, planData } = await req.json();

  const updatedRecord = await prisma.backlogRecord.update({
    where: {
      userId_courseId: { userId, courseId }
    },
    data: {
      recoveryPathway: JSON.stringify(planData),
      attemptsCount: { increment: 1 } // Increment attempts count on scheduling
    }
  });

  return NextResponse.json({ success: true, updatedRecord });
}
```

### Step 3: Frontend Client Update
Replace the local `setTimeout` timer in `UnifiedSimulator.tsx` with an asynchronous POST fetch request sending the timeline object to `/api/backlog/timeline`. Trigger loading state during the active promise execution, updating saved/error states based on the server response.
