# Component Documentation: TopperBenchmark

## 1. Component Name and Path
- **Component Name**: `TopperBenchmark`
- **File Path**: `components/placement/TopperBenchmark.tsx`

## 2. Simulated Data/Actions
This component simulates a relative rank or percentile rating comparing the user's CGPA and skill count against their classroom toppers. It implements a static, client-side tier calculation mapping hardcoded percentiles.

### Simulated Data/Actions Code Snippets
Local mock percentile calculations (Lines 12–15):
```tsx
// Mock Percentile Calculation
const cgpaPercentile = userCgpa >= 9.5 ? 1 : userCgpa >= 9.0 ? 5 : userCgpa >= 8.5 ? 12 : userCgpa >= 8.0 ? 25 : userCgpa >= 7.0 ? 45 : 70;
const skillsPercentile = userSkillsCount >= 10 ? 1 : userSkillsCount >= 8 ? 8 : userSkillsCount >= 5 ? 22 : userSkillsCount >= 3 ? 45 : 80;
const overallPercentile = Math.round((cgpaPercentile + skillsPercentile) / 2);
```

## 3. Database/API Migration Plan

### Step 1: Database Query Logic
Rather than hardcoding arbitrary ranges, calculate actual percentiles by aggregating records from all students in the database:
- Filter the cohort by matching `university` (and optionally department/specialization).
- Fetch CGPA data from `Calculation` or `AcademicSnapshot`.
- Fetch skill counts from `CareerProfile`.

Prisma / Raw SQL Query:
```sql
-- Count total students in the same university
SELECT COUNT(*) FROM users WHERE university = :uni;

-- Count students with higher CGPA
SELECT COUNT(DISTINCT u.id) 
FROM users u
JOIN calculations c ON c.user_id = u.id
WHERE u.university = :uni AND c.cgpa > :userCgpa;

-- Count students with more skills
SELECT COUNT(DISTINCT u.id) 
FROM users u
JOIN career_profiles cp ON cp.user_id = u.id
WHERE u.university = :uni AND CARDINALITY(cp.skills) > :userSkillsCount;
```

### Step 2: Benchmark Endpoint
Create a GET API route `/api/placement/benchmark` that:
1. Executes the rank count queries.
2. Performs the percentile calculation:
   - `cgpaPercentile = 100 * (1 - (higherCgpaCount / totalStudents))`
   - `skillsPercentile = 100 * (1 - (higherSkillsCount / totalStudents))`
   - `overallPercentile = (cgpaPercentile + skillsPercentile) / 2`
3. Returns these calculated statistics.

### Step 3: Frontend Integration
Modify `TopperBenchmark.tsx` to call `/api/placement/benchmark`, replacing the local mock math with the aggregated results returned by the backend.
