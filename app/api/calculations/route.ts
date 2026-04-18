import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const calculations = await prisma.calculation.findMany({
      where: { userId },
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json(calculations);
  } catch (error) {
    console.error("Failed to fetch calculations:", error);
    return NextResponse.json({ error: "Failed to fetch calculations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { semester, subjects, sgpa, cgpa, total_credits } = body;

    // Basic Validation
    if (!semester || !subjects || sgpa === undefined || total_credits === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const calculation = await prisma.calculation.create({
      data: {
        semester,
        subjects,
        sgpa: Number(sgpa),
        cgpa: Number(cgpa) || 0,
        total_credits: Number(total_credits),
        userId: userId || undefined, // Allow anonymous saves if desired, or strictly require
      },
    });

    return NextResponse.json(calculation, { status: 201 });
  } catch (error) {
    console.error("Failed to save calculation:", error);
    return NextResponse.json({ error: "Failed to save calculation" }, { status: 500 });
  }
}
