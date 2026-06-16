# Component Documentation: PlacementScannerWidget

## 1. Component Name and Path
- **Component Name**: `PlacementScannerWidget`
- **File Path**: `components/backlog/PlacementScannerWidget.tsx`

## 2. Simulated Data/Actions
This component checks student eligibility for corporate placement drives by displaying hardcoded academic thresholds (CGPA, active backlogs count) for mock companies Google and TCS Digital.

### Simulated Data/Actions Code Snippets
Hardcoded recruitment policies for Google and TCS Digital (Lines 71–117):
```tsx
<h4 className="text-[17px] font-semibold text-white tracking-tight">Google</h4>
...
<span className="text-[#8E8E93]">Max Active Backlogs</span>
<span className="font-semibold text-white">0</span>
...
<span className="text-[#8E8E93]">Min CGPA</span>
<span className="font-semibold text-white">8.0</span>
...
<h4 className="text-[17px] font-semibold text-white tracking-tight">TCS Digital</h4>
...
<span className="text-[#8E8E93]">Max Active Backlogs</span>
<span className="font-semibold text-[#FF453A]">1</span>
...
<span className="text-[#8E8E93]">Min CGPA</span>
<span className="font-semibold text-white">7.0</span>
```

## 3. Database/API Migration Plan

### Step 1: Database Model
Introduce a database table `PlacementDrive` or `CompanyPolicy` to store recruiter requirements:
```prisma
model PlacementPolicy {
  id                 String   @id @default(cuid())
  companyName        String   @unique @map("company_name")
  logoUrl            String?  @map("logo_url")
  minCgpa            Float    @map("min_cgpa")
  maxBacklogsAllowed Int      @map("max_backlogs_allowed")
  packageCtc         Float    @map("package_ctc") // in LPA
  createdAt          DateTime @default(now()) @map("created_at")
}
```

### Step 2: Eligibility Computation API
Create a backend API route `/api/placement/scanner` that aggregates user metrics and tests eligibility:
1. Count the user's active backlogs:
   ```typescript
   const activeBacklogs = await prisma.backlogRecord.count({
     where: { userId, status: { in: ["PENDING", "REGISTERED", "EXAM_SCHEDULED"] } }
   });
   ```
2. Retrieve the user's current CGPA from their latest `Calculation` record:
   ```typescript
   const latestCalc = await prisma.calculation.findFirst({
     where: { userId },
     orderBy: { date: "desc" }
   });
   const userCgpa = latestCalc?.cgpa || 0.0;
   ```
3. Fetch all company requirements from `PlacementPolicy` table and compute the criteria checklist:
   ```typescript
   const policies = await prisma.placementPolicy.findMany();
   const results = policies.map(policy => ({
     companyName: policy.companyName,
     minCgpa: policy.minCgpa,
     maxBacklogs: policy.maxBacklogsAllowed,
     userCgpa,
     userBacklogs: activeBacklogs,
     isEligible: userCgpa >= policy.minCgpa && activeBacklogs <= policy.maxBacklogsAllowed
   }));
   ```

### Step 3: Frontend Bindings
Modify `PlacementScannerWidget.tsx` to pull from `/api/placement/scanner` instead of rendering static divs for Google and TCS Digital. Use dynamic Tailwind colors depending on `isEligible` state.
