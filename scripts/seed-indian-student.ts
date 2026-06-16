import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("Starting seed script for Indian engineering student (Rohan Sharma)...");
  
  const userId = "test-student-id";
  const userEmail = "student@gradeflow.ai";
  const userName = "Rohan Sharma";
  const userUniversity = "sppu";

  // 1. Clean up or create test user
  console.log(`Checking user: ${userId}`);
  const existingUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (existingUser) {
    console.log("User already exists. Starting cleanup to ensure idempotency...");

    // Clean up BacklogRecord
    const backlogDeleted = await prisma.backlogRecord.deleteMany({
      where: { userId }
    });
    console.log(`Deleted ${backlogDeleted.count} backlog records.`);

    // Clean up Enrollment (which cascade deletes AttendanceLog)
    const enrollmentDeleted = await prisma.enrollment.deleteMany({
      where: { userId }
    });
    console.log(`Deleted ${enrollmentDeleted.count} enrollment records.`);

    // Update user details to ensure SPPU university and name
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: userName,
        email: userEmail,
        university: userUniversity
      }
    });
    console.log("Updated user details.");
  } else {
    console.log("Creating new user...");
    await prisma.user.create({
      data: {
        id: userId,
        name: userName,
        email: userEmail,
        university: userUniversity
      }
    });
    console.log("Created user.");
  }

  // Clean up calendar events matching SPPU
  const calendarDeleted = await prisma.academicCalendarEvent.deleteMany({
    where: { university: userUniversity }
  });
  console.log(`Deleted ${calendarDeleted.count} SPPU calendar events.`);

  // 2. Ensure the 6 courses (plus 2 backlog courses) exist
  console.log("Ensuring courses exist...");
  
  const coursesToEnsure = [
    { code: "CS-201", name: "Data Structures & Algorithms", credits: 4 },
    { code: "CS-202", name: "Discrete Mathematics", credits: 4 },
    { code: "CS-203", name: "Digital Electronics & Logic Design", credits: 4 },
    { code: "CS-204", name: "Object Oriented Programming", credits: 4 },
    { code: "CS-205", name: "Computer Graphics", credits: 4 },
    { code: "CS-206", name: "Database Management Systems", credits: 4 },
    { code: "CS-101", name: "Introduction to Programming", credits: 3 },
    { code: "CS-102", name: "Basic Electrical Engineering", credits: 3 }
  ];

  const courseMap: Record<string, any> = {};

  for (const c of coursesToEnsure) {
    const course = await prisma.course.upsert({
      where: { code: c.code },
      update: { name: c.name, credits: c.credits },
      create: { code: c.code, name: c.name, credits: c.credits, prereqs: [] }
    });
    courseMap[c.code] = course;
    console.log(`Course ${c.code} (${c.name}) is ready.`);
  }

  // Clean up timetable slots for these 6 main courses
  const courseIdsToClean = [
    courseMap["CS-201"].id,
    courseMap["CS-202"].id,
    courseMap["CS-203"].id,
    courseMap["CS-204"].id,
    courseMap["CS-205"].id,
    courseMap["CS-206"].id
  ];

  const slotsDeleted = await prisma.timetableSlot.deleteMany({
    where: { courseId: { in: courseIdsToClean } }
  });
  console.log(`Deleted ${slotsDeleted.count} timetable slots.`);

  // 3. Enroll the student in the 6 courses
  console.log("Enrolling student in the 6 main courses...");
  const mainCourses = ["CS-201", "CS-202", "CS-203", "CS-204", "CS-205", "CS-206"];
  for (const code of mainCourses) {
    await prisma.enrollment.create({
      data: {
        userId,
        courseId: courseMap[code].id,
        semester: "4"
      }
    });
    console.log(`Enrolled student in ${code}`);
  }

  // 4. Create a full 6-subject Mon-Sat timetable
  console.log("Seeding timetable slots...");
  const timetableSlots = [
    // Monday: CS-201 (09:00 to 10:00, Room A-101, Instructor: Prof. A. Patil, Section: A, Semester: 4, Year: 2026), CS-202 (10:00 to 11:00, Room A-101, Instructor: Prof. B. Shinde, Section: A, Semester: 4, Year: 2026)
    {
      courseId: courseMap["CS-201"].id,
      dayOfWeek: 1,
      startTime: "09:00",
      endTime: "10:00",
      room: "Room A-101",
      instructor: "Prof. A. Patil",
      section: "A",
      semester: "4",
      academicYear: "2026"
    },
    {
      courseId: courseMap["CS-202"].id,
      dayOfWeek: 1,
      startTime: "10:00",
      endTime: "11:00",
      room: "Room A-101",
      instructor: "Prof. B. Shinde",
      section: "A",
      semester: "4",
      academicYear: "2026"
    },
    // Tuesday: CS-203 (09:00 to 10:00, Room A-102, Instructor: Prof. C. Joshi, Section: A, Semester: 4, Year: 2026), CS-204 (10:00 to 11:00, Room A-102, Instructor: Prof. D. Kulkarni, Section: A, Semester: 4, Year: 2026)
    {
      courseId: courseMap["CS-203"].id,
      dayOfWeek: 2,
      startTime: "09:00",
      endTime: "10:00",
      room: "Room A-102",
      instructor: "Prof. C. Joshi",
      section: "A",
      semester: "4",
      academicYear: "2026"
    },
    {
      courseId: courseMap["CS-204"].id,
      dayOfWeek: 2,
      startTime: "10:00",
      endTime: "11:00",
      room: "Room A-102",
      instructor: "Prof. D. Kulkarni",
      section: "A",
      semester: "4",
      academicYear: "2026"
    },
    // Wednesday: CS-205 (09:00 to 10:00, Room A-103, Instructor: Prof. E. Deshmukh, Section: A, Semester: 4, Year: 2026), CS-206 (10:00 to 11:00, Room A-103, Instructor: Prof. F. Muley, Section: A, Semester: 4, Year: 2026)
    {
      courseId: courseMap["CS-205"].id,
      dayOfWeek: 3,
      startTime: "09:00",
      endTime: "10:00",
      room: "Room A-103",
      instructor: "Prof. E. Deshmukh",
      section: "A",
      semester: "4",
      academicYear: "2026"
    },
    {
      courseId: courseMap["CS-206"].id,
      dayOfWeek: 3,
      startTime: "10:00",
      endTime: "11:00",
      room: "Room A-103",
      instructor: "Prof. F. Muley",
      section: "A",
      semester: "4",
      academicYear: "2026"
    },
    // Thursday: CS-201 (11:00 to 12:00, Room A-101, Instructor: Prof. A. Patil, Section: A, Semester: 4, Year: 2026), CS-202 (14:00 to 15:00, Room A-101, Instructor: Prof. B. Shinde, Section: A, Semester: 4, Year: 2026)
    {
      courseId: courseMap["CS-201"].id,
      dayOfWeek: 4,
      startTime: "11:00",
      endTime: "12:00",
      room: "Room A-101",
      instructor: "Prof. A. Patil",
      section: "A",
      semester: "4",
      academicYear: "2026"
    },
    {
      courseId: courseMap["CS-202"].id,
      dayOfWeek: 4,
      startTime: "14:00",
      endTime: "15:00",
      room: "Room A-101",
      instructor: "Prof. B. Shinde",
      section: "A",
      semester: "4",
      academicYear: "2026"
    },
    // Friday: CS-203 (11:00 to 12:00, Room A-102, Instructor: Prof. C. Joshi, Section: A, Semester: 4, Year: 2026), CS-204 (14:00 to 15:00, Room A-102, Instructor: Prof. D. Kulkarni, Section: A, Semester: 4, Year: 2026)
    {
      courseId: courseMap["CS-203"].id,
      dayOfWeek: 5,
      startTime: "11:00",
      endTime: "12:00",
      room: "Room A-102",
      instructor: "Prof. C. Joshi",
      section: "A",
      semester: "4",
      academicYear: "2026"
    },
    {
      courseId: courseMap["CS-204"].id,
      dayOfWeek: 5,
      startTime: "14:00",
      endTime: "15:00",
      room: "Room A-102",
      instructor: "Prof. D. Kulkarni",
      section: "A",
      semester: "4",
      academicYear: "2026"
    },
    // Saturday: CS-205 (11:00 to 12:00, Room A-103, Instructor: Prof. E. Deshmukh, Section: A, Semester: 4, Year: 2026), CS-206 (14:00 to 15:00, Room A-103, Instructor: Prof. F. Muley, Section: A, Semester: 4, Year: 2026)
    {
      courseId: courseMap["CS-205"].id,
      dayOfWeek: 6,
      startTime: "11:00",
      endTime: "12:00",
      room: "Room A-103",
      instructor: "Prof. E. Deshmukh",
      section: "A",
      semester: "4",
      academicYear: "2026"
    },
    {
      courseId: courseMap["CS-206"].id,
      dayOfWeek: 6,
      startTime: "14:00",
      endTime: "15:00",
      room: "Room A-103",
      instructor: "Prof. F. Muley",
      section: "A",
      semester: "4",
      academicYear: "2026"
    }
  ];

  for (const slot of timetableSlots) {
    await prisma.timetableSlot.create({
      data: slot
    });
  }
  console.log(`Successfully seeded ${timetableSlots.length} timetable slots.`);

  // 5. Create active calendar events for even semester (Jan-May 2026)
  console.log("Seeding academic calendar events...");
  const calendarEvents = [
    {
      university: userUniversity,
      title: "Semester Commencement",
      description: "Commencement of classes for even semester",
      eventType: "ACADEMIC",
      startDate: new Date("2026-01-05T00:00:00Z"),
      endDate: new Date("2026-01-05T23:59:59Z"),
      academicYear: "2026",
      semester: "even"
    },
    {
      university: userUniversity,
      title: "Sports Week",
      description: "Annual college sports festival",
      eventType: "SPORTS",
      startDate: new Date("2026-01-21T00:00:00Z"),
      endDate: new Date("2026-01-24T23:59:59Z"),
      academicYear: "2026",
      semester: "even"
    },
    {
      university: userUniversity,
      title: "Cultural Fest",
      description: "Annual college cultural festival",
      eventType: "CULTURAL",
      startDate: new Date("2026-02-12T00:00:00Z"),
      endDate: new Date("2026-02-14T23:59:59Z"),
      academicYear: "2026",
      semester: "even"
    },
    {
      university: userUniversity,
      title: "Mid-Term Exams",
      description: "Mid-semester internal theory exams",
      eventType: "EXAM",
      startDate: new Date("2026-03-02T00:00:00Z"),
      endDate: new Date("2026-03-07T23:59:59Z"),
      academicYear: "2026",
      semester: "even"
    },
    {
      university: userUniversity,
      title: "End-Term Theory Exams",
      description: "SPPU end-term theory exams",
      eventType: "EXAM",
      startDate: new Date("2026-05-04T00:00:00Z"),
      endDate: new Date("2026-05-15T23:59:59Z"),
      academicYear: "2026",
      semester: "even"
    },
    {
      university: userUniversity,
      title: "Term End",
      description: "Official end of even semester academic term",
      eventType: "ACADEMIC",
      startDate: new Date("2026-05-22T00:00:00Z"),
      endDate: new Date("2026-05-22T23:59:59Z"),
      academicYear: "2026",
      semester: "even"
    }
  ];

  for (const event of calendarEvents) {
    await prisma.academicCalendarEvent.create({
      data: event
    });
  }
  console.log(`Successfully seeded ${calendarEvents.length} calendar events.`);

  // 6. Create backlog records
  console.log("Seeding backlog records...");
  
  // Backlog 1
  await prisma.backlogRecord.create({
    data: {
      userId,
      courseId: courseMap["CS-101"].id,
      originalSemester: "1",
      originalGrade: "F",
      status: "PENDING",
      attemptsCount: 1
    }
  });
  console.log("Backlog 1 (CS-101) seeded successfully.");

  // Backlog 2
  const recoveryPathwayJson = {
    studyPlan: "Read 1 module of Basic Electrical Engineering daily and solve previous year SPPU question papers.",
    dailyHours: 2,
    recoveryProbability: 0.85,
    resources: ["NPTEL Course on Basic Electrical", "B.L. Theraja textbook", "Class notes"]
  };

  await prisma.backlogRecord.create({
    data: {
      userId,
      courseId: courseMap["CS-102"].id,
      originalSemester: "2",
      originalGrade: "FF",
      status: "REGISTERED",
      attemptsCount: 1,
      recoveryPathway: JSON.stringify(recoveryPathwayJson)
    }
  });
  console.log("Backlog 2 (CS-102) seeded successfully.");

  console.log("Indian engineering student seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error executing seed script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
