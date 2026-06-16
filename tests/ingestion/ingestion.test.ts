/**
 * Phase 4 Unit Tests: JSON Ingestion Validator & Reconciler
 */

import { validateImportPayload } from "../../lib/ingestion/importValidator";
import { reconcileImportPayload } from "../../lib/ingestion/importReconciler";
import { getPresetById } from "../../lib/presets/presetRegistry";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  ✅ ${name}`);
  } catch (err: any) {
    failed++;
    console.log(`  ❌ ${name}: ${err.message}`);
    console.error(err);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

export function runIngestionTests(): boolean {
  passed = 0;
  failed = 0;
  console.log("\n📥 Ingestion System Tests");

  // Valid Sample Payload
  const validPayload = {
    presetId: "sppu",
    currentCgpa: 8.2,
    targetCgpa: 8.5,
    activeBacklogsCount: 0,
    semesterHistory: [
      {
        semester: 1,
        sgpa: 8.0,
        credits: 20,
        earnedCredits: 20,
        courses: [
          { code: "CS101", name: "Programming in C", credits: 20, grade: "A+" }
        ]
      },
      {
        semester: 2,
        sgpa: 8.4,
        credits: 20,
        earnedCredits: 20,
        courses: [
          { code: "CS102", name: "Data Structures", credits: 20, grade: "O" }
        ]
      }
    ],
    currentSemesterCourses: [
      {
        code: "CS201",
        name: "Algorithms",
        credits: 4,
        cieMarks: 42,
        attendanceTotal: 40,
        attendanceBunked: 4
      }
    ]
  };

  test("validateImportPayload - fully valid payload passes", () => {
    const result = validateImportPayload(validPayload);
    assert(result.isValid === true, `Expected validation to be valid, got errors: ${result.errors.join(", ")}`);
    assert(result.errors.length === 0, "Expected no errors");
    assert(result.parsedData !== undefined, "Expected parsedData to be populated");
    assert(result.parsedData?.presetId === "sppu", "Expected presetId to be sppu");
    assert(result.parsedData?.semesterHistory.length === 2, "Expected 2 semesters");
    assert(result.parsedData?.currentSemesterCourses?.[0].code === "CS201", "Expected course code CS201");
  });

  test("validateImportPayload - fails on invalid presetId", () => {
    const invalidPreset = { ...validPayload, presetId: "invalid_uni" };
    const result = validateImportPayload(invalidPreset);
    assert(result.isValid === false, "Expected validation to fail");
    assert(result.errors.some(e => e.includes("does not exist in the preset registry")), "Expected preset not found error");
  });

  test("validateImportPayload - fails on out-of-bounds CGPA", () => {
    const invalidCgpa = { ...validPayload, currentCgpa: 12.5 }; // SPPU is 10-point scale
    const result = validateImportPayload(invalidCgpa);
    assert(result.isValid === false, "Expected validation to fail");
    assert(result.errors.some(e => e.includes("must be between 0 and 10")), "Expected CGPA bounds error");
  });

  test("validateImportPayload - fails on earned credits exceeding registered credits", () => {
    const invalidCredits = JSON.parse(JSON.stringify(validPayload));
    invalidCredits.semesterHistory[0].earnedCredits = 25; // registered is 20
    const result = validateImportPayload(invalidCredits);
    assert(result.isValid === false, "Expected validation to fail");
    assert(result.errors.some(e => e.includes("cannot exceed registered 'credits'")), "Expected earnedCredits error");
  });

  test("validateImportPayload - fails on invalid course grade", () => {
    const invalidGrade = JSON.parse(JSON.stringify(validPayload));
    invalidGrade.semesterHistory[0].courses[0].grade = "Z"; // Invalid for SPPU
    const result = validateImportPayload(invalidGrade);
    assert(result.isValid === false, "Expected validation to fail");
    assert(result.errors.some(e => e.includes("grade 'Z' is not valid")), "Expected invalid grade error");
  });

  test("validateImportPayload - flags target CGPA lower than current CGPA as a warning", () => {
    const targetWarn = { ...validPayload, targetCgpa: 7.5 };
    const result = validateImportPayload(targetWarn);
    assert(result.isValid === true, "Should still be valid");
    assert(result.warnings.some(w => w.includes("lower than current CGPA")), "Expected warning about lower target CGPA");
  });

  test("validateImportPayload - warns on missing attendance tracking data", () => {
    const missingAttendance = JSON.parse(JSON.stringify(validPayload));
    delete missingAttendance.currentSemesterCourses[0].attendanceTotal;
    delete missingAttendance.currentSemesterCourses[0].attendanceBunked;
    const result = validateImportPayload(missingAttendance);
    assert(result.isValid === true, "Should still be valid");
    assert(result.warnings.some(w => w.includes("Attendance tracking data is missing")), "Expected warning about missing attendance");
  });

  test("reconcileImportPayload - correctly updates mock store state", () => {
    const mockStore: any = {
      presetId: "",
      academic: {},
      semesterHistory: [],
      courses: [],
      simulationResetCalled: false,
      setPresetId(id: string) { this.presetId = id; },
      setAcademic(acad: any) { this.academic = { ...this.academic, ...acad }; },
      setSemesterHistory(hist: any[]) { this.semesterHistory = hist; },
      setCourses(c: any[]) { this.courses = c; },
      resetSimulation() { this.simulationResetCalled = true; },
      clearSimulationScenarios() { this.simulationResetCalled = true; }
    };

    const validationResult = validateImportPayload(validPayload);
    assert(validationResult.isValid === true, "Validation must pass for reconciliation test");
    
    reconcileImportPayload(validationResult.parsedData!, mockStore);

    assert(mockStore.presetId === "sppu", "Expected presetId to be set to sppu");
    assert(mockStore.academic.currentCgpa === 8.2, "Expected currentCgpa to be 8.2");
    assert(mockStore.academic.completedSemesters === 2, "Expected completedSemesters to be 2");
    assert(mockStore.academic.earnedCredits === 40, "Expected earnedCredits to be 40 (20+20)");
    assert(mockStore.academic.activeBacklogsCount === 0, "Expected activeBacklogsCount to be 0");
    assert(mockStore.academic.targetCgpa === 8.5, "Expected targetCgpa to be 8.5");
    
    assert(mockStore.semesterHistory.length === 2, "Expected 2 semester entries");
    assert(mockStore.semesterHistory[0].semester === 1, "Expected semester 1");
    assert(mockStore.semesterHistory[0].sgpa === 8.0, "Expected sgpa 8.0");
    
    assert(mockStore.courses.length === 1, "Expected 1 course in current semester");
    assert(mockStore.courses[0].code === "CS201", "Expected current course code to be CS201");
    assert(mockStore.courses[0].cieMarks === 42, "Expected current course cieMarks to be 42");
    assert(mockStore.courses[0].attendanceTotal === 40, "Expected current course attendanceTotal to be 40");
    assert(mockStore.courses[0].attendanceBunked === 4, "Expected current course attendanceBunked to be 4");
    
    assert(mockStore.simulationResetCalled === true, "Expected resetSimulation to have been called");
  });

  console.log(`\n🏁 Ingestion tests completed: ${passed} passed, ${failed} failed.`);
  return failed === 0;
}
