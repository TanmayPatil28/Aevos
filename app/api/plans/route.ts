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

    const plans = await prisma.plan.findMany({
      where: { userId },
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json(plans);
  } catch (error) {
    console.error("Failed to fetch plans:", error);
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { current_cgpa, target_cgpa, completed_semesters, remaining_semesters, required_gpa, plan_data } = body;

    if (
      current_cgpa === undefined ||
      target_cgpa === undefined ||
      completed_semesters === undefined ||
      remaining_semesters === undefined ||
      required_gpa === undefined ||
      !plan_data
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const plan = await prisma.plan.create({
      data: {
        current_cgpa: Number(current_cgpa),
        target_cgpa: Number(target_cgpa),
        completed_semesters: Number(completed_semesters),
        remaining_semesters: Number(remaining_semesters),
        required_gpa: Number(required_gpa),
        plan_data,
        userId: userId || undefined,
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error("Failed to save plan:", error);
    return NextResponse.json({ error: "Failed to save plan" }, { status: 500 });
  }
}
