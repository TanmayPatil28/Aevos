import { startRecoveryPayloadSchema } from "../../app/api/academic/backlogs/[id]/start-recovery/route";

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

export function runStartRecoveryValidationTests(): boolean {
  console.log(`\n${colors.bright}${colors.blue}GradeFlow Backlog Recovery Validation Schema Test Suite${colors.reset}`);
  console.log(`----------------------------------------------------------------`);

  section("Valid Payload Schema Verification");

  const validPayload = {
    subject: "Data Structures & Algorithms",
    failReason: "Missed final exam due to medical emergency",
    calendarContext: "SEM-3 autumn term",
    timetableLoad: "4 credits class load",
    retryDays: 30
  };

  const validResult = startRecoveryPayloadSchema.safeParse(validPayload);
  assert("Valid payload passes the schema verification", validResult.success, validResult.success ? "" : JSON.stringify(validResult.error.format()));

  section("Invalid Payload Schema Verification");

  const invalidSubject = {
    ...validPayload,
    subject: ""
  };
  const invalidSubjectRes = startRecoveryPayloadSchema.safeParse(invalidSubject);
  assert("Rejects payload when subject is empty string", !invalidSubjectRes.success);

  const invalidFailReason = {
    ...validPayload,
    failReason: ""
  };
  const invalidFailReasonRes = startRecoveryPayloadSchema.safeParse(invalidFailReason);
  assert("Rejects payload when failReason is empty string", !invalidFailReasonRes.success);

  const invalidCalendarContext = {
    ...validPayload,
    calendarContext: ""
  };
  const invalidCalendarContextRes = startRecoveryPayloadSchema.safeParse(invalidCalendarContext);
  assert("Rejects payload when calendarContext is empty string", !invalidCalendarContextRes.success);

  const invalidTimetableLoad = {
    ...validPayload,
    timetableLoad: ""
  };
  const invalidTimetableLoadRes = startRecoveryPayloadSchema.safeParse(invalidTimetableLoad);
  assert("Rejects payload when timetableLoad is empty string", !invalidTimetableLoadRes.success);

  const negativeRetryDays = {
    ...validPayload,
    retryDays: -5
  };
  const negativeRetryDaysRes = startRecoveryPayloadSchema.safeParse(negativeRetryDays);
  assert("Rejects payload when retryDays is negative", !negativeRetryDaysRes.success);

  const floatRetryDays = {
    ...validPayload,
    retryDays: 5.5
  };
  const floatRetryDaysRes = startRecoveryPayloadSchema.safeParse(floatRetryDays);
  assert("Rejects payload when retryDays is not an integer", !floatRetryDaysRes.success);

  const missingFields = {
    subject: "Maths"
  };
  const missingFieldsRes = startRecoveryPayloadSchema.safeParse(missingFields);
  assert("Rejects payload when required fields are missing", !missingFieldsRes.success);

  console.log(`----------------------------------------------------------------`);
  console.log(`Start-Recovery Validation Tests Results: ${passedTests}/${totalTests} Passed.`);
  return passedTests === totalTests;
}
