import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PlacementReadinessEngine, Company } from '@/lib/placement/readiness-engine';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Load data from DB
    const [companies, profile, semesters, placementGoal] = await Promise.all([
      prisma.company.findMany({ orderBy: { minCgpa: 'desc' } }),
      prisma.userProfile.findUnique({ where: { userId: session.user.id } }),
      prisma.semester.findMany({
        where: { userId: session.user.id },
        include: { subjects: true },
        orderBy: { number: 'asc' },
      }),
      prisma.placementGoal.findUnique({
        where: { userId: session.user.id },
        include: { dreamCompany: true },
      }),
    ]);

    // 2. Map semesters to the format expected by simulator
    const mappedSemesters = semesters.map((sem: any) => ({
      id: sem.id,
      semesterNumber: sem.number,
      name: sem.name ?? `Semester ${sem.number}`,
      sgpa: sem.sgpa ?? 0,
      totalCredits: sem.totalCredits,
      isCompleted: sem.isCompleted,
      subjects: sem.subjects.map((sub: any) => ({
        id: sub.id,
        name: sub.name,
        credits: sub.credits,
        gradePoint: sub.gradePoint,
        percentage: sub.percentage,
        grade: sub.grade,
        isBacklog: sub.isBacklog,
        subjectType: sub.subjectType,
      })),
    }));

    // 3. Count active backlogs
    const activeBacklogs = semesters.reduce(
      (acc: number, sem: any) => acc + sem.subjects.filter((sub: any) => sub.isBacklog).length,
      0
    );

    // 4. Compute Current CGPA
    let totalWeightedGradePoints = 0;
    let totalCredits = 0;
    mappedSemesters.forEach((sem: any) => {
      sem.subjects.forEach((sub: any) => {
        if (sub.gradePoint !== null && sub.credits > 0) {
          totalWeightedGradePoints += sub.gradePoint * sub.credits;
          totalCredits += sub.credits;
        }
      });
    });
    const currentCgpa =
      totalCredits > 0 ? Number((totalWeightedGradePoints / totalCredits).toFixed(2)) : 0;

    // 5. Initialize Engine
    const engine = new PlacementReadinessEngine({
      currentCgpa,
      semesters: mappedSemesters,
      activeBacklogs,
    });

    // 6. Compute Readiness
    const mappedCompanies: Company[] = companies.map((c: any) => ({
      id: c.id,
      name: c.name,
      category: c.category,
      minCgpa: c.minCgpa,
      avgPackage: c.avgPackage,
      sector: c.sector,
      logoUrl: c.logoUrl,
      allowedBranches: c.allowedBranches,
      backlogTolerance: c.backlogTolerance,
    }));

    const companyReadiness = mappedCompanies.map((c) => engine.computeCompanyReadiness(c));
    const sectorReadiness = engine.computeCategoryReadiness(mappedCompanies);

    // 7. Overall Metrics
    const eligibleCount = companyReadiness.filter((r) => r.status === 'eligible').length;
    const overallScore = Math.round(
      companyReadiness.reduce((acc: number, r: any) => acc + r.readinessScore, 0) /
        companyReadiness.length
    );

    const trajectoryConfidence = engine.computeCompanyReadiness(
      mappedCompanies[0]
    ).trajectoryConfidence; // Heuristic based on top company

    const nextTarget = companyReadiness
      .filter((r) => r.status !== 'eligible')
      .sort((a, b) => a.cgpaGap - b.cgpaGap)[0];

    return NextResponse.json({
      overallScore,
      status: overallScore >= 80 ? 'eligible' : overallScore >= 50 ? 'near-threshold' : 'at-risk',
      trajectoryConfidence,
      companyReadiness,
      sectorReadiness,
      eligibleCount,
      totalCompanies: mappedCompanies.length,
      nextTarget: nextTarget
        ? {
            companyId: nextTarget.company.id,
            companyName: nextTarget.company.name,
            cgpaGap: nextTarget.cgpaGap,
          }
        : null,
      placementGoal,
    });
  } catch (error) {
    console.error('[PLACEMENT_GET_ERROR]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
