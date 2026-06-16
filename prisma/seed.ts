import "dotenv/config";
import { prisma } from "../lib/prisma";

const SPPU_COURSES = [
  { code: "CS-201", name: "Data Structures & Algorithms", credits: 4, prereqs: [] },
  { code: "CS-202", name: "Discrete Mathematics", credits: 4, prereqs: [] },
  { code: "CS-203", name: "Digital Electronics & Logic Design", credits: 3, prereqs: [] },
  { code: "CS-204", name: "Object Oriented Programming", credits: 3, prereqs: [] },
  { code: "CS-205", name: "Computer Graphics", credits: 3, prereqs: [] },
];

const VTU_COURSES = [
  { code: "21CS31", name: "Transform Calculus, Fourier Series And Numerical Techniques", credits: 3, prereqs: [] },
  { code: "21CS32", name: "Data Structures and Applications", credits: 4, prereqs: ["CS-201"] },
  { code: "21CS33", name: "Analog and Digital Electronics", credits: 3, prereqs: [] },
  { code: "21CS34", name: "Computer Organization and Architecture", credits: 3, prereqs: [] },
  { code: "21CS35", name: "Object Oriented Programming with Java", credits: 3, prereqs: [] },
  { code: "21CS36", name: "Audit Course: Constitution of India", credits: 0, prereqs: [] }, // VTU zero credit blocker check!
];

const JNTUH_COURSES = [
  { code: "CS301ES", name: "Analog and Digital Electronics", credits: 3, prereqs: [] },
  { code: "CS302PC", name: "Data Structures", credits: 4, prereqs: [] },
  { code: "CS303PC", name: "Computer Organisation and Architecture", credits: 3, prereqs: [] },
  { code: "CS304PC", name: "Object Oriented Programming through Java", credits: 3, prereqs: [] },
  { code: "CS305MH", name: "Business Economics & Financial Analysis", credits: 3, prereqs: [] },
];

const MU_COURSES = [
  { code: "CSC301", name: "Engineering Mathematics-III", credits: 4, prereqs: [] },
  { code: "CSC302", name: "Discrete Structures and Graph Theory", credits: 3, prereqs: [] },
  { code: "CSC303", name: "Data Structures", credits: 3, prereqs: [] },
  { code: "CSC304", name: "Digital Logic & Computer Architecture", credits: 3, prereqs: [] },
  { code: "CSC305", name: "Computer Graphics", credits: 3, prereqs: [] },
];

async function main() {
  console.log("Starting academic seed sequence...");

  // 1. Clean existing records
  console.log("Cleaning database courses, rules, calendar events, timetable slots...");
  await prisma.timetableSlot.deleteMany({});
  await prisma.aTKTRule.deleteMany({});
  await prisma.academicCalendarEvent.deleteMany({});
  await prisma.course.deleteMany({});

  // 2. Insert standard university course templates
  const allCourses = [
    ...SPPU_COURSES,
    ...VTU_COURSES,
    ...JNTUH_COURSES,
    ...MU_COURSES,
  ];

  console.log(`Inserting ${allCourses.length} standard university courses...`);

  const courseCodeMap: Record<string, string> = {};
  for (const c of allCourses) {
    const created = await prisma.course.create({
      data: {
        code: c.code,
        name: c.name,
        credits: c.credits,
        prereqs: c.prereqs,
      },
    });
    courseCodeMap[created.code] = created.id;
    console.log(`  ✓ Seeded course: [${created.code}] ${created.name} (${created.credits} credits)`);
  }

  // 3. Insert ATKTRules
  console.log("Inserting ATKT Rules...");
  const atktRules = [
    { university: "SPPU", maxBacklogsAllowed: 4, recoveryWindowMonths: 12, minGpaToRecover: 5.0, description: "SPPU ATKT Rules" },
    { university: "VTU", maxBacklogsAllowed: 4, recoveryWindowMonths: 12, minGpaToRecover: 5.0, description: "VTU ATKT Rules" },
    { university: "JNTUH", maxBacklogsAllowed: 4, recoveryWindowMonths: 12, minGpaToRecover: 5.0, description: "JNTUH ATKT Rules" },
    { university: "MU", maxBacklogsAllowed: 4, recoveryWindowMonths: 12, minGpaToRecover: 5.0, description: "MU ATKT Rules" },
  ];
  for (const rule of atktRules) {
    const created = await prisma.aTKTRule.create({
      data: rule,
    });
    console.log(`  ✓ Seeded ATKT Rule for: ${created.university}`);
  }

  // 4. Insert AcademicCalendarEvents
  console.log("Inserting Academic Calendar Events...");
  const calendarEvents = [
    // SPPU
    { university: "sppu", title: "Term Start", eventType: "TERM_START", startDate: new Date("2026-08-01T09:00:00Z"), endDate: new Date("2026-08-01T17:00:00Z"), academicYear: "2026-2027", semester: "SEM-3" },
    { university: "sppu", title: "Mid-Term Examination", eventType: "EXAM_PERIOD", startDate: new Date("2026-10-10T09:00:00Z"), endDate: new Date("2026-10-15T17:00:00Z"), academicYear: "2026-2027", semester: "SEM-3" },
    { university: "sppu", title: "Final Examination", eventType: "EXAM_PERIOD", startDate: new Date("2026-12-05T09:00:00Z"), endDate: new Date("2026-12-15T17:00:00Z"), academicYear: "2026-2027", semester: "SEM-3" },
    // VTU
    { university: "vtu", title: "Term Start", eventType: "TERM_START", startDate: new Date("2026-08-01T09:00:00Z"), endDate: new Date("2026-08-01T17:00:00Z"), academicYear: "2026-2027", semester: "SEM-3" },
    { university: "vtu", title: "Mid-Term Examination", eventType: "EXAM_PERIOD", startDate: new Date("2026-10-10T09:00:00Z"), endDate: new Date("2026-10-15T17:00:00Z"), academicYear: "2026-2027", semester: "SEM-3" },
    { university: "vtu", title: "Final Examination", eventType: "EXAM_PERIOD", startDate: new Date("2026-12-05T09:00:00Z"), endDate: new Date("2026-12-15T17:00:00Z"), academicYear: "2026-2027", semester: "SEM-3" },
    // JNTUH
    { university: "jntuh", title: "Term Start", eventType: "TERM_START", startDate: new Date("2026-08-01T09:00:00Z"), endDate: new Date("2026-08-01T17:00:00Z"), academicYear: "2026-2027", semester: "SEM-3" },
    { university: "jntuh", title: "Mid-Term Examination", eventType: "EXAM_PERIOD", startDate: new Date("2026-10-10T09:00:00Z"), endDate: new Date("2026-10-15T17:00:00Z"), academicYear: "2026-2027", semester: "SEM-3" },
    { university: "jntuh", title: "Final Examination", eventType: "EXAM_PERIOD", startDate: new Date("2026-12-05T09:00:00Z"), endDate: new Date("2026-12-15T17:00:00Z"), academicYear: "2026-2027", semester: "SEM-3" },
    // MU
    { university: "mu", title: "Term Start", eventType: "TERM_START", startDate: new Date("2026-08-01T09:00:00Z"), endDate: new Date("2026-08-01T17:00:00Z"), academicYear: "2026-2027", semester: "SEM-3" },
    { university: "mu", title: "Mid-Term Examination", eventType: "EXAM_PERIOD", startDate: new Date("2026-10-10T09:00:00Z"), endDate: new Date("2026-10-15T17:00:00Z"), academicYear: "2026-2027", semester: "SEM-3" },
    { university: "mu", title: "Final Examination", eventType: "EXAM_PERIOD", startDate: new Date("2026-12-05T09:00:00Z"), endDate: new Date("2026-12-15T17:00:00Z"), academicYear: "2026-2027", semester: "SEM-3" },
  ];
  for (const event of calendarEvents) {
    const created = await prisma.academicCalendarEvent.create({
      data: event,
    });
    console.log(`  ✓ Seeded Event: [${created.university}] ${created.title}`);
  }

  // 5. Insert TimetableSlots
  console.log("Inserting Timetable Slots...");
  const slotsToCreate = [];

  // SPPU CS-201
  if (courseCodeMap["CS-201"]) {
    slotsToCreate.push({
      courseId: courseCodeMap["CS-201"],
      dayOfWeek: 1, // Monday
      startTime: "09:00",
      endTime: "10:00",
      room: "LHC-101",
      instructor: "Prof. S. Joshi",
      section: "Div A",
      semester: "SEM-3",
      academicYear: "2026-2027",
    });
  }
  // VTU 21CS31
  if (courseCodeMap["21CS31"]) {
    slotsToCreate.push({
      courseId: courseCodeMap["21CS31"],
      dayOfWeek: 1, // Monday
      startTime: "09:00",
      endTime: "10:00",
      room: "VTU-301",
      instructor: "Prof. K. Gowda",
      section: "Sec A",
      semester: "SEM-3",
      academicYear: "2026-2027",
    });
  }
  // JNTUH CS301ES
  if (courseCodeMap["CS301ES"]) {
    slotsToCreate.push({
      courseId: courseCodeMap["CS301ES"],
      dayOfWeek: 1, // Monday
      startTime: "09:00",
      endTime: "10:00",
      room: "JNTU-102",
      instructor: "Prof. R. Reddy",
      section: "Sec B",
      semester: "SEM-3",
      academicYear: "2026-2027",
    });
  }
  // MU CSC301
  if (courseCodeMap["CSC301"]) {
    slotsToCreate.push({
      courseId: courseCodeMap["CSC301"],
      dayOfWeek: 1, // Monday
      startTime: "09:00",
      endTime: "10:00",
      room: "MU-Lecture-2",
      instructor: "Prof. M. Kulkarni",
      section: "Batch A",
      semester: "SEM-3",
      academicYear: "2026-2027",
    });
  }

  for (const slot of slotsToCreate) {
    const created = await prisma.timetableSlot.create({
      data: slot,
    });
    console.log(`  ✓ Seeded Timetable Slot: Course ID ${created.courseId} on Day ${created.dayOfWeek}`);
  }

  console.log("Seed sequence completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seed execution:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
