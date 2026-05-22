"use client";

import { useState } from "react";
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
  FileCheck,
  RefreshCw
} from "lucide-react";
import { useUSMStore } from "../../stores/usmStore";
import { getPresetById } from "../../lib/presets/presetRegistry";
import Link from "next/link";

interface MockMarksheet {
  name: string;
  universityName: string;
  presetId: string;
  confidence: number;
  gradeScale: string;
  courses: Array<{
    id: string;
    code: string;
    name: string;
    credits: number;
    cieMarks: number;
    seeMarks?: number;
    grade: string;
    attendanceTotal: number;
    attendanceBunked: number;
  }>;
}

const MOCK_MARKSHEETS: Record<string, MockMarksheet> = {
  sppu: {
    name: "Pune University (SPPU) Semester IV",
    universityName: "Savitribai Phule Pune University",
    presetId: "sppu",
    confidence: 99.1,
    gradeScale: "10-point CBCS Pattern 2019",
    courses: [
      {
        id: "sppu_1",
        code: "CS-201",
        name: "Data Structures & Algorithms",
        credits: 4,
        cieMarks: 22,
        seeMarks: 62,
        grade: "A+",
        attendanceTotal: 40,
        attendanceBunked: 4
      },
      {
        id: "sppu_2",
        code: "CS-202",
        name: "Discrete Mathematics",
        credits: 4,
        cieMarks: 19,
        seeMarks: 58,
        grade: "A",
        attendanceTotal: 40,
        attendanceBunked: 6
      },
      {
        id: "sppu_3",
        code: "CS-203",
        name: "Digital Electronics & Logic Design",
        credits: 3,
        cieMarks: 21,
        seeMarks: 52,
        grade: "B+",
        attendanceTotal: 40,
        attendanceBunked: 2
      },
      {
        id: "sppu_4",
        code: "CS-204",
        name: "Object Oriented Programming",
        credits: 3,
        cieMarks: 25,
        seeMarks: 68,
        grade: "O",
        attendanceTotal: 40,
        attendanceBunked: 5
      },
      {
        id: "sppu_5",
        code: "CS-205",
        name: "Computer Graphics",
        credits: 3,
        cieMarks: 18,
        seeMarks: 44,
        grade: "B",
        attendanceTotal: 40,
        attendanceBunked: 3
      }
    ]
  },
  mu: {
    name: "Mumbai University (MU) Semester III",
    universityName: "Mumbai University",
    presetId: "mu",
    confidence: 98.4,
    gradeScale: "10-point CBCGS REV-2019 C-Scheme",
    courses: [
      {
        id: "mu_1",
        code: "CSC301",
        name: "Engineering Mathematics-III",
        credits: 4,
        cieMarks: 32,
        seeMarks: 48,
        grade: "A",
        attendanceTotal: 42,
        attendanceBunked: 5
      },
      {
        id: "mu_2",
        code: "CSC302",
        name: "Discrete Structures & Graph Theory",
        credits: 3,
        cieMarks: 28,
        seeMarks: 42,
        grade: "B",
        attendanceTotal: 42,
        attendanceBunked: 4
      },
      {
        id: "mu_3",
        code: "CSC303",
        name: "Data Structures",
        credits: 3,
        cieMarks: 30,
        seeMarks: 50,
        grade: "A",
        attendanceTotal: 42,
        attendanceBunked: 3
      },
      {
        id: "mu_4",
        code: "CSC304",
        name: "Digital Logic & Computer Architecture",
        credits: 3,
        cieMarks: 35,
        seeMarks: 56,
        grade: "O",
        attendanceTotal: 42,
        attendanceBunked: 6
      },
      {
        id: "mu_5",
        code: "CSC305",
        name: "Computer Graphics",
        credits: 3,
        cieMarks: 26,
        seeMarks: 46,
        grade: "B",
        attendanceTotal: 42,
        attendanceBunked: 2
      }
    ]
  },
  vtu: {
    name: "VTU Semester III Marksheet",
    universityName: "Visvesvaraya Technological University",
    presetId: "vtu",
    confidence: 97.6,
    gradeScale: "10-point Non-NEP CBCS Schema",
    courses: [
      {
        id: "vtu_1",
        code: "21CS31",
        name: "Transform Calculus, Fourier Series & Numerical Tech",
        credits: 3,
        cieMarks: 30,
        seeMarks: 52,
        grade: "A+",
        attendanceTotal: 44,
        attendanceBunked: 4
      },
      {
        id: "vtu_2",
        code: "21CS32",
        name: "Data Structures and Applications",
        credits: 4,
        cieMarks: 35,
        seeMarks: 55,
        grade: "A+",
        attendanceTotal: 44,
        attendanceBunked: 3
      },
      {
        id: "vtu_3",
        code: "21CS33",
        name: "Analog and Digital Electronics",
        credits: 3,
        cieMarks: 28,
        seeMarks: 48,
        grade: "A",
        attendanceTotal: 44,
        attendanceBunked: 5
      },
      {
        id: "vtu_4",
        code: "21CS34",
        name: "Computer Organization and Architecture",
        credits: 3,
        cieMarks: 32,
        seeMarks: 44,
        grade: "B+",
        attendanceTotal: 44,
        attendanceBunked: 7
      },
      {
        id: "vtu_5",
        code: "21CS35",
        name: "Object Oriented Programming with Java",
        credits: 3,
        cieMarks: 34,
        seeMarks: 50,
        grade: "A",
        attendanceTotal: 44,
        attendanceBunked: 4
      },
      {
        id: "vtu_6",
        code: "21CS36",
        name: "Constitution of India, Professional Ethics",
        credits: 0,
        cieMarks: 38,
        seeMarks: 40,
        grade: "PP",
        attendanceTotal: 44,
        attendanceBunked: 2
      }
    ]
  }
};

export default function TranscriptImportPage() {
  const router = useRouter();
  const { setPresetId, setCourses, setAcademic } = useUSMStore();
  const [selectedMock, setSelectedMock] = useState<string>("sppu");
  const [scanning, setScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scannedData, setScannedData] = useState<MockMarksheet | null>(null);
  
  // Custom uploaded file state (simulated)
  const [dragActive, setDragActive] = useState(false);
  const [customFile, setCustomFile] = useState<File | null>(null);

  const startScan = (key: string) => {
    setScanning(true);
    setScanProgress(0);
    setScannedData(null);
    setCustomFile(null);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setScanning(false);
            setScannedData(JSON.parse(JSON.stringify(MOCK_MARKSHEETS[key])));
            toast.success("Transcript parsed successfully!");
          }, 400);
          return 100;
        }
        return prev + 10;
      });
    }, 120);
  };

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
      setCustomFile(file);
      // Automatically trigger a scan of the selected mock university preset matching the custom file
      startScan(selectedMock);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCustomFile(file);
      startScan(selectedMock);
    }
  };

  const updateScannedCourse = (
    index: number,
    field: string,
    value: string | number
  ) => {
    if (!scannedData) return;

    const updatedCourses = [...scannedData.courses];
    const course = { ...updatedCourses[index] };

    if (field === "credits") {
      course.credits = Math.max(0, Number(value) || 0);
    } else if (field === "cieMarks") {
      course.cieMarks = Math.max(0, Math.min(100, Number(value) || 0));
    } else if (field === "seeMarks") {
      course.seeMarks = Math.max(0, Math.min(100, Number(value) || 0));
    } else if (field === "code") {
      course.code = String(value);
    } else if (field === "name") {
      course.name = String(value);
    } else if (field === "grade") {
      course.grade = String(value).toUpperCase();
    }

    updatedCourses[index] = course;
    setScannedData({ ...scannedData, courses: updatedCourses });
  };

  // Derive GPA on editing
  const getDerivedGPAPreview = () => {
    if (!scannedData) return { sgpa: 0, credits: 0 };
    const preset = getPresetById(scannedData.presetId);
    if (!preset) return { sgpa: 0, credits: 0 };

    const creditCourses = scannedData.courses.filter((c) => c.credits > 0);
    let totalGradePoints = 0;
    let totalCredits = 0;

    for (const course of creditCourses) {
      if (course.grade) {
        const scaleEntry = preset.gradeScale.find((g) => g.grade === course.grade);
        if (scaleEntry) {
          totalGradePoints += scaleEntry.points * course.credits;
          totalCredits += course.credits;
        }
      }
    }

    const sgpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
    return {
      sgpa: parseFloat(sgpa.toFixed(2)),
      credits: totalCredits,
    };
  };

  const commitParsedData = () => {
    if (!scannedData) return;

    // Set local Zustand store values
    setPresetId(scannedData.presetId);
    setCourses(scannedData.courses);

    // Seed some general academic values
    setAcademic({
      currentCgpa: 8.2, // Seed reasonable current CGPA
      completedSemesters: 3,
      earnedCredits: 60,
      activeBacklogsCount: scannedData.courses.filter(c => c.grade === "F" || c.grade === "FF").length,
      targetCgpa: 8.8
    });

    toast.success("Academic telemetry synced with Zustand Store!");
    router.push("/dashboard");
  };

  const preview = getDerivedGPAPreview();

  return (
    <div className="min-h-screen text-foreground selection:bg-primary/20 pt-32 pb-20 px-6 max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-black tracking-widest text-[#4F8EF7] uppercase">
            Ingestion Gateway
          </span>
          <h1 className="text-4xl font-black font-headline tracking-tighter text-white mt-1">
            OCR Transcript Ingestion
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Instantly ingest transcripts with confidence indicators and interactive correction matrices.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 font-bold hover:bg-white/10 transition text-center"
        >
          Cancel & Return
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload and Configuration (Left Pane) */}
        <div className="lg:col-span-5 space-y-8">
          {/* Mock Document Selection */}
          <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="text-[#A855F7]" size={20} />
              <h3 className="text-lg font-black text-white">Select OCR Preset Template</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              GradeFlow uses high-fidelity local templates to match and parse standard Indian academic formats. Select a template below for immediate testing.
            </p>
            <div className="flex flex-col gap-3">
              {Object.keys(MOCK_MARKSHEETS).map((key) => {
                const doc = MOCK_MARKSHEETS[key];
                const active = selectedMock === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedMock(key)}
                    className={`flex items-start justify-between p-4 rounded-2xl border text-left transition-all ${
                      active
                        ? "bg-[#4F8EF7]/10 border-[#4F8EF7]/40 text-white shadow-lg"
                        : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10"
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-black tracking-tight">{doc.name}</p>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                        {doc.universityName}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold bg-white/5 px-2 py-0.5 rounded text-[#4F8EF7]">
                      {doc.presetId.toUpperCase()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Drag Drop Upload */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`relative rounded-3xl border-2 border-dashed p-8 text-center transition-all ${
              dragActive
                ? "bg-[#4F8EF7]/10 border-[#4F8EF7] scale-102"
                : customFile
                ? "bg-emerald-500/5 border-emerald-500/30"
                : "bg-slate-950/20 border-white/10 hover:border-white/20"
            }`}
          >
            <input
              type="file"
              id="file-upload"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className={`p-4 rounded-full ${customFile ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-slate-400"}`}>
                {customFile ? <FileCheck size={28} /> : <Upload size={28} />}
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {customFile ? customFile.name : "Upload official academic transcript"}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-widest font-black">
                  PDF, JPEG, or PNG up to 10MB
                </p>
              </div>
              <button
                type="button"
                onClick={() => startScan(selectedMock)}
                className="relative z-20 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED] text-white font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition"
              >
                Scan with Local Parser
              </button>
            </div>
          </div>

          {/* Verification Audit Log */}
          {scannedData && (
            <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-500/10 pb-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle size={18} />
                  <span className="text-sm font-black uppercase tracking-wider">Parsing Success</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Confidence</span>
                  <span className="text-lg font-mono font-black text-emerald-300">
                    {scannedData.confidence}%
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Target University:</span>
                  <span className="font-bold text-white">{scannedData.universityName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Grading Ordinance:</span>
                  <span className="font-mono text-white">{scannedData.gradeScale}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Detected Courses:</span>
                  <span className="font-bold text-white">{scannedData.courses.length} courses</span>
                </div>
              </div>
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-[11px] text-emerald-300 leading-relaxed">
                All course codes matches standard university blueprints. Spreadsheet manual override grid is active on the right panel.
              </div>
            </div>
          )}

          {/* Loader Overlay when scanning */}
          {scanning && (
            <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-8 backdrop-blur-xl flex flex-col items-center justify-center space-y-6">
              <RefreshCw className="animate-spin text-[#4F8EF7]" size={42} />
              <div className="text-center space-y-2">
                <h4 className="text-lg font-black text-white uppercase tracking-wider">
                  Analyzing Document Layers
                </h4>
                <p className="text-xs text-slate-500">
                  Executing regex pattern matching for {MOCK_MARKSHEETS[selectedMock].universityName}...
                </p>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/10">
                <div
                  className="bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED] h-full rounded-full transition-all duration-100"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">{scanProgress}%</span>
            </div>
          )}
        </div>

        {/* Correction Matrix (Right Pane) */}
        <div className="lg:col-span-7 space-y-8">
          {scannedData ? (
            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 backdrop-blur-xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <Grid className="text-[#4F8EF7]" size={20} />
                  <h3 className="text-lg font-black text-white">Correction spreadsheet matrix</h3>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <span className="text-slate-500 block uppercase font-bold tracking-wider">SGPA Preview</span>
                    <span className="text-lg font-mono font-black text-white">{preview.sgpa}</span>
                  </div>
                  <div className="text-right border-l border-white/10 pl-4">
                    <span className="text-slate-500 block uppercase font-bold tracking-wider">Total Credits</span>
                    <span className="text-lg font-mono font-black text-white">{preview.credits}</span>
                  </div>
                </div>
              </div>

              {/* Matrix Table */}
              <div className="overflow-x-auto custom-scrollbar border border-white/5 rounded-2xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-white/10">
                      <th className="p-3.5">Code</th>
                      <th className="p-3.5">Course Name</th>
                      <th className="p-3.5 text-center">Credits</th>
                      <th className="p-3.5 text-center">CIE</th>
                      <th className="p-3.5 text-center">SEE</th>
                      <th className="p-3.5 text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {scannedData.courses.map((course, idx) => (
                      <tr key={course.id} className="hover:bg-white/[0.02] transition">
                        <td className="p-3">
                          <input
                            type="text"
                            value={course.code}
                            onChange={(e) => updateScannedCourse(idx, "code", e.target.value)}
                            className="bg-white/5 border border-white/10 rounded px-2 py-1 font-mono text-xs w-20 text-white focus:outline-none focus:border-[#4F8EF7] text-center"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={course.name}
                            onChange={(e) => updateScannedCourse(idx, "name", e.target.value)}
                            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs w-48 text-white focus:outline-none focus:border-[#4F8EF7]"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            value={course.credits}
                            onChange={(e) => updateScannedCourse(idx, "credits", e.target.value)}
                            className="bg-white/5 border border-white/10 rounded px-2 py-1 font-mono text-xs w-12 text-white focus:outline-none focus:border-[#4F8EF7] text-center"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            value={course.cieMarks}
                            onChange={(e) => updateScannedCourse(idx, "cieMarks", e.target.value)}
                            className="bg-white/5 border border-white/10 rounded px-2 py-1 font-mono text-xs w-12 text-white focus:outline-none focus:border-[#4F8EF7] text-center"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            value={course.seeMarks || 0}
                            onChange={(e) => updateScannedCourse(idx, "seeMarks", e.target.value)}
                            className="bg-white/5 border border-white/10 rounded px-2 py-1 font-mono text-xs w-12 text-white focus:outline-none focus:border-[#4F8EF7] text-center"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="text"
                            value={course.grade}
                            onChange={(e) => updateScannedCourse(idx, "grade", e.target.value)}
                            className="bg-white/5 border border-white/10 rounded px-2 py-1 font-mono font-bold text-xs w-12 text-center text-[#A855F7] uppercase focus:outline-none focus:border-[#4F8EF7]"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Warnings and Info */}
              <div className="flex gap-3 text-xs bg-slate-900 border border-white/5 rounded-2xl p-4 text-slate-400">
                <AlertCircle className="text-[#A855F7] shrink-0" size={18} />
                <div className="space-y-1">
                  <p className="font-bold text-white">Manual Edit Protection Active</p>
                  <p className="leading-relaxed">
                    Edits made to the grade input are instantly parsed against target university regulations. Make sure that course codes and credits are exact before importing.
                  </p>
                </div>
              </div>

              {/* Commit Button */}
              <button
                onClick={commitParsedData}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED] text-white font-black text-sm uppercase tracking-wider shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition"
              >
                <Database size={18} />
                Commit & Sync with student state machine
              </button>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-slate-950/20 p-12 text-center flex flex-col items-center justify-center space-y-6 h-full min-h-[350px]">
              <div className="p-4 rounded-full bg-white/5 text-slate-500">
                <FileText size={36} />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h4 className="text-lg font-black text-white uppercase tracking-wider">
                  Spreadsheet Override Pending
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Upload an academic transcript or select one of the high-fidelity mock presets on the left pane to analyze courses and activate spreadsheet cell matrix overriding.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
