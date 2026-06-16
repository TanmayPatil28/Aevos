# Component Documentation: LandingInteractives

## 1. Component Name and Path
- **Component Name**: `LandingInteractives`
- **File Path**: `components/LandingInteractives.tsx`

## 2. Simulated Data/Actions
This component renders interactive dashboard mockups on the public landing page. It displays hardcoded academic scores (CGPA: 8.42, Health Score: 92/100), a mock subject risk heatmap, and hardcoded eligibility tags for Google and Amazon.

### Simulated Data/Actions Code Snippets
Mock layouts for Sidebar and Topbar (Lines 9–30).

Academic metrics mock dashboard (Lines 46–92):
```tsx
<div className="text-[#86868B] text-sm font-medium mb-2">Current CGPA</div>
<div className="text-5xl font-semibold text-white tracking-tighter">8.42</div>
...
<div className="text-[#86868B] text-sm font-medium mb-2">Health Score</div>
<div className="text-5xl font-semibold text-white tracking-tighter">92<span className="text-2xl text-[#86868B]">/100</span></div>
...
{[85, 92, 76, 98, 88, 65].map((h, i) => ( ... // Subject Risk Heatmap
```

Recruiter eligibility cards mockup (Lines 94–149):
```tsx
<div className="text-white font-semibold text-lg">Google</div>
<div className="text-emerald-400 text-sm">Highly Eligible</div>
...
<div className="flex justify-between text-sm"><span className="text-[#86868B]">Req. CGPA</span><span className="text-white">8.0+ (You: 8.42)</span></div>
...
<div className="text-white font-semibold text-lg">Amazon</div>
<div className="text-yellow-400 text-sm">Borderline</div>
...
<div className="flex justify-between text-sm"><span className="text-[#86868B]">Req. CGPA</span><span className="text-white">8.5+ (You: 8.42)</span></div>
```

## 3. Database/API Migration Plan

### Step 1: User Session Conditional Rendering
Modify the component to check for an active user session:
- If a session is detected, load the user's actual academic and placement metrics from the database.
- If no session is active, default to the pre-populated mock dataset (or an optimized demo profile).

### Step 2: Session Data Fetching
Call `/api/dashboard/summary` to query the logged-in student's details:
- **CGPA**: Read from the latest `Calculation` entry.
- **Health Score**: Calculated as:
  `Health = (AttendanceFactor * 0.4) + (GpaFactor * 0.4) + (BacklogFactor * 0.2)`
  where:
  - `AttendanceFactor` = percentage of active courses with attendance >= 75%.
  - `GpaFactor` = Normalized GPA on 100-scale (e.g. CGPA * 10).
  - `BacklogFactor` = `100 - (activeBacklogsCount * 25)`, min 0.
- **Recruiter Eligibility**: Map the user's CGPA against the standard database policies (`PlacementPolicy`).

### Step 3: Frontend Bindings
Adjust `LandingInteractives.tsx` to read values from a `useSession()` Hook. Replace the hardcoded numbers (`8.42`, `92`) with the dynamically fetched values, fallback to the template mock dataset if no session exists.
