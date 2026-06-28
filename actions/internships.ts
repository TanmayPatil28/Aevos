"use server";

import { matchInternshipsForProfile } from "@/lib/jobs/matcher";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function matchInternships() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    let currentUser = user;

    if (authError || !currentUser) {
      currentUser = await prisma.user.findFirst();
    }

    if (!currentUser) {
      console.warn("User not authenticated and no fallback user found.");
      return [];
    }

    const recentSnapshot = await prisma.academicSnapshot.findFirst({
      where: { userId: currentUser.id },
      orderBy: { createdAt: "desc" },
    });

    if (!recentSnapshot || !recentSnapshot.academicProfile) {
      return [];
    }

    const careerProfile = await prisma.careerProfile.findUnique({
      where: { userId: currentUser.id },
    });

    const careerSkills = careerProfile?.skills || [];
    const rawProfile = recentSnapshot.academicProfile as any;
    const academicProfile = {
      ...rawProfile,
      skills: Array.from(new Set([...(rawProfile?.skills || []), ...careerSkills])),
    };

    const matches = await matchInternshipsForProfile(academicProfile);
    return matches;
  } catch (error: any) {
    if (
      error?.message?.includes("Dynamic server usage") ||
      error?.message?.includes("NEXT_DYNAMIC_NO_SSR_CODE") ||
      error?.digest?.includes("DYNAMIC_SERVER_USAGE")
    ) {
      throw error;
    }
    console.error("Error fetching or matching internships:", error);
    return [];
  }
}

