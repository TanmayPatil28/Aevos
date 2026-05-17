import { prisma } from '@/lib/prisma';
import type { StudentFeatureVector } from '@/core/types';

/**
 * Loads and constructs a canonical StudentFeatureVector for a given user from the database.
 * This is user-scoped and secure, drawing directly from standard Prisma-backed records.
 */
export async function getStudentFeatureVector(
  userId: string
): Promise<StudentFeatureVector | null> {
  const [profile, semesters] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { userId },
    }),
    prisma.semester.findMany({
      where: { userId },
      include: { subjects: true },
      orderBy: { number: 'asc' },
    }),
  ]);

  if (!profile) {
    return null;
  }

  // 1. Map historical SGPAs
  const completedSemesters = semesters.filter((sem) => sem.isCompleted);
  const historicalSgpas = completedSemesters.map((sem) => sem.sgpa ?? 0);

  // 2. Count active backlogs
  const backlogCount = semesters.reduce(
    (acc, sem) => acc + sem.subjects.filter((sub) => sub.isBacklog).length,
    0
  );

  // 3. Compute current CGPA
  let totalWeightedPoints = 0;
  let totalCredits = 0;
  const totalClassAbsences = 0;
  const totalClassHeld = 0;

  semesters.forEach((sem) => {
    sem.subjects.forEach((sub) => {
      if (sub.gradePoint !== null && sub.credits > 0) {
        totalWeightedPoints += sub.gradePoint * sub.credits;
        totalCredits += sub.credits;
      }
    });
  });

  const currentCgpa = totalCredits > 0 ? totalWeightedPoints / totalCredits : 0.0;

  // 4. Fetch attendance rate
  const attendanceRecords = await prisma.attendanceRecord.findMany({
    where: { userId },
  });

  let attendanceRate = 1.0;
  if (attendanceRecords.length > 0) {
    const totalAttended = attendanceRecords.reduce((sum, r) => sum + r.attended, 0);
    const totalClasses = attendanceRecords.reduce((sum, r) => sum + r.totalClasses, 0);
    attendanceRate = totalClasses > 0 ? totalAttended / totalClasses : 1.0;
  }

  // 5. Compute velocity & consistency
  let semesterVelocity = 0;
  if (historicalSgpas.length >= 2) {
    semesterVelocity =
      historicalSgpas[historicalSgpas.length - 1] - historicalSgpas[historicalSgpas.length - 2];
  }

  let consistencyScore = 100;
  if (historicalSgpas.length >= 2) {
    const mean = historicalSgpas.reduce((a, b) => a + b, 0) / historicalSgpas.length;
    const variance =
      historicalSgpas.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / historicalSgpas.length;
    const stdDev = Math.sqrt(variance);
    consistencyScore = Math.max(0, Math.min(100, Math.round(100 - stdDev * 35)));
  }

  // 6. Compute credits remaining
  const expectedTotalCredits = (profile.totalSemesters ?? 8) * 20;
  const creditsRemaining = Math.max(0, expectedTotalCredits - totalCredits);

  return {
    currentCgpa: Number(currentCgpa.toFixed(2)),
    creditsCompleted: totalCredits,
    creditsRemaining,
    semestersCompleted: completedSemesters.length,
    backlogCount,
    historicalSgpas,
    attendanceRate,
    semesterVelocity,
    consistencyScore,
  };
}
