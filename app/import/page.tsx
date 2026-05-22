"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Database,
  Grid,
  Download,
  AlertTriangle,
  BookOpen,
  History,
  Info,
  ChevronRight,
  Clipboard
} from "lucide-react";
import { useUSMStore } from "../../stores/usmStore";
import { validateImportPayload } from "../../lib/ingestion/importValidator";
import { reconcileImportPayload } from "../../lib/ingestion/importReconciler";
import { AcademicImportPayload } from "../../lib/ingestion/types";
import Link from "next/link";

const MOCK_JSON_TEMPLATES: Record<string, { name: string; description: string; json: string }> = {
  sppu: {
    name: "Savitribai Phule Pune University (SPPU)",
    description: "Standard 2-semester history for SPPU CBCS 2019 syllabus.",
    json: JSON.stringify({
      presetId: "sppu",
      currentCgpa: 8.24,
      targetCgpa: 8.75,
      activeBacklogsCount: 0,
      semesterHistory: [
        {
          semester: 1,
          sgpa: 8.10,
          credits: 20,
          earnedCredits: 20,
          courses: [
            { code: "CS-101", name: "Programming & Problem Solving", credits: 4, grade: "A" },
            { code: "MA-101", name: "Linear Algebra & Calculus", credits: 4, grade: "B+" },
            { code: "EE-101", name: "Basic Electrical Eng.", credits: 4, grade: "A" }
          ]
        },
        {
          semester: 2,
          sgpa: 8.38,
          credits: 20,
          earnedCredits: 20,
          courses: [
            { code: "CS-102", name: "Data Structures & Algorithms", credits: 4, grade: "O" },
            { code: "MA-102", name: "Differential Equations", credits: 4, grade: "A" }
          ]
        }
      ],
      currentSemesterCourses: [
        {
          code: "CS-201",
          name: "Design & Analysis of Algorithms",
          credits: 4,
          cieMarks: 44,
          attendanceTotal: 40,
          attendanceBunked: 2
        },
        {
          code: "CS-202",
          name: "Discrete Structures & Logic",
          credits: 4,
          cieMarks: 38,
          attendanceTotal: 40,
          attendanceBunked: 5
        },
        {
          code: "CS-203",
          name: "Database Systems",
          credits: 3,
          cieMarks: 40,
          attendanceTotal: 30,
          attendanceBunked: 1
        }
      ]
    }, null, 2)
  },
  vtu: {
    name: "Visvesvaraya Technological University (VTU)",
    description: "VTU 1-semester history showing credit-only and audit pass rules.",
    json: JSON.stringify({
      presetId: "vtu",
      currentCgpa: 7.90,
      targetCgpa: 8.40,
      activeBacklogsCount: 0,
      semesterHistory: [
        {
          semester: 1,
          sgpa: 7.90,
          credits: 22,
          earnedCredits: 22,
          courses: [
            { code: "MATH11", name: "Advanced Mathematics I", credits: 4, grade: "A" },
            { code: "PHYS12", name: "Engineering Physics", credits: 4, grade: "A+" },
            { code: "CIV14", name: "Environmental Studies", credits: 1, grade: "PP" }
          ]
        }
      ],
      currentSemesterCourses: [
        {
          code: "CS31",
          name: "Data Structures & Applications",
          credits: 4,
          cieMarks: 42,
          attendanceTotal: 44,
          attendanceBunked: 3
        },
        {
          code: "CS32",
          name: "Analog and Digital Electronics",
          credits: 3,
          cieMarks: 39,
          attendanceTotal: 44,
          attendanceBunked: 5
        },
        {
          code: "CS33",
          name: "Computer Organization & Arch.",
          credits: 3,
          cieMarks: 41,
          attendanceTotal: 44,
          attendanceBunked: 2
        }
      ]
    }, null, 2)
  },
  jntuh: {
    name: "JNTU Hyderabad (JNTUH)",
    description: "JNTUH R22 sample preset showing a freshman year profile.",
    json: JSON.stringify({
      presetId: "jntuh",
      currentCgpa: 8.10,
      targetCgpa: 8.60,
      activeBacklogsCount: 0,
      semesterHistory: [
        {
          semester: 1,
          sgpa: 8.10,
          credits: 19,
          earnedCredits: 19,
          courses: [
            { code: "MA101BS", name: "Matrices and Calculus", credits: 4, grade: "A" },
            { code: "CH102BS", name: "Engineering Chemistry", credits: 4, grade: "A+" },
            { code: "CS103ES", name: "Programming for Problem Solving", credits: 3, grade: "B" }
          ]
        }
      ],
      currentSemesterCourses: [
        {
          code: "MA201BS",
          name: "Ordinary Differential Equations",
          credits: 4,
          cieMarks: 45,
          attendanceTotal: 40,
          attendanceBunked: 1
        },
        {
          code: "AP202BS",
          name: "Applied Physics",
          credits: 4,
          cieMarks: 42,
          attendanceTotal: 40,
          attendanceBunked: 3
        }
      ]
    }, null, 2)
  }
};

export default function JSONImportPage() {
  const router = useRouter();
  const store = useUSMStore();
  const [jsonText, setJsonText] = useState<string>("");
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"current" | "history">("current");
  const [expandedSemester, setExpandedSemester] = useState<number | null>(null);

  // Validation state
  const [isValid, setIsValid] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [parsedPayload, setParsedPayload] = useState<AcademicImportPayload | null>(null);

  // Trigger validation whenever JSON text updates
  useEffect(() => {
    if (!jsonText.trim()) {
      setIsValid(false);
      setErrors([]);
      setWarnings([]);
      setParsedPayload(null);
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);
      const validation = validateImportPayload(parsed);
      setIsValid(validation.isValid);
      setErrors(validation.errors);
      setWarnings(validation.warnings);
      if (validation.isValid && validation.parsedData) {
        setParsedPayload(validation.parsedData);
      } else {
        setParsedPayload(null);
      }
    } catch (err: unknown) {
      setIsValid(false);
      const msg = err instanceof Error ? err.message : String(err);
      setErrors([`JSON Syntax Error: ${msg}`]);
      setWarnings([]);
      setParsedPayload(null);
    }
  }, [jsonText]);

  // Load a preset template
  const loadTemplate = (key: string) => {
    setJsonText(MOCK_JSON_TEMPLATES[key].json);
    toast.success(`Loaded ${MOCK_JSON_TEMPLATES[key].name} template!`);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      readFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      readFile(file);
    }
  };

  const readFile = (file: File) => {
    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      toast.error("Invalid file format. Please upload a .json file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setJsonText(text);
      toast.success("JSON file loaded successfully!");
    };
    reader.onerror = () => {
      toast.error("Failed to read file.");
    };
    reader.readAsText(file);
  };

  const commitData = () => {
    if (!isValid || !parsedPayload) {
      toast.error("Cannot commit: payload contains validation errors.");
      return;
    }

    try {
      reconcileImportPayload(parsedPayload, store);
      toast.success("Academic records successfully synchronized!");
      router.push("/dashboard");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      toast.error(`Reconciliation Failed: ${msg}`);
    }
  };

  return (
    <div className="min-h-screen text-foreground selection:bg-primary/20 pt-32 pb-20 px-6 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-black tracking-widest text-[#4F8EF7] uppercase">
            Ingestion Gateway
          </span>
          <h1 className="text-4xl font-black font-headline tracking-tighter text-white mt-1">
            JSON Ingestion System
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Import student academic history and active course telemetry directly from structured JSON payloads.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href="/sample-import.json"
            download
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 font-bold hover:bg-white/10 transition text-sm"
          >
            <Download size={16} />
            Download Sample JSON
          </a>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-400 font-bold hover:bg-white/10 hover:text-white transition text-sm text-center"
          >
            Cancel
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input & Validator Panel (Left, 5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Preset Templates */}
          <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="text-[#A855F7]" size={20} />
              <h3 className="text-lg font-black text-white">Preset Templates</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Load a sample template matching preset university regulations to pre-fill the workspace.
            </p>
            <div className="flex flex-col gap-2.5">
              {Object.keys(MOCK_JSON_TEMPLATES).map((key) => (
                <button
                  key={key}
                  onClick={() => loadTemplate(key)}
                  className="flex items-start justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-[#4F8EF7]/40 hover:bg-white/10 transition text-left group"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white group-hover:text-[#4F8EF7] transition">
                      {MOCK_JSON_TEMPLATES[key].name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {MOCK_JSON_TEMPLATES[key].description}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-slate-500 mt-1 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* JSON Text Input & Upload Area */}
          <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="text-[#4F8EF7]" size={20} />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Raw JSON Workspace</h3>
              </div>
              <button
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    setJsonText(text);
                    toast.success("Pasted JSON from clipboard!");
                  } catch {
                    toast.error("Could not read clipboard. Please paste manually.");
                  }
                }}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition font-bold"
                title="Paste from clipboard"
              >
                <Clipboard size={14} />
                Paste
              </button>
            </div>

            {/* Drag & Drop zone overlay or text area */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`relative border border-white/10 rounded-2xl overflow-hidden ${
                dragActive ? "border-[#4F8EF7] bg-[#4F8EF7]/5" : ""
              }`}
            >
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder='{ "presetId": "sppu", "currentCgpa": 8.0, ... }'
                className="w-full h-80 bg-slate-950/60 p-4 font-mono text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-[#4F8EF7] resize-none"
              />
              {dragActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-white p-4 space-y-2">
                  <Upload size={32} className="text-[#4F8EF7] animate-bounce" />
                  <p className="text-sm font-bold">Drop JSON file here</p>
                </div>
              )}
            </div>

            {/* Manual File Upload Button */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Or drag & drop your .json file</span>
              <label className="cursor-pointer font-bold text-[#4F8EF7] hover:underline flex items-center gap-1">
                <Upload size={12} />
                Select File
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Inline Validation Panel */}
          {jsonText.trim() && (
            <div
              className={`rounded-3xl border p-6 space-y-4 ${
                isValid
                  ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300"
                  : "border-rose-500/20 bg-rose-500/5 text-rose-300"
              }`}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  {isValid ? (
                    <CheckCircle className="text-emerald-400" size={18} />
                  ) : (
                    <AlertCircle className="text-rose-400" size={18} />
                  )}
                  <span className="text-sm font-black uppercase tracking-wider">
                    {isValid ? "Validation Passed" : "Validation Failed"}
                  </span>
                </div>
                {isValid && parsedPayload && (
                  <span className="text-xs font-mono font-bold bg-emerald-500/20 px-2.5 py-0.5 rounded text-emerald-200 uppercase">
                    {parsedPayload.presetId}
                  </span>
                )}
              </div>

              {/* Errors List */}
              {errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-rose-400">Errors ({errors.length})</p>
                  <ul className="space-y-1 text-xs list-disc pl-4 text-slate-300 leading-relaxed">
                    {errors.map((err, idx) => (
                      <li key={idx} className="marker:text-rose-500">{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings List */}
              {warnings.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
                    <AlertTriangle size={14} />
                    Warnings ({warnings.length})
                  </div>
                  <ul className="space-y-1 text-xs list-disc pl-4 text-slate-300 leading-relaxed">
                    {warnings.map((warn, idx) => (
                      <li key={idx} className="marker:text-amber-500">{warn}</li>
                    ))}
                  </ul>
                </div>
              )}

              {isValid && errors.length === 0 && warnings.length === 0 && (
                <p className="text-xs text-slate-400 leading-relaxed">
                  Academic blueprint verified with 100% database schema parity. Ready for ingestion commit.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Tabbed Ingest Preview (Right, 7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {parsedPayload ? (
            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 backdrop-blur-xl space-y-6">
              {/* Preview Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Grid className="text-[#4F8EF7]" size={20} />
                    <h3 className="text-lg font-black text-white">Payload Preview</h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    Verify telemetry before committing to store.
                  </p>
                </div>

                {/* Switch Tabs */}
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 self-start">
                  <button
                    onClick={() => setActiveTab("current")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === "current"
                        ? "bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED] text-white shadow"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <BookOpen size={14} />
                    Current Courses
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === "history"
                        ? "bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED] text-white shadow"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <History size={14} />
                    Semester History
                  </button>
                </div>
              </div>

              {/* General Academic Metadata Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Current CGPA</span>
                  <p className="text-lg font-mono font-black text-white">{parsedPayload.currentCgpa}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Target CGPA</span>
                  <p className="text-lg font-mono font-black text-[#A855F7]">{parsedPayload.targetCgpa}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Semesters Completed</span>
                  <p className="text-lg font-mono font-black text-white">{parsedPayload.semesterHistory.length}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Backlogs</span>
                  <p className="text-lg font-mono font-black text-rose-400">{parsedPayload.activeBacklogsCount}</p>
                </div>
              </div>

              {/* Tab 1: Current Courses Table */}
              {activeTab === "current" && (
                <div className="space-y-4">
                  <div className="overflow-x-auto border border-white/5 rounded-2xl">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/5 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-white/10">
                          <th className="p-3.5">Code</th>
                          <th className="p-3.5">Course Name</th>
                          <th className="p-3.5 text-center">Credits</th>
                          <th className="p-3.5 text-center">CIE Marks</th>
                          <th className="p-3.5 text-center">Attendance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {parsedPayload.currentSemesterCourses && parsedPayload.currentSemesterCourses.length > 0 ? (
                          parsedPayload.currentSemesterCourses.map((c, idx) => {
                            const attTotal = c.attendanceTotal ?? 0;
                            const attBunked = c.attendanceBunked ?? 0;
                            const attendancePercent = attTotal > 0
                              ? Math.round(((attTotal - attBunked) / attTotal) * 100)
                              : 100;
                            return (
                              <tr key={c.code || idx} className="hover:bg-white/[0.02] transition">
                                <td className="p-3.5 font-mono text-xs text-white">{c.code}</td>
                                <td className="p-3.5 text-slate-300 font-medium">{c.name}</td>
                                <td className="p-3.5 text-center font-mono font-bold text-slate-400">{c.credits}</td>
                                <td className="p-3.5 text-center font-mono text-slate-400">{c.cieMarks ?? "—"}</td>
                                <td className="p-3.5 text-center font-mono">
                                  {attTotal ? (
                                    <span className={attendancePercent < 75 ? "text-rose-400" : "text-emerald-400"}>
                                      {attendancePercent}% ({attTotal - attBunked}/{attTotal})
                                    </span>
                                  ) : (
                                    <span className="text-slate-500">100% (Default)</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-500 text-xs">
                              No current semester courses listed in payload.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 2: Semester History Table */}
              {activeTab === "history" && (
                <div className="space-y-4">
                  <div className="overflow-x-auto border border-white/5 rounded-2xl">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/5 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-white/10">
                          <th className="p-3.5 text-center">Semester</th>
                          <th className="p-3.5 text-center">SGPA</th>
                          <th className="p-3.5 text-center">Registered Credits</th>
                          <th className="p-3.5 text-center">Earned Credits</th>
                          <th className="p-3.5 text-right pr-6">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {parsedPayload.semesterHistory.map((sem) => {
                          const isExpanded = expandedSemester === sem.semester;
                          return (
                            <>
                              <tr key={sem.semester} className="hover:bg-white/[0.02] transition">
                                <td className="p-3.5 text-center font-bold text-white">Sem {sem.semester}</td>
                                <td className="p-3.5 text-center font-mono font-bold text-emerald-400">{sem.sgpa}</td>
                                <td className="p-3.5 text-center font-mono text-slate-400">{sem.credits}</td>
                                <td className="p-3.5 text-center font-mono text-slate-400">{sem.earnedCredits}</td>
                                <td className="p-3.5 text-right pr-6">
                                  {sem.courses && sem.courses.length > 0 ? (
                                    <button
                                      onClick={() => setExpandedSemester(isExpanded ? null : sem.semester)}
                                      className="text-xs font-bold text-[#4F8EF7] hover:underline"
                                    >
                                      {isExpanded ? "Hide Courses" : `Show Courses (${sem.courses.length})`}
                                    </button>
                                  ) : (
                                    <span className="text-xs text-slate-600">No courses detailed</span>
                                  )}
                                </td>
                              </tr>
                              {isExpanded && sem.courses && (
                                <tr className="bg-slate-900/30">
                                  <td colSpan={5} className="p-4 pl-8 border-t border-white/5">
                                    <div className="space-y-2">
                                      <p className="text-[10px] uppercase font-black text-slate-500 tracking-wider">
                                        Semester {sem.semester} Courses
                                      </p>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                        {sem.courses.map((course) => (
                                          <div
                                            key={course.code}
                                            className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-white/5"
                                          >
                                            <div className="space-y-0.5">
                                              <span className="font-mono text-[10px] text-slate-500">{course.code}</span>
                                              <p className="font-medium text-white">{course.name}</p>
                                            </div>
                                            <div className="text-right">
                                              <span className="font-mono text-[#A855F7] font-bold">{course.grade}</span>
                                              <p className="text-[9px] text-slate-500">{course.credits} Cr</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Warning/Info Box */}
              <div className="flex gap-3 text-xs bg-slate-900 border border-white/5 rounded-2xl p-4 text-slate-400">
                <Info className="text-[#4F8EF7] shrink-0" size={18} />
                <div className="space-y-1">
                  <p className="font-bold text-white">Automatic State Realignment</p>
                  <p className="leading-relaxed">
                    Committing this payload will instantly sync the Student Academic Intelligence engine, override current semester courses, and recalculate GPA projections.
                  </p>
                </div>
              </div>

              {/* Submit Commit button */}
              <button
                onClick={commitData}
                disabled={!isValid}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-black text-sm uppercase tracking-wider transition shadow-2xl ${
                  isValid
                    ? "bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED] hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5"
                }`}
              >
                <Database size={18} />
                Commit & Reconcile Academic Records
              </button>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-slate-950/20 p-12 text-center flex flex-col items-center justify-center space-y-6 h-full min-h-[450px]">
              <div className="p-4 rounded-full bg-white/5 text-slate-500">
                <FileText size={36} />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h4 className="text-lg font-black text-white uppercase tracking-wider">
                  Spreadsheet Preview Pending
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Select a university preset template on the left, upload a `.json` file, or copy-paste raw JSON directly to populate the interactive database preview cards.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
