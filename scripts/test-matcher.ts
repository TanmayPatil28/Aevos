import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { matchInternshipsForProfile } from "../lib/jobs/matcher";
import { prisma } from "../lib/prisma";

async function main() {
  let profile = null;
  try {
    const recentSnapshot = await prisma.academicSnapshot.findFirst({
      orderBy: { createdAt: "desc" },
    });
    if (recentSnapshot && recentSnapshot.academicProfile) {
      profile = recentSnapshot.academicProfile;
    }
  } catch (error) {
    console.warn("Could not fetch AcademicSnapshot, using mock profile.");
  }

  if (!profile) {
    profile = {
      major: "Computer Science",
      gpa: 3.8,
      courses: ["Data Structures", "Algorithms", "Web Development", "Machine Learning"],
      skills: ["React", "TypeScript", "Python", "Node.js"]
    };
  }

  console.log("Using profile:", profile);
  const results = await matchInternshipsForProfile(profile);
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
