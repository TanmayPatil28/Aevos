# Development Environment

## Prerequisites

- Node.js LTS (>= 20)
- npm 10+
- PostgreSQL database (Neon recommended)

## OneDrive Warning

Ensure this repository is placed OUTSIDE of any OneDrive synced folders to prevent slow builds, node_modules locking, and strange cache issues.

## Useful Workflows

### Clean / Reset

To clean the Next.js cache: `npm run clean`
To nuke dependencies and reinstall from scratch: `npm run reset`

### Prisma Workflow

- Generate types: `npm run prisma:generate`
- Validate schema: `npm run prisma:validate`
- Run migrations: `npm run prisma:migrate`

### Verification

Run `npm run verify` to fully lint, typecheck, and build the project, ensuring everything is ready for deployment.
