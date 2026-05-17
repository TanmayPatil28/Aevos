# GradeFlow Architecture

GradeFlow is built on modern web technologies ensuring a scalable, resilient, and responsive architecture.

## High Level Overview

- **Frontend:** Next.js (App Router), React, TailwindCSS, Zustand/SWR, Framer Motion
- **Backend:** Next.js Route Handlers
- **Database:** PostgreSQL (Neon) with Prisma ORM
- **Authentication:** NextAuth.js
- **Testing:** Custom test suites (Python-based Selenium/Playwright referenced in requirements)

## Core Domains

- [Grading Engine](grading-engine.md)
- [Predictive Analytics](predictive-analytics.md)
- [Event System](event-system.md)
- [University Preset System](university-preset-system.md)
