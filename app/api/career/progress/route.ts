import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const roadmapId = searchParams.get("roadmapId");

    const skillProgress = await prisma.skillProgress.findMany({
      where: { 
        userId,
        ...(roadmapId && { roadmapId }) 
      },
      include: {
        milestones: true
      }
    });
    
    return NextResponse.json(skillProgress);
  } catch (error) {
    console.error("Failed to fetch progress:", error);
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed JSON" }, { status: 400 });
  }

  const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { roadmapId, nodeId, milestoneId, completed } = body;

  if (!roadmapId || !nodeId || !milestoneId || completed === undefined) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    // Upsert SkillProgress
    let skillProgress = await prisma.skillProgress.findUnique({
      where: {
        userId_roadmapId_nodeId: {
          userId,
          roadmapId,
          nodeId
        }
      }
    });

    if (!skillProgress) {
      skillProgress = await prisma.skillProgress.create({
        data: {
          userId,
          roadmapId,
          nodeId,
          status: "in_progress"
        }
      });
    }

    // Upsert MilestoneProgress
    await prisma.milestoneProgress.upsert({
      where: {
        skillProgressId_milestoneId: {
          skillProgressId: skillProgress.id,
          milestoneId: milestoneId
        }
      },
      update: {
        completed: Boolean(completed),
        completedAt: completed ? new Date() : null
      },
      create: {
        skillProgressId: skillProgress.id,
        milestoneId: milestoneId,
        completed: Boolean(completed),
        completedAt: completed ? new Date() : null
      }
    });

    // Check if node is completed (if we wanted to do it server-side, but client manages the state too)
    // We will just let the client refetch or optimistically update
    
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Failed to update progress:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
