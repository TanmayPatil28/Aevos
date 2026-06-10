import "dotenv/config";
import { matchInternshipsForProfile } from "../lib/jobs/matcher";

async function runTests() {
  console.log("=== Test 1: Academic Profile with Branch and Programme ===");
  const profile1 = {
    academic: {
      programme: "B.Tech",
      branch: "Computer Science"
    }
  };
  const res1 = await matchInternshipsForProfile(profile1);
  console.log("Result 1:", res1);

  console.log("=== Test 2: Profile with Major and Skills ===");
  const profile2 = {
    major: "Electrical Engineering",
    skills: ["Circuit Design", "VLSI", "C++"]
  };
  const res2 = await matchInternshipsForProfile(profile2);
  console.log("Result 2:", res2);

  console.log("=== Test 3: Empty Profile (fallback query) ===");
  const profile3 = {};
  const res3 = await matchInternshipsForProfile(profile3);
  console.log("Result 3:", res3);
  
  console.log("=== Test 4: Error Handling (Invalid API Key) ===");
  process.env.TAVILY_API_KEY = "tvly-invalid-key-for-test-123";
  const res4 = await matchInternshipsForProfile(profile3);
  console.log("Result on error:", res4);
}

runTests().then(() => console.log("Done")).catch(console.error);
