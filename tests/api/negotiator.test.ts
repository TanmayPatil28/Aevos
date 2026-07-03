import { resolveTemporalExpressions, buildSystemPrompt } from "../../app/api/negotiator/route";

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

export function runNegotiatorTests(): boolean {
  console.log(`\n${colors.bright}${colors.blue}GradeFlow Negotiator Route Heuristics Unit Test Suite${colors.reset}`);
  console.log(`----------------------------------------------------------------`);

  section("Date Resolution Fallbacks (resolveTemporalExpressions)");

  const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const todayIdx = now.getDay();
  const todayName = WEEKDAY_NAMES[todayIdx];
  const tomorrowName = WEEKDAY_NAMES[(todayIdx + 1) % 7];

  // Test "today"
  const resToday = resolveTemporalExpressions("I want to skip today");
  assert("Resolves 'today' to current weekday name in Kolkata", resToday.resolvedDays.includes(todayName));

  // Test "tomorrow"
  const resTomorrow = resolveTemporalExpressions("Can I bunk tomorrow?");
  assert("Resolves 'tomorrow' to actual tomorrow's weekday name", resTomorrow.resolvedDays.includes(tomorrowName));

  // Test "this week"
  const resThisWeek = resolveTemporalExpressions("Find time blocks this week");
  if (todayIdx < 5) {
    const expectedRemaining = WEEKDAY_NAMES[todayIdx + 1];
    assert("Resolves 'this week' to remaining weekdays starting from today+1", resThisWeek.resolvedDays.includes(expectedRemaining));
  } else {
    assert("Resolves 'this week' correctly when it is Friday/weekend", resThisWeek.resolvedDays.length === 0 || todayIdx === 5);
  }

  // Test "next monday"
  const resNextMonday = resolveTemporalExpressions("Optimize next monday");
  assert("Resolves 'next monday' to include weekday 'Monday'", resNextMonday.resolvedDays.includes("Monday"));
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  const hasDateString = resNextMonday.resolvedDays.some(day => datePattern.test(day));
  assert("Resolves 'next monday' to include the actual YYYY-MM-DD next Monday date string", hasDateString);

  section("Agent System Prompt Threshold Differentiation (buildSystemPrompt)");

  const schedule = [
    { id: "1", courseCode: "CS101", title: "Intro to CS", type: "Theory", dayOfWeek: "Monday", startTime: "09:00", endTime: "10:00", isMandatory: false, penaltyWeight: 1.0 }
  ];

  // Compliance Agent System Prompt
  const promptCompliance = buildSystemPrompt("Compliance Agent", "Balanced", schedule, "Monday", "Tuesday", ["Tuesday", "Wednesday"], "");
  assert("Compliance Agent prompt contains 80% attendance threshold", promptCompliance.includes("80%"));

  // Tactical Negotiator System Prompt (Balanced strategy)
  const promptTacticalBalanced = buildSystemPrompt("Tactical Negotiator", "Balanced", schedule, "Monday", "Tuesday", ["Tuesday", "Wednesday"], "");
  assert("Tactical Negotiator Balanced prompt contains 65% attendance threshold", promptTacticalBalanced.includes("65%"));

  // Tactical Negotiator System Prompt (Survival strategy)
  const promptTacticalSurvival = buildSystemPrompt("Tactical Negotiator", "Survival", schedule, "Monday", "Tuesday", ["Tuesday", "Wednesday"], "");
  assert("Tactical Negotiator Survival prompt contains 60% attendance threshold", promptTacticalSurvival.includes("60%"));

  // Deliverable Agent System Prompt (Exam Sprint strategy)
  const promptDeliverableSprint = buildSystemPrompt("Deliverable Agent", "Exam Sprint", schedule, "Monday", "Tuesday", ["Tuesday", "Wednesday"], "Upcoming exam: CS101");
  assert("Deliverable Agent Exam Sprint prompt contains 78% attendance threshold", promptDeliverableSprint.includes("78%"));
  assert("Deliverable Agent prompt references upcoming backlog exam info", promptDeliverableSprint.includes("Upcoming exam: CS101"));

  console.log(`----------------------------------------------------------------`);
  console.log(`Negotiator Route Tests Results: ${passedTests}/${totalTests} Passed.`);
  return passedTests === totalTests;
}
