# Component Documentation: RepoCredibilityMeter

## 1. Component Name and Path
- **Component Name**: `RepoCredibilityMeter`
- **File Path**: `components/os/identity/github/RepoCredibilityMeter.tsx`

## 2. Simulated Data/Actions
This component displays hardcoded scores and metrics evaluating the user's Github repository originality, documentation quality, and architectural modularity, along with a mock "Tutorial Project Detector" alert for `react-todo-app-clone`.

### Simulated Data/Actions Code Snippets
The static audit score definition (Line 7):
```tsx
const auditScore = 84;
```

Hardcoded metrics and Tutorial Project Alert (Lines 27–121):
```tsx
{/* Metric 1 */}
<div>
  <div className="flex items-center justify-between text-sm mb-2">
    <span className="text-slate-300 font-medium flex items-center gap-2">
      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Documentation Depth
    </span>
    <span className="text-emerald-400 font-bold">Excellent</span>
  </div>
  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "90%" }} />
  </div>
</div>

{/* Metric 2 */}
<div>
  <div className="flex items-center justify-between text-sm mb-2">
    <span className="text-slate-300 font-medium flex items-center gap-2">
      <AlertTriangle className="w-4 h-4 text-amber-500" /> Deployment Links
    </span>
    <span className="text-amber-400 font-bold">Missing in 2 Repos</span>
  </div>
  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
    <div className="h-full bg-amber-500 rounded-full" style={{ width: "60%" }} />
  </div>
</div>

{/* Metric 3 */}
<div>
  <div className="flex items-center justify-between text-sm mb-2">
    <span className="text-slate-300 font-medium flex items-center gap-2">
      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Modular Architecture
    </span>
    <span className="text-emerald-400 font-bold">Strong</span>
  </div>
  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "85%" }} />
  </div>
</div>

<div className="mt-6 pt-4 border-t border-slate-800">
   <h4 className="text-sm font-semibold text-white mb-2">Tutorial Project Detector</h4>
   <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 flex items-start gap-3">
     <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
     <div>
       <p className="text-sm font-medium text-slate-300 line-clamp-1">react-todo-app-clone</p>
       <p className="text-xs text-slate-500 mt-1">High probability of being a tutorial clone. Lacks originality. Suggestion: Add a backend database or authentication to increase credibility.</p>
     </div>
   </div>
</div>
```

## 3. Database/API Migration Plan

### Step 1: Database Model
Store the credibility scores and alerts inside a structured JSON property in `detailedAudit` under `CareerProfile`, or introduce a custom database table:
```prisma
model RepoCredibility {
  id                 String   @id @default(cuid())
  userId             String   @unique
  auditScore         Int      @default(0)
  documentationScore Int      @default(0) // percentage
  deploymentScore    Int      @default(0) // percentage
  modularScore       Int      @default(0) // percentage
  deploymentStatus   String   @default("All active")
  detectedTutorials  Json     @default("[]") // Array of { repoName, issueDescription, suggestion }
  updatedAt          DateTime @updatedAt
  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Step 2: Backend Audit Engine API
1. Implement a parser service `/api/career/github/audit` that loops over public user repositories fetched via Github REST API.
2. Calculate scores:
   - **Documentation Depth**: Evaluated by checking README size, docstrings, or presence of JSDoc/Sphinx templates.
   - **Deployment Links**: Evaluated by querying the homepage URL on Github repositories and verifying active HTTP responses.
   - **Modular Architecture**: Evaluated by checking file counts, size distribution, and layer boundaries.
   - **Tutorial Detector**: An algorithm that matches file tree structure or hashes against common tutorial repositories (e.g. `angela-yu-webdev`, `freecodecamp`, `academind-react-tutorial`).
3. Save the results via Prisma.

### Step 3: Frontend Client Integration
Connect `RepoCredibilityMeter.tsx` to read the calculated `RepoCredibility` values via API calls instead of static constant initialization.
