# Component Documentation: RoadmapNodeContent

## 1. Component Name and Path
- **Component Name**: `RoadmapNodeContent`
- **File Path**: `components/os/inspector/RoadmapNodeContent.tsx`

## 2. Simulated Data/Actions
This component simulates updating dynamic roadmap milestone checklist items. It bypasses database connections by maintaining local React state variables and comments out real API persistence handlers.

### Simulated Data/Actions Code Snippets
Local state mock implementation (Line 9):
```tsx
const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({});
```

Simulated toggle milestone handler and placeholder comments (Lines 15–24):
```tsx
// In a real implementation, we would fetch the user's progress for this node via API
// For MVP v1 without a working DB connection, we'll use local state to simulate.

const toggleMilestone = async (milestoneId: string) => {
  const isCompleted = !completedMilestones[milestoneId];
  setCompletedMilestones(prev => ({ ...prev, [milestoneId]: isCompleted }));

  // Mock API call since DB is down
  // await fetch('/api/career/progress', ...
```

## 3. Database/API Migration Plan

### Step 1: Database Schema Integration
Milestone checkpoints must map to database tables:
- `SkillProgress` maps the state of a roadmap node (`in_progress`, `completed`).
- `MilestoneProgress` tracks the check state of individual node milestones (`completed: true / false`).

### Step 2: Milestone Toggle API
Create a backend POST endpoint `/api/career/progress` that:
1. Receives the `userId`, `roadmapId`, `nodeId`, `milestoneId`, and the new completion boolean `completed`.
2. Uses Prisma to update the corresponding `MilestoneProgress` row:
   ```typescript
   const skillProg = await prisma.skillProgress.findUnique({
     where: { userId_roadmapId_nodeId: { userId, roadmapId, nodeId } }
   });

   await prisma.milestoneProgress.upsert({
     where: { skillProgressId_milestoneId: { skillProgressId: skillProg.id, milestoneId } },
     update: { completed, completedAt: completed ? new Date() : null },
     create: { skillProgressId: skillProg.id, milestoneId, completed, completedAt: completed ? new Date() : null }
   });
   ```
3. Checks if all milestones for this `skillProgressId` are completed. If yes, update `SkillProgress.status = "completed"`. Otherwise, keep it as `"in_progress"`.
4. Returns the updated node and milestone statuses.

### Step 3: Frontend Client Update
Uncomment the fetch block in `RoadmapNodeContent.tsx` and call `/api/career/progress` with the selected item IDs. Dispatch the updated progress values directly to the global Zustand store (`usmStore.ts`) to trigger reactive UI updates across other dashboard views.
