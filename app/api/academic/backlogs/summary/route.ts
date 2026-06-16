import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [total, pending, inRecovery, cleared] = await Promise.all([
      prisma.backlogRecord.count({ where: { userId: user.id } }),
      prisma.backlogRecord.count({ where: { userId: user.id, status: "PENDING" } }),
      prisma.backlogRecord.count({
        where: {
          userId: user.id,
          status: "REGISTERED",
          recoveryPathway: {
            not: null,
          },
        },
      }),
      prisma.backlogRecord.count({ where: { userId: user.id, status: "CLEARED" } }),
    ]);

    return NextResponse.json({
      total,
      pending,
      inRecovery,
      cleared,
    });
  } catch (error) {
    console.error("[Backlogs Summary GET Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
