import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    
    // Create CSV Header
    let csv = "ID,Date,Semester,SGPA,CGPA,Total Credits\n";
    
    // Append rows
    calculations.forEach((calc: { id: number; created_at: Date; semester: string; sgpa: number; cgpa: number; total_credits: number }) => {
      const dateStr = calc.created_at.toISOString().split("T")[0];
      csv += `${calc.id},${dateStr},${calc.semester},${calc.sgpa.toFixed(2)},${calc.cgpa.toFixed(2)},${calc.total_credits}\n`;
    });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="gradeflow_history.csv"',
      },
    });
  } catch (error) {
    console.error("Export failed:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
