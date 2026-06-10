import { matchInternshipsForProfile } from "../lib/jobs/matcher";
import "dotenv/config";

async function run() {
  console.log("Testing matcher with a Biology major profile...");
  const bioProfile = {
    major: "Biology",
    gpa: 3.9,
    courses: ["Genetics", "Molecular Biology", "Organic Chemistry", "Anatomy"],
    skills: ["Lab Research", "Microscopy", "Data Analysis", "PCR"]
  };

  const results = await matchInternshipsForProfile(bioProfile);
  console.log("Results for Biology Major:");
  console.log(JSON.stringify(results, null, 2));

  let csCount = 0;
  for (const match of results) {
    if (match.title.toLowerCase().includes("software") || match.title.toLowerCase().includes("engineering")) {
      csCount++;
    }
  }

  if (csCount > 0) {
    console.error(`FAILED: Biology major received ${csCount} software engineering internships due to hardcoded search query.`);
    process.exit(1);
  }

  console.log("Testing matcher with an empty profile...");
  try {
      const emptyProfile = {};
      const emptyResults = await matchInternshipsForProfile(emptyProfile);
      console.log("Empty profile results:", emptyResults);
  } catch (e) {
      console.error("Empty profile failed:", e);
  }

  console.log("PASS!");
}

run();
