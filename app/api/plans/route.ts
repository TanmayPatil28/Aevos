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

    const plans = await prisma.plan.findMany({
      where: { userId },
      orderBy: { created_at: 'desc' },
    });
    return NextResponse.json(plans);
  } catch (error) {
    console.error('Failed to fetch plans:', error);
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      current_cgpa,
      target_cgpa,
      completed_semesters,
      remaining_semesters,
      required_gpa,
      plan_data,
    } = body;

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create historical snapshot
      const plan = await tx.plan.create({
        data: {
          current_cgpa: Number(current_cgpa),
          target_cgpa: Number(target_cgpa),
          completed_semesters: Number(completed_semesters),
          remaining_semesters: Number(remaining_semesters),
          required_gpa: Number(required_gpa),
          plan_data,
          userId,
        },
      });

      // 2. Update UserProfile
      await tx.userProfile.update({
        where: { userId },
        data: {
          targetCgpa: Number(target_cgpa),
        },
      });

      // 3. Update or Create PlacementGoal (Placeholder for readiness calculation)
      await tx.placementGoal.upsert({
        where: { userId },
        update: {
          targetCgpa: Number(target_cgpa),
        },
        create: {
          userId,
          targetCgpa: Number(target_cgpa),
        },
      });

      return plan;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Failed to save plan:', error);
    return NextResponse.json({ error: 'Failed to save plan' }, { status: 500 });
  }
}
