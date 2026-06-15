/**
 * GradeFlow Database Schema Integrity & Constraint Test Suite
 * 
 * Verifies validation rules, boundary conditions, and relational constraints
 * for the newly designed Academic Calendar, Timetable, and Backlog Recovery models.
 */

// CLI Colors
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
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

// ─── VALIDATORS ─────────────────────────────────────────────────────────────

interface CalendarEventMock {
  id: string;
  university: string;
  title: string;
  description?: string;
  eventType: string;
  startDate: Date;
  endDate: Date;
  academicYear: string;
  semester?: string;
}

function validateAcademicCalendarEvent(event: CalendarEventMock): { success: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!event.title || event.title.trim() === "") {
    errors.push("Event title cannot be empty");
  }
  if (!event.eventType || event.eventType.trim() === "") {
    errors.push("Event type cannot be empty");
  }
  if (event.startDate > event.endDate) {
    errors.push(`Start date (${event.startDate.toISOString()}) cannot be after end date (${event.endDate.toISOString()})`);
  }
  return { success: errors.length === 0, errors };
}

interface TimetableSlotMock {
  id: string;
  courseId: string;
  dayOfWeek: number;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  room: string;
  instructor?: string;
  section?: string;
  semester: string;
  academicYear: string;
}

function validateTimetableSlot(slot: TimetableSlotMock): { success: boolean; errors: string[] } {
  const errors: string[] = [];
  if (slot.dayOfWeek < 1 || slot.dayOfWeek > 7) {
    errors.push(`Day of week must be between 1 and 7, got ${slot.dayOfWeek}`);
  }
  
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(slot.startTime)) {
    errors.push(`Start time must be in HH:MM format, got "${slot.startTime}"`);
  }
  if (!timeRegex.test(slot.endTime)) {
    errors.push(`End time must be in HH:MM format, got "${slot.endTime}"`);
  }

  if (errors.length === 0) {
    const [startH, startM] = slot.startTime.split(":").map(Number);
    const [endH, endM] = slot.endTime.split(":").map(Number);
    const startVal = startH * 60 + startM;
    const endVal = endH * 60 + endM;
    if (startVal >= endVal) {
      errors.push(`Start time (${slot.startTime}) must be strictly before end time (${slot.endTime})`);
    }
  }

  if (!slot.room || slot.room.trim() === "") {
    errors.push("Room name/location cannot be empty");
  }

  return { success: errors.length === 0, errors };
}

interface BacklogRecordMock {
  id: string;
  userId: string;
  courseId: string;
  originalSemester: string;
  originalGrade: string;
  status: "PENDING" | "REGISTERED" | "EXAM_SCHEDULED" | "CLEARED" | "VOIDED";
  attemptsCount: number;
  nextExamDate?: Date;
  recoveryPathway?: string;
}

function validateBacklogRecord(record: BacklogRecordMock): { success: boolean; errors: string[] } {
  const errors: string[] = [];
  if (record.attemptsCount < 0) {
    errors.push(`Attempts count cannot be negative, got ${record.attemptsCount}`);
  }
  if (!record.originalGrade || record.originalGrade.trim() === "") {
    errors.push("Original grade cannot be empty");
  }
  if (record.status === "EXAM_SCHEDULED" && !record.nextExamDate) {
    errors.push("EXAM_SCHEDULED backlog must have a next exam date scheduled");
  }
  return { success: errors.length === 0, errors };
}

interface ATKTRuleMock {
  id: string;
  university: string;
  maxBacklogsAllowed: number;
  recoveryWindowMonths: number;
  allowSummerTerm: boolean;
  minGpaToRecover: number;
}

function validateATKTRule(rule: ATKTRuleMock): { success: boolean; errors: string[] } {
  const errors: string[] = [];
  if (rule.maxBacklogsAllowed < 0) {
    errors.push("Max backlogs allowed cannot be negative");
  }
  if (rule.recoveryWindowMonths <= 0) {
    errors.push("Recovery window months must be positive");
  }
  if (rule.minGpaToRecover < 0 || rule.minGpaToRecover > 10) {
    errors.push("Min GPA to recover must be on a 10-point scale (between 0 and 10)");
  }
  return { success: errors.length === 0, errors };
}

// ─── EXECUTE TESTS ──────────────────────────────────────────────────────────

function runTests() {
  console.log(`${colors.bright}${colors.cyan}GradeFlow Database Schema Integrity & Constraint Verification Suite${colors.reset}`);
  console.log(`----------------------------------------------------------------`);

  // 1. Academic Calendar Events Tests
  section("Academic Calendar Event Boundary Validation");
  
  const validEvent: CalendarEventMock = {
    id: "evt_1",
    university: "jspm",
    title: "Mid-Term Examination Term 1",
    eventType: "EXAM_PERIOD",
    startDate: new Date("2026-09-15T09:00:00Z"),
    endDate: new Date("2026-09-22T17:00:00Z"),
    academicYear: "2026-2027"
  };
  const validEventRes = validateAcademicCalendarEvent(validEvent);
  assert("Valid event passes calendar boundary checks", validEventRes.success, validEventRes.errors.join(", "));

  const invalidDateEvent: CalendarEventMock = {
    ...validEvent,
    startDate: new Date("2026-09-25T09:00:00Z"), // after end date
    endDate: new Date("2026-09-22T17:00:00Z")
  };
  const invalidDateEventRes = validateAcademicCalendarEvent(invalidDateEvent);
  assert("Rejects calendar event where start date is after end date", !invalidDateEventRes.success && invalidDateEventRes.errors.some(e => e.includes("cannot be after end date")));

  const emptyTitleEvent: CalendarEventMock = {
    ...validEvent,
    title: "  "
  };
  const emptyTitleEventRes = validateAcademicCalendarEvent(emptyTitleEvent);
  assert("Rejects calendar event with an empty title", !emptyTitleEventRes.success && emptyTitleEventRes.errors.includes("Event title cannot be empty"));


  // 2. Timetable Slot Tests
  section("Timetable Slot Time Format and Order Constraints");
  
  const validSlot: TimetableSlotMock = {
    id: "slot_1",
    courseId: "course_dsa",
    dayOfWeek: 1, // Monday
    startTime: "09:00",
    endTime: "10:30",
    room: "Classroom 405",
    semester: "SEM-3",
    academicYear: "2026-2027"
  };
  const validSlotRes = validateTimetableSlot(validSlot);
  assert("Valid timetable slot passes format and time checks", validSlotRes.success, validSlotRes.errors.join(", "));

  const invalidDaySlot: TimetableSlotMock = {
    ...validSlot,
    dayOfWeek: 8 // Invalid day
  };
  const invalidDaySlotRes = validateTimetableSlot(invalidDaySlot);
  assert("Rejects timetable slot with invalid day of week (day=8)", !invalidDaySlotRes.success && invalidDaySlotRes.errors.some(e => e.includes("must be between 1 and 7")));

  const invalidTimeFormatSlot: TimetableSlotMock = {
    ...validSlot,
    startTime: "9:00", // should be 09:00
    endTime: "10:30"
  };
  const invalidTimeFormatSlotRes = validateTimetableSlot(invalidTimeFormatSlot);
  assert("Rejects timetable slot with invalid start time format (9:00)", !invalidTimeFormatSlotRes.success && invalidTimeFormatSlotRes.errors.some(e => e.includes("must be in HH:MM format")));

  const reversedTimeSlot: TimetableSlotMock = {
    ...validSlot,
    startTime: "11:00",
    endTime: "10:00"
  };
  const reversedTimeSlotRes = validateTimetableSlot(reversedTimeSlot);
  assert("Rejects timetable slot where start time is after end time", !reversedTimeSlotRes.success && reversedTimeSlotRes.errors.some(e => e.includes("must be strictly before end time")));

  const equalTimeSlot: TimetableSlotMock = {
    ...validSlot,
    startTime: "10:00",
    endTime: "10:00"
  };
  const equalTimeSlotRes = validateTimetableSlot(equalTimeSlot);
  assert("Rejects timetable slot where start time equals end time", !equalTimeSlotRes.success && equalTimeSlotRes.errors.some(e => e.includes("must be strictly before end time")));


  // 3. Backlog Record Tests
  section("Backlog Record Integrity & Recovery Pathways");
  
  const validBacklog: BacklogRecordMock = {
    id: "backlog_1",
    userId: "usr_alice",
    courseId: "course_math",
    originalSemester: "SEM-1",
    originalGrade: "F",
    status: "PENDING",
    attemptsCount: 1
  };
  const validBacklogRes = validateBacklogRecord(validBacklog);
  assert("Valid backlog record passes integrity checks", validBacklogRes.success, validBacklogRes.errors.join(", "));

  const negativeAttemptsBacklog: BacklogRecordMock = {
    ...validBacklog,
    attemptsCount: -1
  };
  const negativeAttemptsBacklogRes = validateBacklogRecord(negativeAttemptsBacklog);
  assert("Rejects backlog record with negative attempts count", !negativeAttemptsBacklogRes.success && negativeAttemptsBacklogRes.errors.some(e => e.includes("cannot be negative")));

  const missingExamDateBacklog: BacklogRecordMock = {
    ...validBacklog,
    status: "EXAM_SCHEDULED",
    nextExamDate: undefined
  };
  const missingExamDateBacklogRes = validateBacklogRecord(missingExamDateBacklog);
  assert("Rejects EXAM_SCHEDULED backlog if no next exam date is specified", !missingExamDateBacklogRes.success && missingExamDateBacklogRes.errors.some(e => e.includes("must have a next exam date scheduled")));


  // 4. ATKT Recovery Rules Tests
  section("ATKT Recovery Rules Configuration constraints");
  
  const validATKTRule: ATKTRuleMock = {
    id: "rule_sppu",
    university: "SPPU",
    maxBacklogsAllowed: 4,
    recoveryWindowMonths: 12,
    allowSummerTerm: true,
    minGpaToRecover: 5.0
  };
  const validATKTRuleRes = validateATKTRule(validATKTRule);
  assert("Valid ATKT rule passes structure constraints", validATKTRuleRes.success, validATKTRuleRes.errors.join(", "));

  const negativeBacklogsATKT: ATKTRuleMock = {
    ...validATKTRule,
    maxBacklogsAllowed: -2
  };
  const negativeBacklogsATKTRes = validateATKTRule(negativeBacklogsATKT);
  assert("Rejects ATKT rule with negative max backlogs allowed", !negativeBacklogsATKTRes.success && negativeBacklogsATKTRes.errors.includes("Max backlogs allowed cannot be negative"));

  const invalidGpaATKT: ATKTRuleMock = {
    ...validATKTRule,
    minGpaToRecover: 11.0 // out of 10.0 scale
  };
  const invalidGpaATKTRes = validateATKTRule(invalidGpaATKT);
  assert("Rejects ATKT rule where min GPA to recover is out of bounds (>10)", !invalidGpaATKTRes.success && invalidGpaATKTRes.errors.some(e => e.includes("must be on a 10-point scale")));

  // ----------------------------------------------------------------
  console.log(`\n----------------------------------------------------------------`);
  if (passedTests === totalTests) {
    console.log(`${colors.bright}${colors.green}ALL SCHEMA INTEGRITY TESTS PASSED SUCCESSFULLY! (${passedTests}/${totalTests})${colors.reset}\n`);
    process.exit(0);
  } else {
    console.error(`${colors.bright}${colors.red}SOME SCHEMA INTEGRITY TESTS FAILED! (${passedTests}/${totalTests} passed)${colors.reset}\n`);
    process.exit(1);
  }
}

runTests();
