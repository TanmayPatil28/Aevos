import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const {
      universityId,
      branch,
      admissionYear,
      targetCgpa,
      semesters, // Array of { number, sgpa, totalCredits }
      dreamCompanies, // Array of company objects
    } = body;

    // We use a transaction to ensure all onboarding data is saved atomically
    await prisma.$transaction(async (tx: any) => {
      // 1. Create or update UserProfile
      await tx.userProfile.upsert({
        where: { userId },
        update: {
          universityId,
          branch,
          admissionYear: admissionYear ? parseInt(admissionYear) : null,
          targetCgpa: targetCgpa ? parseFloat(targetCgpa) : null,
          onboardingDone: true,
        },
        create: {
          userId,
          universityId,
          branch,
          admissionYear: admissionYear ? parseInt(admissionYear) : null,
          targetCgpa: targetCgpa ? parseFloat(targetCgpa) : null,
          onboardingDone: true,
        },
      });

      // 2. Save historical semesters if provided
      if (semesters && Array.isArray(semesters) && semesters.length > 0) {
        for (const sem of semesters) {
          if (sem.sgpa !== null) {
            await tx.semester.upsert({
              where: {
                userId_number: {
                  userId,
                  number: sem.number,
                },
              },
              update: {
                sgpa: parseFloat(sem.sgpa),
                totalCredits: parseInt(sem.totalCredits) || 0,
                isCompleted: true,
              },
              create: {
                userId,
                number: sem.number,
                name: `Semester ${sem.number}`,
                sgpa: parseFloat(sem.sgpa),
                totalCredits: parseInt(sem.totalCredits) || 0,
                isCompleted: true,
              },
            });
          }
        }
      }

      // 3. Save Placement Goals
      if (dreamCompanies && Array.isArray(dreamCompanies) && dreamCompanies.length > 0) {
        await tx.placementGoal.upsert({
          where: { userId },
          update: {
            dreamCompanies: dreamCompanies,
          },
          create: {
            userId,
            dreamCompanies: dreamCompanies,
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ONBOARDING_ERROR]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
