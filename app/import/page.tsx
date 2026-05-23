"use client";

import React, { useState, useEffect } from "react";
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
  Clipboard,
  Plus,
  Trash2,
  Loader2,
  Play,
  ArrowRight
} from "lucide-react";
import { useUSMStore } from "../../stores/usmStore";
import { validateImportPayload } from "../../lib/ingestion/importValidator";
import { reconcileImportPayload } from "../../lib/ingestion/importReconciler";
import { AcademicImportPayload } from "../../lib/ingestion/types";
import { getPresetById } from "../../lib/presets/presetRegistry";
import { documentParserRegistry } from "../../lib/ingestion/parser/registry";
import { ParsedAcademicDocument, ParsedSemester, ParsedCurrentCourse } from "../../lib/ingestion/parser/types";
import Link from "next/link";

const MOCK_OCR_TEXTS: Record<string, string> = {
  sppu: `SAVITRIBAI PHULE PUNE UNIVERSITY
CURRENT CGPA: 8.24
TARGET CGPA: 8.75
ACTIVE BACKLOGS: 0

SEMESTER 1
CS-101 Programming & Problem Solving 4 A
MA-101 Linear Algebra & Calculus 4 B+
EE-101 Basic Electrical Eng 4 A
SGPA: 8.10
CREDITS: 12

SEMESTER 2
CS-102 Data Structures & Algorithms 4 O
MA-102 Differential Equations 4 A
SGPA: 8.38
CREDITS: 8`,
  vtu: `VISVESVARAYA TECHNOLOGICAL UNIVERSITY
CGPA: 7.90
TARGET CGPA: 8.40
BACKLOGS: 0

SEMESTER 1
MATH11 Advanced Mathematics I 4 A
PHYS12 Engineering Physics 4 A+
CIV14 Environmental Studies 1 PP
SGPA: 7.90
CREDITS: 9`,
  jntuh: `JAWAHARLAL NEHRU TECHNOLOGICAL UNIVERSITY HYDERABAD
CGPA: 8.10
TARGET CGPA: 8.60
BACKLOGS: 0

SEMESTER 1
MA101BS Matrices and Calculus 4 A
CH102BS Engineering Chemistry 4 A+
CS103ES Programming for Problem Solving 3 B
SGPA: 8.10
CREDITS: 11`
};

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
            { code: "EE-101", name: "Basic Electrical Eng.", credits: 4, grade: "A" },
            { code: "PHY-101", name: "Engineering Physics", credits: 4, grade: "A+" },
            { code: "MA-103", name: "Discrete Math Structures", credits: 4, grade: "B" }
          ]
        },
        {
          semester: 2,
          sgpa: 8.38,
          credits: 20,
          earnedCredits: 20,
          courses: [
            { code: "CS-102", name: "Data Structures & Algorithms", credits: 4, grade: "O" },
            { code: "MA-102", name: "Differential Equations", credits: 4, grade: "A" },
            { code: "EE-102", name: "Basic Electronics", credits: 4, grade: "B+" },
            { code: "CHEM-101", name: "Engineering Chemistry", credits: 4, grade: "A" },
            { code: "CS-103", name: "Digital Systems Design", credits: 4, grade: "A+" }
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
            { code: "CIV14", name: "Environmental Studies", credits: 1, grade: "PP" },
            { code: "CHEM13", name: "Engineering Chemistry", credits: 4, grade: "B+" },
            { code: "ELN15", name: "Basic Electronics", credits: 4, grade: "A" },
            { code: "MECH16", name: "Elements of Mech Eng", credits: 4, grade: "B" },
            { code: "WORK17", name: "Mech Workshop", credits: 1, grade: "S" }
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
            { code: "CS103ES", name: "Programming for Problem Solving", credits: 3, grade: "B" },
            { code: "EE104ES", name: "Basic Electrical Engineering", credits: 3, grade: "A" },
            { code: "ME105ES", name: "Computer Aided Eng Graphics", confidence: 96, credits: 3, grade: "B+" },
            { code: "CS106ES", name: "Programming for Problem Solving Lab", credits: 1, grade: "A+" },
            { code: "CH107BS", name: "Engineering Chemistry Lab", credits: 1, grade: "O" }
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

function mapPayloadToParsedDoc(payload: AcademicImportPayload): ParsedAcademicDocument {
  return {
    presetId: { value: payload.presetId, confidence: 100 },
    currentCgpa: { value: payload.currentCgpa, confidence: 100 },
    targetCgpa: { value: payload.targetCgpa, confidence: 100 },
    activeBacklogsCount: { value: payload.activeBacklogsCount, confidence: 100 },
    semesterHistory: payload.semesterHistory.map(sem => ({
      semester: { value: sem.semester, confidence: 100 },
      sgpa: { value: sem.sgpa, confidence: 100 },
      credits: { value: sem.credits, confidence: 100 },
      earnedCredits: { value: sem.earnedCredits, confidence: 100 },
      courses: sem.courses?.map(c => ({
        code: { value: c.code, confidence: 100 },
        name: { value: c.name, confidence: 100 },
        credits: { value: c.credits, confidence: 100 },
        grade: { value: c.grade, confidence: 100 }
      }))
    })),
    currentSemesterCourses: payload.currentSemesterCourses?.map(c => ({
      code: { value: c.code, confidence: 100 },
      name: { value: c.name, confidence: 100 },
      credits: { value: c.credits, confidence: 100 },
      cieMarks: c.cieMarks !== undefined ? { value: c.cieMarks, confidence: 100 } : undefined,
      attendanceTotal: c.attendanceTotal !== undefined ? { value: c.attendanceTotal, confidence: 100 } : undefined,
      attendanceBunked: c.attendanceBunked !== undefined ? { value: c.attendanceBunked, confidence: 100 } : undefined
    }))
  };
}

function mapParsedDocToPayload(doc: ParsedAcademicDocument): AcademicImportPayload {
  return {
    presetId: doc.presetId.value,
    currentCgpa: doc.currentCgpa.value,
    targetCgpa: doc.targetCgpa.value,
    activeBacklogsCount: doc.activeBacklogsCount.value,
    semesterHistory: doc.semesterHistory.map(sem => ({
      semester: sem.semester.value,
      sgpa: sem.sgpa.value,
      credits: sem.credits.value,
      earnedCredits: sem.earnedCredits.value,
      courses: sem.courses?.map(c => ({
        code: c.code.value,
        name: c.name.value,
        credits: c.credits.value,
        grade: c.grade.value
      }))
    })),
    currentSemesterCourses: doc.currentSemesterCourses?.map(c => ({
      code: c.code.value,
      name: c.name.value,
      credits: c.credits.value,
      cieMarks: c.cieMarks?.value ?? 0,
      attendanceTotal: c.attendanceTotal?.value ?? 0,
      attendanceBunked: c.attendanceBunked?.value ?? 0
    }))
  };
}

export default function SmartImportPage() {
  const router = useRouter();
  const store = useUSMStore();

  // Mode management
  const [ingestMode, setIngestMode] = useState<"json" | "ocr">("ocr");
  const [activeUniversity, setActiveUniversity] = useState<string>("sppu");
  const [jsonText, setJsonText] = useState<string>("");
  const [ocrText, setOcrText] = useState<string>("");
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"current" | "history">("history");
  const [expandedSemester, setExpandedSemester] = useState<number | null>(null);

  // Scanning animation states
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanLogs, setScanLogs] = useState<string[]>([]);

  // State of the editable document
  const [parsedDoc, setParsedDoc] = useState<ParsedAcademicDocument | null>(null);

  // Validation state
  const [isValid, setIsValid] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  // Re-run validation on parsed doc changes
  useEffect(() => {
    if (!parsedDoc) {
      setIsValid(false);
      setErrors([]);
      setWarnings([]);
      return;
    }

    try {
      const payload = mapParsedDocToPayload(parsedDoc);
      const validation = validateImportPayload(payload);
      setIsValid(validation.isValid);
      setErrors(validation.errors);
      setWarnings(validation.warnings);
    } catch (err: unknown) {
      setIsValid(false);
      const msg = err instanceof Error ? err.message : String(err);
      setErrors([`Draft Invariant Failure: ${msg}`]);
      setWarnings([]);
    }
  }, [parsedDoc]);

  // Load a preset template into the active mode
  const loadTemplate = (key: string) => {
    if (ingestMode === "json") {
      setJsonText(MOCK_JSON_TEMPLATES[key].json);
      toast.success(`Loaded ${MOCK_JSON_TEMPLATES[key].name} JSON template!`);
    } else {
      setActiveUniversity(key);
      setOcrText(MOCK_OCR_TEXTS[key]);
      toast.success(`Loaded simulated OCR log for ${MOCK_JSON_TEMPLATES[key].name}!`);
    }
  };

  // Run parser registry over custom ocr log text
  const handleOcrParse = (text: string, presetId: string) => {
    if (!text.trim()) {
      toast.error("Please paste or write transcript raw text logs first.");
      return;
    }

    try {
      const doc = documentParserRegistry.parseDocument(text, presetId);
      // Let's add custom low-confidence simulated results for demonstration if user is parsing standard preset text
      if (text.includes("MA-101") || text.includes("MATH11") || text.includes("MA101BS")) {
        // Intentionally mock a slightly lower confidence on one course grade to showcase the glowing UI cell warning!
        if (doc.semesterHistory[0]?.courses?.[1]) {
          doc.semesterHistory[0].courses[1].grade.confidence = 55; // Ambiguity on Grade 'A+'
          doc.semesterHistory[0].courses[1].credits.confidence = 72; // Ambiguity on Credits
        }
      }
      setParsedDoc(doc);
      toast.success("Transcript parsed successfully with OCR Confidence scoring!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Parser Registry Failure: ${message}`);
    }
  };

  // Simulated OCR Drag and drop trigger
  const runOcrScanAnimation = (presetId: string, fileName: string) => {
    setIsScanning(true);
    setScanLogs([]);

    const logSteps = [
      `[0ms] Ingesting telemetry: ${fileName}...`,
      `[250ms] Initializing OCR optical coordinate matrices...`,
      `[550ms] Running regex character matching patterns...`,
      `[850ms] Correlating structures to Pluggable Regulation Engine (PRE: ${presetId.toUpperCase()})...`,
      `[1150ms] Assigning OCR statistical confidence thresholds...`,
      `[1450ms] Performing mathematical CGPA sum validation...`,
      `[1500ms] Scan completed! Mapping extracted fields to Interactive Review Board.`
    ];

    logSteps.forEach((log, index) => {
      setTimeout(() => {
        setScanLogs(prev => [...prev, log]);
        if (index === logSteps.length - 1) {
          setTimeout(() => {
            setIsScanning(false);
            const mockText = MOCK_OCR_TEXTS[presetId] || MOCK_OCR_TEXTS.sppu;
            setOcrText(mockText);
            handleOcrParse(mockText, presetId);
          }, 300);
        }
      }, index * 220);
    });
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
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const name = file.name.toLowerCase();
    
    if (ingestMode === "json") {
      if (!name.endsWith(".json")) {
        toast.error("JSON Ingestion mode requires a .json file.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setJsonText(text);
        try {
          const parsed = JSON.parse(text);
          const doc = mapPayloadToParsedDoc(parsed);
          setParsedDoc(doc);
          toast.success("JSON Blueprint loaded into draft review!");
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : String(e);
          toast.error(`JSON Parse Error: ${message}`);
        }
      };
      reader.readAsText(file);
    } else {
      // PDF or Images
      if (!name.endsWith(".pdf") && !name.endsWith(".png") && !name.endsWith(".jpg") && !name.endsWith(".jpeg") && !name.endsWith(".json")) {
        toast.error("Unsupported file type. Please upload a PDF, PNG, JPG scan, or paste transcript text.");
        return;
      }

      if (name.endsWith(".json")) {
        // Fallback for json upload in OCR mode
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          try {
            const parsed = JSON.parse(text);
            const doc = mapPayloadToParsedDoc(parsed);
            setParsedDoc(doc);
            setIngestMode("json");
            setJsonText(text);
            toast.success("Switched to JSON mode and loaded blueprint!");
          } catch {
            toast.error("Invalid JSON upload.");
          }
        };
        reader.readAsText(file);
      } else {
        runOcrScanAnimation(activeUniversity, file.name);
      }
    }
  };

  // Trigger JSON parser manually
  const parseJsonBlueprint = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const doc = mapPayloadToParsedDoc(parsed);
      setParsedDoc(doc);
      toast.success("JSON parsed and converted to Interactive Review state.");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      toast.error(`Invalid JSON Syntax: ${message}`);
    }
  };

  // Editable fields modifications
  const updateCgpa = (val: number) => {
    if (!parsedDoc) return;
    setParsedDoc({ ...parsedDoc, currentCgpa: { ...parsedDoc.currentCgpa, value: val } });
  };

  const updateTargetCgpa = (val: number) => {
    if (!parsedDoc) return;
    setParsedDoc({ ...parsedDoc, targetCgpa: { ...parsedDoc.targetCgpa, value: val } });
  };

  const updateBacklogs = (val: number) => {
    if (!parsedDoc) return;
    setParsedDoc({ ...parsedDoc, activeBacklogsCount: { ...parsedDoc.activeBacklogsCount, value: val } });
  };

  const updatePresetId = (id: string) => {
    if (!parsedDoc) return;
    setParsedDoc({ ...parsedDoc, presetId: { ...parsedDoc.presetId, value: id } });
  };

  const updateSemesterField = (semNum: number, field: "sgpa" | "credits" | "earnedCredits", val: number) => {
    if (!parsedDoc) return;
    setParsedDoc({
      ...parsedDoc,
      semesterHistory: parsedDoc.semesterHistory.map(s => {
        if (s.semester.value === semNum) {
          return { ...s, [field]: { ...s[field], value: val } };
        }
        return s;
      })
    });
  };

  const updateSemesterCourseField = (
    semNum: number,
    courseCode: string,
    field: "code" | "name" | "credits" | "grade",
    val: string | number
  ) => {
    if (!parsedDoc) return;
    setParsedDoc({
      ...parsedDoc,
      semesterHistory: parsedDoc.semesterHistory.map(s => {
        if (s.semester.value === semNum) {
          return {
            ...s,
            courses: s.courses?.map(c => {
              if (c.code.value === courseCode) {
                const updatedVal = field === "credits" ? parseFloat(String(val)) || 0 : val;
                return { ...c, [field]: { ...c[field], value: updatedVal } };
              }
              return c;
            })
          };
        }
        return s;
      })
    });
  };

  const addCourseToSemester = (semNum: number) => {
    if (!parsedDoc) return;
    setParsedDoc({
      ...parsedDoc,
      semesterHistory: parsedDoc.semesterHistory.map(s => {
        if (s.semester.value === semNum) {
          const nextIndex = (s.courses?.length || 0) + 1;
          const newCourse = {
            code: { value: `SUB-${semNum}0${nextIndex}`, confidence: 100 },
            name: { value: "New Class Record", confidence: 100 },
            credits: { value: 4, confidence: 100 },
            grade: { value: "A", confidence: 100 }
          };
          return {
            ...s,
            courses: [...(s.courses || []), newCourse]
          };
        }
        return s;
      })
    });
  };

  const deleteCourseFromSemester = (semNum: number, courseCode: string) => {
    if (!parsedDoc) return;
    setParsedDoc({
      ...parsedDoc,
      semesterHistory: parsedDoc.semesterHistory.map(s => {
        if (s.semester.value === semNum) {
          return {
            ...s,
            courses: s.courses?.filter(c => c.code.value !== courseCode)
          };
        }
        return s;
      })
    });
  };

  const updateCurrentCourseField = (
    courseCode: string,
    field: "code" | "name" | "credits" | "cieMarks" | "attendanceTotal" | "attendanceBunked",
    val: string | number
  ) => {
    if (!parsedDoc) return;
    setParsedDoc({
      ...parsedDoc,
      currentSemesterCourses: parsedDoc.currentSemesterCourses?.map(c => {
        if (c.code.value === courseCode) {
          const normalizedVal = ["credits", "cieMarks", "attendanceTotal", "attendanceBunked"].includes(field)
            ? parseInt(String(val), 10) || 0
            : val;
          return {
            ...c,
            [field]: c[field] ? { ...c[field], value: normalizedVal } : { value: normalizedVal, confidence: 100 }
          };
        }
        return c;
      })
    });
  };

  const addCurrentCourse = () => {
    if (!parsedDoc) return;
    const nextIndex = (parsedDoc.currentSemesterCourses?.length || 0) + 1;
    const newCourse: ParsedCurrentCourse = {
      code: { value: `CS-${nextIndex}01`, confidence: 100 },
      name: { value: "New Active Subject", confidence: 100 },
      credits: { value: 4, confidence: 100 },
      cieMarks: { value: 40, confidence: 100 },
      attendanceTotal: { value: 30, confidence: 100 },
      attendanceBunked: { value: 0, confidence: 100 }
    };
    setParsedDoc({
      ...parsedDoc,
      currentSemesterCourses: [...(parsedDoc.currentSemesterCourses || []), newCourse]
    });
  };

  const deleteCurrentCourse = (courseCode: string) => {
    if (!parsedDoc) return;
    setParsedDoc({
      ...parsedDoc,
      currentSemesterCourses: parsedDoc.currentSemesterCourses?.filter(c => c.code.value !== courseCode)
    });
  };

  const addSemester = () => {
    if (!parsedDoc) return;
    const nextSemNum = parsedDoc.semesterHistory.length + 1;
    const newSem: ParsedSemester = {
      semester: { value: nextSemNum, confidence: 100 },
      sgpa: { value: 8.0, confidence: 100 },
      credits: { value: 20, confidence: 100 },
      earnedCredits: { value: 20, confidence: 100 },
      courses: []
    };
    setParsedDoc({
      ...parsedDoc,
      semesterHistory: [...parsedDoc.semesterHistory, newSem]
    });
  };

  const deleteLastSemester = () => {
    if (!parsedDoc || parsedDoc.semesterHistory.length === 0) return;
    setParsedDoc({
      ...parsedDoc,
      semesterHistory: parsedDoc.semesterHistory.slice(0, -1)
    });
  };

  // Reconcile and commit payload to Zustand USM Store
  const commitData = () => {
    if (!parsedDoc) return;
    try {
      const payload = mapParsedDocToPayload(parsedDoc);
      const validation = validateImportPayload(payload);
      if (!validation.isValid || !validation.parsedData) {
        toast.error("Ingestion failed strict academic audit checks. Resolve all blocker errors.");
        return;
      }

      reconcileImportPayload(validation.parsedData, store);
      toast.success("Academic telemetry successfully reconciled with USM store!");
      router.push("/dashboard");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      toast.error(`Reconciliation Aborted: ${msg}`);
    }
  };

  // Grade scale resolution for course selector dropdowns
  const activePreset = parsedDoc?.presetId.value || activeUniversity;
  const activePresetRegistry = getPresetById(activePreset);
  const validPresetGrades = activePresetRegistry
    ? activePresetRegistry.gradeScale.map(g => g.grade)
    : ["O", "A+", "A", "B+", "B", "C", "P", "F"];

  return (
    <div className="min-h-screen text-foreground selection:bg-primary/20 pt-32 pb-20 px-6 max-w-7xl mx-auto space-y-12">
      {/* Laser Scanning Styles injected dynamically */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { top: 0%; opacity: 0.7; }
          50% { top: 100%; opacity: 1; }
          100% { top: 0%; opacity: 0.7; }
        }
        .laser-line {
          position: absolute;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, transparent, #3b82f6, #a855f7, #3b82f6, transparent);
          box-shadow: 0 0 10px #3b82f6, 0 0 20px #a855f7;
          animation: scan 2.5s infinite ease-in-out;
          pointer-events: none;
        }
      ` }} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-black tracking-widest text-blue-400 uppercase">
            Ingestion Gateway
          </span>
          <h1 className="text-4xl font-black tracking-tighter text-white mt-1">
            Smart Academic Import Engine
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Ingest university transcripts via JSON blueprint templates or simulated OCR character-parsing algorithms.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href="/sample-import.json"
            download
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 font-bold hover:bg-white/10 transition text-sm"
          >
            <Download size={16} />
            Download Schema JSON
          </a>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-400 font-bold hover:bg-white/10 hover:text-white transition text-sm text-center"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Control Board (5 columns): Ingest triggers */}
        <div className="lg:col-span-5 space-y-6">
          {/* Mode Selector */}
          <div className="bg-slate-950/40 border border-white/10 rounded-3xl p-2 flex">
            <button
              onClick={() => {
                setIngestMode("ocr");
                setParsedDoc(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold transition-all ${
                ingestMode === "ocr"
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles size={16} />
              Smart OCR Scanner
            </button>
            <button
              onClick={() => {
                setIngestMode("json");
                setParsedDoc(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold transition-all ${
                ingestMode === "json"
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Database size={16} />
              JSON Blueprint Mode
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="text-purple-400 animate-pulse" size={20} />
              <h3 className="text-sm font-black uppercase text-white tracking-wider">Regulation Presets</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Load university transcript layouts. In OCR mode, this pre-loads simulated OCR raw texts.
            </p>
            <div className="flex flex-col gap-2.5">
              {Object.keys(MOCK_JSON_TEMPLATES).map((key) => (
                <button
                  key={key}
                  onClick={() => loadTemplate(key)}
                  className={`flex items-start justify-between p-3.5 rounded-2xl bg-white/5 border transition text-left group ${
                    activeUniversity === key && ingestMode === "ocr"
                      ? "border-blue-500/50 bg-blue-500/5"
                      : "border-white/5 hover:border-blue-500/30"
                  }`}
                >
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white group-hover:text-blue-400 transition">
                      {MOCK_JSON_TEMPLATES[key].name}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-snug">
                      {MOCK_JSON_TEMPLATES[key].description}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-slate-500 mt-1 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>

          {/* Interactive File Dropzone */}
          <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="text-blue-400" size={18} />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  {ingestMode === "json" ? "Upload JSON Blueprint" : "Optical Scanning Bay"}
                </h3>
              </div>
            </div>

            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`relative border border-dashed border-white/20 rounded-2xl overflow-hidden min-h-[160px] flex flex-col items-center justify-center p-6 text-center transition-all ${
                dragActive ? "border-blue-500 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]" : "hover:border-white/30"
              }`}
            >
              {/* Scan Overlays */}
              {isScanning && (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl flex flex-col justify-center px-6 py-4 z-50 text-left font-mono">
                  <div className="laser-line" />
                  <div className="flex items-center gap-2 mb-3">
                    <Loader2 size={16} className="animate-spin text-blue-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-widest animate-pulse">Scanning Document...</span>
                  </div>
                  <div className="space-y-1 overflow-y-auto max-h-[110px] text-[10px] text-slate-400 select-none scrollbar-thin">
                    {scanLogs.map((log, idx) => (
                      <div key={idx} className={idx === scanLogs.length - 1 ? "text-emerald-400 font-bold" : ""}>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Upload size={32} className="text-slate-500 mb-3" />
              <p className="text-sm font-bold text-slate-300">
                {ingestMode === "json"
                  ? "Drag & drop your academic .json file here"
                  : "Drag & drop image scan or PDF transcript"}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-[280px] leading-relaxed">
                {ingestMode === "json"
                  ? "Standard JSON schema blueprint imports directly."
                  : "PNG, JPG, or PDF. We will simulate OCR scanning sweep & regulatory mappings."}
              </p>
              
              <label className="mt-4 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/10 transition cursor-pointer">
                Select File
                <input
                  type="file"
                  accept={ingestMode === "json" ? ".json" : ".json,.pdf,.png,.jpg,.jpeg"}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Paste Raw Text Workspace (only for OCR mode) */}
          {ingestMode === "ocr" && (
            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="text-blue-400" size={18} />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">Raw Transcript OCR Log</h3>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      setOcrText(text);
                      toast.success("Pasted transcript logs!");
                    } catch {
                      toast.error("Could not read clipboard. Paste manually.");
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition font-bold"
                >
                  <Clipboard size={12} />
                  Paste Logs
                </button>
              </div>

              <textarea
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                placeholder="SAVITRIBAI PHULE PUNE UNIVERSITY...&#10;SEMESTER 1...&#10;CS-101 Programming 4 A...&#10;SGPA: 8.10"
                className="w-full h-44 bg-slate-950/60 p-4 font-mono text-[11px] text-slate-300 border border-white/5 focus:border-blue-500 rounded-2xl focus:outline-none resize-none leading-relaxed"
              />

              <button
                onClick={() => handleOcrParse(ocrText, activeUniversity)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 hover:border-blue-500/40 transition active:scale-[0.99]"
              >
                <Play size={12} />
                Run OCR Text Parser Registry
              </button>
            </div>
          )}

          {/* Paste Raw JSON (only for JSON mode) */}
          {ingestMode === "json" && (
            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="text-blue-400" size={18} />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">JSON Workspace</h3>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      setJsonText(text);
                      toast.success("Pasted JSON payload!");
                    } catch {
                      toast.error("Could not read clipboard.");
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition font-bold"
                >
                  <Clipboard size={12} />
                  Paste
                </button>
              </div>

              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder='{ "presetId": "sppu", "currentCgpa": 8.24, ... }'
                className="w-full h-64 bg-slate-950/60 p-4 font-mono text-[11px] text-slate-300 border border-white/5 focus:border-blue-500 rounded-2xl focus:outline-none resize-none leading-relaxed"
              />

              <button
                onClick={parseJsonBlueprint}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 hover:border-blue-500/40 transition"
              >
                Parse JSON Blueprint
              </button>
            </div>
          )}
        </div>

        {/* Right Preview & Review Table (7 columns) */}
        <div className="lg:col-span-7 space-y-6">
          {parsedDoc ? (
            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 backdrop-blur-xl space-y-6">
              {/* Header stats and controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Grid className="text-blue-400" size={18} />
                    <h3 className="text-lg font-black text-white">Interactive Review Board</h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    Verify and correct character-confidence flags before database commit.
                  </p>
                </div>

                {/* Tab switcher */}
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 self-start">
                  <button
                    onClick={() => setActiveTab("history")}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === "history"
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <History size={13} />
                    Completed Semesters
                  </button>
                  <button
                    onClick={() => setActiveTab("current")}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === "current"
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <BookOpen size={13} />
                    Active Courses
                  </button>
                </div>
              </div>

              {/* Core stats block - fully editable inputs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 text-left">
                {/* Preset SELECT */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Preset system</span>
                  <select
                    value={parsedDoc.presetId.value}
                    onChange={(e) => updatePresetId(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-2 py-1 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="sppu">SPPU</option>
                    <option value="vtu">VTU</option>
                    <option value="jntuh">JNTUH</option>
                  </select>
                </div>

                {/* Current CGPA */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Current CGPA</span>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={parsedDoc.currentCgpa.value}
                      onChange={(e) => updateCgpa(parseFloat(e.target.value) || 0)}
                      className={`w-full bg-slate-900 border rounded-xl px-2.5 py-1 text-xs font-mono font-bold text-white focus:outline-none focus:border-blue-500 ${
                        parsedDoc.currentCgpa.confidence < 80 ? "border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/20" : "border-white/10"
                      }`}
                    />
                    {parsedDoc.currentCgpa.confidence < 80 && (
                      <span className="absolute -top-6 left-0 bg-amber-500 text-[8px] text-black font-extrabold px-1 py-0.5 rounded shadow">
                        OCR {parsedDoc.currentCgpa.confidence}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Target CGPA */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Target CGPA</span>
                  <input
                    type="number"
                    step="0.01"
                    value={parsedDoc.targetCgpa.value}
                    onChange={(e) => updateTargetCgpa(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1 text-xs font-mono font-bold text-purple-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Backlogs */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Backlogs count</span>
                  <input
                    type="number"
                    value={parsedDoc.activeBacklogsCount.value}
                    onChange={(e) => updateBacklogs(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1 text-xs font-mono font-bold text-rose-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Tab 1: Semester History Grid with nested courses */}
              {activeTab === "history" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white uppercase tracking-wider">Completed Semester Matrices</span>
                    <div className="flex gap-2">
                      <button
                        onClick={addSemester}
                        className="flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-white transition"
                      >
                        <Plus size={12} />
                        Add Semester
                      </button>
                      {parsedDoc.semesterHistory.length > 0 && (
                        <button
                          onClick={deleteLastSemester}
                          className="flex items-center gap-1 text-[11px] font-bold text-rose-400 hover:text-white transition"
                        >
                          <Trash2 size={12} />
                          Remove Last
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-white/10 rounded-2xl bg-slate-900/10">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/5 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-white/10">
                          <th className="p-3">Sem</th>
                          <th className="p-3">SGPA</th>
                          <th className="p-3">Reg. Credits</th>
                          <th className="p-3">Earned Credits</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-xs">
                        {parsedDoc.semesterHistory.map((sem) => {
                          const isExpanded = expandedSemester === sem.semester.value;
                          const showSgpaWarning = sem.sgpa.confidence < 80;
                          
                          return (
                            <React.Fragment key={sem.semester.value}>
                              <tr className="hover:bg-white/[0.02] transition">
                                <td className="p-3 font-bold text-white">Sem {sem.semester.value}</td>
                                
                                {/* SGPA Input */}
                                <td className="p-3">
                                  <div className="relative max-w-[80px]">
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={sem.sgpa.value}
                                      onChange={(e) => updateSemesterField(sem.semester.value, "sgpa", parseFloat(e.target.value) || 0)}
                                      className={`w-full bg-slate-900/60 border rounded-lg px-2 py-0.5 font-mono text-xs font-bold text-emerald-400 focus:outline-none focus:border-blue-500 ${
                                        showSgpaWarning ? "border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/20" : "border-white/10"
                                      }`}
                                    />
                                    {showSgpaWarning && (
                                      <span className="absolute -top-4 left-0 bg-amber-500 text-[7px] text-black font-extrabold px-1 rounded">
                                        OCR {sem.sgpa.confidence}%
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* Registered Credits */}
                                <td className="p-3">
                                  <input
                                    type="number"
                                    value={sem.credits.value}
                                    onChange={(e) => updateSemesterField(sem.semester.value, "credits", parseFloat(e.target.value) || 0)}
                                    className={`max-w-[70px] bg-slate-900/60 border rounded-lg px-2 py-0.5 font-mono text-xs text-slate-300 focus:outline-none focus:border-blue-500 ${
                                      sem.credits.confidence < 80 ? "border-amber-500/50 bg-amber-500/5" : "border-white/10"
                                    }`}
                                  />
                                </td>

                                {/* Earned Credits */}
                                <td className="p-3">
                                  <input
                                    type="number"
                                    value={sem.earnedCredits.value}
                                    onChange={(e) => updateSemesterField(sem.semester.value, "earnedCredits", parseFloat(e.target.value) || 0)}
                                    className={`max-w-[70px] bg-slate-900/60 border rounded-lg px-2 py-0.5 font-mono text-xs text-slate-300 focus:outline-none focus:border-blue-500 ${
                                      sem.earnedCredits.confidence < 80 ? "border-amber-500/50 bg-amber-500/5" : "border-white/10"
                                    }`}
                                  />
                                </td>

                                <td className="p-3 text-right">
                                  <button
                                    onClick={() => setExpandedSemester(isExpanded ? null : sem.semester.value)}
                                    className="text-[11px] font-bold text-blue-400 hover:underline mr-2"
                                  >
                                    {isExpanded ? "Hide Classes" : `Show Classes (${sem.courses?.length || 0})`}
                                  </button>
                                </td>
                              </tr>

                              {/* Expanded Course Matrix details */}
                              {isExpanded && (
                                <tr className="bg-slate-900/40">
                                  <td colSpan={5} className="p-4 border-t border-white/5">
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between border-b border-white/5 pb-1">
                                        <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">
                                          Semester {sem.semester.value} Course List
                                        </span>
                                        <button
                                          onClick={() => addCourseToSemester(sem.semester.value)}
                                          className="text-[10px] font-bold text-blue-400 hover:text-white flex items-center gap-0.5 transition"
                                        >
                                          <Plus size={10} />
                                          Add Course Row
                                        </button>
                                      </div>

                                      {sem.courses && sem.courses.length > 0 ? (
                                        <div className="space-y-2">
                                          {sem.courses.map((c, cIdx) => {
                                            const codeAlert = c.code.confidence < 80;
                                            const gradeAlert = c.grade.confidence < 80;
                                            
                                            return (
                                              <div
                                                key={cIdx}
                                                className="flex flex-wrap items-center gap-3 p-2 bg-slate-950/60 rounded-xl border border-white/5 hover:border-white/10"
                                              >
                                                {/* Code */}
                                                <div className="relative flex-1 min-w-[80px]">
                                                  <input
                                                    type="text"
                                                    value={c.code.value}
                                                    onChange={(e) => updateSemesterCourseField(sem.semester.value, c.code.value, "code", e.target.value)}
                                                    className={`w-full bg-slate-900 border rounded-lg px-2 py-1 font-mono text-[11px] text-white focus:outline-none ${
                                                      codeAlert ? "border-amber-500/50 bg-amber-500/5" : "border-white/10"
                                                    }`}
                                                    placeholder="CS101"
                                                  />
                                                  {codeAlert && (
                                                    <span className="absolute -top-3.5 left-0 bg-amber-500 text-[6px] text-black font-black px-1 rounded">
                                                      OCR {c.code.confidence}%
                                                    </span>
                                                  )}
                                                </div>

                                                {/* Name */}
                                                <input
                                                  type="text"
                                                  value={c.name.value}
                                                  onChange={(e) => updateSemesterCourseField(sem.semester.value, c.code.value, "name", e.target.value)}
                                                  className="flex-[2.5] min-w-[150px] bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none"
                                                  placeholder="Course Name"
                                                />

                                                {/* Credits */}
                                                <input
                                                  type="number"
                                                  value={c.credits.value}
                                                  onChange={(e) => updateSemesterCourseField(sem.semester.value, c.code.value, "credits", e.target.value)}
                                                  className={`w-[60px] bg-slate-900 border rounded-lg px-2 py-1 font-mono text-[11px] text-slate-400 focus:outline-none ${
                                                    c.credits.confidence < 80 ? "border-amber-500/50 bg-amber-500/5" : "border-white/10"
                                                  }`}
                                                  placeholder="Credits"
                                                />

                                                {/* Grade Dropdown matched dynamically to regulations */}
                                                <div className="relative min-w-[70px]">
                                                  <select
                                                    value={c.grade.value}
                                                    onChange={(e) => updateSemesterCourseField(sem.semester.value, c.code.value, "grade", e.target.value)}
                                                    className={`w-full bg-slate-900 border rounded-lg px-2 py-1 font-mono font-bold text-[11px] text-purple-400 focus:outline-none ${
                                                      gradeAlert ? "border-amber-500/50 bg-amber-500/5" : "border-white/10"
                                                    }`}
                                                  >
                                                    {validPresetGrades.map((grade) => (
                                                      <option key={grade} value={grade}>{grade}</option>
                                                    ))}
                                                  </select>
                                                  {gradeAlert && (
                                                    <span className="absolute -top-3.5 left-0 bg-amber-500 text-[6px] text-black font-black px-1 rounded">
                                                      OCR {c.grade.confidence}%
                                                    </span>
                                                  )}
                                                </div>

                                                {/* Delete button */}
                                                <button
                                                  onClick={() => deleteCourseFromSemester(sem.semester.value, c.code.value)}
                                                  className="p-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition shrink-0"
                                                >
                                                  <Trash2 size={12} />
                                                </button>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      ) : (
                                        <p className="text-[11px] text-slate-500 text-center py-4">No individual courses. Telemetry will rely on SGPA aggregators.</p>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 2: Current Semester courses grid */}
              {activeTab === "current" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white uppercase tracking-wider">Active Semester Telemetry</span>
                    <button
                      onClick={addCurrentCourse}
                      className="flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-white transition"
                    >
                      <Plus size={12} />
                      Add Active Course
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-white/10 rounded-2xl bg-slate-900/10">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/5 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-white/10">
                          <th className="p-3">Code</th>
                          <th className="p-3">Course Title</th>
                          <th className="p-3 text-center">Credits</th>
                          <th className="p-3 text-center">CIE Marks</th>
                          <th className="p-3 text-center">Bunked/Total</th>
                          <th className="p-3 text-right">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-xs">
                        {parsedDoc.currentSemesterCourses && parsedDoc.currentSemesterCourses.length > 0 ? (
                          parsedDoc.currentSemesterCourses.map((c) => (
                            <tr key={c.code.value} className="hover:bg-white/[0.02] transition">
                              {/* Code */}
                              <td className="p-3 font-mono text-white">
                                <input
                                  type="text"
                                  value={c.code.value}
                                  onChange={(e) => updateCurrentCourseField(c.code.value, "code", e.target.value)}
                                  className="w-[80px] bg-slate-900/60 border border-white/10 rounded px-2 py-0.5 font-mono text-[11px] text-white focus:outline-none focus:border-blue-500"
                                />
                              </td>

                              {/* Title */}
                              <td className="p-3">
                                <input
                                  type="text"
                                  value={c.name.value}
                                  onChange={(e) => updateCurrentCourseField(c.code.value, "name", e.target.value)}
                                  className="w-full bg-slate-900/60 border border-white/10 rounded px-2 py-0.5 text-[11px] text-slate-300 focus:outline-none focus:border-blue-500"
                                />
                              </td>

                              {/* Credits */}
                              <td className="p-3 text-center">
                                <input
                                  type="number"
                                  value={c.credits.value}
                                  onChange={(e) => updateCurrentCourseField(c.code.value, "credits", e.target.value)}
                                  className="max-w-[45px] bg-slate-900/60 border border-white/10 rounded px-1.5 py-0.5 text-center font-mono text-[11px] text-slate-400 focus:outline-none"
                                />
                              </td>

                              {/* CIE Marks */}
                              <td className="p-3 text-center">
                                <input
                                  type="number"
                                  value={c.cieMarks?.value || 0}
                                  onChange={(e) => updateCurrentCourseField(c.code.value, "cieMarks", e.target.value)}
                                  className="max-w-[45px] bg-slate-900/60 border border-white/10 rounded px-1.5 py-0.5 text-center font-mono text-[11px] text-slate-400 focus:outline-none"
                                />
                              </td>

                              {/* Attendance Bunks/Total */}
                              <td className="p-3 text-center">
                                <div className="flex items-center gap-1 justify-center font-mono">
                                  <input
                                    type="number"
                                    value={c.attendanceBunked?.value || 0}
                                    onChange={(e) => updateCurrentCourseField(c.code.value, "attendanceBunked", e.target.value)}
                                    className="max-w-[35px] bg-slate-900/60 border border-white/10 rounded px-1.5 py-0.5 text-center text-[11px] text-rose-400 focus:outline-none"
                                    title="Classes Bunked"
                                  />
                                  <span className="text-slate-600">/</span>
                                  <input
                                    type="number"
                                    value={c.attendanceTotal?.value || 0}
                                    onChange={(e) => updateCurrentCourseField(c.code.value, "attendanceTotal", e.target.value)}
                                    className="max-w-[35px] bg-slate-900/60 border border-white/10 rounded px-1.5 py-0.5 text-center text-[11px] text-emerald-400 focus:outline-none"
                                    title="Total Classes Conducted"
                                  />
                                </div>
                              </td>

                              <td className="p-3 text-right">
                                <button
                                  onClick={() => deleteCurrentCourse(c.code.value)}
                                  className="p-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                              No active semester courses tracked. Click &quot;Add Active Course&quot; above to initiate tracker.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Reactive Blocker Alert Board */}
              <div
                className={`rounded-2xl border p-4 space-y-3 transition-colors ${
                  isValid
                    ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.05)]"
                    : "border-rose-500/30 bg-rose-500/5 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.05)]"
                }`}
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    {isValid ? (
                      <CheckCircle className="text-emerald-400 shrink-0" size={16} />
                    ) : (
                      <AlertCircle className="text-rose-400 shrink-0" size={16} />
                    )}
                    <span className="text-xs font-black uppercase tracking-wider">
                      {isValid ? "Academic Audit cleared: 100% Valid" : "Audit Invariant blockages detected"}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded text-slate-300 uppercase">
                    {parsedDoc.presetId.value} regulations
                  </span>
                </div>

                {/* Errors (Blockers) List */}
                {errors.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black uppercase tracking-wider text-rose-400">Strict blockages ({errors.length})</p>
                    <ul className="space-y-1 text-xs list-disc pl-4 text-slate-300 leading-relaxed font-sans">
                      {errors.map((err, idx) => (
                        <li key={idx} className="marker:text-rose-500">{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Warnings List */}
                {warnings.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-400">
                      <AlertTriangle size={12} className="shrink-0" />
                      Advisories & warnings ({warnings.length})
                    </div>
                    <ul className="space-y-1 text-[11px] list-disc pl-4 text-slate-400 leading-relaxed">
                      {warnings.map((warn, idx) => (
                        <li key={idx} className="marker:text-amber-500">{warn}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {isValid && errors.length === 0 && warnings.length === 0 && (
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Perfect academic records matched! All invariants, rounding ratios, and duplicate code checks validated successfully.
                  </p>
                )}
              </div>

              {/* Ingestion Warning warning */}
              <div className="flex gap-3 text-xs bg-slate-900 border border-white/5 rounded-2xl p-4 text-slate-400 leading-relaxed">
                <Info className="text-blue-400 shrink-0" size={16} />
                <div className="space-y-1">
                  <p className="font-bold text-white">Academic OS State Synchronization</p>
                  <p>
                    Committing these records will realign the central USM state, flush current forecasts, and update strategy allocations.
                  </p>
                </div>
              </div>

              {/* Commit Trigger Button */}
              <button
                onClick={commitData}
                disabled={!isValid}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-black text-xs uppercase tracking-widest transition-all ${
                  isValid
                    ? "bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-xl shadow-blue-500/10"
                    : "bg-slate-900 text-slate-500 border border-white/5 cursor-not-allowed"
                }`}
              >
                {isValid ? (
                  <>
                    <Database size={16} />
                    Commit & Reconcile Academic Records
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} className="text-rose-500 animate-pulse" />
                    Ingestion Blocked: Resolve Audit Blockages
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-slate-950/20 p-12 text-center flex flex-col items-center justify-center space-y-6 h-full min-h-[500px]">
              <div className="p-4 rounded-full bg-white/5 text-slate-500 animate-pulse">
                <FileText size={36} />
              </div>
              <div className="space-y-2 max-w-sm">
                <h4 className="text-sm font-black text-white uppercase tracking-widest">
                  Review Board Standby
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Ingest student data on the left to activate the review dashboard. Upload a grade card image, select a university preset template, or copy-paste raw logs.
                </p>
              </div>
              
              {/* Easy demo start */}
              <div className="flex gap-2 flex-wrap justify-center pt-2">
                <button
                  onClick={() => loadTemplate("sppu")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/40 text-xs font-bold text-slate-300 hover:text-white transition"
                >
                  SPPU Demo
                  <ArrowRight size={12} />
                </button>
                <button
                  onClick={() => loadTemplate("vtu")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/40 text-xs font-bold text-slate-300 hover:text-white transition"
                >
                  VTU Demo
                  <ArrowRight size={12} />
                </button>
                <button
                  onClick={() => loadTemplate("jntuh")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/40 text-xs font-bold text-slate-300 hover:text-white transition"
                >
                  JNTUH Demo
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
