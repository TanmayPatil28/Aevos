import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const calculations = await prisma.calculation.findMany({
      where: { userId },
      orderBy: { created_at: 'desc' },
    });
    return NextResponse.json(calculations);
  } catch (error) {
    console.error('Failed to fetch calculations:', error);
    return NextResponse.json({ error: 'Failed to fetch calculations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { semesterNumber, semesterName, subjects, sgpa, cgpa, total_credits } = body;

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Atomic transaction to update both legacy Calculation and new Relational Models
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the historical snapshot
      const calculation = await tx.calculation.create({
        data: {
          semester: semesterName || `Semester ${semesterNumber}`,
          subjects: subjects as any,
          sgpa: Number(sgpa),
          cgpa: Number(cgpa) || 0,
          total_credits: Number(total_credits),
          userId,
        },
      });

      // 2. Upsert the live Semester model
      const semester = await tx.semester.upsert({
        where: {
          userId_number: {
            userId,
            number: Number(semesterNumber),
          },
        },
        update: {
          sgpa: Number(sgpa),
          isCompleted: true,
        },
        create: {
          userId,
          number: Number(semesterNumber),
          name: semesterName || `Semester ${semesterNumber}`,
          sgpa: Number(sgpa),
          isCompleted: true,
        },
      });

      // 3. Sync Subjects
      // First, delete old subjects for this semester to ensure a clean sync
      await tx.subject.deleteMany({
        where: { semesterId: semester.id },
      });

      // Then create new ones
      await tx.subject.createMany({
        data: subjects.map((sub: any) => ({
          semesterId: semester.id,
          name: sub.name,
          credits: Number(sub.credits),
          gradePoint: Number(sub.score), // In our system, score is the grade point entered or calculated
          isBacklog: Number(sub.score) === 0,
        })),
      });

      return calculation;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Failed to save calculation:', error);
    return NextResponse.json({ error: 'Failed to save calculation' }, { status: 500 });
  }
}
