import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { calculationSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

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
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Malformed JSON payload" },
      { status: 400 }
    );
  }

  try {
    const validation = calculationSchema.safeParse(body);

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

    const { semester, subjects, sgpa, cgpa, total_credits } = validation.data;

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let calculation;
    try {
      calculation = await prisma.calculation.create({
        data: {
          semester,
          subjects: subjects as Prisma.InputJsonValue,
          sgpa: Number(sgpa),
          cgpa: Number(cgpa) || 0,
          total_credits: Number(total_credits),
          userId,
        },
      });
    } catch (dbError: unknown) {
      console.error("Calculation save failed:", dbError);

      const err = dbError as { code?: string; message?: string };
      if (
        err?.code === "P1001" ||
        err?.code === "P1002" ||
        err?.code === "P1017" ||
        err?.message?.includes("Can't reach database server") ||
        err?.message?.includes("connection")
      ) {
        return NextResponse.json(
          { error: "Database temporarily unavailable." },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { error: "Unable to save calculation right now." },
        { status: 500 }
      );
    }

    return NextResponse.json(calculation, { status: 201 });
  } catch (error) {
    console.error("Failed to save calculation:", error);
    return NextResponse.json({ error: "Failed to save calculation" }, { status: 500 });
  }
}
