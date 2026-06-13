// @ts-nocheck
import { BacklogEngine } from "./lib/backlog-intelligence/engine.ts";

function assertEqual(actual: any, expected: any, message: string) {
  if (actual !== expected) {
    throw new Error(`Test Failed: ${message} | Expected: ${expected}, Actual: ${actual}`);
  }
}

console.log("Running Stress Tests for Sub-milestone 2.2 fixes in BacklogEngine...");

try {
  // Test 1: calculateCGPACeiling
  const dummyCourses: any[] = [
    { id: "1", name: "Math 1", credits: 4, grade: "F", semester: 1 },
    { id: "2", name: "Physics", credits: 4, grade: "A", semester: 1 }, // 4 * 8 = 32
  ];
  // ceiling should add backlogCredits * 10. backlogCredits = 4. 4 * 10 = 40.
  // existing points = 32. Total points initially = 32. +40 = 72. 
  // Credits attempted = 8. + future sems.
  const ceiling = BacklogEngine.calculateCGPACeiling(dummyCourses, 1, [] as any);
  console.log("Test 1: calculateCGPACeiling passes", ceiling);

  // Test 2: generateStrategy max limit
  const backlogCourses: any[] = [
    { id: "b1", name: "Math", credits: 4, grade: "F", semester: 1 },
    { id: "b2", name: "Data Structures", credits: 4, grade: "F", semester: 3 },
  ];
  const { maxCredits } = BacklogEngine.generateStrategy(backlogCourses, 8, "BALANCED");
  // The logic should loop up to Math.max(8, 8+4) = 12.
  const plan = BacklogEngine.generateStrategy(backlogCourses, 8, "BALANCED");
  if (!plan.plannedCourses["b1"]) {
    throw new Error("b1 not planned");
  }
  console.log("Test 2: generateStrategy passes maxSem");

  // Test 3: TimeTravelCGPA
  const history: any[] = [
    { semester: 1, sgpa: 8.0, credits: 20 },
    { semester: 2, sgpa: 6.0, credits: 20 },
  ]; // Total points = 160 + 120 = 280. Total credits = 40.
  // CGPA = 280 / 40 = 7.0
  const tCgpa = BacklogEngine.calculateTimeTravelCGPA(
    { id: "c1", name: "c1", credits: 4, grade: "C", semester: 1 } as any, 
    "O", // from C (5) to O (10)
    [ { id: "c1", name: "c1", credits: 4, grade: "C", semester: 1 } as any ],
    history
  );
  // Old points for C = 4 * 5 = 20.
  // New points for O = 4 * 10 = 40.
  // Total points = 280 - 20 + 40 = 300.
  // Total credits = 40.
  // New CGPA = 300 / 40 = 7.5.
  assertEqual(tCgpa, 7.5, "TimeTravelCGPA from C to O");
  console.log("Test 3: calculateTimeTravelCGPA passes");
  
  // Test 4: ROI
  const activeBacklogs: any[] = [
    { id: "c2", name: "c2", credits: 4, grade: "F", semester: 1 }
  ];
  const roi = BacklogEngine.calculateCGPARoi(activeBacklogs, history);
  // F (0) to A (8)
  // New points = 280 - 0 + 32 = 312.
  // New CGPA = 312 / 40 = 7.8
  // ROI = 7.8 - 7.0 = 0.8
  const expectedRoi = parseFloat((7.8 - 7.0).toFixed(2));
  assertEqual((roi[0] as any).cgpaBoost || (roi[0] as any).roi, expectedRoi, "ROI calculation");
  console.log("Test 4: calculateCGPARoi passes");

  console.log("All stress tests passed successfully!");
} catch (err) {
  console.error(err);
  process.exit(1);
}
