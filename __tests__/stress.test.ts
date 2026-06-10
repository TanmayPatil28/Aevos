import { calculateRequiredGPA, getDifficultyLevel } from "../lib/presets/presetEngine";

const mockPreset: any = {
  id: "sppu",
  gradeScale: [
    { grade: 'O', points: 10, isPass: true, minMarks: 90 },
    { grade: 'A+', points: 9, isPass: true, minMarks: 80 },
    { grade: 'A', points: 8, isPass: true, minMarks: 70 },
    { grade: 'B+', points: 7, isPass: true, minMarks: 60 },
    { grade: 'B', points: 6, isPass: true, minMarks: 50 },
    { grade: 'C', points: 5, isPass: true, minMarks: 40 },
    { grade: 'F', points: 0, isPass: false }
  ]
};

function assertEqual(actual: any, expected: any, message: string) {
  if (actual !== expected) {
    throw new Error(`Test Failed: ${message} | Expected: ${expected}, Actual: ${actual}`);
  }
}

console.log("Running Isolated Stress Tests for Sub-milestone 2.1 fixes...");

try {
  // Test 1
  const reqGPAZeroCredits = calculateRequiredGPA(8.0, 7.5, 100, 0);
  assertEqual(reqGPAZeroCredits, Infinity, "calculateRequiredGPA with 0 remaining credits");

  // Test 2
  const difficulty = getDifficultyLevel(11.5, mockPreset);
  assertEqual(difficulty.label, "IMPOSSIBLE", "Difficulty label for reqGPA > max GP");
  assertEqual(difficulty.subLabel, "Mathematically impossible", "Difficulty subLabel for reqGPA > max GP");

  // Test 3
  const reqGPALower = calculateRequiredGPA(7.0, 8.0, 100, 20);
  assertEqual(reqGPALower, 2.0, "Lower target calculation");

  // Test 4
  const difficultyEasy = getDifficultyLevel(2.0, mockPreset);
  assertEqual(difficultyEasy.label, "EASY", "Difficulty label for low reqGPA");

  console.log("ALL STRESS TESTS PASSED SUCCESSFULLY!");
} catch (err) {
  console.error(err);
  process.exit(1);
}
