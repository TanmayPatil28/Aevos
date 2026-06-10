import "dotenv/config";
import { matchInternshipsForProfile } from "../lib/jobs/matcher";

async function runTests() {
  console.log("=== Edge Case: Empty Profile ===");
  try {
    const res1 = await matchInternshipsForProfile({});
    console.log("SUCCESS:", res1.length >= 0 ? "Returned array" : "Failed");
  } catch(e) {
    console.error("ERROR Empty Profile:", e);
  }

  console.log("\n=== Edge Case: undefined Profile ===");
  try {
    const res2 = await matchInternshipsForProfile(undefined);
    console.log("SUCCESS:", res2.length >= 0 ? "Returned array" : "Failed");
  } catch(e) {
    console.error("ERROR undefined Profile:", e);
  }

  console.log("\n=== Edge Case: skills as String ===");
  try {
    const res3 = await matchInternshipsForProfile({
      academic: { branch: "Computer Science" },
      major: "Computer Science",
      skills: "React, Node, TypeScript"
    });
    console.log("SUCCESS:", res3.length >= 0 ? "Returned array" : "Failed");
  } catch(e) {
    console.error("ERROR skills as String:", e);
  }

  console.log("\n=== Edge Case: skills as Array ===");
  try {
    const res4 = await matchInternshipsForProfile({
      academic: { branch: "Computer Science" },
      major: "Computer Science",
      skills: ["React", "Node", "TypeScript"]
    });
    console.log("SUCCESS:", res4.length >= 0 ? "Returned array" : "Failed");
  } catch(e) {
    console.error("ERROR skills as Array:", e);
  }

  console.log("\n=== Edge Case: undefined skills ===");
  try {
    const res5 = await matchInternshipsForProfile({
      academic: { branch: "Computer Science" },
      major: "Computer Science"
    });
    console.log("SUCCESS:", res5.length >= 0 ? "Returned array" : "Failed");
  } catch(e) {
    console.error("ERROR undefined skills:", e);
  }
}

runTests().then(() => console.log("\nAll tests finished."));
