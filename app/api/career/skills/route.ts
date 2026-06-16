import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    let userId = user?.id;

    if (!userId) {
      // Fallback to the first user found in the User table
      const firstUser = await prisma.user.findFirst();
      if (firstUser) {
        userId = firstUser.id;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const careerProfile = await prisma.careerProfile.findUnique({
      where: { userId }
    });

    const skills = careerProfile?.skills || [];
    return NextResponse.json({ skills });
  } catch (error: any) {
    console.error("Failed to fetch skills:", error);
    return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Malformed JSON" }, { status: 400 });
    }

    const { skills } = body;
    if (!skills || !Array.isArray(skills)) {
      return NextResponse.json({ error: "Missing or invalid skills array" }, { status: 400 });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    let userId = user?.id;

    if (!userId) {
      // Fallback to the first user found in the User table
      const firstUser = await prisma.user.findFirst();
      if (firstUser) {
        userId = firstUser.id;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updatedProfile = await prisma.careerProfile.upsert({
      where: { userId },
      update: {
        skills
      },
      create: {
        userId,
        skills,
        resumeText: "",
        atsScore: 0,
        actionPlan: {},
        projects: [],
      }
    });

    return NextResponse.json({ success: true, skills: updatedProfile.skills });
  } catch (error: any) {
    console.error("Failed to update skills:", error);
    return NextResponse.json({ error: "Failed to update skills" }, { status: 500 });
  }
}
