import {
  calculateRequiredGPA,
  getDifficultyLevel,
} from "../../../../lib/presets/presetEngine";
import { sppuPreset } from "../../../../lib/presets/presetRegistry";

// Helper function to throw if test fails
function assertEqual(actual: any, expected: any, message: string) {
  if (actual !== expected) {
    throw new Error(`Test Failed: ${message} | Expected: ${expected}, Actual: ${actual}`);
  }
}

console.log("Running Stress Tests for Sub-milestone 2.1 fixes...");

try {
  // Test 1: Zero-credit bug in calculateRequiredGPA
  console.log("Test 1: Zero remaining credits should return Infinity");
  const reqGPAZeroCredits = calculateRequiredGPA(8.0, 7.5, 100, 0);
  assertEqual(reqGPAZeroCredits, Infinity, "calculateRequiredGPA with 0 remaining credits");

  // Test 2: Difficulty Level for ratio > 1
  console.log("Test 2: Difficulty level for ratio > 1 should be IMPOSSIBLE");
  // Assuming max grade point for SPPU is 10
  const reqGPAImpossible = 11.5;
  const difficulty = getDifficultyLevel(reqGPAImpossible, sppuPreset);
  assertEqual(difficulty.label, "IMPOSSIBLE", "Difficulty label for reqGPA > max GP");
  assertEqual(difficulty.subLabel, "Mathematically impossible", "Difficulty subLabel for reqGPA > max GP");

  // Test 3: Valid required GPA (lower target)
  console.log("Test 3: Lower target CGPA should yield required GPA < current CGPA");
  const reqGPALower = calculateRequiredGPA(7.0, 8.0, 100, 20);
  // Target total points: 7.0 * 120 = 840
  // Current total points: 8.0 * 100 = 800
  // Required total points: 840 - 800 = 40
  // Required GPA: 40 / 20 = 2.0
  assertEqual(reqGPALower, 2.0, "Lower target calculation");

  // Test 4: Difficulty level for negative or very low reqGPA
  console.log("Test 4: Difficulty level for very low reqGPA should be EASY");
  const difficultyEasy = getDifficultyLevel(2.0, sppuPreset);
  assertEqual(difficultyEasy.label, "EASY", "Difficulty label for low reqGPA");

  console.log("All stress tests passed successfully!");
} catch (err) {
  console.error(err);
  process.exit(1);
}
