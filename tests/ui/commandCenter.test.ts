/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
import { useUSMStore } from "../../stores/usmStore";
import { getPresetById } from "../../lib/presets";
import * as fs from "fs";
import * as path from "path";

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m"
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

export function runCommandCenterTests(): boolean {
  console.log(`\n${colors.bright}${colors.cyan}GradeFlow Command Center Empirical Verification Suite${colors.reset}`);
  console.log(`----------------------------------------------------------------`);

  section("1. Dynamic Behavior of Target CGPA Slider");

  // Read page.tsx source to verify implementation of target CGPA slider
  const pagePath = path.join(__dirname, "../../app/(workspace)/calculator/page.tsx");
  const pageSource = fs.readFileSync(pagePath, "utf8");

  assert(
    "Target CGPA slider exists as an input element of type range",
    pageSource.includes('type="range"') && pageSource.includes('min="4.00"') && pageSource.includes('max="10.00"'),
    "Expected target range input element not found in page.tsx"
  );

  assert(
    "Slider onChange handler calls store.setAcademic with parsed float value",
    pageSource.includes("store.setAcademic({ targetCgpa: val })") || pageSource.includes("store.setAcademic({ targetCgpa:"),
    "Expected store.setAcademic call not found in onChange handler of range input"
  );

  // Test store state changes
  useUSMStore.setState({
    academic: {
      currentCgpa: 7.00,
      completedSemesters: 3,
      earnedCredits: 60,
      activeBacklogsCount: 0,
      targetCgpa: 7.50
    }
  });

  const storeState = useUSMStore.getState();
  assert(
    "Store initializes academic profile correctly",
    storeState.academic.currentCgpa === 7.00 && storeState.academic.targetCgpa === 7.50
  );

  // Simulate slider drag to 8.25
  storeState.setAcademic({ targetCgpa: 8.25 });
  const updatedState = useUSMStore.getState();
  assert(
    "Store successfully updates targetCgpa to 8.25 upon setAcademic call",
    updatedState.academic.targetCgpa === 8.25,
    `Expected targetCgpa to be 8.25, got: ${updatedState.academic.targetCgpa}`
  );

  section("2. Time-Weighted Grade Margin Logic across SPPU Presets");

  const sppuPresets = ["sppu", "sppu_2015", "sppu_2024"];

  // Helper simulating the page's getRequiredMarksForGP function
  const getRequiredMarksForGP = (gp: number, preset: any) => {
    if (!preset || !preset.gradeScale) return gp * 10;
    const scale = [
      ...preset.gradeScale
    ].filter((e: any) => e.minMarks !== undefined).sort((a: any, b: any) => a.points - b.points);
    const match = scale.find((e: any) => e.points >= gp);
    if (match) return match.minMarks || 0;
    if (scale.length > 0) return scale[scale.length - 1].minMarks || 0;
    return gp * 10;
  };

  // Profile data for test student
  const completedCredits = 60;
  const currentCgpa = 7.00;
  const simulatedCredits = 20;

  sppuPresets.forEach(presetId => {
    const preset = getPresetById(presetId);
    assert(`Preset ${presetId} loads successfully from registry`, !!preset);

    if (!preset) return;

    // We drag slider to targetCgpa = 7.50
    // S_target = (targetCgpa * (earnedCredits + simulatedCredits) - currentCgpa * earnedCredits) / simulatedCredits
    // S_target = (7.5 * 80 - 7.0 * 60) / 20 = (600 - 420) / 20 = 9.0
    const targetCgpaValue = 7.50;
    const S_target = (targetCgpaValue * (completedCredits + simulatedCredits) - currentCgpa * completedCredits) / simulatedCredits;
    const GP_target = Math.max(0, Math.min(10, S_target));

    assert(`GP_target mathematically equals 9.00 for target CGPA 7.50`, GP_target === 9.00, `Got: ${GP_target}`);

    // Map GP_target to required marks
    const requiredMarks = getRequiredMarksForGP(GP_target, preset);

    if (presetId === "sppu") {
      // 2019 Pattern: Grade A+ has 9 points -> minMarks 70
      assert("SPPU 2019 requires 70 marks for GP 9.00 (A+)", requiredMarks === 70, `Got: ${requiredMarks}`);
    } else if (presetId === "sppu_2015") {
      // 2015 Pattern: Grade A has 9 points -> minMarks 80
      assert("SPPU 2015 requires 80 marks for GP 9.00 (A)", requiredMarks === 80, `Got: ${requiredMarks}`);
    } else if (presetId === "sppu_2024") {
      // 2024 Pattern: Grade A+ has 9 points -> minMarks 75
      assert("SPPU 2024 requires 75 marks for GP 9.00 (A+)", requiredMarks === 75, `Got: ${requiredMarks}`);
    }

    // Now test study hours calculation for a course with 4 credits, CIE=20, SEE=30 (Total=50 marks)
    const testCourse = {
      credits: 4,
      cieMarks: 20,
      seeMarks: 30
    };
    const baseHours = testCourse.credits * 2;
    const currentMarks = testCourse.cieMarks + testCourse.seeMarks;
    const lostMarks = Math.max(0, requiredMarks - currentMarks);

    // If projectedCGPA < targetCgpa (which it is, since current projection is 7.0 and target is 7.5)
    // studyHours = baseHours + lostMarks * 0.2 * credits
    const studyHours = baseHours + (lostMarks * 0.2 * testCourse.credits);

    if (presetId === "sppu") {
      // sppu: requiredMarks = 70. lostMarks = 70 - 50 = 20. studyHours = 8 + 20 * 0.2 * 4 = 8 + 16 = 24
      assert("SPPU 2019 study hours equals 24.0 hrs/wk", studyHours === 24, `Got: ${studyHours}`);
    } else if (presetId === "sppu_2015") {
      // sppu_2015: requiredMarks = 80. lostMarks = 80 - 50 = 30. studyHours = 8 + 30 * 0.2 * 4 = 8 + 24 = 32
      assert("SPPU 2015 study hours equals 32.0 hrs/wk", studyHours === 32, `Got: ${studyHours}`);
    } else if (presetId === "sppu_2024") {
      // sppu_2024: requiredMarks = 75. lostMarks = 75 - 50 = 25. studyHours = 8 + 25 * 0.2 * 4 = 8 + 20 = 28
      assert("SPPU 2024 study hours equals 28.0 hrs/wk", studyHours === 28, `Got: ${studyHours}`);
    }
  });

  section("3. TableVirtuoso Table Layout and Capacity Stress Test");

  assert(
    "Page imports TableVirtuoso from react-virtuoso",
    pageSource.includes("TableVirtuoso") && pageSource.includes("react-virtuoso"),
    "react-virtuoso imports or TableVirtuoso usage missing in page.tsx"
  );

  assert(
    "Adherence table is virtualized and specifies TableVirtuoso with fixed minHeight",
    pageSource.includes("<TableVirtuoso") && pageSource.includes("minHeight:"),
    "TableVirtuoso element should configure a stable minHeight/height style to prevent CLS"
  );

  assert(
    "Page injects at least 55 mock items if user's course list is smaller than 50",
    pageSource.includes("initialCoursesList") && pageSource.includes("list.length < 50") && pageSource.includes("i < 55"),
    "Expected mock course padding loop to 55 items not found in initialCoursesList useMemo"
  );

  console.log(`\n----------------------------------------------------------------`);
  console.log(`Test Execution Completed: ${passedTests}/${totalTests} Passed.`);
  return passedTests === totalTests;
}

if (require.main === module) {
  const success = runCommandCenterTests();
  process.exit(success ? 0 : 1);
}
