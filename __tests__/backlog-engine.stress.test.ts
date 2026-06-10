import { BacklogEngine } from "../lib/backlog-intelligence/engine";
import { CourseState, SemesterHistoryEntry, CareerState } from "../stores/usmStore";

function assertEqual(actual: any, expected: any, message: string) {
  if (actual !== expected) {
    throw new Error(`Test Failed: ${message} | Expected: ${expected}, Actual: ${actual}`);
  }
}

function assertArrayContains(actual: any[], expectedItem: any, message: string) {
    if (!actual.find(a => JSON.stringify(a) === JSON.stringify(expectedItem))) {
        throw new Error(`Test Failed: ${message} | Did not find expected item in array.`);
    }
}

console.log("Running Stress Tests for BacklogEngine (Sub-milestone 2.2)...");

try {
  // Mock Data
  const mockCourses: CourseState[] = [
    { id: "c1", code: "CS101", name: "Data Structures", credits: 4, semester: 1, grade: "F", cieMarks: 10, seeMarks: 10 },
    { id: "c2", code: "CS102", name: "Algorithms", credits: 4, semester: 2, grade: "FF", cieMarks: 5, seeMarks: 5 },
    { id: "c3", code: "CS103", name: "Operating Systems", credits: 4, semester: 3, grade: "F", cieMarks: 15, seeMarks: 10 },
    { id: "c4", code: "CS104", name: "Databases", credits: 4, semester: 4, grade: "F", cieMarks: 12, seeMarks: 8 },
    { id: "c5", code: "CS105", name: "Networks", credits: 4, semester: 5, grade: "F", cieMarks: 12, seeMarks: 8 },
    { id: "c6", code: "CS106", name: "AI", credits: 4, semester: 6, grade: "F", cieMarks: 12, seeMarks: 8 },
    { id: "c7", code: "CS107", name: "ML", credits: 4, semester: 7, grade: "F", cieMarks: 12, seeMarks: 8 },
    // A course that we passed
    { id: "c8", code: "CS108", name: "Math", credits: 4, semester: 1, grade: "A", cieMarks: 35, seeMarks: 35 },
  ] as any;

  const mockHistory: SemesterHistoryEntry[] = [
    { semester: 1, sgpa: 4.0, credits: 20, earnedCredits: 16 }, // F in CS101 (4 credits)
    { semester: 2, sgpa: 4.0, credits: 20, earnedCredits: 16 },
    { semester: 3, sgpa: 4.0, credits: 20, earnedCredits: 16 },
    { semester: 4, sgpa: 4.0, credits: 20, earnedCredits: 16 },
    { semester: 5, sgpa: 4.0, credits: 20, earnedCredits: 16 },
    { semester: 6, sgpa: 4.0, credits: 20, earnedCredits: 16 },
    { semester: 7, sgpa: 4.0, credits: 20, earnedCredits: 16 },
  ];

  const mockCareer: CareerState = {
    targetCompanies: ["Google", "Amazon"],
  } as any;

  // Test 1: calculateCGPACeiling
  // 7 completed semesters. maxSem should be max(8, 7+4) = 11.
  const ceilingData = BacklogEngine.calculateCGPACeiling(mockCourses, 7, mockHistory);
  
  assertEqual(ceilingData.length, 4, "Should project up to semester 11 (4 future semesters)");
  assertEqual(ceilingData[ceilingData.length - 1].semester, 11, "Last semester should be 11");

  // Let's verify the ceiling points calculation
  // Total attempted credits = 140
  // Total points = 7 * (4.0 * 20) = 560
  // Active backlogs = 7 * 4 = 28 credits.
  // Ceiling adds backlogs cleared with O: 28 * 10 = 280 points.
  // 4 future semesters (22 credits each) = 88 credits.
  // Ceiling adds 88 * 10 = 880 points.
  // Total Ceiling points = 560 + 280 + 880 = 1720
  // Total Ceiling credits = 140 + 88 = 228
  // Ceiling CGPA = 1720 / 228 = 7.5438...
  
  assertEqual(ceilingData[ceilingData.length - 1].mathematicalCeiling, 7.54, "Mathematical ceiling at sem 11");

  // Test 2: generateStrategy SAFE limits
  const safeStrategy = BacklogEngine.generateStrategy(mockCourses, 8, "SAFE");
  // Max credits = 24.
  // Each semester has base 20 credits. So we can add 4 credits (1 backlog) per semester.
  // Semesters: 8, 9, 10, 11, 12. Wait, current is 8. maxSem = max(8, 8+4) = 12.
  // Semesters available: 8, 9, 10, 11, 12 (5 semesters)
  // We have 7 backlogs. We can place 1 per semester. So 5 placed, 2 unplannable.
  assertEqual(safeStrategy.unplannableCourses.length, 2, "SAFE strategy should have 2 unplannable courses");

  // Test 3: generateStrategy BALANCED limits
  const balancedStrategy = BacklogEngine.generateStrategy(mockCourses, 8, "BALANCED");
  // Max credits = 28. Base = 20. Backlog capacity = 8 credits (2 backlogs) per sem.
  // Semesters: 8, 9, 10, 11, 12. We can place 2 * 5 = 10 backlogs.
  // We have 7 backlogs, all should be planned.
  assertEqual(balancedStrategy.unplannableCourses.length, 0, "BALANCED strategy should have 0 unplannable courses");

  // Test 4: calculateTimeTravelCGPA
  const timeTravelCgpa = BacklogEngine.calculateTimeTravelCGPA(mockCourses[0], "O", mockHistory, mockCourses);
  // CS101 credits = 4. Old points = 0. New points = 40.
  // Total points before = 560. New points = 600.
  // Total credits = 140. 600 / 140 = 4.2857...
  assertEqual(timeTravelCgpa, 4.29, "TimeTravel CGPA calculation");

  // Test 5: Placement disqualification
  const disquals = BacklogEngine.checkPlacementDisqualification(mockCourses, mockCareer);
  // It should flag CS101 Data Structures for Google/Amazon
  assertEqual(disquals.length, 1, "Should have 1 disqualification");
  assertEqual(disquals[0].courseId, "c1", "Disqualification should be Data Structures");

  console.log("ALL STRESS TESTS PASSED SUCCESSFULLY!");
} catch (err) {
  console.error(err);
  process.exit(1);
}
