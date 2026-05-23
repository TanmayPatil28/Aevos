import { getPresetById } from "../presets/presetRegistry";
import { AcademicImportPayload, ImportValidationResult } from "./types";

interface RawCourseInput {
  code?: unknown;
  name?: unknown;
  credits?: unknown;
  grade?: unknown;
  cieMarks?: unknown;
  attendanceTotal?: unknown;
  attendanceBunked?: unknown;
}

interface RawSemesterInput {
  semester?: unknown;
  sgpa?: unknown;
  credits?: unknown;
  earnedCredits?: unknown;
  courses?: unknown;
}

interface RawPayloadInput {
  presetId?: unknown;
  currentCgpa?: unknown;
  targetCgpa?: unknown;
  activeBacklogsCount?: unknown;
  semesterHistory?: unknown;
  currentSemesterCourses?: unknown;
}

/**
 * Validates a raw JSON payload for academic data ingestion.
 * Ensures the structure is correct, preset exists, grades are valid for that preset,
 * and credits/marks values are within reasonable academic bounds.
 */
export function validateImportPayload(rawData: unknown): ImportValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Structure Verification
  if (!rawData || typeof rawData !== "object" || Array.isArray(rawData)) {
    return {
      isValid: false,
      errors: ["Invalid JSON format: Payload must be a single JSON object."],
      warnings: [],
    };
  }

  const data = rawData as RawPayloadInput;

  // 2. Identity / Preset ID Validation
  if (typeof data.presetId !== "string" || !data.presetId.trim()) {
    errors.push("Missing or invalid field: 'presetId' is required and must be a non-empty string.");
  }

  const presetId = typeof data.presetId === "string" ? data.presetId.trim() : "";
  const preset = presetId ? getPresetById(presetId) : undefined;
  
  if (presetId && !preset) {
    errors.push(`Invalid presetId: '${presetId}' does not exist in the preset registry.`);
  }

  // Determine scale limit (default to 10.0 if preset not found)
  const maxPoints = preset 
    ? Math.max(...preset.gradeScale.map(g => g.points)) 
    : 10.0;

  const validGrades = preset
    ? new Set(preset.gradeScale.map(g => g.grade.toUpperCase()))
    : new Set<string>();

  // 3. Core Academic Fields Validation
  if (typeof data.currentCgpa !== "number") {
    errors.push("Missing or invalid field: 'currentCgpa' is required and must be a number.");
  } else if (data.currentCgpa < 0 || data.currentCgpa > maxPoints) {
    errors.push(`Value error: 'currentCgpa' must be between 0 and ${maxPoints} for preset '${presetId}'.`);
  }

  if (typeof data.targetCgpa !== "number") {
    errors.push("Missing or invalid field: 'targetCgpa' is required and must be a number.");
  } else if (data.targetCgpa < 0 || data.targetCgpa > maxPoints) {
    errors.push(`Value error: 'targetCgpa' must be between 0 and ${maxPoints} for preset '${presetId}'.`);
  }

  if (typeof data.activeBacklogsCount !== "number") {
    errors.push("Missing or invalid field: 'activeBacklogsCount' is required and must be a number.");
  } else if (data.activeBacklogsCount < 0 || !Number.isInteger(data.activeBacklogsCount)) {
    errors.push("Value error: 'activeBacklogsCount' must be a non-negative integer.");
  }

  // 4. Semester History Validation
  if (!Array.isArray(data.semesterHistory)) {
    errors.push("Missing or invalid field: 'semesterHistory' is required and must be an array.");
  } else {
    // Check for gaps, sequence, duplicates
    const semNums = data.semesterHistory
      .map((s) => (s as RawSemesterInput)?.semester)
      .filter((s): s is number => typeof s === "number" && Number.isInteger(s) && s > 0);

    const uniqueSemNums = Array.from(new Set(semNums)).sort((a, b) => a - b);
    
    if (semNums.length !== uniqueSemNums.length) {
      errors.push("Semester History Error: Duplicate semesters are detected in your academic history.");
    }

    for (let i = 0; i < uniqueSemNums.length; i++) {
      if (uniqueSemNums[i] !== i + 1) {
        errors.push(`Semester History Gap: Semesters must start at 1 and progress sequentially. Missing Semester ${i + 1}, found Semester ${uniqueSemNums[i]} instead.`);
        break;
      }
    }

    data.semesterHistory.forEach((semRaw: unknown, idx: number) => {
      if (!semRaw || typeof semRaw !== "object" || Array.isArray(semRaw)) {
        errors.push(`semesterHistory[${idx}]: Invalid entry, must be an object.`);
        return;
      }

      const sem = semRaw as RawSemesterInput;
      const semPrefix = `semesterHistory[${idx}] (Semester ${typeof sem.semester === "number" ? sem.semester : idx + 1})`;

      if (typeof sem.semester !== "number" || sem.semester <= 0 || !Number.isInteger(sem.semester)) {
        errors.push(`${semPrefix}: 'semester' must be a positive integer.`);
      }

      if (typeof sem.sgpa !== "number") {
        errors.push(`${semPrefix}: 'sgpa' must be a number.`);
      } else if (sem.sgpa < 0 || sem.sgpa > maxPoints) {
        errors.push(`${semPrefix}: 'sgpa' must be between 0 and ${maxPoints}.`);
      }

      if (typeof sem.credits !== "number" || sem.credits <= 0) {
        errors.push(`${semPrefix}: 'credits' must be a positive number.`);
      }

      if (typeof sem.earnedCredits !== "number" || sem.earnedCredits < 0) {
        errors.push(`${semPrefix}: 'earnedCredits' must be a non-negative number.`);
      } else if (typeof sem.earnedCredits === "number" && typeof sem.credits === "number" && sem.earnedCredits > sem.credits) {
        errors.push(`${semPrefix}: 'earnedCredits' (${sem.earnedCredits}) cannot exceed registered 'credits' (${sem.credits}).`);
      }

      // Check courses under semester history (optional)
      if (sem.courses !== undefined) {
        if (!Array.isArray(sem.courses)) {
          errors.push(`${semPrefix}: 'courses' must be an array.`);
        } else {
          const courseCodes = new Set<string>();
          let computedRegisteredCredits = 0;

          sem.courses.forEach((courseRaw: unknown, cIdx: number) => {
            const coursePrefix = `${semPrefix}.courses[${cIdx}]`;
            
            if (!courseRaw || typeof courseRaw !== "object" || Array.isArray(courseRaw)) {
              errors.push(`${coursePrefix}: course must be an object.`);
              return;
            }

            const course = courseRaw as RawCourseInput;

            if (typeof course.code !== "string" || !course.code.trim()) {
              errors.push(`${coursePrefix}: 'code' is required and must be a non-empty string.`);
            } else {
              const normalizedCode = course.code.trim().toUpperCase();
              if (courseCodes.has(normalizedCode)) {
                errors.push(`${semPrefix}: Duplicate Course Code '${normalizedCode}' detected in semester ${sem.semester}. Course codes must be unique.`);
              }
              courseCodes.add(normalizedCode);
            }

            if (typeof course.name !== "string" || !course.name.trim()) {
              errors.push(`${coursePrefix}: 'name' is required and must be a non-empty string.`);
            }

            if (typeof course.credits !== "number" || course.credits <= 0) {
              errors.push(`${coursePrefix}: 'credits' must be a positive number.`);
            } else {
              computedRegisteredCredits += course.credits;
            }

            if (typeof course.grade !== "string" || !course.grade.trim()) {
              errors.push(`${coursePrefix}: 'grade' is required and must be a string.`);
            } else if (preset) {
              const cleanedGrade = course.grade.trim().toUpperCase();
              if (!validGrades.has(cleanedGrade)) {
                errors.push(`${coursePrefix}: grade '${course.grade}' is not valid under preset '${presetId}' grade scale (${Array.from(validGrades).join(", ")}).`);
              }
            }
          });

          // Verify registered credit sum matches
          if (typeof sem.credits === "number" && sem.courses.length > 0 && sem.credits !== computedRegisteredCredits) {
            errors.push(`${semPrefix} Credit Mismatch: Total registered credits (${sem.credits}) does not match the sum of course credits (${computedRegisteredCredits}).`);
          }
        }
      }
    });
  }

  // 5. Current Semester Courses Validation (optional)
  if (data.currentSemesterCourses !== undefined) {
    if (!Array.isArray(data.currentSemesterCourses)) {
      errors.push("Invalid field: 'currentSemesterCourses' must be an array.");
    } else {
      data.currentSemesterCourses.forEach((courseRaw: unknown, idx: number) => {
        if (!courseRaw || typeof courseRaw !== "object" || Array.isArray(courseRaw)) {
          errors.push(`currentSemesterCourses[${idx}]: course must be an object.`);
          return;
        }

        const course = courseRaw as RawCourseInput;
        const coursePrefix = `currentSemesterCourses[${idx}] (Course ${typeof course.code === "string" ? course.code : idx + 1})`;

        if (typeof course.code !== "string" || !course.code.trim()) {
          errors.push(`${coursePrefix}: 'code' is required and must be a non-empty string.`);
        }

        if (typeof course.name !== "string" || !course.name.trim()) {
          errors.push(`${coursePrefix}: 'name' is required and must be a non-empty string.`);
        }

        if (typeof course.credits !== "number" || course.credits <= 0) {
          errors.push(`${coursePrefix}: 'credits' must be a positive number.`);
        }

        if (course.grade !== undefined) {
          if (typeof course.grade !== "string" || !course.grade.trim()) {
            errors.push(`${coursePrefix}: 'grade' must be a string if provided.`);
          } else if (preset) {
            const cleanedGrade = course.grade.trim().toUpperCase();
            if (!validGrades.has(cleanedGrade)) {
              errors.push(`${coursePrefix}: grade '${course.grade}' is not valid under preset '${presetId}' grade scale.`);
            }
          }
        }

        if (course.cieMarks !== undefined) {
          if (typeof course.cieMarks !== "number" || course.cieMarks < 0 || course.cieMarks > 100) {
            errors.push(`${coursePrefix}: 'cieMarks' must be a number between 0 and 100.`);
          }
        }

        if (course.attendanceTotal !== undefined) {
          if (typeof course.attendanceTotal !== "number" || course.attendanceTotal < 0) {
            errors.push(`${coursePrefix}: 'attendanceTotal' must be a non-negative number.`);
          }

          if (course.attendanceBunked !== undefined) {
            if (typeof course.attendanceBunked !== "number" || course.attendanceBunked < 0) {
              errors.push(`${coursePrefix}: 'attendanceBunked' must be a non-negative number.`);
            } else if (typeof course.attendanceTotal === "number" && course.attendanceBunked > course.attendanceTotal) {
              errors.push(`${coursePrefix}: 'attendanceBunked' (${course.attendanceBunked}) cannot exceed 'attendanceTotal' (${course.attendanceTotal}).`);
            }
          }
        } else if (course.attendanceBunked !== undefined) {
          errors.push(`${coursePrefix}: 'attendanceBunked' was provided but 'attendanceTotal' is missing.`);
        }
      });
    }
  }

  // 5.5 Impossible CGPA Jump Validation
  if (errors.length === 0 && Array.isArray(data.semesterHistory) && data.semesterHistory.length > 0) {
    let totalWeightedPoints = 0;
    let totalRegisteredCredits = 0;
    let hasValidHistory = true;

    data.semesterHistory.forEach((semRaw: unknown) => {
      const sem = semRaw as RawSemesterInput;
      if (sem && typeof sem.sgpa === "number" && typeof sem.credits === "number") {
        totalWeightedPoints += sem.sgpa * sem.credits;
        totalRegisteredCredits += sem.credits;
      } else {
        hasValidHistory = false;
      }
    });

    if (hasValidHistory && totalRegisteredCredits > 0) {
      const calculatedCgpa = parseFloat((totalWeightedPoints / totalRegisteredCredits).toFixed(4));
      const reportedCgpa = data.currentCgpa as number;
      const cgpaDelta = Math.abs(calculatedCgpa - reportedCgpa);

      if (cgpaDelta > 0.15) {
        errors.push(`Impossible CGPA Jump: The reported CGPA of ${reportedCgpa} is mathematically inconsistent with the completed semester SGPAs. Calculated CGPA based on credits is ${calculatedCgpa.toFixed(2)} (discrepancy of ${cgpaDelta.toFixed(2)} exceeds strict limit of 0.15).`);
      } else if (cgpaDelta > 0.05) {
        warnings.push(`CGPA Precision Discrepancy: The reported CGPA of ${reportedCgpa} slightly deviates from the calculated cumulative SGPA value of ${calculatedCgpa.toFixed(2)} (discrepancy of ${cgpaDelta.toFixed(3)}).`);
      }
    }
  }

  // 6. Warnings Generation
  if (errors.length === 0) {
    const currentCgpa = data.currentCgpa as number;
    const targetCgpa = data.targetCgpa as number;
    const activeBacklogsCount = data.activeBacklogsCount as number;

    if (targetCgpa < currentCgpa) {
      warnings.push(`Target CGPA (${targetCgpa}) is set lower than current CGPA (${currentCgpa}).`);
    }

    if (Array.isArray(data.semesterHistory)) {
      if (data.semesterHistory.length === 0) {
        warnings.push("No semester history entries provided. CGPA projections will have no historical baseline.");
      } else {
        data.semesterHistory.forEach((semRaw: unknown) => {
          const sem = semRaw as RawSemesterInput;
          if (sem && typeof sem === "object") {
            const semNum = sem.semester as number;
            const semCredits = sem.credits as number;
            const semEarned = sem.earnedCredits as number;
            const semCourses = sem.courses as unknown[];

            if (semEarned < semCredits && activeBacklogsCount === 0) {
              warnings.push(`Semester ${semNum} has unearned credits (${semCredits - semEarned} credits missing), but activeBacklogsCount is 0.`);
            }
            if (!semCourses || semCourses.length === 0) {
              warnings.push(`Semester ${semNum} has no individual courses detailed. Only aggregate calculations will be used.`);
            }
          }
        });
      }
    }

    if (!data.currentSemesterCourses || (data.currentSemesterCourses as unknown[]).length === 0) {
      warnings.push("No current semester courses provided. The active course tracker will be empty after import.");
    } else if (Array.isArray(data.currentSemesterCourses)) {
      data.currentSemesterCourses.forEach((courseRaw: unknown) => {
        const course = courseRaw as RawCourseInput;
        if (course && typeof course === "object") {
          const hasTotal = typeof course.attendanceTotal === "number" && course.attendanceTotal > 0;
          if (!hasTotal) {
            warnings.push(`Attendance tracking data is missing or empty for course ${String(course.code) || "unknown"}. Defaulting to 100% attendance.`);
          }
        }
      });
    }
  }

  // 7. Assemble Parsed Data (Normalized)
  let parsedData: AcademicImportPayload | undefined = undefined;
  if (errors.length === 0) {
    const semHistory = data.semesterHistory as RawSemesterInput[];
    const currentCourses = data.currentSemesterCourses as RawCourseInput[];

    parsedData = {
      presetId: presetId!,
      currentCgpa: data.currentCgpa as number,
      targetCgpa: data.targetCgpa as number,
      activeBacklogsCount: data.activeBacklogsCount as number,
      semesterHistory: semHistory.map((sem) => {
        const semCourses = sem.courses as RawCourseInput[];
        return {
          semester: sem.semester as number,
          sgpa: sem.sgpa as number,
          credits: sem.credits as number,
          earnedCredits: sem.earnedCredits as number,
          courses: semCourses?.map((c) => ({
            code: (c.code as string).trim().toUpperCase(),
            name: (c.name as string).trim(),
            credits: c.credits as number,
            grade: (c.grade as string).trim().toUpperCase(),
          })),
        };
      }),
      currentSemesterCourses: currentCourses?.map((c) => ({
        code: (c.code as string).trim().toUpperCase(),
        name: (c.name as string).trim(),
        credits: c.credits as number,
        grade: typeof c.grade === "string" ? c.grade.trim().toUpperCase() : undefined,
        cieMarks: typeof c.cieMarks === "number" ? c.cieMarks : 0,
        attendanceTotal: typeof c.attendanceTotal === "number" ? c.attendanceTotal : 0,
        attendanceBunked: typeof c.attendanceBunked === "number" ? c.attendanceBunked : 0,
      })),
    };
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    parsedData,
  };
}
