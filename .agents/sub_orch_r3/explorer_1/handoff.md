# Handoff Report: R3 API & DB Audit

## 1. Observation
- `prisma/schema.prisma` was reviewed. The `User` model has a field `activeSnapshotId` which is queried but missing an index. The `UserMemory` model has an `embedding Unsupported("vector")` field without an `hnsw` or `ivfflat` index which will cause a full table scan for vector queries.
- `app/api/documents/route.ts` directly accepts `fileName`, `fileUrl`, and `fileType` from `req.json()` without using a schema validator (like Zod) and passes them straight to the `prisma.document.create` call.
- `app/api/academic/snapshots/route.ts` lacks validation on metadata properties such as `sourceType`, `sourceInstitution`, and `snapshotType` which are mapped directly to database inputs.
- Rate limiting is broadly absent across the API layer (e.g. `calculations/route.ts`, `plans/route.ts`, `documents/route.ts`).
- `npm run test:stability`, `npm run test:unit`, and `npm run test:presets` were executed. All tests (15 stability, 58 preset, 10 unit) passed cleanly.

## 2. Logic Chain
1. **DB Optimization**: `activeSnapshotId` in `User` should be indexed since `academic/snapshots/route.ts` queries the user specifically to check this field. `user_memories.embedding` will require a vector index for similarity search scale. 
2. **Security**: The lack of Zod validation in `documents/route.ts` and `academic/snapshots/route.ts` means malicious payloads could inject excessively long strings or unexpected data types leading to errors or db bloat.
3. **Quality/Efficiency**: Missing rate limiting can lead to abuse, especially on computationally heavy or AI-reliant routes. However, a global solution or a middleware-based solution might be out of scope unless we just implement standard rate limiting. The worker should implement input validation first.

## 3. Caveats
- Adding vector indexes to `prisma/schema.prisma` requires specific Prisma preview features (`postgresqlExtensions` is enabled) and raw SQL migrations for exact operator classes if Prisma's native `type: Hnsw` syntax isn't fully supported by the specific version. The worker should be careful with vector index syntax.
- Rate limiting implementation depends on whether Redis/Upstash is configured. `package.json` contains `@upstash/qstash` but maybe not a direct redis library, or `zustand` is just client side. The worker needs to verify the project's standard rate limiting approach or use a simple in-memory approach/middleware.

## 4. Conclusion
The codebase lacks proper payload validation in several key API endpoints, especially `documents` and `academic/snapshots`. The database schema is missing critical indexes for foreign keys/pointers (`activeSnapshotId`) and vector similarity search (`embedding`). The baseline tests are fully passing. The Worker should focus on adding Zod validation schemas for all unvalidated POST payloads and adding the necessary DB indexes.

## 5. Verification Method
- After fixes, run `npx prisma validate` and `npm run build` to verify schema and types.
- Ensure all tests still pass: `npm run test:unit`, `npm run test:stability`, `npm run test:presets`.
- Check `app/api/documents/route.ts` manually to ensure `zod` validation is present.
