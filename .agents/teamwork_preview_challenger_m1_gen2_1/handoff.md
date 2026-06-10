# 5-Component Handoff Report

## 1. Observation
- Ran an empirical stress test against `matchInternshipsForProfile` in `lib/jobs/matcher.ts` with a mock profile containing an empty `academic` object (`{ targetCgpa: 8 }`), a `major`, and `skills`.
- Observed the dynamically generated query in logs: `TAVILY_QUERY: software engineering tech internships summer`. The matcher completely ignored `major` and `skills`.
- Reviewed `lib/jobs/matcher.ts` lines 15-23:
```typescript
    if (academicProfile?.academic) {
      const programme = academicProfile.academic.programme || "";
      const branch = academicProfile.academic.branch || "";
      if (programme || branch) {
        query = `${branch} ${programme} internships summer`.trim();
      }
    } else if (academicProfile?.skills && academicProfile?.major) {
      query = `${academicProfile.major} ${academicProfile.skills.slice(0, 2).join(" ")} internships summer`.trim();
    }
```
- Because `academicProfile.academic` is defined, it enters the first `if` block. Inside, if `programme` and `branch` are empty, it leaves `query` as the default but does NOT evaluate the `else if`.

## 2. Logic Chain
1. The matcher dynamically generates a Tavily search query from `academicProfile`.
2. User profiles often have an `academic` object configured with basic info (like `targetCgpa`), but without explicitly filling in `programme` or `branch`.
3. When `academicProfile.academic` is present but `programme` and `branch` are falsy, the `if (academicProfile?.academic)` evaluates to true.
4. The inner `if (programme || branch)` evaluates to false, so `query` is left at the default `"software engineering tech internships summer"`.
5. The `else if` for `skills` and `major` is skipped because the outer `if` block was executed.
6. This results in the algorithm ignoring the user's explicit skills and major, delivering irrelevant default results. This fails the prompt requirement to dynamically construct the query based on the profile robustly.

## 3. Caveats
- Error handling was previously flawed (returning an object instead of `[]`), but this was just fixed by the worker. The query generation is the remaining blocker.

## 4. Conclusion
FAIL. The dynamic search query generation has a logical bug that ignores a user's skills and major if the `academic` object is present but lacks a `programme` or `branch`. The `else if` branch for `skills` is bypassed in this scenario.

## 5. Verification Method
Run the stress test script created at `scripts/stress-matcher.ts` which calls the matcher with a profile `{ academic: { targetCgpa: 8 }, major: "Computer Science", skills: ["React", "Node.js"] }`. Observe that the generated `TAVILY_QUERY` remains `"software engineering tech internships summer"`.
