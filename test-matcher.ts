import { matchInternshipsForProfile } from "./lib/jobs/matcher";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  console.log("Testing matcher...");
  const profile = {
    academic: {
      programme: "B.Tech",
      branch: "Computer Science"
    },
    skills: ["React", "TypeScript", "Node.js", "Python"],
    major: "Computer Science"
  };

  try {
    const matches = await matchInternshipsForProfile(profile);
    console.log("Matches:", matches);
  } catch (error) {
    console.error("Test failed:", error);
  }
}

main();
