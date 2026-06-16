# Component Documentation: CompanyDeepDivePanel

## 1. Component Name and Path
- **Component Name**: `CompanyDeepDivePanel`
- **File Path**: `components/placement/CompanyDeepDivePanel.tsx`

## 2. Simulated Data/Actions
This component shows a sidebar panel containing details about a selected recruiter company. It displays hardcoded historical salary statistics (CTC), recruitment channels, and static interview round descriptions.

### Simulated Data/Actions Code Snippets
Mock average CTC and recruitment type layout (Lines 90–605):
```tsx
{/* Mock Historical Data */}
<div className="space-y-4">
  <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
    <TrendingUp size={14} /> Historical Data (Mock)
  </h3>
  <div className="grid grid-cols-2 gap-4">
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
      <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-1">Avg CTC</div>
      <div className="text-xl font-bold text-white">12.5 LPA</div>
    </div>
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
      <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-1">Recruitment</div>
      <div className="text-xl font-bold text-white">On-Campus</div>
    </div>
  </div>
</div>
```

Mock interview/recruitment selection stages (Lines 107–129):
```tsx
{/* Selection Process */}
<div className="space-y-4 pb-12">
  <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
    <Users size={14} /> Selection Process (Mock)
  </h3>
  <div className="relative pl-6 border-l border-white/20 space-y-6">
    <div className="relative">
      <div className="absolute -left-[29px] top-1 w-3 h-3 bg-black border-2 border-white/20 rounded-full" />
      <h4 className="text-sm font-bold text-white">Round 1: Online Assessment</h4>
      <p className="text-xs text-white/50 mt-1">Aptitude, Core CS subjects, 2 DSA questions.</p>
    </div>
    <div className="relative">
      <div className="absolute -left-[29px] top-1 w-3 h-3 bg-black border-2 border-white/20 rounded-full" />
      <h4 className="text-sm font-bold text-white">Round 2: Technical Interview</h4>
      <p className="text-xs text-white/50 mt-1">System Design and deep dive into your projects.</p>
    </div>
    <div className="relative">
      <div className="absolute -left-[29px] top-1 w-3 h-3 bg-black border-2 border-white/20 rounded-full" />
      <h4 className="text-sm font-bold text-white">Round 3: HR / Cultural Fit</h4>
      <p className="text-xs text-white/50 mt-1">Standard HR questions and situational judgment.</p>
    </div>
  </div>
</div>
```

## 3. Database/API Migration Plan

### Step 1: Database Setup
Define a database model representing corporate recruitment parameters:
```prisma
model RecruiterCompany {
  id               String   @id @default(cuid())
  name             String   @unique
  avgCtc           Float    @map("avg_ctc") // Package in LPA
  recruitmentType  String   @map("recruitment_type") // On-Campus | Off-Campus
  selectionRounds  Json     @map("selection_rounds") // Array of { title, description, order }
  createdAt        DateTime @default(now())
}
```

### Step 2: Endpoint Integration
Create `/api/placement/companies/[id]` that queries the company details:
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const company = await prisma.recruiterCompany.findUnique({
    where: { id: params.id }
  });
  return NextResponse.json(company);
}
```

### Step 3: Frontend Client Integration
Modify `CompanyDeepDivePanel.tsx` to read the active company details from the database API response, using an array `.map()` call on `company.selectionRounds` to list the interview stages dynamically.
