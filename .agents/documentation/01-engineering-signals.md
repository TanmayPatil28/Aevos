# Component Documentation: EngineeringSignals

## 1. Component Name and Path
- **Component Name**: `EngineeringSignals`
- **File Path**: `components/os/identity/github/EngineeringSignals.tsx`

## 2. Simulated Data/Actions
This component simulates developer capabilities and recruiter signals based on static, faked developer attributes and a static system verdict message.

### Simulated Data/Actions Code Snippets
The local signals configuration array (Lines 7–48):
```tsx
const signals = [
  {
    id: "auth",
    name: "Authentication",
    description: "Implemented JWT/OAuth in 2 projects",
    icon: <Lock className="w-4 h-4 text-indigo-400" />,
    color: "border-indigo-500/20 bg-indigo-500/10",
    active: true,
  },
  {
    id: "api",
    name: "REST APIs",
    description: "Designed 3 custom backend APIs",
    icon: <Server className="w-4 h-4 text-blue-400" />,
    color: "border-blue-500/20 bg-blue-500/10",
    active: true,
  },
  {
    id: "db",
    name: "Database Design",
    description: "Relational schema in 'E-commerce API'",
    icon: <Database className="w-4 h-4 text-emerald-400" />,
    color: "border-emerald-500/20 bg-emerald-500/10",
    active: true,
  },
  {
    id: "test",
    name: "Testing",
    description: "No Jest/PyTest setups detected",
    icon: <TestTube className="w-4 h-4 text-slate-400" />,
    color: "border-slate-800 bg-slate-900/50",
    active: false,
  },
  {
    id: "opt",
    name: "Optimization",
    description: "Missing caching or performance tuning",
    icon: <Zap className="w-4 h-4 text-slate-400" />,
    color: "border-slate-800 bg-slate-900/50",
    active: false,
  },
];
```

The static system verdict string (Lines 87–89):
```tsx
"This profile demonstrates intermediate production engineering capability."
```

## 3. Database/API Migration Plan
To replace the faked data with real queries and dynamic evaluations:

### Step 1: Data Model Expansion
Utilize the `detailedAudit` JSON field in the `CareerProfile` model, or add a dedicated `GithubAnalysis` model to persist the analyzed signals:
```prisma
model GithubAnalysis {
  id              String   @id @default(cuid())
  userId          String   @unique
  authActive      Boolean  @default(false)
  authDetails     String   @default("No auth implementation detected")
  apiActive       Boolean  @default(false)
  apiDetails      String   @default("No custom API routes detected")
  dbActive        Boolean  @default(false)
  dbDetails       String   @default("No database schema files detected")
  testActive      Boolean  @default(false)
  testDetails     String   @default("No testing configuration detected")
  optActive       Boolean  @default(false)
  optDetails      String   @default("No optimization features detected")
  systemVerdict   String   @default("Insufficient public code to form engineering signals.")
  updatedAt       DateTime @updatedAt
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Step 2: Backend Analyzer API
Create a new API route `/api/career/github/analyze` that:
1. Connects to the GitHub API via the user's saved OAuth token.
2. Scans repositories and parses `package.json`, `requirements.txt`, or source code files looking for:
   - Authentication (e.g., `jsonwebtoken`, `passport`, `next-auth`, `oauth2`).
   - REST APIs (e.g., `@nestjs/core`, `express`, `fastapi`, `spring-boot`).
   - Database schemas (e.g., `prisma/schema.prisma`, SQL migration files, Mongoose schemas).
   - Testing libraries (e.g., `jest`, `mocha`, `pytest`, `cypress`).
   - Optimizations (e.g., `redis`, `memcached`, caching utilities).
3. Invokes an LLM review (e.g., Gemini) to read structural patterns and output the `systemVerdict`.
4. Saves the results to the database using Prisma:
   ```typescript
   await prisma.githubAnalysis.upsert({
     where: { userId },
     update: { authActive, authDetails, apiActive, apiDetails, ... },
     create: { userId, authActive, authDetails, apiActive, apiDetails, ... }
   });
   ```

### Step 3: Frontend Integration
Replace the static `signals` array inside `EngineeringSignals.tsx` with a React Query or `fetch` hook pulling data from `/api/career/github/signals` (which queries the Prisma table `GithubAnalysis`).
