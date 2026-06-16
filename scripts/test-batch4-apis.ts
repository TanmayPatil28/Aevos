import "dotenv/config";
import { NextRequest } from "next/server";
import { prisma } from "../lib/prisma";

// Mock environment setup for Supabase auth client
let mockUser: { id: string } | null = { id: "test-unit-auth-user" };

import path from "path";

const supabaseServerPath = require.resolve("../lib/supabase/server");
const alternativeDrive = supabaseServerPath[0] === supabaseServerPath[0].toLowerCase()
  ? supabaseServerPath[0].toUpperCase()
  : supabaseServerPath[0].toLowerCase();
const alternativePath = alternativeDrive + supabaseServerPath.slice(1);

const mockModule = {
  id: supabaseServerPath,
  filename: supabaseServerPath,
  loaded: true,
  exports: {
    createClient: () => {
      return {
        auth: {
          getUser: async () => {
            return { data: { user: mockUser } };
          }
        }
      };
    }
  }
};

require.cache[supabaseServerPath] = mockModule as any;
require.cache[alternativePath] = mockModule as any;
require.cache[supabaseServerPath.toLowerCase()] = mockModule as any;
require.cache[supabaseServerPath.toUpperCase()] = mockModule as any;


// Dynamic handlers initialization to bypass TS import hoisting
let calendarGET: any, calendarPOST: any;
let calendarPUT: any;
let weeksRemainingGET: any;
let timetableGET: any;
let timetableEntryPOST: any;
let timetableTodayGET: any;
let timetableCountGET: any;
let backlogsGET: any, backlogPOST: any;
let startRecoveryPOST: any;
let markClearedPOST: any;
let withdrawPOST: any;
let backlogsSummaryGET: any;

function initHandlers() {
  const calendarRoute = require("../app/api/academic/calendar/route");
  calendarGET = calendarRoute.GET;
  calendarPOST = calendarRoute.POST;

  calendarPUT = require("../app/api/academic/calendar/[id]/route").PUT;
  weeksRemainingGET = require("../app/api/academic/calendar/[id]/weeks-remaining/route").GET;

  timetableGET = require("../app/api/academic/timetable/route").GET;
  timetableEntryPOST = require("../app/api/academic/timetable/entry/route").POST;
  timetableTodayGET = require("../app/api/academic/timetable/today/route").GET;
  timetableCountGET = require("../app/api/academic/timetable/[subjectId]/scheduled-count/route").GET;

  const backlogsRoute = require("../app/api/academic/backlogs/route");
  backlogsGET = backlogsRoute.GET;
  backlogPOST = backlogsRoute.POST;

  startRecoveryPOST = require("../app/api/academic/backlogs/[id]/start-recovery/route").POST;
  markClearedPOST = require("../app/api/academic/backlogs/[id]/mark-cleared/route").POST;
  withdrawPOST = require("../app/api/academic/backlogs/[id]/withdraw/route").POST;
  backlogsSummaryGET = require("../app/api/academic/backlogs/summary/route").GET;
}


function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function createMockRequest(url: string, method: string, body?: any, headers?: any) {
  const init: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };
  if (body) {
    init.body = JSON.stringify(body);
  }
  return new NextRequest(url, init);
}

// Global fetch override for testing start-recovery streaming success
const originalFetch = global.fetch;
let simulateFetchFailure = false;

global.fetch = async (url: string | URL | Request, init?: any) => {
  const urlStr = typeof url === "string" ? url : (url instanceof URL ? url.toString() : url.url);
  if (urlStr.endsWith("/api/jarvis/v2")) {
    if (simulateFetchFailure) {
      throw new Error("Simulated network failure");
    }

    const encoder = new TextEncoder();
    const chunks = [
      JSON.stringify({ type: "metadata", responseType: "data_card" }) + "\n",
      JSON.stringify({ type: "chunk", text: `AI generated plan:\n\`\`\`json\n` }) + "\n",
      JSON.stringify({
        type: "chunk",
        text: `{\n  "studyPlan": "Test daily review.",\n  "dailyHours": 3,\n  "recoveryProbability": 0.85,\n  "resources": ["Chapter 1", "Chapter 2"]\n}\n`
      }) + "\n",
      JSON.stringify({ type: "chunk", text: `\`\`\`\n` }) + "\n",
      JSON.stringify({ type: "done" }) + "\n"
    ];

    const stream = new ReadableStream({
      start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      }
    });

    return new Response(stream, { status: 200 });
  }
  return originalFetch(url, init);
};

async function runTests() {
  console.log("================================================================");
  console.log("🧪 GradeFlow Batch 4 IMPL-A API Routes Integration Tests");
  console.log("================================================================");

  let passed = 0;
  let failed = 0;
  
  // Load route handlers after mocks have been registered
  initHandlers();


  async function testCase(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Reason: ${err.message}`);
      if (err.stack) console.error(err.stack);
      failed++;
    }
  }

  // 1. Database Setup
  console.log("\nSetup test database state...");
  const testUser = await prisma.user.upsert({
    where: { id: "test-unit-auth-user" },
    update: { university: "jspm" },
    create: {
      id: "test-unit-auth-user",
      email: "test-auth-user@example.com",
      university: "jspm",
    }
  });

  const testCourse = await prisma.course.upsert({
    where: { code: "TEST-CS-101" },
    update: { name: "Test Course 101", credits: 4 },
    create: {
      code: "TEST-CS-101",
      name: "Test Course 101",
      credits: 4,
    }
  });

  const testEnrollment = await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: testUser.id,
        courseId: testCourse.id,
      }
    },
    update: { semester: "1" },
    create: {
      userId: testUser.id,
      courseId: testCourse.id,
      semester: "1",
    }
  });

  let createdCalendarEventId = "";
  let createdBacklogId = "";

  // ─── AUTHENTICATION TESTS ───
  await testCase("Strict Auth Check: GET /api/academic/calendar returns 401 when unauthorized", async () => {
    mockUser = null;
    const req = createMockRequest("http://localhost:3000/api/academic/calendar", "GET");
    const res = await calendarGET();
    assert(res.status === 401, `Expected status 401, got ${res.status}`);
    mockUser = { id: "test-unit-auth-user" }; // restore auth
  });

  // ─── CALENDAR TESTS ───
  await testCase("POST /api/academic/calendar creates a calendar event successfully", async () => {
    const payload = {
      title: "Batch 4 Exam",
      description: "Final exam period",
      eventType: "EXAM",
      startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days in future
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      academicYear: "2026-2027",
      semester: "Fall 2026",
    };
    const req = createMockRequest("http://localhost:3000/api/academic/calendar", "POST", payload);
    const res = await calendarPOST(req);
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    const data = await res.json();
    assert(data.title === "Batch 4 Exam", "Title mismatch");
    assert(data.university === "jspm", "University not populated from user model");
    createdCalendarEventId = data.id;
  });

  await testCase("GET /api/academic/calendar returns user's university events", async () => {
    const res = await calendarGET();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(Array.isArray(data), "Expected response to be array");
    const found = data.some((e: any) => e.id === createdCalendarEventId);
    assert(found, "Created event not found in list");
  });

  await testCase("PUT /api/academic/calendar/[id] updates the event", async () => {
    const payload = {
      title: "Batch 4 Exam Updated",
      description: "Final exam period updated",
      eventType: "EXAM",
      startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      academicYear: "2026-2027",
      semester: "Fall 2026",
    };
    const req = createMockRequest(`http://localhost:3000/api/academic/calendar/${createdCalendarEventId}`, "PUT", payload);
    const res = await calendarPUT(req, { params: { id: createdCalendarEventId } });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.title === "Batch 4 Exam Updated", "Title not updated");
  });

  await testCase("GET /api/academic/calendar/[id]/weeks-remaining calculates correct weeks", async () => {
    const req = createMockRequest(`http://localhost:3000/api/academic/calendar/${createdCalendarEventId}/weeks-remaining`, "GET");
    const res = await weeksRemainingGET(req, { params: { id: createdCalendarEventId } });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(typeof data.weeksRemaining === "number", "weeksRemaining must be a number");
    assert(data.weeksRemaining === 2, `Expected 2 weeks remaining for 10 days, got ${data.weeksRemaining}`);
  });

  // ─── TIMETABLE TESTS ───
  await testCase("POST /api/academic/timetable/entry creates slot and handles overlap", async () => {
    // 1. Create a non-overlapping slot
    const payload1 = {
      courseId: testCourse.id,
      dayOfWeek: 1, // Monday
      startTime: "09:00",
      endTime: "10:30",
      room: "Room 101",
      instructor: "Dr. Smith",
      section: "A",
      semester: "1",
      academicYear: "2026-2027",
    };
    const req1 = createMockRequest("http://localhost:3000/api/academic/timetable/entry", "POST", payload1);
    const res1 = await timetableEntryPOST(req1);
    assert(res1.status === 201, `Expected 201, got ${res1.status}`);

    // 2. Create an overlapping slot on the same dayOfWeek (conflict expected)
    const payloadConflict = {
      courseId: testCourse.id,
      dayOfWeek: 1, // Monday
      startTime: "10:00",
      endTime: "11:30", // overlaps 10:00-10:30
      room: "Room 102",
      instructor: "Dr. Jones",
      section: "B",
      semester: "1",
      academicYear: "2026-2027",
    };
    const reqConflict = createMockRequest("http://localhost:3000/api/academic/timetable/entry", "POST", payloadConflict);
    const resConflict = await timetableEntryPOST(reqConflict);
    assert(resConflict.status === 400, `Expected 400 conflict, got ${resConflict.status}`);
  });

  await testCase("GET /api/academic/timetable returns enrolled slots", async () => {
    const res = await timetableGET();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(Array.isArray(data), "Expected array of slots");
    assert(data.length > 0, "No slots returned");
    assert(data[0].courseId === testCourse.id, "Course ID mismatch");
  });

  await testCase("GET /api/academic/timetable/[subjectId]/scheduled-count returns correct count", async () => {
    const req = createMockRequest(`http://localhost:3000/api/academic/timetable/${testCourse.id}/scheduled-count`, "GET");
    const res = await timetableCountGET(req, { params: { subjectId: testCourse.id } });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.count === 1, `Expected scheduled count of 1, got ${data.count}`);
  });

  // ─── BACKLOG TESTS ───
  await testCase("POST /api/academic/backlogs creates record successfully", async () => {
    const payload = {
      courseId: testCourse.id,
      originalSemester: "1",
      originalGrade: "F",
      status: "PENDING",
      attemptsCount: 1,
    };
    const req = createMockRequest("http://localhost:3000/api/academic/backlogs", "POST", payload);
    const res = await backlogPOST(req);
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    const data = await res.json();
    assert(data.courseId === testCourse.id, "Course ID mismatch");
    assert(data.status === "PENDING", "Status mismatch");
    createdBacklogId = data.id;
  });

  await testCase("GET /api/academic/backlogs returns user's backlogs", async () => {
    const res = await backlogsGET();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(Array.isArray(data), "Expected array of backlogs");
    assert(data.some((b: any) => b.id === createdBacklogId), "Created backlog not found");
  });

  await testCase("POST /api/academic/backlogs/[id]/start-recovery processes AI plan successfully", async () => {
    simulateFetchFailure = false;
    const payload = {
      subject: "Test Course 101",
      failReason: "Missed exam",
      calendarContext: "Exams in December",
      timetableLoad: "Low",
      retryDays: 30,
    };
    const req = createMockRequest(`http://localhost:3000/api/academic/backlogs/${createdBacklogId}/start-recovery`, "POST", payload);
    const res = await startRecoveryPOST(req, { params: { id: createdBacklogId } });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.status === "REGISTERED", `Expected status REGISTERED, got ${data.status}`);
    assert(data.recoveryPathway, "No recovery pathway returned");
    const pathway = JSON.parse(data.recoveryPathway);
    assert(pathway.studyPlan === "Test daily review.", "studyPlan mismatch");
    assert(pathway.dailyHours === 3, "dailyHours mismatch");
    assert(pathway.recoveryProbability === 0.85, "recoveryProbability mismatch");
    assert(pathway.aiPlanGenerationFailed !== true, "Should not indicate failure");
  });

  await testCase("POST /api/academic/backlogs/[id]/start-recovery falls back when AI fails", async () => {
    simulateFetchFailure = true;
    const payload = {
      subject: "Test Course 101",
      failReason: "Missed exam",
      calendarContext: "Exams in December",
      timetableLoad: "Low",
      retryDays: 30,
    };
    const req = createMockRequest(`http://localhost:3000/api/academic/backlogs/${createdBacklogId}/start-recovery`, "POST", payload);
    const res = await startRecoveryPOST(req, { params: { id: createdBacklogId } });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.status === "REGISTERED", `Expected status REGISTERED, got ${data.status}`);
    assert(data.recoveryPathway, "No recovery pathway returned");
    const pathway = JSON.parse(data.recoveryPathway);
    assert(pathway.aiPlanGenerationFailed === true, "Should indicate fallback/failure");
  });

  await testCase("POST /api/academic/backlogs/[id]/mark-cleared marks record CLEARED", async () => {
    const req = createMockRequest(`http://localhost:3000/api/academic/backlogs/${createdBacklogId}/mark-cleared`, "POST");
    const res = await markClearedPOST(req, { params: { id: createdBacklogId } });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.status === "CLEARED", `Expected status CLEARED, got ${data.status}`);
  });

  await testCase("POST /api/academic/backlogs/[id]/withdraw marks record VOIDED", async () => {
    const req = createMockRequest(`http://localhost:3000/api/academic/backlogs/${createdBacklogId}/withdraw`, "POST");
    const res = await withdrawPOST(req, { params: { id: createdBacklogId } });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.status === "VOIDED", `Expected status VOIDED, got ${data.status}`);
  });

  await testCase("GET /api/academic/backlogs/summary calculates correct stats", async () => {
    const res = await backlogsSummaryGET();
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.total === 1, `Expected total 1, got ${data.total}`);
    assert(data.pending === 0, `Expected pending 0, got ${data.pending}`);
    assert(data.cleared === 0, `Expected cleared 0 (since we withdrew/VOIDED last), got ${data.cleared}`);
  });

  // ─── CLEANUP ───
  console.log("\nCleaning up test database state...");
  try {
    if (createdCalendarEventId) {
      await prisma.academicCalendarEvent.deleteMany({
        where: { id: createdCalendarEventId }
      });
    }
    await prisma.timetableSlot.deleteMany({
      where: { courseId: testCourse.id }
    });
    if (createdBacklogId) {
      await prisma.backlogRecord.deleteMany({
        where: { id: createdBacklogId }
      });
    }
    await prisma.enrollment.deleteMany({
      where: { userId: testUser.id }
    });
    await prisma.user.deleteMany({
      where: { id: testUser.id }
    });
    console.log("Cleanup finished.");
  } catch (cleanErr) {
    console.error("Cleanup failed:", cleanErr);
  }

  console.log("\n================================================================");
  console.log(`🏁 API Routes Tests Summary: ${passed} passed, ${failed} failed.`);
  console.log("================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("Unhanded rejection running tests:", err);
  process.exit(1);
});
