"use server";

import { matchInternshipsForProfile } from "../../lib/jobs/matcher";
import { prisma } from "../../lib/prisma";
import { createClient } from "../../lib/supabase/server";

export async function matchInternships() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.warn("User not authenticated.");
      return [];
    }

    const recentSnapshot = await prisma.academicSnapshot.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    if (!recentSnapshot || !recentSnapshot.academicProfile) {
      return [];
    }

    const matches = await matchInternshipsForProfile(recentSnapshot.academicProfile);
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
