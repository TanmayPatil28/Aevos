import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const attendance = await prisma.attendanceRecord.findMany({
      where: { userId: session.user.id },
      include: {
        subject: {
          select: {
            name: true,
            semester: {
              select: { number: true },
            },
          },
        },
      },
      orderBy: { lastUpdated: 'desc' },
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error('[ATTENDANCE_GET_ERROR]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { subjectName, attended, totalClasses, subjectId, minThreshold } = body;

    if (!subjectName) {
      return NextResponse.json({ error: 'Subject name is required' }, { status: 400 });
    }

    const attendance = await prisma.attendanceRecord.upsert({
      where: {
        userId_subjectName: {
          userId: session.user.id,
          subjectName: subjectName,
        },
      },
      update: {
        attended: attended !== undefined ? Number(attended) : undefined,
        totalClasses: totalClasses !== undefined ? Number(totalClasses) : undefined,
        subjectId: subjectId || undefined,
        minThreshold: minThreshold !== undefined ? Number(minThreshold) : undefined,
      },
      create: {
        userId: session.user.id,
        subjectName,
        attended: Number(attended) || 0,
        totalClasses: Number(totalClasses) || 0,
        subjectId: subjectId || null,
        minThreshold: Number(minThreshold) || 75.0,
      },
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error('[ATTENDANCE_POST_ERROR]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
