# Component Documentation: ProfileSimulator

## 1. Component Name and Path
- **Component Name**: `ProfileSimulator`
- **File Path**: `components/os/identity/linkedin/ProfileSimulator.tsx`

## 2. Simulated Data/Actions
This component simulates a recruiter's eye-tracking review and keyword scanning analysis on the candidate's LinkedIn profile or resume, returning hardcoded findings and a static simulation verdict after a faked network processing delay.

### Simulated Data/Actions Code Snippets
The mock delay handler (Lines 25–28):
```tsx
setTimeout(() => {
  setIsSimulating(false);
  setSimulationComplete(true);
}, 2000);
```

Hardcoded audit findings and verdicts (Lines 47–167):
```tsx
<div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex gap-4">
  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
  <div>
    <h4 className="text-sm font-semibold text-emerald-300">Strong technical depth detected</h4>
    <p className="text-xs text-slate-400 mt-1">Your headline strongly signals your tech stack within the first 3 seconds of reading.</p>
  </div>
</div>

<div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-4">
  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
  <div>
    <h4 className="text-sm font-semibold text-amber-300">Looks tutorial-based</h4>
    <p className="text-xs text-slate-400 mt-1">The project "To-Do App" implies a beginner level. We recommend replacing this with a data-driven project.</p>
  </div>
</div>

<div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex gap-4">
  <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
  <div>
    <h4 className="text-sm font-semibold text-rose-300">Missing measurable impact</h4>
    <p className="text-xs text-slate-400 mt-1">Recruiters scan for numbers (e.g., "reduced load time by 40%"). Your descriptions currently lack metrics.</p>
  </div>
</div>

<div className="mt-6 p-4 border border-indigo-500/20 bg-indigo-500/5 rounded-xl text-center">
  <p className="text-sm text-indigo-300 font-medium">Simulation Verdict</p>
  <h3 className="text-2xl font-black text-white mt-1">"Good Projects, Weak Branding"</h3>
  <p className="text-xs text-slate-400 mt-2">Adjust your 'About' section to shift from a student tone to an engineer tone.</p>
}
```

## 3. Database/API Migration Plan

### Step 1: Backend Endpoint Integration
Create a POST endpoint `/api/career/linkedin/simulate` to run a real-time LLM-powered review of the user's career profile:
- Input: The user's active resume text stored in the `CareerProfile` table.
- Model: Gemini-1.5-Flash (or similar) with a structured JSON schema output containing:
  ```json
  {
    "verdict": "Good Projects, Weak Branding",
    "details": "Adjust your 'About' section...",
    "findings": [
      {
        "type": "positive | warning | error",
        "title": "Strong technical depth detected",
        "description": "Your headline strongly signals your tech stack."
      }
    ]
  }
  ```

### Step 2: Database Storage
Prisma schema query to load/update these LinkedIn simulation reports under the `detailedAudit` JSON field in `CareerProfile`:
```typescript
const userProfile = await prisma.careerProfile.findUnique({
  where: { userId }
});
```

### Step 3: UI Implementation
Replace the `setTimeout` and hardcoded states in `ProfileSimulator.tsx` with an `axios` or `fetch` request calling `/api/career/linkedin/simulate`. Display a loading spinner during the active request and render the dynamic JSON output returned by the LLM.
