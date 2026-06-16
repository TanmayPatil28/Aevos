# Technical Overview: GradeFlow System Architecture

This guide details the core architectural layout, components, state management stores, and styling conventions of the GradeFlow Career Intelligence Operating System.

---

## 1. Frontend & Routing Structure
GradeFlow is built on **React 18** and **Next.js 14.2**, using the modern **App Router** paradigm to manage layouts, page routing, and server-side data fetching.

### App Router Design
- **OS Layout**: Core user cockpit operations are grouped under the `/career` route folder (representing the Career Intelligence OS dashboard view).
- **Workspace Areas**: Functional student operations are grouped under specialized workspace contexts:
  - `/internships`: Interactive roadmap widgets and AI matchers.
  - `/placement`: Topper benchmarking cards and recruiter scanners.
- **Route Layout files (`layout.tsx`)**: Establish global state wrappers, theme providers, navigation sidebars, and top banners.
- **Page files (`page.tsx`)**: Act as entry points, invoking server components to pre-fetch baseline data and passing them to client-side interactive widgets.
- **Server Actions**: Define server-side functions (e.g. `matchInternships()`) to securely interface with the persistence layer (Prisma) and third-party integrations (Gemini, Tavily).

---

## 2. Client State Management with Zustand
GradeFlow uses **Zustand** (located in `stores/usmStore.ts`) to manage client-side state reactively. A unified state machine (USM) ensures that changes in one view propagate instantaneously across all dashboard widgets.

### Core State Slices
The state is partitioned into logical slices represented by TypeScript interfaces:
1. **StudentDetails**: Tracks onboarding status, INSTITUTION parameters, name, and PRN.
2. **AcademicState**: Current CGPA, earned credits, and target CGPA calculations.
3. **CourseState**: Active enrolled courses, credits, grades (CIE & SEE marks), and attendance rates.
4. **TimetableState**: Weekly calendar slots mapping class hours.
5. **CareerState**: Target companies, WES GPA equivalents, projects list, target roles, and core skills checklist.
6. **WorkspaceState**: Global target settings, sidebar panels display, and sandbox testing configurations.
7. **BacklogState**: Active backlog courses, attempts counts, recovery plans, and exam schedules.

### Persistence and Reactivity
- **Persist Middleware**: Local storage persistence is enabled via `persist` middleware, enabling offline session restoration:
  ```typescript
  export const useUSMStore = create<USMStoreState>()(
    persist(
      (set, get) => ({ ... }),
      { name: "gradeflow-usm-storage" }
    )
  );
  ```
- **Selectors**: Specialized selector files in `stores/selectors/` (e.g. `academic.ts`, `risk.ts`) extract memoized, computed states (like overall attendance status and detention risk) from raw slices, optimizing re-render performance.

---

## 3. Styling Conventions
All styling is written utility-first using **Tailwind CSS**.

### Guidelines
- **Color Palette**: Dark-mode primary layout utilizing sleek slate backgrounds (`bg-slate-950`), absolute black headers (`bg-black`), and neon accent borders (`border-indigo-500/20`, `bg-emerald-500/10`).
- **Responsive Layout**: Fluid grids and CSS flexboxes ensure proper wrapping from mobile widths to large desktop monitors.
- **Micro-animations**: Smooth cursor hover state transitions (`hover:bg-slate-800/30 transition-colors`), and pulse states for warnings (`animate-pulse`).
- **Layout Compliance**: Visual elements conform to the layout contracts specified in `PROJECT.md` to guarantee design consistency.
