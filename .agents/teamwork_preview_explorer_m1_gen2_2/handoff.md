# Fix Strategy for Iteration 2 (M1 Database Audit)

## 1. Observation
The previous worker introduced `INTEGRITY VIOLATION` issues by masking errors with mock payloads, and `Challenger Findings` indicated schema migration failures. Specifically:

**Integrity Violations (from Auditor):**
- `app/api/academic/snapshots/route.ts` (POST): Catches DB errors and returns `mock_snapshot_${Date.now()}`.
- `app/api/career/skill-gap/route.ts` (POST): Returns a mock JSON response when AI generation fails.
- `app/api/academic/snapshots/route.ts` (GET): Uses fallback `{ snapshot: null }` on 500 errors.

**Migration Errors (from Challenger):**
- **Missing Defaults:** Added `updated_at` (or `updatedAt`) without a `@default(now())` value to tables with existing data (`users`, `courses`, etc.).
- **Invalid Vector Index:** Added `@@index([embedding])` to `UserMemory` in `schema.prisma`. Postgres rejects standard B-tree indexes for vector types.
- **Primary Key Type Changes:** `Calculation` and `Plan` IDs were changed from `Int` to `String` (with `cuid()`), causing a migration failure due to existing data incompatibilities.

## 2. Logic Chain
1. To resolve **integrity violations**, all facade implementations (mock payloads and masked 500 errors) must be removed. API routes should properly bubble up errors or return standard HTTP error responses (e.g., `500 Internal Server Error`).
2. To resolve **migration errors** for `updatedAt`, the Prisma schema must explicitly use `@default(now())` for these newly added datetime fields, allowing existing records to be populated correctly.
3. To resolve the **invalid vector index** error, the `@@index([embedding])` directive must be removed entirely unless `Prisma 5` extensions with `type: Hnsw` syntax for Postgres vectors are explicitly enabled and supported. Removing it is the safest approach if not critical.
4. To resolve the **primary key type changes** error in a development environment, a reset of the database is the most straightforward solution (e.g., `npx prisma migrate reset` or `npx prisma migrate dev --name <name> --create-only` then handle manual SQL changes, but resetting is easier if data is disposable).

## 3. Caveats
- We assume this is a development environment and dropping/resetting the database to accommodate primary key type changes (`Int` to `String`) is acceptable. If data must be preserved, a multi-step custom SQL migration would be required (adding new string column, copying data, updating foreign keys, dropping old column, renaming). The recommended strategy below advises wiping the dev DB for simplicity.
- The precise Prisma version is unknown; if `< 5.0`, vector indexes are not supported natively by Prisma at all.

## 4. Conclusion
**Recommended Fix Strategy:**

1. **Remove Mock Facades:** Revert changes in `app/api/academic/snapshots/route.ts` (GET and POST) and `app/api/career/skill-gap/route.ts` (POST) to ensure they throw or return `500` status codes properly on errors, instead of mock payloads.
2. **Fix `updatedAt`:** In `schema.prisma`, ensure all `updated_at` / `updatedAt` fields use `@updatedAt` alongside an explicit default if needed, or define as `updatedAt DateTime @default(now()) @updatedAt`.
3. **Fix Vector Index:** Remove `@@index([embedding])` from the `UserMemory` model in `schema.prisma`.
4. **Fix PK Type Changes:** After fixing the schema, apply the changes by clearing the dev DB. Run `npx prisma migrate reset` followed by `npx prisma migrate dev` to successfully apply the `Int` to `String` ID changes on `Calculation` and `Plan`.

## 5. Verification Method
- **Verify Facades Removed:** Inspect the code in `app/api/academic/snapshots/route.ts` and `app/api/career/skill-gap/route.ts` using `view_file` to ensure `try-catch` blocks returning mocks are gone.
- **Verify Schema Migration:** Run `npx prisma validate` and `npx prisma format` to ensure the Prisma schema is syntactically valid.
- **Verify DB Sync:** Run `npx prisma migrate reset --force` and `npx prisma migrate dev --name m1_fixes` to confirm the database successfully builds without migration errors.
