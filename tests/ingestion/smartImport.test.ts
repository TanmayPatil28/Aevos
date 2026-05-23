import { documentParserRegistry } from "../../lib/ingestion/parser/registry";
import { validateImportPayload } from "../../lib/ingestion/importValidator";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  ✅ ${name}`);
  } catch (err: any) {
    failed++;
    console.log(`  ❌ ${name}: ${err.message}`);
    console.error(err);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

export function runSmartImportTests(): boolean {
  passed = 0;
  failed = 0;
  console.log("\n📄 Smart Academic Import Engine Verification Suite");

  // 1. Parser Registration & Supports tests
  test("DocumentParserRegistry - contains SPPU, VTU, JNTUH, and JSPM parsers", () => {
    assert(documentParserRegistry.getParser("sppu") !== undefined, "Should have SPPU parser");
    assert(documentParserRegistry.getParser("vtu") !== undefined, "Should have VTU parser");
    assert(documentParserRegistry.getParser("jntuh") !== undefined, "Should have JNTUH parser");
    assert(documentParserRegistry.getParser("jspm") !== undefined, "Should have RSCOE JSPM parser");
    assert(documentParserRegistry.getParser("jspm_university_wagholi") !== undefined, "Should have Wagholi JSPM parser");
  });

  // 2. SPPU Parser Execution & Confidence score tests
  test("SPPU Parser - parses raw marksheet text successfully with high confidence", () => {
    const rawSppuText = `
      SAVITRIBAI PHULE PUNE UNIVERSITY
      CURRENT CGPA: 8.24
      TARGET CGPA: 8.75
      ACTIVE BACKLOGS: 0
      
      SEMESTER 1
      CS-101 Programming & Problem Solving 4 A
      MA-101 Linear Algebra & Calculus 4 B+
      EE-101 Basic Electrical Eng 4 A
      SGPA: 8.10
      CREDITS: 12
      
      SEMESTER 2
      CS-102 Data Structures & Algorithms 4 O
      MA-102 Differential Equations 4 A
      SGPA: 8.38
      CREDITS: 8
    `;

    const parsed = documentParserRegistry.parseDocument(rawSppuText, "sppu");
    assert(parsed.presetId.value === "sppu", "Preset ID should be sppu");
    assert(parsed.currentCgpa.value === 8.24, "Should parse current CGPA 8.24");
    assert(parsed.currentCgpa.confidence >= 95, "Should have high confidence on CGPA");
    assert(parsed.targetCgpa.value === 8.75, "Should parse target CGPA 8.75");
    assert(parsed.activeBacklogsCount.value === 0, "Should parse backlogs 0");
    assert(parsed.semesterHistory.length === 2, "Should parse 2 semesters");
    
    const sem1 = parsed.semesterHistory[0];
    assert(sem1.semester.value === 1, "Should identify Semester 1");
    assert(sem1.sgpa.value === 8.10, "Should parse SGPA 8.10");
    assert(sem1.credits.value === 12, "Should parse credits 12");
    assert(sem1.courses?.length === 3, "Should parse 3 courses");
    assert(sem1.courses?.[0].code.value === "CS-101", "Should parse CS-101");
  });

  // 3. VTU Parser Execution
  test("VTU Parser - parses VTU grade card successfully", () => {
    const rawVtuText = `
      VISVESVARAYA TECHNOLOGICAL UNIVERSITY
      CGPA: 7.90
      TARGET CGPA: 8.40
      BACKLOGS: 0
      
      SEMESTER 1
      MATH11 Advanced Mathematics I 4 A
      PHYS12 Engineering Physics 4 A+
      CIV14 Environmental Studies 1 PP
      SGPA: 7.90
      CREDITS: 9
    `;

    const parsed = documentParserRegistry.parseDocument(rawVtuText, "vtu");
    assert(parsed.presetId.value === "vtu", "Preset ID should be vtu");
    assert(parsed.currentCgpa.value === 7.90, "Should parse current CGPA 7.90");
    assert(parsed.semesterHistory.length === 1, "Should parse 1 semester");
    assert(parsed.semesterHistory[0].courses?.length === 3, "Should parse 3 courses");
  });

  // 4. JNTUH Parser Execution
  test("JNTUH Parser - parses JNTUH transcript logs", () => {
    const rawJntuhText = `
      JAWAHARLAL NEHRU TECHNOLOGICAL UNIVERSITY HYDERABAD
      CGPA: 8.10
      TARGET CGPA: 8.60
      BACKLOGS: 0
      
      SEMESTER 1
      MA101BS Matrices and Calculus 4 A
      CH102BS Engineering Chemistry 4 A+
      CS103ES Programming for Problem Solving 3 B
      SGPA: 8.10
      CREDITS: 11
    `;

    const parsed = documentParserRegistry.parseDocument(rawJntuhText, "jntuh");
    assert(parsed.presetId.value === "jntuh", "Preset ID should be jntuh");
    assert(parsed.semesterHistory[0].courses?.length === 3, "Should parse 3 courses");
  });

  // 4b. JSPM Parser Execution (JSON and Text formats)
  test("JSPM Parser - parses real Digicampus JSON and executes retroactive backlog grade point replacements", () => {
    const rawJson = `[
      {
        "studentProfile": {
          "fullName": "PATIL TANMAY ANIL",
          "registrationId": "22458020124",
          "contactDetails": {
            "email": "tanmaypatil24.ai@jspmuni.edu.in"
          }
        }
      },
      {
        "institution": "JSPMUNI",
        "academicTerm": {
          "term": "Odd Term",
          "academicYear": "2024-25"
        },
        "performance": {
          "status": "Result Declared",
          "majorSGPA": 7.48
        },
        "courses": [
          { "courseName": "Engineering Mechanics", "courseCode": "231GCEB01", "enrollmentType": "Regular", "credits": 2.0, "grade": "B+", "gradePoint": 7 },
          { "courseName": "Applied Chemistry", "courseCode": "230GCHB01", "enrollmentType": "Regular", "credits": 3.0, "grade": "B+", "gradePoint": 7 },
          { "courseName": "Applied Chemistry Lab", "courseCode": "230GCHB02", "enrollmentType": "Regular", "credits": 1.0, "grade": "B+", "gradePoint": 7 },
          { "courseName": "Semiconductor Physics", "courseCode": "231GPHB03", "enrollmentType": "Regular", "credits": 2.0, "grade": "B+", "gradePoint": 7 },
          { "courseName": "Semiconductor Physics Lab", "courseCode": "230GPHB04", "enrollmentType": "Regular", "credits": 1.0, "grade": "A+", "gradePoint": 9 },
          { "courseName": "Linear Algebra Sequences And Series", "courseCode": "231GMAB03", "enrollmentType": "Regular", "credits": 3.0, "grade": "B+", "gradePoint": 7 },
          { "courseName": "Effective Communication Skills", "courseCode": "230UENB01", "enrollmentType": "Regular", "credits": 2.0, "grade": "A", "gradePoint": 8 },
          { "courseName": "Yoga And Fitness", "courseCode": "231UPYB01", "enrollmentType": "Regular", "credits": 1.5, "grade": "B", "gradePoint": 6 },
          { "courseName": "Computational Thinking And Problem Solving", "courseCode": "240GCSB61", "enrollmentType": "Regular", "credits": 2.5, "grade": "F", "gradePoint": 0 },
          { "courseName": "Fundamentals Of Python Programming", "courseCode": "240GCSB62", "enrollmentType": "Regular", "credits": 3.0, "grade": "B+", "gradePoint": 7 }
        ]
      },
      {
        "institution": "JSPMUNI",
        "academicTerm": {
          "term": "Summer Term",
          "academicYear": "2024-25"
        },
        "performance": {
          "status": "Grades Published",
          "majorSGPA": null
        },
        "courses": [
          { "courseName": "Computational Thinking And Problem Solving", "courseCode": "240GCSB61", "enrollmentType": "Backlog", "credits": 2.5, "grade": "O", "gradePoint": 10 }
        ]
      }
    ]`;

    const parsed = documentParserRegistry.parseDocument(rawJson, "jspm_university_wagholi");
    assert(parsed.presetId.value === "jspm_university_wagholi", "Preset ID should be jspm_university_wagholi");
    assert(parsed.semesterHistory.length === 1, "Should have 1 regular semester");
    const sem1 = parsed.semesterHistory[0];
    assert(sem1.semester.value === 1, "Should map Odd Term 2024-25 to Semester 1");
    
    // Check if retroactive grade point replacement successfully happened
    const mechanics = sem1.courses?.find(c => c.code.value === "231GCEB01");
    const compThinking = sem1.courses?.find(c => c.code.value === "240GCSB61");
    assert(mechanics !== undefined, "Engineering Mechanics should exist");
    assert(compThinking !== undefined, "Computational Thinking should exist");
    assert(compThinking?.grade.value === "O", "F grade should be retroactively replaced with passed grade O");
    
    // Check SGPA: 157 total weighted grade points / 21 total credits = 7.476 (rounded to 7.48)
    assert(sem1.sgpa.value === 7.48, `Expected calculated SGPA to be exactly 7.48, got ${sem1.sgpa.value}`);
    assert(sem1.earnedCredits.value === 21, `Expected earned credits to be exactly 21, got ${sem1.earnedCredits.value}`);
  });

  test("JSPM Parser - parses copy-pasted plain text transcript correctly and identifies active semester courses", () => {
    const rawText = `
      Student Name: PATIL TANMAY ANIL
      Registration ID: 22458020124
      Email: tanmaypatil24.ai@jspmuni.edu.in
      
      Semester 1
      231GCEB01 Engineering Mechanics 2.0 B+ 7 Regular
      230GCHB01 Applied Chemistry 3.0 B+ 7 Regular
      240GCSB61 Computational Thinking And Problem Solving 2.5 F 0 Regular
      SGPA: 6.20
      
      Semester 2
      231GETB01 Electronics And Computer Workshop 1.0 B+ 7 Regular
      231GEEB01 Foundations Of Electrical And Electronics Engineering 2.0 B+ 7 Regular
      SGPA: 7.00
      
      Semester 3
      231GCEB02 Environment And Sustainability 2.0 B+ 7 Regular
      230GETB36 Microcontrollers And Applications 2.0 A 8 Regular
      SGPA: 7.50

      Semester 4
      250GBTB01 Bioengineering 2.0 Regular
      230GETB41 Introduction To Embedded System 2.0 Regular
      230GCSB51 Computer Algorithms 3.0 Regular
    `;

    const parsed = documentParserRegistry.parseDocument(rawText, "jspm_university_wagholi");
    assert(parsed.presetId.value === "jspm_university_wagholi", "Preset ID should be jspm_university_wagholi");
    assert(parsed.semesterHistory.length === 3, "Should parse 3 completed semesters");
    
    // Check semester history mapping
    assert(parsed.semesterHistory[0].semester.value === 1, "Semester 1");
    assert(parsed.semesterHistory[0].courses?.length === 3, "Sem 1 has 3 courses");
    assert(parsed.semesterHistory[1].semester.value === 2, "Semester 2");
    assert(parsed.semesterHistory[2].semester.value === 3, "Semester 3");

    // Check active semester courses mapped (Semester 4 has no grades, status is Not Published)
    assert(parsed.currentSemesterCourses !== undefined, "Should have active semester courses");
    assert(parsed.currentSemesterCourses?.length === 3, "Should have 3 courses in active semester");
    assert(parsed.currentSemesterCourses?.[0].code.value === "250GBTB01", "Should parse bioengineering code");
    assert(parsed.currentSemesterCourses?.[0].credits.value === 2.0, "Should parse bioengineering credits");
    assert(parsed.currentSemesterCourses?.[0].grade === undefined, "Should have no grade for active course");
  });

  // 5. Strict Auditing - Impossible CGPA Jump Validation
  test("Audit Engine - blocks mathematically impossible CGPA jumps", () => {
    const impossiblePayload = {
      presetId: "sppu",
      currentCgpa: 9.50, // Mathematically inconsistent with SGPAs (expected 8.2)
      targetCgpa: 9.80,
      activeBacklogsCount: 0,
      semesterHistory: [
        { semester: 1, sgpa: 8.0, credits: 20, earnedCredits: 20, courses: [] },
        { semester: 2, sgpa: 8.4, credits: 20, earnedCredits: 20, courses: [] }
      ]
    };

    const result = validateImportPayload(impossiblePayload);
    assert(result.isValid === false, "Validation should fail");
    assert(result.errors.some(e => e.includes("Impossible CGPA Jump")), "Should contain impossible CGPA jump error");
  });

  // 6. Strict Auditing - Semester History Gaps
  test("Audit Engine - blocks semester gaps (missing semesters)", () => {
    const gapPayload = {
      presetId: "sppu",
      currentCgpa: 8.20,
      targetCgpa: 8.50,
      activeBacklogsCount: 0,
      semesterHistory: [
        { semester: 1, sgpa: 8.0, credits: 20, earnedCredits: 20, courses: [] },
        { semester: 3, sgpa: 8.4, credits: 20, earnedCredits: 20, courses: [] } // Gap: Semester 2 missing
      ]
    };

    const result = validateImportPayload(gapPayload);
    assert(result.isValid === false, "Validation should fail due to gap");
    assert(result.errors.some(e => e.includes("Semester History Gap")), "Should contain semester history gap error");
  });

  // 7. Strict Auditing - Duplicate Courses
  test("Audit Engine - blocks duplicate courses in the same semester", () => {
    const dupCoursesPayload = {
      presetId: "sppu",
      currentCgpa: 8.00,
      targetCgpa: 8.50,
      activeBacklogsCount: 0,
      semesterHistory: [
        {
          semester: 1,
          sgpa: 8.0,
          credits: 8,
          earnedCredits: 8,
          courses: [
            { code: "CS101", name: "Programming in C", credits: 4, grade: "A+" },
            { code: "CS101", name: "Duplicated Course Code", credits: 4, grade: "A+" } // Duplicate CS101
          ]
        }
      ]
    };

    const result = validateImportPayload(dupCoursesPayload);
    assert(result.isValid === false, "Validation should fail due to duplicates");
    assert(result.errors.some(e => e.includes("Duplicate Course Code")), "Should contain duplicate course code error");
  });

  // 8. Strict Auditing - Credit consistency
  test("Audit Engine - blocks credit aggregate mismatches", () => {
    const creditMismatchPayload = {
      presetId: "sppu",
      currentCgpa: 8.00,
      targetCgpa: 8.50,
      activeBacklogsCount: 0,
      semesterHistory: [
        {
          semester: 1,
          sgpa: 8.0,
          credits: 20, // declared is 20
          earnedCredits: 20,
          courses: [
            { code: "CS101", name: "Programming in C", credits: 4, grade: "A+" } // but sum is only 4
          ]
        }
      ]
    };

    const result = validateImportPayload(creditMismatchPayload);
    assert(result.isValid === false, "Validation should fail due to credit mismatch");
    assert(result.errors.some(e => e.includes("Credit Mismatch")), "Should contain credit mismatch error");
  });

  console.log(`\n🏁 Smart Ingestion tests completed: ${passed} passed, ${failed} failed.`);
  return failed === 0;
}
