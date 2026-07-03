import { sanitizeAdherenceNeutralText } from "../../lib/time-liquidity/sanitizer";
import { solveTimeConstraints } from "../../lib/engines/constraintSolver";

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m"
};

let totalTests = 0;
let passedTests = 0;

function section(name: string) {
  console.log(`\n${colors.bright}${colors.blue}=== SECTION: ${name} ===${colors.reset}`);
}

function assert(description: string, condition: boolean, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ${colors.green}✓ PASS:${colors.reset} ${description}`);
  } else {
    console.error(`  ${colors.red}✗ FAIL:${colors.reset} ${description}`);
    if (details) {
      console.error(`    ${colors.yellow}Details:${colors.reset} ${details}`);
    }
  }
}

// Bunk simulation logic helper
export function calculateBunkImpact(attended: number, conducted: number, futureBunks: number, futureAttended: number, minAttendance: number = 75) {
  const finalAttended = attended + futureAttended;
  const finalConducted = conducted + futureBunks + futureAttended;
  const percentage = finalConducted > 0 ? (finalAttended / finalConducted) * 100 : 100;
  
  let safeBunks = 0;
  let recoveryRequired = 0;
  
  const attendanceDecimal = minAttendance / 100;
  if (percentage >= minAttendance) {
    safeBunks = Math.floor((finalAttended - attendanceDecimal * finalConducted) / attendanceDecimal);
    safeBunks = Math.max(0, safeBunks);
  } else {
    recoveryRequired = Math.ceil((attendanceDecimal * finalConducted - finalAttended) / (1 - attendanceDecimal));
    recoveryRequired = Math.max(0, recoveryRequired);
  }
  
  return {
    percentage: parseFloat(percentage.toFixed(1)),
    safeBunks,
    recoveryRequired,
    isSafe: percentage >= minAttendance
  };
}

export function runAttendanceTests(): boolean {
  console.log(`\n${colors.bright}${colors.blue}GradeFlow Attendance Bunk Simulator Verification Suite${colors.reset}`);
  console.log(`----------------------------------------------------------------`);

  section("Static State Bunk Calculation Formulas");

  // Attended: 34, Conducted: 40. Current Percentage = 85%. Min required = 75%
  const result1 = calculateBunkImpact(34, 40, 0, 0, 75);
  assert("Current attendance percentage is 85%", result1.percentage === 85.0);
  assert("Max safe bunks is 5", result1.safeBunks === 5);
  assert("No recovery classes required", result1.recoveryRequired === 0);

  // If they bunk 5 classes, Conducted becomes 45, Attended remains 34 (75.6%)
  const result1Bunk5 = calculateBunkImpact(34, 40, 5, 0, 75);
  assert("After 5 bunks, percentage is 75.6%", result1Bunk5.percentage === 75.6);
  assert("Still safe after 5 bunks", result1Bunk5.isSafe);

  // If they bunk 6 classes, Conducted becomes 46, Attended remains 34 (73.9%)
  const result1Bunk6 = calculateBunkImpact(34, 40, 6, 0, 75);
  assert("After 6 bunks, percentage is 73.9%", result1Bunk6.percentage === 73.9);
  assert("Not safe after 6 bunks", !result1Bunk6.isSafe);

  section("Attendance Recovery Calculations");

  // Attended: 28, Conducted: 40. Current Percentage = 70%. Min required = 75%
  const result2 = calculateBunkImpact(28, 40, 0, 0, 75);
  assert("Current attendance percentage is 70%", result2.percentage === 70.0);
  assert("Needs 8 classes to recover to 75%", result2.recoveryRequired === 8);
  assert("Safe bunks is 0 when already below limit", result2.safeBunks === 0);

  // If they attend 7 consecutive classes: Attended = 35, Conducted = 47 (74.5%)
  const result2Attend7 = calculateBunkImpact(28, 40, 0, 75, 75); // Wait! Let's pass 7 attended
  const result2Attend7Correct = calculateBunkImpact(28, 40, 0, 7, 75);
  assert("After attending 7 classes, percentage is 74.5%", result2Attend7Correct.percentage === 74.5);
  assert("Still not safe after 7 recovery classes", !result2Attend7Correct.isSafe);

  // If they attend 8 consecutive classes: Attended = 36, Conducted = 48 (75%)
  const result2Attend8 = calculateBunkImpact(28, 40, 0, 8, 75);
  assert("After attending 8 classes, percentage is 75.0%", result2Attend8.percentage === 75.0);
  assert("Safe after 8 recovery classes", result2Attend8.isSafe);

  section("Adherence Neutral Text Sanitizer (Hyphenated Protection)");

  assert("Does not sanitize hyphenated bunk-bed", sanitizeAdherenceNeutralText("This is a bunk-bed.") === "This is a bunk-bed.");
  assert("Does not sanitize hyphenated skip-level", sanitizeAdherenceNeutralText("We had a skip-level meeting.") === "We had a skip-level meeting.");
  assert("Does not sanitize hyphenated level-skip", sanitizeAdherenceNeutralText("Avoid level-skip scenario.") === "Avoid level-skip scenario.");
  assert("Sanitizes stand-alone bunked correctly", sanitizeAdherenceNeutralText("I bunked the class.") === "I reallocated the class.");
  assert("Sanitizes stand-alone skipped correctly", sanitizeAdherenceNeutralText("I skipped the meeting.") === "I reallocated the meeting.");
  assert("Sanitizes capitalized Bunk correctly", sanitizeAdherenceNeutralText("Bunk this session.") === "Reallocate this session.");
  assert("Sanitizes Time Liquidity to Attendance Optimizer", sanitizeAdherenceNeutralText("Time Liquidity is good.") === "Attendance Optimizer is good.");
  assert("Sanitizes portfolio to schedule", sanitizeAdherenceNeutralText("Check my portfolio.") === "Check my schedule.");
  assert("Sanitizes Reallocation Credits to Safe Skips", sanitizeAdherenceNeutralText("Use your Reallocation Credits.") === "Use your Safe Skips.");
  assert("Sanitizes risk exposure to risk level", sanitizeAdherenceNeutralText("Reduce risk exposure.") === "Reduce risk level.");

  section("Constraint Solver Intent Logic (grade_impact & max_consecutive)");

  const mockSchedule = [
    { id: "c1", courseCode: "CS101", title: "CS Theory", type: "Theory" as const, dayOfWeek: "Monday", startTime: "09:00", endTime: "10:00", isMandatory: false, penaltyWeight: 1.5 },
    { id: "c2", courseCode: "CS102", title: "CS Tutorial", type: "Theory" as const, dayOfWeek: "Monday", startTime: "10:00", endTime: "11:00", isMandatory: false, penaltyWeight: 1.0 },
    { id: "c3", courseCode: "CS103", title: "CS Lab", type: "Theory" as const, dayOfWeek: "Tuesday", startTime: "14:00", endTime: "15:00", isMandatory: false, penaltyWeight: 2.0 }
  ];

  // Test grade_impact: should prefer to skip lower penalty class c2 over c1
  const stateGrade = {
    schedule: mockSchedule,
    availableSafeBunks: 1.0,
    currentRuinRisk: 10.0
  };
  const solvedGrade = solveTimeConstraints(stateGrade, [{ type: 'grade_impact' }]);
  assert("grade_impact prefers c2 (penalty 1.0) over c1 (penalty 1.5)", solvedGrade.classesToSkip.includes("c2") && !solvedGrade.classesToSkip.includes("c1"));

  // Test max_consecutive: should prefer to skip c1 & c2 (back-to-back on Monday) over c3 (on Tuesday)
  const stateConsecutive = {
    schedule: mockSchedule,
    availableSafeBunks: 2.5,
    currentRuinRisk: 10.0
  };
  const solvedConsecutive = solveTimeConstraints(stateConsecutive, [{ type: 'max_consecutive' }]);
  assert("max_consecutive prioritizes back-to-back classes c1 and c2", solvedConsecutive.classesToSkip.includes("c1") && solvedConsecutive.classesToSkip.includes("c2"));

  console.log(`----------------------------------------------------------------`);
  console.log(`Attendance Tests Results: ${passedTests}/${totalTests} Passed.`);
  return passedTests === totalTests;
}
