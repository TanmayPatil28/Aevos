# Mock-Data Forensic Census Report

This report presents a complete census of every component within the Aevos codebase displaying simulated, hardcoded, or `setTimeout`-faked data.

---

## Part 1: Initial Target Components

### 1. components/os/identity/github/EngineeringSignals.tsx
* **Exact lines of code:**
  * Lines 7–48 (Local `signals` array definition):
    ```tsx
    const signals = [
      {
        id: "auth",
        name: "Authentication",
        description: "Implemented JWT/OAuth in 2 projects",
        icon: <Lock className="w-4 h-4 text-indigo-400" />,
        color: "border-indigo-500/20 bg-indigo-500/10",
        active: true,
      },
      {
        id: "api",
        name: "REST APIs",
        description: "Designed 3 custom backend APIs",
        icon: <Server className="w-4 h-4 text-blue-400" />,
        color: "border-blue-500/20 bg-blue-500/10",
        active: true,
      },
      {
        id: "db",
        name: "Database Design",
        description: "Relational schema in 'E-commerce API'",
        icon: <Database className="w-4 h-4 text-emerald-400" />,
        color: "border-emerald-500/20 bg-emerald-500/10",
        active: true,
      },
      {
        id: "test",
        name: "Testing",
        description: "No Jest/PyTest setups detected",
        icon: <TestTube className="w-4 h-4 text-slate-400" />,
        color: "border-slate-800 bg-slate-900/50",
        active: false,
      },
      {
        id: "opt",
        name: "Optimization",
        description: "Missing caching or performance tuning",
        icon: <Zap className="w-4 h-4 text-slate-400" />,
        color: "border-slate-800 bg-slate-900/50",
        active: false,
      },
    ];
    ```
  * Lines 87–89 (Static verdict string):
    ```tsx
    "This profile demonstrates intermediate production engineering capability."
    ```
* **What data/action it simulates:** Recruiter signals regarding database design, authentication implementation, REST APIs designed, and testing/optimization flags, plus a static "System Verdict" message.
* **What real database model or API source could replace it:** User skills and project descriptions in the `CareerProfile` model (e.g. `career_profiles.projects` and `career_profiles.skills`) or the Github Integration API parsing and extracting metadata from the candidate's actual repositories.

---

### 2. components/os/identity/github/RepoCredibilityMeter.tsx
* **Exact lines of code:**
  * Line 7 (Static audit score):
    ```tsx
    const auditScore = 84;
    ```
  * Lines 27–73 (Hardcoded metrics for Documentation Depth, Deployment Links, Modular Architecture, and the tutorial clone alert):
    ```tsx
    {/* Metric 1 */}
    <div>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-slate-300 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Documentation Depth
        </span>
        <span className="text-emerald-400 font-bold">Excellent</span>
      </div>
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full" style={{ width: "90%" }} />
      </div>
    </div>

    {/* Metric 2 */}
    <div>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-slate-300 font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" /> Deployment Links
        </span>
        <span className="text-amber-400 font-bold">Missing in 2 Repos</span>
      </div>
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-amber-500 rounded-full" style={{ width: "60%" }} />
      </div>
    </div>

    {/* Metric 3 */}
    <div>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-slate-300 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Modular Architecture
        </span>
        <span className="text-emerald-400 font-bold">Strong</span>
      </div>
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full" style={{ width: "85%" }} />
      </div>
    </div>
    
    <div className="mt-6 pt-4 border-t border-slate-800">
       <h4 className="text-sm font-semibold text-white mb-2">Tutorial Project Detector</h4>
       <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 flex items-start gap-3">
         <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
         <div>
           <p className="text-sm font-medium text-slate-300 line-clamp-1">react-todo-app-clone</p>
           <p className="text-xs text-slate-500 mt-1">High probability of being a tutorial clone. Lacks originality. Suggestion: Add a backend database or authentication to increase credibility.</p>
         </div>
       </div>
    </div>
    ```
* **What data/action it simulates:** GitHub repository audit metrics and alert warning for a mock tutorial clone project named `react-todo-app-clone`.
* **What real database model or API source could replace it:** Dynamic analysis performed via the GitHub API and LLM analysis, stored in the `CareerProfile` database model (e.g., `career_profiles.detailedAudit` JSON or a custom `RepoAudit` schema linked to `User`).

---

### 3. components/os/identity/linkedin/ProfileSimulator.tsx
* **Exact lines of code:**
  * Lines 25–28 (`setTimeout` delay handler):
    ```tsx
    setTimeout(() => {
      setIsSimulating(false);
      setSimulationComplete(true);
    }, 2000);
    ```
  * Lines 47–75 (Hardcoded audit findings and verdicts):
    ```tsx
    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex gap-4">
      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
      <div>
        <h4 className="text-sm font-semibold text-emerald-300">Strong technical depth detected</h4>
        <p className="text-xs text-slate-400 mt-1">Your headline strongly signals your tech stack within the first 3 seconds of reading.</p>
      </div>
    </div>

    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-4">
      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
      <div>
        <h4 className="text-sm font-semibold text-amber-300">Looks tutorial-based</h4>
        <p className="text-xs text-slate-400 mt-1">The project "To-Do App" implies a beginner level. We recommend replacing this with a data-driven project.</p>
      </div>
    </div>

    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex gap-4">
      <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
      <div>
        <h4 className="text-sm font-semibold text-rose-300">Missing measurable impact</h4>
        <p className="text-xs text-slate-400 mt-1">Recruiters scan for numbers (e.g., "reduced load time by 40%"). Your descriptions currently lack metrics.</p>
      </div>
    </div>
    
    <div className="mt-6 p-4 border border-indigo-500/20 bg-indigo-500/5 rounded-xl text-center">
      <p className="text-sm text-indigo-300 font-medium">Simulation Verdict</p>
      <h3 className="text-2xl font-black text-white mt-1">"Good Projects, Weak Branding"</h3>
      <p className="text-xs text-slate-400 mt-2">Adjust your 'About' section to shift from a student tone to an engineer tone.</p>
    </div>
    ```
* **What data/action it simulates:** Recruiter Linkedin profile scan feedback, eye-tracking patterns, and keyword density feedback.
* **What real database model or API source could replace it:** LLM-powered review of the candidate's profile/resume, retrieved from the `CareerProfile` model (`career_profiles.detailedAudit`, `career_profiles.atsScore`) or via a custom backend endpoint using Gemini to evaluate the active resume text.

---

### 4. components/os/identity/SkillGapAnalyzer.tsx
* **Exact lines of code:**
  * Line 7 (Static match percentage):
    ```tsx
    const matchPercentage = 42;
    ```
  * Lines 51–90 (Acquired and missing skills mapping):
    ```tsx
    {/* Acquired Skills */}
    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
      <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4" /> Strong Signals
      </h4>
      <div className="flex flex-wrap gap-2">
        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-300 text-xs rounded-md border border-emerald-500/20">Python</span>
        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-300 text-xs rounded-md border border-emerald-500/20">Data Structures</span>
        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-300 text-xs rounded-md border border-emerald-500/20">TensorFlow Basics</span>
      </div>
    </div>

    {/* Missing Signals */}
    <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4">
      <h4 className="text-sm font-semibold text-rose-400 mb-3 flex items-center gap-2">
        <AlertCircle className="w-4 h-4" /> Missing Signals
      </h4>
      <div className="space-y-3">
        <div className="flex items-start gap-3 group cursor-pointer">
          <div className="w-6 h-6 rounded bg-rose-500/10 flex items-center justify-center shrink-0 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">Cloud Deployment</div>
            <div className="text-xs text-slate-500">Deploy at least 1 ML model to AWS or GCP.</div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
        </div>
        
        <div className="flex items-start gap-3 group cursor-pointer">
          <div className="w-6 h-6 rounded bg-rose-500/10 flex items-center justify-center shrink-0 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">End-to-End Pipeline</div>
            <div className="text-xs text-slate-500">Your GitHub lacks data processing pipelines.</div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
        </div>
      </div>
    </div>
    ```
* **What data/action it simulates:** Role readiness match percentage, acquired signals, and missing skills gap list for target role "AI Engineering Intern".
* **What real database model or API source could replace it:** Computed against the user's acquired skills (`SkillProgress` and `MilestoneProgress` models) vs. target roles defined in the `DynamicRoadmap` schema or job requirements using Gemini.

---

### 5. components/os/identity/CareerIdentityGraph.tsx
* **Exact lines of code:**
  * Lines 21–48 (Simulated radar graph nodes and labels "AI Depth", "Core Tech", "Systems", and the connecting SVG polygon points):
    ```tsx
    {/* Nodes */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group">
      <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-[0_0_15px_rgba(99,102,241,0.5)]">
        <BrainCircuit className="w-5 h-5" />
      </div>
      <span className="text-[10px] uppercase font-bold text-slate-400 mt-2">AI Depth</span>
    </div>

    <div className="absolute bottom-4 right-4 flex flex-col items-center group">
      <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-[0_0_15px_rgba(16,185,129,0.5)]">
        <Code2 className="w-5 h-5" />
      </div>
      <span className="text-[10px] uppercase font-bold text-slate-400 mt-2">Core Tech</span>
    </div>

    <div className="absolute bottom-4 left-4 flex flex-col items-center group">
      <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-[0_0_15px_rgba(244,63,94,0.5)]">
        <Cpu className="w-5 h-5" />
      </div>
      <span className="text-[10px] uppercase font-bold text-slate-400 mt-2">Systems</span>
    </div>

    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
    
    {/* Connecting lines SVG simulation */}
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
      <polygon points="50,15 85,85 15,85" fill="rgba(99, 102, 241, 0.15)" stroke="rgba(99, 102, 241, 0.5)" strokeWidth="1" />
    </svg>
    ```
  * Lines 58–86 (Hardcoded positioning text, strongest signal, and recommended growth):
    ```tsx
    AI/ML Engineering Student focused on Computer Vision
    ...
    Based on your recent projects and academic trajectory, you are strongest in AI concepts and backend architecture. Your profile indicates high readiness for AI-focused engineering roles.
    ...
    {/* Strongest Signal */}
    High consistency in model training epochs and Python data engineering.
    ...
    {/* Recommended Growth */}
    Add 1 more Full Stack deployment to balance your AI backend.
    ```
* **What data/action it simulates:** Radar chart visualization and corresponding career trajectory insights.
* **What real database model or API source could replace it:** Derived from the user's `CareerProfile` fields (`career_profiles.atsScore`, `career_profiles.actionPlan`), enrolled courses (`Enrollment` / `Course` database records), and completed roadmap milestones (`SkillProgress`).

---

### 6. components/os/records/UploadZone.tsx
* **Exact lines of code:**
  * Lines 12–18 (`handleFileSelect` mock file parser delay):
    ```tsx
    const handleFileSelect = () => {
      onUploadStart();
      // Simulate network parsing delay
      setTimeout(() => {
        onUploadComplete();
      }, 2000);
    };
    ```
* **What data/action it simulates:** Processing time for parser to extract academic data from a PDF file.
* **What real database model or API source could replace it:** A backend API endpoint (e.g., `POST /api/academic/upload`) parsing PDF text directly, saving file info in the `Document` model, and registering a new `AcademicSnapshot` model.

---

### 7. components/os/records/ReviewImport.tsx
* **Exact lines of code:**
  * Lines 27–32 (Mock course list added to the Zustand store):
    ```tsx
    setTermCourses(newTermId, [
      { id: `c_${Date.now()}_1`, termId: newTermId, code: "CS201", name: "Data Structures", credits: 4, grade: "A", gradePoints: 8 },
      { id: `c_${Date.now()}_2`, termId: newTermId, code: "CS202", name: "Algorithms", credits: 4, grade: "B+", gradePoints: 7 },
      { id: `c_${Date.now()}_3`, termId: newTermId, code: "MA201", name: "Linear Algebra", credits: 3, grade: "O", gradePoints: 10 },
      { id: `c_${Date.now()}_4`, termId: newTermId, code: "CS203", name: "Computer Networks", credits: 3, grade: "B", gradePoints: 6 },
    ]);
    ```
  * Lines 66–90 (Hardcoded JSX rows of the courses table matching the same mock courses).
* **What data/action it simulates:** Course details extracted from PDF markup to be confirmed by the student.
* **What real database model or API source could replace it:** Renders a parsed JSON representation of the uploaded transcript (retrieved from `AcademicSnapshot.academicProfile`) and saves them as courses under `Enrollment` / `Course` database tables.

---

### 8. components/ai/JarvisResumeModal.tsx
* **Exact lines of code:**
  * Lines 21–29 (Hardcoded fallback for missing detailed audits):
    ```tsx
    return (
      <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white p-12 text-black max-w-2xl text-center rounded-lg relative">
          <button onClick={closeResume} className="absolute top-4 right-4"><X size={24} /></button>
          <AlertTriangle className="mx-auto text-yellow-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold mb-2">Legacy Report Format</h2>
          <p>Please re-upload your resume to generate the new 8-Phase Detailed Audit.</p>
        </div>
      </div>
    );
    ```
  * Line 36 (`setTimeout` to reset copy state):
    ```tsx
    setTimeout(() => setCopied(false), 2000);
    ```
* **What data/action it simulates:** Legacy layout fallback panel warning when `detailedAudit` JSON structure is missing, and the copy-to-clipboard state indicator timeout.
* **What real database model or API source could replace it:** Verify audit structures using fields in the `CareerProfile` model (`career_profiles.detailedAudit`), and run automated extraction in the background if the fields are empty or mismatched.

---

### 9. components/attendance/AssignmentIntelligence.tsx
* **Exact lines of code:**
  * Lines 8–33 (Local `mockAssignments` definition):
    ```tsx
    const mockAssignments = [
      {
        id: "a1",
        title: "DBMS Mini Project Phase 1",
        subject: "DBMS Lab",
        dueDate: "Tomorrow",
        impact: "-0.18 SGPA",
        priority: "CRITICAL",
      },
      {
        id: "a2",
        title: "CN Lab Manual Submission",
        subject: "CN Lab",
        dueDate: "In 3 Days",
        impact: "-4 Internal Marks",
        priority: "HIGH",
      },
      {
        id: "a3",
        title: "OS Assignment 2",
        subject: "OS Theory",
        dueDate: "Next Week",
        impact: "-2 Internal Marks",
        priority: "MEDIUM",
      }
    ];
    ```
* **What data/action it simulates:** Upcoming school assignments, their priority levels, due dates, and projected impact on internal grades/SGPA.
* **What real database model or API source could replace it:** A dedicated `Assignment` or `Task` model related to active user enrollments (`Enrollment` / `Course` models), or synced via external school portal integration APIs (e.g. Moodle, Greenhouse, Canvas).

---

### 10. components/backlog/deep-dive/StudySquadWidget.tsx
* **Exact lines of code:**
  * Lines 16–19 (Mock messages state):
    ```tsx
    const [messages, setMessages] = useState<Message[]>([
      { id: "1", sender: "U1", text: "Does anyone know if the third module is heavily weighted?", isSelf: false, color: "#FF9F0A" },
      { id: "2", sender: "U2", text: "Yes, check the historical analytics widget. It's usually 30% of the paper.", isSelf: false, color: "#30D158" },
    ]);
    ```
  * Line 24 (Random number generator simulating online peers):
    ```tsx
    const activePeers = Math.floor(Math.random() * 15) + 3; 
    ```
  * Lines 26–40 (Simulated file download progress with `setInterval` interval ticks):
    ```tsx
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setDownloadProgress(prev => ({ ...prev, [unit]: progress }));
    }, 200);
    ```
  * Lines 57–70 (Faked chat response typing state delay and hardcoded response injection):
    ```tsx
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          sender: "U3",
          text: "Yeah I agree with that. The PYQs are a lifesaver.",
          isSelf: false,
          color: "#BF5AF2"
        }]);
      }, 2500);
    }, 1000);
    ```
  * Lines 143–177 (Hardcoded list of Master Notes PDF units, download file sizes, and academic scholar status).
* **What data/action it simulates:** Peer-to-peer classroom chat interaction, online student presence count, Shared Notes PDF list, notes file download speed, and simulated chat buddy auto-replies.
* **What real database model or API source could replace it:**
  - Real-time communication messaging database model (e.g. `Message` or `ChatRoom` records) managed using WebSockets or Pusher.
  - Active peer metrics calculated by querying other student profiles currently in `Enrollment` with the same `courseId`.
  - Notes file directory queried from user uploads in the `Document` schema filtered by tags referencing the active course.

---

### 11. components/backlog/deep-dive/GraceMarksPredictorWidget.tsx
* **Exact lines of code:**
  * Line 9 (Mock submission tracker):
    ```tsx
    const [applied, setApplied] = useState(false);
    ```
  * Lines 12–14 (State updater for submission):
    ```tsx
    const handleApply = () => {
      setApplied(true);
    };
    ```
  * Lines 77–101 (Hardcoded University Ordinance Rulebook details extract, "Ordinance 0.229"):
    ```tsx
    <h4 className="text-white font-semibold text-[17px]">Ordinance 0.229</h4>
    ...
    A candidate who fails in one or more subjects by a margin of not more than 1%...
    ...
    The maximum grace marks allowable under this ordinance is strictly capped at 3 marks per subject...
    ```
* **What data/action it simulates:** Sending a grace mark validation request to the university exam cell.
* **What real database model or API source could replace it:**
  - Web service integration with the university's official student portal.
  - Creating a record in a new `ExamCellApplication` or `BacklogRequest` table linked to the `User` and `BacklogRecord` models.
  - Pushing the rules metadata to database records in the `ATKTRule` model.

---

### 12. components/backlog/RevaluationEngineWidget.tsx
* **Exact lines of code:**
  * Lines 34–40 (`handlePay` sets simulated payment gateway status with a 2000ms delay):
    ```tsx
    const handlePay = () => {
      setProcessing(true);
      setTimeout(() => {
        setProcessing(false);
        setPaymentDone(true);
      }, 2000);
    };
    ```
* **What data/action it simulates:** Payment processing transaction for revaluation registration fees and communication to the college exam cell.
* **What real database model or API source could replace it:**
  - Integration with a real payment gateway (Razorpay, Stripe) webhook / API.
  - Backend API endpoint `/api/backlog/revaluation` that creates a record in a `RevaluationRequest` table or updates the `BacklogRecord` status to `REVALUATION_REQUESTED` in the database.

---

### 13. components/backlog/UnifiedSimulator.tsx
* **Exact lines of code:**
  * Lines 43–50 (`executeSave` simulator with a 1500ms timeout delay):
    ```tsx
    const executeSave = () => {
      setIsSaving(true);
      setTimeout(() => {
        onSave(plan);
        setIsSaving(false);
        setIsSaved(true);
      }, 1500);
    };
    ```
* **What data/action it simulates:** Network transmission latency when updating the active recovery plan in the profile database.
* **What real database model or API source could replace it:** A POST request calling a real API endpoint (`POST /api/backlog/timeline` or a prisma server action writing directly to the `Plan` model).

---

### 14. components/backlog/ResourceMatcherWidget.tsx
* **Exact lines of code:**
  * Line 39 ("Neso Academy (42 videos)") and Line 57 ("Last 5 Semesters (Solved)").
  * Lines 73–77 (Static Unsplash video thumbnail image):
    ```tsx
    src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80"
    ```
  * Lines 87–94 (Hardcoded list of playlist videos and duration parameters):
    ```tsx
    <p className="text-[15px] text-white">Up Next: Complex Variables (15:20)</p>
    ...
    <p className="text-[15px] text-[#8E8E93]">Lecture 3: Theorems (22:10)</p>
    ```
  * Lines 110–111 (Hardcoded file naming, size, and page counts):
    ```tsx
    {targetCourse.code}_Solved_Papers.pdf
    12.5 MB • 45 Pages
    ```
* **What data/action it simulates:** Reference textbooks, resolved question banks, and learning playlist videos associated with the target backlog course code.
* **What real database model or API source could replace it:**
  - YouTube search/fetch API or a curated `CourseResource` database table containing resources per `Course`.
  - Solved PDF files stored in the `Document` model or a specific `StudyResource` model linked to the `Course` model.

---

### 15. components/os/inspector/RoadmapNodeContent.tsx
* **Exact lines of code:**
  * Line 9 (Zustand bypass tracking state):
    ```tsx
    const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({});
    ```
  * Lines 15–24 (Simulation comments and handlers bypass):
    ```tsx
    // In a real implementation, we would fetch the user's progress for this node via API
    // For MVP v1 without a working DB connection, we'll use local state to simulate.
    
    const toggleMilestone = async (milestoneId: string) => {
      const isCompleted = !completedMilestones[milestoneId];
      setCompletedMilestones(prev => ({ ...prev, [milestoneId]: isCompleted }));

      // Mock API call since DB is down
      // await fetch('/api/career/progress', ...
    ```
* **What data/action it simulates:** Completing target roadmap node sub-milestones checklist and syncing status to database.
* **What real database model or API source could replace it:** Call `/api/career/progress` to write milestone status to `MilestoneProgress` and `SkillProgress` models.

---

### 16. components/backlog/PlacementScannerWidget.tsx
* **Exact lines of code:**
  * Lines 71–117 (Hardcoded criteria details for Google and TCS Digital):
    ```tsx
    <h4 className="text-[17px] font-semibold text-white tracking-tight">Google</h4>
    ...
    <span className="text-[#8E8E93]">Max Active Backlogs</span>
    <span className="font-semibold text-white">0</span>
    ...
    <span className="text-[#8E8E93]">Min CGPA</span>
    <span className="font-semibold text-white">8.0</span>
    ...
    <h4 className="text-[17px] font-semibold text-white tracking-tight">TCS Digital</h4>
    ...
    <span className="text-[#8E8E93]">Max Active Backlogs</span>
    <span className="font-semibold text-[#FF453A]">1</span>
    ...
    <span className="text-[#8E8E93]">Min CGPA</span>
    <span className="font-semibold text-white">7.0</span>
    ```
* **What data/action it simulates:** Recruitment rules, CGPA thresholds, and maximum backlog policies for Google and TCS Digital.
* **What real database model or API source could replace it:** Querying database tables matching recruiter criteria (e.g. `Company` or `DreamCompany` model and a related `PlacementPolicy` schema).

---

## Part 2: Additional Discovered Components

### 17. components/os/records/RecordsCanvas.tsx
* **Exact lines of code:**
  * Lines 161–186 (Hardcoded list of past imports):
    ```tsx
    {/* Mock History Item */}
    <div className="p-4 flex items-center justify-between group hover:bg-slate-800/30 transition-colors">
      ...
      <div className="text-slate-200 font-medium">Semester 2 Result.pdf</div>
      <div className="text-xs text-slate-500">Imported on May 12, 2026 • 6 Courses</div>
      ...
    </div>
    {/* Mock History Item 2 */}
    <div className="p-4 flex items-center justify-between group hover:bg-slate-800/30 transition-colors">
      ...
      <div className="text-slate-200 font-medium">Semester 1 Result.pdf</div>
      <div className="text-xs text-slate-500">Imported on Dec 10, 2025 • 5 Courses</div>
      ...
    </div>
    ```
* **What data/action it simulates:** Past imports log showing imported PDFs names, dates, course counts, and validation checks.
* **What real database model or API source could replace it:** Querying the `Document` and `AcademicSnapshot` models (using Prisma to fetch user's snapshots: `prisma.academicSnapshot.findMany({ where: { userId } })`).

---

### 18. components/placement/CompanyDeepDivePanel.tsx
* **Exact lines of code:**
  * Lines 90–105 (Mock Average CTC and Recruitment parameters):
    ```tsx
    {/* Mock Historical Data */}
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
        <TrendingUp size={14} /> Historical Data (Mock)
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-1">Avg CTC</div>
          <div className="text-xl font-bold text-white">12.5 LPA</div>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-1">Recruitment</div>
          <div className="text-xl font-bold text-white">On-Campus</div>
        </div>
      </div>
    </div>
    ```
  * Lines 107–129 (Mock Selection Process rounds):
    ```tsx
    {/* Selection Process */}
    <div className="space-y-4 pb-12">
      <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
        <Users size={14} /> Selection Process (Mock)
      </h3>
      <div className="relative pl-6 border-l border-white/20 space-y-6">
        <div className="relative">
          <div className="absolute -left-[29px] top-1 w-3 h-3 bg-black border-2 border-white/20 rounded-full" />
          <h4 className="text-sm font-bold text-white">Round 1: Online Assessment</h4>
          <p className="text-xs text-white/50 mt-1">Aptitude, Core CS subjects, 2 DSA questions.</p>
        </div>
        <div className="relative">
          <div className="absolute -left-[29px] top-1 w-3 h-3 bg-black border-2 border-white/20 rounded-full" />
          <h4 className="text-sm font-bold text-white">Round 2: Technical Interview</h4>
          <p className="text-xs text-white/50 mt-1">System Design and deep dive into your projects.</p>
        </div>
        <div className="relative">
          <div className="absolute -left-[29px] top-1 w-3 h-3 bg-black border-2 border-white/20 rounded-full" />
          <h4 className="text-sm font-bold text-white">Round 3: HR / Cultural Fit</h4>
          <p className="text-xs text-white/50 mt-1">Standard HR questions and situational judgment.</p>
        </div>
      </div>
    </div>
    ```
* **What data/action it simulates:** Recruiter CTC packages, selection rounds details, and target job parameters.
* **What real database model or API source could replace it:** Can be fetched from a `Company` or `JobPosting` table in the database, containing fields for `avgCtc`, `recruitmentType`, and `selectionProcess` (a JSON object storing rounds information).

---

### 19. components/placement/TopperBenchmark.tsx
* **Exact lines of code:**
  * Lines 12–15 (Mock percentile calculator ranges):
    ```tsx
    // Mock Percentile Calculation
    const cgpaPercentile = userCgpa >= 9.5 ? 1 : userCgpa >= 9.0 ? 5 : userCgpa >= 8.5 ? 12 : userCgpa >= 8.0 ? 25 : userCgpa >= 7.0 ? 45 : 70;
    const skillsPercentile = userSkillsCount >= 10 ? 1 : userSkillsCount >= 8 ? 8 : userSkillsCount >= 5 ? 22 : userSkillsCount >= 3 ? 45 : 80;
    const overallPercentile = Math.round((cgpaPercentile + skillsPercentile) / 2);
    ```
* **What data/action it simulates:** Class rank percentiles compared to other student peers.
* **What real database model or API source could replace it:** Run SQL aggregations comparing the user's CGPA and skills list count against all user profiles (`User`, `Calculation`, `CareerProfile`) within the same branch and university.

---

### 20. components/planner/ScenarioSimulator.tsx
* **Exact lines of code:**
  * Lines 16–45 (Static GPA/internals stress scenarios array):
    ```tsx
    const SCENARIOS: Scenario[] = [
      {
        id: "fail_one",
        title: "What if I fail one subject?",
        description: "Simulates the impact of an active backlog on your recovery and GPA trend.",
        impactType: "negative",
        icon: <AlertTriangle size={18} />
      },
      {
        id: "attendance_drop",
        title: "What if attendance drops?",
        description: "Assume missing 2 weeks of classes, reducing internal marking buffer.",
        impactType: "negative",
        icon: <TrendingUp size={18} />
      },
      ...
    ```
* **What data/action it simulates:** Preview of what GPA/placement rules might get impacted if a scenario occurs (displays only static text strings without performing real math).
* **What real database model or API source could replace it:** An interactive calculation simulator that takes the scenario parameters, updates the local list of courses / grades, and calls the GPA forecasting logic to output real recalculated requirements.

---

### 21. components/LandingInteractives.tsx
* **Exact lines of code:**
  * Lines 9–30 (`SidebarMockup` and `TopbarMockup` structures).
  * Lines 46–92 (`AcademicDashboardMockup` mock metrics):
    ```tsx
    <div className="text-[#86868B] text-sm font-medium mb-2">Current CGPA</div>
    <div className="text-5xl font-semibold text-white tracking-tighter">8.42</div>
    ...
    <div className="text-[#86868B] text-sm font-medium mb-2">Health Score</div>
    <div className="text-5xl font-semibold text-white tracking-tighter">92<span className="text-2xl text-[#86868B]">/100</span></div>
    ...
    {[85, 92, 76, 98, 88, 65].map((h, i) => ( ... // Subject Risk Heatmap
    ```
  * Lines 94–149 (`CareerDashboardMockup` mock metrics):
    ```tsx
    <div className="text-white font-semibold text-lg">Google</div>
    <div className="text-emerald-400 text-sm">Highly Eligible</div>
    ...
    <div className="flex justify-between text-sm"><span className="text-[#86868B]">Req. CGPA</span><span className="text-white">8.0+ (You: 8.42)</span></div>
    ...
    <div className="text-white font-semibold text-lg">Amazon</div>
    <div className="text-yellow-400 text-sm">Borderline</div>
    ...
    <div className="flex justify-between text-sm"><span className="text-[#86868B]">Req. CGPA</span><span className="text-white">8.5+ (You: 8.42)</span></div>
    ```
* **What data/action it simulates:** Interactive mockups displaying hardcoded academic/placement dashboard parameters on the landing page.
* **What real database model or API source could replace it:** Rendered dynamically using the user's actual academic performance from `AcademicSnapshot`, `Enrollment`, and `Calculation` tables, and career eligibility using `CareerProfile` and `DEFAULT_RECRUITERS` data.

---

### 22. components/forecast/ProUpgradeModal.tsx
* **Exact lines of code:**
  * Lines 17–28 (`handleCheckout` Stripe payment simulator):
    ```tsx
    const handleCheckout = () => {
      setIsLoading(true);
      // Dummy Stripe simulation
      setTimeout(() => {
        setIsLoading(false);
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 2000);
      }, 1500);
    };
    ```
* **What data/action it simulates:** Checkout verification dialog and subscription upgrade simulation processing flow.
* **What real database model or API source could replace it:** Stripe/Razorpay Checkout Session SDK and payment event webhooks updating the subscription status flags inside the `User` database model.

---

### 23. components/dashboard/CalendarManager.tsx
* **Exact lines of code:**
  * Lines 166–177 (Simulated AI generated task generator timeout and array):
    ```tsx
    const handleAIGenerate = (eventId: string, eventName: string) => {
      setIsGeneratingId(eventId);
      setTimeout(() => {
        const mockSubtasks = [
          { id: `st_${Date.now()}_1`, title: `Analyze syllabus & weightage for ${eventName}`, completed: false },
          { id: `st_${Date.now()}_2`, title: `Complete 3 official mock test papers`, completed: false },
          { id: `st_${Date.now()}_3`, title: `Active recall session for weak topics`, completed: false }
        ];
        updateEventSubtasks(eventId, mockSubtasks);
        setIsGeneratingId(null);
      }, 1500);
    };
    ```
* **What data/action it simulates:** AI-generated checklist of subtasks for calendar events.
* **What real database model or API source could replace it:** Calling a backend endpoint querying Gemini to generate personalized subtasks, saving them to a new `CalendarSubtask` model linked to `AcademicCalendarEvent`.

---

## Caveats and Optional Sync Simulations

* **components/dashboard/sync/DataSyncEngine.tsx:** Uses a `setTimeout` of 500ms in lines 37-38 and 110-111 to simulate network delays when parsing uploaded text or loading curriculum presets for UX purposes. The data itself is a real curriculum preset (`jspmPreset`) rather than fake values.
