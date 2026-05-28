# GradeFlow: Architectural Blueprint for a Unified Student Intelligence Operating System

This document establishes the official architectural blueprint for **GradeFlow**, transitioning the platform from a collection of isolated GPA calculators into a comprehensive, state-driven, and mathematically explainable **Student Intelligence Operating System (Student OS)**. 

To optimize for execution velocity, operational leaness, and immediate startup shipping, the architecture is strictly structured across three progressive phases:
* **Phase A — Startup MVP Architecture**: Focuses on core, deterministic foundations built inside a Next.js/PostgreSQL modular monolith.
* **Phase B — Growth Infrastructure**: Introduces client-side optimizations, advanced OCR models, multi-tenancy, and controlled AI enhancements after establishing traction.
* **Phase C — Research & Scale Systems**: Long-term enterprise-grade distributed architectures, neuro-symbolic AI verification, and machine learning telemetry models.

```
                           +-------------------------------------------+
                           |           Thin UI Experience Layer        |
                           |   (Bloomberg Terminal UX / Zustand Store) |
                           +--------------------+----------------------+
                                                |
                                                v
                           +--------------------+----------------------+
                           |        Unified Student State Machine      |
                           |        (Zustand / JSON Local Sync)        |
                           +--------------------+----------------------+
                                                |
                       +------------------------+------------------------+
                       v                                                 v
         +-------------+-------------+                     +-------------+-------------+
         |   Academic Intelligence   |                     |     Simulation Engine     |
         | (Rule Engines & Classifiers)|                   | (SGPA / Backlog / ATKT)   |
         +-------------+-------------+                     +-------------+-------------+
                       |                                                 |
                       +------------------------+------------------------+
                                                v
                           +--------------------+----------------------+
                           |        Prisma Relational Database         |
                           |    (Deeply Normalized BCNF / Postgres)    |
                           +-------------------------------------------+
```

---

## Phase A — Startup MVP Architecture (Immediate Build)

### 1. Unified Student State Machine (USM)
A unified state container is required to eliminate scattered logic. In Phase A, the USM is modeled as a client-side **Zustand store** with automatic `localStorage` synchronization. It tracks the complete, multidimensional academic standing of the student as a single source of truth.

#### A. Core Type Interface (`types/studentState.ts`)
```typescript
export interface SubjectState {
  id: string;
  courseCode: string;
  name: string;
  credits: number;
  grade?: string;
  points?: number;
  marksReceived?: number;
  isAudit: boolean;
  isBacklog: boolean;
  semesterId: string;
}

export interface SemesterState {
  id: string;
  semesterIndex: number; // e.g. 1 to 8
  subjects: SubjectState[];
  sgpa: number;
  totalCredits: number;
  attendancePercent: number;
  isCompleted: boolean;
}

export interface UnifiedStudentState {
  // Identity & Alignment
  studentId: string;
  activePresetId: string; // References UniversityPreset.id
  currentSemesterIndex: number;
  
  // Academic Metrics
  cumulativeGpa: number;
  totalEarnedCredits: number;
  backlogCount: number;
  activeBacklogs: string[]; // Subject IDs
  
  // Longitudinal Semesters
  semesters: SemesterState[];
  
  // Core Indicators
  riskTier: "LOW" | "MEDIUM" | "HIGH";
  riskTriggers: string[];
  
  // Career Eligibility Status
  careerEligibility: {
    cgpaThresholds: Record<string, boolean>; // e.g. {"Wipro_6.0": true, "Google_8.5": false}
    coreSkillsUnlocked: string[];
  };
  
  // UI Sandbox Simulation state
  simulationActive: boolean;
  simulatedState?: {
    semesters: SemesterState[];
    cumulativeGpa: number;
    backlogCount: number;
  };
}
```

#### B. Reducers & Pure State Mutations (`lib/student-state/usmStore.ts`)
```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UnifiedStudentState, SubjectState } from "@/types/studentState";
import { calculateSgpa, calculateCgpa } from "@/lib/presets/presetEngine";
import { getPresetById } from "@/lib/presets/presetRegistry";

interface USMStore extends UnifiedStudentState {
  setPreset: (presetId: string) => void;
  upsertSubject: (semesterId: string, subject: SubjectState) => void;
  removeSubject: (semesterId: string, subjectId: string) => void;
  updateAttendance: (semesterId: string, percent: number) => void;
  recalculateMetrics: () => void;
  triggerSimulation: (active: boolean) => void;
}

export const useUSMStore = create<USMStore>()(
  persist(
    (set, get) => ({
      studentId: "anonymous_mvp",
      activePresetId: "sppu_default",
      currentSemesterIndex: 1,
      cumulativeGpa: 0,
      totalEarnedCredits: 0,
      backlogCount: 0,
      activeBacklogs: [],
      semesters: [],
      riskTier: "LOW",
      riskTriggers: [],
      careerEligibility: { cgpaThresholds: {}, coreSkillsUnlocked: [] },
      simulationActive: false,

      setPreset: (presetId) => {
        set({ activePresetId: presetId });
        get().recalculateMetrics();
      },

      upsertSubject: (semesterId, subject) => {
        set((state) => {
          const semesters = state.semesters.map((sem) => {
            if (sem.id !== semesterId) return sem;
            const exists = sem.subjects.some((s) => s.id === subject.id);
            const subjects = exists
              ? sem.subjects.map((s) => (s.id === subject.id ? subject : s))
              : [...sem.subjects, subject];
            return { ...sem, subjects };
          });
          return { semesters };
        });
        get().recalculateMetrics();
      },

      removeSubject: (semesterId, subjectId) => {
        set((state) => {
          const semesters = state.semesters.map((sem) => {
            if (sem.id !== semesterId) return sem;
            return {
              ...sem,
              subjects: sem.subjects.filter((s) => s.id !== subjectId),
            };
          });
          return { semesters };
        });
        get().recalculateMetrics();
      },

      updateAttendance: (semesterId, percent) => {
        set((state) => ({
          semesters: state.semesters.map((sem) =>
            sem.id === semesterId ? { ...sem, attendancePercent: percent } : sem
          ),
        }));
        get().recalculateMetrics();
      },

      recalculateMetrics: () => {
        const state = get();
        const preset = getPresetById(state.activePresetId);
        if (!preset) return;

        let totalCredits = 0;
        let totalWeightedPoints = 0;
        let activeBacklogs: string[] = [];

        const updatedSemesters = state.semesters.map((sem) => {
          // Compute SGPA for this semester
          const result = calculateSgpa(sem.subjects, preset);
          
          // Track earned credits and backlogs
          sem.subjects.forEach((sub) => {
            if (sub.isAudit) return;
            const points = sub.points ?? 0;
            const isPass = points > 0; // standard pass assertion

            if (!isPass) {
              activeBacklogs.push(sub.id);
            } else {
              totalCredits += sub.credits;
              totalWeightedPoints += points * sub.credits;
            }
          });

          return {
            ...sem,
            sgpa: result.sgpa,
            totalCredits: sem.subjects.reduce((sum, s) => sum + (s.isAudit ? 0 : s.credits), 0),
          };
        });

        const cumulativeGpa = totalCredits > 0 ? totalWeightedPoints / totalCredits : 0;
        
        // Evaluate Risk Triggers Deterministically
        const riskTriggers: string[] = [];
        if (activeBacklogs.length > 0) riskTriggers.push(`Active backlogs: ${activeBacklogs.length}`);
        
        const attendanceDetained = updatedSemesters.some(
          (sem) => !sem.isCompleted && sem.attendancePercent < (preset.attendanceFloor ?? 75)
        );
        if (attendanceDetained) riskTriggers.push("Attendance below mandatory floor");

        const riskTier = riskTriggers.length > 1 ? "HIGH" : riskTriggers.length === 1 ? "MEDIUM" : "LOW";

        set({
          semesters: updatedSemesters,
          cumulativeGpa,
          totalEarnedCredits: totalCredits,
          backlogCount: activeBacklogs.length,
          activeBacklogs,
          riskTriggers,
          riskTier,
        });
      },

      triggerSimulation: (active) => set({ simulationActive: active }),
    }),
    { name: "gradeflow_usm_store" }
  )
);
```

---

### 2. Academic Intelligence Layer (Deterministic Calculation Engine)
GradeFlow strictly forbids the scattering of academic logic in components. The `presetEngine.ts` and dynamic regulation system act as a stateless engine to calculate metrics and produce rich, explainable traces.

```typescript
export interface CalculationTrace {
  formulaUsed: string;
  variables: Record<string, number | string>;
  assumptions: string[];
  calculationsStepByStep: string[];
  regulatoryBasis: string;
}

export interface CalculationResult {
  score: number;
  formattedOutput: string;
  trace: CalculationTrace;
}
```

Every conversion follows strict university ordinances loaded on the fly (e.g., SPPU NEP vs SPPU 2019 patterns) and isolates errors locally.

---

### 3. Simulation Engine (Deterministic Sandbox)
The Simulation Engine provides instant, high-trust projections without requiring machine learning models. It runs simple, deterministic checks for two core scenarios:

#### A. The ATKT Progression Survival Calculator
Computes if a student can clear term progression barriers based on strict Boolean rules (e.g., SPPU: Max 4 active backlogs; MIT-WPU: Earned credits $\ge 50\%$ or $CGPA \ge 5.0$).

```typescript
export interface ProgressionStatus {
  promoted: boolean;
  status: "CLEAR" | "ATKT_ELIGIBLE" | "YEAR_DOWN";
  reason: string;
  creditsRequiredForClearance: number;
  backlogsToClearCount: number;
}

export function evaluateProgression(
  totalCreditsOffered: number,
  earnedCredits: number,
  activeBacklogsCount: number,
  currentCgpa: number,
  rules: {
    atktAllowed: boolean;
    maxBacklogsAllowed?: number;
    minCreditPercent?: number;
    minCgpaRequired?: number;
    promotionOperator?: "AND" | "OR";
  }
): ProgressionStatus {
  const creditPercent = (earnedCredits / totalCreditsOffered) * 100;
  const isCgpaOk = currentCgpa >= (rules.minCgpaRequired ?? 0);
  const isCreditsOk = creditPercent >= (rules.minCreditPercent ?? 0);
  const isBacklogsOk = activeBacklogsCount <= (rules.maxBacklogsAllowed ?? 99);

  if (!rules.atktAllowed) {
    if (activeBacklogsCount > 0 || !isCgpaOk) {
      return {
        promoted: false,
        status: "YEAR_DOWN",
        reason: "ATKT is not allowed at this institution. All backlogs must be cleared.",
        creditsRequiredForClearance: totalCreditsOffered - earnedCredits,
        backlogsToClearCount: activeBacklogsCount,
      };
    }
    return { promoted: true, status: "CLEAR", reason: "All requirements met.", creditsRequiredForClearance: 0, backlogsToClearCount: 0 };
  }

  // Handle Multi-Operator rules (e.g., MIT-WPU promotion rules)
  const operator = rules.promotionOperator ?? "AND";
  let metAcademicInvariants = false;
  if (operator === "OR") {
    metAcademicInvariants = isCgpaOk || isCreditsOk;
  } else {
    metAcademicInvariants = isCgpaOk && isCreditsOk;
  }

  if (metAcademicInvariants && isBacklogsOk) {
    return {
      promoted: true,
      status: activeBacklogsCount > 0 ? "ATKT_ELIGIBLE" : "CLEAR",
      reason: activeBacklogsCount > 0 ? "Allowed to Keep Term with pending backlogs." : "Promoted successfully.",
      creditsRequiredForClearance: 0,
      backlogsToClearCount: activeBacklogsCount,
    };
  }

  return {
    promoted: false,
    status: "YEAR_DOWN",
    reason: `Failed progression threshold: CGPA Ok: ${isCgpaOk}, Credits %: ${creditPercent.toFixed(1)}% / ${rules.minCreditPercent}%, Backlogs: ${activeBacklogsCount} / ${rules.maxBacklogsAllowed}`,
    creditsRequiredForClearance: Math.max(0, Math.ceil((rules.minCreditPercent ?? 0) * totalCreditsOffered / 100) - earnedCredits),
    backlogsToClearCount: Math.max(0, activeBacklogsCount - (rules.maxBacklogsAllowed ?? 0)),
  };
}
```

---

### 4. Explainability Infrastructure (The Trust Layer)
Every calculated metric displayed on screen must be paired with an "Inspect Trace" button. This trace renders standard markdown cards detailing:
* **Academic Policy Reference**: Reference to university ordinances (e.g., *Mumbai University Ordinance 6086*).
* **Deterministic Steps**: Line-by-line algebraic evaluation.
* **Mathematical Invariants**: Proving that divide-by-zeros are caught and audit courses are correctly ignored.

```
+-------------------------------------------------------------+
| CGPA Conversion Trace                                    [X] |
+-------------------------------------------------------------+
| Formula: Percentage = 10 * CGPA - 7.5                       |
| Values:  CGPA = 8.35                                        |
| Steps:                                                      |
|   1. Multiply: 10 * 8.35 = 83.5                             |
|   2. Subtract: 83.5 - 7.5 = 76.0%                           |
|                                                             |
| Regulatory Basis: Savitribai Phule Pune University          |
| NEPv2020 Credit Framework Annexure A-II.                    |
+-------------------------------------------------------------+
```

---

### 5. Import/OCR Ingestion Pipeline (Manual + Extractor Loop)
Instead of prematurely using complex AI models, the OCR pipeline uses a **hybrid verification loop**:
1. **Frontend Text Ingestion**: Employs standard local PDF text extractors or optical text scanners (e.g., standard API read or lightweight client-side extraction) to gather raw rows of grades.
2. **Deterministic Regex Matchers**: Maps extracted lines to standard course catalogs (`regex: /([A-Z]{2,4}\s?\d{3,4})\s+([A-D|F|S|O][+-]?)/`).
3. **Manual Validation Grid**: Displays parsed inputs inside an editable spreadsheet-like form for manual correction before committing to the Zustand store, preventing dirty data ingestion.

---

### 6. Relational Database Strategy (Prisma + BCNF schemas)
We implement a highly normalized database schema utilizing PostgreSQL to ensure zero anomalies in prerequisite representations and course assignments.

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String         @id @default(uuid())
  email         String         @unique
  name          String?
  passwordHash  String
  createdAt     DateTime       @default(now())
  studentState  StudentState?
}

model StudentState {
  id               String       @id @default(uuid())
  userId           String       @unique
  user             User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  activePresetId   String
  currentSemIndex  Int          @default(1)
  cumulativeGpa    Float        @default(0.0)
  semesters        Semester[]
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt
}

model Semester {
  id                String       @id @default(uuid())
  studentStateId    String
  studentState      StudentState @relation(fields: [studentStateId], references: [id], onDelete: Cascade)
  semesterIndex     Int
  attendancePercent Float        @default(100.0)
  isCompleted       Boolean      @default(false)
  subjects          Subject[]
  
  @@unique([studentStateId, semesterIndex])
}

model Subject {
  id            String    @id @default(uuid())
  semesterId    String
  semester      Semester  @relation(fields: [semesterId], references: [id], onDelete: Cascade)
  courseCode    String
  name          String
  credits       Int
  grade         String?
  points        Float?
  marksReceived Float?
  isAudit       Boolean   @default(false)
  isBacklog     Boolean   @default(false)
}

// Global Core Catalog mapping prerequisite Directed Acyclic Graphs (DAG)
model CourseCatalog {
  id          String             @id @default(uuid())
  presetId    String
  courseCode  String             @unique
  title       String
  credits     Int
  isAudit     Boolean            @default(false)
  prereqs     CoursePrerequisite[] @relation("CourseToPrereq")
  neededFor   CoursePrerequisite[] @relation("PrereqToCourse")
}

model CoursePrerequisite {
  courseId      String
  prereqId      String
  course        CourseCatalog  @relation("CourseToPrereq", fields: [courseId], references: [id])
  prereq        CourseCatalog  @relation("PrereqToCourse", fields: [prereqId], references: [id])

  @@id([courseId, prereqId])
}
```

---

### 7. Mobile-Readiness & Offline-First Core
* **Tailwind Container System**: Uses full viewport height/width abstractions (`h-[100dvh]`, `w-screen`) to prevent zoom trapping on iOS and Android devices.
* **IndexedDB / Zustand Persistent Hydration**: Syncs Zustand state to local cache immediately, enabling students to log scores offline inside subway/transit tunnels.
* **Tap-to-Search Command Selector**: Optimized selector utilizing screen-anchored overlay sheets for university presets rather than heavy desktop select elements.

---

## Phase B — Growth Infrastructure (Post-Traction Build)

```
                     +---------------------------------------+
                     |    Client PWA Interface (Mobile)      |
                     +-------------------+-------------------+
                                         |
                                         v
                     +-------------------+-------------------+
                     |           BullMQ Event Queue          |
                     |         (Lightweight Redis Logs)      |
                     +-------------------+-------------------+
                                         |
                     +-------------------+-------------------+
                     |       Optimization Engine (glpk.js)   |
                     |      (Unlock Weight Roadmap Planner)  |
                     +-------------------+-------------------+
                                         |
                     +-------------------+-------------------+
                     |       GPT-4o Vision OCR pipeline      |
                     +---------------------------------------+
```

### 1. Optimization & Sequence Engines (Target Planner & Roadmaps)
When students define a career target, the platform calculates academic sequences using two core engines:
1. **GLPK Schedule Solver**: Utilizes a client-side Javascript solver (`glpk.js`) to solve linear programming equations, balancing study load hours against credit caps:
   $$\text{Minimize } \sum c_i \cdot x_i \quad \text{subject to } \sum w_i \cdot x_i \le \text{Max Study Capacity}$$
2. **Greedy Unlock-Weight Planner**: Traverses course prerequisite DAGs using an "unlock-weight" priority metric, ensuring courses unlocking many advanced courses are taken first:
   $$\text{Weight}(C_i) = \text{Credits}(C_i) + \sum_{j \in \text{Unlocked}(C_i)} \text{Credits}(C_j)$$

---

### 2. Advanced OCR Document Parser
* Migrates basic marksheet scanning to a robust backend parsing pipeline.
* Employs **GPT-4o Vision** or dedicated **LayoutLMv3** endpoints to convert structural PDF matrices directly into structured JSON schemas.
* Flags unrecognized fields for immediate manual review by comparing them to local CourseCatalog listings.

---

### 3. Context-Aware AI Advisory Scaffold
* Restricts Large Language Models from computing formulas or proposing prerequisite paths.
* Incorporates a **5W+1H Prompt Scaffold**:
  1. *Who*: Active Student (Credits earned, target CGPA).
  2. *What*: Active Request (e.g. "Can I take Data Structures next term?").
  3. *When*: Temporal State (Active terms left, ATKT parameters).
  4. *Where*: Institution (SPPU, JNTUH rules).
  5. *Why*: Reasoning constraint context from the deterministic engine.
  6. *How*: Clear instructions on path clearance.
* The LLM merely articulates the verified outputs returned by the deterministic state and rules engine.

---

### 4. SaaS Multi-Tenancy
* **Prisma Schema Isolation**: Integrates Row-Level Security (`Tenant` maps to `StudentState`) using shared database pools to optimize hosting costs.
* **Dynamic Preset Builder**: Enables administrators to define custom grading scales via a JSON UI builder, updating the relational database on the fly without deployment cycles.

---

### 5. Event Timeline Systems
* Replaces basic synchronous database hooks with a decoupled event queue using **BullMQ / Redis**.
* Academic updates publish events (e.g., `event: "GRADE_SUBMITTED"`) to lightweight queues, enabling background tasks (alerting, career indexing, target recalculation) to execute concurrently.

---

## Phase C — Research & Scale Systems (Long-Term Evolution)

```
                 +-----------------------------------------------+
                 |             Universal Student Twin            |
                 |      (Neo4j Graph Ontologies / EducOnto)      |
                 +-----------------------+-----------------------+
                                         |
                                         v
                 +-----------------------+-----------------------+
                 |       Neuro-Symbolic Orchestrator (Prolog)    |
                 |     (Zero Hallucination Policy Checker)       |
                 +-----------------------+-----------------------+
                                         |
                 +-----------------------+-----------------------+
                 |          Apache Kafka Distributed Mesh        |
                 +-----------------------+-----------------------+
                                         |
                 +-----------------------+-----------------------+
                 |           SHAP / LIME Analytics Pipeline      |
                 |         (FastAPI Classifier Microservices)    |
                 +-----------------------------------------------+
```

### 1. Neuro-Symbolic Academic Policy Orchestrator
To guarantee absolute regulatory compliance, the orchestrator compiles university catalogs directly into executable **SWI-Prolog rules**.

```prolog
% sppu_rules.pl
% Rule: A student is promoted if they have earned >= 50% credits.
promoted(StudentId) :-
    student_credits(StudentId, Earned),
    required_credits(StudentId, Required),
    Earned >= Required * 0.5.

% Rule: GPA must be above floor.
promoted(StudentId) :-
    student_cgpa(StudentId, CGPA),
    CGPA >= 5.0.
```
* Custom LLM parsers compile raw academic catalog PDFs directly into Prolog rules.
* Backend SWI-Prolog sandboxes evaluate requests against these rules to confirm progression viability, ensuring zero hallucinations.

---

### 2. EducOnto Graph Strategy (Neo4j Ontologies)
* Transitions the relational catalog to a **Neo4j Graph Database**.
* Builds nodes and directional edges reflecting global student ontology structures:
  - `(:Student) -[:COMPLETED {grade: "A"}]-> (:Course)`
  - `(:Course) -[:REQUIRES_PREREQ]-> (:Course)`
  - `(:Course) -[:PROVIDES_SKILL]-> (:Skill)`
  - `(:Skill) -[:REQUIRED_FOR_CAREER]-> (:JobRole)`
* TRAVERSALS provide instant, recursive career pathways and competency gaps checking across huge graphs.

---

### 3. Explainable Early Warning Systems (SHAP/LIME)
* Deploys an isolated **Python FastAPI microservice** to execute machine learning predictions.
* Utilizes **Extra Trees** classifiers trained on historical student cohorts to predict dropout risk.
* Passes predictive models through **SHAP** and **LIME** interpretability wrappers, converting calculated force plots into positive actionable instructions (e.g. *"Reducing assignment delay by 2 days drops failure probability by 24%"*).

---

### 4. Distributed Event Telemetry Mesh
* Integrates **Apache Kafka** to handle millions of real-time events.
* Captures raw telemetry (LMS login taps, attendance updates, assignment completions).
* State handlers consume streams, updating the Neo4j ontology and Zustand stores concurrently.

---

## Architectural Dimension Comparison Matrix

| Dimension | Phase A (MVP Core) | Phase B (Growth Infrastructure) | Phase C (Research & Scale) |
| :--- | :--- | :--- | :--- |
| **Objectives** | Validate user value, achieve absolute mathematical accuracy, support local offline usage. | Expand career optimizations, automate OCR, integrate secure multi-tenancy. | Power infinite-scale telemetry, zero-hallucination neuro-symbolic systems. |
| **Student State** | Zustand store synced with local storage. | Backend DB synchronization, offline PWA cache. | Universal State Machine with real-time Kafka syncing. |
| **Simulations** | Deterministic Boolean progression solvers. | Dynamic multi-fidelity scenario sandboxes. | MDP & Monte Carlo career pathway generators. |
| **Analytics & Risk** | Deterministic rule-based threshold flags. | Next.js API analytics calculations. | SHAP/LIME FastAPI microservices. |
| **AI Context Layer** | SQL-grounded prompt templates. | Vercel AI SDK 5W+1H scaffolds. | SWI-Prolog neuro-symbolic controllers. |
| **OCR Pipeline** | Regex matching + manual correction grid. | GPT-4o Vision or LayoutLMv3 parsers. | Full cross-institutional transfer pipelines. |
| **Event Timeline** | Database audit tables. | BullMQ / Redis lightweight queues. | Apache Kafka event mesh pipelines. |
| **Optimization** | Simple greedy unlock-weight roadmaps. | Client-side `glpk.js` linear programming. | Multi-objective global scheduler. |
| **Mobile-Readiness** | Mobile-first CSS, PWA setup. | Local caching, Service Workers. | Dedicated Native wrappers. |
| **Database Strategy** | PostgreSQL (Prisma) with normalized relations. | Adjacency tables, Prisma multi-tenant RLS. | Hybrid BCNF Postgres + Neo4j EducOnto Graph. |
| **Operational Cost** | **Minimal** ($10-30/mo database hosting). | **Low** ($50-150/mo API + Redis). | **High** ($500+/mo Kafka, Neo4j, Python ML). |
| **Engineering Scope** | **Extremely Lean** (3-4 weeks delivery). | **Balanced** (2-3 months delivery). | **Advanced** (6-12 months enterprise setup). |

---

## Startup Core Philosophy Summary
GradeFlow's technical advantage is **Deterministic Explainable Intelligence**. 
1. By prioritizing **Phase A**, we deploy a stable, audit-grade platform that solves immediate student anxiety with absolute calculation transparency.
2. By planning our schemas to support **Phase B & C** constructs (such as normalized prerequisite relations and strict decoupled stores), we guarantee a friction-free transition when our user base expands.
3. We focus engineering resources on building a product that is **used, trusted, and highly reliable**, scaling complexity alongside user growth.
