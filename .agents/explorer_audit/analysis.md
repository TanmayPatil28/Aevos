# GradeFlow Persistence Architecture Analysis

## 1. Validation of Path (B) Client-State-First Architecture

### Why Path (B) is the Correct Implementation Path for GradeFlow
GradeFlow's technical differentiator is **Deterministic Explainable Intelligence** combined with an interactive student experience (e.g., simulated grade predictions, bunk planning, and real-time intervention checks). 

The local/client-state-first architecture is the optimal implementation path due to:
* **Zero-Latency UI Responsiveness:** Core features (like calculating attendance risk or simulating a target CGPA) must compute instantly. Synchronous write-through transactions to Supabase/PostgreSQL on every keystroke would introduce network latency (100ms+) and overload database connections. 
* **Offline Resilience:** Students frequently check class schedules, attendance, or update grades in low-connectivity areas (e.g., subways, basements, or classrooms). Utilizing Zustand's persistence middleware syncing to `window.localStorage` ensures the app remains fully operational offline.
* **Simulation/Sandbox Isolation:** The student needs to simulate sandbox scenarios (e.g., "What if I get an A in Data Structures?") without writing dirty, unverified data to the persistent database. A client-side store enables side-by-side active and simulated states.
* **Decoupled Sync Queue:** The store tracks mutations offline in `sync.pendingSyncActions` and periodically pushes updates in bulk via `/api/sync` or when internet connection recovers.

### Academic Data Flow & Structure
In `usmStore.ts`, the student's academic profile is managed in a single, comprehensive store slice:
* **Preset Registry Alignment:** `presetId` points to the active grading and regulation framework (e.g., SPPU, VTU).
* **Identity Status:** `identity` tracks the source type (e.g., PDF import, manual entry), verification status, last update date, and confidence level.
* **Academic Profile Metrics:** `academic` contains overall stats like `currentCgpa`, `earnedCredits`, `completedSemesters`, and `activeBacklogsCount`.
* **Standardized Courses & History:** `courses` represents enrolled subjects with CIE/SEE marks, grades, and attendance tracking; `semesterHistory` retains past semester SGPAs and credits.

```
[User Action / OCR Parse]
           │
           ▼
┌──────────────────────────────────────┐
│       Zustand Store (usmStore)       │
│  (Source of Truth / Active State)    │
└──────┬────────────────────────┬──────┘
       │                        │
       │ (Zustand Persist)      │ (Sync Queue / Snapshots POST)
       ▼                        ▼
┌──────────────┐         ┌───────────────────────────────────────┐
│ LocalStorage │         │         Next.js Sync & API            │
└──────────────┘         └──────────────┬────────────────────────┘
                                        │
                                        ▼
                         ┌───────────────────────────────────────┐
                         │   Supabase Postgres (Prisma Schema)   │
                         │ (User, Snapshot, Enrollment, Backlog) │
                         └───────────────────────────────────────┘
```

### Database Persistence Mechanism
Supabase persistence follows a two-tier strategy:
1. **Immutable Snapshot Logging:** When importing new transcripts/marksheets, the data is normalized, validated by the hydration engine, and written to the `AcademicSnapshot` database table as an immutable JSON object. The user's `activeSnapshotId` is updated to point to this latest snapshot.
2. **Batched Action Synchronization:** For manual UI edits (e.g., attendance changes, grade adjustments), actions are queued in the store's `pendingSyncActions` array. The client periodically calls POST `/api/sync` with these actions. The endpoint processes them inside a database transaction to update normalized tables (`enrollments`, `courses`, `calculations`, `attendance_logs`).

---

## 2. Mapping of `stores/usmStore.ts` State and Actions

Below is a detailed map of the current data properties and actions present in `stores/usmStore.ts`:

### State Slices & Properties
| Property Name | TypeScript Type | Description |
| :--- | :--- | :--- |
| `presetId` | `string` | ID of the active university preset (default: `"sppu"`). |
| `activeInstitution` | `"jspm_university_wagholi" \| "rscoe_autonomous_tathawade" \| "sppu_affiliated" \| "unknown"` | String identifying the student's college/institution. |
| `identity` | `AcademicIdentityState` | Metadata detailing profile verification, confidence, source, and registration details. |
| `studentDetails` | `StudentDetails \| null` | Details like student's full name, PRN number, current year, branch, and onboarding status. |
| `academic` | `AcademicState` | Cumulative metrics: `currentCgpa`, `targetCgpa`, completed semesters, earned credits, active backlogs count. |
| `courses` | `CourseState[]` | Standardized courses containing grades, credit counts, internal/external marks, attendance. |
| `semesterHistory` | `SemesterHistoryEntry[]` | Track of completed semesters containing `semester`, `sgpa`, `credits`, `earnedCredits`, and backlog clearance flags. |
| `simulation` | `SimulationState` | List of active simulation scenarios and the currently selected scenario ID. |
| `career` | `CareerState` | Profiles target roles, target package, skills, target companies, WES GPA equivalent, and ECTS band. |
| `sync` | `OfflineSyncState` | Array of pending sync actions waiting to be sent to `/api/sync`. |
| `workspaceUi` | `WorkspaceState` | Selected subject, active panel, targets, and display/sandbox mode preferences. |
| `timetable` | `TimetableState` | Timetable slots organized into day-of-week arrays (`monday` through `sunday`). |
| `attendanceHistory` | `AttendanceHistoryEvent[]` | Chronological log of attendance events (`ATTENDED` / `BUNKED`). |
| `holidays` | `string[]` | Array of holiday date strings (YYYY-MM-DD format). |
| `academicCalendar` | `AcademicEvent[]` | Calendar events and associated sub-tasks. |
| `focus` | `FocusState` | Current focus mode, status, streak, and timer end timestamp. |
| `interventions` | `AcademicIntervention[]` | Array of calculated intervention recommendations. |
| `workspaceContexts` | `WorkspaceContextType[]` | Context tags computed dynamically based on interventions (e.g. `RECOVERY`). |
| `healthScore` | `AcademicHealthScore \| null` | Calculated overall academic wellness and risk scores. |

### Actions & Methods
| Action Signature | Description |
| :--- | :--- |
| `setPresetId(presetId: string)` | Sets active preset ID and queues a `SEMESTER_UPDATE` sync action. |
| `setActiveInstitution(institution)` | Sets the current active institution. |
| `setStudentDetails(details)` | Updates student personal details. |
| `setAcademic(academicUpdates)` | Updates academic state, recalculates interventions, and queues a `SEMESTER_UPDATE` sync action. |
| `setCourses(courses)` | Hydrates store courses, updates verification status to `imported`, and queues a `SEMESTER_UPDATE` sync action. |
| `updateCourse(courseId, updates)` | Modifies properties of a specific course, updates active backlog count dynamically, and queues an `ATTENDANCE_EDIT` sync action. |
| `updateCourseRecoverySemester(courseId, semester)` | Updates target semester to clear a backlog course. |
| `setTimetable(updates)` | Merges updates into the active timetable days. |
| `setAcademicCalendar(events)` | Sets academic calendar events and populates the `holidays` array dynamically for vacation/holiday types. |
| `updateEventSubtasks(eventId, subtasks)` | Updates list of subtasks for a calendar event. |
| `addAttendanceHistoryEvent(event)` | Appends attendance log event and generates unique event ID. |
| `undoAttendanceHistoryEvent(eventId)` | Reverts a bunk/attendance mark by decrementing totals from the course and removes the event from history. |
| `addHoliday(dateStr)` | Adds a date to the holidays array. |
| `removeHoliday(dateStr)` | Removes a date from the holidays array. |
| `addSimulationScenario(scenario)` | Adds scenario to active simulation and publishes `SIMULATION_APPLIED` to the Event Bus. |
| `removeSimulationScenario(scenarioId)` | Removes simulation scenario and publishes `SIMULATION_REMOVED` to the Event Bus. |
| `selectSimulationScenario(scenarioId)` | Focuses a simulation scenario. |
| `updateSimulationScenario(scenarioId, updates)` | Modifies simulation parameters. |
| `clearSimulationScenarios()` | Wipes all simulation scenarios. |
| `setSemesterHistory(history)` | Overwrites semester history. |
| `addSemesterEntry(entry)` | Appends semester record. |
| `setCareer(careerUpdates)` | Merges career profile details. |
| `setTargetCompanies(companies)` | Updates list of companies. |
| `syncParsedResume(parsedData)` | Extracts and merges skills from a parsed resume into the career slice without duplicates. |
| `queueSyncAction(type, payload)` | Appends a sync action to `pendingSyncActions` with a unique ID and timestamp. |
| `clearSyncActions()` | Wipes all sync actions. |
| `removeSyncActions(actionIds)` | Removes specific successfully-synced actions. |
| `resetStore()` | Resets the entire store to initial empty values. |
| `setIdentity(identityUpdates)` | Merges updates into identity metadata. |
| `hydrateFromSnapshot(snapshot)` | Standardizes and merges database snapshot payload into active store state. Recalculates CGPA, completed semesters, backlogs count, and queues a `SEMESTER_UPDATE` sync action. |
| `evaluateInterventions()` | Invokes `InterventionEngine` to generate academic interventions, workspace contexts, and health scores. |
| `setWorkspaceUi(updates)` | Merges workspace display/UI preferences. |
| `openPanel(panel, subjectId?)` | Slides open prediction, strategy, backlog, or intervention panels. |
| `closePanel()` | Closes current drawer panel and clears selection. |
| `setWorkspaceMode(mode)` | Updates workspace mode (e.g. `RECOVERY`, `OPTIMIZATION`). |
| `setWorkspaceDensity(density)` | Toggles display density. |
| `setSandboxMetrics(cgpa, backlogs)` | Configures sandbox variables. |
| `startFocus(durationSeconds)` | Activates pomodoro/focus session. |
| `stopFocus()` | Halts active focus session. |
| `setFocusMode(mode)` | Toggles focus mode between `WORK`, `SHORT_BREAK`, and `LONG_BREAK`. |
| `incrementFocusStreak()` | Increments daily focus count. |
| `resetFocus()` | Resets focus states to defaults. |

---

## 3. Gap Analysis: Missing Types and Fields for Full Sync

To achieve complete alignment with the database schema (`schema.prisma`), `stores/usmStore.ts` needs the following fields, types, and methods added:

### A. Academic Calendar (`AcademicCalendarEvent` in Prisma)
* **Current Store State:** `academicCalendar` uses `AcademicEvent[]`, which includes subtasks, but lacks database mapping fields.
* **Prisma Model:** `AcademicCalendarEvent` has `university`, `description`, `eventType`, `startDate`, `endDate`, `academicYear`, and `semester`.
* **Needed Fields & Types:**
  ```typescript
  export interface AcademicCalendarEventState {
    id: string;
    university: string;        // Map to presetId/university
    title: string;             // Map to store 'name'
    description?: string;
    eventType: string;         // Map to store 'type'
    startDate: string;         // ISO String representation of DateTime
    endDate: string;           // ISO String representation of DateTime
    academicYear: string;
    semester?: string;
  }
  ```
* **Required Actions:**
  * `addAcademicCalendarEvent: (event: AcademicCalendarEventState) => void`
  * `removeAcademicCalendarEvent: (eventId: string) => void`

### B. Timetable (`TimetableSlot` in Prisma)
* **Current Store State:** `timetable` is structured as `TimetableState` with keys for each day containing `TimetableEntry[]`.
* **Prisma Model:** `TimetableSlot` represents slots flatly with a `dayOfWeek` integer (e.g., 1 for Monday, 7 for Sunday). It also contains `instructor`, `section`, `semester`, and `academicYear`.
* **Needed Fields & Types:**
  To support seamless roundtrips, the store should map the dayOfWeek integer to weekday keys, or include these properties in the `TimetableEntry` interface:
  ```typescript
  export interface TimetableEntry {
    id: string;
    courseId: string;
    type: "LECTURE" | "PRACTICAL" | "LAB" | "TUTORIAL";
    startTime: string; // e.g. "09:00"
    endTime: string;   // e.g. "10:00"
    room: string;
    batch?: string;    // Maps to 'section' in Prisma
    faculty?: string;  // Maps to 'instructor' in Prisma
    semester: string;  // Semester index string (missing in current interface)
    academicYear: string; // Academic year string (missing in current interface)
    dayOfWeek: number;    // 1-7 integer mapping (missing in current interface)
  }
  ```
* **Required Actions:**
  * `addTimetableSlot: (slot: Omit<TimetableEntry, "id">) => void`
  * `removeTimetableSlot: (slotId: string) => void`

### C. Backlogs & Backlog Recovery Plans (`BacklogRecord` in Prisma)
* **Current Store State:** Lacks a dedicated slice or state representation for backlog records. Currently relies on looking up courses with grades of "F" dynamically.
* **Prisma Model:** `BacklogRecord` tracks status (`BacklogStatus`), attempts, exam dates, and a `recoveryPathway` plan description.
* **Needed Fields & Types:**
  ```typescript
  export type BacklogStatus = "PENDING" | "REGISTERED" | "EXAM_SCHEDULED" | "CLEARED" | "VOIDED";

  export interface BacklogRecord {
    id: string;
    courseId: string;
    originalSemester: string;
    originalGrade: string;
    status: BacklogStatus;
    attemptsCount: number;
    nextExamDate?: string;      // ISO Date string mapping to DateTime
    recoveryPathway?: string;   // Description of recovery pathway/plan
  }
  ```
* **Store State Expansion:**
  Add `backlogRecords: BacklogRecord[]` to `USMStoreState`.
* **Required Actions:**
  * `setBacklogRecords: (records: BacklogRecord[]) => void`
  * `addBacklogRecord: (record: Omit<BacklogRecord, "id">) => void`
  * `updateBacklogRecord: (id: string, updates: Partial<BacklogRecord>) => void`
  * `removeBacklogRecord: (id: string) => void`

---

## 4. Code Inspection: Snapshot Processing Engines

GradeFlow implements a precise three-stage ingestion process to handle transcript parsing, import evaluation, and database-to-store hydration.

```
[Raw OCR/JSON Data]
        │
        ▼
┌───────────────────────────────┐
│   normalizationEngine.ts      │ ──► Standardizes raw data to AcademicProfile
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│       diffEngine.ts           │ ──► Compares profiles, detects changes/conflicts
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│     hydrationEngine.ts        │ ──► Validates structure before loading to Store
└───────────────────────────────┘
```

### A. Normalization Engine (`lib/ingestion/normalizationEngine.ts`)
* **Objective:** Transforms raw parsed data from various university portals or OCR engines (represented as `IntermediateExtractionModel`) into GradeFlow’s strict canonical `AcademicProfile`.
* **Step-by-Step Execution:**
  1. **Sort Semesters:** Sorts raw semesters chronologically by `semesterIndex`.
  2. **Compile Semester History:** Iterates through each semester. If an SGPA is present, it increments `completedSemesters`, calculates the weighted grade point sum (`sgpa * semester_credits`), adds to cumulative `earnedCredits`, and pushes a clean record to the `semesterHistory` array.
  3. **Process Courses:** Maps all courses within each semester. Checks if the grade matches a backlog grade (e.g., `["F", "FF", "FAIL", "ABSENT", "AB", "NP"]`), incrementing `activeBacklogsCount`. It generates a unique UUID for each course, resets attendance statistics to `0`, and retains CIE/SEE marks.
  4. **Calculate CGPA:** Computes the overall cumulative GPA (`totalPoints / totalCredits`) rounded to two decimal places.
  5. **Construct Academic Profile:** Packages the standard object, filling in student details, regulation year, and institution keys.

### B. Diff Engine (`lib/ingestion/diffEngine.ts`)
* **Objective:** Compares an incoming `AcademicProfile` with the existing store profile to prevent duplicate imports, flag grade or SGPA conflicts, and track resolved backlogs.
* **Step-by-Step Execution:**
  1. **Empty State Handshake:** If the active profile is empty, it marks all semesters as new and approves the incoming data without diffing.
  2. **Structural Hash Check:** Compares the structural cryptographic hashes (`generateStructuralHash`) of both profiles. If they match and the student identity is the same, it marks the import as a duplicate (`isDuplicate: true`).
  3. **Semester Validation:** Compares semester indices. If a semester does not exist in the active profile, it is flagged as a new addition. If it exists but the SGPA differs by more than `0.01`, an SGPA change conflict warning is issued.
  4. **Course Grade Diffing:** Matches courses by code. If a grade has updated, it flags the course as updated. If the active profile grade was a fail/backlog grade and the incoming grade is a passing grade, it classifies the event as `backlogsResolved`. Other grade changes trigger informational warnings.
  5. **Merge Execution (`mergeProfiles`):** Merges the profiles by overwriting course records while preserving existing attendance counts (`attendanceTotal` and `attendanceBunked`) to prevent losing local tracking records. Recalculates the final CGPA and completed semesters based on the combined history.

### C. Hydration Engine (`lib/academic-intelligence/hydration/hydrationEngine.ts`)
* **Objective:** Validates and normalizes raw JSON payloads coming from database snapshots before they are loaded into the store, protecting the client-side state from corruption.
* **Step-by-Step Execution:**
  1. **Root Validator:** Ensures the payload is a valid non-null object.
  2. **Metadata Verification:** Enforces presence of institution and presetId string properties.
  3. **Academic Block Validation:** Validates `currentCgpa` and `completedSemesters` values.
  4. **Course Array Parsing:** Enforces type safety on courses. Guarantees that every item has an `id`, `code`, `name`, and `credits` (as a number). Normalizes missing attendance or internal marks values to `0`.
  5. **Semester History Parsing:** Loops through and validates chronological records (ensuring semester indexes and SGPAs are numbers) and returns a clean, safely structured `AcademicProfile` object.
