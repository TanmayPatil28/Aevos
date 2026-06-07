import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { planSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

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
    const validation = planSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: validation.error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const { current_cgpa, target_cgpa, completed_semesters, remaining_semesters, required_gpa, plan_data } = validation.data;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const plan = await prisma.plan.create({
      data: {
        current_cgpa: Number(current_cgpa),
        target_cgpa: Number(target_cgpa),
        completed_semesters: Number(completed_semesters),
        remaining_semesters: Number(remaining_semesters),
        required_gpa: Number(required_gpa),
        plan_data: plan_data as Prisma.InputJsonValue,
        userId,
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error("Failed to save plan:", error);
    return NextResponse.json({ error: "Failed to save plan" }, { status: 500 });
  }
}
