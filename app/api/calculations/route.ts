import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { calculationSchema } from "@/lib/validations";
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

    const { semester, subjects, presetId, type, total_credits } = validation.data;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Resolve preset
    const { getPresetById, calculateSGPA, calculateCGPA, convertLetterGradeToGradePoint } = await import("@/lib/presets");
    const preset = getPresetById(presetId || "sppu") || getPresetById("sppu");

    let serverSgpa = 0;
    let serverCgpa = 0;

    // 2. Compute server-side SGPA or CGPA based on the payload type
    if (type === "multi_semester") {
      const semestersData = (subjects as Record<string, unknown>[]).map((sem) => ({
        credits: Number(sem.credits) || 0,
        sgpa: Number(sem.sgpa) || 0, // In multi_semester, it's aggregating semesters
      })).filter(s => s.credits > 0);

      const calculated = calculateCGPA(semestersData);
      serverSgpa = isNaN(calculated) ? 0 : calculated;
      serverCgpa = serverSgpa; 
    } else {
      const parsedSubjects = (subjects as Record<string, unknown>[]).map((sub) => {
        let gp = 0;
        if (sub.gradePoint !== undefined) {
          gp = Number(sub.gradePoint);
        } else if (sub.grade !== undefined) {
          gp = convertLetterGradeToGradePoint(String(sub.grade), preset!);
        } else {
          gp = Number(sub.score) || 0; // fallback if only score is provided (assuming 10-point scale)
        }
        return {
          credits: Number(sub.credits) || 0,
          gradePoint: gp
        };
      }).filter(s => s.credits > 0);

      const calculated = calculateSGPA(parsedSubjects);
      serverSgpa = isNaN(calculated) ? 0 : calculated;
      serverCgpa = serverSgpa; 
    }

    let calculation;
    try {
      calculation = await prisma.calculation.create({
        data: {
          semester,
          subjects: subjects as Prisma.InputJsonValue,
          sgpa: serverSgpa,
          cgpa: serverCgpa,
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
