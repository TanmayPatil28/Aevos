import { matchInternshipsForProfile } from "../lib/jobs/matcher";

async function testEdgeCase(name: string, profile: any) {
  console.log(`\n--- Running edge case: ${name} ---`);
  
  // Intercept console.error to catch type errors
  let caughtError: any = null;
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const msg = args.join(" ");
    if (msg.includes("TypeError") || msg.includes("ReferenceError") || msg.includes("SyntaxError")) {
      caughtError = msg;
    }
    // originalConsoleError(...args); // Optional: print it
  };

  try {
    const results = await matchInternshipsForProfile(profile);
    
    // Restore console.error
    console.error = originalConsoleError;

    if (caughtError) {
      console.log(`❌ FAILED [${name}]: Caught an internal error -> ${caughtError}`);
      return false;
    }

    if (!Array.isArray(results)) {
      console.log(`❌ FAILED [${name}]: Expected an array, got`, typeof results);
      return false;
    }
    console.log(`✅ Passed [${name}]: No crash, returned array.`);
    return true;
  } catch (e) {
    console.error = originalConsoleError;
    console.log(`❌ FAILED [${name}]: Threw an uncaught error!`, e);
    return false;
  }
}

async function runAll() {
  console.log("Starting verification of matcher.ts edge cases...");
  
  let allPassed = true;

  // Edge case: Empty profile
  allPassed &&= await testEdgeCase("Empty Profile", {});

  // Edge case: undefined profile
  allPassed &&= await testEdgeCase("Undefined Profile", undefined);

  // Edge case: skills is a string
  allPassed &&= await testEdgeCase("Skills as string", {
    major: "Computer Science",
    skills: "React, Node, TS"
  });

  // Edge case: skills is an array
  allPassed &&= await testEdgeCase("Skills as array", {
    major: "Computer Science",
    skills: ["React", "Node", "TS"]
  });

  // Edge case: skills is undefined, but major exists
  allPassed &&= await testEdgeCase("Skills undefined", {
    major: "Computer Science"
  });

  // Edge case: skills is null
  allPassed &&= await testEdgeCase("Skills null", {
    major: "Computer Science",
    skills: null
  });

  // Edge case: academic object is present but no branch/programme
  allPassed &&= await testEdgeCase("Academic present, no branch/prog", {
    academic: { currentCgpa: 8.5 },
    major: "Mechanical Engineering",
    skills: ["CAD", "SolidWorks"]
  });

  if (allPassed) {
    console.log("\n✅ ALL TESTS PASSED!");
  } else {
    console.log("\n❌ SOME TESTS FAILED.");
    process.exit(1);
  }
}

runAll();
