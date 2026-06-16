# Component Documentation: GraceMarksPredictorWidget

## 1. Component Name and Path
- **Component Name**: `GraceMarksPredictorWidget`
- **File Path**: `components/backlog/deep-dive/GraceMarksPredictorWidget.tsx`

## 2. Simulated Data/Actions
This component simulates the evaluation and application process for university grace marks ordinances (e.g. "Ordinance 0.229"). It displays static rule guidelines and sets a mock "applied" state without writing to any backend system.

### Simulated Data/Actions Code Snippets
Mock submission state tracker (Line 9):
```tsx
const [applied, setApplied] = useState(false);
```

Mock handler function (Lines 12–14):
```tsx
const handleApply = () => {
  setApplied(true);
};
```

Hardcoded University Ordinance Rulebook excerpt (Lines 77–101):
```tsx
<h4 className="text-white font-semibold text-[17px]">Ordinance 0.229</h4>
...
A candidate who fails in one or more subjects by a margin of not more than 1%...
...
The maximum grace marks allowable under this ordinance is strictly capped at 3 marks per subject...
```

## 3. Database/API Migration Plan

### Step 1: Query Ordinance Rules
Instead of hardcoding rules, retrieve university-specific rules from the `ATKTRule` table using the user's configured university field:
```typescript
const rules = await prisma.aTKTRule.findUnique({
  where: { university: currentUser.university }
});
```

### Step 2: Grace Mark Assessment Endpoint
Create a POST endpoint `/api/backlog/grace-marks/apply` that handles grace mark applications:
1. Validate candidate requirements:
   - Query user's grades in the backlog course (`BacklogRecord` and `Enrollment`).
   - Run math checks to verify if the marks gap is within the allowable range: `gap <= (courseTotalMarks * 0.01)` and `gap <= rules.maxGraceMarksAllowed`.
2. Create an audit trail record in a new `BacklogApplication` model:
   ```prisma
   model BacklogApplication {
     id           String   @id @default(cuid())
     userId       String   @map("user_id")
     courseId     String   @map("course_id")
     type         String   // GRACE_MARKS | REVALUATION
     status       String   // PENDING | APPROVED | REJECTED
     details      Json
     createdAt    DateTime @default(now())
     
     user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
   }
   ```
3. Update the `BacklogRecord.status` to `REGISTERED` or `CLEARED` depending on authorization.

### Step 3: Frontend Integration
Modify `GraceMarksPredictorWidget.tsx` to call `/api/backlog/grace-marks/apply` and dynamically fetch user application history to show the applied status and results.
