import { matchInternshipsForProfile } from "../lib/jobs/matcher";
import { getTavilyKey, getGeminiKey } from "../lib/ai/keys";

async function runTests() {
  console.log("Starting empirical tests for matcher.ts...");

  // Test 1: Art History Profile
  // Since the query is hardcoded to SWE, we expect SWE internships even for an Art History student.
  const artProfile = {
    major: "Art History",
    gpa: 3.9,
    courses: ["Renaissance Art", "Modern Art", "Ceramics", "Art Criticism"],
    skills: ["Curating", "Painting", "Sculpting", "Art History"]
  };

  console.log("\n--- Test 1: Art History Profile ---");
  try {
    const results = await matchInternshipsForProfile(artProfile);
    console.log("Matches returned for Art History:");
    results.forEach(r => {
      console.log(`- Title: ${r.title}`);
      console.log(`  Company: ${r.company}`);
      console.log(`  Score: ${r.score}`);
      console.log(`  Rationale: ${r.rationale}`);
    });
    
    // Check if the results are SWE related.
    const hasSweTerms = results.some(r => 
      r.title.toLowerCase().includes('software') || 
      r.title.toLowerCase().includes('engineer') ||
      r.title.toLowerCase().includes('developer') ||
      r.title.toLowerCase().includes('tech')
    );

    if (hasSweTerms) {
      console.log("❌ VULNERABILITY FOUND: Matcher returned Software Engineering jobs for an Art History profile! (Due to hardcoded Tavily query).");
    } else {
      console.log("✅ Matcher returned non-SWE jobs or filtered them appropriately.");
    }
  } catch (err) {
    console.error("Test 1 Failed with error:", err);
  }

  // Test 2: Empty profile
  console.log("\n--- Test 2: Empty Profile ---");
  try {
    const results = await matchInternshipsForProfile({});
    console.log("Matches returned for Empty Profile:", results.length);
  } catch (err) {
    console.error("Test 2 Failed with error:", err);
  }
}

runTests().catch(console.error);
