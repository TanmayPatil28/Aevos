# Progress

Last visited: 2026-06-09T15:19:30+05:30

Completed investigation.
- Found the cause of the `/_document` error: `recharts` static imports failing during SSR.
- Located `dangerouslySetInnerHTML` in `CalculationBreakdown.tsx`.
- Verified missing `supabase.auth.getUser()` in API routes.
- Wrote `handoff.md` with explicit instructions to delete `generate_audit.py`.
