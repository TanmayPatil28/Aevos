import { matchInternshipsForProfile } from "../lib/jobs/matcher";

async function runTests() {
  console.log("TEST 1: Fallback logic bug");
  const profile1 = {
    academic: { targetCgpa: 8 },
    major: "Computer Science",
    skills: ["React", "Node.js"]
  };
  
  await matchInternshipsForProfile(profile1);
  
  console.log("\nTEST 2: Error handling bug");
  const res = await matchInternshipsForProfile(profile1);
  console.log("Returned value:", res);
  if (!Array.isArray(res)) {
      console.log("FAIL: Expected an array but got:", typeof res);
      try {
          (res as any).map((x: any) => x);
      } catch (e: any) {
          console.log("CRASH: matches.map is not a function!", e.message);
      }
  }
}

runTests().catch(console.error);
