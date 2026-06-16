# Component Documentation: SkillGapAnalyzer

## 1. Component Name and Path
- **Component Name**: `SkillGapAnalyzer`
- **File Path**: `components/os/identity/SkillGapAnalyzer.tsx`

## 2. Simulated Data/Actions
This component simulates a role-readiness analysis for a target job role (e.g., "AI Engineering Intern"). It displays a hardcoded match percentage and mock arrays of acquired skills and missing skill gaps.

### Simulated Data/Actions Code Snippets
The static match percentage definition (Line 7):
```tsx
const matchPercentage = 42;
```

Hardcoded list of strong and missing signals (Lines 51–221):
```tsx
{/* Acquired Skills */}
<div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
  <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
    <CheckCircle2 className="w-4 h-4" /> Strong Signals
  </h4>
  <div className="flex flex-wrap gap-2">
    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-300 text-xs rounded-md border border-emerald-500/20">Python</span>
    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-300 text-xs rounded-md border border-emerald-500/20">Data Structures</span>
    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-300 text-xs rounded-md border border-emerald-500/20">TensorFlow Basics</span>
  </div>
</div>

{/* Missing Signals */}
<div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4">
  <h4 className="text-sm font-semibold text-rose-400 mb-3 flex items-center gap-2">
    <AlertCircle className="w-4 h-4" /> Missing Signals
  </h4>
  <div className="space-y-3">
    <div className="flex items-start gap-3 group cursor-pointer">
      <div className="w-6 h-6 rounded bg-rose-500/10 flex items-center justify-center shrink-0 mt-0.5">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">Cloud Deployment</div>
        <div className="text-xs text-slate-500">Deploy at least 1 ML model to AWS or GCP.</div>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
    </div>
    
    <div className="flex items-start gap-3 group cursor-pointer">
      <div className="w-6 h-6 rounded bg-rose-500/10 flex items-center justify-center shrink-0 mt-0.5">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">End-to-End Pipeline</div>
        <div className="text-xs text-slate-500">Your GitHub lacks data processing pipelines.</div>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
    </div>
  </div>
</div>
```

## 3. Database/API Migration Plan

### Step 1: Querying User Progress
Load the user's acquired skills and roadmap configurations from the database.
- Get the active skills of the user from `CareerProfile.skills` and completed nodes in `SkillProgress` where `status = "completed"`.
- Fetch the target role's required skills from the `DynamicRoadmap` table (which stores nodes list in JSON: `nodes` array containing skills).

Prisma Query:
```typescript
const userSkills = await prisma.careerProfile.findUnique({
  where: { userId },
  select: { skills: true }
});

const roadmap = await prisma.dynamicRoadmap.findFirst({
  where: { userId, targetRole: activeTargetRole },
  orderBy: { createdAt: 'desc' }
});
```

### Step 2: Gap Logic
Write a helper to parse `roadmap.nodes` to extract required skills, check which ones are present in `userSkills.skills`, and flag missing ones:
- **Strong Signals**: Skills present in both the target role requirements and user profile.
- **Missing Signals**: Skills present in the target role requirements but absent in the user profile.
- **Match Percentage**: `(acquiredCount / totalRequiredCount) * 100`.

### Step 3: Frontend Integration
Create a Server Action or API endpoint `/api/career/gap-analysis` that executes this logic. Modify `SkillGapAnalyzer.tsx` to read the calculated percentage and list arrays from this API.
