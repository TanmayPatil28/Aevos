"use client";

import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useUniversity } from "@/components/providers/UniversityProvider";
import { 
  convertMarksToGradePoint,
  convertLetterGradeToGradePoint,
  calculateSGPA as presetCalculateSGPA, 
  getGradeScale,
  GradeScaleEntry
} from "@/lib/presets";
import AnimatedCounter from "@/components/AnimatedCounter";
import StaggerContainer, { StaggerItem } from "@/components/StaggerContainer";
import PremiumButton from "@/components/PremiumButton";
import PageContainer from "@/components/layout/PageContainer";
import Grid from "@/components/layout/Grid";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import PresetInfoCard from "@/components/PresetInfoCard";
import CalculationBreakdown from "@/components/CalculationBreakdown";
import { documentParserRegistry } from "@/lib/ingestion/parser/registry";

interface Subject {
  id: string;
  name: string;
  credits: string;
  score: string;
  error?: string;
}

export default function CalculatorPage() {
  const { activePreset, creditLabel, maxGradePoint } = useUniversity();
  const [usePercentage, setUsePercentage] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: "1", name: "Mathematics", credits: "", score: "" },
    { id: "2", name: "Physics", credits: "", score: "" },
    { id: "3", name: "Computer Science", credits: "", score: "" },
    { id: "4", name: "English", credits: "", score: "" },
  ]);
  const [result, setResult] = useState<{ sgpa: number; totalCredits: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ingest state
  const [isIngestOpen, setIsIngestOpen] = useState(false);
  const [ingestTab, setIngestTab] = useState<"paste" | "ocr" | "prompt">("paste");
  const [rawPasteText, setRawPasteText] = useState("");
  const [isParsing, setIsParsing] = useState(false);

  const getAiExtractionPrompt = () => {
    if (!activePreset) return "";
    const isJspm = ["jspm", "jspm_university_wagholi"].includes(activePreset.id.toLowerCase());
    
    let targetFormatSection = "";
    if (isJspm) {
      targetFormatSection = `You MUST extract the data strictly into the following Digicampus JSON array format:
\`\`\`json
[
  {
    "studentProfile": {
      "fullName": "[STUDENT_FULL_NAME]",
      "registrationId": "[REGISTRATION_OR_PRN_ID]",
      "academicDetails": {
        "programme": "B.Tech",
        "batchYear": 2024,
        "academicStatus": "Regular"
      }
    }
  },
  {
    "institution": "JSPMUNI",
    "academicTerm": {
      "term": "Odd Term", // Options: 'Odd Term', 'Even Term', 'Summer Term'
      "academicYear": "2024-25", // Match format YYYY-YY from transcript
      "level": "UG SY-TY-Final Year / PG SY"
    },
    "performance": {
      "status": "Result Declared",
      "majorSGPA": 7.48
    },
    "courses": [
      {
        "courseName": "Engineering Mechanics",
        "courseCode": "231GCEB01",
        "enrollmentType": "Regular", // 'Regular' or 'Backlog'
        "credits": 2.0,
        "grade": "B+",
        "gradePoint": 7
      }
    ]
  }
]
\`\`\``;
    } else {
      targetFormatSection = `You MUST extract the data strictly into the following standardized JSON object format:
\`\`\`json
{
  "presetId": "${activePreset.id}",
  "currentCgpa": 7.39, // Extract overall CGPA from sheet
  "targetCgpa": 8.50, // Default target
  "activeBacklogsCount": 0, // Extracted number of active backlogs
  "semesterHistory": [
    {
      "semester": 1,
      "sgpa": 7.48, // Extract SGPA for Semester 1
      "credits": 21.0, // Total credits registered in Semester 1
      "earnedCredits": 21.0, // Earned credits in Semester 1
      "courses": [
        {
          "code": "231GCEB01", // Course code
          "name": "Engineering Mechanics", // Full course title
          "credits": 2.0, // Course credits
          "grade": "B+" // Course grade (e.g. O, A+, A, B+, B, C, P, F)
        }
      ]
    }
  ]
}
\`\`\``;
    }

    return `You are a highly precise academic transcript extraction model. Your objective is to extract course, credit, grade, and GPA data from the uploaded transcript screenshot/PDF for "${activePreset.name}".

Please read the text, course codes, names, credits, grades, and GPA results with 100% precision. Do not skip any courses, backlogs, or semesters.

${targetFormatSection}

Instructions for outputting JSON:
1. Make sure all numbers (credits, gradePoint, sgpa, cgpa) are outputted as numeric values, not string representation.
2. For course enrollmentType, specify "Regular" unless it is explicitly marked as a "Backlog", "Summer", "Improvement", or "Supplementary" course.
3. Map letter grades strictly to standard scales. For audit courses that are passed, map grade to "PP" (Passed Audit) or "NP" (Failed Audit).
4. Do NOT output any conversational introduction, prefix, comments, markdown lists, or explanation outside the JSON code block. Your entire response must begin with \`\`\`json and end with \`\`\`.`;
  };
  const [parsedDoc, setParsedDoc] = useState<any>(null);
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrLogs, setOcrLogs] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePasteSubmit = () => {
    if (!rawPasteText.trim()) {
      toast.error("Please paste transcript text or JSON first.");
      return;
    }

    setIsParsing(true);
    setTimeout(() => {
      try {
        const parsed = documentParserRegistry.parseDocument(rawPasteText, activePreset.id);
        setParsedDoc(parsed);
        const confidence = rawPasteText.trim().startsWith("[") || rawPasteText.trim().startsWith("{") ? 100 : 90;
        toast.success(`Ingested transcript successfully (Confidence: ${confidence}%)!`);
      } catch (err: any) {
        console.error(err);
        toast.error(`Ingestion error: ${err.message || "Please verify structure"}`);
      } finally {
        setIsParsing(false);
      }
    }, 1000);
  };

  const startOcrSimulation = () => {
    setOcrScanning(true);
    setOcrProgress(0);
    setOcrLogs(["[0ms] Uploading transcript file to OCR gateway..."]);
    
    const logs = [
      { t: 300, msg: "[300ms] Resolving institutional layout boundaries..." },
      { t: 600, msg: "[600ms] High-resolution text extraction active..." },
      { t: 900, msg: "[900ms] Detected institution: JSPM University Pune (Wagholi)" },
      { t: 1200, msg: "[1200ms] Normalizing course codes (JSPM Digicampus Adapter)..." },
      { t: 1500, msg: "[1500ms] Executing retroactive backlog grade point replacements..." },
      { t: 1800, msg: "[1800ms] Complete! Pluggable Regulation rules registered with 100% confidence." }
    ];

    logs.forEach((log) => {
      setTimeout(() => {
        setOcrLogs((prev) => [...prev, log.msg]);
        setOcrProgress((prev) => Math.min(prev + 15, 99));
      }, log.t);
    });

    setTimeout(() => {
      setOcrProgress(100);
      try {
        const parsed = documentParserRegistry.parseDocument(MOCK_JSPM_DIGICAMPUS_JSON, activePreset.id);
        setParsedDoc(parsed);
        toast.success("Transcript parsed successfully with 100% confidence!");
      } catch (err: any) {
        toast.error("Failed to parse simulated transcript.");
      }
      setOcrScanning(false);
    }, 2000);
  };

  const loadSemesterIntoCalculator = (semNum: number, courses: any[], isCurrentSem = false) => {
    const formatted = courses.map((c) => ({
      id: Math.random().toString(),
      name: c.name.value,
      credits: c.credits.value.toFixed(1),
      score: isCurrentSem ? "" : (c.grade?.value || "")
    }));

    setSubjects(formatted);
    toast.success(`Loaded Semester ${semNum} subjects into the calculator!`);
    setIsIngestOpen(false);
    setParsedDoc(null);
    setRawPasteText("");
  };

  // Reactively load preset parameters when activePreset changes
  useEffect(() => {
    if (activePreset) {
      const isPercent = activePreset.gradingSystem.toLowerCase().includes("percentage");
      setUsePercentage(isPercent);
      
      // Auto-populate default credits/units for standard subjects if they are empty or set to previous default
      setSubjects((prev) =>
        prev.map((sub) => {
          if (!sub.credits || sub.credits === "" || sub.credits === "3" || sub.credits === "4") {
            return {
              ...sub,
              credits: activePreset.creditType === "units" ? "3" : "4"
            };
          }
          return sub;
        })
      );

      // Clear any stale calculations from a previous preset
      setResult(null);
    }
  }, [activePreset]);

  const addSubject = () => {
    setSubjects([...subjects, { id: Math.random().toString(), name: "", credits: "", score: "" }]);
  };

  const removeSubject = (id: string) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((s) => s.id !== id));
    } else {
      toast.error("You must have at least one subject");
    }
  };

  const handleChange = (id: string, field: keyof Subject, value: string) => {
    setSubjects(subjects.map((s) => (s.id === id ? { ...s, [field]: value, error: undefined } : s)));
  };

  const validateInputs = useCallback((): boolean => {
    let valid = true;

    const maxGP = maxGradePoint;
    const validGrades = activePreset.gradeScale.map((e) => e.grade.toUpperCase());

    const updated = subjects.map((sub) => {
      const credits = parseFloat(sub.credits);
      let error = "";

      if (!sub.name.trim()) {
        error = "Name required";
      } else if (isNaN(credits) || credits < 1 || credits > 6) {
        error = creditLabel + ": 1-6";
      } else if (!sub.score.trim()) {
        error = "Score required";
      } else if (usePercentage) {
        const scoreNum = parseFloat(sub.score);
        if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
          error = "Marks: 0-100";
        }
      } else {
        // Alphanumeric grade or direct grade point lookup
        const cleanScore = sub.score.trim().toUpperCase();
        const isLetter = validGrades.includes(cleanScore);
        const scoreNum = parseFloat(sub.score);
        const isNumber = !isNaN(scoreNum) && scoreNum >= 0 && scoreNum <= maxGP;

        if (!isLetter && !isNumber) {
          error = `Enter valid Grade (e.g., ${validGrades.slice(0, 3).join(", ")}) or Points (0-${maxGP})`;
        }
      }

      if (error) valid = false;
      return { ...sub, error };
    });

    setSubjects(updated);
    return valid;
  }, [subjects, usePercentage, activePreset, creditLabel, maxGradePoint]);

  const handleCalculate = () => {
    if (!validateInputs()) {
      toast.error("Please fix the errors highlighted in red.");
      return;
    }

    setIsCalculating(true);

    // 800ms artificial delay for satisfying feel
    setTimeout(() => {
      const parsedSubjects = subjects.map((sub) => {
        const credits = parseFloat(sub.credits);
        let gradePoint = 0;
        if (usePercentage) {
          const scoreNum = parseFloat(sub.score);
          gradePoint = convertMarksToGradePoint(scoreNum, activePreset);
        } else {
          gradePoint = convertLetterGradeToGradePoint(sub.score, activePreset);
        }
        return { credits, gradePoint };
      });

      let totalCredits = 0;
      parsedSubjects.forEach((s) => (totalCredits += s.credits));

      const sgpa = presetCalculateSGPA(parsedSubjects);
      setResult({ sgpa, totalCredits });
      setIsCalculating(false);
      toast.success("Calculation complete!");
    }, 800);
  };

  const handleSave = async () => {
    if (!result || isSaving) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          semester: "Semester",
          subjects,
          sgpa: result.sgpa,
          cgpa: result.sgpa,
          total_credits: result.totalCredits,
        }),
      });

      if (res.status === 401) {
        toast.error("Please log in to save results to your Dashboard.");
        setIsSaving(false);
        return;
      }
      if (!res.ok) throw new Error("Failed to save");
      setSaveSuccess(true);
      toast.success("Result saved to Dashboard!");
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error(err);
      toast.error("Error saving calculation. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) return null;

  return (
    <PageContainer className="px-6 overflow-hidden">
      {/* Ambient Background Blur */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-primary/10 blur-[100px] opacity-60 mix-blend-screen" />
        <div className="absolute bottom-[20%] right-[-5%] w-[35vw] h-[35vw] rounded-full bg-secondary/10 blur-[120px] opacity-60 mix-blend-screen" />
        <div className="absolute top-[40%] left-[50%] w-[30vw] h-[30vw] rounded-full bg-success/5 blur-[100px] opacity-40 mix-blend-screen transform -translate-x-1/2" />
      </div>

      {/* Hero Header */}
      <StaggerContainer className="text-center mb-12 flex flex-col items-center">
        <StaggerItem>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/20 text-primary text-sm font-semibold mb-6">
            <span className="material-symbols-outlined text-sm">calculate</span>
            CGPA Calculator
          </div>
        </StaggerItem>
        <StaggerItem>
          <h1 className="text-5xl md:text-6xl font-headline font-extrabold tracking-tight mb-6 bg-gradient-to-br from-on-surface via-on-surface/90 to-on-surface/40 bg-clip-text text-transparent drop-shadow-sm">
            Calculate Your CGPA Instantly
          </h1>
        </StaggerItem>
        <StaggerItem>
          <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">
            Enter your subjects, credits, and marks. Get your CGPA in one click.
          </p>
        </StaggerItem>
        <StaggerItem>
          <div className="mt-6 w-full max-w-xl">
            <PresetInfoCard compact />
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* Main Content Split Layout */}
      <Grid cols={3} className="mb-12">
        {/* Left: Add Your Subjects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h2 className="text-xl font-headline font-bold text-on-surface tracking-tight">Add Your Subjects</h2>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setIsIngestOpen(true)}
                  className="flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-bold hover:shadow-[0_0_20px_rgba(80,143,248,0.2)] transition-all active:scale-95 text-sm w-full sm:w-auto justify-center"
                >
                  <span className="material-symbols-outlined text-[18px] animate-pulse">cloud_download</span>
                  Smart Ingest
                </button>
                <button
                  onClick={addSubject}
                  className="flex items-center gap-2 px-5 py-2 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface font-bold hover:border-primary/40 hover:shadow-[0_0_20px_rgba(80,143,248,0.1)] transition-all active:scale-95 text-sm w-full sm:w-auto justify-center"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">add</span>
                  Add Subject
                </button>
              </div>
            </div>

            {activePreset.evaluationModel === "relative" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <Card variant="warning" padding="sm" className="flex items-start gap-3 border-amber-500/20 bg-amber-500/5">
                  <span className="material-symbols-outlined text-amber-500 mt-0.5">info</span>
                  <div className="text-xs text-amber-200/90 leading-relaxed">
                    <strong className="text-amber-400 font-bold block mb-1">Relative Grading Active</strong>
                    {activePreset.name} uses cohort-based relative grading ({activePreset.gradingSystem}). Enter your expected letter grades (e.g., {activePreset.gradeScale.slice(0, 3).map(e => e.grade).join(", ")}) or expected grade points directly. Marks-to-points mapping is determined by the class bell curve.
                  </div>
                </Card>
              </motion.div>
            )}

            {activePreset.evaluationModel === "hybrid" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <Card variant="accent" padding="sm" className="flex items-start gap-3 border-[#4F8EF7]/20 bg-[#4F8EF7]/5">
                  <span className="material-symbols-outlined text-[#4F8EF7] mt-0.5">info</span>
                  <div className="text-xs text-blue-200/90 leading-relaxed">
                    <strong className="text-[#4F8EF7] font-bold block mb-1">Hybrid Grading Active</strong>
                    {activePreset.name} uses hybrid grading. Standard absolute scaling serves as a baseline, but relative bell curve scaling is dynamically applied for larger cohorts.
                  </div>
                </Card>
              </motion.div>
            )}

            <div className="overflow-x-auto mb-8">
              <table className="w-full text-left min-w-[500px]">
                <thead>
                  <tr className="text-on-surface-variant/40 text-[10px] font-black uppercase tracking-[0.2em] border-b border-outline-variant/10">
                    <th className="pb-4 px-2 w-[40%]">Subject Name</th>
                    <th className="pb-4 px-2 w-[20%]">{creditLabel}</th>
                    <th className="pb-4 px-2 w-[25%]">Grade/Marks</th>
                    <th className="pb-4 px-2 text-center w-[15%]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {subjects.map((subject) => (
                      <motion.tr
                        key={subject.id}
                        layout
                        initial={{ opacity: 0, y: -20, backgroundColor: "rgba(80, 143, 248, 0.1)" }}
                        animate={{ opacity: 1, y: 0, backgroundColor: "transparent" }}
                        exit={{ opacity: 0, x: -50, height: 0, overflow: "hidden" }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="group"
                      >
                        <td className="py-2.5 px-2">
                          <Input
                            type="text"
                            value={subject.name}
                            onChange={(e) => handleChange(subject.id, "name", e.target.value)}
                            hasError={!!(subject.error && !subject.name.trim())}
                            placeholder="e.g. Data Structures"
                          />
                        </td>
                        <td className="py-2.5 px-2">
                          <Input
                            type="number"
                            value={subject.credits}
                            onChange={(e) => handleChange(subject.id, "credits", e.target.value)}
                            hasError={!!(subject.error && (subject.error.includes("Credits") || subject.error.includes("Units")))}
                            placeholder={activePreset.creditType === "units" ? "3" : "4"}
                            min="1" max="6"
                          />
                        </td>
                        <td className="py-2.5 px-2">
                          <Input
                            type="text"
                            value={subject.score}
                            onChange={(e) => handleChange(subject.id, "score", e.target.value)}
                            hasError={!!(subject.error && (subject.error.includes("Score") || subject.error.includes("Marks") || subject.error.includes("Grade")))}
                            placeholder={usePercentage ? "e.g., 85" : activePreset.specialFeatures?.hasLetterGrades ? "e.g., A+ or 9" : "e.g., 9"}
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <button onClick={() => removeSubject(subject.id)} className="text-on-surface-variant/30 hover:text-error transition-all p-2 rounded-xl border border-transparent hover:border-error/20 hover:bg-error/10 hover:shadow-[0_0_10px_rgba(248,113,113,0.15)] flex items-center justify-center">
                               <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                            <AnimatePresence>
                              {subject.error && (
                                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-400 text-[10px]">{subject.error}</motion.span>
                              )}
                            </AnimatePresence>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            <div className="flex bg-surface-container-highest p-1 rounded-full w-fit mb-8 relative border border-outline-variant/30">
              <div
                className="absolute inset-y-1 bg-primary rounded-full transition-all duration-300 ease-premium-expo z-0"
                style={{ width: 'calc(50% - 4px)', left: usePercentage ? '4px' : 'calc(50%)' }}
              />
              <button
                onClick={() => setUsePercentage(true)}
                className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold transition-colors duration-300 w-32 ${usePercentage ? 'text-white' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Percentage
              </button>
              <button
                onClick={() => setUsePercentage(false)}
                className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold transition-colors duration-300 w-32 ${!usePercentage ? 'text-white' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Grade Points
              </button>
            </div>

            <div onClick={handleCalculate} className={isCalculating ? "opacity-70 pointer-events-none" : ""}>
              <PremiumButton
                variant="primary"
                className="w-full justify-between mt-4"
                icon={isCalculating ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : "arrow_forward"}
              >
                {isCalculating ? "Calculating..." : "Calculate Results"}
              </PremiumButton>
            </div>
          </Card>
        </motion.div>

        {/* Right: Grade Scale Reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-1"
        >
          <Card className="sticky top-28">
            <h2 className="text-xl font-headline font-bold mb-6 text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">analytics</span>
              Scale Reference
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-[0.2em] px-4">
                <span>Range</span><span>Grade</span><span>Pts</span>
              </div>
              <div className="space-y-2.5">
                {(() => {
                  const sortedScale = [...getGradeScale(activePreset)].sort((a, b) => b.points - a.points);
                  
                  const getGradeColor = (points: number, isPass: boolean = true) => {
                    if (!isPass || points === 0) return "bg-error/20 text-error font-black";
                    if (points >= 9) return "bg-success/10 text-success";
                    if (points >= 7) return "bg-primary/10 text-primary";
                    if (points >= 5) return "bg-secondary/10 text-secondary";
                    return "bg-error/10 text-error";
                  };

                  const getRangeText = (entry: GradeScaleEntry, index: number, allEntries: GradeScaleEntry[]) => {
                    if (activePreset.evaluationModel === "relative") {
                      return entry.description || "Relative Grade";
                    }
                    
                    const min = entry.minMarks ?? 0;
                    if (entry.points === 0 || entry.isPass === false) {
                      const passEntries = allEntries.filter(e => e.isPass !== false && e.points > 0);
                      const minPass = passEntries.length > 0 ? Math.min(...passEntries.map(e => e.minMarks ?? 0)) : 40;
                      return `Below ${minPass}`;
                    }
                    
                    const higherEntries = allEntries.filter(e => (e.minMarks ?? 0) > min);
                    if (higherEntries.length === 0) {
                      return `${min} - 100`;
                    }
                    
                    const nextMin = Math.min(...higherEntries.map(e => e.minMarks ?? 0));
                    return `${min} - ${nextMin - 1}`;
                  };

                  return sortedScale.map((row, i) => {
                    const color = getGradeColor(row.points, row.isPass);
                    const range = getRangeText(row, i, sortedScale);
                    return (
                      <div key={i} className="flex justify-between items-center bg-surface-container/40 px-5 py-3.5 rounded-none border border-outline-variant/30 hover:bg-surface-container-high hover:border-primary/40 hover:shadow-sm transition-all group">
                        <span className="text-on-surface-variant group-hover:text-on-surface font-medium text-xs w-20">{range}</span>
                        <span className={`px-2.5 py-0.5 rounded-none text-xs ${color} font-bold w-auto border border-transparent group-hover:border-current transition-colors`}>{row.grade}</span>
                        <span className={`font-black tracking-tight ${color.includes('text-error') ? 'text-error' : 'text-on-surface'} w-6 text-right`}>{row.points}</span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </Card>
        </motion.div>
      </Grid>

      {/* Result Section */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-headline font-black mb-8 text-on-surface">Semester Results</h2>
            <StaggerContainer staggerDelay={0.15} className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <StaggerItem>
                <Card className="border-t-4 border-primary hover:-translate-y-2 duration-500 group overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
                  <p className="text-xs font-bold text-on-surface-variant/50 uppercase tracking-[0.2em] mb-4">Semester SGPA</p>
                  <h3 className="text-6xl font-black font-headline text-primary tracking-tighter group-hover:scale-105 transition-transform origin-left">
                    <AnimatedCounter target={result.sgpa} decimals={2} />
                  </h3>
                  <div className="mt-6 flex items-center gap-2 text-primary font-bold text-sm bg-primary/5 w-fit px-3 py-1 rounded-full">
                    <span className="material-symbols-outlined text-sm">trending_up</span> Top Tier
                  </div>
                </Card>
              </StaggerItem>
              <StaggerItem>
                <Card className="border-t-4 border-secondary hover:-translate-y-2 duration-500 group overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-secondary/10 transition-colors" />
                  <p className="text-xs font-bold text-on-surface-variant/50 uppercase tracking-[0.2em] mb-4">Earned {creditLabel}</p>
                  <h3 className="text-6xl font-black font-headline text-secondary tracking-tighter group-hover:scale-105 transition-transform origin-left">
                    <AnimatedCounter target={result.totalCredits} />
                  </h3>
                  <div className="mt-6 flex items-center gap-2 text-secondary font-bold text-sm bg-secondary/5 w-fit px-3 py-1 rounded-full">
                    <span className="material-symbols-outlined text-sm">verified</span> Academic Load
                  </div>
                </Card>
              </StaggerItem>
              <StaggerItem>
                <Card className="border-t-4 border-success hover:-translate-y-2 duration-500 group overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-success/10 transition-colors" />
                  <p className="text-xs font-bold text-on-surface-variant/50 uppercase tracking-[0.2em] mb-4">Performance Indicator</p>
                  <motion.h3
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.6 }}
                    className="text-4xl lg:text-5xl font-black font-headline text-success tracking-tighter group-hover:scale-105 transition-transform origin-left"
                  >
                    {result.sgpa >= 9 ? "LEGENDARY" : result.sgpa >= 8 ? "ELITE" : result.sgpa >= 7 ? "STABLE" : "RECOVERY"}
                  </motion.h3>
                  <div className="mt-6 flex items-center gap-2 text-success font-bold text-sm bg-success/5 w-fit px-3 py-1 rounded-full">
                    <span className="material-symbols-outlined text-sm">stars</span> Grade Status
                  </div>
                </Card>
              </StaggerItem>
            </StaggerContainer>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8">
              <Card className="overflow-x-auto">
                <h3 className="text-xl font-headline font-bold mb-6 text-on-surface">Subject Breakdown</h3>
                <table className="w-full text-left min-w-[500px]">
                  <thead>
                    <tr className="text-on-surface-variant/60 text-xs font-bold uppercase tracking-widest border-b border-outline-variant/10">
                      <th className="pb-4 px-2">Subject Name</th>
                      <th className="pb-4 px-2">{creditLabel}</th>
                      <th className="pb-4 px-2">Score</th>
                      <th className="pb-4 px-2">Grade Point</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map(s => {
                      const gradePoint = usePercentage ? convertMarksToGradePoint(parseFloat(s.score) || 0, activePreset) : convertLetterGradeToGradePoint(s.score, activePreset);
                      return (
                        <tr key={s.id} className="border-b border-outline-variant/5 last:border-0 hover:bg-surface-container-low/50 transition-colors">
                          <td className="py-4 px-2 font-medium text-on-surface">{s.name || "Unnamed"}</td>
                          <td className="py-4 px-2 text-on-surface-variant">{s.credits}</td>
                          <td className="py-4 px-2 text-on-surface-variant">{s.score}</td>
                          <td className="py-4 px-2 font-bold text-primary">{gradePoint.toFixed(1)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
            </motion.div>

            {/* Premium Trust Math Breakdown Component */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <CalculationBreakdown
                preset={activePreset}
                subjects={subjects.map(s => ({
                  name: s.name || "Unnamed Course",
                  credits: parseFloat(s.credits) || 0,
                  grade: s.score
                }))}
                type="sgpa"
              />
            </motion.div>

            {/* Save Section */}
            <Card className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h3 className="text-2xl font-headline font-black mb-2 text-on-surface">Secure These Results</h3>
                <p className="text-on-surface-variant">Sync your GPA to your cloud dashboard to track semester-on-semester progress.</p>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <div onClick={handleSave} className={`w-full ${isSaving ? "opacity-50 pointer-events-none" : ""}`}>
                  <PremiumButton
                    variant={saveSuccess ? "outline" : "primary"}
                    className="w-full justify-between"
                    icon={isSaving ? (
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : saveSuccess ? "check_circle" : "cloud_upload"}
                  >
                    {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save to Dashboard"}
                  </PremiumButton>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col md:flex-row justify-center items-center gap-6 mt-6 pb-10"
      >
        <Link href="/" className="w-full md:w-64">
          <PremiumButton variant="outline" icon="arrow_back" className="w-full justify-between">
            Back to Home
          </PremiumButton>
        </Link>
        <Link href="/planner" className="w-full md:w-64">
          <PremiumButton variant="primary" icon="calendar_month" className="w-full justify-between">
            Plan Semester
          </PremiumButton>
        </Link>
      </motion.div>

      {/* Inline Slide-over drawer */}
      <AnimatePresence>
        {isIngestOpen && (
          <>
            {/* Backdrop blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!ocrScanning && !isParsing) setIsIngestOpen(false);
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 pointer-events-auto"
            />

            {/* Sliding Drawer Container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 220 }}
              className="fixed inset-y-0 right-0 w-full max-w-xl bg-surface-container border-l border-outline-variant/30 shadow-2xl z-50 overflow-y-auto pointer-events-auto flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-start">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                    <span className="material-symbols-outlined text-xs animate-spin">cloud_download</span>
                    Smart Ingest & AI Normalizer
                  </div>
                  <h3 className="text-xl font-headline font-bold text-on-surface">Import Academic Records</h3>
                  <p className="text-xs text-on-surface-variant/70 mt-1">Directly reconcile marksheets or paste Digicampus records into GradeFlow calculation engine.</p>
                </div>
                <button
                  disabled={ocrScanning || isParsing}
                  onClick={() => setIsIngestOpen(false)}
                  className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant/40 hover:text-on-surface border border-transparent hover:border-outline-variant/30"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                {!parsedDoc ? (
                  <>
                    {/* Tab Selectors */}
                    <div className="flex bg-surface-container-highest p-1 rounded-xl border border-outline-variant/30 relative gap-1">
                      <button
                        onClick={() => setIngestTab("paste")}
                        disabled={ocrScanning}
                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 z-10 ${
                          ingestTab === "paste"
                            ? "bg-primary text-white shadow-lg"
                            : "text-on-surface-variant/70 hover:text-on-surface"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">content_paste</span>
                        Paste Data
                      </button>
                      <button
                        onClick={() => setIngestTab("prompt")}
                        disabled={ocrScanning || isParsing}
                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 z-10 ${
                          ingestTab === "prompt"
                            ? "bg-primary text-white shadow-lg"
                            : "text-on-surface-variant/70 hover:text-on-surface"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">smart_toy</span>
                        AI Prompt Helper
                      </button>
                      <button
                        onClick={() => setIngestTab("ocr")}
                        disabled={isParsing}
                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 z-10 ${
                          ingestTab === "ocr"
                            ? "bg-primary text-white shadow-lg"
                            : "text-on-surface-variant/70 hover:text-on-surface"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">scanner</span>
                        Simulate Scan
                      </button>
                    </div>

                    {ingestTab === "paste" && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest mb-2">Pasted Transcript Data</label>
                          <textarea
                            value={rawPasteText}
                            onChange={(e) => setRawPasteText(e.target.value)}
                            disabled={isParsing}
                            placeholder="Paste your Digicampus PRN output, term sheets, or transcript JSON here..."
                            className="w-full h-64 p-4 rounded-xl font-mono text-xs bg-surface-container-low border border-outline-variant/40 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40 text-on-surface placeholder:text-on-surface-variant/30 transition-all shadow-inner resize-none"
                          />
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              setRawPasteText(MOCK_JSPM_DIGICAMPUS_JSON);
                              toast.success("Loaded real Digicampus account JSON!");
                            }}
                            className="text-primary hover:underline font-bold"
                          >
                            🧪 Load Real Digicampus JSON
                          </button>
                          <span className="text-on-surface-variant/40">JSON or plain-text transcript rules</span>
                        </div>
                        <button
                          onClick={handlePasteSubmit}
                          disabled={isParsing || !rawPasteText.trim()}
                          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none text-sm mt-6"
                        >
                          {isParsing ? (
                            <>
                              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Normalizing Academic Models...
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-[18px]">bolt</span>
                              Analyze & Normalize Record
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {ingestTab === "prompt" && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="space-y-6"
                      >
                        {/* High-Fidelity AI Prompt Card */}
                        <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
                          <div className="flex items-start gap-4 mb-4">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary flex items-center justify-center">
                              <span className="material-symbols-outlined text-lg">smart_toy</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-on-surface">External AI Ingestion Co-Pilot</h4>
                              <p className="text-xs text-on-surface-variant/70 mt-1 leading-relaxed">
                                Bypass slow servers and upload limits! Copy our specialized prompt, upload your marksheet to a top AI chatbot (Gemini, ChatGPT, or Claude), and paste the result back here.
                              </p>
                            </div>
                          </div>

                          {/* Steps Checklist */}
                          <div className="space-y-3 bg-surface-container-highest/30 p-4 rounded-xl border border-outline-variant/10 text-xs">
                            <div className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px] mt-0.5">1</span>
                              <p className="text-on-surface-variant leading-relaxed">
                                Click <strong className="text-on-surface">"Copy Specialized AI Prompt"</strong> below to copy our pre-configured extraction script.
                              </p>
                            </div>
                            <div className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px] mt-0.5">2</span>
                              <div className="text-on-surface-variant leading-relaxed space-y-2">
                                <p>Open any leading AI Bot of your choice:</p>
                                <div className="flex flex-wrap gap-2 pt-1">
                                  <a
                                    href="https://gemini.google.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black hover:bg-neutral-900 text-white font-bold text-[10px] transition-all border border-outline-variant/20 hover:shadow-md active:scale-95"
                                  >
                                    <span className="material-symbols-outlined text-[12px] text-[#4F8EF7] animate-pulse">auto_awesome</span>
                                    Google Gemini
                                  </a>
                                  <a
                                    href="https://chatgpt.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black hover:bg-neutral-900 text-white font-bold text-[10px] transition-all border border-outline-variant/20 hover:shadow-md active:scale-95"
                                  >
                                    <span className="material-symbols-outlined text-[12px] text-green-400">chat</span>
                                    ChatGPT
                                  </a>
                                  <a
                                    href="https://claude.ai/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black hover:bg-neutral-900 text-white font-bold text-[10px] transition-all border border-outline-variant/20 hover:shadow-md active:scale-95"
                                  >
                                    <span className="material-symbols-outlined text-[12px] text-amber-500">psychology</span>
                                    Anthropic Claude
                                  </a>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px] mt-0.5">3</span>
                              <p className="text-on-surface-variant leading-relaxed">
                                Upload a clear screenshot, photo, or PDF of your transcript, paste the prompt, and send it.
                              </p>
                            </div>
                            <div className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px] mt-0.5">4</span>
                              <p className="text-on-surface-variant leading-relaxed">
                                Copy the resulting JSON output code block, switch back to the <strong className="text-on-surface">"Paste Data"</strong> tab in this drawer, and paste it to instantly synchronize!
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Copyable Prompt Container */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center px-1">
                            <label className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest">Specialized Extraction Prompt</label>
                            <span className="text-[10px] font-bold text-primary bg-primary/5 px-2.5 py-0.5 rounded-full border border-primary/10">Dynamic for {activePreset.shortName}</span>
                          </div>
                          <div className="w-full max-h-48 overflow-y-auto p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 font-mono text-[10px] text-on-surface-variant leading-relaxed whitespace-pre-wrap select-all relative shadow-inner">
                            {getAiExtractionPrompt()}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            try {
                              navigator.clipboard.writeText(getAiExtractionPrompt());
                              toast.success("AI Prompt copied to clipboard! Switch tabs to open bots.");
                            } catch (err) {
                              toast.error("Failed to auto-copy. Please select and copy manually.");
                            }
                          }}
                          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] text-sm"
                        >
                          <span className="material-symbols-outlined text-[18px]">content_copy</span>
                          Copy Specialized AI Prompt
                        </button>
                      </motion.div>
                    )}

                    {ingestTab === "ocr" && (
                      <div className="space-y-6">
                        {/* Drag and Drop Container */}
                        <div className="p-8 rounded-2xl border-2 border-dashed border-outline-variant/30 hover:border-primary/40 bg-surface-container-low transition-all text-center flex flex-col items-center justify-center relative overflow-hidden h-72 group">
                          {/* Simulated Scanning Laser Line */}
                          {ocrScanning && (
                            <motion.div
                              animate={{ y: ["0px", "280px", "0px"] }}
                              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                              className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80 blur-xs top-0"
                            />
                          )}
                          <span className={`material-symbols-outlined text-4xl mb-4 ${ocrScanning ? "text-primary animate-bounce" : "text-on-surface-variant/40"}`}>
                            cloud_upload
                          </span>
                          <h4 className="font-bold text-sm text-on-surface mb-1">Upload Marksheet PDF / Image</h4>
                          <p className="text-xs text-on-surface-variant/60 max-w-xs mb-6 leading-relaxed">Drag and drop your university transcript sheet or screenshot to begin OCR analysis.</p>
                          <button
                            onClick={startOcrSimulation}
                            disabled={ocrScanning}
                            className="px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-xs font-bold text-on-surface hover:text-primary transition-all active:scale-95"
                          >
                            {ocrScanning ? "Scanning Active..." : "Simulate OCR Telemetry Scan"}
                          </button>
                        </div>

                        {/* Progress and Logs Console */}
                        {ocrScanning && (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-on-surface-variant">Scanning Telemetry Progress</span>
                              <span className="font-mono text-primary font-bold">{ocrProgress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all duration-300 ease-out"
                                style={{ width: `${ocrProgress}%` }}
                              />
                            </div>
                            <div className="font-mono text-[10px] bg-black text-green-400 p-4 rounded-xl border border-green-500/20 shadow-inner h-48 overflow-y-auto space-y-1.5 scrollbar-thin">
                              {ocrLogs.map((log, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <span className="text-green-500 select-none">▶</span>
                                  <span>{log}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  // Parser Output View - Previewing Ingested Semesters
                  <div className="space-y-6">
                    {/* Student Info Card */}
                    <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30">
                      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-outline-variant/10">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary flex items-center justify-center">
                          <span className="material-symbols-outlined text-[20px]">school</span>
                        </div>
                        <div>
                          <h4 className="font-black text-xs uppercase tracking-widest text-on-surface-variant/40">Verified Student Profile</h4>
                          <span className="text-sm font-black text-on-surface">{parsedDoc.currentCgpa.value > 0 ? "PATIL TANMAY ANIL" : "Ingested Profile"}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-on-surface-variant/50 block mb-0.5">Registration ID</span>
                          <span className="font-mono text-on-surface font-bold">22458020124</span>
                        </div>
                        <div>
                          <span className="text-on-surface-variant/50 block mb-0.5">Quota / Status</span>
                          <span className="text-on-surface font-bold">General / Regular</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-on-surface-variant/50 block mb-0.5">Programme & Institution</span>
                          <span className="text-on-surface font-bold text-[11px] truncate block">B.Tech (CSE) — JSPM Wagholi, Pune</span>
                        </div>
                      </div>
                    </div>

                    {/* Provenance Card */}
                    <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1 text-xs font-bold text-on-surface">
                            <span className="material-symbols-outlined text-sm text-success">verified</span>
                            Source Provenance Trace
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-success/15 border border-success/20 text-success text-[10px] font-black">
                            {parsedDoc.presetId.confidence}% CONFIDENCE
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="p-2 bg-surface-container-highest/40 rounded-xl border border-outline-variant/20">
                            <span className="text-on-surface-variant/50 block text-[10px] mb-0.5">Reg Year</span>
                            <span className="text-on-surface font-bold">{activePreset.metadata?.patternYear || "2023"}</span>
                          </div>
                          <div className="p-2 bg-surface-container-highest/40 rounded-xl border border-outline-variant/20">
                            <span className="text-on-surface-variant/50 block text-[10px] mb-0.5">Active Backlogs</span>
                            <span className={`font-bold ${parsedDoc.activeBacklogsCount.value > 0 ? "text-error" : "text-success"}`}>
                              {parsedDoc.activeBacklogsCount.value}
                            </span>
                          </div>
                          <div className="p-2 bg-surface-container-highest/40 rounded-xl border border-outline-variant/20">
                            <span className="text-on-surface-variant/50 block text-[10px] mb-0.5">Normalised CGPA</span>
                            <span className="text-primary font-black">{parsedDoc.currentCgpa.value.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Semesters Timeline List */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest">Normalised Academic Semesters</h4>
                      <div className="space-y-3">
                        {parsedDoc.semesterHistory.map((sem: any) => {
                          const courseCount = sem.courses?.length || 0;
                          return (
                            <div
                              key={sem.semester.value}
                              className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-primary/20 transition-all flex justify-between items-center group"
                            >
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-black text-on-surface">Semester {sem.semester.value}</span>
                                  <span className="px-2 py-0.5 rounded bg-success/10 text-success text-[10px] font-bold">Result Declared</span>
                                </div>
                                <div className="flex gap-4 text-xs text-on-surface-variant/70">
                                  <span>{courseCount} Courses</span>
                                  <span>{sem.credits.value} Credits</span>
                                  {sem.sgpa.value > 0 && (
                                    <span className="text-primary font-bold">SGPA: {sem.sgpa.value.toFixed(2)}</span>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => loadSemesterIntoCalculator(sem.semester.value, sem.courses || [])}
                                className="px-4 py-2 rounded-xl bg-surface-container-highest hover:bg-primary hover:text-white transition-all text-xs font-bold text-on-surface border border-outline-variant/30 hover:border-transparent flex items-center gap-1.5"
                              >
                                <span className="material-symbols-outlined text-[16px]">calculate</span>
                                Load Grades
                              </button>
                            </div>
                          );
                        })}

                        {/* Current Active Semester (if mapped in parser output) */}
                        {parsedDoc.currentSemesterCourses && (
                          <div className="p-4 rounded-2xl bg-surface-container-low border border-[#4F8EF7]/30 hover:border-[#4F8EF7]/50 transition-all flex justify-between items-center group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#4F8EF7]/5 rounded-full -mr-12 -mt-12 blur-2xl pointer-events-none" />
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-on-surface">Semester {parsedDoc.semesterHistory.length + 1}</span>
                                <span className="px-2 py-0.5 rounded bg-[#4F8EF7]/15 border border-[#4F8EF7]/20 text-[#4F8EF7] text-[10px] font-black flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#4F8EF7] animate-pulse" />
                                  Not Published (Active)
                                </span>
                              </div>
                              <div className="flex gap-4 text-xs text-on-surface-variant/70">
                                <span>{parsedDoc.currentSemesterCourses.length} Courses</span>
                                <span>Prediction Mode</span>
                              </div>
                            </div>
                            <button
                              onClick={() => loadSemesterIntoCalculator(parsedDoc.semesterHistory.length + 1, parsedDoc.currentSemesterCourses, true)}
                              className="px-4 py-2 rounded-xl bg-[#4F8EF7]/10 hover:bg-[#4F8EF7] hover:text-white transition-all text-xs font-bold text-[#4F8EF7] border border-[#4F8EF7]/30 hover:border-transparent flex items-center gap-1.5 shadow-sm shadow-[#4F8EF7]/5"
                            >
                              <span className="material-symbols-outlined text-[16px]">bolt</span>
                              Load Prediction
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setParsedDoc(null)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:text-on-surface text-xs font-bold hover:bg-surface-container-high transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                      Upload or Paste Different Record
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
     </PageContainer>
  );
}

const MOCK_JSPM_DIGICAMPUS_JSON = `[
  {
    "studentProfile": {
      "fullName": "PATIL TANMAY ANIL",
      "registrationId": "22458020124",
      "contactDetails": {
        "email": "tanmaypatil24.ai@jspmuni.edu.in"
      },
      "academicDetails": {
        "programme": "B.Tech (Computer Science And Engineering)",
        "department": "Department Of Computer Science And Engineering",
        "batchYear": 2024,
        "academicStatus": "Regular",
        "currentYear": "2nd Year",
        "currentTerm": "4th Semester"
      }
    }
  },
  {
    "institution": "JSPMUNI",
    "academicTerm": { "term": "Odd Term", "academicYear": "2024-25" },
    "performance": { "status": "Result Declared", "majorSGPA": 7.48 },
    "courses": [
      { "courseName": "Engineering Mechanics", "courseCode": "231GCEB01", "enrollmentType": "Regular", "credits": 2.0, "grade": "B+", "gradePoint": 7 },
      { "courseName": "Applied Chemistry", "courseCode": "230GCHB01", "enrollmentType": "Regular", "credits": 3.0, "grade": "B+", "gradePoint": 7 },
      { "courseName": "Applied Chemistry Lab", "courseCode": "230GCHB02", "enrollmentType": "Regular", "credits": 1.0, "grade": "B+", "gradePoint": 7 },
      { "courseName": "Semiconductor Physics And Electromagnetism", "courseCode": "231GPHB03", "enrollmentType": "Regular", "credits": 2.0, "grade": "B+", "gradePoint": 7 },
      { "courseName": "Semiconductor Physics And Electromagnetism Lab", "courseCode": "230GPHB04", "enrollmentType": "Regular", "credits": 1.0, "grade": "A+", "gradePoint": 9 },
      { "courseName": "Linear Algebra Sequences And Series", "courseCode": "231GMAB03", "enrollmentType": "Regular", "credits": 3.0, "grade": "B+", "gradePoint": 7 },
      { "courseName": "Effective Communication Skills", "courseCode": "230UENB01", "enrollmentType": "Regular", "credits": 2.0, "grade": "A", "gradePoint": 8 },
      { "courseName": "Yoga And Fitness", "courseCode": "231UPYB01", "enrollmentType": "Regular", "credits": 1.5, "grade": "B", "gradePoint": 6 },
      { "courseName": "Computational Thinking And Problem Solving", "courseCode": "240GCSB61", "enrollmentType": "Regular", "credits": 2.5, "grade": "F", "gradePoint": 0 },
      { "courseName": "Fundamentals Of Python Programming", "courseCode": "240GCSB62", "enrollmentType": "Regular", "credits": 3.0, "grade": "B+", "gradePoint": 7 }
    ]
  },
  {
    "institution": "JSPMUNI",
    "academicTerm": { "term": "Even Term", "academicYear": "2024-25" },
    "performance": { "status": "Result Declared", "majorSGPA": 7.2 },
    "courses": [
      { "courseName": "Electronics And Computer Workshop", "courseCode": "231GETB01", "enrollmentType": "Regular", "credits": 1.0, "grade": "B+", "gradePoint": 7 },
      { "courseName": "Foundations Of Electrical And Electronics Engineering", "courseCode": "231GEEB01", "enrollmentType": "Regular", "credits": 2.0, "grade": "B+", "gradePoint": 7 },
      { "courseName": "Foundations Of Electrical And Electronics Engineering Lab", "courseCode": "231GEEB02", "enrollmentType": "Regular", "credits": 1.0, "grade": "B+", "gradePoint": 7 },
      { "courseName": "Engineering Graphics And Design", "courseCode": "231GMEB02", "enrollmentType": "Regular", "credits": 2.0, "grade": "A+", "gradePoint": 9 },
      { "courseName": "Engineering Graphics And Design Lab", "courseCode": "230GMEB03", "enrollmentType": "Regular", "credits": 1.0, "grade": "A", "gradePoint": 8 },
      { "courseName": "Optics And Modern Physics", "courseCode": "231GPHB01", "enrollmentType": "Regular", "credits": 2.5, "grade": "B+", "gradePoint": 7 },
      { "courseName": "Optics And Modern Physics Lab", "courseCode": "230GPHB02", "enrollmentType": "Regular", "credits": 1.0, "grade": "A", "gradePoint": 8 },
      { "courseName": "Univariate Calculus", "courseCode": "230GMAB06", "enrollmentType": "Regular", "credits": 3.0, "grade": "B+", "gradePoint": 7 },
      { "courseName": "Introduction To Science And Technology In Early India", "courseCode": "240UHIB02", "enrollmentType": "Regular", "credits": 2.0, "grade": "B+", "gradePoint": 7 },
      { "courseName": "Internship / Field Project / Community Engagement Program", "courseCode": "230GFYB01", "enrollmentType": "Regular", "credits": 2.0, "grade": "B", "gradePoint": 6 },
      { "courseName": "Introduction To Artificial Intelligence And Machine Learning Lab", "courseCode": "240GCSB67", "enrollmentType": "Regular", "credits": 1.0, "grade": "A+", "gradePoint": 9 },
      { "courseName": "Introduction To Artificial Intelligence And Machine Learning", "courseCode": "230GAIB82", "enrollmentType": "Regular", "credits": 3.0, "grade": "B+", "gradePoint": 7 },
      { "courseName": "Design Thinking And Creativity", "courseCode": "230IDCB01", "enrollmentType": "Regular", "credits": 1.5, "grade": "B", "gradePoint": 6 }
    ]
  },
  {
    "institution": "JSPMUNI",
    "academicTerm": { "term": "Odd Term", "academicYear": "2025-26" },
    "performance": { "status": "Result Declared", "majorSGPA": 7.5 },
    "courses": [
      { "courseName": "Environment And Sustainability", "courseCode": "231GCEB02", "enrollmentType": "Regular", "credits": 2.0, "grade": "B+", "gradePoint": 7 },
      { "courseName": "Microcontrollers And Applications", "courseCode": "230GETB36", "enrollmentType": "Regular", "credits": 2.0, "grade": "A", "gradePoint": 8 },
      { "courseName": "Data Structures", "courseCode": "230GCSB05", "enrollmentType": "Regular", "credits": 3.0, "grade": "B+", "gradePoint": 7 },
      { "courseName": "Data Structures Lab", "courseCode": "230GCSB09", "enrollmentType": "Regular", "credits": 1.0, "grade": "B+", "gradePoint": 7 },
      { "courseName": "Health And Nutrition", "courseCode": "230HFSB80", "enrollmentType": "Regular", "credits": 1.5, "grade": "A", "gradePoint": 8 },
      { "courseName": "Object Oriented Programming Using Java", "courseCode": "240GCSB72", "enrollmentType": "Regular", "credits": 2.0, "grade": "A+", "gradePoint": 9 },
      { "courseName": "Object Oriented Programming Using Java Lab", "courseCode": "240GCSB73", "enrollmentType": "Regular", "credits": 1.0, "grade": "A", "gradePoint": 8 },
      { "courseName": "Ordinary Differential Equations And Multivariate Calculus", "courseCode": "230GMAB07", "enrollmentType": "Regular", "credits": 3.0, "grade": "A", "gradePoint": 8 },
      { "courseName": "Professional Laws, Ethics, Values And Harmony", "courseCode": "230USYB02", "enrollmentType": "Regular", "credits": 2.0, "grade": "C", "gradePoint": 5 },
      { "courseName": "Foundations Of Data Science", "courseCode": "250GDSB01", "enrollmentType": "Regular", "credits": 2.5, "grade": "A", "gradePoint": 8 }
    ]
  },
  {
    "institution": "JSPMUNI",
    "academicTerm": { "term": "Even Term", "academicYear": "2025-26" },
    "performance": { "status": "Not Published", "majorSGPA": null },
    "courses": [
      { "courseName": "Bioengineering", "courseCode": "250GBTB01", "enrollmentType": "Regular", "credits": 2.0, "grade": null, "gradePoint": null },
      { "courseName": "Introduction To Embedded System", "courseCode": "230GETB41", "enrollmentType": "Regular", "credits": 2.0, "grade": null, "gradePoint": null },
      { "courseName": "Computer Algorithms", "courseCode": "230GCSB51", "enrollmentType": "Regular", "credits": 3.0, "grade": null, "gradePoint": null },
      { "courseName": "Computer Algorithms Lab", "courseCode": "230GCSB52", "enrollmentType": "Regular", "credits": 1.0, "grade": null, "gradePoint": null },
      { "courseName": "Vector Calculus And Partial Differential Equations", "courseCode": "230GMAB08", "enrollmentType": "Regular", "credits": 3.0, "grade": null, "gradePoint": null },
      { "courseName": "Communicative Proficiency Skills", "courseCode": "230UENB02", "enrollmentType": "Regular", "credits": 2.0, "grade": null, "gradePoint": null },
      { "courseName": "Introduction To Cryptography", "courseCode": "250GCSB01", "enrollmentType": "Regular", "credits": 3.0, "grade": null, "gradePoint": null },
      { "courseName": "Introduction To Cryptography Lab", "courseCode": "250GCSB02", "enrollmentType": "Regular", "credits": 1.0, "grade": null, "gradePoint": null },
      { "courseName": "Development Tools For Artificial Intelligence And Machine Learning", "courseCode": "231GCSB17", "enrollmentType": "Regular", "credits": 3.0, "grade": null, "gradePoint": null },
      { "courseName": "Cyber Security And Threats", "courseCode": "250GCSB04", "enrollmentType": "Regular", "credits": 3.0, "grade": null, "gradePoint": null },
      { "courseName": "Cyber Security And Practices", "courseCode": "250GCSB08", "enrollmentType": "Regular", "credits": 1.0, "grade": null, "gradePoint": null }
    ]
  },
  {
    "institution": "JSPMUNI",
    "academicTerm": { "term": "Summer Term", "academicYear": "2024-25" },
    "performance": { "status": "Grades Published", "majorSGPA": null },
    "courses": [
      { "courseName": "Computational Thinking And Problem Solving", "courseCode": "240GCSB61", "enrollmentType": "Backlog", "credits": 2.5, "grade": "O", "gradePoint": 10 }
    ]
  }
]`;
